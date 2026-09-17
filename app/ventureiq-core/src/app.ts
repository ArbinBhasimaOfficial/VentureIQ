import express from "express";
import authRouter from "./modules/auth/auth.routes.js";

const app = express();

app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    status: "ok",
    message: "VentureIQ Core API is running",
  });
});

app.use("/api/v1", authRouter);

export default app;