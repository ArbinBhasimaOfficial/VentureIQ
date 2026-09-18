import { Router } from "express";
import {
  register,
  login,
  getMe,
  updateMe,
  changeMyPassword,
} from "./auth.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);

router.get("/me", authenticate, getMe);

router.patch("/me", authenticate, updateMe);

router.patch("/me/password", authenticate, changeMyPassword);

export default router;
