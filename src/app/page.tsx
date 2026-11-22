"use client";

import React, { useState, useCallback, useRef } from "react";
import {
  UserPersonaId,
  SupportedLanguage,
  UnifiedAnalysisResult,
  AnalysisEngineUsed,
} from "@/types/kavach";
import { TopBar } from "@/components/TopBar";
import { PrivacyAuditBar } from "@/components/PrivacyAuditBar";
import { InputConsole } from "@/components/InputConsole";
import { TranscriptViewer } from "@/components/TranscriptViewer";
import { ThreatGauge } from "@/components/ThreatGauge";
import { ExplainablePanel } from "@/components/ExplainablePanel";
import { ActionShield } from "@/components/ActionShield";
import { useLiveSimulator } from "@/hooks/useLiveSimulator";
import { useSpeechInput } from "@/hooks/useSpeechInput";
import { analyzeHybrid } from "@/core/engine/hybridAnalyzer";
import { triggerThreatVoiceAlert } from "@/utils/voiceAlert";
import { PERSONA_CONFIGS } from "@/core/context/personaRules";

export default function Home() {
  // Global State
  const [persona, setPersona] = useState<UserPersonaId>("senior_citizen");
  const [language, setLanguage] = useState<SupportedLanguage>("en");
  const [seniorMode, setSeniorMode] = useState<boolean>(false);
  const [voiceAlertEnabled, setVoiceAlertEnabled] = useState<boolean>(true);

  // Input Mode State
  const [activeTab, setActiveTab] = useState<"simulator" | "mic" | "paste">("simulator");
  const [activeText, setActiveText] = useState<string>("");
  const [pastedText, setPastedText] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  // Analysis Result
  const [result, setResult] = useState<UnifiedAnalysisResult | null>(null);

  // Debounce ref to avoid analyzing on every single keystroke
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Live Threat Analyzer Runner
  const runAnalysis = useCallback(
    async (textToAnalyze: string, targetPersona: UserPersonaId) => {
      if (!textToAnalyze || textToAnalyze.trim().length === 0) {
        setResult(null);
        return;
      }

      setIsAnalyzing(true);
      try {
        // Attempt API route first for realistic server-side audit
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: textToAnalyze,
            persona: targetPersona,
            language,
          }),
        });

        if (res.ok) {
          const data: UnifiedAnalysisResult = await res.json();
          setResult(data);
          if (voiceAlertEnabled && data.threatLevel === "CRITICAL") {
            triggerThreatVoiceAlert("CRITICAL", language);
          }
        } else {
          // Direct in-memory fallback if API encounters network issue
          const fallbackData = await analyzeHybrid(textToAnalyze, targetPersona, language);
          setResult(fallbackData);
          if (voiceAlertEnabled && fallbackData.threatLevel === "CRITICAL") {
            triggerThreatVoiceAlert("CRITICAL", language);
          }
        }
      } catch (err) {
        console.warn("API route fetch error, using client-side fallback engine:", err);
        const clientData = await analyzeHybrid(textToAnalyze, targetPersona, language);
        setResult(clientData);
        if (voiceAlertEnabled && clientData.threatLevel === "CRITICAL") {
          triggerThreatVoiceAlert("CRITICAL", language);
        }
      } finally {
        setIsAnalyzing(false);
      }
    },
    [language, voiceAlertEnabled]
  );

  // Hook for Simulator
  const handleSimulationLine = useCallback(
    (streamedText: string) => {
      setActiveText(streamedText);
      runAnalysis(streamedText, persona);
    },
    [persona, runAnalysis]
  );

  const simulator = useLiveSimulator(handleSimulationLine);

  // Hook for Speech Input
  const handleSpeechChange = useCallback(
    (speechText: string) => {
      setActiveText(speechText);
      runAnalysis(speechText, persona);
    },
    [persona, runAnalysis]
  );

  const speech = useSpeechInput(language, handleSpeechChange);

  const handlePersonaChange = (newPersona: UserPersonaId) => {
    setPersona(newPersona);
    if (activeText.trim().length > 0) {
      runAnalysis(activeText, newPersona);
    }
  };

  const handleScenarioSelect = (scenarioId: string, targetPersona: UserPersonaId) => {
    setPersona(targetPersona);
    simulator.reset();
    simulator.start(scenarioId);
  };

  const handlePastedTextChange = (text: string) => {
    setPastedText(text);
    setActiveText(text);

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      runAnalysis(text, persona);
    }, 400);
  };

  const handleAnalyzePasted = () => {
    if (pastedText.trim().length > 0) {
      setActiveText(pastedText);
      runAnalysis(pastedText, persona);
    }
  };

  const personaConfig = PERSONA_CONFIGS[persona];
  const engineUsed: AnalysisEngineUsed = result ? result.engineUsed : "TIER_1_LOCAL";

  return (
    <div
      className="min-h-screen flex flex-col bg-[#09090b] text-zinc-100"
      data-a11y={seniorMode ? "high-contrast" : "default"}
    >
      {/* Top Header Bar */}
      <TopBar
        persona={persona}
        onPersonaChange={handlePersonaChange}
        language={language}
        onLanguageChange={setLanguage}
        seniorMode={seniorMode}
        onSeniorModeToggle={() => setSeniorMode((prev) => !prev)}
        voiceAlertEnabled={voiceAlertEnabled}
        onVoiceAlertToggle={() => setVoiceAlertEnabled((prev) => !prev)}
        engineUsed={engineUsed}
      />

      {/* Privacy & Security Audit Strip */}
      <PrivacyAuditBar
        redactedItems={result?.redaction.redactedItems || []}
        totalRedacted={result?.redaction.totalRedacted || 0}
        engineUsed={engineUsed}
        tier1LatencyMs={result?.telemetry.tier1LatencyMs || 0}
      />

      {/* Main Dashboard Grid */}
      <main className="max-w-7xl mx-auto p-6 w-full grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1">
        {/* Left Column (7/12 cols): Input Console & Live Transcript */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          <InputConsole
            activeTab={activeTab}
            onTabChange={(tab) => {
              setActiveTab(tab);
              if (tab === "simulator") {
                setActiveText(simulator.accumulatedText);
              } else if (tab === "mic") {
                simulator.pause();
                setActiveText(speech.transcript);
              } else {
                simulator.pause();
                setActiveText(pastedText);
              }
            }}
            simulator={simulator}
            speech={speech}
            pastedText={pastedText}
            onPastedTextChange={handlePastedTextChange}
            onAnalyzePasted={handleAnalyzePasted}
            onScenarioSelect={handleScenarioSelect}
            isAnalyzing={isAnalyzing}
          />

          <TranscriptViewer
            text={activeText}
            evidences={result?.evidences || []}
            redactedItems={result?.redaction.redactedItems || []}
            isStreaming={simulator.isPlaying && !simulator.isPaused}
          />
        </div>

        {/* Right Column (5/12 cols): Active Defense & Threat Meter */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          <ThreatGauge
            score={result?.finalScore || 0}
            level={result?.threatLevel || "SAFE"}
            telemetry={
              result?.telemetry || {
                tier1LatencyMs: 0,
                totalLatencyMs: 0,
                llmCalled: false,
                cacheHit: false,
                language,
              }
            }
            personaLabel={personaConfig.label}
          />

          <ExplainablePanel
            threatCategory={result?.threatCategory || "Benign Communication"}
            tactics={result?.tactics || []}
            explainableReasons={
              result?.explainableReasons || [
                "No coercive, urgency, or isolation tactics detected.",
              ]
            }
            level={result?.threatLevel || "SAFE"}
          />

          <ActionShield
            tailoredExitScript={
              result?.tailoredExitScript ||
              personaConfig.fallbackExitScripts.AUTHORITY_IMPERSONATION
            }
            language={language}
            recommendedAction={
              result?.recommendedAction || personaConfig.defaultActionGuidance.en
            }
            level={result?.threatLevel || "SAFE"}
            threatCategory={result?.threatCategory || "Scam Coercion"}
          />
        </div>
      </main>

      {/* Accessible Footer Landmark */}
      <footer className="border-t border-zinc-800/80 py-4 px-6 text-center text-xs text-zinc-500 font-mono">
        <p>
          KavachAI &bull; Real-Time Defensive Cyber Command Center &bull; Zero Audio Stored &bull; National Helpline 1930
        </p>
      </footer>
    </div>
  );
}
