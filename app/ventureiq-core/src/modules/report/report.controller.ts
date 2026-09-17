import type {
  Request,
  Response,
} from "express";

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

// CREATE
export async function create(
  req: Request,
  res: Response,
) {
  const parsed =
    createReportSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      status: "error",
      errors:
        parsed.error.flatten().fieldErrors,
    });
  }

  if (!req.user) {
    return res.status(401).json({
      status: "error",
      message: "Not authenticated",
    });
  }

  try {
    const report = await createReport(
      parsed.data,
      req.user.userId,
    );

    return res.status(201).json({
      status: "ok",
      data: report,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "";

    if (
      message === "CATEGORY_NOT_FOUND"
    ) {
      return res.status(404).json({
        status: "error",
        message: "Category not found",
      });
    }

    if (
      message === "REPORT_SLUG_EXISTS"
    ) {
      return res.status(409).json({
        status: "error",
        message:
          "A report with this title already exists",
      });
    }

    if (
      message === "INVALID_REPORT_TITLE"
    ) {
      return res.status(400).json({
        status: "error",
        message: "Invalid report title",
      });
    }

    console.error(error);

    return res.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  }
}

// GET ALL
export async function getAll(
  req: Request,
  res: Response,
) {
  const parsed =
    listReportsQuerySchema.safeParse(
      req.query,
    );

  if (!parsed.success) {
    return res.status(400).json({
      status: "error",
      errors:
        parsed.error.flatten().fieldErrors,
    });
  }

  try {
    const isAdmin =
      req.user?.role === "ADMIN";

    const result = await listReports(
      parsed.data,
      !isAdmin,
    );

    return res.status(200).json({
      status: "ok",
      ...result,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      status: "error",
      message: "Failed to fetch reports",
    });
  }
}

// GET ONE
export async function getOne(
  req: Request,
  res: Response,
) {
  const id = req.params.id;

  if (!id || Array.isArray(id)) {
    return res.status(400).json({
      status: "error",
      message: "Invalid report ID",
    });
  }

  const isAdmin =
    req.user?.role === "ADMIN";

  try {
    const report =
      await getReportById(
        id,
        !isAdmin,
      );

    return res.status(200).json({
      status: "ok",
      data: report,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "REPORT_NOT_FOUND"
    ) {
      return res.status(404).json({
        status: "error",
        message: "Report not found",
      });
    }

    console.error(error);

    return res.status(500).json({
      status: "error",
      message: "Failed to fetch report",
    });
  }
}

// UPDATE
export async function update(
  req: Request,
  res: Response,
) {
  const id = req.params.id;

  if (!id || Array.isArray(id)) {
    return res.status(400).json({
      status: "error",
      message: "Invalid report ID",
    });
  }

  const parsed =
    updateReportSchema.safeParse(
      req.body,
    );

  if (!parsed.success) {
    return res.status(400).json({
      status: "error",
      errors:
        parsed.error.flatten().fieldErrors,
    });
  }

  try {
    const report =
      await updateReport(
        id,
        parsed.data,
      );

    return res.status(200).json({
      status: "ok",
      data: report,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "";

    if (
      message === "REPORT_NOT_FOUND"
    ) {
      return res.status(404).json({
        status: "error",
        message: "Report not found",
      });
    }

    if (
      message === "CATEGORY_NOT_FOUND"
    ) {
      return res.status(404).json({
        status: "error",
        message: "Category not found",
      });
    }

    if (
      message === "REPORT_SLUG_EXISTS"
    ) {
      return res.status(409).json({
        status: "error",
        message:
          "A report with this title already exists",
      });
    }

    console.error(error);

    return res.status(500).json({
      status: "error",
      message: "Failed to update report",
    });
  }
}

// DELETE
export async function remove(
  req: Request,
  res: Response,
) {
  const id = req.params.id;

  if (!id || Array.isArray(id)) {
    return res.status(400).json({
      status: "error",
      message: "Invalid report ID",
    });
  }

  try {
    await deleteReport(id);

    return res.status(204).send();
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "REPORT_NOT_FOUND"
    ) {
      return res.status(404).json({
        status: "error",
        message: "Report not found",
      });
    }

    console.error(error);

    return res.status(500).json({
      status: "error",
      message: "Failed to delete report",
    });
  }
}