
import { db } from "../../prisma/db.js";

import {
  getOrSetCache,
  invalidateCache,
} from "../../utils/cache.js";

import { tokenize } from "./tokenizer.js";

const SearchIndexTerm =
  db.orm.public!.SearchIndexTerm!;

const SearchDocumentStats =
  db.orm.public!.SearchDocumentStats!;

const K1 = 1.5;
const B = 0.75;

export interface SearchResult {
  documentId: string;
  score: number;
}

export interface CorpusStats {
  N: number;
  avgdl: number;
  lengths: Record<string, number>;
}

/**
 * Remove every existing index row for a document.
 *
 * We explicitly fetch the rows and delete them by ID rather than
 * relying on a filtered collection delete. This makes the rebuild
 * deterministic with the Prisma 8 ORM.
 */
async function clearDocumentIndex(
  documentId: string,
  documentType: string,
) {
  const existingTerms =
    await SearchIndexTerm
      .where({
        documentId,
        documentType,
      })
      .all();

  for (const term of existingTerms) {
    await SearchIndexTerm
      .where({ id: term.id })
      .delete();
  }

  const existingStats =
    await SearchDocumentStats
      .where({
        documentId,
        documentType,
      })
      .all();

  for (const stat of existingStats) {
    await SearchDocumentStats
      .where({
        documentId,
        documentType,
      })
      .delete();
  }
}

/**
 * Build or rebuild the inverted index for a document.
 */
export async function indexDocument(
  documentId: string,
  documentType: string,
  text: string,
) {
  const tokens = tokenize(text);

  const length = tokens.length;

  const termFrequency = new Map<string, number>();

  for (const token of tokens) {
    termFrequency.set(
      token,
      (termFrequency.get(token) ?? 0) + 1,
    );
  }

  /*
   * Completely remove the previous index before rebuilding.
   */
  await clearDocumentIndex(
    documentId,
    documentType,
  );

  /*
   * Insert one row per unique term.
   *
   * termFrequency is a Map, so every term is unique.
   */
  for (const [term, frequency] of termFrequency.entries()) {
    await SearchIndexTerm.create({
      term,
      documentId,
      documentType,
      termFrequency: frequency,
    });
  }

  /*
   * Store document length for BM25.
   */
  await SearchDocumentStats.create({
    documentId,
    documentType,
    length,
  });

  /*
   * Corpus statistics changed.
   */
  await invalidateCache(
    `search:corpus:${documentType}`,
  );
}

/**
 * Remove a document completely from the search index.
 */
export async function removeDocumentIndex(
  documentId: string,
  documentType: string,
) {
  await clearDocumentIndex(
    documentId,
    documentType,
  );

  await invalidateCache(
    `search:corpus:${documentType}`,
  );
}

/**
 * Get corpus statistics used by BM25.
 */
async function getCorpusStats(
  documentType: string,
): Promise<CorpusStats> {
  return getOrSetCache(
    `search:corpus:${documentType}`,
    120,
    async () => {
      const stats =
        await SearchDocumentStats
          .where({ documentType })
          .all();

      const N = stats.length;

      const totalLength =
        stats.reduce(
          (sum, stat) => sum + stat.length,
          0,
        );

      const avgdl =
        N > 0
          ? totalLength / N
          : 0;

      const lengths: Record<string, number> = {};

      for (const stat of stats) {
        lengths[stat.documentId] = stat.length;
      }

      return {
        N,
        avgdl,
        lengths,
      };
    },
  );
}

/**
 * Search documents using BM25 ranking.
 */
export async function searchDocuments(
  queryText: string,
  documentType: string,
  limit: number,
): Promise<SearchResult[]> {
  const tokens = Array.from(
    new Set(tokenize(queryText)),
  );

  if (tokens.length === 0) {
    return [];
  }

  const {
    N,
    avgdl,
    lengths,
  } = await getCorpusStats(
    documentType,
  );

  if (N === 0) {
    return [];
  }

  const scores = new Map<string, number>();

  for (const term of tokens) {
    const postings =
      await SearchIndexTerm
        .where({
          term,
          documentType,
        })
        .all();

    const df = postings.length;

    if (df === 0) {
      continue;
    }

    /*
     * BM25 inverse document frequency.
     */
    const idf =
      Math.log(
        (N - df + 0.5) /
          (df + 0.5) +
          1,
      );

    for (const posting of postings) {
      const documentLength =
        lengths[posting.documentId] ??
        avgdl;

      const tf =
        posting.termFrequency;

      const numerator =
        tf * (K1 + 1);

      const denominator =
        tf +
        K1 *
          (
            1 -
            B +
            B *
              (
                documentLength /
                (avgdl || 1)
              )
          );

      const score =
        idf *
        (numerator / denominator);

      scores.set(
        posting.documentId,
        (
          scores.get(
            posting.documentId,
          ) ?? 0
        ) + score,
      );
    }
  }

  return Array.from(
    scores.entries(),
  )
    .sort(
      (a, b) => b[1] - a[1],
    )
    .slice(0, limit)
    .map(
      ([documentId, score]) => ({
        documentId,
        score,
      }),
    );
}

