"use client";

import React from "react";
import { ShieldCheck, Cpu, Lock, PhoneCall, ExternalLink } from "lucide-react";
import { RedactedItem, AnalysisEngineUsed } from "@/types/kavach";

interface PrivacyAuditBarProps {
  redactedItems: RedactedItem[];
  totalRedacted: number;
  engineUsed: AnalysisEngineUsed;
  tier1LatencyMs: number;
}

export const PrivacyAuditBar: React.FC<PrivacyAuditBarProps> = ({
  redactedItems,
  totalRedacted,
  engineUsed,
  tier1LatencyMs,
}) => {
  return (
    <div className="w-full bg-zinc-900/60 border-b border-white/5 px-4 py-2 text-xs">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-zinc-400">
        {/* Left items: Security & Privacy Guarantees */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="font-medium">Zero Audio Stored</span>
          </div>

          <div className="flex items-center gap-1.5 text-zinc-300">
            <Cpu className="w-3.5 h-3.5 text-zinc-400" />
            <span>In-Memory Only</span>
          </div>

          {/* Live PII Masking Counter */}
          <div
            className={`flex items-center gap-1.5 transition-all ${
              totalRedacted > 0
                ? "text-cyan-300 font-semibold px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30 animate-pulse"
                : "text-zinc-400"
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-cyan-400" />
            <span>
              Pre-LLM Masked:{" "}
              <strong className="text-white">{totalRedacted}</strong> PII entities
            </span>
            {redactedItems.length > 0 && (
              <span className="text-[10px] text-cyan-400/80 hidden sm:inline">
                ({redactedItems.map((i) => `${i.type}: ${i.count}`).join(", ")})
              </span>
            )}
          </div>
        </div>

        {/* Right items: Telemetry & National Helpline */}
        <div className="flex items-center gap-3 ml-auto">
          <span className="text-[11px] text-zinc-500 hidden md:inline">
            Tier-1 Heuristic: <span className="text-zinc-300 font-mono">{tier1LatencyMs}ms</span>{" "}
            | Mode: <span className="text-zinc-300">{engineUsed}</span>
          </span>

          <a
            href="https://cybercrime.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-950/60 border border-red-500/30 text-red-300 hover:text-red-200 transition-colors"
            title="Official Ministry of Home Affairs Cyber Crime Portal"
          >
            <PhoneCall className="w-3 h-3 text-red-400" />
            <span className="font-semibold">Helpline: 1930</span>
            <ExternalLink className="w-2.5 h-2.5 text-red-400" />
          </a>
        </div>
      </div>
    </div>
  );
};
