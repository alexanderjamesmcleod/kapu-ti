// Ko Sentence Validator
// Validates Ko + te/ngā + noun pattern
// Module 1 - Foundations
// Ported from v3: te-reo-card-game/src/game/validators/koValidator.js

import { Card, Challenge, ValidationResult } from '../types/validation.types';

/**
 * Validates a Ko sentence structure
 * Pattern: Ko + te/ngā + noun (Lesson 1.1)
 * Pattern: Ko + te/ngā + noun + demonstrative (Lesson 1.2)
 *
 * @param cards - Array of card objects in order
 * @param challenge - Optional challenge object with target sentence
 * @returns Validation result with feedback
 */
export function validateKoSentence(
  cards: Card[],
  challenge: Challenge | null = null
): ValidationResult {
  const result: ValidationResult = {
    valid: false,
    correct: false,
    feedback: {
      type: 'error',
      message: '',
      hint: '',
      explanation: ''
    },
    translation: '',
    breakdown: []
  };

  // Check we have 3 or 4 cards (3 for basic Ko, 4 for Ko + demonstrative)
  if (cards.length !== 3 && cards.length !== 4) {
    result.feedback.message = 'Need exactly 3 or 4 cards for Ko sentences';
    result.feedback.hint = 'Pattern: Ko + te/ngā + noun (+ optional demonstrative)';
    return result;
  }

  const [card1, card2, card3, card4] = cards;

  // Check first card is Ko
  if (card1.maori !== 'Ko') {
    result.feedback.message = 'First card must be Ko';
    result.feedback.hint = 'Ko comes first - it introduces the specific thing';
    result.feedback.explanation = 'Ko is the definite particle that starts these sentences';
    return result;
  }

  // Check second card is article (te or ngā)
  if (!['te', 'ngā'].includes(card2.maori)) {
    result.feedback.message = 'Second card must be te or ngā';
    result.feedback.hint = 'Use te for singular, ngā for plural';
    result.feedback.explanation = 'Articles come after Ko to specify if the noun is singular or plural';
    return result;
  }

  // Check third card is noun
  if (card3.type !== 'noun') {
    result.feedback.message = 'Third card must be a noun';
    result.feedback.hint = 'A noun is a thing (whare, ngeru, tangata, etc.)';
    result.feedback.explanation = 'The sentence needs to end with what thing you are identifying';
    return result;
  }

  // If 4 cards, check fourth is demonstrative
  if (cards.length === 4 && card4) {
    if (card4.type !== 'demonstrative') {
      result.feedback.message = 'Fourth card must be a demonstrative (tēnei, tēnā, tērā)';
      result.feedback.hint = 'Demonstratives point out WHERE the thing is';
      result.feedback.explanation = 'Use tēnei (this/near me), tēnā (that/near you), or tērā (that/over there)';
      return result;
    }
  }

  // Sentence is grammatically valid!
  result.valid = true;

  // Generate translation
  const article = card2.maori === 'te' ? 'the' : 'the';
  const pluralNote = card2.maori === 'ngā' ? ' (plural)' : '';
  
  // Add demonstrative to translation if present
  let demonstrativeTranslation = '';
  if (cards.length === 4 && card4) {
    const distanceMap: Record<string, string> = {
      'tēnei': ' (this/near me)',
      'tēnā': ' (that/near you)',
      'tērā': ' (that/over there)'
    };
    demonstrativeTranslation = distanceMap[card4.maori] || '';
  }
  
  result.translation = cards.length === 3 
    ? `The ${card3.english}${pluralNote}`
    : `${card4?.english === 'this (near me)' ? 'This' : 'That'} is the ${card3.english}${demonstrativeTranslation}`;

  // Generate breakdown
  result.breakdown = [
    {
      word: 'Ko',
      role: 'definite particle',
      meaning: 'introduces specific thing'
    },
    {
      word: card2.maori,
      role: 'article',
      meaning: card2.maori === 'te' ? 'the (singular)' : 'the (plural)'
    },
    {
      word: card3.maori,
      role: 'noun',
      meaning: card3.english
    }
  ];

  // Add demonstrative to breakdown if present
  if (cards.length === 4 && card4) {
    result.breakdown.push({
      word: card4.maori,
      role: 'demonstrative',
      meaning: card4.english
    });
  }

  // Check if matches target (if specific challenge)
  if (challenge?.target) {
    const targetWords = challenge.target.maori.split(' ');
    const builtWords = cards.map(c => c.maori);

    result.correct = targetWords.every((word, i) => word === builtWords[i]);

    if (result.correct) {
      result.feedback = {
        type: 'success',
        message: '✅ Perfect!',
        explanation: `"${challenge.target.maori}" means "${challenge.target.english}"`,
        naturalness: 'natural'
      };
    } else {
      result.feedback = {
        type: 'warning',
        message: '✅ Grammatically correct, but not the target sentence',
        explanation: `You built: "${cards.map(c => c.maori).join(' ')}" which means "${result.translation}"`,
        hint: `The challenge asked for: "${challenge.target.maori}"`
      };
    }
  } else {
    // Free build - any valid sentence accepted
    result.correct = true;
    result.feedback = {
      type: 'success',
      message: '✅ Excellent sentence!',
      explanation: `"${cards.map(c => c.maori).join(' ')}" means "${result.translation}"`,
      naturalness: 'natural'
    };
  }

  return result;
}

/**
 * Helper to check if a sentence uses Ko pattern
 * @param cards - Array of card objects
 * @returns boolean indicating if Ko pattern
 */
export function isKoPattern(cards: Card[]): boolean {
  return cards.length > 0 && cards[0].maori === 'Ko';
}

/**
 * Get helpful hints based on common mistakes
 * @param cards - Current card arrangement
 * @returns Hint string or null
 */
export function getKoHint(cards: Card[]): string | null {
  if (cards.length === 0) {
    return 'Start with Ko to introduce a specific thing';
  }

  if (cards.length === 1 && cards[0].maori === 'Ko') {
    return 'Good! Now add te (singular) or ngā (plural)';
  }

  if (cards.length === 2 && cards[0].maori === 'Ko') {
    if (['te', 'ngā'].includes(cards[1].maori)) {
      return 'Perfect! Now add a noun (thing)';
    } else {
      return 'After Ko, you need te or ngā';
    }
  }

  if (cards.length === 3) {
    const validation = validateKoSentence(cards);
    if (validation.valid) {
      return '✅ Your sentence is complete! (Optional: add a demonstrative)';
    }
  }

  if (cards.length >= 4) {
    const validation = validateKoSentence(cards);
    if (validation.valid) {
      return '✅ Perfect sentence with demonstrative!';
    } else {
      return 'Check the fourth card - should be tēnei, tēnā, or tērā';
    }
  }

  return null;
}
