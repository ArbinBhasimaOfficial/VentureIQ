import type { Request, Response } from "express";

import {
  getReportsByCategory,
  getReportsByIndustry,
  getPublishingTrend,
  getOverviewStats,
  getTopSubscribedCategories,
} from "./analytic.service.js";

export async function overview(req: Request, res: Response) {
  const data = await getOverviewStats();

  return res.status(200).json({
    status: "ok",
    data,
  });
}

export async function byCategory(req: Request, res: Response) {
  const data = await getReportsByCategory();

  return res.status(200).json({
    status: "ok",
    data,
  });
}

export async function byIndustry(req: Request, res: Response) {
  const data = await getReportsByIndustry();

  return res.status(200).json({
    status: "ok",
    data,
  });
}

export async function trend(req: Request, res: Response) {
  const months = req.query.months ? Number(req.query.months) : 6;

  if (!Number.isFinite(months) || months < 1 || months > 24) {
    return res.status(400).json({
      status: "error",
      message: "months must be between 1 and 24",
    });
  }

  const data = await getPublishingTrend(months);

  return res.status(200).json({
    status: "ok",
    data,
  });
}

export async function topSubscribed(req: Request, res: Response) {
  const limit = req.query.limit ? Number(req.query.limit) : 5;

  if (!Number.isFinite(limit) || limit < 1 || limit > 50) {
    return res.status(400).json({
      status: "error",
      message: "limit must be between 1 and 50",
    });
  }

  const data = await getTopSubscribedCategories(limit);

  return res.status(200).json({
    status: "ok",
    data,
  });
}
