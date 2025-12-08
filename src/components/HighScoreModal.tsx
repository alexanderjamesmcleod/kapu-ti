'use client';

import { useEffect, useRef, useState } from 'react';

interface HighScoreModalProps {
  isOpen: boolean;
  score: number;
  rank: number; // What position they achieved
  onSubmit: (initials: string) => void;
  onClose: () => void;
}

/**
 * Celebratory modal that appears when a player achieves a high score.
 * Features classic arcade-style 3-box initials input with auto-advance.
 */
export function HighScoreModal({
  isOpen,
  score,
  rank,
  onSubmit,
  onClose,
}: HighScoreModalProps) {
  const [initials, setInitials] = useState(['', '', '']);
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // Focus first input when modal opens
  useEffect(() => {
    if (isOpen) {
      setInitials(['', '', '']);
      setTimeout(() => {
        inputRefs[0].current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      // Close on Escape
      if (e.key === 'Escape') {
        onClose();
      }

      // Submit on Enter if all fields filled
      if (e.key === 'Enter') {
        const allFilled = initials.every((initial) => initial.length === 1);
        if (allFilled) {
          handleSubmit();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, initials, onClose]);

  const handleInputChange = (index: number, value: string) => {
    // Only allow A-Z
    const cleanValue = value.toUpperCase().replace(/[^A-Z]/g, '');

    // Take only the first character
    const char = cleanValue.slice(0, 1);

    // Update state
    const newInitials = [...initials];
    newInitials[index] = char;
    setInitials(newInitials);

    // Auto-advance to next box if character entered
    if (char && index < 2) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Backspace: clear current and move to previous if empty
    if (e.key === 'Backspace') {
      if (!initials[index] && index > 0) {
        e.preventDefault();
        const newInitials = [...initials];
        newInitials[index - 1] = '';
        setInitials(newInitials);
        inputRefs[index - 1].current?.focus();
      }
    }

    // Arrow keys for navigation
    if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputRefs[index - 1].current?.focus();
    }
    if (e.key === 'ArrowRight' && index < 2) {
      e.preventDefault();
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleSubmit = () => {
    const initialsString = initials.join('');
    if (initialsString.length === 3) {
      onSubmit(initialsString);
    }
  };

  const getRankSuffix = (rank: number): string => {
    const lastDigit = rank % 10;
    const lastTwoDigits = rank % 100;

    // Handle special cases (11th, 12th, 13th)
    if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
      return 'th';
    }

    switch (lastDigit) {
      case 1:
        return 'st';
      case 2:
        return 'nd';
      case 3:
        return 'rd';
      default:
        return 'th';
    }
  };

  const allFilled = initials.every((initial) => initial.length === 1);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Confetti/sparkle effect - CSS only */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full animate-sparkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="bg-gradient-to-br from-amber-900/95 via-yellow-900/95 to-amber-800/95 rounded-3xl p-8 max-w-md w-full shadow-2xl border-4 border-amber-500/50 relative">
        {/* Glowing border effect */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-amber-400/20 to-yellow-400/20 blur-xl -z-10" />

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-300 mb-2 animate-celebrate">
            🎉 HIGH SCORE! 🎉
          </h1>
          <div className="h-1 w-48 mx-auto bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
        </div>

        {/* Score and Rank */}
        <div className="text-center mb-8">
          <p className="text-3xl md:text-4xl font-bold text-amber-100 mb-2 animate-pulse">
            {score.toLocaleString()} points!
          </p>
          <p className="text-xl text-amber-200/90">
            Rank: <span className="font-bold text-yellow-300">#{rank} {getRankSuffix(rank)}</span> All-Time
          </p>
        </div>

        {/* Initials Input */}
        <div className="mb-8">
          <p className="text-center text-lg text-amber-100 mb-4">Enter your initials:</p>
          <div className="flex justify-center gap-3">
            {initials.map((initial, index) => (
              <div key={index} className="relative">
                <input
                  ref={inputRefs[index]}
                  type="text"
                  maxLength={1}
                  value={initial}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-16 h-20 md:w-20 md:h-24 text-center text-4xl md:text-5xl font-bold bg-amber-950/50 border-3 border-amber-400/60 rounded-lg text-amber-100 focus:outline-none focus:border-yellow-300 focus:ring-4 focus:ring-yellow-400/50 transition-all duration-200 focus:scale-105 uppercase shadow-lg"
                  aria-label={`Initial ${index + 1}`}
                />
                {/* Glow effect on focus */}
                <div className="absolute inset-0 rounded-lg bg-yellow-400/20 blur-md opacity-0 peer-focus:opacity-100 transition-opacity -z-10" />
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={!allFilled}
          className={`
            w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-200 touch-target
            ${
              allFilled
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-amber-950 hover:from-amber-400 hover:to-yellow-400 hover:scale-105 shadow-lg hover:shadow-amber-500/50 cursor-pointer'
                : 'bg-amber-900/50 text-amber-600 cursor-not-allowed'
            }
          `}
        >
          Submit Score
        </button>

        {/* Skip Option */}
        <button
          onClick={onClose}
          className="w-full mt-4 text-amber-300/70 hover:text-amber-200 transition-colors text-sm"
        >
          skip
        </button>
      </div>
    </div>
  );
}
