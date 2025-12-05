// Kei te Present Tense Validator
// Validates Kei te present continuous sentences
// Module 2: Kei te (Present Tense)
// Ported from v3: te-reo-card-game/src/game/validators/keiTeValidator.js

import { Card, Challenge, ValidationResult } from '../types/validation.types';

/**
 * Convert verb to continuous form (adding -ing)
 * Handles special cases like verbs with slashes, ending in e, etc.
 */
function makeVerbContinuous(verbEnglish: string): string {
  // Handle slashes - take the first option
  let verb = verbEnglish;
  if (verb.includes('/')) {
    verb = verb.split('/')[0];
  }

  // Handle ending in 'e'
  if (verb.endsWith('e')) {
    return verb.slice(0, -1) + 'ing';
  }

  // Handle doubling consonants for CVC pattern (run → running)
  const cvcPattern = /^[^aeiou]*[aeiou][^aeiou]$/;
  if (cvcPattern.test(verb)) {
    return verb + verb.slice(-1) + 'ing';
  }

  // Default: just add ing
  return verb + 'ing';
}

/**
 * Check if sentence matches challenge target
 */
function checkTarget(cards: Card[], challenge: Challenge | null, result: ValidationResult): ValidationResult {
  if (challenge?.target) {
    const builtSentence = cards.map(c => c.maori).join(' ');
    const targetSentence = challenge.target.maori;

    result.correct = builtSentence === targetSentence;

    if (result.correct) {
      result.feedback = {
        type: 'success',
        message: '✅ Perfect!',
        explanation: `"${challenge.target.maori}" means "${challenge.target.english}"`,
        hint: 'Remember: Kei te = present continuous (happening right now!)',
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
      message: '✅ Excellent Kei te sentence!',
      explanation: `"${cards.map(c => c.maori).join(' ')}" means "${result.translation}"`,
      hint: 'Kei te indicates present continuous - actions happening RIGHT NOW!',
      naturalness: 'natural'
    };
  }

  return result;
}

/**
 * Validate 3-card Kei te sentences
 * Pattern: Kei te + adjective/verb + pronoun
 * Examples: "Kei te pai au", "Kei te haere ia"
 */
function validate3CardKeiTe(cards: Card[], challenge: Challenge | null, result: ValidationResult): ValidationResult {
  const [card1, card2, card3] = cards;

  // Card 2 must be adjective or verb
  if (card2.type !== 'adjective' && card2.type !== 'verb') {
    result.feedback.message = 'Second card must be an adjective or verb';
    result.feedback.hint = 'Kei te + [adjective/verb] + pronoun';
    result.feedback.explanation = 'Adjectives describe states (pai, harikoa), verbs describe actions (haere, kai)';
    return result;
  }

  // Card 3 must be pronoun
  if (card3.type !== 'pronoun') {
    result.feedback.message = 'Third card must be a pronoun';
    result.feedback.hint = 'Kei te + adjective/verb + WHO (au, koe, ia, etc.)';
    result.feedback.explanation = 'The pronoun tells us WHO is experiencing this state or doing this action';
    return result;
  }

  // Valid sentence!
  result.valid = true;

  // Generate translation
  const subjectMap: Record<string, { subject: string; verb: string }> = {
    'au': { subject: 'I', verb: 'am' },
    'koe': { subject: 'You', verb: 'are' },
    'ia': { subject: 'He/She', verb: 'is' },
    'mātou': { subject: 'We (not you)', verb: 'are' },
    'tātou': { subject: 'We all', verb: 'are' },
    'koutou': { subject: 'You (plural)', verb: 'are' },
    'rātou': { subject: 'They', verb: 'are' }
  };

  const subjectInfo = subjectMap[card3.maori] || { subject: card3.english, verb: 'is' };

  // Different translation for adjectives vs verbs
  if (card2.type === 'adjective') {
    result.translation = `${subjectInfo.subject} ${subjectInfo.verb} ${card2.english}`;
  } else {
    // Verb - use continuous form
    const verbContinuous = makeVerbContinuous(card2.english);
    result.translation = `${subjectInfo.subject} ${subjectInfo.verb} ${verbContinuous}`;
  }

  result.breakdown = [
    {
      word: 'Kei te',
      role: 'tense marker',
      meaning: 'present continuous (right now)'
    },
    {
      word: card2.maori,
      role: card2.type,
      meaning: card2.english
    },
    {
      word: card3.maori,
      role: 'pronoun',
      meaning: card3.english
    }
  ];

  return checkTarget(cards, challenge, result);
}

/**
 * Validate 4-card Kei te sentences
 * Pattern: Kei te + intensifier + adjective/verb + pronoun
 * Examples: "Kei te tino pai au", "Kei te āhua ngenge koe"
 */
function validate4CardKeiTe(cards: Card[], challenge: Challenge | null, result: ValidationResult): ValidationResult {
  const [card1, card2, card3, card4] = cards;

  // Card 2 must be intensifier
  if (card2.type !== 'intensifier') {
    result.feedback.message = 'For 4-card sentences, second card should be an intensifier';
    result.feedback.hint = 'Kei te + [tino/āhua] + adjective/verb + pronoun';
    result.feedback.explanation = 'Intensifiers (tino=very, āhua=somewhat) modify the adjective or verb';
    return result;
  }

  // Card 3 must be adjective or verb
  if (card3.type !== 'adjective' && card3.type !== 'verb') {
    result.feedback.message = 'Third card must be an adjective or verb';
    result.feedback.hint = 'Kei te + intensifier + [adjective/verb] + pronoun';
    return result;
  }

  // Card 4 must be pronoun
  if (card4.type !== 'pronoun') {
    result.feedback.message = 'Fourth card must be a pronoun';
    result.feedback.hint = 'Kei te + intensifier + adjective/verb + WHO';
    return result;
  }

  // Valid sentence!
  result.valid = true;

  // Generate translation with intensifier
  const subjectMap: Record<string, { subject: string; verb: string }> = {
    'au': { subject: 'I', verb: 'am' },
    'koe': { subject: 'You', verb: 'are' },
    'ia': { subject: 'He/She', verb: 'is' },
    'mātou': { subject: 'We (not you)', verb: 'are' },
    'tātou': { subject: 'We all', verb: 'are' },
    'koutou': { subject: 'You (plural)', verb: 'are' },
    'rātou': { subject: 'They', verb: 'are' }
  };

  const subjectInfo = subjectMap[card4.maori] || { subject: card4.english, verb: 'is' };

  if (card3.type === 'adjective') {
    result.translation = `${subjectInfo.subject} ${subjectInfo.verb} ${card2.english} ${card3.english}`;
  } else {
    const verbContinuous = makeVerbContinuous(card3.english);
    result.translation = `${subjectInfo.subject} ${subjectInfo.verb} ${card2.english} ${verbContinuous}`;
  }

  result.breakdown = [
    {
      word: 'Kei te',
      role: 'tense marker',
      meaning: 'present continuous'
    },
    {
      word: card2.maori,
      role: 'intensifier',
      meaning: card2.english
    },
    {
      word: card3.maori,
      role: card3.type,
      meaning: card3.english
    },
    {
      word: card4.maori,
      role: 'pronoun',
      meaning: card4.english
    }
  ];

  return checkTarget(cards, challenge, result);
}

/**
 * Validate 5-card Kei te sentences with location/object
 * Pattern: Kei te + verb + subject + i/ki + object
 * Examples: "Kei te noho au i Tāmaki Makaurau", "Kei te haere ia ki te kura"
 */
function validate5CardKeiTe(cards: Card[], challenge: Challenge | null, result: ValidationResult): ValidationResult {
  const [card1, card2, card3, card4, card5] = cards;

  // Card 2 must be verb (not adjective - can't have location with adjectives)
  if (card2.type !== 'verb') {
    result.feedback.message = 'Second card must be a verb for 5-card sentences';
    result.feedback.hint = 'Kei te + verb + pronoun + i/ki + location/object';
    result.feedback.explanation = 'Only verbs can take locations or objects, not adjectives';
    return result;
  }

  // Card 3 must be pronoun
  if (card3.type !== 'pronoun') {
    result.feedback.message = 'Third card must be a pronoun';
    result.feedback.hint = 'Kei te + verb + WHO + i/ki + location';
    return result;
  }

  // Card 4 must be locative particle (i or ki)
  if (card4.type !== 'particle_locative') {
    result.feedback.message = 'Fourth card must be i or ki';
    result.feedback.hint = 'Use "i" for location (at/in) or "ki" for direction (to/towards)';
    result.feedback.explanation = 'i = at/in (where you are), ki = to/towards (where you\'re going)';
    return result;
  }

  // Card 5 must be noun (location/object) or article
  if (card5.type !== 'noun' && card5.type !== 'article') {
    result.feedback.message = 'Fifth card must be a location or object (noun)';
    result.feedback.hint = 'Kei te + verb + pronoun + i/ki + PLACE/THING';
    return result;
  }

  // Valid sentence!
  result.valid = true;

  // Generate translation
  const subjectMap: Record<string, { subject: string; verb: string }> = {
    'au': { subject: 'I', verb: 'am' },
    'koe': { subject: 'You', verb: 'are' },
    'ia': { subject: 'He/She', verb: 'is' },
    'mātou': { subject: 'We (not you)', verb: 'are' },
    'tātou': { subject: 'We all', verb: 'are' },
    'koutou': { subject: 'You (plural)', verb: 'are' },
    'rātou': { subject: 'They', verb: 'are' }
  };

  const subjectInfo = subjectMap[card3.maori] || { subject: card3.english, verb: 'is' };
  const verbContinuous = makeVerbContinuous(card2.english);

  const preposition = card4.maori === 'i' ? 'in/at' : 'to';
  result.translation = `${subjectInfo.subject} ${subjectInfo.verb} ${verbContinuous} ${preposition} ${card5.english}`;

  result.breakdown = [
    {
      word: 'Kei te',
      role: 'tense marker',
      meaning: 'present continuous'
    },
    {
      word: card2.maori,
      role: 'verb',
      meaning: card2.english
    },
    {
      word: card3.maori,
      role: 'pronoun',
      meaning: card3.english
    },
    {
      word: card4.maori,
      role: 'particle',
      meaning: card4.english
    },
    {
      word: card5.maori,
      role: card5.type,
      meaning: card5.english
    }
  ];

  return checkTarget(cards, challenge, result);
}

/**
 * Validates a Kei te present tense sentence structure
 * Patterns:
 * - 3-card: Kei te + adjective + pronoun (Kei te pai au)
 * - 3-card: Kei te + verb + subject (Kei te haere au)
 * - 4-card: Kei te + intensifier + adjective/verb + pronoun (Kei te tino pai au)
 * - 5-card: Kei te + verb + subject + i/ki + object (Kei te noho au i Tāmaki)
 *
 * @param cards - Array of card objects in order
 * @param challenge - Optional challenge object with target sentence
 * @returns Validation result with feedback
 */
export function validateKeiTeSentence(
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

  // Check we have 3, 4, or 5 cards
  if (cards.length < 3 || cards.length > 5) {
    result.feedback.message = 'Kei te sentences need 3, 4, or 5 cards';
    result.feedback.hint = 'Pattern: Kei te + adjective/verb + subject (+ optional intensifier or location)';
    return result;
  }

  const card1 = cards[0];

  // Check first card is "Kei te"
  if (card1.maori !== 'Kei te') {
    result.feedback.message = 'First card must be "Kei te"';
    result.feedback.hint = 'Kei te indicates actions or states happening RIGHT NOW';
    result.feedback.explanation = 'Kei te is the present continuous tense marker';
    return result;
  }

  // Branch based on sentence length
  if (cards.length === 3) {
    return validate3CardKeiTe(cards, challenge, result);
  } else if (cards.length === 4) {
    return validate4CardKeiTe(cards, challenge, result);
  } else if (cards.length === 5) {
    return validate5CardKeiTe(cards, challenge, result);
  }

  return result;
}

/**
 * Helper to check if a sentence uses Kei te pattern
 * @param cards - Array of card objects
 * @returns boolean indicating if Kei te pattern
 */
export function isKeiTePattern(cards: Card[]): boolean {
  return cards.length > 0 && cards[0].maori === 'Kei te';
}

/**
 * Get helpful hints based on current card arrangement
 * @param cards - Current card arrangement
 * @returns Hint string or null
 */
export function getKeiTeHint(cards: Card[]): string | null {
  if (cards.length === 0) {
    return 'Start with "Kei te" for present tense';
  }

  if (cards.length === 1 && cards[0].maori === 'Kei te') {
    return 'Good! Now add an adjective (state) or verb (action)';
  }

  if (cards.length === 2 && cards[0].maori === 'Kei te') {
    if (cards[1].type === 'adjective' || cards[1].type === 'verb') {
      return 'Great! Now add a pronoun (who?)';
    } else if (cards[1].type === 'intensifier') {
      return 'Good intensifier! Now add adjective/verb, then pronoun';
    } else {
      return 'After Kei te, add an adjective (pai, harikoa) or verb (haere, kai)';
    }
  }

  if (cards.length === 3) {
    const validation = validateKeiTeSentence(cards);
    if (validation.valid) {
      return '✅ Perfect 3-card sentence! (Optional: add intensifier or location)';
    } else {
      return 'Check pattern: Kei te + adjective/verb + pronoun';
    }
  }

  if (cards.length === 4) {
    const validation = validateKeiTeSentence(cards);
    if (validation.valid) {
      return '✅ Great sentence with intensifier!';
    } else {
      return 'Check pattern: Kei te + intensifier + adjective/verb + pronoun';
    }
  }

  if (cards.length === 5) {
    const validation = validateKeiTeSentence(cards);
    if (validation.valid) {
      return '✅ Excellent sentence with location!';
    } else {
      return 'Check pattern: Kei te + verb + pronoun + i/ki + location';
    }
  }

  if (cards.length > 5) {
    return 'Kei te sentences need 3-5 cards maximum';
  }

  return null;
}
