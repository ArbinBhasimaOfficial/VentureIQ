import { Router } from "express";

import {
  subscribe,
  getSubscriptions,
  unsubscribe,
  getAlerts,
  markRead,
} from "./alert.controller.js";

import { authenticate } from "../../middleware/auth.middleware.js";

const router = Router();

// All alert routes require authentication
router.use(authenticate);

// Subscription routes
router.post("/subscriptions", subscribe);
router.get("/subscriptions", getSubscriptions);
router.delete("/subscriptions/:id", unsubscribe);

// Alert routes
router.get("/", getAlerts);
router.patch("/:id/read", markRead);

export default router;
