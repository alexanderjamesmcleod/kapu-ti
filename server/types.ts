/**
 * Server-side types for online multiplayer
 */

// Re-export game types for convenience
export type { Card } from '../src/types';
export type {
  Player,
  TableSlot,
  GamePhase,
  TurnState,
  VerificationVote,
  MultiplayerGame,
  GameSettings,
} from '../src/types/multiplayer.types';

// Player in a room (before game starts)
export interface RoomPlayer {
  id: string;
  name: string;
  socketId: string;
  isHost: boolean;
  isReady: boolean;
}

// Room state
export interface Room {
  code: string;
  players: RoomPlayer[];
  game: import('../src/types/multiplayer.types').MultiplayerGame | null;
  createdAt: number;
  hostId: string;
}

// Client -> Server messages
export type ClientMessage =
  | { type: 'CREATE_ROOM'; playerName: string }
  | { type: 'JOIN_ROOM'; roomCode: string; playerName: string }
  | { type: 'LEAVE_ROOM' }
  | { type: 'SET_READY'; ready: boolean }
  | { type: 'START_GAME' }
  | { type: 'PLAY_CARD'; cardId: string; slotId: string }
  | { type: 'CREATE_SLOT'; cardId: string }
  | { type: 'SUBMIT_TURN'; spoken: string; translation: string }
  | { type: 'VOTE'; approved: boolean }
  | { type: 'PASS_TURN' }
  | { type: 'UNDO' }
  | { type: 'CONFIRM_TURN_END' }
  | { type: 'PING' };

// Server -> Client messages
export type ServerMessage =
  | { type: 'ROOM_CREATED'; roomCode: string; playerId: string }
  | { type: 'ROOM_JOINED'; roomCode: string; playerId: string; players: RoomPlayer[] }
  | { type: 'PLAYER_JOINED'; player: RoomPlayer }
  | { type: 'PLAYER_LEFT'; playerId: string }
  | { type: 'PLAYER_READY'; playerId: string; ready: boolean }
  | { type: 'GAME_STARTED'; game: import('../src/types/multiplayer.types').MultiplayerGame; yourPlayerId: string }
  | { type: 'GAME_STATE'; game: import('../src/types/multiplayer.types').MultiplayerGame }
  | { type: 'ERROR'; message: string }
  | { type: 'PONG' };
