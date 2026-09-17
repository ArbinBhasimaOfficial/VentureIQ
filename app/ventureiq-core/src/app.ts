import express from "express";

import authRouter from "./modules/auth/auth.routes.js";
import categoryRoutes from "./modules/category/category.routes.js";
import reportRoutes from "./modules/report/report.routes.js";
import datasetRoutes from "./modules/dataset/dataset.routes.js";
const app = express();

app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    status: "ok",
    message: "VentureIQ Core API is running",
  });
});

app.use("/api/v1", authRouter);

app.use(
  "/api/v1/categories",
  categoryRoutes,
);

app.use(
  "/api/v1/reports",
  reportRoutes,
);

app.use(
  "/api/v1/datasets",
  datasetRoutes,
);

export default app;