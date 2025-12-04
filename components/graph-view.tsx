"use client"

import { useEffect, useRef } from "react"
import { useRecommender } from "@/context/recommender-context"

interface GraphViewProps {
  showGraph?: boolean
}

export function GraphView({ showGraph = true }: GraphViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { graphData } = useRecommender()

  useEffect(() => {
    if (!showGraph || !containerRef.current || !graphData) return

    // Note: For production, integrate Cytoscape.js library
    // This is a placeholder for the graph visualization
    const renderGraph = () => {
      const container = containerRef.current
      if (!container) return

      // Create a simple SVG-based visualization
      container.innerHTML = `
        <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg border border-border">
          <div class="text-center">
            <p class="text-muted-foreground mb-2">Film Relationship Graph</p>
            <p class="text-xs text-muted-foreground">Integrate Cytoscape.js for interactive visualization</p>
            <div class="mt-4 space-y-1 text-xs">
              <p>Nodes: ${graphData?.nodes?.length || 0} films</p>
              <p>Edges: ${graphData?.edges?.length || 0} relationships</p>
            </div>
          </div>
        </div>
      `
    }

    renderGraph()
  }, [graphData, showGraph])

  if (!showGraph) return null

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-bold text-foreground mb-2">Film Relationship Graph</h3>
        <p className="text-sm text-muted-foreground">
          Explore how recommended films connect through Neo4j relationships
        </p>
      </div>
      <div ref={containerRef} className="w-full h-96 rounded-lg border border-border bg-card overflow-hidden" />
    </div>
  )
}
