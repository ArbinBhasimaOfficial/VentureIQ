import type { Request, Response } from "express";

import {
  createResearchSchema,
  updateResearchSchema,
  listResearchQuerySchema,
} from "./research.schema.js";

import {
  createResearch,
  listResearch,
  getResearchById,
  updateResearch,
  deleteResearch,
} from "./research.service.js";

import { asyncHandler } from "../../utils/asyncHandler.js";
import { AppError } from "../../utils/AppError.js";
import { embedAndStore, removeSource } from "../rag/rag.ingest.js";

/**
 * CREATE RESEARCH
 */
export const create = asyncHandler(async (req: Request, res: Response) => {
  const parsed = createResearchSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new AppError(
      `Validation failed: ${JSON.stringify(
        parsed.error.flatten().fieldErrors,
      )}`,
      400,
    );
  }

  if (!req.user?.userId) {
    throw new AppError("Authenticated user not found", 401);
  }

  const research = await createResearch(parsed.data, req.user.userId);

  embedAndStore({
    sourceType: "RESEARCH",
    sourceId: research.id,
    title: research.title,
    text: `${research.title}\n${research.summary}\n${research.content}`,
    metadata: { type: research.type, categoryId: research.categoryId },
  }).catch((err) => console.error("RAG ingest failed for research", research.id, err));

  return res.status(201).json({
    status: "ok",
    data: research,
  });
});

/**
 * GET ALL RESEARCH
 */
export const getAll = asyncHandler(async (req: Request, res: Response) => {
  const parsed = listResearchQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    throw new AppError(
      `Validation failed: ${JSON.stringify(
        parsed.error.flatten().fieldErrors,
      )}`,
      400,
    );
  }

  const isAdmin = req.user?.role === "ADMIN";

  const result = await listResearch(parsed.data, !isAdmin);

  return res.status(200).json({
    status: "ok",
    data: result,
  });
});

/**
 * GET RESEARCH BY ID
 */
export const getOne = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (typeof id !== "string" || !id.trim()) {
    throw new AppError("Invalid research ID", 400);
  }

  const isAdmin = req.user?.role === "ADMIN";

  const research = await getResearchById(id, !isAdmin);

  return res.status(200).json({
    status: "ok",
    data: research,
  });
});

/**
 * UPDATE RESEARCH
 */
export const update = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (typeof id !== "string" || !id.trim()) {
    throw new AppError("Invalid research ID", 400);
  }

  const parsed = updateResearchSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new AppError(
      `Validation failed: ${JSON.stringify(
        parsed.error.flatten().fieldErrors,
      )}`,
      400,
    );
  }

  const research = await updateResearch(id, parsed.data);

  embedAndStore({
    sourceType: "RESEARCH",
    sourceId: research.id,
    title: research.title,
    text: `${research.title}\n${research.summary}\n${research.content}`,
    metadata: { type: research.type, categoryId: research.categoryId },
  }).catch((err) => console.error("RAG ingest failed for research", research.id, err));

  return res.status(200).json({
    status: "ok",
    data: research,
  });
});

/**
 * DELETE RESEARCH
 */
export const remove = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (typeof id !== "string" || !id.trim()) {
    throw new AppError("Invalid research ID", 400);
  }

  await deleteResearch(id);
  removeSource("RESEARCH", id).catch((err) => console.error("RAG remove failed", id, err));

  return res.status(204).send();
});
