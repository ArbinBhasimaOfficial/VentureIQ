import { Router } from "express";

import {
  create,
  getAll,
  getOne,
  update,
  remove,
} from "./report.controller.js";

import {
  authenticate,
  authorize,
} from "../../middleware/auth.middleware.js";

import {
  optionalAuthenticate,
} from "../../middleware/optionalAuth.middleware.js";

const router = Router();

// Public / optional authentication
router.get(
  "/",
  optionalAuthenticate,
  getAll,
);

router.get(
  "/:id",
  optionalAuthenticate,
  getOne,
);

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