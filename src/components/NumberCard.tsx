'use client';

import type { NumberCard as NumberCardType } from '@/data';

interface NumberCardProps {
  card: NumberCardType;
  size?: 'sm' | 'md' | 'lg';
  revealed?: boolean;
  isHighest?: boolean;
  onClick?: () => void;
}

export function NumberCard({
  card,
  size = 'md',
  revealed = true,
  isHighest = false,
  onClick
}: NumberCardProps) {
  const sizeClasses = {
    sm: 'w-16 h-24 text-sm',
    md: 'w-24 h-36 text-base',
    lg: 'w-32 h-48 text-lg'
  };

  const valueSizeClasses = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-6xl'
  };

  if (!revealed) {
    return (
      <div
        onClick={onClick}
        className={`
          ${sizeClasses[size]}
          bg-gradient-to-br from-teal-600 to-teal-800
          rounded-xl shadow-lg border-2 border-teal-400
          flex items-center justify-center
          cursor-pointer hover:scale-105 transition-transform
        `}
      >
        <div className="text-white text-center">
          <div className="text-3xl mb-1">🎴</div>
          <div className="text-xs opacity-80">Tap to reveal</div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`
        ${sizeClasses[size]}
        bg-white rounded-xl shadow-lg
        border-4 ${isHighest ? 'border-amber-400' : 'border-gray-200'}
        flex flex-col items-center justify-between
        p-2 relative
        ${isHighest ? 'ring-2 ring-amber-300 ring-offset-2' : ''}
        ${onClick ? 'cursor-pointer hover:scale-105 transition-transform' : ''}
      `}
    >
      {/* Top corner */}
      <div className="self-start text-teal-600 font-bold">
        {card.value}
      </div>

      {/* Center - Māori number */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className={`${valueSizeClasses[size]} font-bold text-teal-700`}>
          {card.value}
        </div>
        <div className="text-teal-600 font-semibold mt-1">
          {card.maori}
        </div>
      </div>

      {/* Bottom corner (upside down) */}
      <div className="self-end text-teal-600 font-bold rotate-180">
        {card.value}
      </div>

      {/* Pronunciation tooltip */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2
                      bg-gray-800 text-white text-xs px-2 py-1 rounded
                      opacity-0 hover:opacity-100 transition-opacity whitespace-nowrap">
        {card.pronunciation}
      </div>

      {/* Crown for highest */}
      {isHighest && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-2xl">
          👑
        </div>
      )}
    </div>
  );
}

export default NumberCard;
