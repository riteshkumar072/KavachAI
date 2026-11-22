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
  const strokeWidth = 10;
  const circumference = Math.PI * radius; // approx 201.06
  const normalizedScore = Math.min(100, Math.max(0, score));
  const strokeDashoffset = circumference * (1 - normalizedScore / 100);

  const levelColor =
    level === "CRITICAL"
      ? { stroke: "#ef4444", text: "text-red-400", bg: "bg-red-950/80", border: "border-red-500/40" }
      : level === "CAUTION"
      ? { stroke: "#f59e0b", text: "text-amber-400", bg: "bg-amber-950/80", border: "border-amber-500/40" }
      : { stroke: "#10b981", text: "text-emerald-400", bg: "bg-emerald-950/80", border: "border-emerald-500/40" };

  return (
    <section className="glass-panel p-4 flex flex-col items-center justify-between gap-3 text-center relative overflow-hidden">
      {/* Accessible screen reader announcement region */}
      <div className="sr-only" aria-live="assertive" role="status">
        KavachAI threat analysis update: Threat level is {level}. Risk score is {score} out of 100 for {personaLabel}.
      </div>

      <div className="w-full flex items-center justify-between border-b border-white/10 pb-2">
        <span className="font-semibold text-xs text-white uppercase tracking-wider">
          Real-Time Threat Level
        </span>
        <span className="text-[11px] text-zinc-400">
          Target: <strong className="text-zinc-200">{personaLabel}</strong>
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
            stroke="#27272a"
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
        <div className="absolute top-10 flex flex-col items-center">
          <span className={`text-3xl font-extrabold tracking-tight ${levelColor.text}`}>
            {normalizedScore}
          </span>
          <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-medium">
            / 100 Risk
          </span>
        </div>
      </div>

      {/* Threat Level Badge */}
      <div
        className={`px-3 py-1.5 rounded-lg border text-xs font-bold tracking-wide flex items-center gap-2 ${levelColor.bg} ${levelColor.text} ${levelColor.border} ${
          level === "CRITICAL" ? "animate-pulse ring-2 ring-red-500/30" : ""
        }`}
      >
        {level === "CRITICAL" ? (
          <ShieldAlert className="w-4 h-4 fill-current" />
        ) : level === "CAUTION" ? (
          <AlertTriangle className="w-4 h-4 fill-current" />
        ) : (
          <ShieldCheck className="w-4 h-4 fill-current" />
        )}
        <span>
          {level === "CRITICAL"
            ? "CRITICAL THREAT — SCAM DETECTED"
            : level === "CAUTION"
            ? "CAUTION — SUSPICIOUS SIGNALS"
            : "SAFE COMMUNICATION"}
        </span>
      </div>

      {/* Efficiency Telemetry Chip */}
      <div className="w-full pt-2 border-t border-white/5 flex flex-wrap items-center justify-between gap-1 text-[11px] text-zinc-400">
        <span className="flex items-center gap-1">
          <Zap className="w-3 h-3 text-amber-400" />
          Tier-1: <strong className="text-zinc-200 font-mono">{telemetry.tier1LatencyMs}ms</strong>
        </span>

        <span className="flex items-center gap-1">
          <Cpu className="w-3 h-3 text-teal-400" />
          Total: <strong className="text-zinc-200 font-mono">{telemetry.totalLatencyMs}ms</strong>
        </span>

        <span className="text-zinc-500 text-[10px]">
          {telemetry.llmCalled ? "Tier-2 AI Active" : "Tier-1 Deterministic (0 Token Cost)"}
          {telemetry.cacheHit && " (Cache Hit)"}
        </span>
      </div>
    </section>
  );
};
