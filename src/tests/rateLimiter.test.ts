import { describe, it, expect, beforeEach } from "vitest";
import { SlidingWindowRateLimiter } from "@/utils/rateLimiter";

describe("SlidingWindowRateLimiter", () => {
  let limiter: SlidingWindowRateLimiter;

  beforeEach(() => {
    // Fresh 3-request-per-second limiter for each test
    limiter = new SlidingWindowRateLimiter(1_000, 3);
  });

  it("allows up to maxRequests within the window and reports remaining count", () => {
    const r1 = limiter.isRateLimited("ip-a");
    expect(r1.limited).toBe(false);
    expect(r1.remaining).toBe(2);

    const r2 = limiter.isRateLimited("ip-a");
    expect(r2.limited).toBe(false);
    expect(r2.remaining).toBe(1);

    const r3 = limiter.isRateLimited("ip-a");
    expect(r3.limited).toBe(false);
    expect(r3.remaining).toBe(0);
  });

  it("blocks the (maxRequests + 1)th request and returns limited: true with remaining: 0", () => {
    limiter.isRateLimited("ip-b");
    limiter.isRateLimited("ip-b");
    limiter.isRateLimited("ip-b");

    const blocked = limiter.isRateLimited("ip-b");
    expect(blocked.limited).toBe(true);
    expect(blocked.remaining).toBe(0);
    expect(blocked.resetMs).toBeGreaterThan(0);
  });

  it("tracks each key independently — one exhausted key does not affect another", () => {
    limiter.isRateLimited("ip-x");
    limiter.isRateLimited("ip-x");
    limiter.isRateLimited("ip-x");
    // ip-x is now exhausted
    expect(limiter.isRateLimited("ip-x").limited).toBe(true);

    // ip-y is a fresh key — must still be allowed
    const iy = limiter.isRateLimited("ip-y");
    expect(iy.limited).toBe(false);
    expect(iy.remaining).toBe(2);
  });

  it("reset() clears all state so previously blocked keys are allowed again", () => {
    limiter.isRateLimited("ip-c");
    limiter.isRateLimited("ip-c");
    limiter.isRateLimited("ip-c");
    expect(limiter.isRateLimited("ip-c").limited).toBe(true);

    limiter.reset();

    const afterReset = limiter.isRateLimited("ip-c");
    expect(afterReset.limited).toBe(false);
    expect(afterReset.remaining).toBe(2);
  });

  it("resetMs is within the configured window and positive when rate-limited", () => {
    limiter.isRateLimited("ip-d");
    limiter.isRateLimited("ip-d");
    limiter.isRateLimited("ip-d");

    const { resetMs } = limiter.isRateLimited("ip-d");
    expect(resetMs).toBeGreaterThan(0);
    expect(resetMs).toBeLessThanOrEqual(1_000);
  });
});
