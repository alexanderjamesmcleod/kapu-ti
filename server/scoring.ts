/**
 * Scoring logic for Kapu Ti
 * Pure functions with no side effects - easy to test
 */

import type { Card } from '../src/types';
import type { GameTopic, TableSlot } from '../src/types/multiplayer.types';

// Scoring constants
const POINTS_PER_CARD = 10;
const TOPIC_BONUS = 5;

/**
 * Calculate score for a turn based on cards played
 *
 * @param playedCards - Cards played this turn (from turnState.playedCards)
 * @param topic - Current game topic (optional)
 * @returns Total points earned
 */
export function calculateTurnScore(
  playedCards: { card: Card; slotId: string }[],
  topic?: GameTopic
): number {
  if (playedCards.length === 0) {
    return 0;
  }

  // Base score: 10 points per card
  let score = playedCards.length * POINTS_PER_CARD;

  // Topic bonus: +5 per card that matches the topic
  if (topic) {
    const topicBonusCards = playedCards.filter(({ card }) =>
      cardMatchesTopic(card, topic)
    );
    score += topicBonusCards.length * TOPIC_BONUS;
  }

  return score;
}

/**
 * Check if a card matches the current topic
 * Cards can have a 'topics' array in their data
 */
function cardMatchesTopic(card: Card, topic: GameTopic): boolean {
  // Cards may have a topics array (optional field)
  const cardTopics = (card as any).topics;
  if (!cardTopics || !Array.isArray(cardTopics)) {
    return false;
  }

  // Check if card's topics include the current topic ID
  return cardTopics.includes(topic.id);
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

  // Separate out topic bonus for breakdown
  const baseCardScore = playedCards.length * POINTS_PER_CARD;
  const topicBonus = cardScore - baseCardScore;

  return {
    total: cardScore + lengthBonus,
    breakdown: {
      cards: baseCardScore,
      topicBonus,
      lengthBonus,
    },
  };
}
