export const dummyMovies = [
  {
    id: "1",
    title: "The Shawshank Redemption",
    overview:
      "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
    genres: ["Drama"],
    language: "English",
    releaseYear: 1994,
    score: 9.3,
    posterUrl: "/shawshank-redemption-scene.png",
  },
  {
    id: "2",
    title: "The Godfather",
    overview:
      "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his youngest son.",
    genres: ["Crime", "Drama"],
    language: "English",
    releaseYear: 1972,
    score: 9.2,
    posterUrl: "/the-godfather-inspired.png",
  },
  {
    id: "3",
    title: "The Dark Knight",
    overview:
      "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest tests.",
    genres: ["Action", "Crime", "Drama"],
    language: "English",
    releaseYear: 2008,
    score: 9.0,
    posterUrl: "/dark-knight-silhouette.png",
  },
  {
    id: "4",
    title: "Pulp Fiction",
    overview:
      "The lives of four mobsters, two hit men, a gangster and his wife intertwine in four tales of violence and redemption.",
    genres: ["Crime", "Drama"],
    language: "English",
    releaseYear: 1994,
    score: 8.9,
    posterUrl: "/pulp-fiction.jpg",
  },
  {
    id: "5",
    title: "Forrest Gump",
    overview:
      "The presidencies of Kennedy and Johnson unfold through the perspective of an Alabama man with an IQ of 75.",
    genres: ["Drama", "Romance"],
    language: "English",
    releaseYear: 1994,
    score: 8.8,
    posterUrl: "/forrest-gump.jpg",
  },
  {
    id: "6",
    title: "Inception",
    overview:
      "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea.",
    genres: ["Action", "Sci-Fi", "Thriller"],
    language: "English",
    releaseYear: 2010,
    score: 8.8,
    posterUrl: "/inception.jpg",
  },
  {
    id: "7",
    title: "The Matrix",
    overview:
      "A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.",
    genres: ["Action", "Sci-Fi"],
    language: "English",
    releaseYear: 1999,
    score: 8.7,
    posterUrl: "/the-matrix.jpg",
  },
  {
    id: "8",
    title: "Interstellar",
    overview:
      "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival and find a new habitable planet.",
    genres: ["Adventure", "Drama", "Sci-Fi"],
    language: "English",
    releaseYear: 2014,
    score: 8.6,
    posterUrl: "/interstellar-space.png",
  },
  {
    id: "9",
    title: "Fight Club",
    overview:
      "An insomniac office worker and a devil-may-care soapmaker form an underground fight club that evolves into much more.",
    genres: ["Drama"],
    language: "English",
    releaseYear: 1999,
    score: 8.8,
    posterUrl: "/fight-club.jpg",
  },
  {
    id: "10",
    title: "Se7en",
    overview:
      "Two detectives hunt a serial killer who uses the seven deadly sins as his motives. Rated R for strong violent and sexual content.",
    genres: ["Crime", "Drama", "Mystery"],
    language: "English",
    releaseYear: 1995,
    score: 8.6,
    posterUrl: "/se7en.jpg",
  },
]

// Fuzzy search helper for auto-suggest
export function fuzzySearchMovies(query: string) {
  const lowerQuery = query.toLowerCase()
  return dummyMovies
    .filter((movie) => movie.title.toLowerCase().includes(lowerQuery))
    .map((movie) => ({
      id: movie.id,
      title: movie.title,
      score: query.length / movie.title.length,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
}

// Generate mock recommendations based on selected movie
export function generateMockRecommendations(movieId: string) {
  const selectedMovie = dummyMovies.find((m) => m.id === movieId)
  if (!selectedMovie) return []

  // Filter out the selected movie and return top recommendations with confidence scores
  return dummyMovies
    .filter((m) => m.id !== movieId)
    .map((movie) => ({
      ...movie,
      confidence: 0.7 + Math.random() * 0.3, // Random confidence between 0.7-1.0
    }))
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 10)
}

// Generate mock graph data
export function generateMockGraphData(movieId: string) {
  const recommendations = generateMockRecommendations(movieId)
  const selectedMovie = dummyMovies.find((m) => m.id === movieId)

  if (!selectedMovie) return null

  const nodes = [
    { id: selectedMovie.id, label: selectedMovie.title, score: selectedMovie.score },
    ...recommendations.slice(0, 5).map((m) => ({
      id: m.id,
      label: m.title,
      score: m.score,
    })),
  ]

  const edges = recommendations.slice(0, 5).map((m) => ({
    source: selectedMovie.id,
    target: m.id,
    weight: m.confidence,
  }))

  return { nodes, edges }
}
