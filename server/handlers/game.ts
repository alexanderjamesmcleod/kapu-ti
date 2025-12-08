/**
 * Game message handlers - game actions and bot orchestration
 */

import type { WebSocket } from 'ws';
import type { ClientMessage } from '../types';
import type { MultiplayerGame } from '../../src/types/multiplayer.types';
import { HandlerContext, send, broadcastGameState } from './types';

// Bot action delays (ms)
const BOT_DELAYS = {
  TOPIC_SELECT: 1500,
  TURN: 1500,
  VOTE: 1000,
  POST_VOTE_TOPIC: 1000,
} as const;

/**
 * Schedule bot actions after a game state change.
 * Centralizes the setTimeout logic that was scattered throughout handlers.
 */
function scheduleBotActions(
  ctx: HandlerContext,
  roomCode: string,
  game: MultiplayerGame
): void {
  // Bot topic selection
  if (game.phase === 'topicSelect') {
    setTimeout(() => {
      const topicResult = ctx.gameManager.processBotTopicSelection(roomCode);
      if (topicResult) {
        broadcastGameState(ctx, roomCode, topicResult.game);
        // After topic selection, check for bot turn
        if (topicResult.game.phase === 'playing') {
          scheduleBotTurn(ctx, roomCode);
        }
      }
    }, BOT_DELAYS.TOPIC_SELECT);
  }

  // Bot turn
  if (game.phase === 'playing') {
    scheduleBotTurn(ctx, roomCode);
  }
}

/**
 * Schedule a bot turn with delay
 */
function scheduleBotTurn(ctx: HandlerContext, roomCode: string): void {
  setTimeout(() => {
    const botTurnResult = ctx.gameManager.processBotTurn(roomCode);
    if (botTurnResult) {
      broadcastGameState(ctx, roomCode, botTurnResult.game);
    }
  }, BOT_DELAYS.TURN);
}

/**
 * Schedule bot voting after a turn submission
 */
function scheduleBotVoting(ctx: HandlerContext, roomCode: string): void {
  setTimeout(() => {
    const botResult = ctx.gameManager.processBotVotes(roomCode);
    if (botResult) {
      broadcastGameState(ctx, roomCode, botResult.game);
      // After bot voting, check if we're now in topicSelect
      if (botResult.game.phase === 'topicSelect') {
        // Start turn timer for topic selection
        ctx.gameManager.startTurnTimer(roomCode);
        setTimeout(() => {
          const topicResult = ctx.gameManager.processBotTopicSelection(roomCode);
          if (topicResult) {
            broadcastGameState(ctx, roomCode, topicResult.game);
          }
        }, BOT_DELAYS.POST_VOTE_TOPIC);
      }
    }
  }, BOT_DELAYS.VOTE);
}

export function handleStartGame(ctx: HandlerContext): void {
  const result = ctx.gameManager.startGame(ctx.socketId);
  if ('error' in result) {
    send(ctx.ws, { type: 'ERROR', message: result.error });
    return;
  }

  // Send game started to all players with their sanitized view
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
  console.log(`Game started in room ${result.room.code}`);

  // Start turn timer for topic selection phase
  if (result.game.phase === 'topicSelect') {
    ctx.gameManager.startTurnTimer(result.room.code);
  }

  // Schedule bot actions if needed
  scheduleBotActions(ctx, result.room.code, result.game);
}

export function handleGameAction(
  ctx: HandlerContext,
  message: Extract<ClientMessage,
    | { type: 'REVEAL_TURN_ORDER_CARD' }
    | { type: 'SELECT_TOPIC' }
    | { type: 'PLAY_CARD' }
    | { type: 'STACK_CARD' }
    | { type: 'CREATE_SLOT' }
    | { type: 'SUBMIT_TURN' }
    | { type: 'VOTE' }
    | { type: 'PASS_TURN' }
    | { type: 'UNDO' }
  >
): void {
  const result = ctx.gameManager.handleAction(ctx.socketId, message);
  if (result && 'error' in result) {
    send(ctx.ws, { type: 'ERROR', message: result.error });
    return;
  }
  
  if (!result) return;

  // Get player ID for this socket
  const playerId = ctx.gameManager.getPlayerIdBySocket(ctx.socketId);

  // Reset auto-skips when player takes a valid action
  if (playerId && ['PLAY_CARD', 'CREATE_SLOT', 'SUBMIT_TURN', 'PASS_TURN'].includes(message.type)) {
    ctx.gameManager.resetAutoSkips(result.room.code, playerId);
  }

  // Start turn timer when entering playing phase
  if (result.game.phase === 'playing') {
    ctx.gameManager.startTurnTimer(result.room.code);
  }

  broadcastGameState(ctx, result.room.code, result.game);

  // After SUBMIT_TURN, trigger bot voting
  if (message.type === 'SUBMIT_TURN' && result.game.phase === 'verification') {
    scheduleBotVoting(ctx, result.room.code);
  }

  // Schedule any needed bot actions based on new game state
  scheduleBotActions(ctx, result.room.code, result.game);
}

export function handleConfirmTurnEnd(ctx: HandlerContext): void {
  const result = ctx.gameManager.confirmTurnEnd(ctx.socketId);
  if ('error' in result) {
    send(ctx.ws, { type: 'ERROR', message: result.error });
  } else {
    // Start turn timer for the new current player
    if (result.game.phase === 'playing') {
      ctx.gameManager.startTurnTimer(result.room.code);
    }
    broadcastGameState(ctx, result.room.code, result.game);
  }
}
