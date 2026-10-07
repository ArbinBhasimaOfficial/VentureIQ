import type { Request, Response } from "express";

import {
  createReportSchema,
  updateReportSchema,
  listReportsQuerySchema,
} from "./report.schema.js";

import {
  createReport,
  listReports,
  getReportById,
  updateReport,
  deleteReport,
} from "./report.service.js";

import { AppError } from "../../utils/AppError.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { embedAndStore, removeSource } from "../rag/rag.ingest.js";

// CREATE

export const create = asyncHandler(async (req: Request, res: Response) => {
  const parsed = createReportSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new AppError(JSON.stringify(parsed.error.flatten().fieldErrors), 400);
  }

  if (!req.user) {
    throw new AppError("Not authenticated", 401);
  }

  const report = await createReport(parsed.data, req.user.userId);

  // Automatically index the new report for Ask AI (fire-and-forget)
  embedAndStore({
    sourceType: "REPORT",
    sourceId: report.id,
    title: report.title,
    text: `${report.title}\n${report.summary}\n${report.content}`,
    metadata: { industry: report.industry, region: report.region, categoryId: report.categoryId },
  }).catch((err) => console.error("RAG ingest failed for report", report.id, err));

  return res.status(201).json({
    status: "ok",
    data: report,
  });
});

// GET ALL

export const getAll = asyncHandler(async (req: Request, res: Response) => {
  const parsed = listReportsQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    throw new AppError(JSON.stringify(parsed.error.flatten().fieldErrors), 400);
  }

  const isAdmin = req.user?.role === "ADMIN";

  const result = await listReports(parsed.data, !isAdmin);

  return res.status(200).json({
    status: "ok",
    ...result,
  });
});

// GET ONE

export const getOne = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id;

  if (!id || Array.isArray(id)) {
    throw new AppError("Invalid report ID", 400);
  }

  const isAdmin = req.user?.role === "ADMIN";

  const report = await getReportById(id, !isAdmin);

  return res.status(200).json({
    status: "ok",
    data: report,
  });
});

// UPDATE

export const update = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id;

  if (!id || Array.isArray(id)) {
    throw new AppError("Invalid report ID", 400);
  }

  const parsed = updateReportSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new AppError(JSON.stringify(parsed.error.flatten().fieldErrors), 400);
  }

  const report = await updateReport(id, parsed.data);

  embedAndStore({
    sourceType: "REPORT",
    sourceId: report.id,
    title: report.title,
    text: `${report.title}\n${report.summary}\n${report.content}`,
    metadata: { industry: report.industry, region: report.region, categoryId: report.categoryId },
  }).catch((err) => console.error("RAG ingest failed for report", report.id, err));

  return res.status(200).json({
    status: "ok",
    data: report,
  });
});

// DELETE

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id;

  if (!id || Array.isArray(id)) {
    throw new AppError("Invalid report ID", 400);
  }

  await deleteReport(id);
  removeSource("REPORT", id).catch((err) => console.error("RAG remove failed", id, err));

  return res.status(204).send();
});
