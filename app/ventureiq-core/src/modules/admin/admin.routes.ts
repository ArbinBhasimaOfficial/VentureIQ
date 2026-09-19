
import { Router } from "express";

import {
  getAllUsers,
  changeUserRole,
  deactivateUser,
  reactivateUser,
  createMarketReport,
  uploadMarketReportPdf,
  removeMarketReport,
} from "./admin.controller.js";

import { authenticate, authorize } from "../../middleware/auth.middleware.js";

const router = Router();

router.use(authenticate, authorize("ADMIN"));

// User management
router.get("/users", getAllUsers);

router.patch("/users/:id/role", changeUserRole);

router.patch("/users/:id/deactivate", deactivateUser);

router.patch("/users/:id/reactivate", reactivateUser);

// Report management
router.post("/reports", createMarketReport);

router.post(
  "/reports/:id/pdf",
  uploadMarketReportPdf,
);

router.delete("/reports/:id", removeMarketReport);

export default router;
