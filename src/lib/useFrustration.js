// ============================================================
//  useFrustration.js
//  React hook that tracks frustration signals in real time.
//  Fires onFrustrationTriggered() when the threshold is crossed.
//
//  Signals tracked:
//    - rapidClicks     (timestamp array)
//    - wrongAttempts   (consecutive counter)
//    - idkClicks       ("I don't understand" button)
//    - flaggedLanguage (keyword matches from chat input)
//
//  TODO: wire elevenLabs / Cloudinary reframe calls here.
// ============================================================

import { useState, useRef, useCallback } from 'react';
import { FRUSTRATION_CONFIG } from './mockData';

const {
  rapidClickWindow,
  rapidClickThreshold,
  wrongAttemptsThreshold,
  idkButtonThreshold,
  frustrationScoreThreshold,
  keywordsToFlag,
} = FRUSTRATION_CONFIG;

export function useFrustration({ onFrustrationTriggered } = {}) {
  const [rapidClickCount, setRapidClickCount]   = useState(0);
  const [wrongAttempts, setWrongAttempts]       = useState(0);
  const [idkClicks, setIdkClicks]               = useState(0);
  const [flaggedPhrases, setFlaggedPhrases]     = useState([]);
  const [frustrationScore, setFrustrationScore] = useState(0);
  const [triggered, setTriggered]               = useState(false);

  const clickTimestamps = useRef([]);

  // Re-compute score from all signals
  const computeScore = useCallback((clicks, wrong, idk, phrases) => {
    let score = 0;
    if (clicks >= rapidClickThreshold)   score += 25;
    if (wrong  >= wrongAttemptsThreshold) score += 30;
    if (idk    >= idkButtonThreshold)    score += 20;
    if (phrases.length > 0)              score += 25;
    return Math.min(score, 100);
  }, []);

  // Call this on every button/click event in the lesson UI
  const recordClick = useCallback(() => {
    const now = Date.now();
    const window_ms = rapidClickWindow * 1000;

    clickTimestamps.current = [
      ...clickTimestamps.current.filter(t => now - t < window_ms),
      now,
    ];

    const recent = clickTimestamps.current.length;
    setRapidClickCount(recent);

    const score = computeScore(recent, wrongAttempts, idkClicks, flaggedPhrases);
    setFrustrationScore(score);
    maybeFireTrigger(score);
  }, [wrongAttempts, idkClicks, flaggedPhrases, computeScore]);

  // Call this on a wrong answer
  const recordWrongAnswer = useCallback(() => {
    const next = wrongAttempts + 1;
    setWrongAttempts(next);
    const score = computeScore(rapidClickCount, next, idkClicks, flaggedPhrases);
    setFrustrationScore(score);
    maybeFireTrigger(score);
  }, [wrongAttempts, rapidClickCount, idkClicks, flaggedPhrases, computeScore]);

  // Reset wrong answer streak on a correct answer
  const recordCorrectAnswer = useCallback(() => {
    setWrongAttempts(0);
  }, []);

  // Call this when the "I don't understand" button is pressed
  const recordIdkClick = useCallback(() => {
    const next = idkClicks + 1;
    setIdkClicks(next);
    const score = computeScore(rapidClickCount, wrongAttempts, next, flaggedPhrases);
    setFrustrationScore(score);
    maybeFireTrigger(score);
  }, [idkClicks, rapidClickCount, wrongAttempts, flaggedPhrases, computeScore]);

  // Call this with any text the student types / speaks
  const analyzeLanguage = useCallback((text) => {
    if (!text) return;
    const lower = text.toLowerCase();
    const matched = keywordsToFlag.filter(kw => lower.includes(kw));
    if (matched.length > 0) {
      setFlaggedPhrases(prev => {
        const combined = [...new Set([...prev, ...matched])];
        const score = computeScore(rapidClickCount, wrongAttempts, idkClicks, combined);
        setFrustrationScore(score);
        maybeFireTrigger(score);
        return combined;
      });
    }
  }, [rapidClickCount, wrongAttempts, idkClicks, computeScore]);

  function maybeFireTrigger(score) {
    if (!triggered && score >= frustrationScoreThreshold) {
      setTriggered(true);
      onFrustrationTriggered && onFrustrationTriggered(score);
    }
  }

  // Reset everything for a new question or session
  const reset = useCallback(() => {
    setRapidClickCount(0);
    setWrongAttempts(0);
    setIdkClicks(0);
    setFlaggedPhrases([]);
    setFrustrationScore(0);
    setTriggered(false);
    clickTimestamps.current = [];
  }, []);

  // Human-readable frustration level
  const level =
    frustrationScore >= 70 ? 'high' :
    frustrationScore >= 35 ? 'moderate' : 'low';

  return {
    rapidClickCount,
    wrongAttempts,
    idkClicks,
    flaggedPhrases,
    frustrationScore,
    level,
    triggered,
    recordClick,
    recordWrongAnswer,
    recordCorrectAnswer,
    recordIdkClick,
    analyzeLanguage,
    reset,
  };
}
