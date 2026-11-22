interface RateLimitRecord {
  timestamps: number[];
}

/**
 * Sliding Window Rate Limiter for API Route Protection.
 *
 * Tracks request counts per key (e.g. client IP) within a rolling time window
 * using an in-memory Map. Timestamps outside the window are pruned on each
 * call so memory stays bounded.
 *
 * @example
 * const limiter = new SlidingWindowRateLimiter(60_000, 20);
 * const { limited } = limiter.isRateLimited("127.0.0.1");
 *
 * @remarks
 * **Important:** This limiter is in-process and in-memory only. In a serverless
 * deployment (Vercel Edge / Lambda) each cold-start creates a fresh instance,
 * so rate-limit state is NOT shared across instances or persisted between
 * invocations. For distributed rate limiting use an external store (Redis,
 * Upstash, etc.).
 */
export class SlidingWindowRateLimiter {
  private readonly windowMs: number;
  private readonly maxRequests: number;
  private readonly hits: Map<string, RateLimitRecord>;

  /**
   * @param windowMs     Rolling window size in milliseconds (default 60 000 ms = 1 minute).
   * @param maxRequests  Maximum allowed requests inside the window (default 20).
   */
  constructor(windowMs = 60_000, maxRequests = 20) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    this.hits = new Map();
  }

  /**
   * Checks whether `key` has exhausted its quota.
   * Records the current timestamp on each non-limited call.
   *
   * @returns An object with:
   *   - `limited`   – true if the caller should be rejected.
   *   - `remaining` – requests still available in the current window.
   *   - `resetMs`   – milliseconds until the oldest in-window timestamp expires.
   */
  isRateLimited(key: string): {
    limited: boolean;
    remaining: number;
    resetMs: number;
  } {
    const now = Date.now();
    const record = this.hits.get(key) ?? { timestamps: [] };

    // Prune timestamps that have fallen outside the sliding window.
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

  /** Clears all tracked request records. Useful for testing. */
  reset(): void {
    this.hits.clear();
  }
}

/**
 * Process-singleton rate limiter instance used by the `/api/analyze` route.
 *
 * @see {@link SlidingWindowRateLimiter} for in-memory caveats in serverless deployments.
 */
export const globalRateLimiter = new SlidingWindowRateLimiter(60_000, 20);
