import { describe, it, expect } from "vitest";
import { scoreHeuristics } from "../core/engine/heuristicScorer";

describe("Tier-1 Heuristic Threat Scorer", () => {
  it("flags Fake CBI Digital Arrest script as CRITICAL with compound synergy bonus", () => {
    const text =
      "I am calling from Mumbai Cyber Crime CBI Officer. You are now under Digital Arrest. Lock your room, stay on WhatsApp video call, and do not tell anyone in your family. Transfer your savings to the RBI verification account immediately.";

    const result = scoreHeuristics(text, "senior_citizen");

    expect(result.threatLevel).toBe("CRITICAL");
    expect(result.adjustedScore).toBeGreaterThanOrEqual(80);
    expect(result.detectedCategories).toContain("AUTHORITY_IMPERSONATION");
    expect(result.detectedCategories).toContain("ISOLATION_SECRECY");
    expect(result.detectedCategories).toContain("FINANCIAL_EXTRACTION");
    expect(result.detectedCategories).toContain("COERCIVE_URGENCY");
    expect(result.shouldEscalateToTier2).toBe(true);
  });

  it("flags FedEx Customs + AnyDesk script as CRITICAL", () => {
    const text =
      "This is FedEx Customer Support. Customs department seized an illegal parcel with MDMA drugs in your name. Police issued arrest warrant. Install AnyDesk immediately.";

    const result = scoreHeuristics(text, "college_student");

    expect(result.threatLevel).toBe("CRITICAL");
    expect(result.adjustedScore).toBeGreaterThanOrEqual(70);
    expect(result.detectedCategories).toContain("LEGAL_FEAR_MONGERING");
    expect(result.detectedCategories).toContain("FINANCIAL_EXTRACTION");
    expect(result.shouldEscalateToTier2).toBe(true);
  });

  it("flags UPI PIN-to-receive + urgency merchant scam as CRITICAL", () => {
    const text =
      "Namaste bhaiya, I am sending 25,000 advance. Enter UPI PIN to receive payment within 10 minutes or voucher expires. Share OTP right now.";

    const result = scoreHeuristics(text, "small_merchant");

    expect(result.threatLevel).toBe("CRITICAL");
    expect(result.adjustedScore).toBeGreaterThanOrEqual(65);
    expect(result.detectedCategories).toContain("FINANCIAL_EXTRACTION");
    expect(result.detectedCategories).toContain("COERCIVE_URGENCY");
    expect(result.shouldEscalateToTier2).toBe(true);
  });

  it("keeps legitimate bank reminder in SAFE via false-positive dampening", () => {
    const text =
      "Hello, this is a courtesy reminder from your bank branch. Please note that our bank will never ask for OTP or PIN. Whenever convenient this month, visit your nearest branch or update via official website.";

    const result = scoreHeuristics(text, "senior_citizen");

    expect(result.threatLevel).toBe("SAFE");
    expect(result.adjustedScore).toBeLessThan(30);
    expect(result.dampeningApplied).toBe(true);
    expect(result.shouldEscalateToTier2).toBe(false);
  });

  it("keeps casual conversation mentioning police or news in SAFE", () => {
    const text =
      "Yesterday I saw an awesome CBI crime movie with my friend in the theater, it was really thrilling.";

    const result = scoreHeuristics(text, "college_student");

    expect(result.threatLevel).toBe("SAFE");
    expect(result.adjustedScore).toBeLessThan(35);
    expect(result.dampeningApplied).toBe(true);
    expect(result.shouldEscalateToTier2).toBe(false);
  });

  it("returns accurate startIndex and endIndex spans matching exact substrings in input text", () => {
    const text = "You must act immediately before police officer arrives.";
    const result = scoreHeuristics(text, "senior_citizen");

    expect(result.evidences.length).toBeGreaterThanOrEqual(2);

    for (const evidence of result.evidences) {
      const extracted = text.slice(evidence.startIndex, evidence.endIndex);
      expect(extracted.toLowerCase()).toBe(evidence.phrase.toLowerCase());
    }
  });

  it("completes Tier-1 deterministic scoring in under 25ms", () => {
    const longText =
      "I am calling from Mumbai Cyber Crime CBI Officer. You are under Digital Arrest. Stay on video call, do not tell anyone in your family. Transfer your savings to the RBI verification account immediately. Non-bailable warrant will be issued.";

    const start = performance.now();
    const result = scoreHeuristics(longText, "senior_citizen");
    const executionDuration = performance.now() - start;

    expect(executionDuration).toBeLessThan(25);
    expect(result.latencyMs).toBeLessThan(25);
  });

  it("handles empty or whitespace-only input gracefully with score 0 and SAFE status", () => {
    const emptyResult = scoreHeuristics("", "senior_citizen");
    expect(emptyResult.rawScore).toBe(0);
    expect(emptyResult.adjustedScore).toBe(0);
    expect(emptyResult.threatLevel).toBe("SAFE");
    expect(emptyResult.evidences).toEqual([]);
    expect(emptyResult.shouldEscalateToTier2).toBe(false);

    const whitespaceResult = scoreHeuristics("   \n\t  ", "senior_citizen");
    expect(whitespaceResult.adjustedScore).toBe(0);
    expect(whitespaceResult.threatLevel).toBe("SAFE");
  });
});
