import { Router } from "express";

import {
  overview,
  byCategory,
  byIndustry,
  trend,
  topSubscribed,
} from "./analytic.controller.js";

import { authenticate, authorize } from "../../middleware/auth.middleware.js";

const router = Router();

router.use(authenticate, authorize("ADMIN"));

router.get("/overview", overview);
router.get("/reports-by-category", byCategory);
router.get("/reports-by-industry", byIndustry);
router.get("/publishing-trend", trend);
router.get("/top-subscribed-categories", topSubscribed);

export default router;
