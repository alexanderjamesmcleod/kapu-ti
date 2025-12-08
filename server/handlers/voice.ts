/**
 * Voice chat handlers - WebRTC signaling
 */

import type { ClientMessage } from '../types';
import { HandlerContext, send } from './types';

export function handleVoiceJoin(ctx: HandlerContext): void {
  const roomCode = ctx.gameManager.getRoomCodeBySocket(ctx.socketId);
  const playerId = ctx.gameManager.getPlayerIdBySocket(ctx.socketId);
  const playerName = ctx.gameManager.getPlayerNameBySocket(ctx.socketId);
  
  if (!roomCode || !playerId || !playerName) return;

  // Add to voice participants
  if (!ctx.voiceParticipants.has(roomCode)) {
    ctx.voiceParticipants.set(roomCode, new Set());
  }
  const participants = ctx.voiceParticipants.get(roomCode)!;

  // Notify existing voice participants about new joiner
  for (const existingSocketId of participants) {
    const existingWs = ctx.connections.get(existingSocketId);
    if (existingWs) {
      send(existingWs, {
        type: 'VOICE_PEER_JOINED',
        playerId,
        playerName,
      });
    }
    // Also tell the new joiner about existing participants
    const existingPlayerId = ctx.gameManager.getPlayerIdBySocket(existingSocketId);
    const existingPlayerName = ctx.gameManager.getPlayerNameBySocket(existingSocketId);
    if (existingPlayerId && existingPlayerName) {
      send(ctx.ws, {
        type: 'VOICE_PEER_JOINED',
        playerId: existingPlayerId,
        playerName: existingPlayerName,
      });
    }
  }

  participants.add(ctx.socketId);
  ctx.voiceMuteState.set(ctx.socketId, false);
  console.log(`[${roomCode}] ${playerName} joined voice chat (${participants.size} in voice)`);
}

export function handleVoiceLeave(ctx: HandlerContext): void {
  const roomCode = ctx.gameManager.getRoomCodeBySocket(ctx.socketId);
  const playerId = ctx.gameManager.getPlayerIdBySocket(ctx.socketId);
  const playerName = ctx.gameManager.getPlayerNameBySocket(ctx.socketId);
  
  if (!roomCode || !playerId) return;

  const participants = ctx.voiceParticipants.get(roomCode);
  if (participants) {
    participants.delete(ctx.socketId);
    ctx.voiceMuteState.delete(ctx.socketId);

    // Notify remaining participants
    for (const otherSocketId of participants) {
      const otherWs = ctx.connections.get(otherSocketId);
      if (otherWs) {
        send(otherWs, { type: 'VOICE_PEER_LEFT', playerId });
      }
    }
    console.log(`[${roomCode}] ${playerName} left voice chat (${participants.size} in voice)`);
  }
}

export function handleVoiceSignal(
  ctx: HandlerContext,
  message: Extract<ClientMessage, { type: 'VOICE_SIGNAL' }>
): void {
  const fromPlayerId = ctx.gameManager.getPlayerIdBySocket(ctx.socketId);
  const roomCode = ctx.gameManager.getRoomCodeBySocket(ctx.socketId);
  
  if (!fromPlayerId || !roomCode) return;

  // Find the target player's socket
  const participants = ctx.voiceParticipants.get(roomCode);
  if (participants) {
    for (const otherSocketId of participants) {
      const otherPlayerId = ctx.gameManager.getPlayerIdBySocket(otherSocketId);
      if (otherPlayerId === message.toPlayerId) {
        const targetWs = ctx.connections.get(otherSocketId);
        if (targetWs) {
          send(targetWs, {
            type: 'VOICE_SIGNAL',
            fromPlayerId,
            signal: message.signal,
          });
        }
        break;
      }
    }
  }
}

export function handleVoiceMute(
  ctx: HandlerContext,
  message: Extract<ClientMessage, { type: 'VOICE_MUTE' }>
): void {
  const roomCode = ctx.gameManager.getRoomCodeBySocket(ctx.socketId);
  const playerId = ctx.gameManager.getPlayerIdBySocket(ctx.socketId);
  
  if (!roomCode || !playerId) return;

  ctx.voiceMuteState.set(ctx.socketId, message.isMuted);
  const participants = ctx.voiceParticipants.get(roomCode);
  
  if (participants) {
    // Broadcast mute state to all voice participants
    for (const otherSocketId of participants) {
      if (otherSocketId !== ctx.socketId) {
        const otherWs = ctx.connections.get(otherSocketId);
        if (otherWs) {
          send(otherWs, {
            type: 'VOICE_MUTE_CHANGED',
            playerId,
            isMuted: message.isMuted,
          });
        }
      }
    }
  }
}

/**
 * Clean up voice state when a player disconnects
 */
export function cleanupVoiceOnDisconnect(ctx: HandlerContext): void {
  const roomCode = ctx.gameManager.getRoomCodeBySocket(ctx.socketId);
  const playerId = ctx.gameManager.getPlayerIdBySocket(ctx.socketId);
  
  if (!roomCode || !playerId) return;

  const participants = ctx.voiceParticipants.get(roomCode);
  if (participants && participants.has(ctx.socketId)) {
    participants.delete(ctx.socketId);
    ctx.voiceMuteState.delete(ctx.socketId);
    
    // Notify remaining voice participants
    for (const otherSocketId of participants) {
      const otherWs = ctx.connections.get(otherSocketId);
      if (otherWs) {
        send(otherWs, { type: 'VOICE_PEER_LEFT', playerId });
      }
    }
  }
}
