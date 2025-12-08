/**
 * Kapu Ti WebSocket Server
 * Run with: npx tsx server/index.ts
 * Or: npm run server
 */

import { WebSocketServer, WebSocket } from 'ws';
import { GameManager } from './game-manager';
import type { ClientMessage } from './types';
import {
  HandlerContext,
  send,
  broadcast,
  // Lobby handlers
  handleFindGame,
  autoStartGameIfReady,
  handleCreateRoom,
  handleJoinRoom,
  handleReconnect,
  handleListRooms,
  handleLeaveRoom,
  handleSetReady,
  handleAddBot,
  handleSetChillMode,
  // Game handlers
  handleStartGame,
  handleGameAction,
  handleConfirmTurnEnd,
  // Chat handlers
  handleChat,
  handleReaction,
  // Voice handlers
  handleVoiceJoin,
  handleVoiceLeave,
  handleVoiceSignal,
  handleVoiceMute,
  cleanupVoiceOnDisconnect,
} from './handlers';

const PORT = parseInt(process.env.PORT || '3002', 10);
const gameManager = new GameManager();

// Track connections
const connections = new Map<string, WebSocket>();

// Track voice chat participants per room: roomCode -> Set of socketIds
const voiceParticipants = new Map<string, Set<string>>();

// Track mute state: socketId -> isMuted
const voiceMuteState = new Map<string, boolean>();

// Generate socket ID
function generateSocketId(): string {
  return Math.random().toString(36).substring(2, 15);
}

// Create handler context for a socket
function createContext(ws: WebSocket, socketId: string): HandlerContext {
  return {
    ws,
    socketId,
    gameManager,
    connections,
    voiceParticipants,
    voiceMuteState,
  };
}

// Set up turn timer callbacks
gameManager.setTurnTimerCallbacks(
  // On timeout - broadcast timeout event and game state
  (roomCode: string, playerId: string) => {
    const room = gameManager.getRoom(roomCode);
    if (!room) return;
    
    // Broadcast timeout notification
    for (const player of room.players) {
      const ws = connections.get(player.socketId);
      if (ws && ws.readyState === WebSocket.OPEN) {
        send(ws, { type: 'TURN_TIMEOUT', playerId, autoSkipped: true });
      }
    }
    
    // Broadcast updated game state
    if (room.game) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { broadcastGameState } = require('./handlers');
      const dummyCtx = { gameManager, connections, voiceParticipants, voiceMuteState } as HandlerContext;
      broadcastGameState(dummyCtx, roomCode, room.game);
    }
  },
  // On timer update - broadcast remaining time
  (roomCode: string, playerId: string, timeRemaining: number) => {
    const room = gameManager.getRoom(roomCode);
    if (!room) return;
    
    for (const player of room.players) {
      const ws = connections.get(player.socketId);
      if (ws && ws.readyState === WebSocket.OPEN) {
        send(ws, { type: 'TURN_TIMER_UPDATE', playerId, timeRemaining });
      }
    }
  },
  // On topic timeout - auto-select topic and broadcast
  (roomCode: string) => {
    const room = gameManager.getRoom(roomCode);
    if (!room || !room.game) return;
    
    console.log(`[Topic Timeout] Broadcasting auto-selected topic for room ${roomCode}`);
    
    // Broadcast updated game state
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { broadcastGameState } = require('./handlers');
    const dummyCtx = { gameManager, connections, voiceParticipants, voiceMuteState } as HandlerContext;
    broadcastGameState(dummyCtx, roomCode, room.game);
  }
);

// Create WebSocket server
const wss = new WebSocketServer({ port: PORT });

console.log(`Kapu Ti WebSocket Server running on port ${PORT}`);
console.log(`Connect from browser: ws://localhost:${PORT}`);

wss.on('connection', (ws: WebSocket) => {
  const socketId = generateSocketId();
  connections.set(socketId, ws);
  console.log(`Client connected: ${socketId}`);

  ws.on('message', (data: Buffer) => {
    const ctx = createContext(ws, socketId);
    
    try {
      const message: ClientMessage = JSON.parse(data.toString());
      console.log(`[${socketId}] Received:`, message.type);

      switch (message.type) {
        // Auto-matchmaking
        case 'FIND_GAME': {
          const result = handleFindGame(ctx, message);
          // If we have enough players, auto-start the game
          if (result.shouldStartGame && !result.game) {
            const startResult = autoStartGameIfReady(ctx, result.roomCode);
            if (startResult && startResult.game.phase === 'topicSelect') {
              // Schedule bot topic selection if needed
              setTimeout(() => {
                const topicResult = gameManager.processBotTopicSelection(result.roomCode);
                if (topicResult) {
                  // eslint-disable-next-line @typescript-eslint/no-require-imports
                  const { broadcastGameState } = require('./handlers');
                  broadcastGameState(ctx, result.roomCode, topicResult.game);
                }
              }, 1500);
            }
          }
          break;
        }

        // Lobby messages
        case 'CREATE_ROOM':
          handleCreateRoom(ctx, message);
          break;
        case 'JOIN_ROOM':
          handleJoinRoom(ctx, message);
          break;
        case 'RECONNECT':
          handleReconnect(ctx, message);
          break;
        case 'LIST_ROOMS':
          handleListRooms(ctx);
          break;
        case 'LEAVE_ROOM':
          handleLeaveRoom(ctx);
          break;
        case 'SET_READY':
          handleSetReady(ctx, message);
          break;
        case 'ADD_BOT':
          handleAddBot(ctx, message);
          break;
        case 'SET_CHILL_MODE':
          handleSetChillMode(ctx, message);
          break;

        // Game messages
        case 'START_GAME':
          handleStartGame(ctx);
          break;
        case 'REVEAL_TURN_ORDER_CARD':
        case 'SELECT_TOPIC':
        case 'PLAY_CARD':
        case 'STACK_CARD':
        case 'CREATE_SLOT':
        case 'SUBMIT_TURN':
        case 'VOTE':
        case 'PASS_TURN':
        case 'UNDO':
          handleGameAction(ctx, message);
          break;
        case 'CONFIRM_TURN_END':
          handleConfirmTurnEnd(ctx);
          break;

        // Chat messages
        case 'CHAT':
          handleChat(ctx, message);
          break;
        case 'REACTION':
          handleReaction(ctx, message);
          break;

        // Voice messages
        case 'VOICE_JOIN':
          handleVoiceJoin(ctx);
          break;
        case 'VOICE_LEAVE':
          handleVoiceLeave(ctx);
          break;
        case 'VOICE_SIGNAL':
          handleVoiceSignal(ctx, message);
          break;
        case 'VOICE_MUTE':
          handleVoiceMute(ctx, message);
          break;

        // Utility
        case 'PING':
          send(ws, { type: 'PONG' });
          break;

        default:
          console.log(`[${socketId}] Unknown message type:`, (message as { type: string }).type);
          break;
      }
    } catch (error) {
      console.error(`[${socketId}] Error processing message:`, error);
      send(ws, { type: 'ERROR', message: 'Invalid message format' });
    }
  });

  ws.on('close', (code, reason) => {
    console.log(`Client disconnected: ${socketId} (code: ${code}, reason: ${reason?.toString() || 'none'})`);

    const ctx = createContext(ws, socketId);
    
    // Clean up voice chat
    cleanupVoiceOnDisconnect(ctx);

    // Track player for potential reconnection
    const disconnectedPlayer = gameManager.handlePlayerDisconnect(socketId);
    
    if (disconnectedPlayer) {
      // Notify other players about disconnection
      const room = gameManager.getRoom(disconnectedPlayer.roomCode);
      if (room) {
        broadcast(ctx, disconnectedPlayer.roomCode, {
          type: 'PLAYER_DISCONNECTED',
          playerId: disconnectedPlayer.playerId,
          playerName: disconnectedPlayer.playerName,
        }, socketId);
      }
    } else {
      // Not tracking this player - fully remove them
      const result = gameManager.leaveRoom(socketId);
      if (result.room && result.leftPlayerId) {
        broadcast(ctx, result.room.code, {
          type: 'PLAYER_LEFT',
          playerId: result.leftPlayerId,
        });
      }
    }
    connections.delete(socketId);
  });

  ws.on('error', (error) => {
    console.error(`[${socketId}] WebSocket error:`, error);
  });
});

// Cleanup inactive rooms every minute (5 min inactivity timeout)
const CLEANUP_INTERVAL_MS = 60000;  // Check every minute
const INACTIVITY_TIMEOUT_MS = 300000;  // 5 minutes of inactivity

setInterval(() => {
  const deletedRooms = gameManager.cleanupInactiveRooms(INACTIVITY_TIMEOUT_MS);

  // Clean up voice participants for deleted rooms
  for (const roomCode of deletedRooms) {
    voiceParticipants.delete(roomCode);
  }

  // Clean up expired reconnection entries
  gameManager.cleanupDisconnectedPlayers();

  // Log stats periodically
  const stats = gameManager.getRoomStats();
  if (stats.totalRooms > 0) {
    console.log(`[Stats] Rooms: ${stats.totalRooms}, Active games: ${stats.activeGames}, Players: ${stats.totalPlayers}`);
  }
}, CLEANUP_INTERVAL_MS);

console.log(`Room cleanup: every ${CLEANUP_INTERVAL_MS/1000}s, inactivity timeout: ${INACTIVITY_TIMEOUT_MS/1000}s`);

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  wss.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
