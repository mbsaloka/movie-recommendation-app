"use client"

import type { Movie } from "@/lib/api"

interface Props {
  movie: Movie
}

export function SelectedMovieDetail({ movie }: Props) {
  return (
    <div className="mb-12">
      <div className="mb-8">
        <h2 className="text-4xl font-bold text-foreground mb-4 text-balance">{movie.title}</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Score</span>
            <span className="text-lg font-semibold text-foreground">
              {movie.score}
              <span className="text-xs text-muted-foreground ml-1">/10</span>
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
              Release Year
            </span>
            <span className="text-lg font-semibold text-foreground">{movie.releaseYear}</span>
          </div>

          <div className="flex flex-col">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Language</span>
            <span className="text-lg font-semibold text-foreground">{movie.language.toUpperCase()}</span>
          </div>

          <div className="flex flex-col">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Popularity</span>
            <span className="text-lg font-semibold text-foreground">{movie.popularity}</span>
          </div>
        </div>
      </div>

      <div className="mb-8 pb-8 border-b border-border">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Overview</h3>
        <p className="text-foreground leading-relaxed text-base">{movie.overview}</p>
      </div>

      {movie.genres?.length > 0 && (
        <div className="mb-8 pb-8 border-b border-border">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Genres</h3>
          <div className="flex flex-wrap gap-2">
            {movie.genres.map((genre) => (
              <span
                key={genre}
                className="px-3 py-1.5 text-sm font-medium rounded-md bg-secondary text-secondary-foreground border border-border"
              >
                {genre}
              </span>
            ))}
          </div>
        </div>
      )}

      {(movie.budget || movie.revenue) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {movie.budget && (
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Budget</span>
              <span className="text-lg font-semibold text-foreground">${movie.budget.toLocaleString()}</span>
            </div>
          )}
          {movie.revenue && (
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Revenue</span>
              <span className="text-lg font-semibold text-foreground">${movie.revenue.toLocaleString()}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
