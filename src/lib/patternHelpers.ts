/**
 * Pattern Helper Functions for Kapu Tī
 *
 * Utilities for working with sentence patterns, including:
 * - Pattern selection based on topic/difficulty
 * - Pattern instance generation with target words
 * - Validation of player card placement
 */

import {
  SentencePattern,
  PatternInstance,
  PatternSlotInstance,
} from '../types/sentencePattern.types';
import { Card } from '../types/validation.types';
import { Word } from '../data/wordLibrary';
import { SLOT_PATTERNS } from '../data/sentencePatterns';

// Type alias for vocabulary compatibility
export type VocabularyWord = Word;

/**
 * Get all patterns for a specific topic
 * @param topicId - The topic ID to filter by
 * @returns Array of patterns that include this topic
 */
export function getPatternsForTopic(topicId: string): SentencePattern[] {
  return SLOT_PATTERNS.filter(pattern =>
    pattern.topicIds.includes(topicId)
  );
}

/**
 * Get a random pattern for a topic, optionally filtered by difficulty
 * @param topicId - The topic ID to select from
 * @param difficulty - Optional difficulty filter ('beginner', 'intermediate', 'advanced')
 * @returns A random pattern matching the criteria
 * @throws Error if no patterns match the criteria
 */
export function getRandomPattern(
  topicId: string,
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
): SentencePattern {
  let patterns = getPatternsForTopic(topicId);

  // Filter by difficulty if specified
  if (difficulty) {
    patterns = patterns.filter(p => p.difficulty === difficulty);
  }

  if (patterns.length === 0) {
    throw new Error(
      `No patterns found for topic "${topicId}"${difficulty ? ` with difficulty "${difficulty}"` : ''}`
    );
  }

  // Select random pattern
  const randomIndex = Math.floor(Math.random() * patterns.length);
  return patterns[randomIndex];
}

/**
 * Generate a pattern instance with target words from vocabulary
 * This creates a specific "fill in the blanks" challenge for players
 *
 * @param pattern - The sentence pattern to instantiate
 * @param vocabulary - Array of available vocabulary words
 * @returns A pattern instance with target words assigned
 */
export function generatePatternInstance(
  pattern: SentencePattern,
  vocabulary: VocabularyWord[]
): PatternInstance {
  // Create slot instances with target words
  const slots: PatternSlotInstance[] = pattern.slots.map(slot => {
    // Find words matching this slot's type
    const matchingWords = vocabulary.filter(
      word => word.type === slot.wordType || word.color === slot.color
    );

    // Select a random word if available
    let targetWord: string | undefined;
    let targetCardId: string | undefined;

    if (matchingWords.length > 0) {
      const randomWord = matchingWords[Math.floor(Math.random() * matchingWords.length)];
      targetWord = randomWord.maori;
      targetCardId = randomWord.id;
    }

    return {
      ...slot,
      targetWord,
      targetCardId,
    };
  });

  // Build the target sentence by replacing blanks with target words
  let targetSentence = pattern.maoriTemplate;
  let targetTranslation = pattern.englishTemplate;

  slots.forEach((slot, index) => {
    if (slot.targetWord) {
      // Replace first blank with target word
      targetSentence = targetSentence.replace('___', slot.targetWord);
      targetTranslation = targetTranslation.replace('___', slot.targetWord);
    }
  });

  return {
    patternId: pattern.id,
    pattern,
    targetSentence,
    targetTranslation,
    slots,
  };
}

/**
 * Validate that placed cards match the pattern instance
 * Checks both slot count and card correctness
 *
 * @param instance - The pattern instance with target answers
 * @param placedCards - Array of cards the player has placed
 * @returns Validation result with completion status and score
 */
export function validatePatternCompletion(
  instance: PatternInstance,
  placedCards: Card[]
): {
  complete: boolean;
  correctCount: number;
  totalSlots: number;
} {
  const totalSlots = instance.slots.length;
  let correctCount = 0;

  // Check each slot
  instance.slots.forEach((slot, index) => {
    const placedCard = placedCards[index];

    if (!placedCard) {
      return; // Slot not filled
    }

    // Check if card matches slot requirements
    const colorMatches = placedCard.color === slot.color;
    const typeMatches = placedCard.type === slot.wordType;
    const isTargetCard = slot.targetCardId
      ? placedCard.id === slot.targetCardId
      : false;

    // Card is correct if it matches color/type OR is the exact target card
    if ((colorMatches && typeMatches) || isTargetCard) {
      correctCount++;
    }
  });

  // Pattern is complete if all required slots are filled correctly
  const requiredSlots = instance.slots.filter(s => s.required).length;
  const complete = correctCount >= requiredSlots;

  return {
    complete,
    correctCount,
    totalSlots,
  };
}

/**
 * Get all patterns matching a difficulty level
 * @param difficulty - The difficulty level to filter by
 * @returns Array of patterns at this difficulty
 */
export function getPatternsByDifficulty(
  difficulty: 'beginner' | 'intermediate' | 'advanced'
): SentencePattern[] {
  return SLOT_PATTERNS.filter(p => p.difficulty === difficulty);
}

/**
 * Get a pattern by its ID
 * @param patternId - The pattern ID to look up
 * @returns The pattern, or undefined if not found
 */
export function getPatternById(patternId: string): SentencePattern | undefined {
  return SLOT_PATTERNS.find(p => p.id === patternId);
}

/**
 * Calculate similarity score between two sentences (for fuzzy matching)
 * Simple Levenshtein-like scoring for validating player sentences
 *
 * @param sentence1 - First sentence
 * @param sentence2 - Second sentence
 * @returns Similarity score from 0 (no match) to 1 (perfect match)
 */
export function calculateSentenceSimilarity(
  sentence1: string,
  sentence2: string
): number {
  const s1 = sentence1.toLowerCase().trim();
  const s2 = sentence2.toLowerCase().trim();

  if (s1 === s2) return 1.0;

  const words1 = s1.split(/\s+/);
  const words2 = s2.split(/\s+/);

  // Calculate word overlap
  const matches = words1.filter(word => words2.includes(word)).length;
  const total = Math.max(words1.length, words2.length);

  return matches / total;
}
