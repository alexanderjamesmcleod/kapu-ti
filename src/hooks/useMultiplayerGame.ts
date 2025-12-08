'use client';

import { useState, useCallback, useMemo } from 'react';
import { ALL_WORDS, getWordById } from '@/data';
import type { Card } from '@/types';
import {
  type MultiplayerGame,
  type Player,
  type TableSlot,
  type TurnState,
  type GamePhase,
  type GameSettings,
  DEFAULT_GAME_SETTINGS,
  createInitialTurnState,
  getSentenceFromSlots,
} from '@/types/multiplayer.types';

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

// Shuffle array
function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Generate unique ID
function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

// Create initial table slots from pattern
function createInitialSlots(pattern: string[]): TableSlot[] {
  return pattern.map((color, index) => ({
    id: generateId(),
    color,
    cards: [],
    position: index,
  }));
}

// Initialize game state
function initializeGame(
  playerNames: string[],
  settings: GameSettings = DEFAULT_GAME_SETTINGS
): MultiplayerGame {
  // Create all cards and shuffle
  const allCards = shuffle(ALL_WORDS.map(wordToCard));

  // Create players and deal cards
  const players: Player[] = playerNames.map((name, index) => ({
    id: generateId(),
    name,
    hand: allCards.splice(0, settings.cardsPerPlayer),
    score: 0,  // Initialize score to 0
    isActive: true,
    position: index,
  }));

  // Remaining cards go to draw pile
  const drawPile = allCards;

  // Create starting table slots
  const tableSlots = createInitialSlots(settings.startingPattern);

  return {
    id: generateId(),
    players,
    currentPlayerIndex: 0,
    tableSlots,
    drawPile,
    discardPile: [],
    startingPattern: settings.startingPattern,
    phase: 'playing',
    turnState: createInitialTurnState(),
    verificationVotes: [],
    winnersInOrder: [],
    loserId: null,
  };
}

export function useMultiplayerGame() {
  const [game, setGame] = useState<MultiplayerGame | null>(null);
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_GAME_SETTINGS);

  // Current player helper
  const currentPlayer = useMemo(() => {
    if (!game) return null;
    return game.players[game.currentPlayerIndex];
  }, [game]);

  // Active players (still in game)
  const activePlayers = useMemo(() => {
    if (!game) return [];
    return game.players.filter(p => p.isActive);
  }, [game]);

  // Current sentence from table
  const currentSentence = useMemo(() => {
    if (!game) return '';
    return getSentenceFromSlots(game.tableSlots);
  }, [game]);

  // Start a new game
  const startGame = useCallback((playerNames: string[]) => {
    const newGame = initializeGame(playerNames, settings);
    setGame(newGame);
  }, [settings]);

  // Play a card on a slot
  const playCard = useCallback((cardId: string, slotId: string) => {
    if (!game || !currentPlayer) return false;

    const card = currentPlayer.hand.find(c => c.id === cardId);
    const slot = game.tableSlots.find(s => s.id === slotId);

    if (!card || !slot) return false;

    // Check color matches
    if (card.color !== slot.color) return false;

    // Check not already played this color
    if (game.turnState.colorsPlayedThisTurn.has(card.color)) return false;

    setGame(prev => {
      if (!prev) return prev;

      const playerIndex = prev.currentPlayerIndex;
      const newPlayers = [...prev.players];
      const newHand = newPlayers[playerIndex].hand.filter(c => c.id !== cardId);
      newPlayers[playerIndex] = { ...newPlayers[playerIndex], hand: newHand };

      const newSlots = prev.tableSlots.map(s =>
        s.id === slotId
          ? { ...s, cards: [...s.cards, card] }
          : s
      );

      const newColorsPlayed = new Set(prev.turnState.colorsPlayedThisTurn);
      newColorsPlayed.add(card.color);

      return {
        ...prev,
        players: newPlayers,
        tableSlots: newSlots,
        turnState: {
          ...prev.turnState,
          playedCards: [...prev.turnState.playedCards, { card, slotId }],
          colorsPlayedThisTurn: newColorsPlayed,
        },
      };
    });

    return true;
  }, [game, currentPlayer]);

  // Create a new slot with a card
  const createSlot = useCallback((cardId: string) => {
    if (!game || !currentPlayer) return false;

    const card = currentPlayer.hand.find(c => c.id === cardId);
    if (!card) return false;

    // Check not already played this color
    if (game.turnState.colorsPlayedThisTurn.has(card.color)) return false;

    setGame(prev => {
      if (!prev) return prev;

      const playerIndex = prev.currentPlayerIndex;
      const newPlayers = [...prev.players];
      const newHand = newPlayers[playerIndex].hand.filter(c => c.id !== cardId);
      newPlayers[playerIndex] = { ...newPlayers[playerIndex], hand: newHand };

      // Create new slot at the end
      const newSlot: TableSlot = {
        id: generateId(),
        color: card.color,
        cards: [card],
        position: prev.tableSlots.length,
      };

      const newColorsPlayed = new Set(prev.turnState.colorsPlayedThisTurn);
      newColorsPlayed.add(card.color);

      return {
        ...prev,
        players: newPlayers,
        tableSlots: [...prev.tableSlots, newSlot],
        turnState: {
          ...prev.turnState,
          playedCards: [...prev.turnState.playedCards, { card, slotId: newSlot.id }],
          colorsPlayedThisTurn: newColorsPlayed,
        },
      };
    });

    return true;
  }, [game, currentPlayer]);

  // Submit turn for verification (after speaking/translating)
  const submitTurn = useCallback((spoken: string, translation: string) => {
    if (!game) return;

    setGame(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        phase: 'verification',
        turnState: {
          ...prev.turnState,
          awaitingVerification: true,
          spokenSentence: spoken,
          translation,
        },
        verificationVotes: [],
      };
    });
  }, [game]);

  // Find next active player - defined before vote callback to avoid hoisting issues
  function findNextActivePlayer(players: Player[], currentIdx: number): number {
    let nextIdx = (currentIdx + 1) % players.length;
    while (!players[nextIdx].isActive) {
      nextIdx = (nextIdx + 1) % players.length;
    }
    return nextIdx;
  }

  // Handle successful turn - defined before vote callback to avoid hoisting issues
  function handleTurnSuccess(gameState: MultiplayerGame): MultiplayerGame {
    const currentPlayerIdx = gameState.currentPlayerIndex;
    const player = gameState.players[currentPlayerIdx];

    // Check if player emptied their hand
    if (player.hand.length === 0) {
      const newPlayers = [...gameState.players];
      newPlayers[currentPlayerIdx] = { ...player, isActive: false };

      const newWinners = [...gameState.winnersInOrder, player.id];

      // Check if game is over (only 1 active player left)
      const remainingActive = newPlayers.filter(p => p.isActive);

      if (remainingActive.length === 1) {
        return {
          ...gameState,
          players: newPlayers,
          winnersInOrder: newWinners,
          loserId: remainingActive[0].id,
          phase: 'finished',
          turnState: createInitialTurnState(),
        };
      }

      // Move to next active player
      return {
        ...gameState,
        players: newPlayers,
        winnersInOrder: newWinners,
        currentPlayerIndex: findNextActivePlayer(newPlayers, currentPlayerIdx),
        phase: 'turnEnd',
        turnState: createInitialTurnState(),
      };
    }

    // Player draws 1 card
    const newDrawPile = [...gameState.drawPile];
    const drawnCard = newDrawPile.shift();

    const newPlayers = [...gameState.players];
    if (drawnCard) {
      newPlayers[currentPlayerIdx] = {
        ...player,
        hand: [...player.hand, drawnCard],
      };
    }

    return {
      ...gameState,
      players: newPlayers,
      drawPile: newDrawPile,
      currentPlayerIndex: findNextActivePlayer(gameState.players, currentPlayerIdx),
      phase: 'turnEnd',
      turnState: createInitialTurnState(),
      verificationVotes: [],
    };
  }

  // Handle failed verification (pickup all cards!) - defined before vote callback to avoid hoisting issues
  function handleTurnFailure(gameState: MultiplayerGame): MultiplayerGame {
    const currentPlayerIdx = gameState.currentPlayerIndex;
    const player = gameState.players[currentPlayerIdx];

    // Collect ALL cards from table
    const tableCards = gameState.tableSlots.flatMap(slot => slot.cards);

    // Add to player's hand
    const newPlayers = [...gameState.players];
    newPlayers[currentPlayerIdx] = {
      ...player,
      hand: [...player.hand, ...tableCards],
    };

    // Reset table to starting pattern
    const newSlots = createInitialSlots(gameState.startingPattern);

    return {
      ...gameState,
      players: newPlayers,
      tableSlots: newSlots,
      currentPlayerIndex: findNextActivePlayer(gameState.players, currentPlayerIdx),
      phase: 'turnEnd',
      turnState: createInitialTurnState(),
      verificationVotes: [],
    };
  }

  // Vote on verification
  const vote = useCallback((playerId: string, approved: boolean) => {
    if (!game || game.phase !== 'verification') return;

    setGame(prev => {
      if (!prev) return prev;

      const newVotes = [...prev.verificationVotes, { playerId, approved }];

      // Check if all other active players have voted
      const otherActivePlayers = prev.players.filter(
        p => p.isActive && p.id !== prev.players[prev.currentPlayerIndex].id
      );

      if (newVotes.length >= otherActivePlayers.length) {
        // Tally votes
        const approvedCount = newVotes.filter(v => v.approved).length;
        const isApproved = approvedCount > newVotes.length / 2;

        if (isApproved) {
          return handleTurnSuccess(prev);
        } else {
          return handleTurnFailure(prev);
        }
      }

      return { ...prev, verificationVotes: newVotes };
    });
  }, [game]);

  // Pass turn (draw 1 card, don't play)
  const passTurn = useCallback(() => {
    if (!game || !currentPlayer) return;

    setGame(prev => {
      if (!prev) return prev;

      const currentPlayerIdx = prev.currentPlayerIndex;
      const newDrawPile = [...prev.drawPile];
      const drawnCard = newDrawPile.shift();

      const newPlayers = [...prev.players];
      if (drawnCard) {
        newPlayers[currentPlayerIdx] = {
          ...prev.players[currentPlayerIdx],
          hand: [...prev.players[currentPlayerIdx].hand, drawnCard],
        };
      }

      return {
        ...prev,
        players: newPlayers,
        drawPile: newDrawPile,
        currentPlayerIndex: findNextActivePlayer(prev.players, currentPlayerIdx),
        phase: 'turnEnd',
        turnState: createInitialTurnState(),
      };
    });
  }, [game, currentPlayer]);

  // Confirm turn end (privacy screen acknowledged)
  const confirmTurnEnd = useCallback(() => {
    if (!game) return;

    setGame(prev => {
      if (!prev) return prev;
      return { ...prev, phase: 'playing' };
    });
  }, [game]);

  // Undo last played card this turn
  const undoLastCard = useCallback(() => {
    if (!game || game.turnState.playedCards.length === 0) return;

    setGame(prev => {
      if (!prev) return prev;

      const lastPlayed = prev.turnState.playedCards[prev.turnState.playedCards.length - 1];
      const { card, slotId } = lastPlayed;

      // Return card to player's hand
      const playerIndex = prev.currentPlayerIndex;
      const newPlayers = [...prev.players];
      newPlayers[playerIndex] = {
        ...newPlayers[playerIndex],
        hand: [...newPlayers[playerIndex].hand, card],
      };

      // Remove card from slot
      let newSlots = prev.tableSlots.map(s => {
        if (s.id === slotId) {
          const newCards = [...s.cards];
          newCards.pop();
          return { ...s, cards: newCards };
        }
        return s;
      });

      // Remove empty slots (except starting pattern)
      if (newSlots.length > prev.startingPattern.length) {
        newSlots = newSlots.filter(s => s.cards.length > 0 || s.position < prev.startingPattern.length);
      }

      // Remove color from played colors
      const newColorsPlayed = new Set(prev.turnState.colorsPlayedThisTurn);
      newColorsPlayed.delete(card.color);

      return {
        ...prev,
        players: newPlayers,
        tableSlots: newSlots,
        turnState: {
          ...prev.turnState,
          playedCards: prev.turnState.playedCards.slice(0, -1),
          colorsPlayedThisTurn: newColorsPlayed,
        },
      };
    });
  }, [game]);

  // Reset game
  const resetGame = useCallback(() => {
    setGame(null);
  }, []);

  // Update settings
  const updateSettings = useCallback((newSettings: Partial<GameSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  return {
    // State
    game,
    settings,
    currentPlayer,
    activePlayers,
    currentSentence,

    // Actions
    startGame,
    playCard,
    createSlot,
    submitTurn,
    vote,
    passTurn,
    confirmTurnEnd,
    undoLastCard,
    resetGame,
    updateSettings,
  };
}
