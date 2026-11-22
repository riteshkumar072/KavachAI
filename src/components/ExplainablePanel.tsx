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
    <section className="glass-panel p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <div className="flex items-center gap-2">
          <BrainCircuit className="w-4 h-4 text-teal-400" />
          <span className="font-semibold text-xs text-white uppercase tracking-wider">
            Explainable AI (XAI) Threat Breakdown
          </span>
        </div>
        <span className="text-[11px] text-zinc-400">
          Pattern: <strong className="text-zinc-200">{threatCategory}</strong>
        </span>
      </div>

      {/* Psychological Manipulation Tactics Tags */}
      {tactics.length > 0 && (
        <div>
          <span className="text-[11px] text-zinc-400 font-medium block mb-1.5">
            Psychological Vectors Detected:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {tactics.map((tactic, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-900 border border-white/10 text-zinc-300 flex items-center gap-1"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                {tactic}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Plain Language Reasons */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] text-zinc-400 font-medium">
          Detailed Evidence & Logical Reasons:
        </span>
        <ul className="space-y-1.5 text-xs text-zinc-300">
          {explainableReasons.map((reason, idx) => (
            <li
              key={idx}
              className="p-2 rounded bg-zinc-950/60 border border-white/5 flex items-start gap-2"
            >
              {level === "CRITICAL" ? (
                <AlertOctagon className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
              ) : level === "CAUTION" ? (
                <Info className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              )}
              <span className="leading-snug">{reason}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};
