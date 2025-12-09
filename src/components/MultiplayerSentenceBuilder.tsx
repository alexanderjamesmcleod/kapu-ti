'use client';

import type { TableSlot, TurnState } from '@/types/multiplayer.types';
import type { Card as CardType } from '@/types';
import type { PatternInstance } from '@/types/sentencePattern.types';
import { getTopCard, canPlayCardOnSlot } from '@/types/multiplayer.types';
import { Card } from './Card';

interface MultiplayerSentenceBuilderProps {
  tableSlots: TableSlot[];
  turnState: TurnState;
  selectedCard: CardType | null;
  isMyTurn: boolean;
  currentPlayerName: string;
  currentPattern?: PatternInstance;  // Current sentence pattern with hints
  showPatternHint?: boolean;          // Whether to show the pattern template
  onPlayCard: (slotId: string) => void;
  onStackCard: (slotId: string) => void;  // Stack same-color card on occupied slot (any player)
}

// Slot color classes for empty slots - matches Card component bold colors
const slotColors: Record<string, { bg: string; border: string; indicator: string; text: string }> = {
  purple: { bg: 'bg-purple-400/30', border: 'border-purple-500', indicator: 'bg-purple-400', text: 'text-purple-200' },
  gray: { bg: 'bg-slate-400/30', border: 'border-slate-500', indicator: 'bg-slate-400', text: 'text-slate-200' },
  blue: { bg: 'bg-blue-500/30', border: 'border-blue-600', indicator: 'bg-blue-500', text: 'text-blue-200' },
  red: { bg: 'bg-red-500/30', border: 'border-red-600', indicator: 'bg-red-500', text: 'text-red-200' },
  green: { bg: 'bg-emerald-500/30', border: 'border-emerald-600', indicator: 'bg-emerald-500', text: 'text-emerald-200' },
  lightblue: { bg: 'bg-cyan-400/30', border: 'border-cyan-500', indicator: 'bg-cyan-400', text: 'text-cyan-200' },
  yellow: { bg: 'bg-yellow-400/30', border: 'border-yellow-500', indicator: 'bg-yellow-400', text: 'text-yellow-200' },
  orange: { bg: 'bg-orange-500/30', border: 'border-orange-600', indicator: 'bg-orange-500', text: 'text-orange-200' },
  pink: { bg: 'bg-pink-400/30', border: 'border-pink-500', indicator: 'bg-pink-400', text: 'text-pink-200' },
  brown: { bg: 'bg-amber-700/30', border: 'border-amber-700', indicator: 'bg-amber-700', text: 'text-amber-200' },
  teal: { bg: 'bg-indigo-400/30', border: 'border-indigo-500', indicator: 'bg-indigo-400', text: 'text-indigo-200' },
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
  currentPattern,
  showPatternHint = false,
  onPlayCard,
  onStackCard,
}: MultiplayerSentenceBuilderProps) {
  // Sort slots by position
  const sortedSlots = [...tableSlots].sort((a, b) => a.position - b.position);

  // Get current sentence
  const currentSentence = sortedSlots
    .map(slot => getTopCard(slot)?.maori || '')
    .filter(Boolean)
    .join(' ');

  // Get slot hint from pattern if available
  const getSlotHint = (position: number): string | undefined => {
    if (!currentPattern) return undefined;
    const patternSlot = currentPattern.slots[position];
    return patternSlot?.hint;
  };

  // Check if selected card can be played (current player's turn only)
  const canPlayOnSlot = (slot: TableSlot): boolean => {
    if (!selectedCard || !isMyTurn) return false;
    return canPlayCardOnSlot(selectedCard, slot, turnState);
  };

  // Check if selected card can be stacked on an occupied slot (any player)
  // Stacking: place same-color card on a slot that already has cards
  const canStackOnSlot = (slot: TableSlot): boolean => {
    if (!selectedCard) return false;
    // Slot must have cards already
    if (slot.cards.length === 0) return false;
    // Card color must match slot color
    return selectedCard.color === slot.color;
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* Pattern hint display */}
      {showPatternHint && currentPattern && (
        <div className="px-4 py-2 bg-amber-100/90 rounded-lg shadow-md">
          <p className="text-sm text-amber-800 font-medium">{currentPattern.pattern.name}</p>
          <p className="text-xs text-amber-600">{currentPattern.pattern.maoriTemplate}</p>
        </div>
      )}

      {/* Current sentence display - always reserve space to prevent layout shift */}
      <div className="px-4 py-2 bg-white/90 rounded-lg shadow-md min-h-[40px] min-w-[120px] flex items-center justify-center">
        <p className="text-lg font-bold text-gray-800">
          {currentSentence || <span className="text-gray-400 text-sm">Build your sentence...</span>}
        </p>
      </div>

      {/* Slots - max 7 cards, sized to fit */}
      <div className="flex flex-wrap justify-center gap-1.5">
        {sortedSlots.map((slot) => {
          const topCard = getTopCard(slot);
          const colors = slotColors[slot.color] || slotColors.gray;
          const canPlay = canPlayOnSlot(slot);  // Current player playing on their turn
          const canStack = canStackOnSlot(slot);  // Any player can stack same-color on occupied slot
          const isInteractive = canPlay || canStack;

          // Handle click - prioritize play (current player's turn action) over stack
          const handleClick = () => {
            if (canPlay) {
              onPlayCard(slot.id);
            } else if (canStack) {
              onStackCard(slot.id);
            }
          };

          return (
            <div
              key={slot.id}
              onClick={handleClick}
              className={`
                relative
                ${isInteractive ? 'cursor-pointer' : ''}
                ${!topCard && !isInteractive ? 'opacity-60' : ''}
              `}
            >
              {topCard ? (
                // Show the actual Card component - sm size for 7-card max layout
                <div className="relative">
                  <Card
                    card={topCard}
                    size="sm"
                  />
                  {/* Stack indicator */}
                  {slot.cards.length > 1 && (
                    <div className="absolute -top-2 -right-2 w-5 h-5 bg-teal-500 text-white
                                  rounded-full flex items-center justify-center text-xs font-bold shadow z-10">
                      {slot.cards.length}
                    </div>
                  )}
                  {/* Play/Stack overlay - amber for turn play, teal for stacking */}
                  {canPlay && (
                    <div className="absolute inset-0 flex items-center justify-center
                                  bg-amber-400/30 rounded-xl animate-pulse ring-2 ring-amber-400">
                      <span className="text-2xl text-amber-600 font-bold">+</span>
                    </div>
                  )}
                  {!canPlay && canStack && (
                    <div className="absolute inset-0 flex items-center justify-center
                                  bg-teal-400/30 rounded-xl animate-pulse ring-2 ring-teal-400">
                      <span className="text-2xl text-teal-600 font-bold">+</span>
                    </div>
                  )}
                </div>
              ) : (
                // Empty slot - matches sm card size (w-20 h-28) for consistent layout
                <div className={`
                  w-20 h-28 rounded-xl border-2 border-dashed
                  ${colors.bg} ${colors.border}
                  flex flex-col items-center justify-center gap-1
                  transition-all duration-200
                  ${canPlay ? 'ring-2 ring-amber-400 scale-105 shadow-lg' : ''}
                `}>
                  <div className={`w-6 h-6 rounded-full ${colors.indicator}`} />
                  <span className={`text-xs font-medium ${colors.text}`}>
                    {typeLabels[slot.color] || slot.color}
                  </span>
                  {/* Pattern hint if available */}
                  {getSlotHint(slot.position) && (
                    <span className={`text-[10px] ${colors.text} opacity-70 text-center px-1 leading-tight`}>
                      {getSlotHint(slot.position)}
                    </span>
                  )}
                  {/* Play here indicator */}
                  {canPlay && (
                    <div className="absolute inset-0 flex items-center justify-center
                                  bg-amber-400/20 rounded-xl animate-pulse">
                      <span className="text-2xl">+</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Slots are fixed - no "add new slot" button in pattern-based mode */}
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
