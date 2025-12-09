/**
 * Scoring logic for Kapu Ti
 * Pure functions with no side effects - easy to test
 *
 * SCORING RULES:
 * - All players who contributed cards to the sentence get 10pts per card
 * - Completion bonus: 25pts for player who completes and speaks the sentence
 * - Streak bonus: +10pts per consecutive sentence completion (caps at 50pts bonus)
 */

import type { Card } from '../src/types';
import type { GameTopic, TableSlot, Player } from '../src/types/multiplayer.types';

// Scoring constants
const POINTS_PER_CARD = 10;
const COMPLETION_BONUS = 25;
const STREAK_BONUS_PER_LEVEL = 10;
const MAX_STREAK_BONUS = 50;

/**
 * Calculate points per player for all cards on the table
 * Returns a map of playerId -> points earned
 */
export function calculateRoundScores(
  slots: TableSlot[]
): Map<string, number> {
  const scores = new Map<string, number>();

  for (const slot of slots) {
    // Only count the top card (the one that's actually in the sentence)
    if (slot.cards.length > 0 && slot.cardOwners && slot.cardOwners.length > 0) {
      const topCardOwner = slot.cardOwners[slot.cardOwners.length - 1];
      if (topCardOwner) {
        const currentScore = scores.get(topCardOwner) || 0;
        scores.set(topCardOwner, currentScore + POINTS_PER_CARD);
      }
    }
  }

  return scores;
}

/**
 * Calculate completion bonus based on player's streak
 */
export function calculateCompletionBonus(streakCount: number): number {
  const streakBonus = Math.min(streakCount * STREAK_BONUS_PER_LEVEL, MAX_STREAK_BONUS);
  return COMPLETION_BONUS + streakBonus;
}

/**
 * Apply round scores to all players
 * - All contributors get points for their cards
 * - Completer gets completion bonus + streak bonus
 * - Completer's streak increments, others reset to 0
 */
export function applyRoundScores(
  players: Player[],
  slots: TableSlot[],
  completerId: string
): Player[] {
  const cardScores = calculateRoundScores(slots);

  return players.map(player => {
    let newScore = player.score;
    let newStreak = player.sentenceStreak ?? 0;

    // Add card contribution points
    const cardPoints = cardScores.get(player.id) || 0;
    newScore += cardPoints;

    // Handle completer
    if (player.id === completerId) {
      // Increment streak BEFORE calculating bonus
      newStreak += 1;
      // Add completion bonus with streak
      newScore += calculateCompletionBonus(newStreak);
    } else {
      // Reset streak for non-completers
      newStreak = 0;
    }

    return {
      ...player,
      score: newScore,
      sentenceStreak: newStreak,
    };
  });
}

/**
 * Legacy function - kept for backward compatibility
 * Calculate score for a turn based on cards played
 */
export function calculateTurnScore(
  playedCards: { card: Card; slotId: string; playerId?: string }[],
  topic?: GameTopic
): number {
  if (playedCards.length === 0) {
    return 0;
  }

  // Base score: 10 points per card
  return playedCards.length * POINTS_PER_CARD;
}

/**
 * Calculate bonus for sentence length
 * Longer sentences = more points
 *
 * @param slots - Table slots with cards
 * @returns Bonus points for sentence length
 */
export function calculateSentenceLengthBonus(slots: TableSlot[]): number {
  const nonEmptySlots = slots.filter(s => s.cards.length > 0);

  // No bonus for short sentences
  if (nonEmptySlots.length < 3) {
    return 0;
  }

  // +5 for each word beyond the first 2
  return (nonEmptySlots.length - 2) * 5;
}

/**
 * Calculate total score for a successful turn
 * Combines card points, topic bonus, and sentence length bonus
 */
export function calculateFullTurnScore(
  playedCards: { card: Card; slotId: string }[],
  slots: TableSlot[],
  topic?: GameTopic
): { total: number; breakdown: { cards: number; topicBonus: number; lengthBonus: number } } {
  const cardScore = calculateTurnScore(playedCards, topic);
  const lengthBonus = calculateSentenceLengthBonus(slots);

  return {
    total: cardScore + lengthBonus,
    breakdown: {
      cards: cardScore,
      topicBonus: 0, // Topic bonus removed in new scoring
      lengthBonus,
    },
  };
}
