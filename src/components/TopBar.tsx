"use client";

import React from "react";
import {
  ShieldAlert,
  Volume2,
  VolumeX,
  Eye,
  Cpu,
  Languages,
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
    <header className="w-full h-14 border-b border-zinc-800/80 bg-[#09090B]/90 backdrop-blur-md sticky top-0 z-50 px-4 md:px-6">
      <div className="max-w-7xl h-full mx-auto flex items-center justify-between gap-4">
        {/* Brand & Engine Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-zinc-900 border border-zinc-700/80 flex items-center justify-center text-zinc-100 shadow-sm">
              <ShieldAlert className="w-[18px] h-[18px] text-zinc-200" strokeWidth={1.75} />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm tracking-tight text-white">
                Kavach<span className="text-zinc-400 font-normal">AI</span>
              </span>
              <span className="text-[10px] font-mono tracking-wider uppercase px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800 hidden sm:inline-block">
                DEFENSE
              </span>
            </div>
          </div>

          <div className="h-4 w-px bg-zinc-800 hidden sm:block" />

          {/* Engine Mode Status Badge */}
          <div className="hidden sm:flex items-center">
            {engineUsed === "TIER_2_AI" ? (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                AI Active
              </span>
            ) : engineUsed === "TIER_1_FALLBACK" ? (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono bg-zinc-800/80 text-zinc-300 border border-zinc-700/80">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                Local Heuristic
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono bg-zinc-900 text-zinc-400 border border-zinc-800">
                <Cpu className="w-3 h-3 text-zinc-400" strokeWidth={1.75} />
                Tier-1 Local
              </span>
            )}
          </div>
        </div>

        {/* Action Controls & Persona Selector */}
        <div className="flex items-center gap-2">
          {/* Persona Segmented Control */}
          <div
            className="flex items-center bg-[#111318] border border-zinc-800/80 rounded-lg p-0.5"
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
                    className={`px-2.5 py-1 text-xs transition-all rounded-[5px] ${
                      active
                        ? "bg-zinc-800 text-white font-medium shadow-sm border border-zinc-700/60"
                        : "text-zinc-400 hover:text-zinc-200"
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
            className="h-8 px-2.5 rounded-md bg-[#111318] border border-zinc-800/80 text-zinc-300 hover:text-white hover:border-zinc-700 text-xs font-mono transition-colors flex items-center gap-1.5"
            title="Toggle Language (English / Hindi)"
            aria-label={`Language toggle: currently ${language.toUpperCase()}`}
          >
            <Languages className="w-[18px] h-[18px] text-zinc-400" strokeWidth={1.75} />
            <span>{language.toUpperCase()}</span>
          </button>

          {/* Voice Alert Toggle */}
          <button
            onClick={onVoiceAlertToggle}
            className={`h-8 px-2.5 rounded-md border text-xs transition-colors flex items-center gap-1.5 ${
              voiceAlertEnabled
                ? "bg-zinc-800 text-zinc-100 border-zinc-700"
                : "bg-[#111318] border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
            }`}
            title={voiceAlertEnabled ? "Spoken voice warnings enabled" : "Voice warnings muted"}
            aria-label={voiceAlertEnabled ? "Disable voice warnings" : "Enable voice warnings"}
          >
            {voiceAlertEnabled ? (
              <Volume2 className="w-[18px] h-[18px] text-zinc-200" strokeWidth={1.75} />
            ) : (
              <VolumeX className="w-[18px] h-[18px] text-zinc-500" strokeWidth={1.75} />
            )}
            <span className="hidden md:inline font-mono text-[11px]">
              {voiceAlertEnabled ? "Audio On" : "Muted"}
            </span>
          </button>

          {/* Senior High-Contrast Mode Toggle */}
          <button
            onClick={onSeniorModeToggle}
            className={`h-8 px-2.5 rounded-md border text-xs font-medium transition-colors flex items-center gap-1.5 ${
              seniorMode
                ? "bg-white text-black border-white font-semibold"
                : "bg-[#111318] border-zinc-800/80 text-zinc-300 hover:text-white hover:border-zinc-700"
            }`}
            title="Toggle Senior High-Contrast Mode"
            aria-pressed={seniorMode}
          >
            <Eye className="w-[18px] h-[18px]" strokeWidth={1.75} />
            <span className="hidden sm:inline">High Contrast</span>
          </button>
        </div>
      </div>
    </header>
  );
};
