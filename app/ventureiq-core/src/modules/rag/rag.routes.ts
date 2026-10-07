import { Router } from "express";
import { ask } from "./rag.service.js";

const router = Router();

router.post("/ask", async (req, res, next) => {
  try {
    const { question } = req.body ?? {};

    if (!question || typeof question !== "string" || question.trim().length < 3) {
      return res.status(400).json({ status: "error", message: "question is required" });
    }

    const result = await ask(question.trim());
    res.json({ status: "ok", data: result });
  } catch (err: any) {
    res.status(500).json({ status: "error", message: err?.message ?? "Unknown error" });
  }
});

export default router;
