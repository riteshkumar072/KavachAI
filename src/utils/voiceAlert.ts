import { SupportedLanguage, ThreatLevel } from "@/types/kavach";

let lastAlertedLevel: ThreatLevel | null = null;

/**
 * Spoken Voice Alert using browser-native Web Speech Synthesis.
 * Speaks once when threat level escalates to CRITICAL to warn the user without spamming.
 */
export function triggerThreatVoiceAlert(
  level: ThreatLevel,
  language: SupportedLanguage = "en",
  force = false
): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

  if (!force && lastAlertedLevel === level) return;
  lastAlertedLevel = level;

  if (level !== "CRITICAL") return;

  window.speechSynthesis.cancel();

  const message =
    language === "hi"
      ? "सावधान! यह स्कैम कॉल हो सकती है। कृपया ओटीपी या पैसे शेयर न करें और तुरंत कॉल काट दें।"
      : "Warning. High scam risk detected. Do not share OTP or transfer money. Hang up safely.";

  const utterance = new SpeechSynthesisUtterance(message);
  utterance.lang = language === "hi" ? "hi-IN" : "en-IN";
  utterance.rate = 0.95;
  utterance.pitch = 1.0;

  window.speechSynthesis.speak(utterance);
}

/**
 * Reads aloud the tailored exit script so a senior citizen or user can hear what to say.
 */
export function speakScript(
  text: string,
  language: SupportedLanguage = "en"
): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = language === "hi" ? "hi-IN" : "en-IN";
  utterance.rate = 0.9;
  utterance.pitch = 1.0;

  window.speechSynthesis.speak(utterance);
}

export function stopSpeech(): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
}
