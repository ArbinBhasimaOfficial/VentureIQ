import type { Request, Response } from "express";

import {
  listUsersQuerySchema,
  updateUserRoleSchema,
  createReportSchema,
} from "./admin.schema.js";

import {
  listUsers,
  updateUserRole,
  setUserActiveStatus,
  createReport,
  deleteReport,
} from "./admin.service.js";

import { uploadReportPdf } from "./admin.service.js";

export async function getAllUsers(req: Request, res: Response) {
  const parsed = listUsersQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    return res.status(400).json({
      status: "error",
      errors: parsed.error.flatten().fieldErrors,
    });
  }

  const result = await listUsers(parsed.data);

  return res.status(200).json({
    status: "ok",
    ...result,
  });
}

export async function changeUserRole(req: Request, res: Response) {
  const parsed = updateUserRoleSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      status: "error",
      errors: parsed.error.flatten().fieldErrors,
    });
  }

  try {
    const user = await updateUserRole(
      req.params.id as string,
      req.user!.userId,
      parsed.data,
    );

    return res.status(200).json({
      status: "ok",
      data: user,
    });
  } catch (error) {
    const message = (error as Error).message;

    if (message === "CANNOT_MODIFY_SELF") {
      return res.status(400).json({
        status: "error",
        message: "You cannot change your own role",
      });
    }

    if (message === "USER_NOT_FOUND") {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    console.error("Change user role error:", error);

    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
}

export async function deactivateUser(req: Request, res: Response) {
  try {
    const user = await setUserActiveStatus(
      req.params.id as string,
      req.user!.userId,
      false,
    );

    return res.status(200).json({
      status: "ok",
      data: user,
    });
  } catch (error) {
    const message = (error as Error).message;

    if (message === "CANNOT_MODIFY_SELF") {
      return res.status(400).json({
        status: "error",
        message: "You cannot deactivate your own account",
      });
    }

    if (message === "USER_NOT_FOUND") {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    console.error("Deactivate user error:", error);

    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
}

export async function reactivateUser(req: Request, res: Response) {
  try {
    const user = await setUserActiveStatus(
      req.params.id as string,
      req.user!.userId,
      true,
    );

    return res.status(200).json({
      status: "ok",
      data: user,
    });
  } catch (error) {
    const message = (error as Error).message;

    if (message === "USER_NOT_FOUND") {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    console.error("Reactivate user error:", error);

    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
}

/**
 * Create a new market report
 */
export async function createMarketReport(req: Request, res: Response) {
  const parsed = createReportSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      status: "error",
      errors: parsed.error.flatten().fieldErrors,
    });
  }

  try {
    const report = await createReport(
      req.user!.userId,
      parsed.data,
    );

    return res.status(201).json({
      status: "ok",
      message: "Market report created successfully",
      data: report,
    });
  } catch (error) {
    const message = (error as Error).message;

    if (message === "CATEGORY_NOT_FOUND") {
      return res.status(404).json({
        status: "error",
        message: "Market category not found",
      });
    }

    if (message === "REPORT_SLUG_EXISTS") {
      return res.status(409).json({
        status: "error",
        message: "A report with this slug already exists",
      });
    }

    console.error("Create market report error:", error);

    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
}

/**
 * Upload a PDF file for an existing market report
 */
export async function uploadMarketReportPdf(
  req: Request,
  res: Response,
) {
  try {
    const reportId = req.params.id as string;

    if (!req.file) {
      return res.status(400).json({
        status: "error",
        message: "PDF file is required",
      });
    }

    const file = await uploadReportPdf(
      reportId,
      req.user!.userId,
      req.file,
    );

    return res.status(201).json({
      status: "ok",
      message: "Report PDF uploaded successfully",
      data: file,
    });
  } catch (error) {
    const message = (error as Error).message;

    if (message === "REPORT_NOT_FOUND") {
      return res.status(404).json({
        status: "error",
        message: "Market report not found",
      });
    }

    if (message === "INVALID_FILE_TYPE") {
      return res.status(400).json({
        status: "error",
        message: "Only PDF files are allowed",
      });
    }

    if (message === "FILE_TOO_LARGE") {
      return res.status(400).json({
        status: "error",
        message: "PDF file is too large",
      });
    }

    console.error("Upload report PDF error:", error);

    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
}

/**
 * Delete a market report
 */
export async function removeMarketReport(
  req: Request,
  res: Response,
) {
  try {
    const reportId = req.params.id as string;

    await deleteReport(
      reportId,
      req.user!.userId,
    );

    return res.status(200).json({
      status: "ok",
      message: "Market report deleted successfully",
    });
  } catch (error) {
    const message = (error as Error).message;

    if (message === "REPORT_NOT_FOUND") {
      return res.status(404).json({
        status: "error",
        message: "Market report not found",
      });
    }

    console.error("Delete market report error:", error);

    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
}
