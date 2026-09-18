import type { Request, Response, NextFunction } from "express";

export function ingestionAuth(req: Request, res: Response, next: NextFunction) {
  const configuredKey = process.env.INGESTION_API_KEY;

  const providedKey = req.headers["x-api-key"];

  if (
    !configuredKey ||
    typeof providedKey !== "string" ||
    providedKey !== configuredKey
  ) {
    return res.status(401).json({
      status: "error",
      message: "Invalid or missing API key",
    });
  }

  next();
}
