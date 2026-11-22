import {
  UnifiedAnalysisResult,
  UserPersonaId,
  SupportedLanguage,
  AnalysisEngineUsed,
} from "@/types/kavach";
import { redactPII } from "../security/piiRedactor";
import { scoreHeuristics } from "./heuristicScorer";
import { queryTier2AI, buildTier1FallbackOutput } from "./aiAssistant";
import { getPersonaConfig, calculateThreatLevel } from "../context/personaRules";

interface CacheEntry {
  result: UnifiedAnalysisResult;
  timestamp: number;
}

const LRU_CACHE = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_SIZE = 50;

function getCacheKey(text: string, personaId: UserPersonaId): string {
  return `${personaId}:${text.trim().toLowerCase().slice(0, 500)}`;
}

export function clearAnalysisCache(): void {
  LRU_CACHE.clear();
}

/**
 * 2-Tier Hybrid Decision Orchestrator.
 * Tier-1: Local deterministic heuristic scoring (< 5ms).
 * Escalation Gate: Triggers Tier-2 Deep AI only when suspicious markers or escalation threshold met.
 * Defense-in-depth: Guaranteed offline fallback if no API key is provided.
 */
export async function analyzeHybrid(
  text: string,
  personaId: UserPersonaId = "senior_citizen",
  language: SupportedLanguage = "en"
): Promise<UnifiedAnalysisResult> {
  const overallStart = performance.now();

  // Step 1: Pre-LLM Local PII Redaction
  const redaction = redactPII(text);
  const sanitized = redaction.sanitizedText;

  // Step 2: Tier-1 Fast Deterministic Scoring
  const tier1 = scoreHeuristics(sanitized, personaId);
  const persona = getPersonaConfig(personaId);

  // Step 3: Escalation Gate Evaluation
  if (!tier1.shouldEscalateToTier2) {
    const totalElapsed =
      Math.round((performance.now() - overallStart) * 100) / 100;

    const fallback = buildTier1FallbackOutput(tier1, personaId);

    return {
      finalScore: tier1.adjustedScore,
      threatLevel: tier1.threatLevel,
      engineUsed: "TIER_1_LOCAL",
      threatCategory: tier1.evidences.length > 0 ? fallback.threatCategory : "Benign Communication",
      tactics: fallback.tactics,
      explainableReasons:
        tier1.evidences.length > 0
          ? fallback.explainableReasons
          : ["No coercive or fraudulent indicators detected."],
      evidences: tier1.evidences,
      tailoredExitScript: fallback.tailoredExitScript,
      recommendedAction:
        tier1.threatLevel === "SAFE"
          ? "No threat detected. Continue normal communication."
          : persona.defaultActionGuidance.en,
      redaction,
      telemetry: {
        tier1LatencyMs: tier1.latencyMs,
        totalLatencyMs: totalElapsed,
        llmCalled: false,
        cacheHit: false,
        language,
      },
    };
  }

  // Step 4: Check Cache for Escalated Query
  const cacheKey = getCacheKey(sanitized, personaId);
  const cached = LRU_CACHE.get(cacheKey);
  const now = Date.now();

  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    const totalElapsed =
      Math.round((performance.now() - overallStart) * 100) / 100;

    return {
      ...cached.result,
      redaction,
      telemetry: {
        ...cached.result.telemetry,
        totalLatencyMs: totalElapsed,
        cacheHit: true,
        language,
      },
    };
  }

  // Step 5: Tier-2 Gated AI Call (with automatic fallback on missing key / error)
  const { output: aiOutput, fallbackUsed } = await queryTier2AI(
    sanitized,
    personaId,
    tier1
  );

  const engineUsed: AnalysisEngineUsed = fallbackUsed
    ? "TIER_1_FALLBACK"
    : "TIER_2_AI";

  const finalScore = aiOutput.riskScore;
  const threatLevel = calculateThreatLevel(finalScore, persona);
  const totalElapsed =
    Math.round((performance.now() - overallStart) * 100) / 100;

  const unifiedResult: UnifiedAnalysisResult = {
    finalScore,
    threatLevel,
    engineUsed,
    threatCategory: aiOutput.threatCategory,
    tactics: aiOutput.tactics,
    explainableReasons: aiOutput.explainableReasons,
    evidences: tier1.evidences,
    tailoredExitScript: aiOutput.tailoredExitScript,
    recommendedAction: aiOutput.recommendedAction,
    redaction,
    telemetry: {
      tier1LatencyMs: tier1.latencyMs,
      totalLatencyMs: totalElapsed,
      llmCalled: !fallbackUsed,
      cacheHit: false,
      language,
    },
  };

  // Maintain bounded LRU cache
  if (LRU_CACHE.size >= MAX_CACHE_SIZE) {
    const oldestKey = LRU_CACHE.keys().next().value;
    if (oldestKey) LRU_CACHE.delete(oldestKey);
  }
  LRU_CACHE.set(cacheKey, { result: unifiedResult, timestamp: now });

  return unifiedResult;
}
