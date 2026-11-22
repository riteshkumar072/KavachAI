import { GoogleGenAI } from "@google/genai";
import {
  Tier1Result,
  Tier2AIOutput,
  Tier2ResponseSchema,
  UserPersonaId,
  ThreatVectorCategory,
} from "@/types/kavach";
import { getPersonaConfig } from "../context/personaRules";

/**
 * Human-readable display names for every {@link ThreatVectorCategory}.
 * Used in both the Tier-1 fallback synthesizer and the Tier-2 AI prompt.
 *
 * Defined once here rather than duplicated across modules; import from this
 * file when you need to convert a category enum value to a display label.
 */
export const CATEGORY_DISPLAY_NAMES: Record<ThreatVectorCategory, string> = {
  AUTHORITY_IMPERSONATION: "Authority Impersonation",
  COERCIVE_URGENCY: "Coercive Urgency & Pressure",
  ISOLATION_SECRECY: "Isolation & Secrecy Coercion",
  FINANCIAL_EXTRACTION: "Financial Extraction / PIN Trap",
  LEGAL_FEAR_MONGERING: "Legal Fear-Mongering & Threats",
};

/**
 * Deterministic offline fallback builder for Tier-2 AI output.
 * Ensures the app works 100% reliably even with zero API keys or network cutoffs.
 */
export function buildTier1FallbackOutput(
  tier1: Tier1Result,
  personaId: UserPersonaId
): Tier2AIOutput {
  const persona = getPersonaConfig(personaId);

  // Determine dominant category or pick authority/financial as sensible default
  const dominantCategory: ThreatVectorCategory =
    tier1.detectedCategories[0] || "AUTHORITY_IMPERSONATION";

  const fallbackScript =
    persona.fallbackExitScripts[dominantCategory] ||
    persona.fallbackExitScripts.AUTHORITY_IMPERSONATION;

  const tactics =
    tier1.detectedCategories.length > 0
      ? tier1.detectedCategories.slice(0, 4).map((c) => CATEGORY_DISPLAY_NAMES[c])
      : ["Suspicious Unverified Caller"];

  const explainableReasons: string[] = [];

  if (tier1.evidences.length > 0) {
    for (const ev of tier1.evidences.slice(0, 3)) {
      explainableReasons.push(`Flagged phrase "${ev.phrase}": ${ev.explanation}`);
    }
  } else {
    explainableReasons.push(
      "Unverified communication exhibiting urgency and pressure indicators."
    );
  }

  if (tier1.dampeningApplied && tier1.dampeningReason) {
    explainableReasons.push(tier1.dampeningReason);
  }

  return {
    riskScore: tier1.adjustedScore,
    threatCategory: CATEGORY_DISPLAY_NAMES[dominantCategory] || "Social Engineering Scam",
    tactics,
    explainableReasons: explainableReasons.slice(0, 4),
    tailoredExitScript: {
      en: fallbackScript.en,
      hi: fallbackScript.hi,
    },
    recommendedAction: persona.defaultActionGuidance.en,
    isFalsePositive: tier1.dampeningApplied && tier1.adjustedScore < persona.cautionThreshold,
  };
}

/**
 * Builds the defensive system prompt and query for Tier-2 LLM analysis.
 */
export function buildTier2Prompt(
  sanitizedText: string,
  personaId: UserPersonaId,
  tier1: Tier1Result
): string {
  const persona = getPersonaConfig(personaId);

  return `You are KavachAI, a calm, defensive Indian cybersecurity and anti-fraud assistant protecting citizens against "Digital Arrest", voice impersonation, UPI traps, and social engineering scams.

User Persona: "${persona.label}"
Vulnerability Context: ${persona.vulnerabilityFocus}

Tier-1 Heuristic Engine Signals:
- Raw Score: ${tier1.rawScore}/100
- Adjusted Score: ${tier1.adjustedScore}/100
- Detected Categories: ${tier1.detectedCategories.join(", ") || "None"}
- False-Positive Dampening Applied: ${tier1.dampeningApplied}

Sanitized Communication (PII has been masked):
"""
${sanitizedText}
"""

Task Instructions:
1. Analyze if the text contains genuine scam coercion (fake police/CBI/customs, digital arrest, UPI PIN confusion, AnyDesk screen sharing) or harmless benign discussion (news, movie, legitimate bank branch reminder).
2. Calibrate riskScore (0 to 100) taking the user persona's vulnerability into account.
3. Identify 1 to 4 manipulative tactics (e.g. "Authority Impersonation", "Urgency Manipulation", "Isolation Tactic", "UPI Deception").
4. Provide 1 to 4 concise, non-jargon explainableReasons detailing why this was flagged.
5. Provide a tailoredExitScript in both English (en) and conversational Hindi/Hinglish (hi) that the user can calmly read aloud to disengage safely.
6. Provide a recommendedAction instruction.
7. Return strictly valid JSON adhering to this exact schema:
{
  "riskScore": number (0-100),
  "threatCategory": string (2-80 characters),
  "tactics": string[] (max 5 items),
  "explainableReasons": string[] (1-4 items),
  "tailoredExitScript": {
    "en": string (min 10 characters),
    "hi": string (min 10 characters)
  },
  "recommendedAction": string (min 10 characters),
  "isFalsePositive": boolean
}`;
}

/**
 * Calls Gemini 2.5 Flash with structured JSON output mode.
 * Gracefully falls back to Tier-1 heuristic synthesis on any error or missing API key.
 */
export async function queryTier2AI(
  sanitizedText: string,
  personaId: UserPersonaId,
  tier1: Tier1Result
): Promise<{ output: Tier2AIOutput; fallbackUsed: boolean }> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (!apiKey) {
    return {
      output: buildTier1FallbackOutput(tier1, personaId),
      fallbackUsed: true,
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = buildTier2Prompt(sanitizedText, personaId, tier1);
    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.1,
      },
    });

    const textOutput = response.text?.trim() || "";
    const parsedJson = JSON.parse(textOutput);
    const validation = Tier2ResponseSchema.safeParse(parsedJson);

    if (validation.success) {
      return {
        output: validation.data,
        fallbackUsed: false,
      };
    }

    console.warn("KavachAI: Tier-2 AI schema parse failed, using fallback:", validation.error);
    return {
      output: buildTier1FallbackOutput(tier1, personaId),
      fallbackUsed: true,
    };
  } catch (err) {
    console.warn("KavachAI: Tier-2 AI call failed, falling back to local heuristic synthesis:", err);
    return {
      output: buildTier1FallbackOutput(tier1, personaId),
      fallbackUsed: true,
    };
  }
}
