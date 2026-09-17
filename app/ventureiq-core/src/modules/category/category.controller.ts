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

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "";
}

/**
 * CREATE CATEGORY
 */
export async function create(
  req: Request,
  res: Response,
) {
  const parsed = createCategorySchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      status: "error",
      errors: parsed.error.flatten().fieldErrors,
    });
  }

  try {
    const category = await createCategory(parsed.data);

    return res.status(201).json({
      status: "ok",
      data: category,
    });
  } catch (error) {
    const message = getErrorMessage(error);

    if (
      message === "CATEGORY_ALREADY_EXISTS" ||
      message === "CATEGORY_SLUG_ALREADY_EXISTS"
    ) {
      return res.status(409).json({
        status: "error",
        message: "Category already exists",
      });
    }

    if (message === "INVALID_CATEGORY_NAME") {
      return res.status(400).json({
        status: "error",
        message: "Invalid category name",
      });
    }

    console.error("Create category error:", error);

    return res.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  }
}

/**
 * GET ALL CATEGORIES
 */
export async function getAll(
  _req: Request,
  res: Response,
) {
  try {
    const categories = await getCategories();

    return res.status(200).json({
      status: "ok",
      data: categories,
    });
  } catch (error) {
    console.error("Get categories error:", error);

    return res.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  }
}

/**
 * GET CATEGORY BY ID
 */
export async function getOne(
  req: Request,
  res: Response,
) {
  const { id } = req.params;

  if (typeof id !== "string" || !id.trim()) {
    return res.status(400).json({
      status: "error",
      message: "Invalid category ID",
    });
  }

  try {
    const category = await getCategoryById(id);

    if (!category) {
      return res.status(404).json({
        status: "error",
        message: "Category not found",
      });
    }

    return res.status(200).json({
      status: "ok",
      data: category,
    });
  } catch (error) {
    console.error("Get category error:", error);

    return res.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  }
}

/**
 * UPDATE CATEGORY
 */
export async function update(
  req: Request,
  res: Response,
) {
  const { id } = req.params;

  if (typeof id !== "string" || !id.trim()) {
    return res.status(400).json({
      status: "error",
      message: "Invalid category ID",
    });
  }

  const parsed = updateCategorySchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      status: "error",
      errors: parsed.error.flatten().fieldErrors,
    });
  }

  try {
    const category = await updateCategory(id, parsed.data);

    return res.status(200).json({
      status: "ok",
      data: category,
    });
  } catch (error) {
    const message = getErrorMessage(error);

    if (message === "CATEGORY_NOT_FOUND") {
      return res.status(404).json({
        status: "error",
        message: "Category not found",
      });
    }

    if (
      message === "CATEGORY_ALREADY_EXISTS" ||
      message === "CATEGORY_SLUG_ALREADY_EXISTS"
    ) {
      return res.status(409).json({
        status: "error",
        message: "Category already exists",
      });
    }

    if (
      message === "INVALID_CATEGORY_NAME" ||
      message === "INVALID_CATEGORY_SLUG"
    ) {
      return res.status(400).json({
        status: "error",
        message: "Invalid category data",
      });
    }

    console.error("Update category error:", error);

    return res.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  }
}

/**
 * DELETE CATEGORY
 */
export async function remove(
  req: Request,
  res: Response,
) {
  const { id } = req.params;

  if (typeof id !== "string" || !id.trim()) {
    return res.status(400).json({
      status: "error",
      message: "Invalid category ID",
    });
  }

  try {
    await deleteCategory(id);

    return res.status(204).send();
  } catch (error) {
    const message = getErrorMessage(error);

    if (message === "CATEGORY_NOT_FOUND") {
      return res.status(404).json({
        status: "error",
        message: "Category not found",
      });
    }

    console.error("Delete category error:", error);

    return res.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  }
}