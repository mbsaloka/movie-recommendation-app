import { dummyMovies, fuzzySearchMovies, generateMockRecommendations, generateMockGraphData } from "./dummy-data"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export interface Movie {
  id: string
  title: string
  overview: string
  genres: string[]
  language: string
  releaseYear: number
  score: number
  posterUrl?: string
}

export interface RecommendationResponse {
  query: string
  selectedMovie: Movie
  recommendations: Array<Movie & { confidence: number }>
  graphData?: {
    nodes: Array<{ id: string; label: string; score: number }>
    edges: Array<{ source: string; target: string; weight: number }>
  }
}

export interface AutoSuggestResponse {
  suggestions: Array<{ id: string; title: string; score: number }>
}

export const apiClient = {
  // Search for movies with auto-suggest - uses dummy data
  searchMovies: async (query: string): Promise<AutoSuggestResponse> => {
    try {
      // Simulate API delay for realistic UX
      await new Promise((resolve) => setTimeout(resolve, 200))
      const suggestions = fuzzySearchMovies(query)
      return { suggestions }
    } catch (error) {
      console.error("Search error:", error)
      throw error
    }
  },

  // Get recommendations for a specific movie - uses dummy data
  getRecommendations: async (movieId: string): Promise<RecommendationResponse> => {
    try {
      // Simulate API delay for realistic UX
      await new Promise((resolve) => setTimeout(resolve, 500))

      const selectedMovie = dummyMovies.find((m) => m.id === movieId)
      if (!selectedMovie) {
        throw new Error("Movie not found")
      }

      const recommendations = generateMockRecommendations(movieId)
      const graphData = generateMockGraphData(movieId)

      return {
        query: selectedMovie.title,
        selectedMovie,
        recommendations,
        graphData,
      }
    } catch (error) {
      console.error("Recommendations error:", error)
      throw error
    }
  },

  // Get movie details - uses dummy data
  getMovieDetails: async (movieId: string): Promise<Movie> => {
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 300))

      const movie = dummyMovies.find((m) => m.id === movieId)
      if (!movie) {
        throw new Error("Movie not found")
      }

      return movie
    } catch (error) {
      console.error("Movie details error:", error)
      throw error
    }
  },
}
