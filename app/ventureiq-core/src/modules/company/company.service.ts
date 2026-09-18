import { db } from "../../prisma/db.js";
import { AppError } from "../../utils/AppError.js";

import type {
  CreateCompanyInput,
  UpdateCompanyInput,
  ListCompaniesQuery,
} from "./company.schema.js";

const Company = db.orm.public!.Company!;
const MarketCategory = db.orm.public!.MarketCategory!;

function normalizeText(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// CREATE
export async function createCompany(input: CreateCompanyInput) {
  const category = await MarketCategory.where({
    id: input.categoryId,
  })
    .all()
    .first();

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  const name = normalizeText(input.name);
  const slug = slugify(name);

  if (!name || !slug) {
    throw new AppError("Invalid company name", 400);
  }

  const existing = await Company.where({ slug }).all().first();

  if (existing) {
    throw new AppError("A company with this name already exists", 409);
  }

  return Company.create({
    name,
    slug,
    description: input.description?.trim() || null,
    website: input.website?.trim() || null,
    foundedYear: input.foundedYear ?? null,
    headquarters: input.headquarters?.trim() || null,
    categoryId: input.categoryId,
  });
}

// READ ALL
export async function listCompanies(query: ListCompaniesQuery) {
  const { page, limit, categoryId, search } = query;

  let companiesQuery = Company;

  if (categoryId) {
    companiesQuery = companiesQuery.where({
      categoryId,
    });
  }

  let companies = await companiesQuery
    .orderBy((company) => company.name.asc())
    .all();

  if (search) {
    const normalizedSearch = search.toLowerCase().trim();

    companies = companies.filter((company) =>
      company.name.toLowerCase().includes(normalizedSearch),
    );
  }

  const total = companies.length;

  const skip = (page - 1) * limit;

  const paginatedCompanies = companies.slice(skip, skip + limit);

  return {
    companies: paginatedCompanies,

    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// READ ONE
export async function getCompanyById(id: string) {
  const company = await Company.where({ id }).all().first();

  if (!company) {
    throw new AppError("Company not found", 404);
  }

  return company;
}

// UPDATE
export async function updateCompany(id: string, input: UpdateCompanyInput) {
  const company = await Company.where({ id }).all().first();

  if (!company) {
    throw new AppError("Company not found", 404);
  }

  if (input.categoryId) {
    const category = await MarketCategory.where({
      id: input.categoryId,
    })
      .all()
      .first();

    if (!category) {
      throw new AppError("Category not found", 404);
    }
  }

  const updateData: {
    name?: string;
    slug?: string;
    description?: string | null;
    website?: string | null;
    foundedYear?: number | null;
    headquarters?: string | null;
    categoryId?: string;
  } = {};

  if (input.name !== undefined) {
    const name = normalizeText(input.name);
    const slug = slugify(name);

    if (!name || !slug) {
      throw new AppError("Invalid company name", 400);
    }

    const existing = await Company.where({ slug }).all().first();

    if (existing && existing.id !== id) {
      throw new AppError("A company with this name already exists", 409);
    }

    updateData.name = name;
    updateData.slug = slug;
  }

  if (input.description !== undefined) {
    updateData.description = input.description.trim() || null;
  }

  if (input.website !== undefined) {
    updateData.website = input.website.trim() || null;
  }

  if (input.foundedYear !== undefined) {
    updateData.foundedYear = input.foundedYear;
  }

  if (input.headquarters !== undefined) {
    updateData.headquarters = input.headquarters.trim() || null;
  }

  if (input.categoryId !== undefined) {
    updateData.categoryId = input.categoryId;
  }

  if (Object.keys(updateData).length === 0) {
    return company;
  }

  return Company.where({ id }).update(updateData);
}

// DELETE
export async function deleteCompany(id: string) {
  const company = await Company.where({ id }).all().first();

  if (!company) {
    throw new AppError("Company not found", 404);
  }

  await Company.where({ id }).delete();

  return company;
}
