/**
 * Kapu Ti WebSocket Server
 * Run with: npx tsx server/index.ts
 * Or: npm run server
 */

import { WebSocketServer, WebSocket } from 'ws';
import { GameManager } from './game-manager';
import type { ClientMessage, ServerMessage, ChatMessage } from './types';
import type { MultiplayerGame } from '../src/types/multiplayer.types';

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

// Send message to a specific socket
function send(ws: WebSocket, message: ServerMessage): void {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
  }
}

// Send to all sockets in a room
function broadcast(roomCode: string, message: ServerMessage, excludeSocket?: string): void {
  const sockets = gameManager.getSocketsInRoom(roomCode);
  for (const socketId of sockets) {
    if (socketId !== excludeSocket) {
      const ws = connections.get(socketId);
      if (ws) {
        send(ws, message);
      }
    }
  }
}

// Send game state to all players in room (each player gets their sanitized view)
function broadcastGameState(roomCode: string, game: MultiplayerGame): void {
  const sockets = gameManager.getSocketsInRoom(roomCode);
  for (const socketId of sockets) {
    const ws = connections.get(socketId);
    const playerId = gameManager.getPlayerIdBySocket(socketId);
    if (ws && playerId) {
      const sanitizedGame = gameManager.getGameForPlayer(game, playerId);
      send(ws, { type: 'GAME_STATE', game: sanitizedGame as MultiplayerGame });
    }
  }
}

// Create WebSocket server
const wss = new WebSocketServer({ port: PORT });

console.log(`Kapu Ti WebSocket Server running on port ${PORT}`);
console.log(`Connect from browser: ws://localhost:${PORT}`);

wss.on('connection', (ws: WebSocket) => {
  const socketId = generateSocketId();
  connections.set(socketId, ws);
  console.log(`Client connected: ${socketId}`);

  ws.on('message', (data: Buffer) => {
    try {
      const message: ClientMessage = JSON.parse(data.toString());
      console.log(`[${socketId}] Received:`, message.type);

      switch (message.type) {
        case 'CREATE_ROOM': {
          const result = gameManager.createRoom(socketId, message.playerName);
          send(ws, {
            type: 'ROOM_CREATED',
            roomCode: result.room.code,
            playerId: result.playerId,
          });
          console.log(`Room created: ${result.room.code} by ${message.playerName}`);
          break;
        }

        case 'JOIN_ROOM': {
          const result = gameManager.joinRoom(socketId, message.roomCode, message.playerName);
          if ('error' in result) {
            send(ws, { type: 'ERROR', message: result.error });
          } else {
            // Send join confirmation to new player
            send(ws, {
              type: 'ROOM_JOINED',
              roomCode: result.room.code,
              playerId: result.playerId,
              players: result.room.players,
            });
            // Notify other players
            broadcast(result.room.code, {
              type: 'PLAYER_JOINED',
              player: result.room.players.find(p => p.id === result.playerId)!,
            }, socketId);
            console.log(`${message.playerName} joined room ${message.roomCode}`);
          }
          break;
        }

        case 'LEAVE_ROOM': {
          const result = gameManager.leaveRoom(socketId);
          if (result.room && result.leftPlayerId) {
            broadcast(result.room.code, {
              type: 'PLAYER_LEFT',
              playerId: result.leftPlayerId,
            });
          }
          break;
        }

        case 'SET_READY': {
          const room = gameManager.setReady(socketId, message.ready);
          if (room) {
            const playerId = gameManager.getPlayerIdBySocket(socketId);
            broadcast(room.code, {
              type: 'PLAYER_READY',
              playerId: playerId!,
              ready: message.ready,
            });
          }
          break;
        }

        case 'ADD_BOT': {
          const result = gameManager.addBot(socketId, message.botName);
          if ('error' in result) {
            send(ws, { type: 'ERROR', message: result.error });
          } else {
            // Notify all players in the room about the new bot
            broadcast(result.room.code, {
              type: 'PLAYER_JOINED',
              player: result.bot,
            });
            console.log(`Bot ${result.bot.name} added to room ${result.room.code}`);
          }
          break;
        }

        case 'START_GAME': {
          const result = gameManager.startGame(socketId);
          if ('error' in result) {
            send(ws, { type: 'ERROR', message: result.error });
          } else {
            // Send game started to all players with their sanitized view
            for (const player of result.room.players) {
              const playerWs = connections.get(player.socketId);
              if (playerWs) {
                const sanitizedGame = gameManager.getGameForPlayer(result.game, player.id);
                send(playerWs, {
                  type: 'GAME_STARTED',
                  game: sanitizedGame as MultiplayerGame,
                  yourPlayerId: player.id,
                });
              }
            }
            console.log(`Game started in room ${result.room.code}`);
          }
          break;
        }

        case 'PLAY_CARD':
        case 'CREATE_SLOT':
        case 'SUBMIT_TURN':
        case 'VOTE':
        case 'PASS_TURN':
        case 'UNDO': {
          const result = gameManager.handleAction(socketId, message);
          if (result && 'error' in result) {
            send(ws, { type: 'ERROR', message: result.error });
          } else if (result) {
            broadcastGameState(result.room.code, result.game);
          }
          break;
        }

        case 'CHAT': {
          const roomCode = gameManager.getRoomCodeBySocket(socketId);
          const playerId = gameManager.getPlayerIdBySocket(socketId);
          const playerName = gameManager.getPlayerNameBySocket(socketId);
          if (roomCode && playerId && playerName) {
            const chatMessage: ChatMessage = {
              id: `chat-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              playerId,
              playerName,
              content: message.content.slice(0, 200), // Limit message length
              isReaction: false,
              timestamp: Date.now(),
            };
            broadcast(roomCode, { type: 'CHAT_MESSAGE', message: chatMessage });
            console.log(`[${roomCode}] ${playerName}: ${chatMessage.content}`);
          }
          break;
        }

        case 'REACTION': {
          const roomCode = gameManager.getRoomCodeBySocket(socketId);
          const playerId = gameManager.getPlayerIdBySocket(socketId);
          const playerName = gameManager.getPlayerNameBySocket(socketId);
          if (roomCode && playerId && playerName) {
            const chatMessage: ChatMessage = {
              id: `react-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              playerId,
              playerName,
              content: message.emoji,
              isReaction: true,
              timestamp: Date.now(),
            };
            broadcast(roomCode, { type: 'CHAT_MESSAGE', message: chatMessage });
            console.log(`[${roomCode}] ${playerName} reacted: ${message.emoji}`);
          }
          break;
        }

        case 'PING': {
          send(ws, { type: 'PONG' });
          break;
        }

        case 'VOICE_JOIN': {
          const roomCode = gameManager.getRoomCodeBySocket(socketId);
          const playerId = gameManager.getPlayerIdBySocket(socketId);
          const playerName = gameManager.getPlayerNameBySocket(socketId);
          if (roomCode && playerId && playerName) {
            // Add to voice participants
            if (!voiceParticipants.has(roomCode)) {
              voiceParticipants.set(roomCode, new Set());
            }
            const participants = voiceParticipants.get(roomCode)!;

            // Notify existing voice participants about new joiner
            for (const existingSocketId of participants) {
              const existingWs = connections.get(existingSocketId);
              if (existingWs) {
                send(existingWs, {
                  type: 'VOICE_PEER_JOINED',
                  playerId,
                  playerName,
                });
              }
              // Also tell the new joiner about existing participants
              const existingPlayerId = gameManager.getPlayerIdBySocket(existingSocketId);
              const existingPlayerName = gameManager.getPlayerNameBySocket(existingSocketId);
              if (existingPlayerId && existingPlayerName) {
                send(ws, {
                  type: 'VOICE_PEER_JOINED',
                  playerId: existingPlayerId,
                  playerName: existingPlayerName,
                });
              }
            }

            participants.add(socketId);
            voiceMuteState.set(socketId, false);
            console.log(`[${roomCode}] ${playerName} joined voice chat (${participants.size} in voice)`);
          }
          break;
        }

        case 'VOICE_LEAVE': {
          const roomCode = gameManager.getRoomCodeBySocket(socketId);
          const playerId = gameManager.getPlayerIdBySocket(socketId);
          const playerName = gameManager.getPlayerNameBySocket(socketId);
          if (roomCode && playerId) {
            const participants = voiceParticipants.get(roomCode);
            if (participants) {
              participants.delete(socketId);
              voiceMuteState.delete(socketId);

              // Notify remaining participants
              for (const otherSocketId of participants) {
                const otherWs = connections.get(otherSocketId);
                if (otherWs) {
                  send(otherWs, { type: 'VOICE_PEER_LEFT', playerId });
                }
              }
              console.log(`[${roomCode}] ${playerName} left voice chat (${participants.size} in voice)`);
            }
          }
          break;
        }

        case 'VOICE_SIGNAL': {
          // Relay WebRTC signal to target player
          const fromPlayerId = gameManager.getPlayerIdBySocket(socketId);
          const roomCode = gameManager.getRoomCodeBySocket(socketId);
          if (fromPlayerId && roomCode) {
            // Find the target player's socket
            const participants = voiceParticipants.get(roomCode);
            if (participants) {
              for (const otherSocketId of participants) {
                const otherPlayerId = gameManager.getPlayerIdBySocket(otherSocketId);
                if (otherPlayerId === message.toPlayerId) {
                  const targetWs = connections.get(otherSocketId);
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
          break;
        }

        case 'VOICE_MUTE': {
          const roomCode = gameManager.getRoomCodeBySocket(socketId);
          const playerId = gameManager.getPlayerIdBySocket(socketId);
          if (roomCode && playerId) {
            voiceMuteState.set(socketId, message.isMuted);
            const participants = voiceParticipants.get(roomCode);
            if (participants) {
              // Broadcast mute state to all voice participants
              for (const otherSocketId of participants) {
                if (otherSocketId !== socketId) {
                  const otherWs = connections.get(otherSocketId);
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
          break;
        }

        default:
          // Special case: confirm turn end comes from the new current player
          // Check if the message has a different structure
          const anyMsg = message as { type: string };
          if (anyMsg.type === 'CONFIRM_TURN_END') {
            const result = gameManager.confirmTurnEnd(socketId);
            if ('error' in result) {
              send(ws, { type: 'ERROR', message: result.error });
            } else {
              broadcastGameState(result.room.code, result.game);
            }
          }
          break;
      }
    } catch (error) {
      console.error(`[${socketId}] Error processing message:`, error);
      send(ws, { type: 'ERROR', message: 'Invalid message format' });
    }
  });

  ws.on('close', (code, reason) => {
    console.log(`Client disconnected: ${socketId} (code: ${code}, reason: ${reason?.toString() || 'none'})`);

    // Clean up voice chat
    const roomCodeForVoice = gameManager.getRoomCodeBySocket(socketId);
    const playerIdForVoice = gameManager.getPlayerIdBySocket(socketId);
    if (roomCodeForVoice && playerIdForVoice) {
      const participants = voiceParticipants.get(roomCodeForVoice);
      if (participants && participants.has(socketId)) {
        participants.delete(socketId);
        voiceMuteState.delete(socketId);
        // Notify remaining voice participants
        for (const otherSocketId of participants) {
          const otherWs = connections.get(otherSocketId);
          if (otherWs) {
            send(otherWs, { type: 'VOICE_PEER_LEFT', playerId: playerIdForVoice });
          }
        }
      }
    }

    const result = gameManager.leaveRoom(socketId);
    if (result.room && result.leftPlayerId) {
      broadcast(result.room.code, {
        type: 'PLAYER_LEFT',
        playerId: result.leftPlayerId,
      });
    }
    connections.delete(socketId);
  });

  ws.on('error', (error) => {
    console.error(`[${socketId}] WebSocket error:`, error);
  });
});

// Cleanup old rooms every hour
setInterval(() => {
  gameManager.cleanupOldRooms();
}, 3600000);

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  wss.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
