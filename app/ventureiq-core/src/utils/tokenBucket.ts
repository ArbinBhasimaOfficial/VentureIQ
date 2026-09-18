import redis from "../config/redis.js";

export class TokenBucket {
  private readonly capacity: number;
  private readonly refillRate: number;

  constructor(
    capacity: number,
    refillRatePerSecond: number,
  ) {
    if (
      !Number.isInteger(capacity) ||
      capacity <= 0
    ) {
      throw new Error(
        "Capacity must be a positive integer",
      );
    }

    if (
      !Number.isFinite(refillRatePerSecond) ||
      refillRatePerSecond <= 0
    ) {
      throw new Error(
        "Refill rate must be a positive number",
      );
    }

    this.capacity = capacity;
    this.refillRate = refillRatePerSecond;
  }

  async consume(
    identifier: string,
    tokensRequested = 1,
  ): Promise<boolean> {
    if (
      !Number.isFinite(tokensRequested) ||
      tokensRequested <= 0
    ) {
      return false;
    }

    const key = `ratelimit:token-bucket:${identifier}`;
    const now = Date.now();

    const luaScript = `
      local tokens =
        tonumber(redis.call("HGET", KEYS[1], "tokens"))

      local lastRefill =
        tonumber(redis.call("HGET", KEYS[1], "lastRefill"))

      local capacity = tonumber(ARGV[1])
      local refillRate = tonumber(ARGV[2])
      local now = tonumber(ARGV[3])
      local requested = tonumber(ARGV[4])

      if tokens == nil or lastRefill == nil then
        tokens = capacity
        lastRefill = now
      end

      local elapsed =
        (now - lastRefill) / 1000

      local tokensToAdd =
        elapsed * refillRate

      tokens = math.min(
        capacity,
        tokens + tokensToAdd
      )

      local allowed = 0

      if tokens >= requested then
        tokens = tokens - requested
        allowed = 1
      end

      redis.call(
        "HSET",
        KEYS[1],
        "tokens",
        tokens,
        "lastRefill",
        now
      )

      redis.call(
        "EXPIRE",
        KEYS[1],
        3600
      )

      return allowed
    `;

    const result = await redis.eval(
      luaScript,
      1,
      key,
      this.capacity,
      this.refillRate,
      now,
      tokensRequested,
    );

    return Number(result) === 1;
  }

  async getRemainingTokens(
    identifier: string,
  ): Promise<number> {
    const key = `ratelimit:token-bucket:${identifier}`;

    const bucket = await redis.hgetall(key);

    if (
      !bucket.tokens ||
      !bucket.lastRefill
    ) {
      return this.capacity;
    }

    const tokens = Number(bucket.tokens);
    const lastRefill = Number(bucket.lastRefill);

    const now = Date.now();

    const elapsedSeconds =
      (now - lastRefill) / 1000;

    const tokensToAdd =
      elapsedSeconds * this.refillRate;

    return Math.floor(
      Math.min(
        this.capacity,
        tokens + tokensToAdd,
      ),
    );
  }
}