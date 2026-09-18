import type { Request, Response, NextFunction } from "express";

import jwt from "jsonwebtoken";

export function optionalAuthenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next();
  }

  const token = authHeader.slice(7).trim();

  if (!token) {
    return next();
  }

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, secret);

    if (
      typeof decoded !== "object" ||
      decoded === null ||
      typeof decoded.userId !== "string" ||
      (decoded.role !== "USER" && decoded.role !== "ADMIN")
    ) {
      return next();
    }

    (
      req as Request & {
        user: {
          userId: string;
          role: "USER" | "ADMIN";
        };
      }
    ).user = {
      userId: decoded.userId,
      role: decoded.role,
    };
  } catch {
    // Invalid token is ignored because authentication
    // is optional for this route.
  }

  next();
}
