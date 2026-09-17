import { Router } from "express";

import {
  create,
  getAll,
  getOne,
  update,
  remove,
} from "./category.controller.js";

import {
  authenticate,
  authorize,
} from "../../middleware/auth.middleware.js";

const router = Router();

// Public routes
router.get("/", getAll);
router.get("/:id", getOne);

// Admin-only routes
router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  create,
);

router.patch(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  update,
);

router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  remove,
);

export default router;