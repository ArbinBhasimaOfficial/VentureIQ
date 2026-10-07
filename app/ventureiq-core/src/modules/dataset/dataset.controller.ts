import type { Request, Response } from "express";

import {
  createDatasetSchema,
  updateDatasetSchema,
  listDatasetsQuerySchema,
} from "./dataset.schema.js";

import {
  createDataset,
  listDatasets,
  getDatasetById,
  updateDataset,
  deleteDataset,
} from "./dataset.service.js";

import { asyncHandler } from "../../utils/asyncHandler.js";
import { AppError } from "../../utils/AppError.js";
import { embedAndStore, removeSource } from "../rag/rag.ingest.js";

// CREATE
export const create = asyncHandler(async (req: Request, res: Response) => {
  const parsed = createDatasetSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new AppError(
      `Validation failed: ${JSON.stringify(
        parsed.error.flatten().fieldErrors,
      )}`,
      400,
    );
  }

  const dataset = await createDataset(parsed.data);

  embedAndStore({
    sourceType: "DATASET",
    sourceId: dataset.id,
    title: dataset.name,
    text: `${dataset.name}\n${dataset.description ?? ""}\n${JSON.stringify(dataset.data)}`,
    metadata: { source: dataset.source, reportId: dataset.reportId },
  }).catch((err) => console.error("RAG ingest failed for dataset", dataset.id, err));

  return res.status(201).json({
    status: "ok",
    data: dataset,
  });
});

// GET ALL
export const getAll = asyncHandler(async (req: Request, res: Response) => {
  const parsed = listDatasetsQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    throw new AppError(
      `Validation failed: ${JSON.stringify(
        parsed.error.flatten().fieldErrors,
      )}`,
      400,
    );
  }

  const result = await listDatasets(parsed.data);

  return res.status(200).json({
    status: "ok",
    ...result,
  });
});

// GET ONE
export const getOne = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id;

  if (!id || Array.isArray(id)) {
    throw new AppError("Invalid dataset ID", 400);
  }

  const dataset = await getDatasetById(id);

  return res.status(200).json({
    status: "ok",
    data: dataset,
  });
});

// UPDATE
export const update = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id;

  if (!id || Array.isArray(id)) {
    throw new AppError("Invalid dataset ID", 400);
  }

  const parsed = updateDatasetSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new AppError(
      `Validation failed: ${JSON.stringify(
        parsed.error.flatten().fieldErrors,
      )}`,
      400,
    );
  }

  const dataset = await updateDataset(id, parsed.data);

  embedAndStore({
    sourceType: "DATASET",
    sourceId: dataset.id,
    title: dataset.name,
    text: `${dataset.name}\n${dataset.description ?? ""}\n${JSON.stringify(dataset.data)}`,
    metadata: { source: dataset.source, reportId: dataset.reportId },
  }).catch((err) => console.error("RAG ingest failed for dataset", dataset.id, err));

  return res.status(200).json({
    status: "ok",
    data: dataset,
  });
});

// DELETE
export const remove = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id;

  if (!id || Array.isArray(id)) {
    throw new AppError("Invalid dataset ID", 400);
  }

  await deleteDataset(id);
  removeSource("DATASET", id).catch((err) => console.error("RAG remove failed", id, err));

  return res.status(204).send();
});
