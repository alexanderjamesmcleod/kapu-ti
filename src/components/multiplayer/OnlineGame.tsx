'use client';

import { useState } from 'react';
import type { MultiplayerGame, Player, TableSlot } from '@/types/multiplayer.types';
import type { Card as CardType } from '@/types';
import { Card } from '@/components';
import { playSentence } from '@/lib/audio';

interface OnlineGameProps {
  game: MultiplayerGame;
  playerId: string;
  currentSentence: string;
  isMyTurn: boolean;
  onPlayCard: (cardId: string, slotId: string) => void;
  onCreateSlot: (cardId: string) => void;
  onSubmitTurn: (spoken: string, translation: string) => void;
  onVote: (approved: boolean) => void;
  onPassTurn: () => void;
  onUndo: () => void;
  onConfirmTurnEnd: () => void;
  onExit: () => void;
}

export function OnlineGame({
  game,
  playerId,
  currentSentence,
  isMyTurn,
  onPlayCard,
  onCreateSlot,
  onSubmitTurn,
  onVote,
  onPassTurn,
  onUndo,
  onConfirmTurnEnd,
  onExit,
}: OnlineGameProps) {
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null);
  const [showVerification, setShowVerification] = useState(false);

  const currentPlayer = game.players.find(p => p.id === playerId);
  const activePlayer = game.players[game.currentPlayerIndex];

  // Get color background class
  const getSlotBgClass = (color: string): string => {
    const colorMap: Record<string, string> = {
      yellow: 'bg-yellow-200 border-yellow-400',
      green: 'bg-green-200 border-green-400',
      red: 'bg-red-200 border-red-400',
      blue: 'bg-blue-200 border-blue-400',
      purple: 'bg-purple-200 border-purple-400',
      brown: 'bg-amber-200 border-amber-400',
      pink: 'bg-pink-200 border-pink-400',
      orange: 'bg-orange-200 border-orange-400',
      gray: 'bg-gray-200 border-gray-400',
      lightblue: 'bg-sky-200 border-sky-400',
    };
    return colorMap[color] || 'bg-gray-200 border-gray-400';
  };

  // Handle card selection
  const handleSelectCard = (card: CardType) => {
    if (!isMyTurn || game.phase !== 'playing') return;
    if (selectedCard?.id === card.id) {
      setSelectedCard(null);
    } else {
      setSelectedCard(card);
    }
  };

  // Handle slot click
  const handleSlotClick = (slot: TableSlot) => {
    if (!selectedCard || !isMyTurn) return;
    if (selectedCard.color !== slot.color) return;
    if (game.turnState.colorsPlayedThisTurn.has(selectedCard.color)) return;

    onPlayCard(selectedCard.id, slot.id);
    setSelectedCard(null);
  };

  // Handle create new slot
  const handleCreateSlot = () => {
    if (!selectedCard || !isMyTurn) return;
    if (game.turnState.colorsPlayedThisTurn.has(selectedCard.color)) return;

    onCreateSlot(selectedCard.id);
    setSelectedCard(null);
  };

  // Handle speak/submit
  const handleSubmitTurn = () => {
    if (game.turnState.playedCards.length === 0) return;
    setShowVerification(true);
  };

  // Handle verification confirm
  const handleVerificationConfirm = (correct: boolean) => {
    setShowVerification(false);
    onSubmitTurn(currentSentence, ''); // Server handles verification
    // For now, auto-vote for self
    setTimeout(() => onVote(correct), 100);
  };

  // Verification phase - other players vote
  if (game.phase === 'verification' && !isMyTurn) {
    const submitter = game.players[game.currentPlayerIndex];
    const hasVoted = game.verificationVotes.some(v => v.playerId === playerId);

    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-100 p-4 flex items-center justify-center">
        <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-lg">
          <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
            Verification
          </h2>

          <p className="text-gray-600 text-center mb-4">
            <strong>{submitter?.name}</strong> says:
          </p>

          <div className="bg-gray-100 rounded-lg p-4 mb-4 text-center">
            <p className="text-2xl font-bold text-gray-800 mb-2">
              {currentSentence}
            </p>
            <button
              onClick={() => playSentence(currentSentence.split(' '))}
              className="text-teal-600 hover:text-teal-800"
            >
              Hear pronunciation
            </button>
          </div>

          {hasVoted ? (
            <p className="text-center text-gray-500">
              Waiting for other players to vote...
            </p>
          ) : (
            <div className="flex gap-4">
              <button
                onClick={() => onVote(true)}
                className="flex-1 py-3 bg-green-600 text-white rounded-lg font-bold
                         hover:bg-green-700 transition-colors"
              >
                Correct
              </button>
              <button
                onClick={() => onVote(false)}
                className="flex-1 py-3 bg-red-600 text-white rounded-lg font-bold
                         hover:bg-red-700 transition-colors"
              >
                Wrong
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Turn end screen - waiting for next player
  if (game.phase === 'turnEnd') {
    const nextPlayer = game.players[game.currentPlayerIndex];
    const isNextPlayerMe = nextPlayer.id === playerId;

    return (
      <div className="min-h-screen bg-gradient-to-b from-teal-800 to-blue-900 p-4 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            {isNextPlayerMe ? 'Your Turn!' : `${nextPlayer.name}'s Turn`}
          </h2>
          {isNextPlayerMe ? (
            <button
              onClick={onConfirmTurnEnd}
              className="px-8 py-4 bg-white text-teal-800 rounded-xl font-bold text-xl
                       hover:bg-teal-50 transition-colors"
            >
              Start My Turn
            </button>
          ) : (
            <p className="text-teal-200">
              Waiting for {nextPlayer.name} to start their turn...
            </p>
          )}
        </div>
      </div>
    );
  }

  // Game over screen
  if (game.phase === 'finished') {
    const loser = game.players.find(p => p.id === game.loserId);
    const winners = game.winnersInOrder.map(
      id => game.players.find(p => p.id === id)!
    );

    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-100 p-4">
        <div className="max-w-md mx-auto text-center pt-12">
          <h1 className="text-4xl font-bold text-amber-800 mb-2">Game Over!</h1>

          <div className="bg-white rounded-xl p-6 shadow-lg mt-8 mb-6">
            <h2 className="text-xl font-semibold text-green-600 mb-4">Winners</h2>
            <div className="space-y-2">
              {winners.map((winner, i) => (
                <div key={winner.id} className="flex items-center justify-center gap-2">
                  <span className="text-2xl">{i === 0 ? '1st' : i === 1 ? '2nd' : '3rd'}</span>
                  <span className="text-lg font-semibold">
                    {winner.name}
                    {winner.id === playerId && ' (You!)'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-amber-100 rounded-xl p-6 shadow-lg mb-8">
            <h2 className="text-xl font-semibold text-amber-800 mb-2">Kapu Ti Time!</h2>
            <p className="text-5xl mb-2">Tea time!</p>
            <p className="text-lg text-amber-700">
              <strong>{loser?.name}</strong> makes the tea!
              {loser?.id === playerId && ' (That\'s you!)'}
            </p>
          </div>

          <button
            onClick={onExit}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold
                     hover:bg-gray-300 transition-colors"
          >
            Back to Lobby
          </button>
        </div>
      </div>
    );
  }

  // Main game view
  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-teal-800">Kapu Ti Online</h1>
          <button
            onClick={onExit}
            className="text-gray-500 hover:text-gray-700"
          >
            Exit
          </button>
        </header>

        {/* Other players */}
        <div className="flex justify-center gap-4 mb-6">
          {game.players
            .filter(p => p.id !== playerId)
            .map(player => (
              <div
                key={player.id}
                className={`text-center p-3 rounded-xl shadow-md ${
                  player.isActive ? 'bg-white' : 'bg-gray-200 opacity-50'
                } ${player.id === activePlayer.id ? 'ring-2 ring-teal-500' : ''}`}
              >
                <div className="text-2xl mb-1">
                  {player.isActive ? '👤' : 'Winner!'}
                </div>
                <div className="font-semibold text-sm">{player.name}</div>
                <div className="text-xs text-gray-500">
                  {player.isActive ? `${player.hand.length} cards` : 'Finished!'}
                </div>
              </div>
            ))}
        </div>

        {/* Table - Sentence slots */}
        <div className="bg-white rounded-xl p-4 mb-4 shadow-lg">
          <h3 className="text-sm font-semibold text-gray-500 mb-3 text-center">
            The Sentence
          </h3>

          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {game.tableSlots.map(slot => {
              const topCard = slot.cards[slot.cards.length - 1];
              const canPlay = isMyTurn && selectedCard?.color === slot.color &&
                !game.turnState.colorsPlayedThisTurn.has(slot.color);

              return (
                <button
                  key={slot.id}
                  onClick={() => handleSlotClick(slot)}
                  disabled={!canPlay}
                  className={`min-w-[80px] min-h-[100px] rounded-lg border-2 border-dashed
                            flex flex-col items-center justify-center p-2 transition-all
                            ${getSlotBgClass(slot.color)}
                            ${canPlay ? 'ring-2 ring-teal-500 scale-105' : ''}
                            ${!canPlay && !topCard ? 'opacity-50' : ''}`}
                >
                  {topCard ? (
                    <>
                      <span className="font-bold text-sm">{topCard.maori}</span>
                      <span className="text-xs text-gray-600">{topCard.english}</span>
                      {slot.cards.length > 1 && (
                        <span className="text-xs text-gray-400">
                          +{slot.cards.length - 1}
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-xs text-gray-500 uppercase">
                      {slot.color}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Add new slot button */}
            {isMyTurn && selectedCard && !game.turnState.colorsPlayedThisTurn.has(selectedCard.color) && (
              <button
                onClick={handleCreateSlot}
                className="min-w-[80px] min-h-[100px] rounded-lg border-2 border-dashed
                         border-teal-400 bg-teal-50 flex items-center justify-center
                         hover:bg-teal-100 transition-colors"
              >
                <span className="text-3xl text-teal-500">+</span>
              </button>
            )}
          </div>

          {/* Current sentence display */}
          {currentSentence && (
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-800">{currentSentence}</p>
              <button
                onClick={() => playSentence(currentSentence.split(' '))}
                className="text-sm text-teal-600 hover:text-teal-800 mt-1"
              >
                Hear it
              </button>
            </div>
          )}
        </div>

        {/* Turn indicator */}
        <div className={`rounded-xl p-3 mb-4 text-center ${
          isMyTurn ? 'bg-teal-100' : 'bg-gray-100'
        }`}>
          <span className={`font-semibold ${isMyTurn ? 'text-teal-800' : 'text-gray-600'}`}>
            {isMyTurn ? 'Your Turn!' : `${activePlayer?.name}'s Turn`}
          </span>
          {isMyTurn && game.turnState.playedCards.length > 0 && (
            <span className="text-teal-600 ml-2">
              ({game.turnState.playedCards.length} card{game.turnState.playedCards.length !== 1 ? 's' : ''} played)
            </span>
          )}
        </div>

        {/* Player's hand */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-500 mb-2">
            Your Hand ({currentPlayer?.hand.length || 0} cards)
            {selectedCard && isMyTurn && ' - Tap a slot to place'}
          </h3>
          <div className="flex flex-wrap gap-2 justify-center">
            {currentPlayer?.hand.map(card => {
              // Skip hidden cards (shown as gray placeholders for other players' hands)
              if (card.id === 'hidden') return null;

              const alreadyPlayedColor = game.turnState.colorsPlayedThisTurn.has(card.color);
              const isDisabled = !isMyTurn || alreadyPlayedColor;
              return (
                <div
                  key={card.id}
                  role="button"
                  tabIndex={isDisabled ? -1 : 0}
                  onClick={() => !isDisabled && handleSelectCard(card)}
                  onKeyDown={(e) => {
                    if (!isDisabled && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault();
                      handleSelectCard(card);
                    }
                  }}
                  className={`transition-all cursor-pointer ${
                    selectedCard?.id === card.id ? 'scale-110 ring-2 ring-teal-500 rounded-lg' : ''
                  } ${alreadyPlayedColor ? 'opacity-40 cursor-not-allowed' : ''} ${!isMyTurn ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  <Card card={card} size="sm" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Action buttons */}
        {isMyTurn && (
          <div className="flex justify-center gap-4">
            {game.turnState.playedCards.length > 0 && (
              <>
                <button
                  onClick={onUndo}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg
                           hover:bg-gray-300 transition-colors"
                >
                  Undo
                </button>
                <button
                  onClick={handleSubmitTurn}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg font-bold
                           hover:bg-green-700 transition-colors"
                >
                  Speak & Submit
                </button>
              </>
            )}

            <button
              onClick={onPassTurn}
              className="px-4 py-2 bg-amber-500 text-white rounded-lg
                       hover:bg-amber-600 transition-colors"
            >
              Pass (+1 card)
            </button>
          </div>
        )}

        {/* Verification modal (for current player) */}
        {showVerification && isMyTurn && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
                Speak the Sentence
              </h2>

              <div className="bg-gray-100 rounded-lg p-4 mb-4 text-center">
                <p className="text-2xl font-bold text-gray-800 mb-2">
                  {currentSentence}
                </p>
                <button
                  onClick={() => playSentence(currentSentence.split(' '))}
                  className="text-teal-600 hover:text-teal-800"
                >
                  Hear pronunciation
                </button>
              </div>

              <p className="text-gray-600 text-center mb-4">
                Say the sentence aloud, then translate it to English.
              </p>

              <p className="text-sm text-gray-500 text-center mb-6">
                Did you say it correctly?
              </p>

              <div className="flex gap-4">
                <button
                  onClick={() => handleVerificationConfirm(true)}
                  className="flex-1 py-3 bg-green-600 text-white rounded-lg font-bold
                           hover:bg-green-700 transition-colors"
                >
                  Yes, Correct!
                </button>
                <button
                  onClick={() => handleVerificationConfirm(false)}
                  className="flex-1 py-3 bg-red-600 text-white rounded-lg font-bold
                           hover:bg-red-700 transition-colors"
                >
                  No, Wrong
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
