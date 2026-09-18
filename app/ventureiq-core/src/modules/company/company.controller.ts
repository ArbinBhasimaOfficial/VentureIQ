import type { Request, Response } from "express";

import {
  createCompanySchema,
  updateCompanySchema,
  listCompaniesQuerySchema,
} from "./company.schema.js";

import {
  createCompany,
  listCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany,
} from "./company.service.js";

import { asyncHandler } from "../../utils/asyncHandler.js";
import { AppError } from "../../utils/AppError.js";

// CREATE COMPANY
export const create = asyncHandler(async (req: Request, res: Response) => {
  const parsed = createCompanySchema.safeParse(req.body);

  if (!parsed.success) {
    throw new AppError(
      `Validation failed: ${JSON.stringify(
        parsed.error.flatten().fieldErrors,
      )}`,
      400,
    );
  }

  const company = await createCompany(parsed.data);

  return res.status(201).json({
    status: "ok",
    data: company,
  });
});

// GET ALL COMPANIES
export const getAll = asyncHandler(async (req: Request, res: Response) => {
  const parsed = listCompaniesQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    throw new AppError(
      `Validation failed: ${JSON.stringify(
        parsed.error.flatten().fieldErrors,
      )}`,
      400,
    );
  }

  const result = await listCompanies(parsed.data);

  return res.status(200).json({
    status: "ok",
    ...result,
  });
});

// GET COMPANY BY ID
export const getOne = asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id);

  if (!id.trim()) {
    throw new AppError("Invalid company ID", 400);
  }

  const company = await getCompanyById(id);

  return res.status(200).json({
    status: "ok",
    data: company,
  });
});

// UPDATE COMPANY
export const update = asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id);

  if (!id.trim()) {
    throw new AppError("Invalid company ID", 400);
  }

  const parsed = updateCompanySchema.safeParse(req.body);

  if (!parsed.success) {
    throw new AppError(
      `Validation failed: ${JSON.stringify(
        parsed.error.flatten().fieldErrors,
      )}`,
      400,
    );
  }

  const company = await updateCompany(id, parsed.data);

  return res.status(200).json({
    status: "ok",
    data: company,
  });
});

// DELETE COMPANY
export const remove = asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id);

  if (!id.trim()) {
    throw new AppError("Invalid company ID", 400);
  }

  await deleteCompany(id);

  return res.status(204).send();
});
