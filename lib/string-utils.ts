import Fuse from "fuse.js"

export const normalizeString = (str: string): string => {
  return str.toLowerCase().trim().replace(/\s+/g, " ")
}

export const calculateSimilarity = (str1: string, str2: string): number => {
  const normalized1 = normalizeString(str1)
  const normalized2 = normalizeString(str2)

  if (normalized1 === normalized2) return 1

  // Levenshtein-like distance for typo detection
  const longer = normalized1.length > normalized2.length ? normalized1 : normalized2
  const shorter = normalized1.length > normalized2.length ? normalized2 : normalized1

  if (longer.length === 0) return 1.0

  const editDistance = getEditDistance(longer, shorter)
  return (longer.length - editDistance) / longer.length
}

const getEditDistance = (s1: string, s2: string): number => {
  const costs = []
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) {
        costs[j] = j
      } else if (j > 0) {
        let newValue = costs[j - 1]
        if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1
        }
        costs[j - 1] = lastValue
        lastValue = newValue
      }
    }
    if (i > 0) costs[s2.length] = lastValue
  }
  return costs[s2.length]
}

// Fuzzy search using Fuse.js
export const fuzzySearch = (
  items: Array<{ id: string; title: string }>,
  query: string,
  options = { threshold: 0.3, keys: ["title"] },
) => {
  const fuse = new Fuse(items, options)
  return fuse.search(query).map((result) => result.item)
}
