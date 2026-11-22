"use client";

import React, { useState } from "react";
import { AlertCircle, Lock, ShieldCheck } from "lucide-react";
import { MatchedEvidence, RedactedItem, ThreatVectorCategory } from "@/types/kavach";

interface TranscriptViewerProps {
  text: string;
  evidences: MatchedEvidence[];
  redactedItems: RedactedItem[];
  isStreaming?: boolean;
}

const CATEGORY_STYLES: Record<
  ThreatVectorCategory,
  { bg: string; text: string; border: string; label: string }
> = {
  AUTHORITY_IMPERSONATION: {
    bg: "bg-rose-950/70",
    text: "text-rose-300",
    border: "border-rose-500/40",
    label: "Fake Authority",
  },
  COERCIVE_URGENCY: {
    bg: "bg-amber-950/70",
    text: "text-amber-300",
    border: "border-amber-500/40",
    label: "Artificial Urgency",
  },
  ISOLATION_SECRECY: {
    bg: "bg-purple-950/70",
    text: "text-purple-300",
    border: "border-purple-500/40",
    label: "Isolation Coercion",
  },
  FINANCIAL_EXTRACTION: {
    bg: "bg-red-950/80",
    text: "text-red-300",
    border: "border-red-500/50",
    label: "PIN / Fund Extraction",
  },
  LEGAL_FEAR_MONGERING: {
    bg: "bg-orange-950/70",
    text: "text-orange-300",
    border: "border-orange-500/40",
    label: "Legal Fear Tactic",
  },
};

export const TranscriptViewer: React.FC<TranscriptViewerProps> = ({
  text,
  evidences,
  redactedItems,
  isStreaming = false,
}) => {
  const [activeTooltip, setActiveTooltip] = useState<MatchedEvidence | null>(null);

  if (!text || text.trim().length === 0) {
    return (
      <section className="glass-panel p-4 flex flex-col items-center justify-center min-h-[220px] text-zinc-500 text-xs">
        <ShieldCheck className="w-8 h-8 text-zinc-600 mb-2" />
        <p className="font-medium text-zinc-400">Live Transcript Inactive</p>
        <p className="text-[11px] text-zinc-600 mt-1 max-w-xs text-center">
          Start the 1-Click Simulator, activate your microphone, or paste a message to begin real-time threat scanning.
        </p>
      </section>
    );
  }

  // Segment the text into highlighted spans and normal text
  // Sort evidences by startIndex to construct non-overlapping intervals
  const sortedEvidences = [...evidences].sort((a, b) => a.startIndex - b.startIndex);

  interface Segment {
    type: "text" | "evidence" | "redacted";
    content: string;
    evidence?: MatchedEvidence;
  }

  const segments: Segment[] = [];
  let currentIndex = 0;

  for (const ev of sortedEvidences) {
    // Avoid overlap if earlier match already covered this
    if (ev.startIndex < currentIndex) continue;

    if (ev.startIndex > currentIndex) {
      segments.push({
        type: "text",
        content: text.slice(currentIndex, ev.startIndex),
      });
    }

    segments.push({
      type: "evidence",
      content: text.slice(ev.startIndex, ev.endIndex),
      evidence: ev,
    });

    currentIndex = ev.endIndex;
  }

  if (currentIndex < text.length) {
    segments.push({
      type: "text",
      content: text.slice(currentIndex),
    });
  }

  return (
    <section className="glass-panel p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-xs text-white uppercase tracking-wider">
            Live Streamed Transcript
          </span>
          {isStreaming && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-red-950/80 text-red-400 border border-red-500/30 animate-pulse font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
              LIVE SCANNING
            </span>
          )}
        </div>

        {evidences.length > 0 && (
          <span className="text-[11px] text-red-400 font-medium">
            {evidences.length} threat indicator{evidences.length > 1 ? "s" : ""} flagged
          </span>
        )}
      </div>

      {/* Transcript Text Box with Inline Color-Coded Spans */}
      <div
        className="p-3.5 rounded-lg bg-zinc-950/80 border border-white/10 text-sm leading-relaxed min-h-[160px] font-sans relative"
        aria-label="Highlighted call transcript"
      >
        {segments.map((seg, idx) => {
          if (seg.type === "text") {
            // Render redacted tokens as badges inside text
            const parts = seg.content.split(
              /(\[REDACTED_(?:AADHAAR|PAN|PHONE|OTP|UPI|CARD)\])/g
            );

            return (
              <span key={idx}>
                {parts.map((p, pIdx) => {
                  if (p.startsWith("[REDACTED_")) {
                    return (
                      <span
                        key={pIdx}
                        className="inline-flex items-center gap-1 mx-1 px-2 py-0.5 rounded bg-cyan-950/90 border border-cyan-500/40 text-cyan-300 font-mono text-[11px] font-semibold tracking-wide"
                        title="Pre-LLM PII Token: Real personal identifier masked before processing"
                      >
                        <Lock className="w-3 h-3 text-cyan-400" />
                        {p}
                      </span>
                    );
                  }
                  return <span key={pIdx} className="text-zinc-200">{p}</span>;
                })}
              </span>
            );
          }

          if (seg.type === "evidence" && seg.evidence) {
            const style = CATEGORY_STYLES[seg.evidence.category];
            return (
              <span
                key={idx}
                onMouseEnter={() => setActiveTooltip(seg.evidence!)}
                onMouseLeave={() => setActiveTooltip(null)}
                className={`inline-block mx-0.5 px-1.5 py-0.5 rounded cursor-pointer border ${style.bg} ${style.text} ${style.border} font-medium underline decoration-dotted transition-transform hover:scale-[1.02]`}
                title={`${style.label}: ${seg.evidence.explanation}`}
                tabIndex={0}
                role="button"
                aria-label={`Flagged threat phrase: ${seg.content}. ${style.label}: ${seg.evidence.explanation}`}
              >
                {seg.content}
              </span>
            );
          }

          return null;
        })}

        {isStreaming && (
          <span className="inline-block w-2 h-4 bg-teal-400 ml-1 animate-pulse align-middle" />
        )}
      </div>

      {/* Hover / Click Explanation Tooltip Card */}
      {activeTooltip && (
        <div className="p-2.5 rounded-lg bg-zinc-900 border border-white/20 text-xs flex items-start gap-2 shadow-xl animate-in fade-in duration-150">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white">
                Flagged: &quot;{activeTooltip.phrase}&quot;
              </span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-zinc-800 text-zinc-300 border border-zinc-700">
                {CATEGORY_STYLES[activeTooltip.category].label} (+{activeTooltip.weight} pts)
              </span>
            </div>
            <p className="text-zinc-400 text-[11px] mt-0.5">
              {activeTooltip.explanation}
            </p>
          </div>
        </div>
      )}

      {/* Itemized PII Redactions Pill Row */}
      {redactedItems.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-zinc-400 pt-1 border-t border-white/5">
          <span className="text-[11px] text-zinc-500 font-medium">PII Masked:</span>
          {redactedItems.map((item, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-900 border border-cyan-500/30 text-cyan-300 text-[11px] font-mono"
            >
              <Lock className="w-3 h-3 text-cyan-400" />
              {item.type} ({item.count})
            </span>
          ))}
        </div>
      )}
    </section>
  );
};
