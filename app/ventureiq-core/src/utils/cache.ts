import redis from "../config/redis.js";

const DEFAULT_TTL_SECONDS = 300;

export async function getOrSetCache<T>(
  key: string,
  ttlSeconds: number,
  fetchFn: () => Promise<T>,
): Promise<T> {
  try {
    const cached = await redis.get(key);

    if (cached !== null) {
      console.log(`Cache HIT: ${key}`);

      return JSON.parse(cached) as T;
    }

    console.log(`Cache MISS: ${key}`);
  } catch (error) {
    console.error(
      `Redis GET failed for ${key}:`,
      error instanceof Error ? error.message : error,
    );
  }

  const fresh = await fetchFn();

  try {
    await redis.set(
      key,
      JSON.stringify(fresh),
      "EX",
      ttlSeconds || DEFAULT_TTL_SECONDS,
    );

    console.log(`Cache SET: ${key}`);
  } catch (error) {
    console.error(
      `Redis SET failed for ${key}:`,
      error instanceof Error ? error.message : error,
    );
  }

  return fresh;
}

export async function invalidateCache(
  pattern: string,
): Promise<void> {
  try {
    const keys = await redis.keys(pattern);

    if (keys.length === 0) {
      return;
    }

    await redis.del(...keys);

    console.log(
      `Cache invalidated: ${keys.length} key(s) matching ${pattern}`,
    );
  } catch (error) {
    console.error(
      `Redis invalidation failed for ${pattern}:`,
      error instanceof Error ? error.message : error,
    );
  }
}