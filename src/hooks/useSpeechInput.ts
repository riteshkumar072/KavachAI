"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { SupportedLanguage } from "@/types/kavach";

// Minimal interface for browser SpeechRecognition
interface IWindowSpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionResultItem {
  transcript: string;
}

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      [index: number]: SpeechRecognitionResultItem;
      isFinal: boolean;
    };
  };
}

export function useSpeechInput(
  language: SupportedLanguage = "en",
  /**
   * Callback fired whenever the transcript text changes.
   *
   * @remarks
   * The caller **must** pass a stable (memoized) reference — e.g. wrapped in
   * `useCallback` — to avoid restarting the SpeechRecognition instance on
   * every render.  Passing an inline function literal here will cause the
   * `useEffect` that re-initialises recognition to run continuously.
   */
  onTranscriptChange?: (text: string) => void
) {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>("");
  const [isSupported] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    return Boolean(
      (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition
    );
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const recognitionRef = useRef<IWindowSpeechRecognition | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognitionAPI =
      (window as unknown as { SpeechRecognition?: new () => IWindowSpeechRecognition })
        .SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => IWindowSpeechRecognition })
        .webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      return;
    }

    try {
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language === "hi" ? "hi-IN" : "en-IN";

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let currentFullTranscript = "";
        for (let i = 0; i < event.results.length; i++) {
          currentFullTranscript += event.results[i][0].transcript + " ";
        }
        const cleaned = currentFullTranscript.trim();
        setTranscript(cleaned);
        if (onTranscriptChange) {
          onTranscriptChange(cleaned);
        }
      };

      recognition.onerror = (event: { error: string }) => {
        console.warn("KavachAI Speech Recognition error:", event.error);
        if (event.error === "not-allowed") {
          setErrorMessage("Microphone access was denied. Please allow microphone permissions.");
        } else {
          setErrorMessage(`Speech recognition error: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } catch (e) {
      console.warn("Speech Recognition initialization failed:", e);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [language, onTranscriptChange]);

  const startListening = useCallback(() => {
    setErrorMessage(null);
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.lang = language === "hi" ? "hi-IN" : "en-IN";
      recognitionRef.current.start();
      setIsListening(true);
    } catch (err) {
      console.warn("Failed to start speech recognition:", err);
    }
  }, [language]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
      setIsListening(false);
    } catch (err) {
      console.warn("Failed to stop speech recognition:", err);
    }
  }, []);

  const clearTranscript = useCallback(() => {
    setTranscript("");
    if (onTranscriptChange) onTranscriptChange("");
  }, [onTranscriptChange]);

  return {
    isListening,
    transcript,
    isSupported,
    errorMessage,
    startListening,
    stopListening,
    clearTranscript,
  };
}
