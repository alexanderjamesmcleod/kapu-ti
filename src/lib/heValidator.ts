// He Sentence Validator
// Validates He classification sentences
// Module 1 - Lesson 1.4: He Sentences (Classification)
// Ported from v3: te-reo-card-game/src/game/validators/heValidator.js

import { Card, Challenge, ValidationResult } from '../types/validation.types';

/**
 * Validates a He classification sentence structure
 * Pattern: He + noun (2 cards) OR He + noun + subject (3 cards)
 * He is used for CLASSIFICATION (what kind of thing) not IDENTIFICATION (which specific thing)
 *
 * @param cards - Array of card objects in order
 * @param challenge - Optional challenge object with target sentence
 * @returns Validation result with feedback
 */
export function validateHeSentence(
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

  // Check we have 2 or 3 cards (2 for indefinite phrase, 3 for classification sentence)
  if (cards.length !== 2 && cards.length !== 3) {
    result.feedback.message = 'He sentences need exactly 2 or 3 cards';
    result.feedback.hint = 'Pattern: He + noun (indefinite) OR He + noun + subject (classification)';
    return result;
  }

  const [card1, card2, card3] = cards;

  // Check first card is He
  if (card1.maori !== 'He') {
    result.feedback.message = 'First card must be He';
    result.feedback.hint = 'He classifies things into categories (a/an, not the)';
    result.feedback.explanation = 'He is used for classification - it says what KIND of thing something is';
    return result;
  }

  // CRITICAL: Check that there's NO article (te/ngā) after He
  // This is a common mistake - students confuse He and Ko patterns
  if (card2.type === 'article' || ['te', 'ngā'].includes(card2.maori)) {
    result.feedback.message = '❌ He sentences do NOT use te or ngā';
    result.feedback.hint = 'He pattern: He + noun (NO article!)';
    result.feedback.explanation = 'This is the KEY difference: Ko uses articles (Ko te...), but He does NOT (He kaiako...). He classifies, Ko identifies.';
    return result;
  }

  // Check second card is noun
  if (card2.type !== 'noun') {
    result.feedback.message = 'Second card must be a noun';
    result.feedback.hint = 'He + NOUN = a/an (category)';
    result.feedback.explanation = 'After He, you need a noun that represents the category';
    return result;
  }

  // If 3 cards, check third is pronoun OR demonstrative
  if (cards.length === 3 && card3) {
    if (card3.type !== 'pronoun' && card3.type !== 'demonstrative') {
      result.feedback.message = 'Third card must be a pronoun or demonstrative';
      result.feedback.hint = 'He + noun + WHO/WHAT (au, koe, ia, tēnei, etc.)';
      result.feedback.explanation = 'The subject tells us WHO or WHAT belongs to this category';
      return result;
    }
  }

  // Sentence is grammatically valid!
  result.valid = true;

  // Generate translation
  if (cards.length === 2) {
    // Indefinite phrase: "He kaiako" = "A teacher" or "Some teachers"
    result.translation = `A ${card2.english}`;

    result.breakdown = [
      {
        word: 'He',
        role: 'classifier',
        meaning: 'indicates classification/category (a/an/some)'
      },
      {
        word: card2.maori,
        role: 'noun',
        meaning: card2.english
      }
    ];
  } else if (card3) {
    // Classification sentence: "He kaiako au" = "I am a teacher"
    const subjectMap: Record<string, { subject: string; verb: string }> = {
      'au': { subject: 'I', verb: 'am' },
      'koe': { subject: 'You', verb: 'are' },
      'ia': { subject: 'He/She', verb: 'is' },
      'tāua': { subject: 'We two (you and I)', verb: 'are' },
      'māua': { subject: 'We two (not you)', verb: 'are' },
      'tātou': { subject: 'We all', verb: 'are' },
      'mātou': { subject: 'We (not you)', verb: 'are' },
      'kōrua': { subject: 'You two', verb: 'are' },
      'rāua': { subject: 'They two', verb: 'are' },
      'koutou': { subject: 'You (plural)', verb: 'are' },
      'rātou': { subject: 'They (plural)', verb: 'are' },
      // Demonstratives
      'tēnei': { subject: 'This', verb: 'is' },
      'tēnā': { subject: 'That (near you)', verb: 'is' },
      'tērā': { subject: 'That (over there)', verb: 'is' },
      'ēnei': { subject: 'These', verb: 'are' },
      'ēnā': { subject: 'Those (near you)', verb: 'are' },
      'ērā': { subject: 'Those (over there)', verb: 'are' }
    };

    const subjectInfo = subjectMap[card3.maori] || {
      subject: card3.english,
      verb: card3.type === 'demonstrative' ? 'is' : 'is'
    };

    result.translation = `${subjectInfo.subject} ${subjectInfo.verb} a ${card2.english}`;

    result.breakdown = [
      {
        word: 'He',
        role: 'classifier',
        meaning: 'indicates classification (a/an - not THE)'
      },
      {
        word: card2.maori,
        role: 'noun/category',
        meaning: card2.english
      },
      {
        word: card3.maori,
        role: card3.type,
        meaning: card3.english
      }
    ];
  }

  // Check if matches target (if specific challenge)
  if (challenge?.target) {
    const builtWords = cards.map(c => c.maori);
    const targetWords = challenge.target.maori.split(' ');

    result.correct = targetWords.every((word, i) => word === builtWords[i]);

    if (result.correct) {
      result.feedback = {
        type: 'success',
        message: '✅ Perfect!',
        explanation: `"${challenge.target.maori}" means "${challenge.target.english}"`,
        hint: 'Remember: He = classification (a teacher), Ko = identification (THE teacher)',
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
      message: '✅ Excellent He sentence!',
      explanation: `"${cards.map(c => c.maori).join(' ')}" means "${result.translation}"`,
      hint: 'He is for CLASSIFICATION (what kind) - different from Ko (which specific thing)',
      naturalness: 'natural'
    };
  }

  return result;
}

/**
 * Helper to check if a sentence uses He pattern
 * @param cards - Array of card objects
 * @returns boolean indicating if He pattern
 */
export function isHePattern(cards: Card[]): boolean {
  return cards.length > 0 && cards[0].maori === 'He';
}

/**
 * Get helpful hints based on common mistakes
 * @param cards - Current card arrangement
 * @returns Hint string or null
 */
export function getHeHint(cards: Card[]): string | null {
  if (cards.length === 0) {
    return 'Start with He to classify what KIND of thing something is';
  }

  if (cards.length === 1 && cards[0].maori === 'He') {
    return 'Good! Now add a noun (the category)';
  }

  if (cards.length === 2 && cards[0].maori === 'He') {
    if (cards[1].type === 'noun') {
      return '✅ Complete 2-card sentence! (Optional: add subject for 3-card sentence)';
    } else if (['te', 'ngā'].includes(cards[1].maori)) {
      return '❌ He does NOT use articles! Use: He + noun (not He + te + noun)';
    } else {
      return 'After He, you need a noun (category)';
    }
  }

  if (cards.length === 3) {
    const validation = validateHeSentence(cards);
    if (validation.valid) {
      return '✅ Perfect He classification sentence!';
    } else {
      return 'Check the pattern: He + noun + subject (no articles!)';
    }
  }

  if (cards.length > 3) {
    return 'He sentences only need 2-3 cards';
  }

  return null;
}
