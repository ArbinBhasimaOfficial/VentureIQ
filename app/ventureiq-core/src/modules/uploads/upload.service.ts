import fs from "node:fs/promises";

import { db } from "../../prisma/db.js";
import { AppError } from "../../utils/AppError.js";

const UploadedFile = db.orm.public!.UploadedFile!;
const MarketReport = db.orm.public!.MarketReport!;

export async function saveFileRecord(
  file: Express.Multer.File,
  uploadedById: string,
  reportId?: string,
) {
  if (reportId) {
    const report = await MarketReport.where({ id: reportId }).all().first();

    if (!report) {
      await fs.unlink(file.path).catch(() => {});

      throw new AppError("Report not found", 404);
    }
  }

  return UploadedFile.create({
    originalName: file.originalname,
    storedName: file.filename,
    mimeType: file.mimetype,
    size: file.size,
    path: file.path,
    uploadedById,
    reportId: reportId ?? null,
  });
}

export async function listFilesForReport(reportId: string) {
  return UploadedFile.where({ reportId })
    .orderBy((file) => file.createdAt.desc())
    .all();
}

export async function getFileById(id: string) {
  const file = await UploadedFile.where({ id }).all().first();

  if (!file) {
    throw new AppError("File not found", 404);
  }

  return file;
}

export async function deleteFile(id: string) {
  const file = await UploadedFile.where({ id }).all().first();

  if (!file) {
    throw new AppError("File not found", 404);
  }

  await fs.unlink(file.path).catch(() => {});

  await UploadedFile.where({ id }).delete();
}
