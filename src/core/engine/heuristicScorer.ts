import {
  MatchedEvidence,
  ThreatVectorCategory,
  Tier1Result,
  UserPersonaId,
} from "@/types/kavach";
import { getPersonaConfig, calculateThreatLevel } from "../context/personaRules";

interface ThreatPattern {
  id: string;
  category: ThreatVectorCategory;
  weight: number;
  pattern: RegExp;
  phrase: string;
  explanation: string;
}

// 5 Structured Scam Pattern Dictionaries with English & Hinglish support
const THREAT_PATTERNS: ThreatPattern[] = [
  // --- 1. AUTHORITY_IMPERSONATION ---
  {
    id: "auth_digital_arrest",
    category: "AUTHORITY_IMPERSONATION",
    weight: 30,
    pattern: /\bdigital\s+arrest\b/i,
    phrase: "digital arrest",
    explanation: "Fictitious legal term used by cyber criminals to intimidate victims into staying on video calls.",
  },
  {
    id: "auth_cbi",
    category: "AUTHORITY_IMPERSONATION",
    weight: 28,
    pattern: /\b(cbi|central\s+bureau\s+of\s+investigation)\b/i,
    phrase: "cbi",
    explanation: "Impersonation of Central Bureau of Investigation officers.",
  },
  {
    id: "auth_ed",
    category: "AUTHORITY_IMPERSONATION",
    weight: 28,
    pattern: /\b(enforcement\s+directorate|ed\s+officer)\b/i,
    phrase: "enforcement directorate",
    explanation: "Impersonation of Enforcement Directorate (ED) officials.",
  },
  {
    id: "auth_police",
    category: "AUTHORITY_IMPERSONATION",
    weight: 26,
    pattern: /\b(mumbai\s+police|delhi\s+police|cyber\s+crime\s+cbi|cyber\s+crime\s+officer|police\s+officer|police\s+inspector|police)\b/i,
    phrase: "police officer",
    explanation: "Impersonation of state police or cyber cell personnel.",
  },
  {
    id: "auth_trai",
    category: "AUTHORITY_IMPERSONATION",
    weight: 25,
    pattern: /\b(trai|telecom\s+regulatory|telecom\s+department)\b/i,
    phrase: "trai",
    explanation: "Impersonation of Telecom Regulatory Authority of India (TRAI).",
  },
  {
    id: "auth_rbi",
    category: "AUTHORITY_IMPERSONATION",
    weight: 26,
    pattern: /\b(rbi\s+officer|reserve\s+bank\s+of\s+india)\b/i,
    phrase: "rbi officer",
    explanation: "False claim of representing the Reserve Bank of India.",
  },
  {
    id: "auth_customs",
    category: "AUTHORITY_IMPERSONATION",
    weight: 26,
    pattern: /\b(customs\s+department|customs\s+officer|customs\s+seized)\b/i,
    phrase: "customs department",
    explanation: "Claiming to be Customs border officials.",
  },
  {
    id: "auth_arrest_warrant",
    category: "AUTHORITY_IMPERSONATION",
    weight: 28,
    pattern: /\b(arrest\s+warrant|fir\s+registered|fir\s+lodged|warrant\s+issued)\b/i,
    phrase: "arrest warrant",
    explanation: "Fabricated arrest warrants or non-existent FIR registrations.",
  },
  {
    id: "auth_money_laundering",
    category: "AUTHORITY_IMPERSONATION",
    weight: 28,
    pattern: /\b(money\s+laundering|aadhaar\s+linked\s+to\s+crime|aadhaar\s+misuse)\b/i,
    phrase: "money laundering",
    explanation: "Falsely claiming user's identity is tied to national money laundering syndicates.",
  },

  // --- 2. COERCIVE_URGENCY ---
  {
    id: "urg_deadline",
    category: "COERCIVE_URGENCY",
    weight: 24,
    pattern: /\b(within\s+\d+\s+(?:minutes?|hours?)|abhi\s+turant|turant\s+karo|disconnection\s+in\s+\d+\s+hours?)\b/i,
    phrase: "urgency deadline",
    explanation: "Artificial time pressure engineered to bypass rational decision making.",
  },
  {
    id: "urg_immediate",
    category: "COERCIVE_URGENCY",
    weight: 20,
    pattern: /\b(immediately|right\s+now|last\s+warning|final\s+notice)\b/i,
    phrase: "immediately",
    explanation: "Coercive urgency demanding instant compliance without delay.",
  },
  {
    id: "urg_freeze",
    category: "COERCIVE_URGENCY",
    weight: 25,
    pattern: /\b(account\s+will\s+be\s+frozen|sim\s+will\s+be\s+blocked|numbers?\s+will\s+be\s+disconnected)\b/i,
    phrase: "account will be frozen",
    explanation: "Threat of immediate asset freezing or telecommunication disconnection.",
  },
  {
    id: "urg_no_disconnect",
    category: "COERCIVE_URGENCY",
    weight: 25,
    pattern: /\b(do\s+not\s+disconnect|call\s+mat\s+katna|phone\s+mat\s+katna)\b/i,
    phrase: "do not disconnect",
    explanation: "High-pressure instruction barring the victim from hanging up the call.",
  },
  {
    id: "urg_non_bailable",
    category: "COERCIVE_URGENCY",
    weight: 26,
    pattern: /\bnon-?bailable(\s+warrant)?\b/i,
    phrase: "non-bailable warrant",
    explanation: "Invoking severe criminal legal terms to induce extreme panic.",
  },

  // --- 3. ISOLATION_SECRECY ---
  {
    id: "iso_silence",
    category: "ISOLATION_SECRECY",
    weight: 30,
    pattern: /\b(do\s+not\s+tell\s+anyone|don'?t\s+tell\s+anyone|kisi\s+ko\s+mat\s+batana|don'?t\s+inform\s+family|parivaar\s+ko\s+mat\s+batana)\b/i,
    phrase: "do not tell anyone",
    explanation: "Classic isolation tactic preventing the victim from asking relatives for advice.",
  },
  {
    id: "iso_lock_room",
    category: "ISOLATION_SECRECY",
    weight: 30,
    pattern: /\b(lock\s+(?:the|your)\s+room|room\s+lock\s+karo|close\s+the\s+door)\b/i,
    phrase: "lock the room",
    explanation: "Physical isolation command isolating the victim from family support.",
  },
  {
    id: "iso_video_call",
    category: "ISOLATION_SECRECY",
    weight: 28,
    pattern: /\b(stay\s+on\s+(?:whatsapp\s+)?video(\s+call)?|skype|whatsapp\s+video|keep\s+camera\s+on|stay\s+on\s+the\s+line)\b/i,
    phrase: "stay on video call",
    explanation: "Demanding 24/7 video supervision under the guise of an official inquiry.",
  },
  {
    id: "iso_national_security",
    category: "ISOLATION_SECRECY",
    weight: 28,
    pattern: /\b(confidential\s+investigation|national\s+security|secret\s+investigation|desh\s+ki\s+suraksha)\b/i,
    phrase: "national security",
    explanation: "Using fictitious official secrecy oaths to enforce strict silence.",
  },

  // --- 4. FINANCIAL_EXTRACTION ---
  {
    id: "fin_safe_account",
    category: "FINANCIAL_EXTRACTION",
    weight: 32,
    pattern: /\b(transfer\s+(?:your\s+)?(?:savings|funds|money)\s+to\s+(?:the\s+)?(?:rbi\s+)?(?:safe|verification)\s+account|safe\s+account|verification\s+account)\b/i,
    phrase: "transfer to safe account",
    explanation: "Definitive Digital Arrest demand to move personal funds into scammer-controlled accounts.",
  },
  {
    id: "fin_refundable_deposit",
    category: "FINANCIAL_EXTRACTION",
    weight: 28,
    pattern: /\b(security\s+deposit|refundable\s+verification|funds\s+will\s+be\s+refunded|refunded\s+after\s+verification)\b/i,
    phrase: "refundable verification",
    explanation: "False promise that coerced fund transfers will be reimbursed after inquiry.",
  },
  {
    id: "fin_otp_demand",
    category: "FINANCIAL_EXTRACTION",
    weight: 32,
    // Negative lookbehind prevents matching "never share otp", "do not share otp"
    pattern: /(?<!\b(?:never|do\s+not|don'?t|not|mat|na)\s+)(?:share\s+(?:the\s+)?(?:\d+-digit\s+)?otp|otp\s+batao|tell\s+me\s+(?:the\s+)?(?:\d+-digit\s+)?otp|batao\s+otp)\b/i,
    phrase: "share otp",
    explanation: "Unauthorized demand for one-time passwords used to authorize direct bank debits.",
  },
  {
    id: "fin_upi_pin_trap",
    category: "FINANCIAL_EXTRACTION",
    weight: 32,
    pattern: /(?<!\b(?:never|do\s+not|don'?t|not|mat|na)\s+)(?:enter\s+(?:your\s+)?upi\s+pin\s+to\s+receive|scan\s+qr(?:\s+code)?\s+to\s+receive|pin\s+dalo)\b/i,
    phrase: "enter upi pin to receive",
    explanation: "Fraudulent claim that entering a UPI PIN or scanning a QR code receives money rather than sends it.",
  },
  {
    id: "fin_remote_access",
    category: "FINANCIAL_EXTRACTION",
    weight: 32,
    pattern: /\b(anydesk|teamviewer|quicksupport|rustdesk|screen\s+shar(?:e|ing))\b/i,
    phrase: "anydesk",
    explanation: "Instruction to install remote desktop mirroring apps to hijack banking credentials.",
  },

  // --- 5. LEGAL_FEAR_MONGERING ---
  {
    id: "leg_drugs_parcel",
    category: "LEGAL_FEAR_MONGERING",
    weight: 26,
    pattern: /\b(illegal\s+parcel|mdma|drugs\s+found|narcotics\s+seized|contraband|parcel\s+seized)\b/i,
    phrase: "mdma drugs found",
    explanation: "Fabricating courier interception involving illegal narcotics and contraband.",
  },
  {
    id: "leg_fedex",
    category: "LEGAL_FEAR_MONGERING",
    weight: 22,
    pattern: /\b(fedex\s+customer\s+support|fedex\s+support|fedex\s+parcel)\b/i,
    phrase: "fedex parcel",
    explanation: "Impersonating FedEx customer service alleging contraband parcels in victim's name.",
  },
  {
    id: "leg_fake_passport",
    category: "LEGAL_FEAR_MONGERING",
    weight: 25,
    pattern: /\b(fake\s+passports?|forged\s+passports?)\b/i,
    phrase: "fake passports",
    explanation: "False criminal accusation of international passport counterfeiting.",
  },
  {
    id: "leg_jail_threat",
    category: "LEGAL_FEAR_MONGERING",
    weight: 25,
    pattern: /\b(jail|police\s+jeep\s+on\s+the\s+way|go\s+to\s+jail|bhejo\s+jail)\b/i,
    phrase: "jail",
    explanation: "Direct intimidation with immediate arrest and police vehicle dispatch.",
  },
];

// Benign contextual phrases used to suppress false positives on legitimate advisories & casual talks
const BENIGN_MARKERS = [
  /\bvisit\s+(?:your\s+)?nearest\s+branch\b/i,
  /\bofficial\s+website\b/i,
  /\bnever\s+share\s+otp\b/i,
  /\bdo\s+not\s+share\s+your\s+pin\b/i,
  /\bnever\s+asks?\s+for\s+otp\b/i,
  /\bcustomer\s+care\s+will\s+never\s+ask\b/i,
  /\bsaw\s+in\s+the\s+news\b/i,
  /\bnewspaper\b/i,
  /\bmovie\b/i,
  /\bweb\s+series\b/i,
  /\bmy\s+friend\s+told\s+me\b/i,
  /\bawareness\s+session\b/i,
];

/**
 * Tier-1 Deterministic Heuristic Threat Scorer.
 * Executes in < 5ms with zero external API calls.
 */
export function scoreHeuristics(
  text: string,
  personaId: UserPersonaId = "senior_citizen"
): Tier1Result {
  const startTime = performance.now();
  const persona = getPersonaConfig(personaId);

  if (!text || typeof text !== "string" || text.trim().length === 0) {
    const elapsed = Math.round((performance.now() - startTime) * 100) / 100;
    return {
      rawScore: 0,
      adjustedScore: 0,
      threatLevel: "SAFE",
      detectedCategories: [],
      evidences: [],
      dampeningApplied: false,
      shouldEscalateToTier2: false,
      latencyMs: elapsed,
    };
  }

  const evidences: MatchedEvidence[] = [];
  const matchedPatterns = new Set<string>();
  const categoryMatches = new Map<ThreatVectorCategory, ThreatPattern[]>();

  // Evaluate all threat patterns and track exact indices
  for (const tp of THREAT_PATTERNS) {
    // Clone regex with global flag to find all occurrences
    const regex = new RegExp(tp.pattern.source, "gi");
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      const startIndex = match.index;
      const matchedText = match[0];
      const endIndex = startIndex + matchedText.length;

      evidences.push({
        phrase: matchedText,
        category: tp.category,
        weight: tp.weight,
        startIndex,
        endIndex,
        explanation: tp.explanation,
      });

      matchedPatterns.add(tp.id);

      const existing = categoryMatches.get(tp.category) || [];
      if (!existing.some((p) => p.id === tp.id)) {
        existing.push(tp);
        categoryMatches.set(tp.category, existing);
      }
    }
  }

  // Calculate Base Category Scores + Unique Match Scaling
  let sumCategoryScores = 0;
  const detectedCategories = Array.from(categoryMatches.keys());

  for (const [, patterns] of categoryMatches) {
    const highestWeight = Math.max(...patterns.map((p) => p.weight));
    const additionalMatches = patterns.length - 1;
    const additionalBonus = Math.min(15, additionalMatches * 5);
    sumCategoryScores += highestWeight + additionalBonus;
  }

  // Synergy Bonus for Compound Manipulation
  let synergyBonus = 0;
  if (detectedCategories.length === 2) {
    synergyBonus = 12;
  } else if (detectedCategories.length >= 3) {
    synergyBonus = 25;
  }

  const rawScore = Math.min(100, sumCategoryScores + synergyBonus);

  // False-Positive Dampening Check
  const hasBenignMarker = BENIGN_MARKERS.some((marker) => marker.test(text));
  const hasFinancialExtraction = categoryMatches.has("FINANCIAL_EXTRACTION");
  const hasIsolationSecrecy = categoryMatches.has("ISOLATION_SECRECY");

  let dampeningApplied = false;
  let dampeningReason: string | undefined;
  let dampeningFactor = 1.0;

  if (hasBenignMarker && !hasFinancialExtraction && !hasIsolationSecrecy) {
    dampeningFactor = 0.35;
    dampeningApplied = true;
    dampeningReason =
      "Benign educational or advisory markers present without coercive isolation or financial extraction signals.";
  }

  // Persona Multiplier & Final Score Adjustment
  const adjustedScore = Math.min(
    100,
    Math.max(
      0,
      Math.round(rawScore * persona.multiplier * dampeningFactor)
    )
  );

  const threatLevel = calculateThreatLevel(adjustedScore, persona);

  // Escalation Gate to Tier-2 AI
  const shouldEscalateToTier2 =
    adjustedScore >= 25 || hasIsolationSecrecy || hasFinancialExtraction;

  const latencyMs = Math.round((performance.now() - startTime) * 100) / 100;

  return {
    rawScore,
    adjustedScore,
    threatLevel,
    detectedCategories,
    evidences,
    dampeningApplied,
    dampeningReason,
    shouldEscalateToTier2,
    latencyMs,
  };
}
