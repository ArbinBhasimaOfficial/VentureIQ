const STOPWORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "for",
  "from",
  "has",
  "he",
  "in",
  "is",
  "it",
  "its",
  "of",
  "on",
  "that",
  "the",
  "to",
  "was",
  "were",
  "will",
  "with",
  "this",
  "these",
  "those",
  "or",
  "but",
  "not",
  "have",
  "had",
  "been",
  "their",
  "they",
  "we",
  "you",
  "your",
  "i",
  "which",
  "can",
  "could",
  "would",
  "should",
  "about",
  "into",
  "than",
  "then",
  "there",
  "when",
  "where",
]);

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(
      (token) =>
        token.length > 1 &&
        !STOPWORDS.has(token),
    );
}