import type { Request, Response, NextFunction } from "express";
import multer from "multer";

import { AppError } from "../utils/AppError.js";
import logger from "../config/logger.js";

export function notFoundHandler(req: Request, res: Response) {
  return res.status(404).json({
    status: "error",
    message: `Route ${req.method} ${req.path} not found`,
  });
}

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error(
        {
          err,
          method: req.method,
          url: req.originalUrl,
        },
        err.message,
      );
    }

    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
    });
  }

  if (err instanceof multer.MulterError) {
    logger.warn(
      {
        err,
        method: req.method,
        url: req.originalUrl,
      },
      "Multer upload error",
    );

    return res.status(400).json({
      status: "error",
      message: `Upload error: ${err.message}`,
    });
  }

  logger.error(
    {
      err,
      method: req.method,
      url: req.originalUrl,
    },
    "Unhandled error",
  );

  return res.status(500).json({
    status: "error",
    message: "Something went wrong. Please try again later.",
  });
}
