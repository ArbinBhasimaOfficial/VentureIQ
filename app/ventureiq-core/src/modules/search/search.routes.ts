import { Router } from "express";

import { search } from "./search.controller.js";
import {
  optionalAuthenticate,
} from "../../middleware/optionalAuth.middleware.js";

const router = Router();

router.get(
  "/",
  optionalAuthenticate,
  search,
);

export default router;