import { db } from "../../prisma/db.js";

import type {
  CreateSubscriptionInput,
  ListAlertsQuery,
} from "./alert.schema.js";

import { AppError } from "../../utils/AppError.js";

const AlertSubscription = db.orm.public!.AlertSubscription!;

const Alert = db.orm.public!.Alert!;

const MarketCategory = db.orm.public!.MarketCategory!;

const MarketReport = db.orm.public!.MarketReport!;

// Create a subscription

export async function createSubscription(
  userId: string,
  input: CreateSubscriptionInput,
) {
  if (input.categoryId) {
    const category = await MarketCategory.where({
      id: input.categoryId,
    })
      .all()
      .first();

    if (!category) {
      throw new AppError("Category not found", 404);
    }
  }

  const existingSubscriptions = await AlertSubscription.where({ userId }).all();

  const duplicate = existingSubscriptions.some(
    (subscription) =>
      subscription.categoryId === (input.categoryId ?? null) &&
      subscription.industry === (input.industry ?? null),
  );

  if (duplicate) {
    throw new AppError("Subscription already exists", 409);
  }

  return AlertSubscription.create({
    userId,
    categoryId: input.categoryId ?? null,
    industry: input.industry ?? null,
  });
}

// List subscriptions belonging to a user

export async function listUserSubscriptions(userId: string) {
  return AlertSubscription.where({ userId })
    .orderBy((subscription) => subscription.createdAt.desc())
    .all();
}

// Delete a user's subscription

export async function deleteSubscription(
  userId: string,
  subscriptionId: string,
) {
  const subscription = await AlertSubscription.where({
    id: subscriptionId,
  })
    .all()
    .first();

  if (!subscription) {
    throw new AppError("Subscription not found", 404);
  }

  if (subscription.userId !== userId) {
    throw new AppError("Not your subscription", 403);
  }

  return AlertSubscription.where({
    id: subscriptionId,
  }).delete();
}

// Generate alerts when a report is published

export async function generateAlertsForReport(reportId: string) {
  const report = await MarketReport.where({
    id: reportId,
  })
    .all()
    .first();

  if (!report || report.status !== "PUBLISHED") {
    return;
  }

  const subscriptions = await AlertSubscription.where({
    categoryId: report.categoryId,
  }).all();

  const industrySubscriptions = await AlertSubscription.where({
    industry: report.industry,
  }).all();

  const matchingUserIds = new Set<string>();

  for (const subscription of subscriptions) {
    matchingUserIds.add(subscription.userId);
  }

  for (const subscription of industrySubscriptions) {
    matchingUserIds.add(subscription.userId);
  }

  if (matchingUserIds.size === 0) {
    return;
  }

  const category = await MarketCategory.where({
    id: report.categoryId,
  })
    .all()
    .first();

  const categoryName = category?.name ?? "Unknown Category";

  for (const userId of matchingUserIds) {
    const existingAlerts = await Alert.where({
      userId,
      reportId: report.id,
    }).all();

    if (existingAlerts.length > 0) {
      continue;
    }

    await Alert.create({
      userId,
      reportId: report.id,
      message: `New report published in ${categoryName}: "${report.title}"`,
      isRead: false,
    });
  }
}

// List alerts for a user with pagination

export async function listUserAlerts(userId: string, query: ListAlertsQuery) {
  const { page, limit, unreadOnly } = query;

  const allAlerts = await Alert.where({ userId })
    .orderBy((alert) => alert.createdAt.desc())
    .all();

  const filteredAlerts = unreadOnly
    ? allAlerts.filter((alert) => !alert.isRead)
    : allAlerts;

  const total = filteredAlerts.length;

  const unreadCount = allAlerts.filter((alert) => !alert.isRead).length;

  const skip = (page - 1) * limit;

  const alerts = filteredAlerts.slice(skip, skip + limit);

  return {
    alerts,
    unreadCount,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// Mark an alert as read

export async function markAlertRead(userId: string, alertId: string) {
  const alert = await Alert.where({
    id: alertId,
  })
    .all()
    .first();

  if (!alert) {
    throw new AppError("Alert not found", 404);
  }

  if (alert.userId !== userId) {
    throw new AppError("Not your alert", 403);
  }

  return Alert.where({
    id: alertId,
  }).update({
    isRead: true,
  });
}
