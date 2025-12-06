'use client';

import { useState } from 'react';
import Link from 'next/link';
import { GameTable, CardHand } from '@/components';
import type { TablePlayer } from '@/components/GameTable';
import type { Card as CardType } from '@/types';

// Demo players
const DEMO_PLAYERS: TablePlayer[] = [
  {
    id: 'you',
    name: 'You',
    avatar: '😎',
    cardsInHand: 7,
    score: 450,
    isCurrentTurn: false,
    isSelf: true,
    isHost: true,
    status: 'playing'
  },
  {
    id: 'hemi',
    name: 'Hemi',
    avatar: '👨',
    cardsInHand: 5,
    score: 320,
    isCurrentTurn: true,
    status: 'playing'
  },
  {
    id: 'aroha',
    name: 'Aroha',
    avatar: '👩',
    cardsInHand: 6,
    score: 280,
    isCurrentTurn: false,
    status: 'playing'
  },
  {
    id: 'tane',
    name: 'Tāne',
    avatar: '🧔',
    cardsInHand: 4,
    score: 510,
    isCurrentTurn: false,
    status: 'ready'
  },
  {
    id: 'maia',
    name: 'Maia',
    avatar: '👧',
    cardsInHand: 8,
    score: 190,
    isCurrentTurn: false,
    status: 'playing'
  }
];

// Demo hand
const DEMO_HAND: CardType[] = [
  { id: '1', maori: 'Ko', english: 'definite', type: 'particle', color: 'purple' },
  { id: '2', maori: 'te', english: 'the', type: 'article', color: 'gray' },
  { id: '3', maori: 'whare', english: 'house', type: 'noun', color: 'blue' },
  { id: '4', maori: 'kaiako', english: 'teacher', type: 'noun', color: 'blue' },
  { id: '5', maori: 'Kei te', english: 'present', type: 'tense_marker', color: 'yellow' },
  { id: '6', maori: 'harikoa', english: 'happy', type: 'adjective', color: 'lightblue' },
  { id: '7', maori: 'au', english: 'I/me', type: 'pronoun', color: 'red' },
];

export default function TableDemoPage() {
  const [players, setPlayers] = useState<TablePlayer[]>(DEMO_PLAYERS);
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null);
  const [placedCards, setPlacedCards] = useState<(CardType | null)[]>([null, null, null]);
  const [hand, setHand] = useState<CardType[]>(DEMO_HAND);

  // Rotate turn
  const rotateTurn = () => {
    setPlayers(prev => {
      const currentTurnIndex = prev.findIndex(p => p.isCurrentTurn);
      const nextIndex = (currentTurnIndex + 1) % prev.length;
      return prev.map((p, i) => ({
        ...p,
        isCurrentTurn: i === nextIndex
      }));
    });
  };

  // Add a player
  const addPlayer = (seatIndex: number) => {
    const names = ['Kahu', 'Mere', 'Wiremu', 'Ngaio', 'Rongo'];
    const avatars = ['🧑', '👴', '👵', '🧒', '👱'];
    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];

    const newPlayer: TablePlayer = {
      id: `player-${Date.now()}`,
      name: randomName,
      avatar: randomAvatar,
      cardsInHand: 7,
      score: 0,
      isCurrentTurn: false,
      status: 'ready'
    };

    setPlayers(prev => [...prev, newPlayer]);
  };

  // Center content - sentence builder
  const centerContent = (
    <div className="flex flex-col items-center gap-4">
      <p className="text-white text-lg font-semibold">Build: &quot;I am happy&quot;</p>
      <div className="flex gap-2">
        {placedCards.map((card, index) => (
          <div
            key={index}
            onClick={() => {
              if (card) {
                setHand(prev => [...prev, card]);
                setPlacedCards(prev => {
                  const next = [...prev];
                  next[index] = null;
                  return next;
                });
              } else if (selectedCard) {
                setPlacedCards(prev => {
                  const next = [...prev];
                  next[index] = selectedCard;
                  return next;
                });
                setHand(prev => prev.filter(c => c.id !== selectedCard.id));
                setSelectedCard(null);
              }
            }}
            className={`
              w-24 h-16 rounded-lg border-2 flex items-center justify-center
              cursor-pointer transition-all
              ${card
                ? 'bg-white border-gray-300 shadow-md'
                : selectedCard
                  ? 'bg-white/20 border-white/50 border-dashed'
                  : 'bg-white/10 border-white/30 border-dashed'
              }
            `}
          >
            {card ? (
              <div className="text-center">
                <div className="font-bold text-gray-800">{card.maori}</div>
                <div className="text-xs text-gray-500">{card.english}</div>
              </div>
            ) : (
              <span className="text-white/50 text-sm">Slot {index + 1}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  // Bottom content - your hand
  const bottomContent = (
    <div className="bg-white/95 rounded-t-xl shadow-lg p-4 mx-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-gray-700">
          Your Hand {selectedCard && '(tap a slot)'}
        </h3>
        <button
          onClick={rotateTurn}
          className="px-3 py-1 bg-amber-500 text-white text-sm rounded-lg hover:bg-amber-600"
        >
          Next Turn →
        </button>
      </div>
      <CardHand
        cards={hand}
        selectedCardId={selectedCard?.id}
        onSelectCard={(card) => setSelectedCard(
          selectedCard?.id === card.id ? null : card
        )}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-4">
      {/* Header */}
      <header className="max-w-4xl mx-auto mb-4">
        <div className="flex justify-between items-center">
          <Link href="/play" className="text-teal-400 hover:text-teal-300">
            ← Back
          </Link>
          <h1 className="text-2xl font-bold text-white">
            Table Demo
          </h1>
          <div className="text-sm text-gray-400">
            {players.length} players
          </div>
        </div>
      </header>

      {/* Game Table */}
      <GameTable
        players={players}
        maxPlayers={8}
        centerContent={centerContent}
        bottomContent={bottomContent}
        currentTopic={{ icon: '😊', name: 'Feelings', maori: 'Kare ā-roto' }}
        onSeatClick={addPlayer}
      />

      {/* Instructions */}
      <div className="max-w-4xl mx-auto mt-4 text-center text-gray-400 text-sm">
        <p>Click empty seats to add players • Click &quot;Next Turn&quot; to rotate • Select cards from your hand</p>
      </div>
    </div>
  );
}
