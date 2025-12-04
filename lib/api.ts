const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export interface Movie {
  id: string
  title: string
  overview: string
  genres: string[]
  language: string
  releaseYear: number
  score: number
}

export interface RecommendationResponse {
  query: string
  selectedMovie: Movie
  recommendations: Array<Movie & { confidence: number }>
}

export interface AutoSuggestResponse {
  suggestions: Array<{ id: string; title: string; score: number }>
}

/* ================================
   ✅ REAL API INTEGRATION
================================ */
export const apiClient = {
  // ✅ AUTOSUGGEST SEARCH (REAL BACKEND)
  searchMovies: async (query: string): Promise<AutoSuggestResponse> => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/movies/search?query=${encodeURIComponent(query)}`
      )

      if (!res.ok) {
        throw new Error("Failed to fetch movie suggestions")
      }

      return await res.json()
    } catch (error) {
      console.error("Search error:", error)
      throw error
    }
  },

  // ✅ GET RECOMMENDATIONS (REAL BACKEND)
  getRecommendations: async (movieId: string): Promise<RecommendationResponse> => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/recommendations/${encodeURIComponent(movieId)}`
      )

      if (!res.ok) {
        throw new Error("Failed to fetch recommendations")
      }

      return await res.json()
    } catch (error) {
      console.error("Recommendations error:", error)
      throw error
    }
  },

  // ✅ GET MOVIE DETAIL (REAL BACKEND)
  getMovieDetails: async (movieId: string): Promise<Movie> => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/movies/${encodeURIComponent(movieId)}`
      )

      if (!res.ok) {
        throw new Error("Failed to fetch movie detail")
      }

      return await res.json()
    } catch (error) {
      console.error("Movie details error:", error)
      throw error
    }
  },
}
