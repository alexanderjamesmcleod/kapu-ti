'use client';

import { useState } from 'react';
import { Card as CardComponent } from './Card';
import type { Card as CardType } from '@/types';

interface DiscardSelectProps {
  hand: CardType[];
  onDiscard: (cardIds: string[]) => void;
  onSkip: () => void;
  playerName: string;
}

export function DiscardSelect({ hand, onDiscard, onSkip, playerName }: DiscardSelectProps) {
  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([]);
  const maxDiscard = 2;

  const toggleCardSelection = (cardId: string) => {
    if (selectedCardIds.includes(cardId)) {
      // Deselect
      setSelectedCardIds(prev => prev.filter(id => id !== cardId));
    } else {
      // Select (if under limit)
      if (selectedCardIds.length < maxDiscard) {
        setSelectedCardIds(prev => [...prev, cardId]);
      }
    }
  };

  const handleDiscard = () => {
    if (selectedCardIds.length > 0) {
      onDiscard(selectedCardIds);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-teal-900 to-gray-900 rounded-2xl p-6 max-w-2xl w-[95vw] mx-4 shadow-2xl border border-teal-700/50">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🎉</div>
          <h2 className="text-2xl font-bold text-white mb-1">
            Ka pai, {playerName}!
          </h2>
          <p className="text-teal-300">
            You completed the sentence! Discard up to 2 cards.
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-white/10 rounded-lg p-3 mb-4 text-center">
          <p className="text-gray-300 text-sm">
            Tap cards to select (max {maxDiscard}). Selected: {selectedCardIds.length}/{maxDiscard}
          </p>
        </div>

        {/* Card selection grid */}
        <div className="flex flex-wrap justify-center gap-2 mb-6 max-h-[40vh] overflow-y-auto p-2">
          {hand.map(card => {
            const isSelected = selectedCardIds.includes(card.id);
            return (
              <div
                key={card.id}
                onClick={() => toggleCardSelection(card.id)}
                className={`
                  cursor-pointer transition-all duration-200 transform relative
                  ${isSelected
                    ? 'scale-110 ring-4 ring-amber-400 ring-offset-2 ring-offset-teal-900 rounded-lg'
                    : 'hover:scale-105 opacity-80 hover:opacity-100'
                  }
                `}
              >
                <CardComponent
                  card={card}
                  size="sm"
                />
                {isSelected && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center text-black font-bold text-sm shadow-lg z-10">
                    {selectedCardIds.indexOf(card.id) + 1}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 justify-center">
          <button
            onClick={onSkip}
            className="px-6 py-3 bg-gray-600 text-white rounded-xl font-semibold hover:bg-gray-500 transition-colors"
          >
            Skip (Keep All)
          </button>
          <button
            onClick={handleDiscard}
            disabled={selectedCardIds.length === 0}
            className={`
              px-6 py-3 rounded-xl font-semibold transition-all
              ${selectedCardIds.length > 0
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-lg'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            Discard {selectedCardIds.length > 0 ? `(${selectedCardIds.length})` : ''}
          </button>
        </div>

        {/* Tip */}
        <p className="text-center text-gray-500 text-xs mt-4">
          Discarding cards brings you closer to winning!
        </p>
      </div>
    </div>
  );
}

export default DiscardSelect;
