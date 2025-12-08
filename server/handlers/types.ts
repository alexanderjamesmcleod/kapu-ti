/**
 * Shared types for message handlers
 */

import { WebSocket } from 'ws';
import type { GameManager } from '../game-manager';
import type { ServerMessage } from '../types';
import type { MultiplayerGame } from '../../src/types/multiplayer.types';

// Handler context passed to all message handlers
export interface HandlerContext {
  ws: WebSocket;
  socketId: string;
  gameManager: GameManager;
  connections: Map<string, WebSocket>;
  voiceParticipants: Map<string, Set<string>>;
  voiceMuteState: Map<string, boolean>;
}

// Send message to a specific socket
export function send(ws: WebSocket, message: ServerMessage): void {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
  }
}

// Send to all sockets in a room
export function broadcast(
  ctx: HandlerContext,
  roomCode: string,
  message: ServerMessage,
  excludeSocket?: string
): void {
  const sockets = ctx.gameManager.getSocketsInRoom(roomCode);
  for (const socketId of sockets) {
    if (socketId !== excludeSocket) {
      const ws = ctx.connections.get(socketId);
      if (ws) {
        send(ws, message);
      }
    }
  }
}

// Send game state to all players in room (each player gets their sanitized view)
export function broadcastGameState(
  ctx: HandlerContext,
  roomCode: string,
  game: MultiplayerGame
): void {
  const sockets = ctx.gameManager.getSocketsInRoom(roomCode);
  for (const socketId of sockets) {
    const ws = ctx.connections.get(socketId);
    const playerId = ctx.gameManager.getPlayerIdBySocket(socketId);
    if (ws && playerId) {
      const sanitizedGame = ctx.gameManager.getGameForPlayer(game, playerId);
      send(ws, { type: 'GAME_STATE', game: sanitizedGame as MultiplayerGame });
    }
  }
}
