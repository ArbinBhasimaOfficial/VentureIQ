import type { Request, Response } from "express";
import path from "node:path";

import { asyncHandler } from "../../utils/asyncHandler.js";
import { AppError } from "../../utils/AppError.js";

import {
  saveFileRecord,
  listFilesForReport,
  getFileById,
  deleteFile,
} from "./upload.service.js";

export const uploadFile = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError(
        "Not authenticated",
        401,
      );
    }

    if (!req.file) {
      throw new AppError(
        "No file was uploaded",
        400,
      );
    }

    const reportId =
      typeof req.body.reportId === "string" &&
      req.body.reportId.trim()
        ? req.body.reportId.trim()
        : undefined;

    const record = await saveFileRecord(
      req.file,
      req.user.userId,
      reportId,
    );

    return res.status(201).json({
      status: "ok",
      data: record,
    });
  },
);

export const getFilesForReport = asyncHandler(
  async (req: Request, res: Response) => {
    const reportId = req.params.reportId;

    if (typeof reportId !== "string" || !reportId.trim()) {
      throw new AppError(
        "Invalid report ID",
        400,
      );
    }

    const files = await listFilesForReport(
      reportId,
    );

    return res.status(200).json({
      status: "ok",
      data: files,
    });
  },
);

export const downloadFile = asyncHandler(
  async (req: Request, res: Response) => {
    const fileId = req.params.id;

    if (typeof fileId !== "string" || !fileId.trim()) {
      throw new AppError("Invalid file ID", 400);
    }

    const file = await getFileById(
      fileId,
    );

    return res.download(
      path.resolve(file.path),
      file.originalName,
    );
  },
);

export const removeFile = asyncHandler(
  async (req: Request, res: Response) => {
    const fileId = req.params.id;

    if (typeof fileId !== "string" || !fileId.trim()) {
      throw new AppError("Invalid file ID", 400);
    }

    await deleteFile(fileId);

    return res.status(204).send();
  },
);