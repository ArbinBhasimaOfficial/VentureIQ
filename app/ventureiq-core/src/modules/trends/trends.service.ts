import { db } from "../../prisma/db.js";

import { AppError } from "../../utils/AppError.js";

import { getOrSetCache, invalidateCache } from "../../utils/cache.js";

import {
  indexDocument,
  removeDocumentIndex,
} from "../search/search.service.js";

import { searchResultCache } from "../search/searchCache.js";

import type {
  CreateTrendInput,
  UpdateTrendInput,
  ListTrendsQuery,
} from "./trends.schema.js";

const Trend = db.orm.public!.Trend!;
const TrendReport = db.orm.public!.TrendReport!;
const MarketCategory = db.orm.public!.MarketCategory!;
const MarketReport = db.orm.public!.MarketReport!;

function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeText(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

async function validateReports(reportIds: string[]): Promise<void> {
  const uniqueReportIds = [...new Set(reportIds)];

  for (const reportId of uniqueReportIds) {
    const report = await MarketReport.where({
      id: reportId,
    })
      .all()
      .first();

    if (!report) {
      throw new AppError(`Report not found: ${reportId}`, 404);
    }
  }
}

async function replaceTrendReports(
  trendId: string,
  reportIds: string[],
): Promise<void> {
  const uniqueReportIds = [...new Set(reportIds)];

  await validateReports(uniqueReportIds);

  const existingLinks = await TrendReport.where({
    trendId,
  }).all();

  for (const link of existingLinks) {
    await TrendReport.where({
      trendId,
      reportId: link.reportId,
    }).delete();
  }

  for (const reportId of uniqueReportIds) {
    await TrendReport.create({
      trendId,
      reportId,
    });
  }
}

// CREATE

export async function createTrend(input: CreateTrendInput) {
  const title = normalizeText(input.title);
  const description = input.description.trim();
  const industry = normalizeText(input.industry);
  const slug = slugify(title);

  if (!title || !slug) {
    throw new AppError("Invalid trend title", 400);
  }

  if (!description) {
    throw new AppError("Trend description is required", 400);
  }

  if (!industry) {
    throw new AppError("Trend industry is required", 400);
  }

  const category = await MarketCategory.where({
    id: input.categoryId,
  })
    .all()
    .first();

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  const existing = await Trend.where({
    slug,
  })
    .all()
    .first();

  if (existing) {
    throw new AppError("A trend with this title already exists", 409);
  }

  const reportIds = [...new Set(input.reportIds ?? [])];

  await validateReports(reportIds);

  const trend = await Trend.create({
    title,
    slug,
    description,
    industry,
    direction: input.direction ?? "STABLE",
    categoryId: input.categoryId,
  });

  for (const reportId of reportIds) {
    await TrendReport.create({
      trendId: trend.id,
      reportId,
    });
  }

  // Index Trend for BM25 search.
  await indexDocument(trend.id, "TREND", `${trend.title} ${trend.description}`);

  // Clear cached search results because a new searchable
  // document has been added.
  searchResultCache.clear();

  await invalidateCache("trends:list:*");

  await invalidateCache(`trends:detail:${trend.id}`);

  return trend;
}

// LIST

export async function listTrends(query: ListTrendsQuery) {
  const { page, limit, categoryId, industry, direction } = query;

  const cacheKey =
    `trends:list:${page}:${limit}:` +
    `${categoryId || "all"}:` +
    `${industry || "all"}:` +
    `${direction || "all"}`;

  return getOrSetCache(cacheKey, 60, async () => {
    const skip = (page - 1) * limit;

    let trendsQuery = Trend;

    if (categoryId) {
      trendsQuery = trendsQuery.where({
        categoryId,
      });
    }

    if (industry) {
      trendsQuery = trendsQuery.where({
        industry,
      });
    }

    if (direction) {
      trendsQuery = trendsQuery.where({
        direction,
      });
    }

    const trends = await trendsQuery
      .orderBy((trend) => trend.createdAt.desc())
      .limit(skip + limit)
      .all();

    const paginatedTrends = trends.slice(skip, skip + limit);

    return {
      trends: paginatedTrends,
      pagination: {
        page,
        limit,
        count: paginatedTrends.length,
      },
    };
  });
}

// GET ONE

export async function getTrendById(id: string) {
  const cacheKey = `trends:detail:${id}`;

  return getOrSetCache(cacheKey, 300, async () => {
    const trend = await Trend.where({
      id,
    })
      .all()
      .first();

    if (!trend) {
      throw new AppError("Trend not found", 404);
    }

    const category = await MarketCategory.where({
      id: trend.categoryId,
    })
      .all()
      .first();

    const links = await TrendReport.where({
      trendId: trend.id,
    }).all();

    const reports = [];

    for (const link of links) {
      const report = await MarketReport.where({
        id: link.reportId,
      })
        .all()
        .first();

      if (report) {
        reports.push(report);
      }
    }

    return {
      ...trend,
      category,
      reports,
    };
  });
}

// UPDATE

export async function updateTrend(id: string, input: UpdateTrendInput) {
  const existingTrend = await Trend.where({
    id,
  })
    .all()
    .first();

  if (!existingTrend) {
    throw new AppError("Trend not found", 404);
  }

  const updateData: {
    title?: string;
    slug?: string;
    description?: string;
    industry?: string;
    direction?: "RISING" | "FALLING" | "STABLE";
    categoryId?: string;
  } = {};

  if (input.title !== undefined) {
    const title = normalizeText(input.title);
    const slug = slugify(title);

    if (!title || !slug) {
      throw new AppError("Invalid trend title", 400);
    }

    const existingSlug = await Trend.where({
      slug,
    })
      .all()
      .first();

    if (existingSlug && existingSlug.id !== id) {
      throw new AppError("A trend with this title already exists", 409);
    }

    updateData.title = title;
    updateData.slug = slug;
  }

  if (input.description !== undefined) {
    const description = input.description.trim();

    if (!description) {
      throw new AppError("Trend description is required", 400);
    }

    updateData.description = description;
  }

  if (input.industry !== undefined) {
    const industry = normalizeText(input.industry);

    if (!industry) {
      throw new AppError("Trend industry is required", 400);
    }

    updateData.industry = industry;
  }

  if (input.direction !== undefined) {
    updateData.direction = input.direction;
  }

  if (input.categoryId !== undefined) {
    const category = await MarketCategory.where({
      id: input.categoryId,
    })
      .all()
      .first();

    if (!category) {
      throw new AppError("Category not found", 404);
    }

    updateData.categoryId = input.categoryId;
  }

  if (Object.keys(updateData).length > 0) {
    const updatedTrend = await Trend.where({
      id,
    }).update(updateData);

    if (!updatedTrend) {
      throw new AppError("Trend not found", 404);
    }
  }

  if (input.reportIds !== undefined) {
    await replaceTrendReports(id, input.reportIds);
  }

  /*
   * Fetch the final version of the Trend after all updates.
   *
   * This guarantees that the search index contains the
   * latest title and description.
   */
  const updatedTrend = await Trend.where({
    id,
  })
    .all()
    .first();

  if (!updatedTrend) {
    throw new AppError("Trend not found", 404);
  }

  // Rebuild the Trend search index.
  await indexDocument(
    updatedTrend.id,
    "TREND",
    `${updatedTrend.title} ${updatedTrend.description}`,
  );

  // Existing cached search results may contain the old
  // version of this Trend.
  searchResultCache.clear();

  await invalidateCache("trends:list:*");

  await invalidateCache(`trends:detail:${id}`);

  return getTrendById(id);
}

// DELETE

export async function deleteTrend(id: string) {
  const existingTrend = await Trend.where({
    id,
  })
    .all()
    .first();

  if (!existingTrend) {
    throw new AppError("Trend not found", 404);
  }

  /*
   * Remove the Trend from the BM25 search index before
   * deleting the actual database record.
   */
  await removeDocumentIndex(id, "TREND");

  // Existing search results may contain this Trend.
  searchResultCache.clear();

  await Trend.where({
    id,
  }).delete();

  await invalidateCache("trends:list:*");

  await invalidateCache(`trends:detail:${id}`);

  return existingTrend;
}
