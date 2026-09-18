import type { Request, Response } from "express";

import {
  createCategorySchema,
  updateCategorySchema,
} from "./category.schema.js";

import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "./category.service.js";

import { asyncHandler } from "../../utils/asyncHandler.js";
import { AppError } from "../../utils/AppError.js";

/**
 * CREATE CATEGORY
 */
export const create = asyncHandler(async (req: Request, res: Response) => {
  const parsed = createCategorySchema.safeParse(req.body);

  if (!parsed.success) {
    throw new AppError(
      `Validation failed: ${JSON.stringify(
        parsed.error.flatten().fieldErrors,
      )}`,
      400,
    );
  }

  const category = await createCategory(parsed.data);

  return res.status(201).json({
    status: "ok",
    data: category,
  });
});

/**
 * GET ALL CATEGORIES
 */
export const getAll = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await getCategories();

  return res.status(200).json({
    status: "ok",
    data: categories,
  });
});

/**
 * GET CATEGORY BY ID
 */
export const getOne = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (typeof id !== "string" || !id.trim()) {
    throw new AppError("Invalid category ID", 400);
  }

  const category = await getCategoryById(id);

  return res.status(200).json({
    status: "ok",
    data: category,
  });
});

/**
 * UPDATE CATEGORY
 */
export const update = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (typeof id !== "string" || !id.trim()) {
    throw new AppError("Invalid category ID", 400);
  }

  const parsed = updateCategorySchema.safeParse(req.body);

  if (!parsed.success) {
    throw new AppError(
      `Validation failed: ${JSON.stringify(
        parsed.error.flatten().fieldErrors,
      )}`,
      400,
    );
  }

  const category = await updateCategory(id, parsed.data);

  return res.status(200).json({
    status: "ok",
    data: category,
  });
});

/**
 * DELETE CATEGORY
 */
export const remove = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (typeof id !== "string" || !id.trim()) {
    throw new AppError("Invalid category ID", 400);
  }

  await deleteCategory(id);

  return res.status(204).send();
});
