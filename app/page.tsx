"use client"

import { useState } from "react"
import { RecommenderProvider, useRecommender } from "@/context/recommender-context"
import { SearchBox } from "@/components/search-box"
import { RecommendationsList } from "@/components/recommendations-list"
import { GraphView } from "@/components/graph-view"
import { Loader2, AlertCircle } from "lucide-react"

function HomeContent() {
  const { recommendations, isLoading, error, selectedMovie } = useRecommender()
  const [showGraph, setShowGraph] = useState(false)

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-foreground">Cineverse</h1>
            <p className="text-muted-foreground">AI-Powered Movie Recommendations</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search Section */}
        <div className="mb-12">
          <div className="max-w-2xl">
            <p className="text-sm text-muted-foreground mb-4">Find your next favorite movie</p>
            <SearchBox />
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-8 p-4 rounded-lg bg-destructive/10 border border-destructive/30 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-destructive">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <Loader2 className="w-8 h-8 text-primary mx-auto mb-3 animate-spin" />
              <p className="text-muted-foreground">Finding great recommendations...</p>
            </div>
          </div>
        )}

        {/* Recommendations and Graph */}
        {!isLoading && recommendations.length > 0 && (
          <div className="space-y-12">
            {/* Recommendations */}
            <RecommendationsList recommendations={recommendations} />

            {/* Graph Toggle and Visualization */}
            <div className="space-y-4">
              <button
                onClick={() => setShowGraph(!showGraph)}
                className="inline-flex items-center px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium text-sm"
              >
                {showGraph ? "Hide" : "Show"} Film Relationships
              </button>
              <GraphView showGraph={showGraph} />
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && recommendations.length === 0 && !selectedMovie && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <span className="text-3xl">🎬</span>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Discover Amazing Films</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Search for your favorite movie and get personalized recommendations powered by AI and Neo4j graph
              analysis.
            </p>
          </div>
        )}
      </div>
    </main>
  )
}

export default function HomePage() {
  return (
    <RecommenderProvider>
      <HomeContent />
    </RecommenderProvider>
  )
}
