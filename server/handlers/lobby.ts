/**
 * Lobby message handlers - room and player management
 */

import type { ClientMessage } from '../types';
import type { MultiplayerGame } from '../../src/types/multiplayer.types';
import { HandlerContext, send, broadcast, broadcastGameState } from './types';

/**
 * Handle FIND_GAME - auto-matchmaking
 * Finds an available table or creates a new one
 */
export function handleFindGame(
  ctx: HandlerContext,
  message: Extract<ClientMessage, { type: 'FIND_GAME' }>
): { shouldStartGame: boolean; roomCode: string; game: MultiplayerGame | null } {
  const result = ctx.gameManager.findOrCreateGame(ctx.socketId, message.playerName);
  
  // Get sanitized game state for this player (if game exists)
  let gameForPlayer = null;
  if (result.game) {
    gameForPlayer = ctx.gameManager.getGameForPlayer(result.game, result.playerId) as MultiplayerGame;
  }

  // Send confirmation to new player
  send(ctx.ws, {
    type: 'GAME_FOUND',
    roomCode: result.room.code,
    playerId: result.playerId,
    players: result.room.players,
    game: gameForPlayer,
    waiting: !result.game && !result.shouldStartGame, // Still waiting for more players
  });

  // Notify other players in the room
  const newPlayer = result.room.players.find(p => p.id === result.playerId)!;
  broadcast(ctx, result.room.code, {
    type: 'PLAYER_JOINED',
    player: newPlayer,
  }, ctx.socketId);

  // If joining an active game, broadcast updated game state to all
  if (result.game) {
    broadcastGameState(ctx, result.room.code, result.game);
  }

  console.log(`[Matchmaking] ${message.playerName} ${result.isNewGame ? 'created new table' : 'joined table'} ${result.room.code} (${result.room.players.length} players)`);

  return {
    shouldStartGame: result.shouldStartGame,
    roomCode: result.room.code,
    game: result.game,
  };
}

/**
 * Auto-start game when enough players have joined
 * Returns the game info if started, null otherwise
 */
export function autoStartGameIfReady(
  ctx: HandlerContext,
  roomCode: string
): { game: MultiplayerGame; room: { code: string; players: { id: string; socketId: string }[] } } | null {
  const result = ctx.gameManager.autoStartGame(roomCode);
  if (!result) return null;

  // Send GAME_STARTED to all players
  for (const player of result.room.players) {
    const playerWs = ctx.connections.get(player.socketId);
    if (playerWs) {
      const sanitizedGame = ctx.gameManager.getGameForPlayer(result.game, player.id);
      send(playerWs, {
        type: 'GAME_STARTED',
        game: sanitizedGame as MultiplayerGame,
        yourPlayerId: player.id,
      });
    }
  }

  // Start turn timer for topic selection phase
  if (result.game.phase === 'topicSelect') {
    ctx.gameManager.startTurnTimer(roomCode);
  }

  console.log(`[Auto-Start] Game started in room ${result.room.code}`);
  return result;
}

export function handleCreateRoom(
  ctx: HandlerContext,
  message: Extract<ClientMessage, { type: 'CREATE_ROOM' }>
): void {
  const result = ctx.gameManager.createRoom(ctx.socketId, message.playerName);
  send(ctx.ws, {
    type: 'ROOM_CREATED',
    roomCode: result.room.code,
    playerId: result.playerId,
  });
  console.log(`Room created: ${result.room.code} by ${message.playerName}`);
}

export function handleJoinRoom(
  ctx: HandlerContext,
  message: Extract<ClientMessage, { type: 'JOIN_ROOM' }>
): void {
  const result = ctx.gameManager.joinRoom(ctx.socketId, message.roomCode, message.playerName);
  if ('error' in result) {
    send(ctx.ws, { type: 'ERROR', message: result.error });
  } else {
    // Send join confirmation to new player
    send(ctx.ws, {
      type: 'ROOM_JOINED',
      roomCode: result.room.code,
      playerId: result.playerId,
      players: result.room.players,
    });
    // Notify other players
    broadcast(ctx, result.room.code, {
      type: 'PLAYER_JOINED',
      player: result.room.players.find(p => p.id === result.playerId)!,
    }, ctx.socketId);
    console.log(`${message.playerName} joined room ${message.roomCode}`);
  }
}

export function handleListRooms(ctx: HandlerContext): void {
  const rooms = ctx.gameManager.getPublicRooms();
  send(ctx.ws, { type: 'ROOM_LIST', rooms });
}

export function handleLeaveRoom(ctx: HandlerContext): void {
  const result = ctx.gameManager.leaveRoom(ctx.socketId);
  if (result.room && result.leftPlayerId) {
    broadcast(ctx, result.room.code, {
      type: 'PLAYER_LEFT',
      playerId: result.leftPlayerId,
    });
  }
}

export function handleSetReady(
  ctx: HandlerContext,
  message: Extract<ClientMessage, { type: 'SET_READY' }>
): void {
  const room = ctx.gameManager.setReady(ctx.socketId, message.ready);
  if (room) {
    const playerId = ctx.gameManager.getPlayerIdBySocket(ctx.socketId);
    broadcast(ctx, room.code, {
      type: 'PLAYER_READY',
      playerId: playerId!,
      ready: message.ready,
    });
  }
}

export function handleAddBot(
  ctx: HandlerContext,
  message: Extract<ClientMessage, { type: 'ADD_BOT' }>
): void {
  const result = ctx.gameManager.addBot(ctx.socketId, message.botName);
  if ('error' in result) {
    send(ctx.ws, { type: 'ERROR', message: result.error });
  } else {
    // Notify all players in the room about the new bot
    broadcast(ctx, result.room.code, {
      type: 'PLAYER_JOINED',
      player: result.bot,
    });
    console.log(`Bot ${result.bot.name} added to room ${result.room.code}`);
  }
}

/**
 * Handle RECONNECT - player rejoining after disconnect
 */
export function handleReconnect(
  ctx: HandlerContext,
  message: Extract<ClientMessage, { type: 'RECONNECT' }>
): void {
  const result = ctx.gameManager.attemptReconnect(ctx.socketId, message.playerName);
  
  if (!result.success || !result.room || !result.playerId) {
    send(ctx.ws, { type: 'ERROR', message: result.error || 'Reconnection failed' });
    return;
  }
  
  const room = result.room;
  const playerId = result.playerId;
  
  // Get sanitized game state for this player (if game exists)
  let gameForPlayer = null;
  if (room.game) {
    gameForPlayer = ctx.gameManager.getGameForPlayer(room.game, playerId) as MultiplayerGame;
  }
  
  // Send game state to reconnecting player
  send(ctx.ws, {
    type: 'GAME_FOUND',
    roomCode: room.code,
    playerId: playerId,
    players: room.players,
    game: gameForPlayer,
    waiting: false,
  });
  
  // Notify other players about reconnection
  const reconnectedPlayer = room.players.find(p => p.id === playerId);
  if (reconnectedPlayer) {
    broadcast(ctx, room.code, {
      type: 'PLAYER_RECONNECTED',
      playerId: playerId,
      playerName: reconnectedPlayer.name,
    }, ctx.socketId);
  }
  
  console.log(`[Reconnect] ${message.playerName} reconnected to room ${room.code}`);
}
