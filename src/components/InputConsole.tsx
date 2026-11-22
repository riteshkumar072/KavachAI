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

interface InputConsoleProps {
  activeTab: "simulator" | "mic" | "paste";
  onTabChange: (tab: "simulator" | "mic" | "paste") => void;
  simulator: ReturnType<typeof useLiveSimulator>;
  speech: ReturnType<typeof useSpeechInput>;
  pastedText: string;
  onPastedTextChange: (text: string) => void;
  onAnalyzePasted: () => void;
  isAnalyzing: boolean;
  onScenarioSelect?: (scenarioId: string, targetPersona: import("@/types/kavach").UserPersonaId) => void;
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
    <section className="glass-panel p-4 flex flex-col gap-4">
      {/* Tab Navigation */}
      <div
        className="flex border-b border-white/10 pb-2 gap-2"
        role="tablist"
        aria-label="Input Mode Tabs"
      >
        <button
          role="tab"
          aria-selected={activeTab === "simulator"}
          onClick={() => onTabChange("simulator")}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === "simulator"
              ? "bg-teal-500/20 text-teal-300 border border-teal-500/40"
              : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
          }`}
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>1-Click Scam Simulator</span>
          <span className="px-1.5 py-0.2 rounded bg-teal-500/30 text-teal-200 text-[10px]">
            Judge Demo
          </span>
        </button>

        <button
          role="tab"
          aria-selected={activeTab === "mic"}
          onClick={() => onTabChange("mic")}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === "mic"
              ? "bg-teal-500/20 text-teal-300 border border-teal-500/40"
              : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
          }`}
        >
          <Mic className="w-3.5 h-3.5" />
          <span>Live Microphone</span>
          {speech.isListening && (
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          )}
        </button>

        <button
          role="tab"
          aria-selected={activeTab === "paste"}
          onClick={() => onTabChange("paste")}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === "paste"
              ? "bg-teal-500/20 text-teal-300 border border-teal-500/40"
              : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
          }`}
        >
          <ClipboardPaste className="w-3.5 h-3.5" />
          <span>Paste SMS / Transcript</span>
        </button>
      </div>

      {/* Tab 1: 1-Click Simulator Panel */}
      {activeTab === "simulator" && (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {SCENARIOS.map((sc) => {
              const isSelected = simulator.activeScenarioId === sc.id;
              return (
                <button
                  key={sc.id}
                  onClick={() => {
                    if (onScenarioSelect) {
                      onScenarioSelect(sc.id, sc.targetPersona);
                    } else {
                      simulator.reset();
                      simulator.start(sc.id);
                    }
                  }}
                  className={`text-left p-2.5 rounded-lg border transition-all flex flex-col justify-between ${
                    isSelected
                      ? "bg-teal-950/40 border-teal-500/50 ring-1 ring-teal-500/40"
                      : "bg-zinc-900/60 border-white/5 hover:border-white/20 text-zinc-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <span className="font-semibold text-xs text-white">
                      {sc.title}
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-medium ${
                        sc.id === "safe_bank_call"
                          ? "bg-emerald-950/80 text-emerald-400 border border-emerald-500/30"
                          : "bg-red-950/80 text-red-300 border border-red-500/30"
                      }`}
                    >
                      {sc.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 line-clamp-2">
                    {sc.description}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Simulator Controls & Progress */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-lg bg-zinc-950/60 border border-white/5">
            <div className="flex items-center gap-2">
              {simulator.isPlaying && !simulator.isPaused ? (
                <button
                  onClick={simulator.pause}
                  className="px-3 py-1.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold flex items-center gap-1.5 hover:bg-amber-500/30 transition-colors"
                >
                  <Pause className="w-3.5 h-3.5" />
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
                  className="px-3 py-1.5 rounded-md bg-teal-500 text-zinc-950 font-semibold text-xs flex items-center gap-1.5 hover:bg-teal-400 transition-colors shadow-sm"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
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
                className="px-2.5 py-1.5 rounded-md bg-zinc-800 border border-white/10 text-zinc-300 text-xs font-medium flex items-center gap-1 hover:bg-zinc-700 disabled:opacity-40 transition-colors"
                title="Step forward 1 line"
              >
                <SkipForward className="w-3.5 h-3.5" />
                <span>Step</span>
              </button>

              <button
                onClick={simulator.reset}
                className="px-2.5 py-1.5 rounded-md bg-zinc-800 border border-white/10 text-zinc-300 text-xs font-medium flex items-center gap-1 hover:bg-zinc-700 transition-colors"
                title="Reset simulation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <span>
                Line:{" "}
                <strong className="text-white">
                  {Math.max(0, simulator.currentLineIndex + 1)}
                </strong>{" "}
                / {simulator.activeScenario.lines.length}
              </span>
              <span className="text-zinc-600">|</span>
              <span className="text-[11px] text-teal-400/90 font-medium">
                Auto-advances every 1.9s
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Live Microphone Panel */}
      {activeTab === "mic" && (
        <div className="flex flex-col gap-3 py-2">
          {!speech.isSupported ? (
            <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Web Speech API Not Supported</p>
                <p className="text-amber-400/80 mt-0.5">
                  Your current browser does not support native speech recognition.
                  For the best experience, please use the <strong>1-Click Scam Simulator</strong> or
                  paste sample text in the <strong>Paste SMS / Transcript</strong> tab.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-6 rounded-lg bg-zinc-950/60 border border-white/5 gap-3 text-center">
              <button
                onClick={() => {
                  if (speech.isListening) {
                    speech.stopListening();
                  } else {
                    speech.startListening();
                  }
                }}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                  speech.isListening
                    ? "bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30 ring-4 ring-red-500/20"
                    : "bg-teal-500 text-zinc-950 hover:bg-teal-400 shadow-md"
                }`}
                aria-label={speech.isListening ? "Stop listening" : "Start listening"}
              >
                {speech.isListening ? (
                  <MicOff className="w-6 h-6" />
                ) : (
                  <Mic className="w-6 h-6" />
                )}
              </button>

              <div>
                <p className="font-semibold text-sm text-white">
                  {speech.isListening
                    ? "Listening in Real-Time (English / Hindi)..."
                    : "Click to Start Live Audio Analysis"}
                </p>
                <p className="text-xs text-zinc-400 mt-1">
                  Audio is processed locally in browser memory. Zero audio is stored or uploaded.
                </p>
              </div>

              {speech.transcript && (
                <button
                  onClick={speech.clearTranscript}
                  className="text-xs text-zinc-400 hover:text-white underline mt-2"
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
            placeholder="Paste suspicious WhatsApp message, SMS, or phone call transcript here..."
            className="w-full h-28 p-3 rounded-lg bg-zinc-950/80 border border-white/10 text-xs text-zinc-100 placeholder-zinc-500 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none resize-none font-mono"
            aria-label="Pasted communication transcript"
          />

          <div className="flex flex-wrap items-center justify-between gap-2">
            {/* Quick Sample Prompts */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-zinc-500 font-medium">Quick Test:</span>
              <button
                onClick={() =>
                  onPastedTextChange(
                    "This is Mumbai Cyber Crime CBI. You are under Digital Arrest. Transfer 50,000 to RBI verification account."
                  )
                }
                className="text-[11px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 hover:text-white border border-white/5"
              >
                Digital Arrest
              </button>
              <button
                onClick={() =>
                  onPastedTextChange(
                    "FedEx Support: Illegal parcel with MDMA found linked to Aadhaar 4829 1920 3841. Install AnyDesk."
                  )
                }
                className="text-[11px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 hover:text-white border border-white/5"
              >
                FedEx Contraband
              </button>
              <button
                onClick={() =>
                  onPastedTextChange(
                    "Courtesy KYC notice: Bank never asks for OTP or PIN. Visit nearest branch with your ID."
                  )
                }
                className="text-[11px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 hover:text-white border border-white/5"
              >
                Safe Bank Notice
              </button>
            </div>

            <button
              onClick={onAnalyzePasted}
              disabled={isAnalyzing || !pastedText.trim()}
              className="px-3.5 py-1.5 rounded-lg bg-teal-500 text-zinc-950 font-semibold text-xs flex items-center gap-1.5 hover:bg-teal-400 disabled:opacity-40 transition-colors shadow-sm ml-auto"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isAnalyzing ? "Analyzing..." : "Analyze Threat"}</span>
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
