import type {
  Request,
  Response,
} from "express";

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

// CREATE
export async function create(
  req: Request,
  res: Response,
) {
  const parsed =
    createDatasetSchema.safeParse(
      req.body,
    );

  if (!parsed.success) {
    return res.status(400).json({
      status: "error",
      errors:
        parsed.error.flatten()
          .fieldErrors,
    });
  }

  try {
    const dataset =
      await createDataset(parsed.data);

    return res.status(201).json({
      status: "ok",
      data: dataset,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "";

    if (
      message === "REPORT_NOT_FOUND"
    ) {
      return res.status(404).json({
        status: "error",
        message: "Report not found",
      });
    }

    console.error(error);

    return res.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  }
}

// GET ALL
export async function getAll(
  req: Request,
  res: Response,
) {
  const parsed =
    listDatasetsQuerySchema.safeParse(
      req.query,
    );

  if (!parsed.success) {
    return res.status(400).json({
      status: "error",
      errors:
        parsed.error.flatten()
          .fieldErrors,
    });
  }

  try {
    const result =
      await listDatasets(parsed.data);

    return res.status(200).json({
      status: "ok",
      ...result,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      status: "error",
      message: "Failed to fetch datasets",
    });
  }
}

// GET ONE
export async function getOne(
  req: Request,
  res: Response,
) {
  const id = req.params.id;

  if (!id || Array.isArray(id)) {
    return res.status(400).json({
      status: "error",
      message: "Invalid dataset ID",
    });
  }

  try {
    const dataset =
      await getDatasetById(id);

    return res.status(200).json({
      status: "ok",
      data: dataset,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message ===
        "DATASET_NOT_FOUND"
    ) {
      return res.status(404).json({
        status: "error",
        message: "Dataset not found",
      });
    }

    console.error(error);

    return res.status(500).json({
      status: "error",
      message: "Failed to fetch dataset",
    });
  }
}

// UPDATE
export async function update(
  req: Request,
  res: Response,
) {
  const id = req.params.id;

  if (!id || Array.isArray(id)) {
    return res.status(400).json({
      status: "error",
      message: "Invalid dataset ID",
    });
  }

  const parsed =
    updateDatasetSchema.safeParse(
      req.body,
    );

  if (!parsed.success) {
    return res.status(400).json({
      status: "error",
      errors:
        parsed.error.flatten()
          .fieldErrors,
    });
  }

  try {
    const dataset =
      await updateDataset(
        id,
        parsed.data,
      );

    return res.status(200).json({
      status: "ok",
      data: dataset,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "";

    if (
      message === "DATASET_NOT_FOUND"
    ) {
      return res.status(404).json({
        status: "error",
        message: "Dataset not found",
      });
    }

    if (
      message === "REPORT_NOT_FOUND"
    ) {
      return res.status(404).json({
        status: "error",
        message: "Report not found",
      });
    }

    console.error(error);

    return res.status(500).json({
      status: "error",
      message: "Failed to update dataset",
    });
  }
}

// DELETE
export async function remove(
  req: Request,
  res: Response,
) {
  const id = req.params.id;

  if (!id || Array.isArray(id)) {
    return res.status(400).json({
      status: "error",
      message: "Invalid dataset ID",
    });
  }

  try {
    await deleteDataset(id);

    return res.status(204).send();
  } catch (error) {
    if (
      error instanceof Error &&
      error.message ===
        "DATASET_NOT_FOUND"
    ) {
      return res.status(404).json({
        status: "error",
        message: "Dataset not found",
      });
    }

    console.error(error);

    return res.status(500).json({
      status: "error",
      message: "Failed to delete dataset",
    });
  }
}