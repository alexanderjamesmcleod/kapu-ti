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
  stackCard,
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

// Bot socket ID prefix - used to identify bot players
const BOT_PREFIX = 'bot-';

// Matchmaking constants
const MAX_PLAYERS_PER_TABLE = 10;
const MIN_PLAYERS_TO_START = 2;

// Turn timer constants
const DEFAULT_TURN_TIME_LIMIT = 30; // seconds
const TOPIC_SELECT_TIME_LIMIT = 15; // seconds to pick a topic
const TURN_TIMER_CHECK_INTERVAL = 1000; // Check every second
const MAX_AUTO_SKIPS_BEFORE_KICK = 3; // Kick after 3 consecutive auto-skips
const RECONNECT_GRACE_PERIOD = 60 * 1000; // 60 seconds to reconnect (fast-paced like poker)

// Track disconnected players for reconnection
interface DisconnectedPlayer {
  playerId: string;
  playerName: string;
  roomCode: string;
  disconnectedAt: number;
}

export class GameManager {
  private rooms: Map<string, Room> = new Map();
  private playerToRoom: Map<string, string> = new Map();
  private socketToPlayer: Map<string, string> = new Map();
  // Track disconnected players for reconnection
  private disconnectedPlayers: Map<string, DisconnectedPlayer> = new Map();
  // Turn timer interval reference
  private turnTimerInterval: NodeJS.Timeout | null = null;
  // Callbacks for broadcasting game state
  private onTurnTimeout?: (roomCode: string, playerId: string) => void;
  private onTurnTimerUpdate?: (roomCode: string, playerId: string, timeRemaining: number) => void;
  private onTopicTimeout?: (roomCode: string) => void;

  /**
   * Set callbacks for turn timer events
   */
  setTurnTimerCallbacks(
    onTimeout: (roomCode: string, playerId: string) => void,
    onTimerUpdate: (roomCode: string, playerId: string, timeRemaining: number) => void,
    onTopicTimeout?: (roomCode: string) => void
  ): void {
    this.onTurnTimeout = onTimeout;
    this.onTurnTimerUpdate = onTimerUpdate;
    this.onTopicTimeout = onTopicTimeout;
    
    // Start the turn timer checker if not already running
    if (!this.turnTimerInterval) {
      this.turnTimerInterval = setInterval(() => this.checkTurnTimers(), TURN_TIMER_CHECK_INTERVAL);
    }
  }

  /**
   * Check all active games for turn timeouts and topic selection timeouts
   */
  private checkTurnTimers(): void {
    const now = Date.now();

    for (const [roomCode, room] of this.rooms) {
      if (!room.game) continue;

      // Skip timer logic in chill mode
      if (room.chillMode) continue;
      
      const game = room.game;
      
      // Handle topic selection timeout
      if (game.phase === 'topicSelect') {
        const turnStartedAt = game.turnStartedAt;
        if (!turnStartedAt) continue;
        
        const elapsedSeconds = Math.floor((now - turnStartedAt) / 1000);
        const timeRemaining = Math.max(0, TOPIC_SELECT_TIME_LIMIT - elapsedSeconds);
        
        // Broadcast timer update for topic selection
        if (this.onTurnTimerUpdate && timeRemaining <= 10) {
          const selectorIndex = game.turnOrderWinner ?? 0;
          const selectorId = game.players[selectorIndex]?.id;
          if (selectorId) {
            this.onTurnTimerUpdate(roomCode, selectorId, timeRemaining);
          }
        }
        
        // Auto-select topic on timeout
        if (timeRemaining === 0) {
          this.handleTopicTimeout(roomCode);
        }
        continue;
      }
      
      // Handle playing phase turn timeout
      if (game.phase !== 'playing') continue;
      
      const turnStartedAt = game.turnStartedAt;
      const timeLimit = game.turnTimeLimit ?? DEFAULT_TURN_TIME_LIMIT;
      
      if (!turnStartedAt) continue;
      
      const elapsedSeconds = Math.floor((now - turnStartedAt) / 1000);
      const timeRemaining = Math.max(0, timeLimit - elapsedSeconds);
      
      const currentPlayer = game.players[game.currentPlayerIndex];
      if (!currentPlayer) continue;
      
      // Skip timer for bots
      const roomPlayer = room.players.find(p => p.id === currentPlayer.id);
      if (roomPlayer?.socketId.startsWith(BOT_PREFIX)) continue;
      
      // Broadcast timer update
      if (this.onTurnTimerUpdate && timeRemaining <= 10) {
        // Only broadcast when <= 10 seconds remaining
        this.onTurnTimerUpdate(roomCode, currentPlayer.id, timeRemaining);
      }
      
      // Check for timeout
      if (timeRemaining === 0) {
        this.handleTurnTimeout(roomCode, currentPlayer.id);
      }
    }
  }

  /**
   * Handle topic selection timeout - auto-pick a random topic
   */
  private handleTopicTimeout(roomCode: string): void {
    const room = this.rooms.get(roomCode);
    if (!room || !room.game || room.game.phase !== 'topicSelect') return;
    
    // Pick a random topic
    const topicIds = ['food', 'feelings', 'actions', 'animals', 'people', 'places'];
    const randomTopic = topicIds[Math.floor(Math.random() * topicIds.length)];
    
    // Get the selector (who should have picked)
    const selectorIndex = room.game.turnOrderWinner ?? 0;
    const selectorId = room.game.players[selectorIndex]?.id;
    
    console.log(`[Topic Timeout] Auto-selecting topic '${randomTopic}' for room ${roomCode}`);
    
    const result = selectTopic(room.game, selectorId, randomTopic);
    if (result.success) {
      room.game = result.game;
      // Start the turn timer for the first player
      this.startTurnTimer(roomCode);
    }
    
    // Notify via callback
    if (this.onTopicTimeout) {
      this.onTopicTimeout(roomCode);
    }
  }

  /**
   * Handle a player timing out on their turn
   */
  private handleTurnTimeout(roomCode: string, playerId: string): void {
    const room = this.rooms.get(roomCode);
    if (!room || !room.game) return;
    
    const playerIndex = room.game.players.findIndex(p => p.id === playerId);
    if (playerIndex === -1) return;
    
    // Increment auto-skip count
    const player = room.game.players[playerIndex];
    const newSkipCount = (player.consecutiveAutoSkips ?? 0) + 1;
    
    // Update player's skip count
    room.game.players[playerIndex] = {
      ...player,
      consecutiveAutoSkips: newSkipCount,
    };
    
    console.log(`[Turn Timeout] ${player.name} auto-skipped (${newSkipCount}/${MAX_AUTO_SKIPS_BEFORE_KICK})`);
    
    // Auto-pass the turn
    const result = passTurn(room.game, playerId);
    if (result.success) {
      room.game = result.game;
      // Reset turn timer for next player
      this.startTurnTimer(roomCode);
    }
    
    // Notify about timeout
    if (this.onTurnTimeout) {
      this.onTurnTimeout(roomCode, playerId);
    }
    
    // Check if player should be kicked for too many auto-skips
    if (newSkipCount >= MAX_AUTO_SKIPS_BEFORE_KICK) {
      console.log(`[AFK Kick] ${player.name} kicked for ${newSkipCount} consecutive auto-skips`);
      // Mark player as inactive/away - they can reconnect
      room.game.players[playerIndex] = {
        ...room.game.players[playerIndex],
        connectionStatus: 'away',
      };
    }
  }

  /**
   * Start or reset the turn timer for the current player
   */
  startTurnTimer(roomCode: string): void {
    const room = this.rooms.get(roomCode);
    if (!room || !room.game) return;
    
    room.game.turnStartedAt = Date.now();
    room.game.turnTimeLimit = room.game.turnTimeLimit ?? DEFAULT_TURN_TIME_LIMIT;
  }

  /**
   * Reset consecutive auto-skips when a player takes an action
   */
  resetAutoSkips(roomCode: string, playerId: string): void {
    const room = this.rooms.get(roomCode);
    if (!room || !room.game) return;
    
    const playerIndex = room.game.players.findIndex(p => p.id === playerId);
    if (playerIndex !== -1) {
      room.game.players[playerIndex] = {
        ...room.game.players[playerIndex],
        consecutiveAutoSkips: 0,
      };
    }
  }

  /**
   * Handle player disconnection - track for potential reconnection
   */
  handlePlayerDisconnect(socketId: string): DisconnectedPlayer | null {
    const playerId = this.socketToPlayer.get(socketId);
    if (!playerId) return null;
    
    const roomCode = this.playerToRoom.get(playerId);
    if (!roomCode) return null;
    
    const room = this.rooms.get(roomCode);
    if (!room) return null;
    
    const roomPlayer = room.players.find(p => p.id === playerId);
    if (!roomPlayer) return null;
    
    // Don't track bots
    if (roomPlayer.socketId.startsWith(BOT_PREFIX)) return null;
    
    const disconnectedPlayer: DisconnectedPlayer = {
      playerId,
      playerName: roomPlayer.name,
      roomCode,
      disconnectedAt: Date.now(),
    };
    
    // Store for potential reconnection (key by name for easier lookup)
    this.disconnectedPlayers.set(roomPlayer.name.toLowerCase(), disconnectedPlayer);
    
    // Mark player as disconnected in game
    if (room.game) {
      const playerIndex = room.game.players.findIndex(p => p.id === playerId);
      if (playerIndex !== -1) {
        room.game.players[playerIndex] = {
          ...room.game.players[playerIndex],
          connectionStatus: 'disconnected',
        };
      }
    }
    
    console.log(`[Disconnect] ${roomPlayer.name} disconnected from room ${roomCode}`);
    
    return disconnectedPlayer;
  }

  /**
   * Attempt to reconnect a player by name
   */
  attemptReconnect(socketId: string, playerName: string): {
    success: boolean;
    room?: Room;
    playerId?: string;
    error?: string;
  } {
    const key = playerName.toLowerCase();
    const disconnectedPlayer = this.disconnectedPlayers.get(key);
    
    if (!disconnectedPlayer) {
      return { success: false, error: 'No previous session found' };
    }
    
    // Check if grace period expired
    const elapsed = Date.now() - disconnectedPlayer.disconnectedAt;
    if (elapsed > RECONNECT_GRACE_PERIOD) {
      this.disconnectedPlayers.delete(key);
      return { success: false, error: 'Reconnection period expired' };
    }
    
    const room = this.rooms.get(disconnectedPlayer.roomCode);
    if (!room) {
      this.disconnectedPlayers.delete(key);
      return { success: false, error: 'Game no longer exists' };
    }
    
    // Find the player's spot
    const roomPlayer = room.players.find(p => p.id === disconnectedPlayer.playerId);
    if (!roomPlayer) {
      this.disconnectedPlayers.delete(key);
      return { success: false, error: 'Player seat no longer available' };
    }
    
    // Update socket mappings
    roomPlayer.socketId = socketId;
    this.socketToPlayer.set(socketId, disconnectedPlayer.playerId);
    
    // Mark player as connected in game
    if (room.game) {
      const playerIndex = room.game.players.findIndex(p => p.id === disconnectedPlayer.playerId);
      if (playerIndex !== -1) {
        room.game.players[playerIndex] = {
          ...room.game.players[playerIndex],
          connectionStatus: 'connected',
          consecutiveAutoSkips: 0, // Reset on reconnect
        };
      }
    }
    
    // Clean up disconnected tracker
    this.disconnectedPlayers.delete(key);
    
    console.log(`[Reconnect] ${playerName} reconnected to room ${room.code}`);
    
    return { success: true, room, playerId: disconnectedPlayer.playerId };
  }

  /**
   * Clean up expired disconnect entries
   */
  cleanupDisconnectedPlayers(): void {
    const now = Date.now();
    for (const [key, player] of this.disconnectedPlayers) {
      if (now - player.disconnectedAt > RECONNECT_GRACE_PERIOD) {
        this.disconnectedPlayers.delete(key);
        console.log(`[Cleanup] Removed expired reconnect entry for ${player.playerName}`);
      }
    }
  }

  /**
   * Get a room by code
   */
  getRoom(roomCode: string): Room | undefined {
    return this.rooms.get(roomCode);
  }

  /**
   * Get player ID from socket ID
   */
  getPlayerIdFromSocket(socketId: string): string | undefined {
    return this.socketToPlayer.get(socketId);
  }

  /**
   * Get room code for a player
   */
  getRoomCodeForPlayer(playerId: string): string | undefined {
    return this.playerToRoom.get(playerId);
  }

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
      chillMode: false,  // Timers enabled by default
    };

    this.rooms.set(roomCode, room);
    this.playerToRoom.set(playerId, roomCode);
    this.socketToPlayer.set(socketId, playerId);

    return { room, playerId };
  }

  /**
   * Auto-matchmaking: Find an available table or create a new one
   * - If a table has room (< 10 players) and game in progress, add player mid-game
   * - If a table has room and is waiting (< 2 players), add player and maybe start
   * - If no suitable table, create a new one
   */
  findOrCreateGame(socketId: string, playerName: string): {
    room: Room;
    playerId: string;
    game: MultiplayerGame | null;
    isNewGame: boolean;
    shouldStartGame: boolean;
  } {
    const playerId = generateId();
    const player: RoomPlayer = {
      id: playerId,
      name: playerName,
      socketId,
      isHost: false,
      isReady: true,
    };

    // Find a table with room (prefer tables waiting for players, then active games)
    let targetRoom: Room | null = null;
    
    // First: look for waiting rooms (no game yet, needs players)
    for (const room of this.rooms.values()) {
      const realPlayerCount = room.players.filter(p => !p.socketId.startsWith(BOT_PREFIX)).length;
      if (!room.game && realPlayerCount < MAX_PLAYERS_PER_TABLE) {
        targetRoom = room;
        break;
      }
    }

    // Second: look for active games that aren't full
    if (!targetRoom) {
      for (const room of this.rooms.values()) {
        const realPlayerCount = room.players.filter(p => !p.socketId.startsWith(BOT_PREFIX)).length;
        if (room.game && realPlayerCount < MAX_PLAYERS_PER_TABLE) {
          targetRoom = room;
          break;
        }
      }
    }

    // No suitable room found - create a new one
    if (!targetRoom) {
      let roomCode = generateRoomCode();
      while (this.rooms.has(roomCode)) {
        roomCode = generateRoomCode();
      }

      player.isHost = true;
      const now = Date.now();
      targetRoom = {
        code: roomCode,
        players: [player],
        game: null,
        createdAt: now,
        lastActivity: now,
        hostId: playerId,
        chillMode: false,  // Timers enabled by default
      };

      this.rooms.set(roomCode, targetRoom);
      this.playerToRoom.set(playerId, roomCode);
      this.socketToPlayer.set(socketId, playerId);

      return {
        room: targetRoom,
        playerId,
        game: null,
        isNewGame: true,
        shouldStartGame: false, // Need at least 2 players
      };
    }

    // Add player to existing room
    targetRoom.players.push(player);
    targetRoom.lastActivity = Date.now();
    this.playerToRoom.set(playerId, targetRoom.code);
    this.socketToPlayer.set(socketId, playerId);

    // If game is in progress, add player to the game
    if (targetRoom.game) {
      this.addPlayerToActiveGame(targetRoom, player);
      return {
        room: targetRoom,
        playerId,
        game: targetRoom.game,
        isNewGame: false,
        shouldStartGame: false, // Game already running
      };
    }

    // Check if we should auto-start the game
    const realPlayerCount = targetRoom.players.filter(p => !p.socketId.startsWith(BOT_PREFIX)).length;
    const shouldStartGame = realPlayerCount >= MIN_PLAYERS_TO_START;

    return {
      room: targetRoom,
      playerId,
      game: null,
      isNewGame: false,
      shouldStartGame,
    };
  }

  /**
   * Add a player to an active game mid-game
   * They get dealt cards and added to the turn order at the end
   */
  private addPlayerToActiveGame(room: Room, roomPlayer: RoomPlayer): void {
    if (!room.game) return;

    const game = room.game;
    
    // Deal cards to new player from draw pile
    const cardsPerPlayer = 7; // Default
    const newHand = game.drawPile.splice(0, Math.min(cardsPerPlayer, game.drawPile.length));
    
    // Create new player object
    const newPlayer: import('../src/types/multiplayer.types').Player = {
      id: roomPlayer.id,
      name: roomPlayer.name,
      hand: newHand,
      score: 0,  // Initialize score to 0
      isActive: true,
      position: game.players.length, // Add at end
    };

    game.players.push(newPlayer);

    // Deal them a turn order card (for display purposes)
    // They join at the end of turn order - give them a "0" card (lowest priority)
    if (game.turnOrderCards) {
      game.turnOrderCards.push({
        value: 0,
        maori: 'Hōu', // New (late joiner)
        english: 'Late',
        revealed: true,
      });
    }

    console.log(`[Late Join] ${roomPlayer.name} joined active game in room ${room.code} with ${newHand.length} cards`);
  }

  /**
   * Auto-start a game when enough players join
   * Called by the matchmaking system
   */
  autoStartGame(roomCode: string): { game: MultiplayerGame; room: Room } | null {
    const room = this.rooms.get(roomCode);
    if (!room || room.game) return null; // Already has a game

    const realPlayerCount = room.players.filter(p => !p.socketId.startsWith(BOT_PREFIX)).length;
    if (realPlayerCount < MIN_PLAYERS_TO_START) return null;

    // Initialize game with all current players
    const playerIds = room.players.map(p => p.id);
    const playerNames = room.players.map(p => p.name);
    const game = initializeGame(playerIds, playerNames);

    room.game = game;
    console.log(`[Auto-Start] Game started in room ${room.code} with ${room.players.length} players`);

    return { game, room };
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

  // Toggle chill mode (host only - disables turn timers)
  setChillMode(socketId: string, enabled: boolean): Room | { error: string } {
    const playerId = this.socketToPlayer.get(socketId);
    if (!playerId) return { error: 'Player not found' };

    const roomCode = this.playerToRoom.get(playerId);
    if (!roomCode) return { error: 'Room not found' };

    const room = this.rooms.get(roomCode);
    if (!room) return { error: 'Room not found' };

    // Only host can toggle chill mode
    if (room.hostId !== playerId) {
      return { error: 'Only host can change chill mode' };
    }

    room.chillMode = enabled;
    console.log(`[Chill Mode] Room ${roomCode} chill mode ${enabled ? 'enabled' : 'disabled'}`);

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
      socketId: `${BOT_PREFIX}${Date.now()}`, // Fake socket ID for bots
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
      case 'STACK_CARD':
        result = stackCard(room.game, playerId, message.cardId, message.slotId);
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

  // Process bot topic selection when game is in topicSelect phase
  processBotTopicSelection(roomCode: string): { game: MultiplayerGame; room: Room } | null {
    const room = this.rooms.get(roomCode);
    if (!room || !room.game) return null;

    // Only process if in topicSelect phase
    if (room.game.phase !== 'topicSelect') return null;

    // Find who should select the topic (turnOrderWinner)
    const selectorIndex = room.game.turnOrderWinner;
    if (selectorIndex === null || selectorIndex === undefined) return null;

    const selectorPlayerId = room.game.players[selectorIndex].id;
    const selectorPlayer = room.players.find(p => p.id === selectorPlayerId);

    // Only process if selector is a bot
    if (!selectorPlayer || !selectorPlayer.socketId.startsWith(BOT_PREFIX)) return null;

    // Pick a random topic
    const topicIds = ['food', 'feelings', 'actions', 'animals', 'people', 'places'];
    const randomTopic = topicIds[Math.floor(Math.random() * topicIds.length)];

    const result = selectTopic(room.game, selectorPlayerId, randomTopic);
    if (result.success) {
      room.game = result.game;
      console.log(`[Bot Topic] ${selectorPlayer.name} selected topic: ${randomTopic}`);
    }

    return { game: room.game, room };
  }

  // Process bot turn when game is in playing phase and it's a bot's turn
  processBotTurn(roomCode: string): { game: MultiplayerGame; room: Room } | null {
    const room = this.rooms.get(roomCode);
    if (!room || !room.game) return null;

    // Only process if in playing phase
    if (room.game.phase !== 'playing') return null;

    // Get the current player
    const currentPlayerId = room.game.players[room.game.currentPlayerIndex].id;
    const currentPlayer = room.players.find(p => p.id === currentPlayerId);

    // Only process if current player is a bot
    if (!currentPlayer || !currentPlayer.socketId.startsWith(BOT_PREFIX)) return null;

    // For now, bots just pass their turn (simple AI)
    const result = passTurn(room.game, currentPlayerId);
    if (result.success) {
      room.game = result.game;
      console.log(`[Bot Turn] ${currentPlayer.name} passed their turn`);

      // Auto-confirm turn end for online play (no privacy screen needed)
      if (room.game.phase === 'turnEnd') {
        const confirmResult = confirmTurnEnd(room.game);
        if (confirmResult.success) {
          room.game = confirmResult.game;
          console.log(`[Bot Turn] Auto-confirmed turn end, now ${room.game.players[room.game.currentPlayerIndex]?.name}'s turn`);
        }
      }
    }

    return { game: room.game, room };
  }

  // Process bot votes when game enters verification phase
  processBotVotes(roomCode: string): { game: MultiplayerGame; room: Room } | null {
    const room = this.rooms.get(roomCode);
    if (!room || !room.game) return null;

    // Only process if in verification phase
    if (room.game.phase !== 'verification') return null;

    // Find the current player (speaker) to exclude from voting
    const currentPlayerId = room.game.players[room.game.currentPlayerIndex].id;

    // Find all bot players who haven't voted yet
    const botPlayers = room.players.filter(p =>
      p.socketId.startsWith(BOT_PREFIX) &&
      p.id !== currentPlayerId &&
      !room.game!.verificationVotes.some(v => v.playerId === p.id)
    );

    // Have each bot vote (80% chance to approve)
    for (const bot of botPlayers) {
      const approved = Math.random() < 0.8;
      const result = vote(room.game, bot.id, approved);
      if (result.success) {
        room.game = result.game;
        console.log(`[Bot Vote] ${bot.name} voted ${approved ? 'Āe' : 'Kāo'}`);
      }
    }

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
      const hasOnlyBots = room.players.every(p => p.socketId.startsWith(BOT_PREFIX));
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
          if (!player.socketId.startsWith(BOT_PREFIX)) {
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
      totalPlayers += room.players.filter(p => !p.socketId.startsWith(BOT_PREFIX)).length;
    }

    return {
      totalRooms: this.rooms.size,
      activeGames,
      totalPlayers,
    };
  }

  // Get list of public rooms for browsing (only rooms without active games that aren't full)
  getPublicRooms(): { code: string; playerCount: number; maxPlayers: number; hasGame: boolean; hostName: string }[] {
    const publicRooms: { code: string; playerCount: number; maxPlayers: number; hasGame: boolean; hostName: string }[] = [];
    const MAX_PLAYERS = 6;

    for (const room of this.rooms.values()) {
      // Only show rooms that are joinable (not full, no game in progress)
      const realPlayerCount = room.players.filter(p => !p.socketId.startsWith(BOT_PREFIX)).length;
      if (realPlayerCount > 0 && realPlayerCount < MAX_PLAYERS) {
        const host = room.players.find(p => p.isHost);
        publicRooms.push({
          code: room.code,
          playerCount: room.players.length,
          maxPlayers: MAX_PLAYERS,
          hasGame: room.game !== null,
          hostName: host?.name || 'Unknown',
        });
      }
    }

    return publicRooms;
  }
}
