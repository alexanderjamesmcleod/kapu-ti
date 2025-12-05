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

// Color classes for each word type
const colorClasses: Record<string, { bg: string; border: string; text: string }> = {
  purple: {
    bg: 'bg-purple-100',
    border: 'border-purple-400',
    text: 'text-purple-800',
  },
  gray: {
    bg: 'bg-gray-100',
    border: 'border-gray-400',
    text: 'text-gray-800',
  },
  blue: {
    bg: 'bg-blue-100',
    border: 'border-blue-400',
    text: 'text-blue-800',
  },
  red: {
    bg: 'bg-red-100',
    border: 'border-red-400',
    text: 'text-red-800',
  },
  green: {
    bg: 'bg-green-100',
    border: 'border-green-400',
    text: 'text-green-800',
  },
  lightblue: {
    bg: 'bg-sky-100',
    border: 'border-sky-400',
    text: 'text-sky-800',
  },
  yellow: {
    bg: 'bg-yellow-100',
    border: 'border-yellow-400',
    text: 'text-yellow-800',
  },
  orange: {
    bg: 'bg-orange-100',
    border: 'border-orange-400',
    text: 'text-orange-800',
  },
  pink: {
    bg: 'bg-pink-100',
    border: 'border-pink-400',
    text: 'text-pink-800',
  },
  brown: {
    bg: 'bg-amber-100',
    border: 'border-amber-600',
    text: 'text-amber-800',
  },
  teal: {
    bg: 'bg-teal-100',
    border: 'border-teal-400',
    text: 'text-teal-800',
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
      <div className="text-gray-600 text-center italic text-[0.65rem] leading-tight px-1">
        {showEnglish ? card.maori : card.english}
      </div>

      {/* Word type badge */}
      <div
        className={`
          text-[0.5rem] uppercase tracking-wider font-medium
          ${colors.text} opacity-70
          px-2 py-0.5 rounded-full
          ${colors.bg} border ${colors.border}
        `}
      >
        {card.type.replace('_', ' ')}
      </div>
    </div>
  );
}

export default Card;
