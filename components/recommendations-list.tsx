"use client"
import { MovieCard } from "./movie-card"
import { useRecommender } from "@/context/recommender-context"

interface Recommendation {
  id: string
  title: string
  overview: string
  genres: string[]
  language: string
  releaseYear: number
  score: number
  confidence: number
}

interface RecommendationsListProps {
  recommendations: Recommendation[]
  title?: string
  onSelectMovie?: (movieId: string) => void
}

export function RecommendationsList({
  recommendations,
  title = "Top Recommendations",
  onSelectMovie,
}: RecommendationsListProps) {
  const { selectedMovie } = useRecommender()

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          No recommendations available yet. Search for a movie to get started.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">{title}</h2>
        <p className="text-muted-foreground text-sm">
          Based on content similarity and Neo4j graph relationships
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {recommendations.slice(0, 10).map((movie) => (
          <MovieCard
            key={movie.id}
            title={movie.title}
            overview={movie.overview}
            genres={movie.genres}
            language={movie.language}
            releaseYear={movie.releaseYear}
            score={movie.score}
            confidence={movie.confidence}
            isSelected={movie.id === selectedMovie}
            onSelect={() => onSelectMovie?.(movie.id)}
          />
        ))}
      </div>
    </div>
  )
}
