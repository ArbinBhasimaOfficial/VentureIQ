import { Router } from "express";

import { ingest } from "./ingestion.controller.js";

import { ingestionAuth } from "../../middleware/ingestionAuth.middleware.js";

const router = Router();

router.post("/reports", ingestionAuth, ingest);

export default router;
