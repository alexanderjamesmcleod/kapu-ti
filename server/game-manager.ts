/**
 * Game Room Manager for Kapu Ti online multiplayer
 * Manages rooms, players, and game state
 */

import type { Room, RoomPlayer, ClientMessage, ServerMessage } from './types';
import type { MultiplayerGame } from '../src/types/multiplayer.types';
import {
  generateId,
  generateRoomCode,
  initializeGame,
  playCard,
  createSlot,
  submitTurn,
  vote,
  passTurn,
  confirmTurnEnd,
  undoLastCard,
  sanitizeGameForPlayer,
  serializeGameForWire,
  revealTurnOrderCard,
  selectTopic,
} from './game-logic';

export class GameManager {
  private rooms: Map<string, Room> = new Map();
  private playerToRoom: Map<string, string> = new Map();
  private socketToPlayer: Map<string, string> = new Map();

  // Create a new room
  createRoom(socketId: string, playerName: string): { room: Room; playerId: string } {
    // Generate unique room code
    let roomCode = generateRoomCode();
    while (this.rooms.has(roomCode)) {
      roomCode = generateRoomCode();
    }

    const playerId = generateId();
    const player: RoomPlayer = {
      id: playerId,
      name: playerName,
      socketId,
      isHost: true,
      isReady: true,
    };

    const now = Date.now();
    const room: Room = {
      code: roomCode,
      players: [player],
      game: null,
      createdAt: now,
      lastActivity: now,
      hostId: playerId,
    };

    this.rooms.set(roomCode, room);
    this.playerToRoom.set(playerId, roomCode);
    this.socketToPlayer.set(socketId, playerId);

    return { room, playerId };
  }

  // Join an existing room
  joinRoom(socketId: string, roomCode: string, playerName: string): { room: Room; playerId: string } | { error: string } {
    const room = this.rooms.get(roomCode.toUpperCase());

    if (!room) {
      return { error: 'Room not found' };
    }

    if (room.game) {
      return { error: 'Game already in progress' };
    }

    if (room.players.length >= 4) {
      return { error: 'Room is full' };
    }

    const playerId = generateId();
    const player: RoomPlayer = {
      id: playerId,
      name: playerName,
      socketId,
      isHost: false,
      isReady: true, // Auto-ready - no need to click ready button
    };

    room.players.push(player);
    room.lastActivity = Date.now();
    this.playerToRoom.set(playerId, roomCode);
    this.socketToPlayer.set(socketId, playerId);

    return { room, playerId };
  }

  // Update activity timestamp for a room
  private updateActivity(roomCode: string): void {
    const room = this.rooms.get(roomCode);
    if (room) {
      room.lastActivity = Date.now();
    }
  }

  // Leave room
  leaveRoom(socketId: string): { room: Room | null; leftPlayerId: string | null } {
    const playerId = this.socketToPlayer.get(socketId);
    if (!playerId) {
      return { room: null, leftPlayerId: null };
    }

    const roomCode = this.playerToRoom.get(playerId);
    if (!roomCode) {
      return { room: null, leftPlayerId: null };
    }

    const room = this.rooms.get(roomCode);
    if (!room) {
      return { room: null, leftPlayerId: null };
    }

    // Remove player from room
    room.players = room.players.filter(p => p.id !== playerId);
    this.playerToRoom.delete(playerId);
    this.socketToPlayer.delete(socketId);

    // If room is empty, delete it
    if (room.players.length === 0) {
      this.rooms.delete(roomCode);
      return { room: null, leftPlayerId: playerId };
    }

    // If host left, assign new host
    if (room.hostId === playerId && room.players.length > 0) {
      room.hostId = room.players[0].id;
      room.players[0].isHost = true;
    }

    return { room, leftPlayerId: playerId };
  }

  // Set player ready status
  setReady(socketId: string, ready: boolean): Room | null {
    const playerId = this.socketToPlayer.get(socketId);
    if (!playerId) return null;

    const roomCode = this.playerToRoom.get(playerId);
    if (!roomCode) return null;

    const room = this.rooms.get(roomCode);
    if (!room) return null;

    const player = room.players.find(p => p.id === playerId);
    if (player) {
      player.isReady = ready;
    }

    return room;
  }

  // Add a bot player to the room
  addBot(socketId: string, botName?: string): { room: Room; bot: RoomPlayer } | { error: string } {
    const playerId = this.socketToPlayer.get(socketId);
    if (!playerId) return { error: 'Player not found' };

    const roomCode = this.playerToRoom.get(playerId);
    if (!roomCode) return { error: 'Room not found' };

    const room = this.rooms.get(roomCode);
    if (!room) return { error: 'Room not found' };

    // Check if player is host
    if (room.hostId !== playerId) {
      return { error: 'Only host can add bots' };
    }

    // Check room capacity
    if (room.players.length >= 4) {
      return { error: 'Room is full' };
    }

    // Generate bot name if not provided
    const botNames = ['Aroha', 'Tāne', 'Maia', 'Kahu', 'Ngaio', 'Wiremu', 'Hine', 'Mere'];
    const existingNames = room.players.map(p => p.name);
    const availableNames = botNames.filter(n => !existingNames.includes(n));
    const name = botName || availableNames[Math.floor(Math.random() * availableNames.length)] || `Bot${room.players.length}`;

    const bot: RoomPlayer = {
      id: generateId(),
      name,
      socketId: `bot-${Date.now()}`, // Fake socket ID for bots
      isHost: false,
      isReady: true, // Bots are always ready
    };

    room.players.push(bot);
    this.playerToRoom.set(bot.id, roomCode);

    return { room, bot };
  }

  // Start game
  startGame(socketId: string): { game: MultiplayerGame; room: Room } | { error: string } {
    const playerId = this.socketToPlayer.get(socketId);
    if (!playerId) return { error: 'Player not found' };

    const roomCode = this.playerToRoom.get(playerId);
    if (!roomCode) return { error: 'Room not found' };

    const room = this.rooms.get(roomCode);
    if (!room) return { error: 'Room not found' };

    // Check if player is host
    if (room.hostId !== playerId) {
      return { error: 'Only host can start the game' };
    }

    // Check minimum players
    if (room.players.length < 2) {
      return { error: 'Need at least 2 players' };
    }

    // Check all players are ready
    if (!room.players.every(p => p.isReady)) {
      return { error: 'Not all players are ready' };
    }

    // Initialize game
    const playerIds = room.players.map(p => p.id);
    const playerNames = room.players.map(p => p.name);
    const game = initializeGame(playerIds, playerNames);

    room.game = game;

    return { game, room };
  }

  // Handle game action
  handleAction(
    socketId: string,
    message: ClientMessage
  ): { game: MultiplayerGame; room: Room } | { error: string } | null {
    const playerId = this.socketToPlayer.get(socketId);
    if (!playerId) return { error: 'Player not found' };

    const roomCode = this.playerToRoom.get(playerId);
    if (!roomCode) return { error: 'Room not found' };

    const room = this.rooms.get(roomCode);
    if (!room || !room.game) return { error: 'No game in progress' };

    let result: { success: boolean; game: MultiplayerGame; error?: string };

    switch (message.type) {
      case 'REVEAL_TURN_ORDER_CARD':
        result = revealTurnOrderCard(room.game, playerId);
        break;
      case 'SELECT_TOPIC':
        result = selectTopic(room.game, playerId, message.topicId);
        break;
      case 'PLAY_CARD':
        result = playCard(room.game, playerId, message.cardId, message.slotId);
        break;
      case 'CREATE_SLOT':
        result = createSlot(room.game, playerId, message.cardId);
        break;
      case 'SUBMIT_TURN':
        result = submitTurn(room.game, playerId, message.spoken, message.translation);
        break;
      case 'VOTE':
        result = vote(room.game, playerId, message.approved);
        break;
      case 'PASS_TURN':
        result = passTurn(room.game, playerId);
        break;
      case 'UNDO':
        result = undoLastCard(room.game, playerId);
        break;
      default:
        return null;
    }

    if (!result.success) {
      return { error: result.error || 'Action failed' };
    }

    room.game = result.game;
    room.lastActivity = Date.now();
    return { game: room.game, room };
  }

  // Confirm turn end
  confirmTurnEnd(socketId: string): { game: MultiplayerGame; room: Room } | { error: string } {
    const playerId = this.socketToPlayer.get(socketId);
    if (!playerId) return { error: 'Player not found' };

    const roomCode = this.playerToRoom.get(playerId);
    if (!roomCode) return { error: 'Room not found' };

    const room = this.rooms.get(roomCode);
    if (!room || !room.game) return { error: 'No game in progress' };

    // Only the current player can confirm turn end
    const currentPlayerId = room.game.players[room.game.currentPlayerIndex].id;
    if (playerId !== currentPlayerId) {
      return { error: 'Not your turn to confirm' };
    }

    const result = confirmTurnEnd(room.game);
    if (!result.success) {
      return { error: result.error || 'Failed to confirm turn end' };
    }

    room.game = result.game;
    return { game: room.game, room };
  }

  // Get room by socket
  getRoomBySocket(socketId: string): Room | null {
    const playerId = this.socketToPlayer.get(socketId);
    if (!playerId) return null;

    const roomCode = this.playerToRoom.get(playerId);
    if (!roomCode) return null;

    return this.rooms.get(roomCode) || null;
  }

  // Get player ID by socket
  getPlayerIdBySocket(socketId: string): string | null {
    return this.socketToPlayer.get(socketId) || null;
  }

  // Get room code by socket
  getRoomCodeBySocket(socketId: string): string | null {
    const playerId = this.socketToPlayer.get(socketId);
    if (!playerId) return null;
    return this.playerToRoom.get(playerId) || null;
  }

  // Get player name by socket
  getPlayerNameBySocket(socketId: string): string | null {
    const playerId = this.socketToPlayer.get(socketId);
    if (!playerId) return null;

    const roomCode = this.playerToRoom.get(playerId);
    if (!roomCode) return null;

    const room = this.rooms.get(roomCode);
    if (!room) return null;

    const player = room.players.find(p => p.id === playerId);
    return player?.name || null;
  }

  // Get all sockets in a room
  getSocketsInRoom(roomCode: string): string[] {
    const room = this.rooms.get(roomCode);
    if (!room) return [];
    return room.players.map(p => p.socketId);
  }

  // Sanitize game for a specific player and serialize for wire
  getGameForPlayer(game: MultiplayerGame, playerId: string): object {
    const sanitized = sanitizeGameForPlayer(game, playerId);
    return serializeGameForWire(sanitized);
  }

  // Clean up inactive rooms (call periodically)
  // Returns list of deleted room codes for voice chat cleanup
  cleanupInactiveRooms(inactivityTimeoutMs: number = 300000): string[] {
    const now = Date.now();
    const deletedRooms: string[] = [];

    for (const [code, room] of this.rooms.entries()) {
      const timeSinceActivity = now - room.lastActivity;
      const hasOnlyBots = room.players.every(p => p.socketId.startsWith('bot-'));
      const isEmpty = room.players.length === 0;

      // Delete if:
      // 1. Room is empty (no players)
      // 2. Room has only bots (no real players)
      // 3. Room inactive for too long (default 5 minutes)
      if (isEmpty || hasOnlyBots || timeSinceActivity > inactivityTimeoutMs) {
        console.log(`[Cleanup] Deleting room ${code}: empty=${isEmpty}, onlyBots=${hasOnlyBots}, inactive=${Math.round(timeSinceActivity/1000)}s`);

        // Clean up player mappings
        for (const player of room.players) {
          this.playerToRoom.delete(player.id);
          if (!player.socketId.startsWith('bot-')) {
            this.socketToPlayer.delete(player.socketId);
          }
        }
        this.rooms.delete(code);
        deletedRooms.push(code);
      }
    }

    return deletedRooms;
  }

  // Get room stats for monitoring
  getRoomStats(): { totalRooms: number; activeGames: number; totalPlayers: number } {
    let activeGames = 0;
    let totalPlayers = 0;

    for (const room of this.rooms.values()) {
      if (room.game) activeGames++;
      totalPlayers += room.players.filter(p => !p.socketId.startsWith('bot-')).length;
    }

    return {
      totalRooms: this.rooms.size,
      activeGames,
      totalPlayers,
    };
  }
}
