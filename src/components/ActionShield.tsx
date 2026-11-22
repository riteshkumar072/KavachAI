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

  // Construct Privacy-Safe SOS alert for family
  const silentAlertText = `EMERGENCY ALERT: I am on a high-risk call flagged by KavachAI as "${threatCategory}". KavachAI advised me to disconnect immediately and not transfer funds or share OTPs. Please call me back right now! (National Helpline: 1930)`;

  const handleCopyAlert = () => {
    navigator.clipboard.writeText(silentAlertText);
    setCopiedAlert(true);
    setTimeout(() => setCopiedAlert(false), 2000);
  };

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(silentAlertText)}`;

  if (level === "SAFE") {
    return (
      <section className="glass-panel p-4 flex flex-col items-center justify-center text-center gap-2 text-xs py-6">
        <ShieldCheck className="w-8 h-8 text-emerald-400" />
        <h3 className="font-semibold text-sm text-white">Safe to Proceed</h3>
        <p className="text-zinc-400 max-w-sm">
          No manipulative coercion or fraudulent patterns detected. If caller demands OTPs, UPI PINs, or remote software, disconnect immediately.
        </p>
      </section>
    );
  }

  return (
    <section className="glass-panel p-4 flex flex-col gap-4 border-red-500/30">
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          <span className="font-semibold text-xs text-white uppercase tracking-wider">
            Active Defense & Safe Exit Script
          </span>
        </div>
        <span className="text-[11px] text-red-400 font-semibold px-2 py-0.5 rounded bg-red-950/80 border border-red-500/30">
          ACTION REQUIRED
        </span>
      </div>

      {/* Recommended Action Summary */}
      <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-500/20 text-xs text-red-200">
        <strong className="text-white block mb-0.5">Recommended Defense Action:</strong>
        {recommendedAction}
      </div>

      {/* "Say This & Hang Up" Card */}
      <div className="flex flex-col gap-2 p-3 rounded-lg bg-zinc-950/80 border border-white/10">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-xs text-white">
            Say This Firmly &amp; Hang Up:
          </span>

          {/* Hindi / English Toggle for Exit Script */}
          <div className="flex items-center bg-zinc-900 border border-white/10 rounded-md p-0.5 text-[11px]">
            <button
              onClick={() => setOverrideLang("en")}
              className={`px-2 py-0.5 rounded ${
                activeLang === "en"
                  ? "bg-teal-500 text-zinc-950 font-bold"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              English
            </button>
            <button
              onClick={() => setOverrideLang("hi")}
              className={`px-2 py-0.5 rounded ${
                activeLang === "hi"
                  ? "bg-teal-500 text-zinc-950 font-bold"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              हिन्दी
            </button>
          </div>
        </div>

        {/* Script Content */}
        <p className="text-sm text-zinc-100 font-medium italic p-2.5 rounded bg-zinc-900/90 border border-white/5 leading-relaxed">
          &quot;{activeScript}&quot;
        </p>

        {/* Buttons: Speak Script & Copy Script */}
        <div className="flex flex-wrap items-center gap-2 mt-1">
          <button
            onClick={handleSpeak}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              isSpeaking
                ? "bg-red-500 text-white"
                : "bg-teal-500 text-zinc-950 hover:bg-teal-400 shadow-sm"
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>{isSpeaking ? "Stop Voice" : "Speak Script Aloud"}</span>
          </button>

          <button
            onClick={handleCopyScript}
            className="px-2.5 py-1.5 rounded-md bg-zinc-800 border border-white/10 text-zinc-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            {copiedScript ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            <span>{copiedScript ? "Copied!" : "Copy Script"}</span>
          </button>
        </div>
      </div>

      {/* "Silent Family Alert" SOS Card */}
      <div className="flex flex-col gap-2 p-3 rounded-lg bg-zinc-950/80 border border-white/10">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-xs text-white">
            Silent Family Alert (Privacy-Safe SOS):
          </span>
          <span className="text-[10px] text-emerald-400 font-medium">
            Zero Personal Info Shared
          </span>
        </div>

        <p className="text-xs text-zinc-400 line-clamp-2 bg-zinc-900 p-2 rounded border border-white/5 font-mono text-[11px]">
          {silentAlertText}
        </p>

        <div className="flex flex-wrap items-center gap-2 mt-1">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
            <span>1-Click WhatsApp SOS</span>
          </a>

          <button
            onClick={handleCopyAlert}
            className="px-2.5 py-1.5 rounded-md bg-zinc-800 border border-white/10 text-zinc-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            {copiedAlert ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            <span>{copiedAlert ? "Copied SOS!" : "Copy Alert"}</span>
          </button>
        </div>
      </div>

      {/* Official Indian Cyber Crime Helpline Banner */}
      <div className="p-2.5 rounded-lg bg-zinc-900 border border-red-500/30 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-red-300">
          <PhoneCall className="w-4 h-4 text-red-400" />
          <span>
            National Cyber Crime Helpline: <strong className="text-white">1930</strong>
          </span>
        </div>
        <a
          href="https://cybercrime.gov.in"
          target="_blank"
          rel="noopener noreferrer"
          className="text-zinc-400 hover:text-white flex items-center gap-1 text-[11px] underline"
        >
          <span>cybercrime.gov.in</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </section>
  );
};
