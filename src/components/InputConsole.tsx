"use client";

import React from "react";
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Mic,
  MicOff,
  ClipboardPaste,
  Sparkles,
  Info,
} from "lucide-react";
import { useLiveSimulator } from "@/hooks/useLiveSimulator";
import { useSpeechInput } from "@/hooks/useSpeechInput";
import { SCENARIOS } from "@/core/simulator/scenarios";
import type { UserPersonaId } from "@/types/kavach";

interface InputConsoleProps {
  activeTab: "simulator" | "mic" | "paste";
  onTabChange: (tab: "simulator" | "mic" | "paste") => void;
  simulator: ReturnType<typeof useLiveSimulator>;
  speech: ReturnType<typeof useSpeechInput>;
  pastedText: string;
  onPastedTextChange: (text: string) => void;
  onAnalyzePasted: () => void;
  isAnalyzing: boolean;
  onScenarioSelect: (scenarioId: string, targetPersona: UserPersonaId) => void;
}

export const InputConsole: React.FC<InputConsoleProps> = ({
  activeTab,
  onTabChange,
  simulator,
  speech,
  pastedText,
  onPastedTextChange,
  onAnalyzePasted,
  isAnalyzing,
  onScenarioSelect,
}) => {
  return (
    <section className="enterprise-card p-5 flex flex-col gap-4">
      {/* Tab Navigation (Linear Style) */}
      <div
        className="flex items-center gap-1.5 p-1 bg-[#0B0D11] border border-zinc-800/80 rounded-lg w-full sm:w-fit"
        role="tablist"
        aria-label="Input Mode Tabs"
      >
        <button
          role="tab"
          aria-selected={activeTab === "simulator"}
          onClick={() => onTabChange("simulator")}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs transition-colors ${
            activeTab === "simulator"
              ? "bg-zinc-800 text-white font-medium shadow-sm border border-zinc-700/60"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Play className="w-[18px] h-[18px] fill-current" strokeWidth={1.75} />
          <span>Call Simulator</span>
          <span className="font-mono text-[10px] px-1 py-0.2 rounded bg-zinc-700/60 text-zinc-300">
            DEMO
          </span>
        </button>

        <button
          role="tab"
          aria-selected={activeTab === "mic"}
          onClick={() => onTabChange("mic")}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs transition-colors ${
            activeTab === "mic"
              ? "bg-zinc-800 text-white font-medium shadow-sm border border-zinc-700/60"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Mic className="w-[18px] h-[18px]" strokeWidth={1.75} />
          <span>Live Audio</span>
          {speech.isListening && (
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
          )}
        </button>

        <button
          role="tab"
          aria-selected={activeTab === "paste"}
          onClick={() => onTabChange("paste")}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs transition-colors ${
            activeTab === "paste"
              ? "bg-zinc-800 text-white font-medium shadow-sm border border-zinc-700/60"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <ClipboardPaste className="w-[18px] h-[18px]" strokeWidth={1.75} />
          <span>Paste Text</span>
        </button>
      </div>

      {/* Tab 1: 1-Click Simulator Panel */}
      {activeTab === "simulator" && (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {SCENARIOS.map((sc) => {
              const isSelected = simulator.activeScenarioId === sc.id;
              const isSafe = sc.id === "safe_bank_call";
              return (
                <button
                  key={sc.id}
                  onClick={() => {
                    onScenarioSelect(sc.id, sc.targetPersona);
                  }}
                  className={`text-left p-3 rounded-lg border transition-all flex flex-col justify-between ${
                    isSelected
                      ? "bg-[#161922] border-zinc-600 ring-1 ring-zinc-500/30"
                      : "bg-[#0B0D11] border-zinc-800/80 hover:border-zinc-700 text-zinc-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-1.5 mb-1.5">
                    <span className="font-medium text-xs text-white tracking-tight">
                      {sc.title}
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-medium ${
                        isSafe
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-300 border border-rose-500/20"
                      }`}
                    >
                      {sc.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                    {sc.description}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Simulator Control Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 rounded-lg bg-[#0B0D11] border border-zinc-800/80">
            <div className="flex items-center gap-2">
              {simulator.isPlaying && !simulator.isPaused ? (
                <button
                  onClick={simulator.pause}
                  className="h-8 px-3 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium flex items-center gap-1.5 hover:bg-amber-500/20 transition-colors"
                >
                  <Pause className="w-[18px] h-[18px]" strokeWidth={1.75} />
                  <span>Pause</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    if (simulator.currentLineIndex === -1) {
                      simulator.start();
                    } else {
                      simulator.resume();
                    }
                  }}
                  className="h-8 px-3.5 rounded-md bg-white text-black font-semibold text-xs flex items-center gap-1.5 hover:bg-zinc-200 transition-colors shadow-sm"
                >
                  <Play className="w-[18px] h-[18px] fill-current" strokeWidth={1.75} />
                  <span>
                    {simulator.currentLineIndex === -1 ? "Play Stream" : "Resume"}
                  </span>
                </button>
              )}

              <button
                onClick={simulator.stepNext}
                disabled={
                  simulator.currentLineIndex >=
                  simulator.activeScenario.lines.length - 1
                }
                className="h-8 px-2.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 text-xs font-medium flex items-center gap-1 disabled:opacity-40 transition-colors"
                title="Step forward 1 line"
              >
                <SkipForward className="w-[18px] h-[18px]" strokeWidth={1.75} />
                <span>Step</span>
              </button>

              <button
                onClick={simulator.reset}
                className="h-8 px-2.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 text-xs font-medium flex items-center gap-1 transition-colors"
                title="Reset simulation"
              >
                <RotateCcw className="w-[18px] h-[18px]" strokeWidth={1.75} />
                <span>Reset</span>
              </button>
            </div>

            <div className="flex items-center gap-2.5 text-xs text-zinc-400 font-mono tabular-nums">
              <span>
                Line:{" "}
                <strong className="text-white">
                  {Math.max(0, simulator.currentLineIndex + 1)}
                </strong>{" "}
                / {simulator.activeScenario.lines.length}
              </span>
              <span className="text-zinc-700">|</span>
              <span className="text-[11px] text-zinc-400">
                1.9s Interval
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Live Microphone Panel */}
      {activeTab === "mic" && (
        <div className="flex flex-col gap-3 py-1">
          {!speech.isSupported ? (
            <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2.5">
              <Info className="w-[18px] h-[18px] shrink-0 mt-0.5 text-amber-400" strokeWidth={1.75} />
              <div>
                <p className="font-semibold">Web Speech API Unavailable</p>
                <p className="text-amber-400/80 mt-0.5 leading-relaxed">
                  Speech recognition requires a supported Chromium browser (Chrome or Edge).
                  Please use the <strong>Call Simulator</strong> tab to test live streaming audio defense.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-6 rounded-lg bg-[#0B0D11] border border-zinc-800/80 gap-3 text-center">
              <button
                onClick={() => {
                  if (speech.isListening) {
                    speech.stopListening();
                  } else {
                    speech.startListening();
                  }
                }}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  speech.isListening
                    ? "bg-rose-500 text-white animate-pulse ring-4 ring-rose-500/20 shadow-lg shadow-rose-500/20"
                    : "bg-zinc-800 text-zinc-100 hover:bg-zinc-700 border border-zinc-700"
                }`}
                aria-label={speech.isListening ? "Stop listening" : "Start listening"}
              >
                {speech.isListening ? (
                  <MicOff className="w-[18px] h-[18px]" strokeWidth={1.75} />
                ) : (
                  <Mic className="w-[18px] h-[18px]" strokeWidth={1.75} />
                )}
              </button>

              <div>
                <p className="font-medium text-xs text-white">
                  {speech.isListening
                    ? "Listening in Real-Time (English / Hindi)..."
                    : "Click to Begin Audio Input Stream"}
                </p>
                <p className="text-[11px] text-zinc-500 mt-1">
                  Audio processed locally in memory. Zero cloud storage.
                </p>
              </div>

              {speech.transcript && (
                <button
                  onClick={speech.clearTranscript}
                  className="text-xs text-zinc-400 hover:text-white underline mt-1"
                >
                  Clear Audio Transcript
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Paste SMS / Transcript Panel */}
      {activeTab === "paste" && (
        <div className="flex flex-col gap-3">
          <textarea
            value={pastedText}
            onChange={(e) => onPastedTextChange(e.target.value)}
            placeholder="Paste suspicious communication, message, or call transcript here..."
            className="w-full h-28 p-3 rounded-lg bg-[#0B0D11] border border-zinc-800/80 text-xs text-zinc-100 placeholder-zinc-500 focus:border-zinc-600 focus:outline-none resize-none font-mono"
            aria-label="Pasted communication transcript"
          />

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-zinc-500 font-mono">Samples:</span>
              <button
                onClick={() =>
                  onPastedTextChange(
                    "This is Mumbai Cyber Crime CBI. You are under Digital Arrest. Transfer 50,000 to RBI verification account."
                  )
                }
                className="text-[11px] px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 hover:text-white border border-zinc-800 font-mono"
              >
                CBI Digital Arrest
              </button>
              <button
                onClick={() =>
                  onPastedTextChange(
                    "FedEx Support: Illegal parcel with MDMA found linked to Aadhaar 4829 1920 3841. Install AnyDesk."
                  )
                }
                className="text-[11px] px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 hover:text-white border border-zinc-800 font-mono"
              >
                FedEx Parcel
              </button>
              <button
                onClick={() =>
                  onPastedTextChange(
                    "Courtesy KYC notice: Bank never asks for OTP or PIN. Visit nearest branch with your ID."
                  )
                }
                className="text-[11px] px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 hover:text-white border border-zinc-800 font-mono"
              >
                Safe Bank KYC
              </button>
            </div>

            <button
              onClick={onAnalyzePasted}
              disabled={isAnalyzing || !pastedText.trim()}
              className="h-8 px-3 rounded-md bg-white text-black font-semibold text-xs flex items-center gap-1.5 hover:bg-zinc-200 disabled:opacity-40 transition-colors shadow-sm ml-auto"
            >
              <Sparkles className="w-[18px] h-[18px]" strokeWidth={1.75} />
              <span>{isAnalyzing ? "Analyzing..." : "Analyze Threat"}</span>
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
