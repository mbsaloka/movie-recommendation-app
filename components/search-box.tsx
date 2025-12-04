"use client"

import { useState, useEffect } from "react"
import { useDebounce } from "@/hooks/use-debounce"
import { useRecommender } from "@/context/recommender-context"
import { apiClient } from "@/lib/api"
import { Search, X } from "lucide-react"

export function SearchBox() {
  const [suggestions, setSuggestions] = useState<Array<{ id: string; title: string; score: number }>>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [isSelecting, setIsSelecting] = useState(false)
  const [lastSelectedTitle, setLastSelectedTitle] = useState<string | null>(null)
  const debouncedValue = useDebounce(inputValue, 300)
  const { setSelectedMovie, setSearchQuery, setRecommendations, setIsLoading, setError } = useRecommender()

  useEffect(() => {
    if (isSelecting) return
    if (!debouncedValue.trim()) return
    if (debouncedValue === lastSelectedTitle) return

    const fetchSuggestions = async () => {
      try {
        const result = await apiClient.searchMovies(debouncedValue)
        setSuggestions(result.suggestions)
        setShowSuggestions(true)
        setError(null)
      } catch (err) {
        setError("Failed to fetch suggestions")
        setSuggestions([])
      }
    }

    fetchSuggestions()
  }, [debouncedValue, isSelecting, lastSelectedTitle, setError])

  const handleSelectMovie = async (movieId: string, title: string) => {
    setIsSelecting(true)
    setLastSelectedTitle(title)
    setInputValue(title)
    setShowSuggestions(false)
    setSelectedMovie(movieId)
    setSearchQuery(title)
    setIsLoading(true)

    try {
      const result = await apiClient.getRecommendations(movieId)
      setRecommendations(result.recommendations)
      setError(null)
    } catch (err) {
      setError("Failed to get recommendations")
    } finally {
      setIsLoading(false)
      setIsSelecting(false)
    }
  }



  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          placeholder="Search for a movie..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={() => inputValue && setShowSuggestions(true)}
          className="w-full pl-10 pr-10 py-3 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
        />
        {inputValue && (
          <button
            onClick={() => {
              setInputValue("")
              setSuggestions([])
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {suggestions.map((movie) => (
            <button
              key={movie.id}
              onClick={() => handleSelectMovie(movie.id, movie.title)}
              className="w-full text-left px-4 py-3 hover:bg-muted transition-colors border-b border-border last:border-b-0 focus:outline-none focus:bg-muted"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-foreground">{movie.title}</p>
                  {/* <p className="text-sm text-muted-foreground">Match: {Math.round(movie.score * 100)}%</p> */}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
