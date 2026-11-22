interface RateLimitRecord {
  timestamps: number[];
}

/**
 * Sliding Window Rate Limiter for API Route Protection.
 * Default: 20 requests per minute per IP address.
 */
export class SlidingWindowRateLimiter {
  private windowMs: number;
  private maxRequests: number;
  private hits: Map<string, RateLimitRecord>;

  constructor(windowMs = 60000, maxRequests = 20) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    this.hits = new Map();
  }

  isRateLimited(key: string): {
    limited: boolean;
    remaining: number;
    resetMs: number;
  } {
    const now = Date.now();
    const record = this.hits.get(key) || { timestamps: [] };

    // Filter out timestamps outside the active sliding window
    const validTimestamps = record.timestamps.filter(
      (timestamp) => now - timestamp < this.windowMs
    );

    if (validTimestamps.length >= this.maxRequests) {
      const oldest = validTimestamps[0];
      const resetMs = Math.max(0, this.windowMs - (now - oldest));
      return { limited: true, remaining: 0, resetMs };
    }

    validTimestamps.push(now);
    this.hits.set(key, { timestamps: validTimestamps });

    return {
      limited: false,
      remaining: this.maxRequests - validTimestamps.length,
      resetMs: this.windowMs,
    };
  }

  reset(): void {
    this.hits.clear();
  }
}

export const globalRateLimiter = new SlidingWindowRateLimiter(60000, 20);
