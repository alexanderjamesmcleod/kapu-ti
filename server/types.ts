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

// Chat message
export interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  content: string;
  isReaction: boolean;  // true for quick reactions (emoji only)
  timestamp: number;
}

// Client -> Server messages
export type ClientMessage =
  | { type: 'CREATE_ROOM'; playerName: string }
  | { type: 'JOIN_ROOM'; roomCode: string; playerName: string }
  | { type: 'LEAVE_ROOM' }
  | { type: 'SET_READY'; ready: boolean }
  | { type: 'ADD_BOT'; botName?: string }
  | { type: 'START_GAME' }
  | { type: 'PLAY_CARD'; cardId: string; slotId: string }
  | { type: 'CREATE_SLOT'; cardId: string }
  | { type: 'SUBMIT_TURN'; spoken: string; translation: string }
  | { type: 'VOTE'; approved: boolean }
  | { type: 'PASS_TURN' }
  | { type: 'UNDO' }
  | { type: 'CONFIRM_TURN_END' }
  | { type: 'CHAT'; content: string }
  | { type: 'REACTION'; emoji: string }
  | { type: 'PING' }
  // Voice chat signaling
  | { type: 'VOICE_JOIN' }
  | { type: 'VOICE_LEAVE' }
  | { type: 'VOICE_SIGNAL'; toPlayerId: string; signal: unknown }
  | { type: 'VOICE_MUTE'; isMuted: boolean };

// Voice signaling data (WebRTC)
export interface VoiceSignal {
  fromPlayerId: string;
  toPlayerId: string;
  signal: unknown; // simple-peer signal data
}

// Server -> Client messages
export type ServerMessage =
  | { type: 'ROOM_CREATED'; roomCode: string; playerId: string }
  | { type: 'ROOM_JOINED'; roomCode: string; playerId: string; players: RoomPlayer[] }
  | { type: 'PLAYER_JOINED'; player: RoomPlayer }
  | { type: 'PLAYER_LEFT'; playerId: string }
  | { type: 'PLAYER_READY'; playerId: string; ready: boolean }
  | { type: 'GAME_STARTED'; game: import('../src/types/multiplayer.types').MultiplayerGame; yourPlayerId: string }
  | { type: 'GAME_STATE'; game: import('../src/types/multiplayer.types').MultiplayerGame }
  | { type: 'CHAT_MESSAGE'; message: ChatMessage }
  | { type: 'ERROR'; message: string }
  | { type: 'PONG' }
  // Voice chat signaling
  | { type: 'VOICE_SIGNAL'; fromPlayerId: string; signal: unknown }
  | { type: 'VOICE_PEER_JOINED'; playerId: string; playerName: string }
  | { type: 'VOICE_PEER_LEFT'; playerId: string }
  | { type: 'VOICE_MUTE_CHANGED'; playerId: string; isMuted: boolean };
