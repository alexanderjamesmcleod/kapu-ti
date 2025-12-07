'use client';

import { useState } from 'react';
import type { Card as CardType } from '@/types';

// Player position around the table
export interface TablePlayer {
  id: string;
  name: string;
  avatar?: string;           // URL or emoji
  isVideoEnabled?: boolean;
  videoStream?: MediaStream;
  cardsInHand: number;
  score: number;
  isCurrentTurn: boolean;
  isHost?: boolean;
  isSelf?: boolean;
  status: 'waiting' | 'ready' | 'playing' | 'disconnected';
}

interface GameTableProps {
  players: TablePlayer[];
  maxPlayers?: number;
  centerContent?: React.ReactNode;  // Sentence builder goes here
  bottomContent?: React.ReactNode;  // Your hand goes here
  currentTopic?: { icon: string; name: string; maori: string };
  onSeatClick?: (seatIndex: number) => void;
  onToggleVideo?: (playerId: string) => void;
}

// Calculate position around rectangular table
// Layout: opponents along top edge, self at bottom center
function getPlayerPosition(index: number, total: number, isSelf: boolean): { top: string; left: string; transform: string } {
  if (isSelf) {
    // Self is always at bottom center (outside table)
    return { top: '100%', left: '50%', transform: 'translate(-50%, 0)' };
  }

  // Distribute other players along the top edge
  const otherTotal = total - 1; // Exclude self from count

  if (otherTotal === 0) {
    return { top: '-8px', left: '50%', transform: 'translate(-50%, -100%)' };
  }

  if (otherTotal === 1) {
    // Single opponent - center top
    return { top: '-8px', left: '50%', transform: 'translate(-50%, -100%)' };
  }

  if (otherTotal === 2) {
    // Two opponents - left and right of center
    const positions = ['30%', '70%'];
    return { top: '-8px', left: positions[index], transform: 'translate(-50%, -100%)' };
  }

  if (otherTotal === 3) {
    // Three opponents - spread across top
    const positions = ['20%', '50%', '80%'];
    return { top: '-8px', left: positions[index], transform: 'translate(-50%, -100%)' };
  }

  // 4+ opponents - evenly distribute
  const spacing = 80 / (otherTotal - 1);
  const leftPos = 10 + (index * spacing);
  return { top: '-8px', left: `${leftPos}%`, transform: 'translate(-50%, -100%)' };
}

// Player seat component
function PlayerSeat({
  player,
  position,
  isEmpty = false,
  seatIndex,
  onSeatClick,
  onToggleVideo
}: {
  player?: TablePlayer;
  position: { top: string; left: string; transform: string };
  isEmpty?: boolean;
  seatIndex: number;
  onSeatClick?: (index: number) => void;
  onToggleVideo?: (playerId: string) => void;
}) {
  if (isEmpty) {
    return (
      <div
        onClick={() => onSeatClick?.(seatIndex)}
        className="absolute w-20 h-24 cursor-pointer transition-all hover:scale-110"
        style={position}
      >
        <div className="w-16 h-16 mx-auto rounded-full border-2 border-dashed border-gray-400
                       bg-gray-200/50 flex items-center justify-center">
          <span className="text-2xl text-gray-400">+</span>
        </div>
        <p className="text-xs text-gray-400 text-center mt-1">Empty Seat</p>
      </div>
    );
  }

  if (!player) return null;

  const statusColors = {
    waiting: 'bg-gray-400',
    ready: 'bg-green-400',
    playing: 'bg-blue-400',
    disconnected: 'bg-red-400'
  };

  return (
    <div
      className={`absolute w-24 transition-all duration-300 ${
        player.isCurrentTurn ? 'scale-110 z-10' : ''
      }`}
      style={position}
    >
      {/* Video/Avatar circle */}
      <div className={`
        relative w-16 h-16 mx-auto rounded-full overflow-hidden
        border-4 ${player.isCurrentTurn ? 'border-amber-400 shadow-lg shadow-amber-400/50' : 'border-gray-300'}
        ${player.isSelf ? 'border-teal-400' : ''}
        bg-gradient-to-br from-teal-100 to-blue-100
      `}>
        {player.isVideoEnabled && player.videoStream ? (
          <video
            autoPlay
            muted={player.isSelf}
            playsInline
            className="w-full h-full object-cover"
            ref={(el) => {
              if (el && player.videoStream) {
                el.srcObject = player.videoStream;
              }
            }}
          />
        ) : player.isVideoEnabled ? (
          // Video enabled but no stream yet - show placeholder
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800">
            <span className="text-xl">📹</span>
            <span className="text-[8px] text-gray-400 mt-0.5">Loading...</span>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl">
            {player.avatar || '👤'}
          </div>
        )}

        {/* Current turn indicator */}
        {player.isCurrentTurn && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 rounded-full
                         flex items-center justify-center animate-pulse">
            <span className="text-xs">🎯</span>
          </div>
        )}

        {/* Video toggle for self */}
        {player.isSelf && onToggleVideo && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              onToggleVideo(player.id);
            }}
            className="absolute -bottom-1 -left-1 w-5 h-5 bg-gray-700 rounded-full
                         flex items-center justify-center cursor-pointer hover:bg-gray-600 transition-colors"
          >
            <span className="text-[10px]">{player.isVideoEnabled ? '📹' : '📷'}</span>
          </div>
        )}

        {/* Status dot */}
        <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white
                        ${statusColors[player.status]}`} />
      </div>

      {/* Player name */}
      <p className={`text-sm font-semibold text-center mt-1 truncate
                    ${player.isCurrentTurn ? 'text-amber-600' : 'text-gray-700'}
                    ${player.isSelf ? 'text-teal-600' : ''}`}>
        {player.name}
        {player.isHost && ' 👑'}
        {player.isSelf && ' (You)'}
      </p>

      {/* Cards & Score */}
      <div className="flex justify-center gap-2 text-xs text-gray-500">
        <span>🃏 {player.cardsInHand}</span>
        <span>⭐ {player.score}</span>
      </div>
    </div>
  );
}

export function GameTable({
  players,
  maxPlayers = 8,
  centerContent,
  bottomContent,
  currentTopic,
  onSeatClick,
  onToggleVideo
}: GameTableProps) {
  // Separate self from other players
  const selfPlayer = players.find(p => p.isSelf);
  const otherPlayers = players.filter(p => !p.isSelf);

  // Calculate empty seats
  const filledSeats = players.length;
  const emptySeats = Math.max(0, maxPlayers - filledSeats);

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Opponent players along the top - outside the table */}
      <div className="flex justify-center gap-4 mb-2 min-h-[70px]">
        {otherPlayers.map((player, index) => (
          <PlayerSeatCompact
            key={player.id}
            player={player}
          />
        ))}
        {/* Empty seats in lobby */}
        {onSeatClick && Array.from({ length: Math.min(emptySeats, 3) }).map((_, index) => (
          <div
            key={`empty-${index}`}
            onClick={() => onSeatClick(otherPlayers.length + index)}
            className="w-14 h-14 rounded-full border-2 border-dashed border-gray-500
                       bg-gray-700/50 flex items-center justify-center cursor-pointer
                       hover:border-gray-400 hover:bg-gray-600/50 transition-colors"
          >
            <span className="text-xl text-gray-500">+</span>
          </div>
        ))}
      </div>

      {/* Table surface - rectangular with rounded corners */}
      <div className="relative rounded-2xl bg-gradient-to-br from-teal-700 to-teal-900
                     border-4 border-teal-950 shadow-2xl p-1">
        {/* Inner felt */}
        <div className="rounded-xl bg-gradient-to-br from-teal-600 to-teal-800
                       border-2 border-teal-700/50 py-4 px-6">

          {/* Center content (sentence builder) + Topic */}
          <div className="flex flex-col items-center justify-center min-h-[120px]">
            {/* Topic indicator - above sentence builder */}
            {currentTopic && (
              <div className="mb-2">
                <div className="px-3 py-1 bg-white/90 rounded-full shadow-md text-sm">
                  <span>{currentTopic.icon}</span>
                  <span className="ml-1 font-bold text-teal-800">{currentTopic.name}</span>
                  <span className="ml-1 text-xs text-teal-600">({currentTopic.maori})</span>
                </div>
              </div>
            )}

            <div className="bg-teal-900/30 rounded-xl p-3 backdrop-blur-sm w-full">
              {centerContent || (
                <p className="text-white/60 text-center text-sm">
                  Waiting for game to start...
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Self player indicator - compact, below table */}
      {selfPlayer && (
        <div className="flex justify-center mt-2">
          <PlayerSeatCompact
            player={selfPlayer}
            onToggleVideo={onToggleVideo}
          />
        </div>
      )}

      {/* Bottom content (your hand) - no longer needed here, handled in page */}
      {bottomContent && (
        <div className="mt-2">
          {bottomContent}
        </div>
      )}
    </div>
  );
}

// Compact player seat for horizontal layout
function PlayerSeatCompact({
  player,
  onToggleVideo
}: {
  player: TablePlayer;
  onToggleVideo?: (playerId: string) => void;
}) {
  const statusColors = {
    waiting: 'bg-gray-400',
    ready: 'bg-green-400',
    playing: 'bg-blue-400',
    disconnected: 'bg-red-400'
  };

  return (
    <div className={`flex flex-col items-center transition-all duration-200 ${
      player.isCurrentTurn ? 'scale-110' : ''
    }`}>
      {/* Avatar circle */}
      <div className={`
        relative w-12 h-12 rounded-full overflow-hidden
        border-3 ${player.isCurrentTurn ? 'border-amber-400 shadow-lg shadow-amber-400/50' : 'border-gray-600'}
        ${player.isSelf ? 'border-teal-400' : ''}
        bg-gradient-to-br from-teal-100 to-blue-100
      `}>
        {player.isVideoEnabled && player.videoStream ? (
          <video
            autoPlay
            muted={player.isSelf}
            playsInline
            className="w-full h-full object-cover"
            ref={(el) => {
              if (el && player.videoStream) {
                el.srcObject = player.videoStream;
              }
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl">
            {player.avatar || '👤'}
          </div>
        )}

        {/* Current turn indicator */}
        {player.isCurrentTurn && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full
                         flex items-center justify-center animate-pulse">
            <span className="text-[10px]">🎯</span>
          </div>
        )}

        {/* Status dot */}
        <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border border-white
                        ${statusColors[player.status]}`} />
      </div>

      {/* Player name - compact */}
      <p className={`text-xs font-medium text-center mt-1 max-w-[60px] truncate
                    ${player.isCurrentTurn ? 'text-amber-400' : 'text-gray-300'}
                    ${player.isSelf ? 'text-teal-400' : ''}`}>
        {player.name}
        {player.isHost && ' 👑'}
      </p>

      {/* Cards count - tiny */}
      <span className="text-[10px] text-gray-500">🃏 {player.cardsInHand}</span>
    </div>
  );
}

export default GameTable;
