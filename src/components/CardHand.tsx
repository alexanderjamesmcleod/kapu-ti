'use client';

import type { Card as CardType } from '@/types';
import { Card } from './Card';

interface CardHandProps {
  cards: CardType[];
  selectedCardId?: string | null;
  onSelectCard: (card: CardType) => void;
  playerName?: string;
  isCurrentPlayer?: boolean;
  hideCards?: boolean; // For pass-and-play privacy
  cardSize?: 'xs' | 'sm' | 'md' | 'lg'; // Override card size
  compact?: boolean; // Skip wrapper styling for embedding
}

export function CardHand({
  cards,
  selectedCardId,
  onSelectCard,
  playerName,
  isCurrentPlayer = true,
  hideCards = false,
  cardSize,
  compact = false,
}: CardHandProps) {
  // Compact mode: just render cards directly without wrapper
  if (compact) {
    if (hideCards) {
      return <p className="text-gray-500 text-sm text-center py-2">Cards hidden</p>;
    }
    if (cards.length === 0) {
      return <p className="text-center py-2">🎉 Empty hand!</p>;
    }
    return (
      <div className="card-hand-scroll gap-1">
        {cards.map((card) => (
          <Card
            key={card.id}
            card={card}
            selected={selectedCardId === card.id}
            onClick={isCurrentPlayer ? onSelectCard : undefined}
            size={cardSize || 'xs'}
            disabled={!isCurrentPlayer}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={`
      bg-gradient-to-t from-gray-100 to-white
      rounded-2xl p-4 shadow-inner
      ${!isCurrentPlayer ? 'opacity-60' : ''}
    `}>
      {playerName && (
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-bold text-gray-700">
            {playerName}&apos;s Hand
          </h4>
          <span className="text-sm bg-gray-200 px-2 py-1 rounded-full">
            {cards.length} cards
          </span>
        </div>
      )}

      {hideCards ? (
        <div className="flex justify-center items-center h-40">
          <p className="text-gray-500 text-lg">
            🙈 Cards hidden - pass to {playerName}
          </p>
        </div>
      ) : cards.length === 0 ? (
        <div className="flex justify-center items-center h-40">
          <p className="text-2xl">🎉 Empty hand - YOU WIN!</p>
        </div>
      ) : (
        <>
          {/* If explicit cardSize is given, use it for all screen sizes */}
          {cardSize ? (
            <div className="card-hand-scroll gap-2 px-2">
              {cards.map((card) => (
                <Card
                  key={card.id}
                  card={card}
                  selected={selectedCardId === card.id}
                  onClick={isCurrentPlayer ? onSelectCard : undefined}
                  size={cardSize}
                  disabled={!isCurrentPlayer}
                />
              ))}
            </div>
          ) : (
            <>
              {/* Desktop: flex wrap. Mobile: horizontal scroll */}
              <div className="hidden sm:flex flex-wrap gap-2 justify-center">
                {cards.map((card) => (
                  <Card
                    key={card.id}
                    card={card}
                    selected={selectedCardId === card.id}
                    onClick={isCurrentPlayer ? onSelectCard : undefined}
                    size="md"
                    disabled={!isCurrentPlayer}
                  />
                ))}
              </div>
              {/* Mobile: horizontal scroll with smaller cards */}
              <div className="sm:hidden card-hand-scroll gap-2 px-2">
                {cards.map((card) => (
                  <Card
                    key={card.id}
                    card={card}
                    selected={selectedCardId === card.id}
                    onClick={isCurrentPlayer ? onSelectCard : undefined}
                    size="sm"
                    disabled={!isCurrentPlayer}
                  />
                ))}
              </div>
            </>
          )}
          {/* Scroll hint for mobile */}
          {cards.length > 4 && (
            <p className="sm:hidden text-center text-xs text-gray-400 mt-1">
              swipe for more
            </p>
          )}
        </>
      )}
    </div>
  );
}

export default CardHand;
