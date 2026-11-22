"use client";

import React from "react";
import { BrainCircuit, CheckCircle2, AlertOctagon, Info } from "lucide-react";
import { ThreatLevel } from "@/types/kavach";

interface ExplainablePanelProps {
  threatCategory: string;
  tactics: string[];
  explainableReasons: string[];
  level: ThreatLevel;
}

export const ExplainablePanel: React.FC<ExplainablePanelProps> = ({
  threatCategory,
  tactics,
  explainableReasons,
  level,
}) => {
  return (
    <section className="enterprise-card p-5 flex flex-col gap-3.5">
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5">
        <div className="flex items-center gap-2">
          <BrainCircuit className="w-[18px] h-[18px] text-zinc-300" strokeWidth={1.75} />
          <span className="font-medium text-xs text-zinc-200 tracking-tight">
            Explainable AI (XAI) Diagnostics
          </span>
        </div>
        <span className="text-[11px] text-zinc-400 font-mono">
          Pattern: <strong className="text-zinc-200 font-sans">{threatCategory}</strong>
        </span>
      </div>

      {/* Psychological Manipulation Tactics Tags */}
      {tactics.length > 0 && (
        <div>
          <span className="text-[11px] text-zinc-400 font-medium block mb-1.5">
            Identified Threat Vectors:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {tactics.map((tactic, idx) => (
              <span
                key={idx}
                className="px-2.5 py-0.5 rounded text-[11px] font-medium bg-[#0B0D11] border border-zinc-800 text-zinc-300 flex items-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                {tactic}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Plain Language Reasons */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] text-zinc-400 font-medium">
          Evidence &amp; Threat Breakdown:
        </span>
        <ul className="space-y-1.5 text-xs text-zinc-300">
          {explainableReasons.map((reason, idx) => (
            <li
              key={idx}
              className="p-3 rounded-lg bg-[#0B0D11] border border-zinc-800/80 flex items-start gap-2.5 leading-relaxed"
            >
              {level === "CRITICAL" ? (
                <AlertOctagon className="w-[18px] h-[18px] text-rose-400 shrink-0 mt-0.5" strokeWidth={1.75} />
              ) : level === "CAUTION" ? (
                <Info className="w-[18px] h-[18px] text-amber-400 shrink-0 mt-0.5" strokeWidth={1.75} />
              ) : (
                <CheckCircle2 className="w-[18px] h-[18px] text-emerald-400 shrink-0 mt-0.5" strokeWidth={1.75} />
              )}
              <span className="text-zinc-300">{reason}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};
