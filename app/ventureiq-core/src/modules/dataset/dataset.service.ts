import { db } from "../../prisma/db.js";

import type {
  CreateDatasetInput,
  UpdateDatasetInput,
  ListDatasetsQuery,
} from "./dataset.schema.js";

const Dataset =
  db.orm.public!.Dataset!;

const MarketReport =
  db.orm.public!.MarketReport!;

// CREATE
export async function createDataset(
  input: CreateDatasetInput,
) {
  const report = await MarketReport
    .where({
      id: input.reportId,
    })
    .all()
    .first();

  if (!report) {
    throw new Error("REPORT_NOT_FOUND");
  }

  return Dataset.create({
    name: input.name.trim(),
    description:
      input.description?.trim() || null,
    data: input.data as any,
    source:
      input.source?.trim() || null,
    reportId: input.reportId,
  });
}

// LIST
export async function listDatasets(
  query: ListDatasetsQuery,
) {
  const {
    page,
    limit,
    reportId,
  } = query;

  const skip = (page - 1) * limit;

  let datasetsQuery = Dataset;

  if (reportId) {
    datasetsQuery = datasetsQuery.where({
      reportId,
    });
  }

  const datasets = await datasetsQuery
    .orderBy((dataset) =>
      dataset.createdAt.desc(),
    )
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
}

// GET ONE
export async function getDatasetById(
  id: string,
) {
  const dataset = await Dataset
    .where({
      id,
    })
    .all()
    .first();

  if (!dataset) {
    throw new Error("DATASET_NOT_FOUND");
  }

  return dataset;
}

// UPDATE
export async function updateDataset(
  id: string,
  input: UpdateDatasetInput,
) {
  const dataset = await Dataset
    .where({
      id,
    })
    .all()
    .first();

  if (!dataset) {
    throw new Error("DATASET_NOT_FOUND");
  }

  const updateData: {
    name?: string;
    description?: string | null;
    data?:
      | Record<string, unknown>
      | Record<string, unknown>[];
    source?: string | null;
    reportId?: string;
  } = {};

  if (input.name !== undefined) {
    updateData.name =
      input.name.trim();
  }

  if (input.description !== undefined) {
    updateData.description =
      input.description.trim() || null;
  }

  if (input.data !== undefined) {
    updateData.data = input.data;
  }

  if (input.source !== undefined) {
    updateData.source =
      input.source.trim() || null;
  }

  if (input.reportId !== undefined) {
    const report = await MarketReport
      .where({
        id: input.reportId,
      })
      .all()
      .first();

    if (!report) {
      throw new Error("REPORT_NOT_FOUND");
    }

    updateData.reportId =
      input.reportId;
  }

  if (
    Object.keys(updateData).length === 0
  ) {
    return dataset;
  }

  return Dataset
    .where({ id })
    .update(updateData as any);
}

// DELETE
export async function deleteDataset(
  id: string,
) {
  const dataset = await Dataset
    .where({
      id,
    })
    .all()
    .first();

  if (!dataset) {
    throw new Error("DATASET_NOT_FOUND");
  }

  await Dataset
    .where({ id })
    .delete();

  return dataset;
}