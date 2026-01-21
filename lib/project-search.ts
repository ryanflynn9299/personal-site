// Project type based on the data structure
export interface Project {
  title: string;
  description: string;
  imageUrl: string;
  tags: string[];
  liveUrl: string;
  githubUrl: string;
}

export interface SearchResult {
  project: Project;
  score: number;
  matchType: "title" | "description" | "tag" | "fuzzy";
}

/**
 * Calculate Levenshtein distance between two strings
 * Uses dynamic programming for efficient computation
 */
function levenshteinDistance(a: string, b: string): number {
  const aLen = a.length;
  const bLen = b.length;

  // Create matrix
  const matrix: number[][] = Array(aLen + 1)
    .fill(null)
    .map(() => Array(bLen + 1).fill(0));

  // Initialize first row and column
  for (let i = 0; i <= aLen; i++) {
    matrix[i][0] = i;
  }
  for (let j = 0; j <= bLen; j++) {
    matrix[0][j] = j;
  }

  // Fill matrix
  for (let i = 1; i <= aLen; i++) {
    for (let j = 1; j <= bLen; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return matrix[aLen][bLen];
}

/**
 * Calculate similarity score between two strings using Levenshtein distance
 * Returns a value between 0 and 1, where 1 is an exact match
 */
function calculateSimilarity(a: string, b: string): number {
  const maxLength = Math.max(a.length, b.length);
  if (maxLength === 0) {
    return 1;
  }

  const distance = levenshteinDistance(a.toLowerCase(), b.toLowerCase());
  return 1 - distance / maxLength;
}

/**
 * Text search: Search in title and description fields
 */
function searchText(project: Project, query: string): SearchResult | null {
  const lowerQuery = query.toLowerCase();
  const lowerTitle = project.title.toLowerCase();
  const lowerDescription = project.description.toLowerCase();

  // Exact match in title
  if (lowerTitle === lowerQuery) {
    return {
      project,
      score: 1.0,
      matchType: "title",
    };
  }

  // Exact match in description
  if (lowerDescription === lowerQuery) {
    return {
      project,
      score: 0.95,
      matchType: "description",
    };
  }

  // Partial match in title (starts with)
  if (lowerTitle.startsWith(lowerQuery)) {
    return {
      project,
      score: 0.9,
      matchType: "title",
    };
  }

  // Partial match in title (contains)
  if (lowerTitle.includes(lowerQuery)) {
    return {
      project,
      score: 0.8,
      matchType: "title",
    };
  }

  // Partial match in description (starts with)
  if (lowerDescription.startsWith(lowerQuery)) {
    return {
      project,
      score: 0.85,
      matchType: "description",
    };
  }

  // Partial match in description (contains)
  if (lowerDescription.includes(lowerQuery)) {
    return {
      project,
      score: 0.75,
      matchType: "description",
    };
  }

  return null;
}

/**
 * Tag search: Search in tags array
 */
function searchTags(project: Project, query: string): SearchResult | null {
  const lowerQuery = query.toLowerCase();

  for (const tag of project.tags) {
    const lowerTag = tag.toLowerCase();

    // Exact tag match
    if (lowerTag === lowerQuery) {
      return {
        project,
        score: 1.0,
        matchType: "tag",
      };
    }

    // Tag starts with query
    if (lowerTag.startsWith(lowerQuery)) {
      return {
        project,
        score: 0.95,
        matchType: "tag",
      };
    }

    // Tag contains query
    if (lowerTag.includes(lowerQuery)) {
      return {
        project,
        score: 0.9,
        matchType: "tag",
      };
    }
  }

  return null;
}

/**
 * Fuzzy search: Use Levenshtein distance for typo tolerance
 */
function searchFuzzy(project: Project, query: string): SearchResult | null {
  const lowerQuery = query.toLowerCase();
  const threshold = 0.6; // Minimum similarity to consider a match

  let bestScore = 0;
  let bestMatchType: "title" | "description" | "tag" = "title";

  // Check title
  const titleSimilarity = calculateSimilarity(project.title, lowerQuery);
  if (titleSimilarity > bestScore && titleSimilarity >= threshold) {
    bestScore = titleSimilarity;
    bestMatchType = "title";
  }

  // Check description (use word-by-word matching for better results)
  const descriptionWords = project.description.toLowerCase().split(/\s+/);
  for (const word of descriptionWords) {
    if (word.length >= 3) {
      // Only check words of reasonable length
      const similarity = calculateSimilarity(word, lowerQuery);
      if (similarity > bestScore && similarity >= threshold) {
        bestScore = similarity;
        bestMatchType = "description";
      }
    }
  }

  // Check tags
  for (const tag of project.tags) {
    const similarity = calculateSimilarity(tag, lowerQuery);
    if (similarity > bestScore && similarity >= threshold) {
      bestScore = similarity;
      bestMatchType = "tag";
    }
  }

  if (bestScore >= threshold) {
    return {
      project,
      score: bestScore * 0.7, // Fuzzy matches get lower base score
      matchType: "fuzzy",
    };
  }

  return null;
}

/**
 * Main search function that combines all search modes
 */
export function searchProjects(
  projects: Project[],
  query: string
): SearchResult[] {
  if (!query.trim()) {
    return [];
  }

  const trimmedQuery = query.trim();
  const resultsMap = new Map<Project, SearchResult>();

  for (const project of projects) {
    // Try text search first (highest priority)
    const textResult = searchText(project, trimmedQuery);
    if (textResult) {
      const existing = resultsMap.get(project);
      if (!existing || textResult.score > existing.score) {
        resultsMap.set(project, textResult);
      }
      continue; // Text match found, skip other searches for this project
    }

    // Try tag search
    const tagResult = searchTags(project, trimmedQuery);
    if (tagResult) {
      const existing = resultsMap.get(project);
      if (!existing || tagResult.score > existing.score) {
        resultsMap.set(project, tagResult);
      }
      continue; // Tag match found, skip fuzzy search
    }

    // Try fuzzy search (lowest priority, only if no exact/partial match)
    const fuzzyResult = searchFuzzy(project, trimmedQuery);
    if (fuzzyResult) {
      const existing = resultsMap.get(project);
      if (!existing || fuzzyResult.score > existing.score) {
        resultsMap.set(project, fuzzyResult);
      }
    }
  }

  // Convert map to array and sort by score (highest first)
  const results = Array.from(resultsMap.values());
  results.sort((a, b) => b.score - a.score);

  return results;
}
