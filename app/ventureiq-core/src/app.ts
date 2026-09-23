import os from "node:os";
import express from "express";
import helmet from "helmet";
import cors from "cors";

import authRouter from "./modules/auth/auth.routes.js";
import categoryRoutes from "./modules/category/category.routes.js";
import reportRoutes from "./modules/report/report.routes.js";
import datasetRoutes from "./modules/dataset/dataset.routes.js";
import searchRoutes from "./modules/search/search.routes.js";
import ingestionRoutes from "./modules/ingestion/ingestion.routes.js";
import companyRoutes from "./modules/company/company.routes.js";
import alertRoutes from "./modules/alert/alert.routes.js";
import adminRoutes from "./modules/admin/admin.routes.js";
import analyticsRoutes from "./modules/analytics/analytic.routes.js";
import { AppError } from "./utils/AppError.js";
import uploadRoutes from "./modules/uploads/upload.route.js";
import { requestLogger } from "./middleware/requestlogger.middleware.js";
import trendRoutes from "./modules/trends/trends.routes.js";
import researchRoutes from "./modules/research/research.routes.js";

import {
  notFoundHandler,
  errorHandler,
} from "./middleware/errorHandler.middleware.js";

import { generalRateLimit } from "./middleware/ratelimit.middleware.js";

const app = express();

app.disable("etag");

const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(helmet());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new AppError("CORS origin not allowed", 403), false);
    },
    credentials: true,
  }),
);
app.use(requestLogger);
app.use(express.json());

app.use(generalRateLimit);

app.get("/whoami", (_req, res) => {
  res.json({
    instance: os.hostname(),
  });
});
app.get("/", (_req, res) => {
  res.json({
    status: "ok",
    message: "VentureIQ Core API is running",
  });
});

app.use("/api/v1/auth", authRouter);

app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/trends", trendRoutes);
app.use("/api/v1/reports", reportRoutes);

app.use("/api/v1/datasets", datasetRoutes);

app.use("/api/v1/uploads", uploadRoutes);
app.use("/api/v1/search", searchRoutes);
app.use("/api/ingest", ingestionRoutes);

app.use("/api/companies", companyRoutes);

app.use("/api/alerts", alertRoutes);

app.use("/api/admin", adminRoutes);

app.use("/api/analytics", analyticsRoutes);
app.use("/api/v1/research", researchRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
