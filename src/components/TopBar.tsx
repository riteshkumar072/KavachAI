"use client";

import React from "react";
import {
  ShieldAlert,
  Volume2,
  VolumeX,
  Eye,
  Sparkles,
  Zap,
} from "lucide-react";
import {
  UserPersonaId,
  SupportedLanguage,
  AnalysisEngineUsed,
} from "@/types/kavach";
import { PERSONA_CONFIGS } from "@/core/context/personaRules";

interface TopBarProps {
  persona: UserPersonaId;
  onPersonaChange: (p: UserPersonaId) => void;
  language: SupportedLanguage;
  onLanguageChange: (l: SupportedLanguage) => void;
  seniorMode: boolean;
  onSeniorModeToggle: () => void;
  voiceAlertEnabled: boolean;
  onVoiceAlertToggle: () => void;
  engineUsed: AnalysisEngineUsed;
}

export const TopBar: React.FC<TopBarProps> = ({
  persona,
  onPersonaChange,
  language,
  onLanguageChange,
  seniorMode,
  onSeniorModeToggle,
  voiceAlertEnabled,
  onVoiceAlertToggle,
  engineUsed,
}) => {
  return (
    <header className="w-full border-b border-white/10 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50 px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand & Engine Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-white">
                  Kavach<span className="text-teal-400">AI</span>
                </span>
                <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                  v2.5
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 hidden sm:block">
                Context-Aware Defense Against Digital Arrest & Voice Scams
              </p>
            </div>
          </div>

          {/* Engine Mode Pill */}
          <div className="ml-2">
            {engineUsed === "TIER_2_AI" ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-teal-950/80 text-teal-300 border border-teal-500/30">
                <Sparkles className="w-3 h-3 text-teal-400" />
                Tier-2 Deep AI
              </span>
            ) : engineUsed === "TIER_1_FALLBACK" ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
                <Zap className="w-3 h-3 text-emerald-400" />
                Local Heuristic Mode
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-800 text-zinc-300 border border-zinc-700">
                <Zap className="w-3 h-3 text-zinc-400" />
                Tier-1 Local (Fast)
              </span>
            )}
          </div>
        </div>

        {/* Action Controls & Persona Selector */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          {/* Persona Switcher */}
          <div
            className="flex items-center bg-zinc-900 border border-white/10 rounded-lg p-0.5"
            role="group"
            aria-label="User Persona Selector"
          >
            {(["senior_citizen", "college_student", "small_merchant"] as UserPersonaId[]).map(
              (id) => {
                const config = PERSONA_CONFIGS[id];
                const active = persona === id;
                return (
                  <button
                    key={id}
                    onClick={() => onPersonaChange(id)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                      active
                        ? "bg-teal-500 text-zinc-950 font-semibold shadow-sm"
                        : "text-zinc-400 hover:text-white"
                    }`}
                    aria-pressed={active}
                  >
                    {language === "hi" ? config.hindiLabel : config.label}
                  </button>
                );
              }
            )}
          </div>

          {/* Language Toggle */}
          <button
            onClick={() => onLanguageChange(language === "en" ? "hi" : "en")}
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-zinc-900 border border-white/10 text-zinc-300 hover:text-white transition-colors flex items-center gap-1"
            title="Toggle Language (English / Hindi)"
            aria-label={`Language toggle: currently ${language.toUpperCase()}`}
          >
            <span>{language === "en" ? "EN" : "HI"}</span>
            <span className="text-zinc-500 text-[10px]">
              ({language === "en" ? "हिन्दी" : "English"})
            </span>
          </button>

          {/* Voice Alert Toggle */}
          <button
            onClick={onVoiceAlertToggle}
            className={`p-1.5 rounded-lg border text-xs transition-colors flex items-center gap-1.5 ${
              voiceAlertEnabled
                ? "bg-teal-950/60 border-teal-500/40 text-teal-300"
                : "bg-zinc-900 border-white/10 text-zinc-400 hover:text-zinc-200"
            }`}
            title={voiceAlertEnabled ? "Spoken voice warnings enabled" : "Voice warnings muted"}
            aria-label={voiceAlertEnabled ? "Disable voice warnings" : "Enable voice warnings"}
          >
            {voiceAlertEnabled ? (
              <Volume2 className="w-4 h-4 text-teal-400" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
            <span className="hidden lg:inline text-[11px]">
              {voiceAlertEnabled ? "Voice Alerts" : "Muted"}
            </span>
          </button>

          {/* Senior High-Contrast Mode Toggle */}
          <button
            onClick={onSeniorModeToggle}
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors flex items-center gap-1.5 ${
              seniorMode
                ? "bg-amber-400 text-black border-amber-300 font-bold"
                : "bg-zinc-900 border-white/10 text-zinc-300 hover:text-white"
            }`}
            title="Toggle Senior High-Contrast Accessible View"
            aria-pressed={seniorMode}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Senior View</span>
          </button>
        </div>
      </div>
    </header>
  );
};
