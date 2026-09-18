import { Router } from "express";

import { search } from "./search.controller.js";

import { optionalAuthenticate } from "../../middleware/optionalAuth.middleware.js";

import { searchRateLimit } from "../../middleware/ratelimit.middleware.js";

const router = Router();

router.get("/", optionalAuthenticate, searchRateLimit, search);

export default router;
