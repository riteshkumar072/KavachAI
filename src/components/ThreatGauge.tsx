"use client";

import React from "react";
import { ShieldCheck, AlertTriangle, ShieldAlert, Zap, Cpu } from "lucide-react";
import { ThreatLevel } from "@/types/kavach";

interface ThreatGaugeProps {
  score: number;
  level: ThreatLevel;
  telemetry: {
    tier1LatencyMs: number;
    totalLatencyMs: number;
    llmCalled: boolean;
    cacheHit: boolean;
  };
  personaLabel: string;
}

export const ThreatGauge: React.FC<ThreatGaugeProps> = ({
  score,
  level,
  telemetry,
  personaLabel,
}) => {
  // Semicircular gauge constants
  const radius = 64;
  const strokeWidth = 8;
  const circumference = Math.PI * radius; // approx 201.06
  const normalizedScore = Math.min(100, Math.max(0, score));
  const strokeDashoffset = circumference * (1 - normalizedScore / 100);

  const levelColor =
    level === "CRITICAL"
      ? { stroke: "#f43f5e", text: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/30" }
      : level === "CAUTION"
      ? { stroke: "#f59e0b", text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30" }
      : { stroke: "#10b981", text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30" };

  return (
    <section className="enterprise-card p-5 flex flex-col items-center justify-between gap-3.5 text-center relative overflow-hidden">
      {/* Screen Reader Announcement Region */}
      <div className="sr-only" aria-live="assertive" role="status">
        KavachAI threat analysis update: Threat level is {level}. Risk score is {score} out of 100 for {personaLabel}.
      </div>

      <div className="w-full flex items-center justify-between border-b border-zinc-800/80 pb-2.5">
        <span className="font-medium text-xs text-zinc-200 tracking-tight">
          Threat Risk Assessment
        </span>
        <span className="text-[11px] text-zinc-400 font-mono">
          Context: <strong className="text-zinc-200 font-sans">{personaLabel}</strong>
        </span>
      </div>

      {/* Semicircular SVG Meter */}
      <div className="relative flex flex-col items-center justify-center my-1">
        <svg
          width="160"
          height="95"
          viewBox="0 0 160 95"
          className="overflow-visible"
          role="img"
          aria-label={`Risk gauge showing ${score} percent risk`}
        >
          {/* Background Track */}
          <path
            d="M 16 80 A 64 64 0 0 1 144 80"
            fill="none"
            stroke="#1c1f26"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Active Colored Arc */}
          <path
            d="M 16 80 A 64 64 0 0 1 144 80"
            fill="none"
            stroke={levelColor.stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-500 ease-out"
          />
        </svg>

        {/* Center Readout */}
        <div className="absolute top-8 flex flex-col items-center">
          <span className={`text-4xl font-bold font-mono tabular-nums tracking-tight ${levelColor.text}`}>
            {normalizedScore}
          </span>
          <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-mono">
            / 100 Risk
          </span>
        </div>
      </div>

      {/* Threat Level Badge */}
      <div
        className={`px-3 py-1.5 rounded-md border text-xs font-semibold tracking-wide flex items-center gap-2 ${levelColor.bg} ${levelColor.text} ${levelColor.border}`}
      >
        {level === "CRITICAL" ? (
          <ShieldAlert className="w-[18px] h-[18px] text-rose-400" strokeWidth={1.75} />
        ) : level === "CAUTION" ? (
          <AlertTriangle className="w-[18px] h-[18px] text-amber-400" strokeWidth={1.75} />
        ) : (
          <ShieldCheck className="w-[18px] h-[18px] text-emerald-400" strokeWidth={1.75} />
        )}
        <span>
          {level === "CRITICAL"
            ? "CRITICAL THREAT — SCAM DETECTED"
            : level === "CAUTION"
            ? "CAUTION — SUSPICIOUS SIGNALS"
            : "SAFE COMMUNICATION"}
        </span>
      </div>

      {/* Telemetry Strip */}
      <div className="w-full pt-2.5 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-1.5 text-[11px] text-zinc-400 font-mono tabular-nums">
        <span className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-zinc-400" strokeWidth={1.75} />
          Tier-1: <strong className="text-zinc-200">{telemetry.tier1LatencyMs}ms</strong>
        </span>

        <span className="flex items-center gap-1.5">
          <Cpu className="w-3.5 h-3.5 text-zinc-400" strokeWidth={1.75} />
          Total: <strong className="text-zinc-200">{telemetry.totalLatencyMs}ms</strong>
        </span>

        <span className="text-zinc-500 text-[10px]">
          {telemetry.llmCalled ? "Tier-2 AI Active" : "Heuristic Only (0 Cost)"}
          {telemetry.cacheHit && " (Cached)"}
        </span>
      </div>
    </section>
  );
};
