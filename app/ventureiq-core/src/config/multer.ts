import multer from "multer";
import path from "node:path";
import crypto from "node:crypto";
import type { Request } from "express";

import { AppError } from "../utils/AppError.js";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "uploads";

const MAX_FILE_SIZE_MB = Number(process.env.MAX_FILE_SIZE_MB || 10);

const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
  "image/png",
  "image/jpeg",
]);

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, UPLOAD_DIR);
  },

  filename: (_req, file, callback) => {
    const uniqueSuffix = crypto.randomBytes(16).toString("hex");

    const extension = path.extname(file.originalname);

    callback(null, `${uniqueSuffix}${extension}`);
  },
});

function fileFilter(
  _req: Request,
  file: Express.Multer.File,
  callback: multer.FileFilterCallback,
) {
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    return callback(
      new AppError(`File type ${file.mimetype} is not allowed`, 400),
    );
  }

  callback(null, true);
}

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
  },
});
