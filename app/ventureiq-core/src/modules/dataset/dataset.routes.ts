import { Router } from "express";

import {
  create,
  getAll,
  getOne,
  update,
  remove,
} from "./dataset.controller.js";

import {
  authenticate,
  authorize,
} from "../../middleware/auth.middleware.js";

const router = Router();

// Public
router.get("/", getAll);

router.get("/:id", getOne);

// Admin only
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