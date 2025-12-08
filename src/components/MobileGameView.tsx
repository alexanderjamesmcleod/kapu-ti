'use client';

import { useState, useEffect } from 'react';
import { CardHand, MultiplayerSentenceBuilder, KoreroButton } from '@/components';
import { getSentenceFromSlots } from '@/types/multiplayer.types';
import type { Card as CardType } from '@/types';
import type { MultiplayerGame, GameTopic, Player } from '@/types/multiplayer.types';

// Hook to detect landscape orientation
function useIsLandscape(): boolean {
  const [isLandscape, setIsLandscape] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkOrientation = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  return isLandscape;
}

interface MobilePlayer {
  id: string;
  name: string;
  avatar: string;
  cardsInHand: number;
  isCurrentTurn: boolean;
  isSelf: boolean;
  isActive: boolean;
}

interface MobileGameViewProps {
  game: MultiplayerGame;
  players: MobilePlayer[];
  playerId: string;
  isMyTurn: boolean;
  selectedCard: CardType | null;
  onSelectCard: (card: CardType | null) => void;
  onPlayCard: (slotId: string) => void;
  onStackCard: (slotId: string) => void;
  onCreateSlot: () => void;
  onPassTurn: () => void;
  onUndoLastCard: () => void;
  onSubmitTurn: (sentence: string, translation: string) => void;
  currentTopic?: GameTopic | null;
  turnTimeRemaining: number | null;
  chillMode: boolean;
  sounds: {
    playCardSound: () => void;
    playCardPickupSound: () => void;
  };
  // Voice controls
  voice?: {
    isVoiceEnabled: boolean;
    isMuted: boolean;
    onJoinVoice: () => void;
    onLeaveVoice: () => void;
    onToggleMute: () => void;
  };
  // Chat controls
  chat?: {
    unreadCount: number;
    onToggleChat: () => void;
  };
}

export function MobileGameView({
  game,
  players,
  playerId,
  isMyTurn,
  selectedCard,
  onSelectCard,
  onPlayCard,
  onStackCard,
  onCreateSlot,
  onPassTurn,
  onUndoLastCard,
  onSubmitTurn,
  currentTopic,
  turnTimeRemaining,
  chillMode,
  sounds,
  voice,
  chat,
}: MobileGameViewProps) {
  const [showAllPlayers, setShowAllPlayers] = useState(false);
  const isLandscape = useIsLandscape();

  const currentPlayer = players.find(p => p.isSelf);
  const currentTurnPlayer = players.find(p => p.isCurrentTurn);
  const otherPlayers = players.filter(p => !p.isSelf);

  // Get left and right players (for display on sides)
  const leftPlayer = otherPlayers[0];
  const rightPlayer = otherPlayers[1];
  const remainingPlayers = otherPlayers.slice(2);

  // Helper to get card background color
  const getCardColor = (color: string): string => {
    const colorMap: Record<string, string> = {
      purple: '#a855f7',
      gray: '#64748b',
      blue: '#3b82f6',
      red: '#ef4444',
      green: '#10b981',
      lightblue: '#22d3ee',
      yellow: '#facc15',
      orange: '#f97316',
      pink: '#f472b6',
      brown: '#b45309',
      teal: '#818cf8',
    };
    return colorMap[color] || '#6b7280';
  };

  // Render players modal (shared between orientations)
  const renderPlayersModal = () => (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-end justify-center"
      onClick={() => setShowAllPlayers(false)}
    >
      <div
        className="bg-gray-800 rounded-t-2xl w-full max-w-lg p-4 pb-8 safe-area-bottom"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-white font-bold text-lg">All Players</h2>
          <button
            onClick={() => setShowAllPlayers(false)}
            className="text-gray-400 hover:text-white text-2xl"
          >
            &times;
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {players.map(player => (
            <div
              key={player.id}
              className={`
                flex items-center gap-3 p-3 rounded-xl
                ${player.isSelf ? 'bg-teal-600/30 border border-teal-500' : 'bg-gray-700/50'}
                ${player.isCurrentTurn ? 'ring-2 ring-amber-400' : ''}
                ${!player.isActive ? 'opacity-50' : ''}
              `}
            >
              <div className="text-2xl">{player.avatar}</div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold truncate">
                  {player.name}
                  {player.isSelf && <span className="text-teal-300 text-xs ml-1">(You)</span>}
                </p>
                <p className="text-gray-400 text-xs">
                  {player.cardsInHand} cards
                  {player.isCurrentTurn && <span className="text-amber-400 ml-1">playing</span>}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Landscape layout: horizontal with cards on right side
  if (isLandscape) {
    return (
      <div className="flex h-full">
        {/* Left: Players + Turn Info */}
        <div className="flex-shrink-0 w-20 bg-gray-800/80 flex flex-col items-center py-2 gap-2">
          {/* Current turn indicator */}
          {currentTurnPlayer && (
            <div className={`text-center ${isMyTurn ? 'text-amber-400' : 'text-white'}`}>
              <span className="text-2xl">{currentTurnPlayer.avatar}</span>
              <p className="text-[10px] truncate w-full">{isMyTurn ? 'You' : currentTurnPlayer.name}</p>
            </div>
          )}

          {/* Topic */}
          {currentTopic && (
            <div className="flex flex-col items-center bg-teal-600/50 px-2 py-1 rounded-lg">
              <span className="text-lg">{currentTopic.icon}</span>
              <span className="text-[10px] text-teal-100">{currentTopic.maori}</span>
            </div>
          )}

          {/* Other players */}
          {otherPlayers.slice(0, 3).map(player => (
            <div key={player.id} className={`
              w-10 h-10 rounded-full flex items-center justify-center text-lg
              ${player.isCurrentTurn ? 'ring-2 ring-amber-400 bg-amber-500/30' : 'bg-gray-700'}
              ${!player.isActive ? 'opacity-50' : ''}
            `}>
              {player.avatar}
            </div>
          ))}

          {/* More players */}
          {otherPlayers.length > 3 && (
            <button
              onClick={() => setShowAllPlayers(true)}
              className="text-[10px] text-gray-400"
            >
              +{otherPlayers.length - 3}
            </button>
          )}
        </div>

        {/* Center: Sentence Builder + Actions */}
        <div className="flex-1 flex flex-col min-w-0 p-2">
          <div className="flex-1 flex items-center justify-center bg-gray-800/50 rounded-xl overflow-hidden">
            <MultiplayerSentenceBuilder
              tableSlots={game.tableSlots}
              turnState={game.turnState}
              selectedCard={selectedCard}
              isMyTurn={isMyTurn}
              currentPlayerName={currentTurnPlayer?.name || 'Player'}
              onPlayCard={(slotId) => {
                if (selectedCard) {
                  onPlayCard(slotId);
                  sounds.playCardSound();
                  onSelectCard(null);
                }
              }}
              onStackCard={(slotId) => {
                if (selectedCard) {
                  onStackCard(slotId);
                  sounds.playCardSound();
                  onSelectCard(null);
                }
              }}
              onCreateSlot={() => {
                if (selectedCard) {
                  onCreateSlot();
                  sounds.playCardSound();
                  onSelectCard(null);
                }
              }}
            />
          </div>

          {/* Actions */}
          {isMyTurn && (game.phase === 'playing' || game.phase === 'turnEnd') && (
            <div className="flex gap-2 justify-center mt-2">
              {game.turnState.playedCards.length > 0 && (
                <button
                  onClick={() => { onUndoLastCard(); sounds.playCardPickupSound(); }}
                  className="px-3 py-1 bg-gray-600 text-white rounded text-sm"
                >
                  Undo
                </button>
              )}
              <button
                onClick={onPassTurn}
                className="px-3 py-1 bg-amber-500 text-white rounded text-sm"
              >
                Pass
              </button>
              {game.turnState.playedCards.length > 0 && (
                <KoreroButton
                  disabled={false}
                  sentence={getSentenceFromSlots(game.tableSlots)}
                  onKorero={(translation) => onSubmitTurn(getSentenceFromSlots(game.tableSlots), translation)}
                />
              )}
            </div>
          )}
        </div>

        {/* Right: Card Hand (vertical) */}
        <div className="flex-shrink-0 w-24 bg-white/95 flex flex-col items-center p-2 overflow-y-auto">
          <h3 className="text-[10px] font-bold text-gray-700 mb-1">Cards</h3>
          <div className="flex flex-col gap-1">
            {(game.players.find((p: Player) => p.id === playerId)?.hand || []).map((card) => (
              <div
                key={card.id}
                onClick={() => {
                  if (isMyTurn || game.phase === 'playing') {
                    onSelectCard(selectedCard?.id === card.id ? null : card);
                  }
                }}
                className={`
                  w-16 h-10 rounded-lg flex items-center justify-center text-[10px] font-bold
                  cursor-pointer transition-all
                  ${selectedCard?.id === card.id ? 'ring-2 ring-gray-800 scale-105' : ''}
                  bg-${card.color}-500 text-white
                `}
                style={{ backgroundColor: getCardColor(card.color) }}
              >
                {card.maori}
              </div>
            ))}
          </div>
        </div>

        {/* Players Modal */}
        {showAllPlayers && renderPlayersModal()}
      </div>
    );
  }

  // Portrait layout
  return (
    <div className="flex flex-col h-full">
      {/* Top Bar: Turn indicator + Timer */}
      <div className="flex-shrink-0 px-3 py-1 bg-gray-800/80 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          {/* Current turn indicator */}
          <div className="flex items-center gap-2">
            {currentTurnPlayer && (
              <>
                <span className="text-xl">{currentTurnPlayer.avatar}</span>
                <div>
                  <p className={`text-sm font-bold ${isMyTurn ? 'text-amber-400' : 'text-white'}`}>
                    {isMyTurn ? 'Your turn!' : `${currentTurnPlayer.name}'s turn`}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Timer (when applicable) */}
          {turnTimeRemaining !== null && turnTimeRemaining <= 10 && game.phase === 'playing' && !chillMode && (
            <span className={`px-3 py-1 rounded-full text-sm font-bold ${
              turnTimeRemaining <= 5
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-amber-500 text-white'
            }`}>
              {turnTimeRemaining}s
            </span>
          )}
        </div>

        {/* Topic indicator - centered, full width */}
        {currentTopic && (
          <div className="flex items-center justify-center gap-2 mt-1 py-1 bg-teal-600/30 rounded-lg">
            <span className="text-xl">{currentTopic.icon}</span>
            <span className="text-sm text-teal-100 font-medium">{currentTopic.maori}</span>
            <span className="text-xs text-teal-200/70">({currentTopic.name})</span>
          </div>
        )}
      </div>

      {/* Other Players Bar - compact horizontal display */}
      {otherPlayers.length > 0 && (
        <div className="flex-shrink-0 px-2 py-1 flex items-center gap-2 overflow-x-auto">
          {otherPlayers.slice(0, 4).map((player) => (
            <div
              key={player.id}
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs
                ${player.isCurrentTurn ? 'bg-amber-500/30 ring-1 ring-amber-400' : 'bg-gray-700/50'}
                ${!player.isActive ? 'opacity-50' : ''}
              `}
            >
              <span className="text-sm">{player.avatar}</span>
              <span className="text-gray-300 truncate max-w-[60px]">{player.name}</span>
              <span className="text-gray-500">{player.cardsInHand}</span>
            </div>
          ))}
          {otherPlayers.length > 4 && (
            <button
              onClick={() => setShowAllPlayers(true)}
              className="px-2 py-1 bg-gray-700/50 rounded-full text-xs text-gray-400"
            >
              +{otherPlayers.length - 4}
            </button>
          )}
        </div>
      )}

      {/* Middle Section: Sentence Builder - FULL WIDTH now */}
      <div className="flex-1 flex items-stretch min-h-0 px-2 py-1">
        <div className="flex-1 flex flex-col items-center justify-center bg-gray-800/50 rounded-xl p-2 min-h-0 overflow-hidden">
          <MultiplayerSentenceBuilder
            tableSlots={game.tableSlots}
            turnState={game.turnState}
            selectedCard={selectedCard}
            isMyTurn={isMyTurn}
            currentPlayerName={currentTurnPlayer?.name || 'Player'}
            onPlayCard={(slotId) => {
              if (selectedCard) {
                onPlayCard(slotId);
                sounds.playCardSound();
                onSelectCard(null);
              }
            }}
            onStackCard={(slotId) => {
              if (selectedCard) {
                onStackCard(slotId);
                sounds.playCardSound();
                onSelectCard(null);
              }
            }}
            onCreateSlot={() => {
              if (selectedCard) {
                onCreateSlot();
                sounds.playCardSound();
                onSelectCard(null);
              }
            }}
          />
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="flex-shrink-0 px-3 pb-2">
        <div className="flex gap-2 justify-center items-center">
          {/* Kōrero/Voice button - left side */}
          {voice && (
            <button
              onClick={voice.isVoiceEnabled ? voice.onToggleMute : voice.onJoinVoice}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all ${
                voice.isVoiceEnabled
                  ? voice.isMuted
                    ? 'bg-red-500 text-white'
                    : 'bg-teal-500 text-white'
                  : 'bg-gray-600 text-gray-300'
              }`}
              title={voice.isVoiceEnabled ? (voice.isMuted ? 'Unmute' : 'Mute') : 'Join Voice'}
            >
              {voice.isVoiceEnabled ? (voice.isMuted ? '🔇' : '🎤') : '🎙️'}
            </button>
          )}

          {/* Undo button - only when cards played */}
          {isMyTurn && (game.phase === 'playing' || game.phase === 'turnEnd') && game.turnState.playedCards.length > 0 && (
            <button
              onClick={() => {
                onUndoLastCard();
                sounds.playCardPickupSound();
              }}
              className="px-3 py-2 bg-gray-600 text-white rounded-lg text-sm font-semibold"
            >
              Undo
            </button>
          )}

          {/* CENTER: Pass button - prominent when it's your turn */}
          {isMyTurn && (game.phase === 'playing' || game.phase === 'turnEnd') ? (
            <button
              onClick={onPassTurn}
              className="px-6 py-3 bg-amber-500 text-white rounded-xl text-base font-bold shadow-lg
                         transform transition-all duration-300 animate-pulse
                         hover:scale-105 hover:bg-amber-400
                         ring-2 ring-amber-300 ring-opacity-50"
            >
              Pass
            </button>
          ) : (
            /* Placeholder pass button when not your turn - greyed out */
            <button
              disabled
              className="px-4 py-2 bg-gray-700 text-gray-500 rounded-lg text-sm font-semibold opacity-50 cursor-not-allowed"
            >
              Pass
            </button>
          )}

          {/* Kōrero submit button - only when cards played */}
          {isMyTurn && (game.phase === 'playing' || game.phase === 'turnEnd') && game.turnState.playedCards.length > 0 && (
            <KoreroButton
              disabled={false}
              sentence={getSentenceFromSlots(game.tableSlots)}
              onKorero={(translation) => onSubmitTurn(getSentenceFromSlots(game.tableSlots), translation)}
            />
          )}

          {/* Chat button - right side */}
          {chat && (
            <button
              onClick={chat.onToggleChat}
              className="w-10 h-10 rounded-full flex items-center justify-center text-lg bg-blue-500 text-white relative"
              title="Chat"
            >
              💬
              {chat.unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Bottom: Card Hand (sticky tray) - minimal padding */}
      <div className="flex-shrink-0 bg-white/95 rounded-t-xl shadow-lg px-1 py-2 safe-area-bottom">
        {/* Hand header - compact */}
        <div className="flex justify-between items-center mb-1 px-2">
          <h3 className="font-semibold text-gray-700 text-xs">
            Cards ({game.players.find((p: Player) => p.id === playerId)?.hand?.length || 0})
          </h3>
          {!isMyTurn && selectedCard && (
            <span className="text-[10px] text-gray-500">Tap slot</span>
          )}
        </div>

        {/* Cards with horizontal scroll - use xs size and compact mode for mobile */}
        <CardHand
          cards={game.players.find((p: Player) => p.id === playerId)?.hand || []}
          selectedCardId={selectedCard?.id}
          cardSize="xs"
          compact={true}
          onSelectCard={(card) => {
            if (isMyTurn || game.phase === 'playing') {
              onSelectCard(selectedCard?.id === card.id ? null : card);
            }
          }}
        />
      </div>

      {/* All Players Modal */}
      {showAllPlayers && renderPlayersModal()}
    </div>
  );
}

export default MobileGameView;
