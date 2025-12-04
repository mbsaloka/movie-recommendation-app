import pickle
import numpy as np
import pandas as pd
from pathlib import Path
from neo4j import GraphDatabase
from sklearn.metrics.pairwise import cosine_similarity
import os
from dotenv import load_dotenv

load_dotenv()

NEO4J_URI = os.getenv("NEO4J_URI")
NEO4J_USER = os.getenv("NEO4J_USER")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD")
NEO4J_DATABASE = os.getenv("NEO4J_DATABASE")

DATASET_PATH = Path("tmdb_5000_movies.csv")
CACHE_PATH = Path("embeddings_cache.pkl")

TOP_K = 10


class Neo4jConnection:
    def __init__(self):
        self.driver = GraphDatabase.driver(
            NEO4J_URI,
            auth=(NEO4J_USER, NEO4J_PASSWORD)
        )

    def get_graph_scores(self, movie_title: str, limit: int = 50):
        query = """
        MATCH (m:Movie {title: $title})
        MATCH (m)-[:HAS_KEYWORD|IN_GENRE|PRODUCED_BY|PRODUCED_IN|SPOKEN_IN]->(shared)
        <-[:HAS_KEYWORD|IN_GENRE|PRODUCED_BY|PRODUCED_IN|SPOKEN_IN]-(other:Movie)
        WHERE m <> other
        RETURN other.title AS title, count(shared) AS score
        ORDER BY score DESC
        LIMIT $limit
        """

        with self.driver.session(database=NEO4J_DATABASE) as session:
            result = session.run(query, title=movie_title, limit=limit)
            scores = [(r["title"], float(r["score"])) for r in result]

        if not scores:
            return [], False

        scores_array = np.array([s[1] for s in scores])
        min_s, max_s = scores_array.min(), scores_array.max()
        norm = (scores_array - min_s) / (max_s - min_s) if max_s > min_s else np.full_like(scores_array, 0.5)

        return [(scores[i][0], float(norm[i])) for i in range(len(scores))], True


class SemanticLayer:
    def __init__(self):
        with open(CACHE_PATH, "rb") as f:
            cache = pickle.load(f)

        self.tfidf_matrix = cache["tfidf_matrix"]
        self.bert_embeddings = cache["bert_embeddings"]
        self.title_to_idx = cache["title_to_idx"]
        self.idx_to_title = cache["idx_to_title"]

        self.df = pd.read_csv(DATASET_PATH)
        self.df["overview"] = self.df["overview"].fillna("")

    def movie_exists(self, title: str) -> bool:
        return title in self.title_to_idx

    def get_semantic_scores(self, movie_title: str, limit: int = 50):
        idx = self.title_to_idx[movie_title]

        tfidf_sim = cosine_similarity(
            self.tfidf_matrix[idx:idx+1], self.tfidf_matrix
        ).flatten()

        bert_sim = cosine_similarity(
            self.bert_embeddings[idx:idx+1], self.bert_embeddings
        ).flatten()

        combined = 0.5 * tfidf_sim + 0.5 * bert_sim

        top_indices = np.argsort(combined)[::-1]

        results = []
        for i in top_indices:
            if i != idx:
                results.append((self.idx_to_title[i], float(combined[i])))
            if len(results) >= limit:
                break

        scores = np.array([r[1] for r in results])
        min_s, max_s = scores.min(), scores.max()
        norm = (scores - min_s) / (max_s - min_s) if max_s > min_s else np.full_like(scores, 0.5)

        return [(results[i][0], float(norm[i])) for i in range(len(results))]


class HybridRecommender:
    def __init__(self):
        self.neo4j = Neo4jConnection()
        self.semantic = SemanticLayer()
        self.graph_weight = 0.5
        self.semantic_weight = 0.5

    def get_recommendations(self, movie_title: str, top_k: int = TOP_K):

        if not self.semantic.movie_exists(movie_title):
            return {
                "hybrid": [],
                "graph": [],
                "semantic": [],
                "fallback": True
            }

        graph_scores, has_graph = self.neo4j.get_graph_scores(movie_title, limit=100)
        semantic_scores = self.semantic.get_semantic_scores(movie_title, limit=100)

        graph_dict = {
            t if isinstance(item, tuple) else item["title"]:
            s if isinstance(item, tuple) else item["score"]
            for item in graph_scores
            for t, s in [(item if isinstance(item, tuple) else (item["title"], item["score"]))]
        }

        semantic_dict = {
            t if isinstance(item, tuple) else item["title"]:
            s if isinstance(item, tuple) else item["score"]
            for item in semantic_scores
            for t, s in [(item if isinstance(item, tuple) else (item["title"], item["score"]))]
        }

        fallback = not has_graph or max(graph_dict.values(), default=0) == 0

        all_movies = set(graph_dict) | set(semantic_dict)

        hybrid_scores = []

        for title in all_movies:
            g = graph_dict.get(title, 0.0)
            s = semantic_dict.get(title, 0.0)

            score = s if fallback else (
                self.graph_weight * g + self.semantic_weight * s
            )

            hybrid_scores.append((title, score))

        hybrid_scores.sort(key=lambda x: x[1], reverse=True)
        top_results = hybrid_scores[:top_k]

        if not top_results:
            return {
                "hybrid": [],
                "graph": [],
                "semantic": [],
                "fallback": fallback
            }

        max_score = max(s for _, s in top_results) or 1e-8

        hybrid_final = [
            {
                "title": title,
                "score": float(score),
                "confidence": round((score / max_score) * 100, 2)
            }
            for title, score in top_results
        ]

        return {
            "hybrid": hybrid_final,
            "graph": [
                {"title": t, "score": float(s)}
                for t, s in graph_dict.items()
            ],
            "semantic": [
                {"title": t, "score": float(s)}
                for t, s in semantic_dict.items()
            ],
            "fallback": fallback
        }
