/**
 * Chat message handlers - chat and reactions
 */

import type { ClientMessage, ChatMessage } from '../types';
import { HandlerContext, broadcast } from './types';

export function handleChat(
  ctx: HandlerContext,
  message: Extract<ClientMessage, { type: 'CHAT' }>
): void {
  const roomCode = ctx.gameManager.getRoomCodeBySocket(ctx.socketId);
  const playerId = ctx.gameManager.getPlayerIdBySocket(ctx.socketId);
  const playerName = ctx.gameManager.getPlayerNameBySocket(ctx.socketId);
  
  if (roomCode && playerId && playerName) {
    const chatMessage: ChatMessage = {
      id: `chat-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      playerId,
      playerName,
      content: message.content.slice(0, 200), // Limit message length
      isReaction: false,
      timestamp: Date.now(),
    };
    broadcast(ctx, roomCode, { type: 'CHAT_MESSAGE', message: chatMessage });
    console.log(`[${roomCode}] ${playerName}: ${chatMessage.content}`);
  }
}

export function handleReaction(
  ctx: HandlerContext,
  message: Extract<ClientMessage, { type: 'REACTION' }>
): void {
  const roomCode = ctx.gameManager.getRoomCodeBySocket(ctx.socketId);
  const playerId = ctx.gameManager.getPlayerIdBySocket(ctx.socketId);
  const playerName = ctx.gameManager.getPlayerNameBySocket(ctx.socketId);
  
  if (roomCode && playerId && playerName) {
    const chatMessage: ChatMessage = {
      id: `react-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      playerId,
      playerName,
      content: message.emoji,
      isReaction: true,
      timestamp: Date.now(),
    };
    broadcast(ctx, roomCode, { type: 'CHAT_MESSAGE', message: chatMessage });
    console.log(`[${roomCode}] ${playerName} reacted: ${message.emoji}`);
  }
}
