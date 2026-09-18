import { db } from "../../prisma/db.js";
import { AppError } from "../../utils/AppError.js";

import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "./category.schema.js";

const MarketCategory = db.orm.public!.MarketCategory!;

function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeName(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

// CREATE
export async function createCategory(input: CreateCategoryInput) {
  const name = normalizeName(input.name);
  const slug = slugify(name);

  if (!name || !slug) {
    throw new AppError("Invalid category name", 400);
  }

  const existingByName = await MarketCategory.where({ name }).all().first();

  if (existingByName) {
    throw new AppError("Category already exists", 409);
  }

  const existingBySlug = await MarketCategory.where({ slug }).all().first();

  if (existingBySlug) {
    throw new AppError("Category already exists", 409);
  }

  return MarketCategory.create({
    name,
    slug,
    description: input.description?.trim() || null,
  });
}

// READ ALL
export async function getCategories() {
  return MarketCategory.orderBy((category) => category.name.asc()).all();
}

// READ ONE
export async function getCategoryById(id: string) {
  const category = await MarketCategory.where({ id }).all().first();

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  return category;
}

// UPDATE
export async function updateCategory(id: string, input: UpdateCategoryInput) {
  const existingCategory = await MarketCategory.where({ id }).all().first();

  if (!existingCategory) {
    throw new AppError("Category not found", 404);
  }

  const updateData: {
    name?: string;
    slug?: string;
    description?: string | null;
  } = {};

  if (input.name !== undefined) {
    const name = normalizeName(input.name);
    const slug = slugify(name);

    if (!name || !slug) {
      throw new AppError("Invalid category name", 400);
    }

    const existingByName = await MarketCategory.where({ name }).all().first();

    if (existingByName && existingByName.id !== id) {
      throw new AppError("Category already exists", 409);
    }

    const existingBySlug = await MarketCategory.where({ slug }).all().first();

    if (existingBySlug && existingBySlug.id !== id) {
      throw new AppError("Category already exists", 409);
    }

    updateData.name = name;
    updateData.slug = slug;
  }

  if (input.description !== undefined) {
    updateData.description = input.description.trim() || null;
  }

  if (Object.keys(updateData).length === 0) {
    return existingCategory;
  }

  return MarketCategory.where({ id }).update(updateData);
}

// DELETE
export async function deleteCategory(id: string) {
  const existingCategory = await MarketCategory.where({ id }).all().first();

  if (!existingCategory) {
    throw new AppError("Category not found", 404);
  }

  await MarketCategory.where({ id }).delete();

  return existingCategory;
}
