import { describe, it, expect, beforeEach } from "vitest";
import { analyzeHybrid, clearAnalysisCache } from "@/core/engine/hybridAnalyzer";

/**
 * Verifies that the LRU cache in hybridAnalyzer correctly short-circuits the
 * Tier-2 AI call on repeated identical requests and reports cacheHit: true.
 *
 * The GEMINI_API_KEY is intentionally unset so the first call uses
 * TIER_1_FALLBACK (bypassing the network), and the second call must still
 * return cacheHit: true with matching results.
 */
describe("HybridAnalyzer LRU Cache", () => {
  const SCAM_TEXT =
    "I am a CBI officer. You are under Digital Arrest. Lock your room and do not tell anyone.";

  beforeEach(() => {
    clearAnalysisCache();
    delete process.env.GEMINI_API_KEY;
  });

  it("returns cacheHit: false on the first call to a given (text, persona) pair", async () => {
    const result = await analyzeHybrid(SCAM_TEXT, "senior_citizen");
    expect(result.telemetry.cacheHit).toBe(false);
  });

  it("returns cacheHit: true on a second identical call without clearing the cache", async () => {
    // First call populates the cache
    const first = await analyzeHybrid(SCAM_TEXT, "senior_citizen");
    expect(first.telemetry.cacheHit).toBe(false);

    // Second call must be served from cache
    const second = await analyzeHybrid(SCAM_TEXT, "senior_citizen");
    expect(second.telemetry.cacheHit).toBe(true);
  });

  it("cached response has the same finalScore, threatLevel, and engineUsed as the original", async () => {
    const first = await analyzeHybrid(SCAM_TEXT, "senior_citizen");
    const second = await analyzeHybrid(SCAM_TEXT, "senior_citizen");

    expect(second.finalScore).toBe(first.finalScore);
    expect(second.threatLevel).toBe(first.threatLevel);
    expect(second.engineUsed).toBe(first.engineUsed);
  });

  it("different personas produce separate cache entries — no cross-contamination", async () => {
    await analyzeHybrid(SCAM_TEXT, "senior_citizen");
    // College student is a different cache key — must NOT be a cache hit
    const studentResult = await analyzeHybrid(SCAM_TEXT, "college_student");
    expect(studentResult.telemetry.cacheHit).toBe(false);
  });

  it("clearAnalysisCache() causes the next call to bypass the cache", async () => {
    await analyzeHybrid(SCAM_TEXT, "senior_citizen");
    clearAnalysisCache();
    const afterClear = await analyzeHybrid(SCAM_TEXT, "senior_citizen");
    expect(afterClear.telemetry.cacheHit).toBe(false);
  });
});
