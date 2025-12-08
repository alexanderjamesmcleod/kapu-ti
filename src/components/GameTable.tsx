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

// Calculate position around oval table using ellipse math
// Players are distributed around the upper arc (180° to 0°), self at bottom
function getOvalPosition(index: number, totalOthers: number): { x: number; y: number; angle: number } {
  if (totalOthers === 0) {
    return { x: 50, y: 0, angle: 90 };
  }

  // Distribute players from left (180°) to right (0°) along top arc
  // We want even spacing between players
  const startAngle = 160; // degrees from right (start from upper-left)
  const endAngle = 20;    // degrees from right (end at upper-right)
  const angleRange = startAngle - endAngle;

  let angle: number;
  if (totalOthers === 1) {
    angle = 90; // Single player at top center
  } else {
    // Evenly distribute
    angle = startAngle - (index * angleRange / (totalOthers - 1));
  }

  // Convert to radians
  const rad = (angle * Math.PI) / 180;

  // Ellipse parameters (in percentage of container)
  // These create an oval shape wider than tall
  const a = 48; // horizontal radius (% of width)
  const b = 42; // vertical radius (% of height)

  // Calculate position on ellipse (center at 50%, 50%)
  const x = 50 + a * Math.cos(rad);
  const y = 50 - b * Math.sin(rad); // subtract because CSS y increases downward

  return { x, y, angle };
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
      {/* Oval table container - includes player positions */}
      <div className="relative" style={{ paddingTop: '55%' }}> {/* Fixed aspect ratio for oval */}
        {/* Oval table surface */}
        <div
          className="absolute inset-[8%] rounded-[50%] bg-gradient-to-br from-teal-700 to-teal-900
                     border-8 border-amber-900 shadow-2xl"
          style={{
            boxShadow: `
              inset 0 0 60px rgba(0,0,0,0.3),
              0 8px 32px rgba(0,0,0,0.4),
              0 0 0 4px #5c3d2e,
              0 0 0 8px #3d2517
            `
          }}
        >
          {/* Inner felt surface */}
          <div
            className="absolute inset-3 rounded-[50%] bg-gradient-to-br from-teal-600 via-teal-700 to-teal-800"
            style={{
              boxShadow: 'inset 0 0 40px rgba(0,0,0,0.2)'
            }}
          >
            {/* Felt texture overlay */}
            <div
              className="absolute inset-0 rounded-[50%] opacity-30"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E")`
              }}
            />

            {/* Center content area */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 overflow-hidden">
              {/* Topic indicator */}
              {currentTopic && (
                <div className="mb-2 flex-shrink-0">
                  <div className="px-3 py-1.5 bg-white/95 rounded-full shadow-lg text-sm">
                    <span className="text-lg">{currentTopic.icon}</span>
                    <span className="ml-2 font-bold text-teal-800">{currentTopic.name}</span>
                    <span className="ml-2 text-xs text-teal-600">({currentTopic.maori})</span>
                  </div>
                </div>
              )}

              {/* Sentence builder area - fixed layout for max 7 cards */}
              <div className="bg-black/20 rounded-2xl p-3 backdrop-blur-sm w-full max-w-[95%]">
                {centerContent || (
                  <p className="text-white/60 text-center text-sm">
                    Waiting for game to start...
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Players positioned around the oval */}
        {otherPlayers.map((player, index) => {
          const pos = getOvalPosition(index, otherPlayers.length);
          return (
            <div
              key={player.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            >
              <PlayerSeatCompact player={player} />
            </div>
          );
        })}

        {/* Empty seats around oval (in lobby mode) */}
        {onSeatClick && Array.from({ length: Math.min(emptySeats, 3) }).map((_, index) => {
          const pos = getOvalPosition(otherPlayers.length + index, otherPlayers.length + emptySeats);
          return (
            <div
              key={`empty-${index}`}
              onClick={() => onSeatClick(otherPlayers.length + index)}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10
                         w-12 h-12 rounded-full border-2 border-dashed border-gray-400
                         bg-gray-700/50 flex items-center justify-center cursor-pointer
                         hover:border-white hover:bg-gray-600/50 transition-all"
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            >
              <span className="text-xl text-gray-400">+</span>
            </div>
          );
        })}
      </div>

      {/* Self player indicator - below table */}
      {selfPlayer && (
        <div className="flex justify-center -mt-4 relative z-20">
          <div className="bg-teal-900/80 px-4 py-2 rounded-xl border-2 border-teal-600">
            <PlayerSeatCompact
              player={selfPlayer}
              onToggleVideo={onToggleVideo}
            />
          </div>
        </div>
      )}

      {/* Bottom content (your hand) */}
      {bottomContent && (
        <div className="mt-4">
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

      {/* Cards & Score - tiny */}
      <span className="text-[10px] text-gray-500">🃏 {player.cardsInHand} ⭐ {player.score}</span>
    </div>
  );
}

export default GameTable;
