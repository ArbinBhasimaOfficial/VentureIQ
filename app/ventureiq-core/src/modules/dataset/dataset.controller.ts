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

  return res.status(204).send();
});
