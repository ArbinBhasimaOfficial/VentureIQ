import type { Request, Response } from "express";

import {
  createTrendSchema,
  updateTrendSchema,
  listTrendsQuerySchema,
} from "./trends.schema.js";

import {
  createTrend,
  listTrends,
  getTrendById,
  updateTrend,
  deleteTrend,
} from "./trends.service.js";

import { asyncHandler } from "../../utils/asyncHandler.js";
import { AppError } from "../../utils/AppError.js";

/**
 * CREATE TREND
 */
export const create = asyncHandler(async (req: Request, res: Response) => {
  const parsed = createTrendSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new AppError(
      `Validation failed: ${JSON.stringify(
        parsed.error.flatten().fieldErrors,
      )}`,
      400,
    );
  }

  const trend = await createTrend(parsed.data);

  return res.status(201).json({
    status: "ok",
    data: trend,
  });
});

/**
 * GET ALL TRENDS
 */
export const getAll = asyncHandler(async (req: Request, res: Response) => {
  const parsed = listTrendsQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    throw new AppError(
      `Validation failed: ${JSON.stringify(
        parsed.error.flatten().fieldErrors,
      )}`,
      400,
    );
  }

  const result = await listTrends(parsed.data);

  return res.status(200).json({
    status: "ok",
    data: result,
  });
});

/**
 * GET TREND BY ID
 */
export const getOne = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (typeof id !== "string" || !id.trim()) {
    throw new AppError("Invalid trend ID", 400);
  }

  const trend = await getTrendById(id);

  return res.status(200).json({
    status: "ok",
    data: trend,
  });
});

/**
 * UPDATE TREND
 */
export const update = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (typeof id !== "string" || !id.trim()) {
    throw new AppError("Invalid trend ID", 400);
  }

  const parsed = updateTrendSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new AppError(
      `Validation failed: ${JSON.stringify(
        parsed.error.flatten().fieldErrors,
      )}`,
      400,
    );
  }

  const trend = await updateTrend(id, parsed.data);

  return res.status(200).json({
    status: "ok",
    data: trend,
  });
});

/**
 * DELETE TREND
 */
export const remove = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (typeof id !== "string" || !id.trim()) {
    throw new AppError("Invalid trend ID", 400);
  }

  await deleteTrend(id);

  return res.status(204).send();
});
