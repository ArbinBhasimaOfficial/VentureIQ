import { Router } from "express";

import {
  getAllUsers,
  changeUserRole,
  deactivateUser,
  reactivateUser,
} from "./admin.controller.js";

import { authenticate, authorize } from "../../middleware/auth.middleware.js";

const router = Router();

router.use(authenticate, authorize("ADMIN"));

router.get("/users", getAllUsers);

router.patch("/users/:id/role", changeUserRole);

router.patch("/users/:id/deactivate", deactivateUser);

router.patch("/users/:id/reactivate", reactivateUser);

export default router;
