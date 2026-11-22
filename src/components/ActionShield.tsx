"use client";

import React, { useState } from "react";
import {
  Volume2,
  Copy,
  Check,
  Send,
  PhoneCall,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import { SupportedLanguage, ThreatLevel } from "@/types/kavach";
import { speakScript, stopSpeech } from "@/utils/voiceAlert";

interface ActionShieldProps {
  tailoredExitScript: {
    en: string;
    hi: string;
  };
  language: SupportedLanguage;
  recommendedAction: string;
  level: ThreatLevel;
  threatCategory: string;
}

export const ActionShield: React.FC<ActionShieldProps> = ({
  tailoredExitScript,
  language,
  recommendedAction,
  level,
  threatCategory,
}) => {
  const [overrideLang, setOverrideLang] = useState<SupportedLanguage | null>(null);
  const [copiedScript, setCopiedScript] = useState<boolean>(false);
  const [copiedAlert, setCopiedAlert] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const activeLang = overrideLang ?? language;
  const activeScript =
    activeLang === "hi" ? tailoredExitScript.hi : tailoredExitScript.en;

  const handleCopyScript = () => {
    navigator.clipboard.writeText(activeScript);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const handleSpeak = () => {
    if (isSpeaking) {
      stopSpeech();
      setIsSpeaking(false);
    } else {
      speakScript(activeScript, activeLang);
      setIsSpeaking(true);
      setTimeout(() => setIsSpeaking(false), 7000);
    }
  };

  // Privacy-Safe SOS alert message
  const silentAlertText = `EMERGENCY ALERT: I am on a high-risk call flagged by KavachAI as "${threatCategory}". KavachAI advised me to disconnect immediately and not transfer funds or share OTPs. Please call me back right now! (National Helpline: 1930)`;

  const handleCopyAlert = () => {
    navigator.clipboard.writeText(silentAlertText);
    setCopiedAlert(true);
    setTimeout(() => setCopiedAlert(false), 2000);
  };

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(silentAlertText)}`;

  if (level === "SAFE") {
    return (
      <section className="enterprise-card p-5 flex flex-col items-center justify-center text-center gap-2 text-xs py-7">
        <ShieldCheck className="w-[18px] h-[18px] text-emerald-400 mb-1" strokeWidth={1.75} />
        <h3 className="font-semibold text-sm text-white">Safe to Proceed</h3>
        <p className="text-zinc-400 max-w-sm leading-relaxed">
          No manipulation or extortion patterns detected. If the caller requests OTPs, UPI PINs, or screen-sharing tools, terminate the call immediately.
        </p>
      </section>
    );
  }

  return (
    <section className="enterprise-card p-5 flex flex-col gap-4 border-rose-500/30">
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-[18px] h-[18px] text-rose-400" strokeWidth={1.75} />
          <span className="font-medium text-xs text-zinc-200 tracking-tight">
            Active Defense &amp; Safe Exit
          </span>
        </div>
        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20">
          ACTION REQUIRED
        </span>
      </div>

      {/* Recommended Action Summary */}
      <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-200 leading-relaxed">
        <strong className="text-white block mb-0.5 font-medium">Defense Directive:</strong>
        {recommendedAction}
      </div>

      {/* "Say This & Hang Up" Card */}
      <div className="flex flex-col gap-2.5 p-3.5 rounded-lg bg-[#0B0D11] border border-zinc-800/80">
        <div className="flex items-center justify-between">
          <span className="font-medium text-xs text-zinc-200">
            Say This &amp; Disconnect:
          </span>

          {/* Hindi / English Switcher */}
          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-md p-0.5 text-[11px] font-mono">
            <button
              onClick={() => setOverrideLang("en")}
              className={`px-2 py-0.5 rounded transition-colors ${
                activeLang === "en"
                  ? "bg-zinc-800 text-white font-medium"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              English
            </button>
            <button
              onClick={() => setOverrideLang("hi")}
              className={`px-2 py-0.5 rounded transition-colors ${
                activeLang === "hi"
                  ? "bg-zinc-800 text-white font-medium"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              हिन्दी
            </button>
          </div>
        </div>

        {/* Script Content */}
        <p className="text-xs text-zinc-100 italic p-3 rounded bg-zinc-900/80 border border-zinc-800 leading-relaxed">
          &quot;{activeScript}&quot;
        </p>

        {/* Script Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 mt-0.5">
          <button
            onClick={handleSpeak}
            className={`h-8 px-3 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              isSpeaking
                ? "bg-rose-500 text-white"
                : "bg-white text-black hover:bg-zinc-200 shadow-sm"
            }`}
          >
            <Volume2 className="w-[18px] h-[18px]" strokeWidth={1.75} />
            <span>{isSpeaking ? "Stop Voice" : "Speak Script Aloud"}</span>
          </button>

          <button
            onClick={handleCopyScript}
            className="h-8 px-2.5 rounded-md bg-zinc-800 border border-zinc-700/80 text-zinc-200 hover:text-white hover:bg-zinc-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            {copiedScript ? (
              <Check className="w-[18px] h-[18px] text-emerald-400" strokeWidth={1.75} />
            ) : (
              <Copy className="w-[18px] h-[18px]" strokeWidth={1.75} />
            )}
            <span>{copiedScript ? "Copied" : "Copy Script"}</span>
          </button>
        </div>
      </div>

      {/* "Silent Family Alert" SOS Card */}
      <div className="flex flex-col gap-2.5 p-3.5 rounded-lg bg-[#0B0D11] border border-zinc-800/80">
        <div className="flex items-center justify-between">
          <span className="font-medium text-xs text-zinc-200">
            Silent Family Alert (SOS):
          </span>
          <span className="text-[10px] text-zinc-400 font-mono">
            Zero PII Included
          </span>
        </div>

        <p className="text-[11px] text-zinc-400 font-mono line-clamp-2 bg-zinc-900/80 p-2.5 rounded border border-zinc-800">
          {silentAlertText}
        </p>

        <div className="flex flex-wrap items-center gap-2 mt-0.5">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="h-8 px-3 rounded-md bg-[#25D366]/20 border border-[#25D366]/30 text-[#25D366] hover:bg-[#25D366]/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Send className="w-[18px] h-[18px]" strokeWidth={1.75} />
            <span>WhatsApp Alert</span>
          </a>

          <button
            onClick={handleCopyAlert}
            className="h-8 px-2.5 rounded-md bg-zinc-800 border border-zinc-700/80 text-zinc-200 hover:text-white hover:bg-zinc-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            {copiedAlert ? (
              <Check className="w-[18px] h-[18px] text-emerald-400" strokeWidth={1.75} />
            ) : (
              <Copy className="w-[18px] h-[18px]" strokeWidth={1.75} />
            )}
            <span>{copiedAlert ? "Copied" : "Copy SOS"}</span>
          </button>
        </div>
      </div>

      {/* Helpline Reference */}
      <div className="p-3 rounded-lg bg-[#0B0D11] border border-zinc-800/80 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-rose-300">
          <PhoneCall className="w-[18px] h-[18px] text-rose-400" strokeWidth={1.75} />
          <span>
            Cyber Helpline: <strong className="text-white font-mono tabular-nums">1930</strong>
          </span>
        </div>
        <a
          href="https://cybercrime.gov.in"
          target="_blank"
          rel="noopener noreferrer"
          className="text-zinc-400 hover:text-white flex items-center gap-1 text-[11px] font-mono underline"
        >
          <span>cybercrime.gov.in</span>
          <ExternalLink className="w-3 h-3 text-zinc-400" strokeWidth={1.75} />
        </a>
      </div>
    </section>
  );
};
