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
}

export function CardHand({
  cards,
  selectedCardId,
  onSelectCard,
  playerName,
  isCurrentPlayer = true,
  hideCards = false,
}: CardHandProps) {
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
        <div className="flex flex-wrap gap-2 justify-center">
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
      )}
    </div>
  );
}

export default CardHand;
