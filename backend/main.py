from fastapi import FastAPI, Query
from db import get_session
from fastapi.middleware.cors import CORSMiddleware
from inference import HybridRecommender
import time

app = FastAPI(title="Movie Recommendation API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# ✅ SIMPLE IN-MEMORY CACHE
# -----------------------------
CACHE = {}
CACHE_TTL = 30  # detik

def get_cache(key):
    if key in CACHE:
        data, timestamp = CACHE[key]
        if time.time() - timestamp < CACHE_TTL:
            return data
        else:
            del CACHE[key]
    return None

def set_cache(key, value):
    CACHE[key] = (value, time.time())

def get_movie_genres(session, movie_id):
    result = session.run("""
        MATCH (m:Movie {id: $id})-[:IN_GENRE]->(g)
        RETURN g.name AS genre
    """, id=movie_id)

    genres = [r["genre"] for r in result]
    return genres


# -----------------------------
# ✅ AUTOSUGGEST (SEARCH + FUZZY)
# -----------------------------
@app.get("/api/movies/search")
def search_movies(query: str = Query(...)):
    cache_key = f"search:{query}"
    cached = get_cache(cache_key)
    if cached:
        return cached

    with get_session() as session:
        cypher = """
        MATCH (m:Movie)
        WHERE toLower(m.title) CONTAINS toLower($q)
        RETURN m.id AS id, m.title AS title, m.score AS score
        LIMIT 10
        """
        result = session.run(cypher, q=query)

        suggestions = []
        for r in result:
            score = len(query) / len(r["title"])
            suggestions.append({
                "id": r["id"],
                "title": r["title"],
                "score": round(score, 3)
            })

        suggestions = sorted(suggestions, key=lambda x: x["score"], reverse=True)

        response = {
            "suggestions": suggestions[:5]
        }

        set_cache(cache_key, response)
        return response


# -----------------------------
# ✅ DETAIL MOVIE (WITH CACHE)
# -----------------------------
@app.get("/api/movies/{movie_id}")
def get_movie_detail(movie_id: str):
    cache_key = f"movie:{movie_id}"
    cached = get_cache(cache_key)
    if cached:
        return cached

    with get_session() as session:
        cypher = """
        MATCH (m:Movie {id: $movie_id})
        RETURN m LIMIT 1
        """
        result = session.run(cypher, movie_id=movie_id).single()

        if not result:
            return {"error": "Movie not found"}

        m = result["m"]
        response = {
            "id": m["id"],
            "title": m["title"],
            "overview": m.get("overview", ""),
            "genres": m.get("genres", []),
            "language": m.get("language", "en"),
            "releaseYear": m.get("releaseYear", 0),
            "score": m.get("score", 0.0),
            "posterUrl": m.get("posterUrl"),
        }

        set_cache(cache_key, response)
        return response


# -----------------------------
# ✅ RECOMMENDATION (WITH CACHE)
# -----------------------------
@app.get("/api/recommendations/{movie_id}")
def get_recommendations(movie_id: int):
    cache_key = f"rec:{movie_id}"
    cached = get_cache(cache_key)
    # if cached:
    #     return cached

    recommender = HybridRecommender()

    with get_session() as session:
        movie = session.run(
            "MATCH (m:Movie {id: $id}) RETURN m LIMIT 1",
            id=movie_id
        ).single()

        # print("Movie ID Requested:", movie_id)
        # print("Movie Found in DB:", movie is not None)

        if not movie:
            return {
                "query": "",
                "selectedMovie": None,
                "recommendations": [],
                "graphData": {"nodes": [], "edges": []}
            }

        m = movie["m"]
        title = m["title"]

        results, fallback = recommender.get_recommendations(title)
        release_date = m.get("release_date")
        release_year = release_date.year if release_date else None

        genres = get_movie_genres(session, m["id"])

        selected_movie = {
            "id": m["id"],
            "title": title,
            "overview": m.get("overview", ""),
            "genres": genres,
            "language": m.get("language", "en"),
            "releaseYear": release_year,
            "score": m.get("vote_average", 0.0)
        }

        recommendations = []

        for rec_title, score, confidence in results:
            rec_movie = session.run(
                "MATCH (r:Movie {title: $title}) RETURN r LIMIT 1",
                title=rec_title
            ).single()

            if not rec_movie:
                continue

            r = rec_movie["r"]

            r_release_date = r.get("release_date")
            r_release_year = r_release_date.year if r_release_date else None

            r_genres = get_movie_genres(session, r["id"])

            recommendations.append({
                "id": r["id"],
                "title": r["title"],
                "overview": r.get("overview", ""),
                "genres": r_genres,
                "language": r.get("language", "en"),
                "releaseYear": r_release_year,
                "score": r.get("vote_average", 0.0),
                "confidence": confidence / 100
            })

        response = {
            "query": title,
            "selectedMovie": selected_movie,
            "recommendations": recommendations,
        }

        set_cache(cache_key, response)
        return response

@app.get("/api/debug/movies")
def debug_movies():
    with get_session() as session:
        result = session.run("MATCH (m:Movie) RETURN m LIMIT 5")
        return [record["m"] for record in result]

@app.get("/api/debug/genres")
def debug_genres():
    with get_session() as session:
        result = session.run("""
            MATCH (m:Movie)
            OPTIONAL MATCH (m)-[r]->(t)
            RETURN m.title AS title, m.id AS id, collect(DISTINCT type(r)) AS relations
            LIMIT 5
        """)

        return [
            {
                "id": r["id"],
                "title": r["title"],
                "relations": r["relations"]
            }
            for r in result
        ]


# -----------------------------
# ✅ ROOT CHECK
# -----------------------------
@app.get("/")
def root():
    return {"status": "FastAPI Movie Recommendation Running"}
