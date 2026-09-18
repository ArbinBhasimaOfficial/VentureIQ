import { Router } from "express";

import {
  uploadFile,
  getFilesForReport,
  downloadFile,
  removeFile,
} from "./upload.controller.js";

import { authenticate, authorize } from "../../middleware/auth.middleware.js";

import { upload } from "../../config/multer.js";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  upload.single("file"),
  uploadFile,
);

router.get("/report/:reportId", authenticate, getFilesForReport);

router.get("/:id/download", authenticate, downloadFile);

router.delete("/:id", authenticate, authorize("ADMIN"), removeFile);

export default router;
