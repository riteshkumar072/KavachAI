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
    bg: "bg-rose-500/15",
    text: "text-rose-300",
    border: "border-rose-500/30",
    label: "Fake Authority",
  },
  COERCIVE_URGENCY: {
    bg: "bg-amber-500/15",
    text: "text-amber-300",
    border: "border-amber-500/30",
    label: "Coercive Urgency",
  },
  ISOLATION_SECRECY: {
    bg: "bg-purple-500/15",
    text: "text-purple-300",
    border: "border-purple-500/30",
    label: "Isolation Coercion",
  },
  FINANCIAL_EXTRACTION: {
    bg: "bg-rose-500/20",
    text: "text-rose-200",
    border: "border-rose-500/40",
    label: "Fund / PIN Extraction",
  },
  LEGAL_FEAR_MONGERING: {
    bg: "bg-amber-500/15",
    text: "text-amber-300",
    border: "border-amber-500/30",
    label: "Legal Intimidation",
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
      <section className="enterprise-card p-5 flex flex-col items-center justify-center min-h-[220px] text-zinc-500 text-xs">
        <ShieldCheck className="w-[18px] h-[18px] text-zinc-600 mb-2" strokeWidth={1.75} />
        <p className="font-medium text-zinc-400">Live Transcript Inactive</p>
        <p className="text-[11px] text-zinc-600 mt-1 max-w-xs text-center font-mono">
          Activate call simulator or microphone to begin real-time vector analysis.
        </p>
      </section>
    );
  }

  // Sort evidences by startIndex to segment text into non-overlapping spans
  const sortedEvidences = [...evidences].sort((a, b) => a.startIndex - b.startIndex);

  interface Segment {
    type: "text" | "evidence";
    content: string;
    evidence?: MatchedEvidence;
  }

  const segments: Segment[] = [];
  let currentIndex = 0;

  for (const ev of sortedEvidences) {
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
    <section className="enterprise-card p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5">
        <div className="flex items-center gap-2.5">
          <span className="font-medium text-xs text-zinc-200 tracking-tight">
            Live Stream Transcript
          </span>
          {isStreaming && (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
              SCANNING
            </span>
          )}
        </div>

        {evidences.length > 0 && (
          <span className="text-[11px] text-rose-400 font-mono tabular-nums font-medium">
            {evidences.length} threat signal{evidences.length > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Transcript Stream Box */}
      <div
        className="p-4 rounded-lg bg-[#0B0D11] border border-zinc-800/80 text-xs font-mono leading-relaxed min-h-[160px] relative select-text"
        aria-label="Highlighted call transcript"
      >
        {segments.map((seg, idx) => {
          if (seg.type === "text") {
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
                        className="inline-flex items-center gap-1 mx-1 px-1.5 py-0.5 rounded bg-zinc-800/90 border border-zinc-700 text-zinc-300 font-mono text-[11px] tabular-nums font-semibold"
                        title="Pre-LLM Masked PII: Real identifier masked locally before processing"
                      >
                        <Lock className="w-3 h-3 text-zinc-400" strokeWidth={1.75} />
                        {p}
                      </span>
                    );
                  }
                  return <span key={pIdx} className="text-zinc-300">{p}</span>;
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
                className={`inline-block mx-0.5 px-1.5 py-0.5 rounded cursor-pointer border ${style.bg} ${style.text} ${style.border} font-medium underline decoration-dotted transition-colors hover:brightness-110`}
                title={`${style.label}: ${seg.evidence.explanation}`}
                tabIndex={0}
                role="button"
                aria-label={`Threat phrase: ${seg.content}. ${style.label}: ${seg.evidence.explanation}`}
              >
                {seg.content}
              </span>
            );
          }

          return null;
        })}

        {isStreaming && (
          <span className="inline-block w-1.5 h-3.5 bg-zinc-400 ml-1 animate-pulse align-middle" />
        )}
      </div>

      {/* Hover Tooltip Card */}
      {activeTooltip && (
        <div className="p-3 rounded-lg bg-[#161922] border border-zinc-700 text-xs flex items-start gap-2.5 shadow-xl animate-in fade-in duration-100">
          <AlertCircle className="w-[18px] h-[18px] text-amber-400 shrink-0 mt-0.5" strokeWidth={1.75} />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-white">
                Flagged: &quot;{activeTooltip.phrase}&quot;
              </span>
              <span className="px-1.5 py-0.2 rounded font-mono text-[10px] font-medium bg-zinc-800 text-zinc-300 border border-zinc-700">
                {CATEGORY_STYLES[activeTooltip.category].label} (+{activeTooltip.weight} pts)
              </span>
            </div>
            <p className="text-zinc-400 text-[11px] mt-1 leading-relaxed">
              {activeTooltip.explanation}
            </p>
          </div>
        </div>
      )}

      {/* Itemized PII Redaction Badges */}
      {redactedItems.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-zinc-400 pt-1.5 border-t border-zinc-800/80">
          <span className="text-[11px] text-zinc-500 font-mono">PII Redactions:</span>
          {redactedItems.map((item, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#0B0D11] border border-zinc-800 text-zinc-300 text-[11px] font-mono tabular-nums"
            >
              <Lock className="w-3 h-3 text-zinc-400" strokeWidth={1.75} />
              {item.type} ({item.count})
            </span>
          ))}
        </div>
      )}
    </section>
  );
};
