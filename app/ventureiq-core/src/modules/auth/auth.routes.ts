import { Router } from "express";
import { getMe, login, register } from "./auth.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";

const authRouter = Router();

authRouter.post("/auth/register", register);
authRouter.post("/auth/login", login);
authRouter.get("/auth/me", authenticate, getMe);

export default authRouter;