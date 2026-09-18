import { db } from "../../prisma/db.js";

import { getOrSetCache, invalidateCache } from "../../utils/cache.js";

import { AppError } from "../../utils/AppError.js";

import type {
  CreateDatasetInput,
  UpdateDatasetInput,
  ListDatasetsQuery,
} from "./dataset.schema.js";

const Dataset = db.orm.public!.Dataset!;
const MarketReport = db.orm.public!.MarketReport!;

// CREATE
export async function createDataset(input: CreateDatasetInput) {
  const report = await MarketReport.where({
    id: input.reportId,
  })
    .all()
    .first();

  if (!report) {
    throw new AppError("Report not found", 404);
  }

  const dataset = await Dataset.create({
    name: input.name.trim(),
    description: input.description?.trim() || null,
    data: input.data as any,
    source: input.source?.trim() || null,
    reportId: input.reportId,
  });

  // A new dataset changes every dataset list.
  await invalidateCache("datasets:list:*");

  // It can also affect report-related cached data.
  await invalidateCache(`reports:detail:${input.reportId}:*`);

  return dataset;
}

// GET ALL
export async function listDatasets(query: ListDatasetsQuery) {
  const { page, limit, reportId } = query;

  const cacheKey = `datasets:list:${page}:${limit}:${reportId || "all"}`;

  return getOrSetCache(cacheKey, 60, async () => {
    const skip = (page - 1) * limit;

    let datasetsQuery = Dataset;

    if (reportId) {
      datasetsQuery = datasetsQuery.where({
        reportId,
      });
    }

    const datasets = await datasetsQuery
      .orderBy((dataset) => dataset.createdAt.desc())
      .offset(skip)
      .limit(limit)
      .all();

    return {
      datasets,
      pagination: {
        page,
        limit,
        count: datasets.length,
      },
    };
  });
}

// GET ONE
export async function getDatasetById(id: string) {
  const cacheKey = `datasets:detail:${id}`;

  return getOrSetCache(cacheKey, 300, async () => {
    const dataset = await Dataset.where({ id }).all().first();

    if (!dataset) {
      throw new AppError("Dataset not found", 404);
    }

    return dataset;
  });
}

// UPDATE
export async function updateDataset(id: string, input: UpdateDatasetInput) {
  const dataset = await Dataset.where({ id }).all().first();

  if (!dataset) {
    throw new AppError("Dataset not found", 404);
  }

  const oldReportId = dataset.reportId;

  const updateData: {
    name?: string;
    description?: string | null;
    data?: Record<string, unknown> | Record<string, unknown>[];
    source?: string | null;
    reportId?: string;
  } = {};

  if (input.name !== undefined) {
    updateData.name = input.name.trim();
  }

  if (input.description !== undefined) {
    updateData.description = input.description.trim() || null;
  }

  if (input.data !== undefined) {
    updateData.data = input.data;
  }

  if (input.source !== undefined) {
    updateData.source = input.source.trim() || null;
  }

  if (input.reportId !== undefined) {
    const report = await MarketReport.where({
      id: input.reportId,
    })
      .all()
      .first();

    if (!report) {
      throw new AppError("Report not found", 404);
    }

    updateData.reportId = input.reportId;
  }

  if (Object.keys(updateData).length === 0) {
    return dataset;
  }

  const updated = await Dataset.where({ id }).update(updateData as any);

  await invalidateCache(`datasets:detail:${id}`);

  await invalidateCache("datasets:list:*");

  await invalidateCache(`reports:detail:${oldReportId}:*`);

  if (input.reportId !== undefined && input.reportId !== oldReportId) {
    await invalidateCache(`reports:detail:${input.reportId}:*`);
  }

  return updated;
}

// DELETE
export async function deleteDataset(id: string) {
  const dataset = await Dataset.where({ id }).all().first();

  if (!dataset) {
    throw new AppError("Dataset not found", 404);
  }

  await Dataset.where({ id }).delete();

  await invalidateCache(`datasets:detail:${id}`);

  await invalidateCache("datasets:list:*");

  await invalidateCache(`reports:detail:${dataset.reportId}:*`);

  return dataset;
}
