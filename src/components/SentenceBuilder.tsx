'use client';

import type { Card as CardType, ValidationResult } from '@/types';
import { Card } from './Card';

interface SentenceBuilderProps {
  slots: string[]; // Color pattern for the slots
  placedCards: (CardType | null)[];
  validation?: ValidationResult | null;
  onSlotClick: (index: number) => void;
  onRemoveCard: (index: number) => void;
}

// Slot color classes matching card colors
const slotColors: Record<string, { bg: string; border: string; indicator: string }> = {
  purple: { bg: 'bg-purple-50', border: 'border-purple-300', indicator: 'bg-purple-400' },
  gray: { bg: 'bg-gray-50', border: 'border-gray-300', indicator: 'bg-gray-400' },
  blue: { bg: 'bg-blue-50', border: 'border-blue-300', indicator: 'bg-blue-400' },
  red: { bg: 'bg-red-50', border: 'border-red-300', indicator: 'bg-red-400' },
  green: { bg: 'bg-green-50', border: 'border-green-300', indicator: 'bg-green-400' },
  lightblue: { bg: 'bg-sky-50', border: 'border-sky-300', indicator: 'bg-sky-400' },
  yellow: { bg: 'bg-yellow-50', border: 'border-yellow-300', indicator: 'bg-yellow-400' },
  orange: { bg: 'bg-orange-50', border: 'border-orange-300', indicator: 'bg-orange-400' },
  pink: { bg: 'bg-pink-50', border: 'border-pink-300', indicator: 'bg-pink-400' },
  brown: { bg: 'bg-amber-50', border: 'border-amber-400', indicator: 'bg-amber-500' },
  teal: { bg: 'bg-teal-50', border: 'border-teal-300', indicator: 'bg-teal-400' },
};

// Word type labels for empty slots
const typeLabels: Record<string, string> = {
  purple: 'particle',
  gray: 'article',
  blue: 'noun',
  red: 'pronoun',
  green: 'verb',
  lightblue: 'adjective',
  yellow: 'tense',
  orange: 'demonstrative',
  pink: 'intensifier',
  brown: 'locative',
  teal: 'time',
};

export function SentenceBuilder({
  slots,
  placedCards,
  validation,
  onSlotClick,
  onRemoveCard,
}: SentenceBuilderProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <h3 className="text-xl font-bold text-gray-700 mb-4 text-center">
        Build Your Sentence
      </h3>

      {/* Slots */}
      <div className="flex flex-wrap gap-3 justify-center mb-4">
        {slots.map((color, index) => {
          const card = placedCards[index];
          const colors = slotColors[color] || slotColors.gray;

          return (
            <div
              key={index}
              className={`
                relative w-32 h-40 rounded-xl border-2 border-dashed
                ${colors.bg} ${colors.border}
                flex items-center justify-center
                cursor-pointer hover:shadow-md
                transition-all duration-200
              `}
              onClick={() => card ? onRemoveCard(index) : onSlotClick(index)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  card ? onRemoveCard(index) : onSlotClick(index);
                }
              }}
              aria-label={card ? `Remove ${card.maori}` : `Slot ${index + 1} for ${typeLabels[color] || color}`}
            >
              {card ? (
                <>
                  <Card card={card} size="md" />
                  {/* Remove indicator */}
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md">
                    ×
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 p-4">
                  <div className={`w-10 h-10 rounded-full ${colors.indicator}`} />
                  <span className="text-xs font-medium text-gray-500 capitalize">
                    {typeLabels[color] || color}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Built sentence preview */}
      {placedCards.some(Boolean) && (
        <div className="text-center mb-4">
          <p className="text-lg font-semibold text-gray-800">
            {placedCards.filter(Boolean).map(c => c!.maori).join(' ')}
          </p>
        </div>
      )}

      {/* Validation feedback */}
      {validation && <ValidationFeedback validation={validation} />}
    </div>
  );
}

function ValidationFeedback({ validation }: { validation: ValidationResult }) {
  const bgColors = {
    success: 'bg-green-100 border-green-400 text-green-800',
    warning: 'bg-yellow-100 border-yellow-400 text-yellow-800',
    error: 'bg-red-100 border-red-400 text-red-800',
  };

  const feedbackStyle = bgColors[validation.feedback.type] || bgColors.error;

  return (
    <div className={`rounded-lg border-2 p-4 ${feedbackStyle}`}>
      <p className="font-bold text-lg">{validation.feedback.message}</p>

      {validation.feedback.explanation && (
        <p className="mt-2 text-sm">{validation.feedback.explanation}</p>
      )}

      {validation.feedback.hint && (
        <p className="mt-2 text-sm italic">
          💡 {validation.feedback.hint}
        </p>
      )}

      {validation.valid && validation.translation && (
        <p className="mt-3 text-sm">
          <strong>Translation:</strong> {validation.translation}
        </p>
      )}

      {validation.valid && validation.breakdown.length > 0 && (
        <div className="mt-3">
          <p className="text-sm font-medium mb-1">Breakdown:</p>
          <div className="flex flex-wrap gap-2">
            {validation.breakdown.map((item, i) => (
              <span
                key={i}
                className="bg-white/50 px-2 py-1 rounded text-xs"
              >
                <strong>{item.word}</strong> ({item.role}) = {item.meaning}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default SentenceBuilder;
