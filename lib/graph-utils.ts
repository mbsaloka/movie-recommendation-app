export interface GraphNode {
  id: string
  label: string
  score: number
}

export interface GraphEdge {
  source: string
  target: string
  weight: number
}

export const processGraphData = (nodes: GraphNode[], edges: GraphEdge[]) => {
  // Normalize weights to 0-1 range for visualization
  const maxWeight = Math.max(...edges.map((e) => e.weight), 1)
  const minWeight = Math.min(...edges.map((e) => e.weight), 0)

  const normalizedEdges = edges.map((edge) => ({
    ...edge,
    normalizedWeight: (edge.weight - minWeight) / (maxWeight - minWeight || 1),
  }))

  return { nodes, edges: normalizedEdges }
}

export const getNodeColor = (score: number): string => {
  if (score >= 0.8) return "#9333ea" // Primary purple
  if (score >= 0.6) return "#0ea5e9" // Accent cyan
  if (score >= 0.4) return "#64748b" // Muted
  return "#334155" // Dark muted
}
