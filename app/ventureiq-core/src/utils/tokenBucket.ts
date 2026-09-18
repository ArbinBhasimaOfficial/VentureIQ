interface Bucket {
  tokens: number;
  lastRefill: number;
}

export class TokenBucket {
  private readonly buckets: Map<string, Bucket>;
  private readonly capacity: number;
  private readonly refillRate: number;

  constructor(capacity: number, refillRatePerSecond: number) {
    if (!Number.isInteger(capacity) || capacity <= 0) {
      throw new Error("Capacity must be a positive integer");
    }

    if (!Number.isFinite(refillRatePerSecond) || refillRatePerSecond <= 0) {
      throw new Error("Refill rate must be a positive number");
    }

    this.buckets = new Map();
    this.capacity = capacity;
    this.refillRate = refillRatePerSecond;
  }

  private refill(bucket: Bucket): void {
    const now = Date.now();

    const elapsedSeconds = (now - bucket.lastRefill) / 1000;

    const tokensToAdd = elapsedSeconds * this.refillRate;

    bucket.tokens = Math.min(this.capacity, bucket.tokens + tokensToAdd);

    bucket.lastRefill = now;
  }

  consume(identifier: string, tokensRequested = 1): boolean {
    if (!Number.isFinite(tokensRequested) || tokensRequested <= 0) {
      return false;
    }

    let bucket = this.buckets.get(identifier);

    if (!bucket) {
      bucket = {
        tokens: this.capacity,
        lastRefill: Date.now(),
      };

      this.buckets.set(identifier, bucket);
    }

    this.refill(bucket);

    if (bucket.tokens < tokensRequested) {
      return false;
    }

    bucket.tokens -= tokensRequested;

    return true;
  }

  getRemainingTokens(identifier: string): number {
    const bucket = this.buckets.get(identifier);

    if (!bucket) {
      return this.capacity;
    }

    this.refill(bucket);

    return Math.floor(bucket.tokens);
  }
}
