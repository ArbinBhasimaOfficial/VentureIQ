import fs from "node:fs/promises";

import { db } from "../../prisma/db.js";
import { AppError } from "../../utils/AppError.js";
import { uploadToSupabase, deleteFromSupabase } from "../../utils/supabase.js";

const UploadedFile = db.orm.public!.UploadedFile!;
const MarketReport = db.orm.public!.MarketReport!;
const Research = db.orm.public!.Research!;

export async function saveFileRecord(
  file: Express.Multer.File,
  uploadedById: string,
  reportId?: string,
  researchId?: string,
) {
  if (reportId) {
    const report = await MarketReport.where({ id: reportId }).all().first();

    if (!report) {
      await fs.unlink(file.path).catch(() => {});

      throw new AppError("Report not found", 404);
    }
  }

  if (researchId) {
    const research = await Research.where({ id: researchId }).all().first();

    if (!research) {
      await fs.unlink(file.path).catch(() => {});

      throw new AppError("Research not found", 404);
    }
  }

  let storedPath = file.path;

  // PDFs go to Supabase Storage; other file types stay on local disk
  if (file.mimetype === "application/pdf") {
    const supabaseUrl = await uploadToSupabase(file.path, file.filename, file.mimetype);
    if (supabaseUrl) {
      storedPath = supabaseUrl;
    }
  }

  return UploadedFile.create({
    originalName: file.originalname,
    storedName: file.filename,
    mimeType: file.mimetype,
    size: file.size,
    path: storedPath,
    uploadedById,
    reportId: reportId ?? null,
    researchId: researchId ?? null,
  });
}

export async function listFilesForReport(reportId: string) {
  return UploadedFile.where({ reportId })
    .orderBy((file) => file.createdAt.desc())
    .all();
}

export async function listFilesForResearch(researchId: string) {
  return UploadedFile.where({ researchId })
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

  if (file.path.startsWith(`${process.env.UPLOAD_DIR || "uploads"}`) || file.mimeType === "application/pdf") {
    if (file.path.startsWith("http")) {
      await deleteFromSupabase(file.path).catch(() => {});
    } else {
      await fs.unlink(file.path).catch(() => {});
    }
  }

  await UploadedFile.where({ id }).delete();
}
