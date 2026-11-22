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
    <aside
      aria-label="Privacy and Compliance Telemetry"
      className="w-full bg-[#0B0D11] border-b border-zinc-800/80 px-4 md:px-6 py-2 text-xs"
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-zinc-400">
        {/* Left items: Privacy-by-Design Guarantees */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5 text-zinc-300">
            <ShieldCheck className="w-[18px] h-[18px] text-emerald-400" strokeWidth={1.75} />
            <span className="font-medium">Zero Audio Stored</span>
          </div>

          <div className="flex items-center gap-1.5 text-zinc-300">
            <Cpu className="w-[18px] h-[18px] text-zinc-400" strokeWidth={1.75} />
            <span>Ephemeral Memory Only</span>
          </div>

          {/* Pre-LLM PII Masking Counter */}
          <div
            className={`flex items-center gap-1.5 transition-all px-2 py-0.5 rounded border ${
              totalRedacted > 0
                ? "bg-zinc-800/90 text-zinc-100 border-zinc-700"
                : "bg-zinc-900/50 text-zinc-400 border-zinc-800/80"
            }`}
          >
            <Lock className="w-[18px] h-[18px] text-zinc-400" strokeWidth={1.75} />
            <span>
              Pre-LLM Masked:{" "}
              <strong className="text-white font-mono tabular-nums">{totalRedacted}</strong> PII entities
            </span>
            {redactedItems.length > 0 && (
              <span className="text-[10px] text-zinc-400 font-mono hidden lg:inline">
                ({redactedItems.map((i) => `${i.type}: ${i.count}`).join(", ")})
              </span>
            )}
          </div>
        </div>

        {/* Right items: Latency Telemetry & National Helpline */}
        <div className="flex items-center gap-3 ml-auto">
          <span className="text-[11px] text-zinc-500 font-mono tabular-nums hidden md:inline">
            Heuristic: <span className="text-zinc-300">{tier1LatencyMs}ms</span> | Engine:{" "}
            <span className="text-zinc-300">{engineUsed}</span>
          </span>

          <a
            href="https://cybercrime.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-300 hover:text-rose-200 hover:bg-rose-500/15 transition-colors"
            title="Official National Cyber Crime Reporting Portal"
          >
            <PhoneCall className="w-[18px] h-[18px] text-rose-400" strokeWidth={1.75} />
            <span className="font-semibold font-mono tabular-nums">Helpline: 1930</span>
            <ExternalLink className="w-3 h-3 text-rose-400" strokeWidth={1.75} />
          </a>
        </div>
      </div>
    </aside>
  );
};
