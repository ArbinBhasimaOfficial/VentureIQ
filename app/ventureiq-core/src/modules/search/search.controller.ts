import type { Request, Response } from "express";

import { z } from "zod";

import { db } from "../../prisma/db.js";

import { searchDocuments } from "./search.service.js";

import {
  searchResultCache,
  type CachedSearchResult,
  type SearchResultType,
} from "./searchCache.js";

import { AppError } from "../../utils/AppError.js";

import { asyncHandler } from "../../utils/asyncHandler.js";

const MarketReport = db.orm.public!.MarketReport!;

const Trend = db.orm.public!.Trend!;

const Research = db.orm.public!.Research!;

const SEARCH_TYPES = ["REPORT", "TREND", "RESEARCH"] as const;

const searchQuerySchema = z.object({
  q: z.string().trim().min(1, "Query is required"),

  limit: z.coerce.number().int().min(1).max(50).default(10),

  types: z.string().optional(),
});

function parseSearchTypes(value: string | undefined): SearchResultType[] {
  if (!value || value.trim() === "") {
    return [...SEARCH_TYPES];
  }

  const requestedTypes = value
    .split(",")
    .map((type) => type.trim().toUpperCase())
    .filter(Boolean);

  const uniqueTypes = [...new Set(requestedTypes)];

  for (const type of uniqueTypes) {
    if (!SEARCH_TYPES.includes(type as SearchResultType)) {
      throw new AppError(
        `Invalid search type: ${type}. Allowed types: REPORT, TREND, RESEARCH`,
        400,
      );
    }
  }

  return uniqueTypes as SearchResultType[];
}

export const search = asyncHandler(async (req: Request, res: Response) => {
  const parsed = searchQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    throw new AppError(JSON.stringify(parsed.error.flatten().fieldErrors), 400);
  }

  const { q, limit, types } = parsed.data;

  const searchTypes = parseSearchTypes(types);

  const isAdmin = req.user?.role === "ADMIN";

  /*
   * Admins can see draft/archived Reports and Research.
   * Therefore the user's role must be part of the cache key.
   *
   * Search types are also included because:
   *
   * /search?q=finance&types=REPORT
   *
   * must not return the cached result from:
   *
   * /search?q=finance&types=TREND
   */
  const normalizedQuery = q.toLowerCase().trim();

  const normalizedTypes = [...searchTypes].sort();

  const cacheKey = [
    normalizedQuery,
    limit,
    normalizedTypes.join(","),
    isAdmin,
  ].join(":");

  /*
   * LRU cache lookup.
   */
  const cached = searchResultCache.get(cacheKey);

  if (cached !== undefined) {
    return res.status(200).json({
      status: "ok",
      data: cached,
      cached: true,
    });
  }

  /*
   * Search every requested document type.
   *
   * Each type has its own BM25 corpus statistics.
   */
  const rankedResults = new Map<
    string,
    {
      resultType: SearchResultType;
      documentId: string;
      score: number;
    }
  >();

  for (const type of searchTypes) {
    const ranked = await searchDocuments(q, type, limit * 2);

    for (const result of ranked) {
      const key = `${type}:${result.documentId}`;

      rankedResults.set(key, {
        resultType: type,
        documentId: result.documentId,
        score: result.score,
      });
    }
  }

  /*
   * No matching documents across any requested type.
   */
  if (rankedResults.size === 0) {
    searchResultCache.put(cacheKey, []);

    return res.status(200).json({
      status: "ok",
      data: [],
      cached: false,
    });
  }

  /*
   * Separate IDs by document type.
   */
  const reportIds = new Set<string>();

  const trendIds = new Set<string>();

  const researchIds = new Set<string>();

  for (const result of rankedResults.values()) {
    if (result.resultType === "REPORT") {
      reportIds.add(result.documentId);
    }

    if (result.resultType === "TREND") {
      trendIds.add(result.documentId);
    }

    if (result.resultType === "RESEARCH") {
      researchIds.add(result.documentId);
    }
  }

  let reports = [] as Awaited<ReturnType<typeof MarketReport.all>>;

  let trends = [] as Awaited<ReturnType<typeof Trend.all>>;

  let research = [] as Awaited<ReturnType<typeof Research.all>>;
  if (reportIds.size > 0) {
    reports = (await MarketReport.all()).filter((report) =>
      reportIds.has(report.id),
    );
  }

  if (trendIds.size > 0) {
    trends = (await Trend.all()).filter((trend) => trendIds.has(trend.id));
  }

  if (researchIds.size > 0) {
    research = (await Research.all()).filter((item) =>
      researchIds.has(item.id),
    );
  }

  /*
   * Public users:
   *
   * Reports -> PUBLISHED only
   * Research -> PUBLISHED only
   * Trends -> visible
   *
   * Admins:
   *
   * Reports -> all statuses
   * Research -> all statuses
   * Trends -> visible
   */
  const visibleReports = reports.filter(
    (report) => isAdmin || report.status === "PUBLISHED",
  );

  const visibleResearch = research.filter(
    (item) => isAdmin || item.status === "PUBLISHED",
  );

  /*
   * Build lookup maps.
   */
  const reportMap = new Map(
    visibleReports.map((report) => [report.id, report]),
  );

  const trendMap = new Map(trends.map((trend) => [trend.id, trend]));

  const researchMap = new Map(visibleResearch.map((item) => [item.id, item]));

  /*
   * Restore BM25 ranking order and convert
   * everything into the unified search result format.
   */
  const results: CachedSearchResult[] = [];

  for (const result of rankedResults.values()) {
    if (result.resultType === "REPORT") {
      const report = reportMap.get(result.documentId);

      if (!report) {
        continue;
      }

      results.push({
        resultType: "REPORT",
        document: report as unknown as Record<string, unknown>,
        relevanceScore: result.score,
      });
    }

    if (result.resultType === "TREND") {
      const trend = trendMap.get(result.documentId);

      if (!trend) {
        continue;
      }

      results.push({
        resultType: "TREND",
        document: trend as unknown as Record<string, unknown>,
        relevanceScore: result.score,
      });
    }

    if (result.resultType === "RESEARCH") {
      const item = researchMap.get(result.documentId);

      if (!item) {
        continue;
      }

      results.push({
        resultType: "RESEARCH",
        document: item as unknown as Record<string, unknown>,
        relevanceScore: result.score,
      });
    }
  }

  /*
   * Sort all visible results by their BM25 score.
   *
   * Then return only the requested number of results.
   */
  results.sort((a, b) => b.relevanceScore - a.relevanceScore);

  const finalResults = results.slice(0, limit);

  /*
   * Store unified results in the LRU cache.
   */
  searchResultCache.put(cacheKey, finalResults);

  return res.status(200).json({
    status: "ok",
    data: finalResults,
    cached: false,
  });
});
