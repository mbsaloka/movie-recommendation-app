"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"

export interface RecommenderContextType {
  selectedMovie: string | null
  setSelectedMovie: (movieId: string | null) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
  recommendations: Array<any>
  setRecommendations: (recs: Array<any>) => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  error: string | null
  setError: (error: string | null) => void
}

const RecommenderContext = createContext<RecommenderContextType | undefined>(undefined)

export function RecommenderProvider({ children }: { children: React.ReactNode }) {
  const [selectedMovie, setSelectedMovie] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [recommendations, setRecommendations] = useState<Array<any>>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  return (
    <RecommenderContext.Provider
      value={{
        selectedMovie,
        setSelectedMovie,
        searchQuery,
        setSearchQuery,
        recommendations,
        setRecommendations,
        isLoading,
        setIsLoading,
        error,
        setError,
      }}
    >
      {children}
    </RecommenderContext.Provider>
  )
}

export function useRecommender() {
  const context = useContext(RecommenderContext)
  if (!context) {
    throw new Error("useRecommender must be used within RecommenderProvider")
  }
  return context
}
