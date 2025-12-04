"use client"
import { Star } from "lucide-react"

interface MovieCardProps {
  title: string
  overview: string
  genres: string[]
  language: string
  releaseYear: number
  score: number
  confidence?: number
  isSelected?: boolean
  onSelect?: () => void
}

export function MovieCard({
  title,
  overview,
  genres,
  language,
  releaseYear,
  score,
  confidence = 0,
  isSelected = false,
  onSelect,
}: MovieCardProps) {
  return (
    <div
      onClick={onSelect}
      className={`rounded-lg border transition-all duration-300 cursor-pointer p-4 ${
        isSelected
          ? "border-accent bg-card shadow-lg shadow-accent/40"
          : "border-border bg-card hover:border-accent hover:shadow-lg hover:shadow-accent/20"
      }`}
    >
      {/* Title */}
      <h3 className="font-bold text-lg text-foreground mb-2 line-clamp-2">
        {title}
      </h3>

      {/* Meta info */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
          <span className="text-sm font-semibold text-foreground">
            {Number(score || 0).toFixed(1)}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">•</span>
        <span className="text-xs text-muted-foreground">{releaseYear}</span>
        <span className="text-xs text-muted-foreground">•</span>
        <span className="text-xs text-muted-foreground uppercase">{language}</span>
      </div>

      {/* Confidence bar */}
      {confidence > 0 && (
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium text-accent">Match</span>
            <span className="text-xs font-bold text-accent">
              {Math.round(confidence * 100)}%
            </span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300"
              style={{ width: `${confidence * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Overview */}
      <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
        {overview}
      </p>

      {/* Genres */}
      {genres.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {genres.slice(0, 3).map((genre) => (
            <span
              key={genre}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary"
            >
              {genre}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
