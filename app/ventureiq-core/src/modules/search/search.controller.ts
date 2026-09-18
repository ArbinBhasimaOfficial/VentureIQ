import type { Request, Response } from "express";
import { z } from "zod";

import { db } from "../../prisma/db.js";
import { searchDocuments } from "./search.service.js";
import { searchResultCache, type CachedSearchResult } from "./searchCache.js";
import { AppError } from "../../utils/AppError.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

const MarketReport = db.orm.public!.MarketReport!;

const searchQuerySchema = z.object({
  q: z.string().trim().min(1, "Query is required"),

  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export const search = asyncHandler(async (req: Request, res: Response) => {
  const parsed = searchQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    throw new AppError(JSON.stringify(parsed.error.flatten().fieldErrors), 400);
  }

  const { q, limit } = parsed.data;

  const isAdmin = req.user?.role === "ADMIN";

  /*
   * Include the user's role in the cache key
   * because admins can see draft reports.
   */
  const cacheKey = [q.toLowerCase().trim(), limit, isAdmin].join(":");

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
   * Retrieve extra candidates because
   * some ranked documents may later be
   * filtered because they are drafts.
   */
  const ranked = await searchDocuments(q, "REPORT", limit * 2);

  if (ranked.length === 0) {
    searchResultCache.put(cacheKey, []);

    return res.status(200).json({
      status: "ok",
      data: [],
      cached: false,
    });
  }

  /*
   * Extract report IDs from BM25 results.
   */
  const reportIds = ranked.map((result) => result.documentId);

  /*
   * Fetch all matching reports using
   * the Prisma 8 ORM query API.
   */
  const reportIdSet = new Set(reportIds);

  const reports = (await MarketReport.all()).filter((report) =>
    reportIdSet.has(report.id),
  );

  /*
   * Public users only see published reports.
   * Admins can also see drafts and archived reports.
   */
  const visibleReports = reports.filter(
    (report) => isAdmin || report.status === "PUBLISHED",
  );

  /*
   * Create a lookup map for efficient access.
   */
  const reportMap = new Map(
    visibleReports.map((report) => [report.id, report]),
  );

  /*
   * Restore BM25 ranking order.
   */
  const results: CachedSearchResult[] = ranked
    .filter((result) => reportMap.has(result.documentId))
    .slice(0, limit)
    .map((result) => ({
      report: reportMap.get(result.documentId)! as unknown as Record<
        string,
        unknown
      >,
      relevanceScore: result.score,
    }));

  /*
   * Store results in the LRU cache.
   */
  searchResultCache.put(cacheKey, results);

  return res.status(200).json({
    status: "ok",
    data: results,
    cached: false,
  });
});
