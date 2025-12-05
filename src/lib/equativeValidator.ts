// Equative Sentence Validator
// Validates Ko + pronoun + te/ngā + noun pattern
// Module 1 - Lesson 1.3: Equative Sentences
// Ported from v3: te-reo-card-game/src/game/validators/equativeValidator.js

import { Card, Challenge, ValidationResult } from '../types/validation.types';

/**
 * Validates an equative sentence structure
 * Pattern: Ko + pronoun + te/ngā + noun (e.g., "Ko au te kaiako" = I am the teacher)
 *
 * @param cards - Array of card objects in order
 * @param challenge - Optional challenge object with target sentence
 * @returns Validation result with feedback
 */
export function validateEquativeSentence(
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

  // Check we have exactly 4 cards
  if (cards.length !== 4) {
    result.feedback.message = 'Equative sentences need exactly 4 cards';
    result.feedback.hint = 'Pattern: Ko + pronoun + te/ngā + noun';
    return result;
  }

  const [card1, card2, card3, card4] = cards;

  // Check first card is Ko
  if (card1.maori !== 'Ko') {
    result.feedback.message = 'First card must be Ko';
    result.feedback.hint = 'Ko introduces WHO someone is';
    result.feedback.explanation = 'Equative sentences start with Ko to identify a specific person';
    return result;
  }

  // Check second card is pronoun
  if (card2.type !== 'pronoun') {
    result.feedback.message = 'Second card must be a pronoun (au, koe, ia)';
    result.feedback.hint = 'Pattern: Ko + PRONOUN + te/ngā + noun';
    result.feedback.explanation = 'The pronoun tells us WHO we\'re talking about';
    return result;
  }

  // Check third card is article (te or ngā)
  if (!['te', 'ngā'].includes(card3.maori)) {
    result.feedback.message = 'Third card must be te or ngā';
    result.feedback.hint = 'Ko + pronoun + ARTICLE + noun';
    result.feedback.explanation = 'You need an article (te/ngā) before the noun';
    return result;
  }

  // Check fourth card is noun
  if (card4.type !== 'noun') {
    result.feedback.message = 'Fourth card must be a noun';
    result.feedback.hint = 'The noun tells us WHAT the person is';
    result.feedback.explanation = 'Equative sentences identify WHO someone is: Ko + pronoun + te/ngā + NOUN';
    return result;
  }

  // Sentence is grammatically valid!
  result.valid = true;

  // Generate translation
  const pronounMap: Record<string, { subject: string; verb: string; meaning: string }> = {
    'au': { subject: 'I', verb: 'am', meaning: 'I' },
    'koe': { subject: 'You', verb: 'are', meaning: 'you' },
    'ia': { subject: 'He/She', verb: 'is', meaning: 'he/she' },
    'tāua': { subject: 'We two (you and I)', verb: 'are', meaning: 'we two (you and I)' },
    'māua': { subject: 'We two (not you)', verb: 'are', meaning: 'we two (not you)' },
    'tātou': { subject: 'We all', verb: 'are', meaning: 'we all' },
    'mātou': { subject: 'We (not you)', verb: 'are', meaning: 'we (not you)' },
    'kōrua': { subject: 'You two', verb: 'are', meaning: 'you two' },
    'rāua': { subject: 'They two', verb: 'are', meaning: 'they two' },
    'koutou': { subject: 'You (plural)', verb: 'are', meaning: 'you (plural)' },
    'rātou': { subject: 'They (plural)', verb: 'are', meaning: 'they (plural)' }
  };

  const pronounInfo = pronounMap[card2.maori] || { subject: card2.english, verb: 'is', meaning: card2.english };
  const article = 'the';
  const nounEng = card4.english;
  
  // Handle plural nouns
  const finalNoun = card3.maori === 'ngā' 
    ? (nounEng === 'person' ? 'people' : nounEng + 's')
    : nounEng;
  
  result.translation = `${pronounInfo.subject} ${pronounInfo.verb} ${article} ${finalNoun}`;

  // Generate breakdown
  result.breakdown = [
    {
      word: 'Ko',
      role: 'particle',
      meaning: 'introduces specific person/identity'
    },
    {
      word: card2.maori,
      role: 'pronoun',
      meaning: pronounInfo.meaning
    },
    {
      word: card3.maori,
      role: 'article',
      meaning: card3.maori === 'te' ? 'the (singular)' : 'the (plural)'
    },
    {
      word: card4.maori,
      role: 'noun',
      meaning: card4.english
    }
  ];

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
      message: '✅ Excellent equative sentence!',
      explanation: `"${cards.map(c => c.maori).join(' ')}" means "${result.translation}"`,
      naturalness: 'natural'
    };
  }

  return result;
}

/**
 * Helper to check if a sentence uses equative pattern
 * @param cards - Array of card objects
 * @returns boolean indicating if equative pattern
 */
export function isEquativePattern(cards: Card[]): boolean {
  return cards.length >= 2 && 
         cards[0].maori === 'Ko' && 
         cards[1].type === 'pronoun';
}

/**
 * Get helpful hints based on common mistakes
 * @param cards - Current card arrangement
 * @returns Hint string or null
 */
export function getEquativeHint(cards: Card[]): string | null {
  if (cards.length === 0) {
    return 'Start with Ko to introduce WHO someone is';
  }

  if (cards.length === 1 && cards[0].maori === 'Ko') {
    return 'Good! Now add a pronoun (au, koe, ia)';
  }

  if (cards.length === 2 && cards[0].maori === 'Ko') {
    if (cards[1].type === 'pronoun') {
      return 'Perfect! Now add te or ngā';
    } else {
      return 'After Ko, you need a pronoun (au, koe, or ia)';
    }
  }

  if (cards.length === 3 && cards[0].maori === 'Ko' && cards[1].type === 'pronoun') {
    if (['te', 'ngā'].includes(cards[2].maori)) {
      return 'Almost there! Now add a noun to complete the sentence';
    } else {
      return 'After the pronoun, you need te or ngā';
    }
  }

  if (cards.length === 4) {
    const validation = validateEquativeSentence(cards);
    if (validation.valid) {
      return '✅ Perfect equative sentence!';
    } else {
      return 'Check the pattern: Ko + pronoun + te/ngā + noun';
    }
  }

  return null;
}
