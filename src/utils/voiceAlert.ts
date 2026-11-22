import { SupportedLanguage, ThreatLevel } from "@/types/kavach";

/**
 * Module-level guard to prevent repeated CRITICAL alerts within the same session.
 *
 * @remarks
 * This is intentionally a module singleton so the guard survives React re-renders.
 * Call {@link resetVoiceAlertState} in cleanup effects or tests to reset it.
 */
let lastAlertedLevel: ThreatLevel | null = null;

/**
 * Resets the duplicate-alert guard. Call this when the user starts a new call
 * session or in test teardowns so alerts fire fresh.
 */
export function resetVoiceAlertState(): void {
  lastAlertedLevel = null;
}

/**
 * Triggers a spoken CRITICAL threat warning via browser Web Speech Synthesis.
 * Silently no-ops in SSR, in browsers without the API, or when the same level
 * was already announced (unless `force` is true).
 *
 * @param level    - Current threat level (only "CRITICAL" triggers speech).
 * @param language - UI language; "hi" plays a Hindi utterance, "en" plays English.
 * @param force    - When true, bypasses the duplicate-alert guard.
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
 * Reads aloud the tailored exit script so the user can hear what to say to disengage.
 *
 * @param text     - The script text to synthesize.
 * @param language - Language for the utterance voice ("hi" = Hindi, "en" = English).
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

/** Immediately cancels any in-progress speech synthesis utterance. */
export function stopSpeech(): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
}
