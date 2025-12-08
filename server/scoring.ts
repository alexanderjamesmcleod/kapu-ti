/**
 * Scoring module for Kapu Ti multiplayer game
 * Calculates points for completed turns with topic bonuses
 */

import type { Card } from '../src/types';

export interface ScoreResult {
  basePoints: number;      // 10 for successful turn
  wordPoints: number;      // 2 per word in sentence
  topicBonus: boolean;     // Whether topic bonus applies
  topicMultiplier: number; // 2x if topic matches, 1x otherwise
  totalPoints: number;     // Final calculated score
  breakdown: string;       // Human-readable breakdown
}

export interface TurnData {
  playedCards: Array<{ id: string; topics?: string[] }>;
  currentTopic: string;   // e.g., 'kai', 'places'
  allVotesApproved: boolean;
  isFirstToEmpty: boolean;
  isLongestSentence: boolean;
}

/**
 * Check if any played card matches the current topic
 * @param cards - Array of cards with optional topics array
 * @param topic - Current topic to match against
 * @returns true if any card has the topic in its topics array
 */
export function hasTopicMatch(
  cards: Array<{ topics?: string[] }>,
  topic: string
): boolean {
  return cards.some(card => card.topics?.includes(topic));
}

/**
 * Calculate score for a completed turn
 * @param turnData - Data about the turn including cards played and votes
 * @returns Detailed score breakdown
 */
export function calculateTurnScore(turnData: TurnData): ScoreResult {
  const basePoints = 10; // Successful turn

  // Count words in the sentence (estimated by number of cards played)
  const wordCount = turnData.playedCards.length;
  const wordPoints = wordCount * 2;

  // Check if topic bonus applies
  const topicBonus = hasTopicMatch(turnData.playedCards, turnData.currentTopic);
  const topicMultiplier = topicBonus ? 2 : 1;

  // Calculate points before bonuses
  const pointsBeforeBonus = basePoints + wordPoints;
  const pointsAfterTopicMultiplier = pointsBeforeBonus * topicMultiplier;

  // Add additional bonuses (additive, after multiplier)
  let additionalBonus = 0;
  const bonusBreakdown: string[] = [];

  if (turnData.isFirstToEmpty) {
    additionalBonus += 20;
    bonusBreakdown.push('+20 (first to empty)');
  }

  if (turnData.isLongestSentence) {
    additionalBonus += 10;
    bonusBreakdown.push('+10 (longest sentence)');
  }

  if (turnData.allVotesApproved) {
    additionalBonus += 5;
    bonusBreakdown.push('+5 (perfect approval)');
  }

  const totalPoints = pointsAfterTopicMultiplier + additionalBonus;

  // Build human-readable breakdown
  let breakdown = `${basePoints} base + ${wordPoints} words`;

  if (topicBonus) {
    breakdown += ` = ${pointsBeforeBonus} × 2 (topic)`;
  } else {
    breakdown += ` = ${pointsBeforeBonus}`;
  }

  if (bonusBreakdown.length > 0) {
    breakdown += ` + ${bonusBreakdown.join(' + ')}`;
  }

  breakdown += ` = ${totalPoints}`;

  return {
    basePoints,
    wordPoints,
    topicBonus,
    topicMultiplier,
    totalPoints,
    breakdown,
  };
}
