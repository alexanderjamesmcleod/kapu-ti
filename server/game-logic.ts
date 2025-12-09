/**
 * Server-side game logic for Kapu Ti online multiplayer
 * Pure functions that can be tested and run on the server
 */

import type { Card } from '../src/types';
import type {
  Player,
  TableSlot,
  TurnState,
  MultiplayerGame,
  GameSettings,
  TurnOrderCard,
  GameTopic,
} from '../src/types/multiplayer.types';
import {
  DEFAULT_GAME_SETTINGS,
  createInitialTurnState,
} from '../src/types/multiplayer.types';
import { MAORI_NUMBERS, TOPICS } from '../src/data/topics';

// Import word library for card generation
import { ALL_WORDS, getWordsByType, getWordsByColor, type Word } from '../src/data/wordLibrary';

// Import sentence pattern system
import { SLOT_PATTERNS } from '../src/data/sentencePatterns';
import type { SentencePattern, PatternInstance, PatternSlotInstance } from '../src/types/sentencePattern.types';
import { getRandomPattern, generatePatternInstance } from '../src/lib/patternHelpers';

// Import scoring module
import { applyRoundScores } from './scoring';

// Convert word to card
function wordToCard(word: typeof ALL_WORDS[0]): Card {
  return {
    id: word.id,
    maori: word.maori,
    english: word.english,
    type: word.type,
    color: word.color,
  };
}

// Shuffle array using Fisher-Yates
function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Generate unique ID
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

// Generate room code (4 uppercase letters)
export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // Exclude I and O to avoid confusion
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// Create initial table slots from color pattern (legacy)
function createInitialSlots(pattern: string[]): TableSlot[] {
  return pattern.map((color, index) => ({
    id: generateId(),
    color,
    cards: [],
    cardOwners: [],
    position: index,
  }));
}

// Create table slots from a pattern instance
function createSlotsFromPattern(patternInstance: PatternInstance): TableSlot[] {
  return patternInstance.slots.map((slot, index) => ({
    id: generateId(),
    color: slot.color,
    cards: [],
    cardOwners: [],
    position: index,
  }));
}

// Generate a pattern instance for a topic
function generatePatternForTopic(topicId: string): PatternInstance {
  // Get a random pattern for this topic
  let pattern: SentencePattern;
  try {
    pattern = getRandomPattern(topicId, 'beginner'); // Start with beginner patterns
  } catch {
    // Fall back to any pattern for the topic, or first pattern overall
    const topicPatterns = SLOT_PATTERNS.filter(p => p.topicIds.includes(topicId));
    pattern = topicPatterns.length > 0 ? topicPatterns[0] : SLOT_PATTERNS[0];
  }

  // Get vocabulary words for pattern generation
  const vocabulary = ALL_WORDS as Word[];

  // Generate the pattern instance with target words
  return generatePatternInstance(pattern, vocabulary);
}

// Generate topic-aware cards for a player hand
// Ensures 60%+ of cards match the pattern's colors
function generateTopicAwareHand(
  patternInstance: PatternInstance,
  cardsPerPlayer: number,
  existingCardIds: Set<string> = new Set()
): Card[] {
  // Get colors needed for this pattern
  const patternColors = patternInstance.slots.map(slot => slot.color);
  const uniqueColors = [...new Set(patternColors)];

  // Calculate how many cards should match the pattern (60%+)
  const matchingCount = Math.ceil(cardsPerPlayer * 0.6);
  const randomCount = cardsPerPlayer - matchingCount;

  const hand: Card[] = [];
  const usedCardIds = new Set(existingCardIds);

  // Get words by color and convert to cards
  const getCardsForColor = (color: string): Card[] => {
    const words = getWordsByColor(color);
    return words
      .filter(w => !usedCardIds.has(`${w.maori}-${color}`))
      .map(w => {
        const card = wordToCard(w);
        return { ...card, id: `${w.maori}-${color}-${generateId()}` };
      });
  };

  // First, add cards that match pattern colors
  for (let i = 0; i < matchingCount; i++) {
    // Pick a random color from the pattern
    const color = uniqueColors[i % uniqueColors.length];
    const availableCards = getCardsForColor(color);

    if (availableCards.length > 0) {
      const card = availableCards[Math.floor(Math.random() * availableCards.length)];
      hand.push(card);
      usedCardIds.add(card.id);
    }
  }

  // Then add random cards from any color
  const allColors = ['purple', 'gray', 'blue', 'red', 'green', 'lightblue', 'yellow', 'orange', 'pink', 'brown', 'teal'];
  for (let i = 0; i < randomCount && hand.length < cardsPerPlayer; i++) {
    const color = allColors[Math.floor(Math.random() * allColors.length)];
    const availableCards = getCardsForColor(color);

    if (availableCards.length > 0) {
      const card = availableCards[Math.floor(Math.random() * availableCards.length)];
      hand.push(card);
      usedCardIds.add(card.id);
    }
  }

  // Fill any remaining slots with random cards
  while (hand.length < cardsPerPlayer) {
    const allCards = ALL_WORDS
      .filter(w => !usedCardIds.has(`${w.maori}-${w.color}`))
      .map(wordToCard);

    if (allCards.length === 0) break;

    const card = { ...allCards[Math.floor(Math.random() * allCards.length)], id: generateId() };
    hand.push(card);
    usedCardIds.add(card.id);
  }

  return shuffle(hand);
}

// Deal turn order cards to players (all revealed automatically)
function dealTurnOrderCards(playerCount: number): TurnOrderCard[] {
  // Shuffle the number cards and deal one to each player
  const shuffled = shuffle([...MAORI_NUMBERS]);
  return shuffled.slice(0, playerCount).map(card => ({
    value: card.value,
    maori: card.maori,
    english: card.english,
    revealed: true,  // Auto-revealed - no manual step needed
  }));
}

// Initialize a new game
export function initializeGame(
  playerIds: string[],
  playerNames: string[],
  settings: GameSettings = DEFAULT_GAME_SETTINGS
): MultiplayerGame {
  // Create all cards and shuffle
  const allCards = shuffle(ALL_WORDS.map(wordToCard));

  // Deal turn order cards first to determine seating order
  const turnOrderCards = dealTurnOrderCards(playerIds.length);

  // Create player data with their turn order cards
  const playerData = playerIds.map((id, index) => ({
    id,
    name: playerNames[index],
    turnOrderCard: turnOrderCards[index],
    originalIndex: index,
  }));

  // Sort players by turn order card value (highest first)
  playerData.sort((a, b) => b.turnOrderCard.value - a.turnOrderCard.value);

  // Reorder turn order cards to match sorted players
  const sortedTurnOrderCards = playerData.map(p => p.turnOrderCard);

  // Create players in sorted order and deal cards
  const players: Player[] = playerData.map((data, index) => ({
    id: data.id,
    name: data.name,
    hand: allCards.splice(0, settings.cardsPerPlayer),
    score: 0,  // Initialize score to 0
    isActive: true,
    position: index,  // Position is now based on turn order (highest first)
  }));

  // Remaining cards go to draw pile
  const drawPile = allCards;

  // Create starting table slots
  const tableSlots = createInitialSlots(settings.startingPattern);

  // Winner is player at index 0 (highest card value)
  const turnOrderWinner = 0;

  return {
    id: generateId(),
    players,
    currentPlayerIndex: 0,  // First player (highest card) starts
    tableSlots,
    drawPile,
    discardPile: [],
    startingPattern: settings.startingPattern,
    phase: 'topicSelect',  // Skip turnOrder, go straight to topic selection
    turnState: createInitialTurnState(),
    verificationVotes: [],
    winnersInOrder: [],
    loserId: null,
    turnOrderCards: sortedTurnOrderCards,
    turnOrderWinner,
    currentTopic: undefined,
  };
}

// Find next active player
function findNextActivePlayer(players: Player[], currentIdx: number): number {
  let nextIdx = (currentIdx + 1) % players.length;
  let iterations = 0;
  while (!players[nextIdx].isActive && iterations < players.length) {
    nextIdx = (nextIdx + 1) % players.length;
    iterations++;
  }
  return nextIdx;
}

// Play a card on a slot
export function playCard(
  game: MultiplayerGame,
  playerId: string,
  cardId: string,
  slotId: string
): { success: boolean; game: MultiplayerGame; error?: string } {
  const playerIndex = game.players.findIndex(p => p.id === playerId);
  if (playerIndex === -1) {
    return { success: false, game, error: 'Player not found' };
  }

  if (playerIndex !== game.currentPlayerIndex) {
    return { success: false, game, error: 'Not your turn' };
  }

  const player = game.players[playerIndex];
  const card = player.hand.find(c => c.id === cardId);
  const slot = game.tableSlots.find(s => s.id === slotId);

  if (!card) {
    return { success: false, game, error: 'Card not in hand' };
  }

  if (!slot) {
    return { success: false, game, error: 'Slot not found' };
  }

  if (card.color !== slot.color) {
    return { success: false, game, error: 'Card color does not match slot' };
  }

  if (game.turnState.colorsPlayedThisTurn.has(card.color)) {
    return { success: false, game, error: 'Already played this color this turn' };
  }

  // Update game state
  const newPlayers = [...game.players];
  const newHand = player.hand.filter(c => c.id !== cardId);
  newPlayers[playerIndex] = { ...player, hand: newHand };

  // Update slots with card AND owner tracking
  const newSlots = game.tableSlots.map(s =>
    s.id === slotId
      ? {
          ...s,
          cards: [...s.cards, card],
          cardOwners: [...(s.cardOwners || []), playerId]
        }
      : s
  );

  const newColorsPlayed = new Set(game.turnState.colorsPlayedThisTurn);
  newColorsPlayed.add(card.color);

  const newGame: MultiplayerGame = {
    ...game,
    players: newPlayers,
    tableSlots: newSlots,
    turnState: {
      ...game.turnState,
      playedCards: [...game.turnState.playedCards, { card, slotId, playerId }],
      colorsPlayedThisTurn: newColorsPlayed,
    },
  };

  return { success: true, game: newGame };
}

// Stack a card on an occupied slot (any player can do this during playing phase)
// This allows players to change the sentence by stacking same-color cards
export function stackCard(
  game: MultiplayerGame,
  playerId: string,
  cardId: string,
  slotId: string
): { success: boolean; game: MultiplayerGame; error?: string } {
  // Must be in playing phase
  if (game.phase !== 'playing') {
    return { success: false, game, error: 'Can only stack cards during playing phase' };
  }

  const playerIndex = game.players.findIndex(p => p.id === playerId);
  if (playerIndex === -1) {
    return { success: false, game, error: 'Player not found' };
  }

  const player = game.players[playerIndex];
  const card = player.hand.find(c => c.id === cardId);
  const slot = game.tableSlots.find(s => s.id === slotId);

  if (!card) {
    return { success: false, game, error: 'Card not in hand' };
  }

  if (!slot) {
    return { success: false, game, error: 'Slot not found' };
  }

  // Slot must already have cards (can't stack on empty)
  if (slot.cards.length === 0) {
    return { success: false, game, error: 'Cannot stack on empty slot - use playCard instead' };
  }

  if (card.color !== slot.color) {
    return { success: false, game, error: 'Card color does not match slot' };
  }

  // Update game state - remove card from player's hand, add to slot with ownership
  const newPlayers = [...game.players];
  const newHand = player.hand.filter(c => c.id !== cardId);
  newPlayers[playerIndex] = { ...player, hand: newHand };

  const newSlots = game.tableSlots.map(s =>
    s.id === slotId
      ? {
          ...s,
          cards: [...s.cards, card],
          cardOwners: [...(s.cardOwners || []), playerId]
        }
      : s
  );

  // Note: We do NOT update turnState.playedCards or colorsPlayedThisTurn
  // because this is not part of the current player's turn - it's an interrupt

  const newGame: MultiplayerGame = {
    ...game,
    players: newPlayers,
    tableSlots: newSlots,
  };

  return { success: true, game: newGame };
}

// Create a new slot with a card
export function createSlot(
  game: MultiplayerGame,
  playerId: string,
  cardId: string
): { success: boolean; game: MultiplayerGame; error?: string } {
  const playerIndex = game.players.findIndex(p => p.id === playerId);
  if (playerIndex === -1) {
    return { success: false, game, error: 'Player not found' };
  }

  if (playerIndex !== game.currentPlayerIndex) {
    return { success: false, game, error: 'Not your turn' };
  }

  const player = game.players[playerIndex];
  const card = player.hand.find(c => c.id === cardId);

  if (!card) {
    return { success: false, game, error: 'Card not in hand' };
  }

  if (game.turnState.colorsPlayedThisTurn.has(card.color)) {
    return { success: false, game, error: 'Already played this color this turn' };
  }

  // Update game state
  const newPlayers = [...game.players];
  const newHand = player.hand.filter(c => c.id !== cardId);
  newPlayers[playerIndex] = { ...player, hand: newHand };

  // Create new slot at the end with ownership tracking
  const newSlot: TableSlot = {
    id: generateId(),
    color: card.color,
    cards: [card],
    cardOwners: [playerId],
    position: game.tableSlots.length,
  };

  const newColorsPlayed = new Set(game.turnState.colorsPlayedThisTurn);
  newColorsPlayed.add(card.color);

  const newGame: MultiplayerGame = {
    ...game,
    players: newPlayers,
    tableSlots: [...game.tableSlots, newSlot],
    turnState: {
      ...game.turnState,
      playedCards: [...game.turnState.playedCards, { card, slotId: newSlot.id, playerId }],
      colorsPlayedThisTurn: newColorsPlayed,
    },
  };

  return { success: true, game: newGame };
}

// Submit turn for verification
export function submitTurn(
  game: MultiplayerGame,
  playerId: string,
  spoken: string,
  translation: string
): { success: boolean; game: MultiplayerGame; error?: string } {
  const playerIndex = game.players.findIndex(p => p.id === playerId);
  if (playerIndex === -1 || playerIndex !== game.currentPlayerIndex) {
    return { success: false, game, error: 'Not your turn' };
  }

  const newGame: MultiplayerGame = {
    ...game,
    phase: 'verification',
    turnState: {
      ...game.turnState,
      awaitingVerification: true,
      spokenSentence: spoken,
      translation,
    },
    verificationVotes: [],
  };

  return { success: true, game: newGame };
}

// Handle successful turn (Kōrero approved!)
// All players who contributed cards get points
// Winner gets completion bonus + can optionally discard 2 cards + picks topic
function handleTurnSuccess(game: MultiplayerGame): MultiplayerGame {
  const currentPlayerIdx = game.currentPlayerIndex;
  const completerId = game.players[currentPlayerIdx].id;

  // Apply round scores to ALL players who contributed
  // This handles card points, completion bonus, and streak tracking
  const scoredPlayers = applyRoundScores(game.players, game.tableSlots, completerId);

  const player = scoredPlayers[currentPlayerIdx];

  // Check if completer emptied their hand
  if (player.hand.length === 0) {
    const newWinners = [...game.winnersInOrder, player.id];
    const newPlayers = scoredPlayers.map((p, idx) =>
      idx === currentPlayerIdx ? { ...p, isActive: false } : p
    );

    // Check if game is over (only 1 active player left)
    const remainingActive = newPlayers.filter(p => p.isActive);

    if (remainingActive.length === 1) {
      return {
        ...game,
        players: newPlayers,
        winnersInOrder: newWinners,
        loserId: remainingActive[0].id,
        phase: 'finished',
        turnState: createInitialTurnState(),
      };
    }

    // Move to next active player for topic selection
    return {
      ...game,
      players: newPlayers,
      winnersInOrder: newWinners,
      currentPlayerIndex: findNextActivePlayer(newPlayers, currentPlayerIdx),
      turnOrderWinner: findNextActivePlayer(newPlayers, currentPlayerIdx),
      phase: 'topicSelect',
      turnState: createInitialTurnState(),
      verificationVotes: [],
      currentTopic: undefined,
      currentPattern: undefined,
    };
  }

  // Go to discard selection phase - winner can optionally discard up to 2 cards
  // Set turnOrderWinner to current player so they get to select topic after discard
  // Reset turnStartedAt to prevent stale timer from auto-selecting topic
  return {
    ...game,
    players: scoredPlayers,
    turnOrderWinner: currentPlayerIdx,
    phase: 'discardSelect',
    turnState: createInitialTurnState(),
    verificationVotes: [],
    turnStartedAt: Date.now(), // Reset timer for discard phase
  };
}

// Handle failed verification (3 penalty cards, next player continues)
function handleTurnFailure(game: MultiplayerGame): MultiplayerGame {
  const currentPlayerIdx = game.currentPlayerIndex;
  const player = game.players[currentPlayerIdx];

  // Draw 3 penalty cards from draw pile
  const penaltyCardCount = 3;
  const newDrawPile = [...game.drawPile];
  const penaltyCards = newDrawPile.splice(0, Math.min(penaltyCardCount, newDrawPile.length));

  // Add penalty cards to failed player's hand
  const newPlayers = [...game.players];
  newPlayers[currentPlayerIdx] = {
    ...player,
    hand: [...player.hand, ...penaltyCards],
    sentenceStreak: 0, // Reset streak on failure
  };

  // Move to next player - they continue the round (don't reset table)
  // The sentence stays as-is, next player can try to complete it or pass
  return {
    ...game,
    players: newPlayers,
    drawPile: newDrawPile,
    currentPlayerIndex: findNextActivePlayer(newPlayers, currentPlayerIdx),
    phase: 'playing', // Continue playing, don't go to turnEnd
    turnState: createInitialTurnState(),
    verificationVotes: [],
  };
}

// Vote on verification
export function vote(
  game: MultiplayerGame,
  playerId: string,
  approved: boolean
): { success: boolean; game: MultiplayerGame; error?: string } {
  if (game.phase !== 'verification') {
    return { success: false, game, error: 'Not in verification phase' };
  }

  // Check if this player already voted
  if (game.verificationVotes.some(v => v.playerId === playerId)) {
    return { success: false, game, error: 'Already voted' };
  }

  const newVotes = [...game.verificationVotes, { playerId, approved }];

  // Check if all other active players have voted
  const currentPlayerId = game.players[game.currentPlayerIndex].id;
  const otherActivePlayers = game.players.filter(
    p => p.isActive && p.id !== currentPlayerId
  );

  if (newVotes.length >= otherActivePlayers.length) {
    // Tally votes
    const approvedCount = newVotes.filter(v => v.approved).length;
    const isApproved = approvedCount > newVotes.length / 2;

    if (isApproved) {
      return { success: true, game: handleTurnSuccess({ ...game, verificationVotes: newVotes }) };
    } else {
      return { success: true, game: handleTurnFailure({ ...game, verificationVotes: newVotes }) };
    }
  }

  return { success: true, game: { ...game, verificationVotes: newVotes } };
}

// Pass turn (draw 1 card, don't play)
export function passTurn(
  game: MultiplayerGame,
  playerId: string
): { success: boolean; game: MultiplayerGame; error?: string } {
  const playerIndex = game.players.findIndex(p => p.id === playerId);
  if (playerIndex === -1 || playerIndex !== game.currentPlayerIndex) {
    return { success: false, game, error: 'Not your turn' };
  }

  const newDrawPile = [...game.drawPile];
  const drawnCard = newDrawPile.shift();

  const newPlayers = [...game.players];
  if (drawnCard) {
    newPlayers[playerIndex] = {
      ...game.players[playerIndex],
      hand: [...game.players[playerIndex].hand, drawnCard],
    };
  }

  const newGame: MultiplayerGame = {
    ...game,
    players: newPlayers,
    drawPile: newDrawPile,
    currentPlayerIndex: findNextActivePlayer(game.players, playerIndex),
    phase: 'turnEnd',
    turnState: createInitialTurnState(),
  };

  return { success: true, game: newGame };
}

// Confirm turn end (privacy screen acknowledged)
export function confirmTurnEnd(
  game: MultiplayerGame
): { success: boolean; game: MultiplayerGame; error?: string } {
  if (game.phase !== 'turnEnd') {
    return { success: false, game, error: 'Not in turn end phase' };
  }

  return { success: true, game: { ...game, phase: 'playing' } };
}

// Undo last played card this turn
export function undoLastCard(
  game: MultiplayerGame,
  playerId: string
): { success: boolean; game: MultiplayerGame; error?: string } {
  const playerIndex = game.players.findIndex(p => p.id === playerId);
  if (playerIndex === -1 || playerIndex !== game.currentPlayerIndex) {
    return { success: false, game, error: 'Not your turn' };
  }

  if (game.turnState.playedCards.length === 0) {
    return { success: false, game, error: 'No cards to undo' };
  }

  const lastPlayed = game.turnState.playedCards[game.turnState.playedCards.length - 1];
  const { card, slotId } = lastPlayed;

  // Return card to player's hand
  const newPlayers = [...game.players];
  newPlayers[playerIndex] = {
    ...newPlayers[playerIndex],
    hand: [...newPlayers[playerIndex].hand, card],
  };

  // Remove card from slot (and its owner)
  let newSlots = game.tableSlots.map(s => {
    if (s.id === slotId) {
      const newCards = [...s.cards];
      const newOwners = [...(s.cardOwners || [])];
      newCards.pop();
      newOwners.pop();
      return { ...s, cards: newCards, cardOwners: newOwners };
    }
    return s;
  });

  // Remove empty slots (except starting pattern)
  if (newSlots.length > game.startingPattern.length) {
    newSlots = newSlots.filter(s => s.cards.length > 0 || s.position < game.startingPattern.length);
  }

  // Remove color from played colors
  const newColorsPlayed = new Set(game.turnState.colorsPlayedThisTurn);
  newColorsPlayed.delete(card.color);

  const newGame: MultiplayerGame = {
    ...game,
    players: newPlayers,
    tableSlots: newSlots,
    turnState: {
      ...game.turnState,
      playedCards: game.turnState.playedCards.slice(0, -1),
      colorsPlayedThisTurn: newColorsPlayed,
    },
  };

  return { success: true, game: newGame };
}

// Discard selected cards (during discardSelect phase)
// Winner can optionally discard up to 2 cards
export function discardCards(
  game: MultiplayerGame,
  playerId: string,
  cardIds: string[]
): { success: boolean; game: MultiplayerGame; error?: string } {
  if (game.phase !== 'discardSelect') {
    return { success: false, game, error: 'Not in discard selection phase' };
  }

  // Only the round winner can discard
  const winnerIndex = game.turnOrderWinner ?? game.currentPlayerIndex;
  const playerIndex = game.players.findIndex(p => p.id === playerId);

  if (playerIndex === -1 || playerIndex !== winnerIndex) {
    return { success: false, game, error: 'Only the round winner can discard' };
  }

  // Max 2 cards
  if (cardIds.length > 2) {
    return { success: false, game, error: 'Can only discard up to 2 cards' };
  }

  const player = game.players[playerIndex];
  const cardsToDiscard: Card[] = [];
  const remainingHand: Card[] = [];

  for (const card of player.hand) {
    if (cardIds.includes(card.id)) {
      cardsToDiscard.push(card);
    } else {
      remainingHand.push(card);
    }
  }

  // Verify all requested cards were found
  if (cardsToDiscard.length !== cardIds.length) {
    return { success: false, game, error: 'Some cards not found in hand' };
  }

  const newPlayers = [...game.players];
  newPlayers[playerIndex] = {
    ...player,
    hand: remainingHand,
  };

  // Check if player emptied their hand after discard
  if (remainingHand.length === 0) {
    newPlayers[playerIndex] = { ...newPlayers[playerIndex], isActive: false };

    const newWinners = [...game.winnersInOrder, player.id];
    const remainingActive = newPlayers.filter(p => p.isActive);

    if (remainingActive.length === 1) {
      return {
        success: true,
        game: {
          ...game,
          players: newPlayers,
          discardPile: [...game.discardPile, ...cardsToDiscard],
          winnersInOrder: newWinners,
          loserId: remainingActive[0].id,
          phase: 'finished',
        },
      };
    }
  }

  // Move to topic selection for new round
  // Reset turnStartedAt so topic timer starts fresh
  return {
    success: true,
    game: {
      ...game,
      players: newPlayers,
      discardPile: [...game.discardPile, ...cardsToDiscard],
      phase: 'topicSelect',
      currentTopic: undefined,
      currentPattern: undefined,
      turnStartedAt: Date.now(), // Fresh timer for topic selection
    },
  };
}

// Skip discard (player chooses not to discard any cards)
export function skipDiscard(
  game: MultiplayerGame,
  playerId: string
): { success: boolean; game: MultiplayerGame; error?: string } {
  if (game.phase !== 'discardSelect') {
    return { success: false, game, error: 'Not in discard selection phase' };
  }

  // Only the round winner can skip
  const winnerIndex = game.turnOrderWinner ?? game.currentPlayerIndex;
  const playerIndex = game.players.findIndex(p => p.id === playerId);

  if (playerIndex === -1 || playerIndex !== winnerIndex) {
    return { success: false, game, error: 'Only the round winner can skip discard' };
  }

  // Move to topic selection for new round
  // Reset turnStartedAt so topic timer starts fresh
  return {
    success: true,
    game: {
      ...game,
      phase: 'topicSelect',
      currentTopic: undefined,
      currentPattern: undefined,
      turnStartedAt: Date.now(), // Fresh timer for topic selection
    },
  };
}

// Sanitize game state for a specific player (hide other players' hands)
export function sanitizeGameForPlayer(game: MultiplayerGame, playerId: string): MultiplayerGame {
  return {
    ...game,
    players: game.players.map(p => ({
      ...p,
      // Only show this player's full hand, others just show count
      hand: p.id === playerId ? p.hand : p.hand.map(() => ({ id: 'hidden', maori: '?', english: '?', type: '?', color: 'gray' })),
    })),
    // Don't reveal draw pile
    drawPile: [],
  };
}

// Serialize game state for JSON transmission (convert Set to Array)
export function serializeGameForWire(game: MultiplayerGame): object {
  return {
    ...game,
    turnState: {
      ...game.turnState,
      colorsPlayedThisTurn: Array.from(game.turnState.colorsPlayedThisTurn),
    },
  };
}

// Reveal a player's turn order card
export function revealTurnOrderCard(
  game: MultiplayerGame,
  playerId: string
): { success: boolean; game: MultiplayerGame; error?: string } {
  if (game.phase !== 'turnOrder') {
    return { success: false, game, error: 'Not in turn order phase' };
  }

  const playerIndex = game.players.findIndex(p => p.id === playerId);
  if (playerIndex === -1) {
    return { success: false, game, error: 'Player not found' };
  }

  if (!game.turnOrderCards || !game.turnOrderCards[playerIndex]) {
    return { success: false, game, error: 'No turn order card for player' };
  }

  // Already revealed
  if (game.turnOrderCards[playerIndex].revealed) {
    return { success: true, game };
  }

  // Reveal this player's card
  const newTurnOrderCards = [...game.turnOrderCards];
  newTurnOrderCards[playerIndex] = {
    ...newTurnOrderCards[playerIndex],
    revealed: true,
  };

  // Check if all cards are now revealed
  const allRevealed = newTurnOrderCards.every(c => c.revealed);

  if (allRevealed) {
    // Find the winner (highest card value)
    let highestValue = -1;
    let winnerIndex = 0;
    newTurnOrderCards.forEach((card, idx) => {
      if (card.value > highestValue) {
        highestValue = card.value;
        winnerIndex = idx;
      }
    });

    return {
      success: true,
      game: {
        ...game,
        turnOrderCards: newTurnOrderCards,
        turnOrderWinner: winnerIndex,
        currentPlayerIndex: winnerIndex, // Winner goes first AND picks topic
        phase: 'topicSelect',
      },
    };
  }

  return {
    success: true,
    game: {
      ...game,
      turnOrderCards: newTurnOrderCards,
    },
  };
}

// Get available topics
export function getAvailableTopics(): GameTopic[] {
  return TOPICS.map(t => ({
    id: t.id,
    name: t.name,
    maori: t.maori,
    icon: t.icon,
  }));
}

// Select a topic (by the turn order winner)
// This now also generates a sentence pattern for the round and refreshes player hands
export function selectTopic(
  game: MultiplayerGame,
  playerId: string,
  topicId: string
): { success: boolean; game: MultiplayerGame; error?: string } {
  if (game.phase !== 'topicSelect') {
    return { success: false, game, error: 'Not in topic selection phase' };
  }

  const playerIndex = game.players.findIndex(p => p.id === playerId);
  if (playerIndex === -1) {
    return { success: false, game, error: 'Player not found' };
  }

  // Only the turn order winner can select the topic
  if (playerIndex !== game.turnOrderWinner) {
    return { success: false, game, error: 'Only the turn order winner can select the topic' };
  }

  const topic = TOPICS.find(t => t.id === topicId);
  if (!topic) {
    return { success: false, game, error: 'Invalid topic' };
  }

  // Generate a sentence pattern for this topic
  const patternInstance = generatePatternForTopic(topicId);

  // Create table slots from the pattern (replaces startingPattern-based slots)
  const tableSlots = createSlotsFromPattern(patternInstance);

  // Refresh player hands with topic-aware cards
  // Each player gets cards that are 60%+ matching the pattern colors
  const usedCardIds = new Set<string>();
  const updatedPlayers = game.players.map(player => {
    if (!player.isActive) return player; // Don't refresh inactive players

    // Keep track of how many cards the player had
    const cardCount = player.hand.length;

    // Generate new topic-aware hand
    const newHand = generateTopicAwareHand(patternInstance, cardCount, usedCardIds);

    // Track used card IDs to avoid duplicates across players
    newHand.forEach(c => usedCardIds.add(c.id));

    return {
      ...player,
      hand: newHand,
    };
  });

  return {
    success: true,
    game: {
      ...game,
      players: updatedPlayers,
      currentTopic: {
        id: topic.id,
        name: topic.name,
        maori: topic.maori,
        icon: topic.icon,
      },
      currentPattern: patternInstance,
      tableSlots,
      phase: 'playing',
    },
  };
}
