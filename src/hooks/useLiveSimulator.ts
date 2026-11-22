"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { SCENARIOS, ScenarioLine } from "@/core/simulator/scenarios";

export function useLiveSimulator(onLineAdded?: (newText: string) => void) {
  const [activeScenarioId, setActiveScenarioId] = useState<string>("digital_arrest_cbi");
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [currentLineIndex, setCurrentLineIndex] = useState<number>(-1);
  const [accumulatedLines, setAccumulatedLines] = useState<ScenarioLine[]>([]);

  const activeScenario = SCENARIOS.find((s) => s.id === activeScenarioId) || SCENARIOS[0];
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const accumulatedText = accumulatedLines.map((l) => l.text).join(" ");

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const advanceLine = useCallback(() => {
    setCurrentLineIndex((prev) => {
      const nextIndex = prev + 1;
      if (nextIndex < activeScenario.lines.length) {
        const newLine = activeScenario.lines[nextIndex];
        setAccumulatedLines((old) => {
          const updated = [...old, newLine];
          const newAccumulated = updated.map((l) => l.text).join(" ");
          if (onLineAdded) onLineAdded(newAccumulated);
          return updated;
        });
        return nextIndex;
      } else {
        setIsPlaying(false);
        setIsPaused(false);
        return prev;
      }
    });
  }, [activeScenario.lines, onLineAdded]);

  useEffect(() => {
    if (isPlaying && !isPaused) {
      timerRef.current = setTimeout(() => {
        advanceLine();
      }, 1900);
    }
    return () => clearTimer();
  }, [isPlaying, isPaused, currentLineIndex, advanceLine]);

  const start = (scenarioId?: string) => {
    clearTimer();
    const targetId = scenarioId || activeScenarioId;
    const targetScenario = SCENARIOS.find((s) => s.id === targetId) || SCENARIOS[0];

    setActiveScenarioId(targetId);
    setAccumulatedLines([targetScenario.lines[0]]);
    setCurrentLineIndex(0);
    setIsPlaying(true);
    setIsPaused(false);

    if (onLineAdded) {
      onLineAdded(targetScenario.lines[0].text);
    }
  };

  const pause = () => {
    clearTimer();
    setIsPaused(true);
  };

  const resume = () => {
    setIsPaused(false);
  };

  const reset = () => {
    clearTimer();
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentLineIndex(-1);
    setAccumulatedLines([]);
    if (onLineAdded) onLineAdded("");
  };

  const stepNext = () => {
    advanceLine();
  };

  return {
    scenarios: SCENARIOS,
    activeScenario,
    activeScenarioId,
    isPlaying,
    isPaused,
    currentLineIndex,
    accumulatedLines,
    accumulatedText,
    start,
    pause,
    resume,
    reset,
    stepNext,
    setActiveScenarioId,
  };
}
