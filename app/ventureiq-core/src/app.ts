import express from "express";
import { db } from "./prisma/db";
import authRouter from "./modules/auth/auth.routes";
const app = express();

app.use(express.json());

app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok", message: "Core is booting" });
});

app.get("/db-health", async (_req, res) => {
    try {
        const users = await db.orm.public.User
        .select("id")
        .all();
        res.status(200).json({
            status: "ok",
            userCount: users.length,
        });
        // console.log("Database is booted with Core.");            
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error instanceof Error ? error.message : "Unknown error",
        })
    }
})

app.get("/", (_req, res) => {
  res.json({
    status: "ok",
    message: "VentureIQ Core API is running",
  });
});

app.use("/api/v1", authRouter);

export default app;