import { describe, it, expect, beforeEach } from "vitest";
import { scoreHeuristics } from "../core/engine/heuristicScorer";
import { analyzeHybrid, clearAnalysisCache } from "../core/engine/hybridAnalyzer";
import { buildTier1FallbackOutput } from "../core/engine/aiAssistant";
import { Tier2ResponseSchema } from "@/types/kavach";

describe("Hybrid Decision Engine & Persona Context Logic", () => {
  beforeEach(() => {
    clearAnalysisCache();
    delete process.env.GEMINI_API_KEY;
  });

  it("applies higher risk score for senior_citizen (1.25x) than college_student (1.0x) on identical suspicious text", () => {
    const text =
      "This is Telecom department TRAI. Your numbers will be disconnected within 2 hours.";

    const seniorResult = scoreHeuristics(text, "senior_citizen");
    const studentResult = scoreHeuristics(text, "college_student");

    expect(seniorResult.rawScore).toBe(studentResult.rawScore);
    expect(seniorResult.adjustedScore).toBeGreaterThan(studentResult.adjustedScore);
    expect(seniorResult.adjustedScore).toBe(
      Math.min(100, Math.round(seniorResult.rawScore * 1.25))
    );
  });

  it("triggers CAUTION earlier for senior_citizen (threshold 30) than college_student (threshold 35)", () => {
    // Single pattern "customs department" (weight 26)
    const text = "A package is detained at the customs department.";

    const seniorResult = scoreHeuristics(text, "senior_citizen"); // 26 * 1.25 = 33 -> CAUTION (>= 30)
    const studentResult = scoreHeuristics(text, "college_student"); // 26 * 1.00 = 26 -> SAFE (< 35)

    expect(seniorResult.threatLevel).toBe("CAUTION");
    expect(studentResult.threatLevel).toBe("SAFE");
  });

  it("skips Tier-2 LLM (shouldEscalateToTier2 === false) on benign safe messages to conserve tokens", async () => {
    const safeText =
      "Courtesy update: our bank branch will never ask for your OTP. Visit your nearest branch anytime.";

    const result = await analyzeHybrid(safeText, "senior_citizen");

    expect(result.engineUsed).toBe("TIER_1_LOCAL");
    expect(result.telemetry.llmCalled).toBe(false);
    expect(result.threatLevel).toBe("SAFE");
  });

  it("escalates to Tier-2 (shouldEscalateToTier2 === true) when ISOLATION_SECRECY or FINANCIAL_EXTRACTION appears", () => {
    const isolationText = "Lock your room and do not tell anyone in your family.";
    const tier1Iso = scoreHeuristics(isolationText, "college_student");
    expect(tier1Iso.detectedCategories).toContain("ISOLATION_SECRECY");
    expect(tier1Iso.shouldEscalateToTier2).toBe(true);

    const extractionText = "Transfer your savings to safe account.";
    const tier1Ext = scoreHeuristics(extractionText, "small_merchant");
    expect(tier1Ext.detectedCategories).toContain("FINANCIAL_EXTRACTION");
    expect(tier1Ext.shouldEscalateToTier2).toBe(true);
  });

  it("gracefully falls back to TIER_1_FALLBACK with valid persona exit scripts when GEMINI_API_KEY is unset", async () => {
    delete process.env.GEMINI_API_KEY;

    const scamText =
      "I am calling from Mumbai Cyber Crime CBI Officer. You are under Digital Arrest. Transfer your savings to the RBI verification account immediately.";

    const result = await analyzeHybrid(scamText, "senior_citizen");

    expect(result.engineUsed).toBe("TIER_1_FALLBACK");
    expect(result.telemetry.llmCalled).toBe(false);
    expect(result.threatLevel).toBe("CRITICAL");
    expect(result.tailoredExitScript.en.length).toBeGreaterThanOrEqual(15);
    expect(result.tailoredExitScript.hi.length).toBeGreaterThanOrEqual(15);
    expect(result.explainableReasons.length).toBeGreaterThanOrEqual(1);
  });

  it("validates LLM JSON output via Zod and falls back safely on malformed LLM responses", () => {
    const malformedPayload = {
      riskScore: 250, // invalid: max 100
      threatCategory: "X", // invalid: min 2 chars
      tactics: "not-an-array", // invalid type
    };

    const parseResult = Tier2ResponseSchema.safeParse(malformedPayload);
    expect(parseResult.success).toBe(false);

    // Verify buildTier1FallbackOutput always satisfies Tier2ResponseSchema
    const dummyTier1 = scoreHeuristics(
      "You are under Digital Arrest by CBI. Lock the room.",
      "senior_citizen"
    );
    const fallbackOutput = buildTier1FallbackOutput(dummyTier1, "senior_citizen");
    const fallbackValidation = Tier2ResponseSchema.safeParse(fallbackOutput);

    expect(fallbackValidation.success).toBe(true);
    if (fallbackValidation.success) {
      expect(fallbackValidation.data.tailoredExitScript.en).toBeTruthy();
      expect(fallbackValidation.data.tailoredExitScript.hi).toBeTruthy();
    }
  });
});
