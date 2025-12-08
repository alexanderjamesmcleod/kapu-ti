'use client';

import { useEffect, useRef, useCallback } from 'react';
import { playSound, initAudio, isSoundEnabled, toggleSound as toggleSoundLib } from '@/lib/sounds';

interface UseGameSoundsOptions {
  turnTimeRemaining: number | null;
  isMyTurn: boolean;
  gamePhase: string | null;
  chillMode?: boolean;  // When true, suppress timer sounds
}

/**
 * Hook to play game sounds based on game state
 * Handles timer sounds, turn notifications, etc.
 */
export function useGameSounds({
  turnTimeRemaining,
  isMyTurn,
  gamePhase,
  chillMode = false,
}: UseGameSoundsOptions) {
  const lastTimeRef = useRef<number | null>(null);
  const lastPhaseRef = useRef<string | null>(null);
  const wasMyTurnRef = useRef(false);
  const audioInitialized = useRef(false);

  // Initialize audio on first interaction
  const ensureAudioInitialized = useCallback(() => {
    if (!audioInitialized.current) {
      initAudio();
      audioInitialized.current = true;
    }
  }, []);

  // Timer tick sounds (suppressed in chill mode)
  useEffect(() => {
    if (turnTimeRemaining === null || gamePhase !== 'playing' || chillMode) {
      lastTimeRef.current = null;
      return;
    }

    // Only play sounds when the timer changes (not initial render)
    if (lastTimeRef.current === null) {
      lastTimeRef.current = turnTimeRemaining;
      return;
    }

    // Timer went down
    if (turnTimeRemaining < lastTimeRef.current) {
      ensureAudioInitialized();

      if (turnTimeRemaining === 0) {
        // Time expired!
        playSound('timerExpired');
      } else if (turnTimeRemaining <= 5) {
        // Urgent - under 5 seconds
        playSound('timerUrgent');
      } else if (turnTimeRemaining <= 10) {
        // Warning - under 10 seconds
        playSound('timerTick');
      }
    }

    lastTimeRef.current = turnTimeRemaining;
  }, [turnTimeRemaining, gamePhase, ensureAudioInitialized]);

  // Turn start sound
  useEffect(() => {
    if (isMyTurn && !wasMyTurnRef.current && gamePhase === 'playing') {
      ensureAudioInitialized();
      playSound('turnStart');
    }
    wasMyTurnRef.current = isMyTurn;
  }, [isMyTurn, gamePhase, ensureAudioInitialized]);

  // Phase change sounds
  useEffect(() => {
    if (gamePhase === null || lastPhaseRef.current === null) {
      lastPhaseRef.current = gamePhase;
      return;
    }

    if (gamePhase !== lastPhaseRef.current) {
      ensureAudioInitialized();

      // Phase transitions
      if (gamePhase === 'playing' && lastPhaseRef.current === 'topicSelect') {
        playSound('gameStart');
      }
    }

    lastPhaseRef.current = gamePhase;
  }, [gamePhase, ensureAudioInitialized]);

  // Manual sound triggers
  const playCardSound = useCallback(() => {
    ensureAudioInitialized();
    playSound('cardPlay');
  }, [ensureAudioInitialized]);

  const playCardPickupSound = useCallback(() => {
    ensureAudioInitialized();
    playSound('cardPickup');
  }, [ensureAudioInitialized]);

  const playVoteSubmitSound = useCallback(() => {
    ensureAudioInitialized();
    playSound('voteSubmit');
  }, [ensureAudioInitialized]);

  const playVoteApprovedSound = useCallback(() => {
    ensureAudioInitialized();
    playSound('voteApproved');
  }, [ensureAudioInitialized]);

  const playVoteRejectedSound = useCallback(() => {
    ensureAudioInitialized();
    playSound('voteRejected');
  }, [ensureAudioInitialized]);

  const playPlayerJoinSound = useCallback(() => {
    ensureAudioInitialized();
    playSound('playerJoin');
  }, [ensureAudioInitialized]);

  const playTopicSelectSound = useCallback(() => {
    ensureAudioInitialized();
    playSound('topicSelect');
  }, [ensureAudioInitialized]);

  const toggleSound = useCallback(() => {
    ensureAudioInitialized();
    return toggleSoundLib();
  }, [ensureAudioInitialized]);

  return {
    // Manual triggers
    playCardSound,
    playCardPickupSound,
    playVoteSubmitSound,
    playVoteApprovedSound,
    playVoteRejectedSound,
    playPlayerJoinSound,
    playTopicSelectSound,

    // Settings
    isSoundEnabled,
    toggleSound,
    ensureAudioInitialized,
  };
}
