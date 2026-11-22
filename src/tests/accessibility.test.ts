import { describe, it, expect } from "vitest";
import { PERSONA_CONFIGS } from "../core/context/personaRules";
import { SCENARIOS } from "../core/simulator/scenarios";
import { UserPersonaId, ThreatVectorCategory } from "@/types/kavach";

describe("Accessibility & Inclusive Design Verification", () => {
  it("provides localized labels and accessible vulnerability descriptions for all personas", () => {
    const personas: UserPersonaId[] = [
      "senior_citizen",
      "college_student",
      "small_merchant",
    ];

    for (const pid of personas) {
      const config = PERSONA_CONFIGS[pid];
      expect(config.label).toBeTruthy();
      expect(config.hindiLabel).toBeTruthy();
      expect(config.vulnerabilityFocus.length).toBeGreaterThanOrEqual(20);
      expect(config.defaultActionGuidance.en.length).toBeGreaterThanOrEqual(15);
      expect(config.defaultActionGuidance.hi.length).toBeGreaterThanOrEqual(15);
    }
  });

  it("provides complete bilingual fallback exit scripts for all 5 threat categories across all personas", () => {
    const categories: ThreatVectorCategory[] = [
      "AUTHORITY_IMPERSONATION",
      "COERCIVE_URGENCY",
      "ISOLATION_SECRECY",
      "FINANCIAL_EXTRACTION",
      "LEGAL_FEAR_MONGERING",
    ];

    const personas: UserPersonaId[] = [
      "senior_citizen",
      "college_student",
      "small_merchant",
    ];

    for (const pid of personas) {
      const config = PERSONA_CONFIGS[pid];
      for (const cat of categories) {
        const script = config.fallbackExitScripts[cat];
        expect(script).toBeDefined();
        expect(script.en.length).toBeGreaterThanOrEqual(15);
        expect(script.hi.length).toBeGreaterThanOrEqual(15);
      }
    }
  });

  it("ensures all 4 simulation scenarios have clear descriptions and expected escalation milestones", () => {
    expect(SCENARIOS).toHaveLength(4);

    for (const sc of SCENARIOS) {
      expect(sc.title).toBeTruthy();
      expect(sc.subtitle).toBeTruthy();
      expect(sc.badge).toBeTruthy();
      expect(sc.description.length).toBeGreaterThanOrEqual(20);
      expect(sc.lines.length).toBeGreaterThanOrEqual(3);

      for (const line of sc.lines) {
        expect(line.text).toBeTruthy();
        expect(line.speaker).toBeTruthy();
        expect(line.demonstrates).toBeTruthy();
      }
    }
  });
});
