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

// Calculate position around oval table
function getPlayerPosition(index: number, total: number, isSelf: boolean): { top: string; left: string; transform: string } {
  if (isSelf) {
    // Self is always at bottom center
    return { top: '85%', left: '50%', transform: 'translate(-50%, -50%)' };
  }

  // Distribute other players around the top arc
  // Exclude bottom position (that's for self)
  const otherIndex = index;
  const otherTotal = total - 1; // Exclude self from count

  if (otherTotal === 0) {
    return { top: '10%', left: '50%', transform: 'translate(-50%, -50%)' };
  }

  // Spread across top 180 degrees (from left to right)
  const startAngle = Math.PI * 0.15;  // Start 15% from left
  const endAngle = Math.PI * 0.85;    // End 15% from right
  const angleStep = (endAngle - startAngle) / Math.max(1, otherTotal - 1);
  const angle = otherTotal === 1
    ? Math.PI * 0.5  // Center if only one other player
    : startAngle + (angleStep * otherIndex);

  // Oval dimensions (percentage based)
  const radiusX = 42; // Horizontal radius
  const radiusY = 35; // Vertical radius

  const x = 50 + radiusX * Math.cos(angle);
  const y = 50 - radiusY * Math.sin(angle); // Negative because Y increases downward

  return {
    top: `${y}%`,
    left: `${x}%`,
    transform: 'translate(-50%, -50%)'
  };
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
    <div className="relative w-full max-w-4xl mx-auto aspect-[4/3]">
      {/* Table surface */}
      <div className="absolute inset-[10%] rounded-[50%] bg-gradient-to-br from-teal-700 to-teal-900
                     border-8 border-teal-950 shadow-2xl">
        {/* Inner felt */}
        <div className="absolute inset-4 rounded-[50%] bg-gradient-to-br from-teal-600 to-teal-800
                       border-4 border-teal-700/50">

          {/* Center content (sentence builder) + Topic below */}
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
            <div className="bg-teal-900/30 rounded-xl p-4 backdrop-blur-sm">
              {centerContent || (
                <p className="text-white/60 text-center">
                  Waiting for game to start...
                </p>
              )}
            </div>

            {/* Topic indicator - below sentence builder */}
            {currentTopic && (
              <div className="mt-3">
                <div className="px-4 py-2 bg-white/90 rounded-full shadow-md">
                  <span className="text-lg">{currentTopic.icon}</span>
                  <span className="ml-2 font-bold text-teal-800">{currentTopic.name}</span>
                  <span className="ml-1 text-sm text-teal-600">({currentTopic.maori})</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Other players around the table */}
      {otherPlayers.map((player, index) => (
        <PlayerSeat
          key={player.id}
          player={player}
          position={getPlayerPosition(index, maxPlayers, false)}
          seatIndex={index}
        />
      ))}

      {/* Empty seats */}
      {Array.from({ length: emptySeats }).map((_, index) => (
        <PlayerSeat
          key={`empty-${index}`}
          isEmpty
          position={getPlayerPosition(otherPlayers.length + index, maxPlayers, false)}
          seatIndex={otherPlayers.length + index}
          onSeatClick={onSeatClick}
        />
      ))}

      {/* Self at bottom */}
      {selfPlayer && (
        <PlayerSeat
          player={selfPlayer}
          position={getPlayerPosition(0, 1, true)}
          seatIndex={-1}
          onToggleVideo={onToggleVideo}
        />
      )}

      {/* Bottom content (your hand) */}
      {bottomContent && (
        <div className="absolute bottom-0 left-0 right-0">
          {bottomContent}
        </div>
      )}
    </div>
  );
}

export default GameTable;
