'use client';

import type { TableSlot, TurnState } from '@/types/multiplayer.types';
import type { Card as CardType } from '@/types';
import { getTopCard, canPlayCardOnSlot, canCreateSlot } from '@/types/multiplayer.types';

interface MultiplayerSentenceBuilderProps {
  tableSlots: TableSlot[];
  turnState: TurnState;
  selectedCard: CardType | null;
  isMyTurn: boolean;
  currentPlayerName: string;
  onPlayCard: (slotId: string) => void;
  onCreateSlot: () => void;
}

// Slot color classes matching card colors
const slotColors: Record<string, { bg: string; border: string; indicator: string; text: string }> = {
  purple: { bg: 'bg-purple-500/30', border: 'border-purple-400', indicator: 'bg-purple-400', text: 'text-purple-200' },
  gray: { bg: 'bg-gray-500/30', border: 'border-gray-400', indicator: 'bg-gray-400', text: 'text-gray-200' },
  blue: { bg: 'bg-blue-500/30', border: 'border-blue-400', indicator: 'bg-blue-400', text: 'text-blue-200' },
  red: { bg: 'bg-red-500/30', border: 'border-red-400', indicator: 'bg-red-400', text: 'text-red-200' },
  green: { bg: 'bg-green-500/30', border: 'border-green-400', indicator: 'bg-green-400', text: 'text-green-200' },
  lightblue: { bg: 'bg-sky-500/30', border: 'border-sky-400', indicator: 'bg-sky-400', text: 'text-sky-200' },
  yellow: { bg: 'bg-yellow-500/30', border: 'border-yellow-400', indicator: 'bg-yellow-400', text: 'text-yellow-200' },
  orange: { bg: 'bg-orange-500/30', border: 'border-orange-400', indicator: 'bg-orange-400', text: 'text-orange-200' },
  pink: { bg: 'bg-pink-500/30', border: 'border-pink-400', indicator: 'bg-pink-400', text: 'text-pink-200' },
  brown: { bg: 'bg-amber-500/30', border: 'border-amber-500', indicator: 'bg-amber-500', text: 'text-amber-200' },
  teal: { bg: 'bg-teal-500/30', border: 'border-teal-400', indicator: 'bg-teal-400', text: 'text-teal-200' },
};

// Word type labels
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

export function MultiplayerSentenceBuilder({
  tableSlots,
  turnState,
  selectedCard,
  isMyTurn,
  currentPlayerName,
  onPlayCard,
  onCreateSlot,
}: MultiplayerSentenceBuilderProps) {
  // Sort slots by position
  const sortedSlots = [...tableSlots].sort((a, b) => a.position - b.position);

  // Get current sentence
  const currentSentence = sortedSlots
    .map(slot => getTopCard(slot)?.maori || '')
    .filter(Boolean)
    .join(' ');

  // Check if selected card can be played
  const canPlayOnSlot = (slot: TableSlot): boolean => {
    if (!selectedCard || !isMyTurn) return false;
    return canPlayCardOnSlot(selectedCard, slot, turnState);
  };

  const canAddNewSlot = selectedCard && isMyTurn && canCreateSlot(selectedCard, turnState);

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* Current sentence display */}
      {currentSentence && (
        <div className="px-4 py-2 bg-white/90 rounded-lg shadow-md">
          <p className="text-lg font-bold text-gray-800">{currentSentence}</p>
        </div>
      )}

      {/* Slots */}
      <div className="flex flex-wrap justify-center gap-2">
        {sortedSlots.map((slot) => {
          const topCard = getTopCard(slot);
          const colors = slotColors[slot.color] || slotColors.gray;
          const canPlay = canPlayOnSlot(slot);

          return (
            <div
              key={slot.id}
              onClick={() => canPlay && onPlayCard(slot.id)}
              className={`
                relative w-20 h-28 rounded-lg border-2
                ${topCard ? 'bg-white border-gray-300' : `${colors.bg} border-dashed ${colors.border}`}
                flex flex-col items-center justify-center
                transition-all duration-200
                ${canPlay ? 'cursor-pointer ring-2 ring-amber-400 scale-105 shadow-lg' : ''}
                ${!topCard && !canPlay ? 'opacity-60' : ''}
              `}
            >
              {topCard ? (
                // Show card
                <div className="flex flex-col items-center gap-1 p-2">
                  <span className="text-lg font-bold text-gray-800">{topCard.maori}</span>
                  <span className="text-xs text-gray-500">{topCard.english}</span>
                  {/* Stack indicator */}
                  {slot.cards.length > 1 && (
                    <div className="absolute -top-2 -right-2 w-5 h-5 bg-teal-500 text-white
                                  rounded-full flex items-center justify-center text-xs font-bold">
                      {slot.cards.length}
                    </div>
                  )}
                </div>
              ) : (
                // Empty slot
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-8 h-8 rounded-full ${colors.indicator}`} />
                  <span className={`text-xs font-medium ${colors.text}`}>
                    {typeLabels[slot.color] || slot.color}
                  </span>
                </div>
              )}

              {/* Play here indicator */}
              {canPlay && (
                <div className="absolute inset-0 flex items-center justify-center
                              bg-amber-400/20 rounded-lg animate-pulse">
                  <span className="text-2xl">+</span>
                </div>
              )}
            </div>
          );
        })}

        {/* Add new slot button */}
        {canAddNewSlot && (
          <div
            onClick={onCreateSlot}
            className="w-20 h-28 rounded-lg border-2 border-dashed border-white/50
                     bg-white/10 flex flex-col items-center justify-center
                     cursor-pointer hover:bg-white/20 transition-all
                     ring-2 ring-amber-400 animate-pulse"
          >
            <span className="text-3xl text-white">+</span>
            <span className="text-xs text-white/70">New slot</span>
          </div>
        )}
      </div>

      {/* Turn indicator */}
      <div className="text-center">
        {isMyTurn ? (
          <p className="text-amber-400 font-semibold animate-pulse">
            {selectedCard ? `Tap a slot to place "${selectedCard.maori}"` : 'Select a card from your hand'}
          </p>
        ) : (
          <p className="text-teal-200 text-sm">
            {currentPlayerName} is building...
          </p>
        )}
      </div>

      {/* Cards played this turn indicator */}
      {turnState.playedCards.length > 0 && (
        <div className="flex items-center gap-2 text-white/60 text-sm">
          <span>Played this turn:</span>
          {turnState.playedCards.map((pc, i) => (
            <span key={i} className="px-2 py-1 bg-white/20 rounded text-white">
              {pc.card.maori}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default MultiplayerSentenceBuilder;
