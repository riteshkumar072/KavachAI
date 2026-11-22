import { z } from "zod";

export type UserPersonaId = "senior_citizen" | "college_student" | "small_merchant";
export type SupportedLanguage = "en" | "hi";
export type ThreatLevel = "SAFE" | "CAUTION" | "CRITICAL";
export type AnalysisEngineUsed = "TIER_1_LOCAL" | "TIER_2_AI" | "TIER_1_FALLBACK";

export type ThreatVectorCategory =
  | "AUTHORITY_IMPERSONATION"
  | "COERCIVE_URGENCY"
  | "ISOLATION_SECRECY"
  | "FINANCIAL_EXTRACTION"
  | "LEGAL_FEAR_MONGERING";

export interface RedactedItem {
  type: "AADHAAR" | "PAN" | "PHONE" | "OTP" | "UPI_ID" | "BANK_CARD";
  placeholder: string;
  count: number;
}

export interface RedactionResult {
  sanitizedText: string;
  redactedItems: RedactedItem[];
  totalRedacted: number;
}

export interface MatchedEvidence {
  phrase: string;
  category: ThreatVectorCategory;
  weight: number;
  startIndex: number;
  endIndex: number;
  explanation: string;
}

export interface Tier1Result {
  rawScore: number;            // 0 to 100 before persona adjustment
  adjustedScore: number;       // 0 to 100 after persona multiplier & dampening
  threatLevel: ThreatLevel;
  detectedCategories: ThreatVectorCategory[];
  evidences: MatchedEvidence[];
  dampeningApplied: boolean;
  dampeningReason?: string;
  shouldEscalateToTier2: boolean;
  latencyMs: number;
}

export const Tier2ResponseSchema = z.object({
  riskScore: z.number().min(0).max(100),
  threatCategory: z.string().min(2).max(80),
  tactics: z.array(z.string()).max(5),
  explainableReasons: z.array(z.string()).min(1).max(4),
  tailoredExitScript: z.object({
    en: z.string().min(10),
    hi: z.string().min(10),
  }),
  recommendedAction: z.string().min(10),
  isFalsePositive: z.boolean(),
});

export type Tier2AIOutput = z.infer<typeof Tier2ResponseSchema>;

export interface UnifiedAnalysisResult {
  finalScore: number;
  threatLevel: ThreatLevel;
  engineUsed: AnalysisEngineUsed;
  threatCategory: string;
  tactics: string[];
  explainableReasons: string[];
  evidences: MatchedEvidence[];
  tailoredExitScript: {
    en: string;
    hi: string;
  };
  recommendedAction: string;
  redaction: RedactionResult;
  telemetry: {
    tier1LatencyMs: number;
    totalLatencyMs: number;
    llmCalled: boolean;
    cacheHit: boolean;
    /** Language in use at analysis time — forwarded for multi-lingual telemetry. */
    language: SupportedLanguage;
  };
}
