import { LRUCache } from "../../utils/lrucache.js";

export interface CachedSearchResult {
  report: Record<string, unknown>;
  relevanceScore: number;
}

// L1 in-memory cache.
// Holds the 100 most recently used search queries per server instance.
export const searchResultCache = new LRUCache<string, CachedSearchResult[]>(
  100,
);
