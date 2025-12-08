'use client';

import { useState } from 'react';
import type { Card as CardType } from '@/types';
import { playPronunciation } from '@/lib/audio';

interface CardProps {
  card: CardType;
  selected?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showEnglish?: boolean;
  onClick?: (card: CardType) => void;
}

// Color classes for each word type - BOLD and DISTINCT for pattern recognition
const colorClasses: Record<string, { bg: string; border: string; text: string }> = {
  purple: {
    bg: 'bg-purple-400',        // Particles - vibrant purple
    border: 'border-purple-600',
    text: 'text-white',
  },
  gray: {
    bg: 'bg-slate-400',         // Articles - cool gray
    border: 'border-slate-600',
    text: 'text-white',
  },
  blue: {
    bg: 'bg-blue-500',          // Nouns - strong blue
    border: 'border-blue-700',
    text: 'text-white',
  },
  red: {
    bg: 'bg-red-500',           // Pronouns - bold red
    border: 'border-red-700',
    text: 'text-white',
  },
  green: {
    bg: 'bg-emerald-500',       // Verbs - rich emerald green
    border: 'border-emerald-700',
    text: 'text-white',
  },
  lightblue: {
    bg: 'bg-cyan-400',          // Adjectives - bright cyan (distinct from blue)
    border: 'border-cyan-600',
    text: 'text-cyan-900',
  },
  yellow: {
    bg: 'bg-yellow-400',        // Tense markers - bright yellow
    border: 'border-yellow-600',
    text: 'text-yellow-900',
  },
  orange: {
    bg: 'bg-orange-500',        // Demonstratives - vivid orange
    border: 'border-orange-700',
    text: 'text-white',
  },
  pink: {
    bg: 'bg-pink-400',          // Intensifiers - bright pink
    border: 'border-pink-600',
    text: 'text-pink-900',
  },
  brown: {
    bg: 'bg-amber-700',         // Locatives - deep brown/amber
    border: 'border-amber-900',
    text: 'text-white',
  },
  teal: {
    bg: 'bg-indigo-400',        // Time words - indigo (distinct from green/blue)
    border: 'border-indigo-600',
    text: 'text-white',
  },
};

const sizeClasses = {
  sm: 'w-20 h-28 text-xs',
  md: 'w-28 h-36 text-sm',
  lg: 'w-36 h-48 text-base',
};

export function Card({
  card,
  selected = false,
  disabled = false,
  size = 'md',
  showEnglish = false,
  onClick,
}: CardProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const colors = colorClasses[card.color] || colorClasses.gray;

  const handleClick = () => {
    if (!disabled && onClick) {
      onClick(card);
    }
  };

  const handlePlayAudio = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) return;

    setIsPlaying(true);
    await playPronunciation(card.maori);
    setTimeout(() => setIsPlaying(false), 1000);
  };

  return (
    <div
      className={`
        ${sizeClasses[size]}
        ${colors.bg}
        ${colors.border}
        ${selected ? 'ring-2 ring-offset-2 ring-gray-800 -translate-y-2 shadow-xl' : 'shadow-md'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : onClick ? 'cursor-pointer hover:-translate-y-1 hover:shadow-lg' : ''}
        rounded-xl border-2 p-2
        flex flex-col justify-between items-center
        transition-all duration-200 ease-out
        select-none relative
      `}
      onClick={handleClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick && !disabled ? 0 : -1}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && onClick && !disabled) {
          e.preventDefault();
          handleClick();
        }
      }}
      aria-label={`${card.maori} - ${card.english}`}
      aria-pressed={selected}
      aria-disabled={disabled}
    >
      {/* Audio button */}
      <button
        className={`
          absolute top-1 right-1 w-6 h-6 rounded-full
          flex items-center justify-center
          ${isPlaying ? 'bg-green-500 text-white' : 'bg-white/80 hover:bg-white'}
          transition-colors text-xs
        `}
        onClick={handlePlayAudio}
        aria-label={`Play pronunciation of ${card.maori}`}
      >
        {isPlaying ? '♪' : '🔊'}
      </button>

      {/* Main word */}
      <div className={`font-bold ${colors.text} text-center leading-tight mt-4`}>
        {showEnglish ? card.english : card.maori}
      </div>

      {/* Translation */}
      <div className={`${colors.text} opacity-80 text-center italic text-[0.65rem] leading-tight px-1`}>
        {showEnglish ? card.maori : card.english}
      </div>

      {/* Word type badge */}
      <div
        className={`
          text-[0.5rem] uppercase tracking-wider font-semibold
          px-2 py-0.5 rounded-full
          bg-white/30 ${colors.text}
        `}
      >
        {card.type.replace('_', ' ')}
      </div>
    </div>
  );
}

export default Card;
