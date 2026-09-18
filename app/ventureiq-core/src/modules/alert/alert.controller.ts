import type { Request, Response } from "express";

import {
  createSubscriptionSchema,
  listAlertsQuerySchema,
} from "./alert.schema.js";

import {
  createSubscription,
  listUserSubscriptions,
  deleteSubscription,
  listUserAlerts,
  markAlertRead,
} from "./alert.service.js";

import { AppError } from "../../utils/AppError.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

// CREATE SUBSCRIPTION

export const subscribe = asyncHandler(async (req: Request, res: Response) => {
  const parsed = createSubscriptionSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new AppError(JSON.stringify(parsed.error.flatten().fieldErrors), 400);
  }

  if (!req.user) {
    throw new AppError("Not authenticated", 401);
  }

  const subscription = await createSubscription(req.user.userId, parsed.data);

  return res.status(201).json({
    status: "ok",
    data: subscription,
  });
});

// GET USER SUBSCRIPTIONS

export const getSubscriptions = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError("Not authenticated", 401);
    }

    const subscriptions = await listUserSubscriptions(req.user.userId);

    return res.status(200).json({
      status: "ok",
      data: subscriptions,
    });
  },
);

// DELETE SUBSCRIPTION

export const unsubscribe = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id;

  if (!id || Array.isArray(id)) {
    throw new AppError("Invalid subscription ID", 400);
  }

  if (!req.user) {
    throw new AppError("Not authenticated", 401);
  }

  await deleteSubscription(req.user.userId, id);

  return res.status(204).send();
});

// GET ALERTS

export const getAlerts = asyncHandler(async (req: Request, res: Response) => {
  const parsed = listAlertsQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    throw new AppError(JSON.stringify(parsed.error.flatten().fieldErrors), 400);
  }

  if (!req.user) {
    throw new AppError("Not authenticated", 401);
  }

  const result = await listUserAlerts(req.user.userId, parsed.data);

  return res.status(200).json({
    status: "ok",
    ...result,
  });
});

// MARK ALERT AS READ

export const markRead = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id;

  if (!id || Array.isArray(id)) {
    throw new AppError("Invalid alert ID", 400);
  }

  if (!req.user) {
    throw new AppError("Not authenticated", 401);
  }

  const alert = await markAlertRead(req.user.userId, id);

  return res.status(200).json({
    status: "ok",
    data: alert,
  });
});
