import type {
  Request,
  Response,
  NextFunction,
} from "express";

import { TokenBucket } from "../utils/tokenBucket.js";

/**
 * General API:
 * Capacity: 20 requests
 * Refill: 5 tokens per second
 */
const generalBucket = new TokenBucket(20, 5);

/**
 * Search API:
 * Capacity: 10 requests
 * Refill: 1 token per second
 */
const searchBucket = new TokenBucket(10, 1);

function getIdentifier(req: Request): string {
  return (
    req.user?.userId ??
    req.ip ??
    "unknown"
  );
}

function setRateLimitHeader(
  res: Response,
  remainingTokens: number,
): void {
  res.setHeader(
    "X-RateLimit-Remaining",
    remainingTokens.toString(),
  );
}

export async function generalRateLimit(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const identifier = getIdentifier(req);

  const allowed = await generalBucket.consume(
    identifier,
    1,
  );

  const remaining =
    await generalBucket.getRemainingTokens(
      identifier,
    );

  setRateLimitHeader(
    res,
    remaining,
  );

  if (!allowed) {
    return res.status(429).json({
      status: "error",
      message:
        "Too many requests. Please slow down.",
    });
  }

  next();
}

export async function searchRateLimit(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const identifier = getIdentifier(req);

  const allowed = await searchBucket.consume(
    identifier,
    1,
  );

  const remaining =
    await searchBucket.getRemainingTokens(
      identifier,
    );

  setRateLimitHeader(
    res,
    remaining,
  );

  if (!allowed) {
    return res.status(429).json({
      status: "error",
      message:
        "Search rate limit exceeded. Please wait before searching again.",
    });
  }

  next();
}