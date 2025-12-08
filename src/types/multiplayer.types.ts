/**
 * Multiplayer Game Types for Kapu Ti
 */

import type { Card } from './index';

// Player connection status
export type PlayerConnectionStatus = 'connected' | 'disconnected' | 'away';

// Player in the game
export interface Player {
  id: string;
  name: string;
  hand: Card[];
  isActive: boolean;    // false = left game (emptied hand)
  position: number;     // 0-3 for table position
  connectionStatus?: PlayerConnectionStatus;  // Online status
  consecutiveAutoSkips?: number;              // Track AFK behavior
}

// A slot on the table (stack of cards)
export interface TableSlot {
  id: string;
  color: string;
  cards: Card[];        // Stack - last card is current/top
  position: number;     // Position in sentence (0, 1, 2...)
}

// Game phases
export type GamePhase =
  | 'setup'             // Entering player names
  | 'dealing'           // Cards being dealt
  | 'turnOrder'         // Revealing turn order cards
  | 'topicSelect'       // Winner picks topic
  | 'playing'           // Active gameplay
  | 'verification'      // Checking pronunciation/translation
  | 'turnEnd'           // Between turns (privacy screen)
  | 'finished';         // Game over

// State during a turn
export interface TurnState {
  playedCards: { card: Card; slotId: string }[];  // Cards played this turn
  colorsPlayedThisTurn: Set<string>;              // Track colors to enforce 1-per-color
  awaitingVerification: boolean;
  spokenSentence: string | null;
  translation: string | null;
}

// Verification vote from a player
export interface VerificationVote {
  playerId: string;
  approved: boolean;
}

// Turn order card (Māori number)
export interface TurnOrderCard {
  value: number;
  maori: string;
  english: string;
  revealed: boolean;
}

// Topic for the round
export interface GameTopic {
  id: string;
  name: string;
  maori: string;
  icon: string;
}

// Complete game state
export interface MultiplayerGame {
  id: string;
  players: Player[];
  currentPlayerIndex: number;
  tableSlots: TableSlot[];
  drawPile: Card[];
  discardPile: Card[];              // Cards removed from game
  startingPattern: string[];        // e.g., ['yellow', 'green', 'red']
  phase: GamePhase;
  turnState: TurnState;
  verificationVotes: VerificationVote[];
  winnersInOrder: string[];         // Player IDs in order they won
  loserId: string | null;           // The one who makes tea!
  // Turn timer
  turnStartedAt?: number;           // Timestamp when current turn started
  turnTimeLimit?: number;           // Seconds allowed per turn (default 30)
  // Turn order phase
  turnOrderCards?: TurnOrderCard[]; // One per player, index matches player index
  turnOrderWinner?: number;         // Player index who had highest card
  // Topic selection
  currentTopic?: GameTopic;         // The topic for this round
}

// Actions that can be taken
export type GameAction =
  | { type: 'START_GAME'; playerNames: string[] }
  | { type: 'PLAY_CARD'; playerId: string; card: Card; slotId: string }
  | { type: 'CREATE_SLOT'; playerId: string; card: Card }
  | { type: 'SUBMIT_TURN'; playerId: string; spoken: string; translation: string }
  | { type: 'PASS_TURN'; playerId: string }
  | { type: 'VOTE_VERIFICATION'; playerId: string; approved: boolean }
  | { type: 'CONFIRM_TURN_END' }
  | { type: 'RESET_GAME' };

// Game settings
export interface GameSettings {
  playerCount: number;
  cardsPerPlayer: number;
  startingPattern: string[];
  verificationMode: 'vote' | 'honor' | 'audio';
}

// Default settings
export const DEFAULT_GAME_SETTINGS: GameSettings = {
  playerCount: 2,
  cardsPerPlayer: 7,
  startingPattern: ['yellow', 'green', 'red'],
  verificationMode: 'vote',
};

// Helper to create initial turn state
export function createInitialTurnState(): TurnState {
  return {
    playedCards: [],
    colorsPlayedThisTurn: new Set(),
    awaitingVerification: false,
    spokenSentence: null,
    translation: null,
  };
}

// Helper to get current sentence from table slots
export function getSentenceFromSlots(slots: TableSlot[]): string {
  return slots
    .sort((a, b) => a.position - b.position)
    .map(slot => slot.cards[slot.cards.length - 1]?.maori || '')
    .filter(Boolean)
    .join(' ');
}

// Helper to get top card of a slot
export function getTopCard(slot: TableSlot): Card | null {
  return slot.cards.length > 0 ? slot.cards[slot.cards.length - 1] : null;
}

// Helper to check if player can play a card on a slot
export function canPlayCardOnSlot(
  card: Card,
  slot: TableSlot,
  turnState: TurnState
): boolean {
  // Card color must match slot color
  if (card.color !== slot.color) return false;

  // Can only play one card per color per turn
  if (turnState.colorsPlayedThisTurn.has(card.color)) return false;

  return true;
}

// Helper to check if a player can create a new slot with a card
export function canCreateSlot(card: Card, turnState: TurnState): boolean {
  // Can only play one card per color per turn
  return !turnState.colorsPlayedThisTurn.has(card.color);
}
