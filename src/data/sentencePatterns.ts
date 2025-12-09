/**
 * Sentence Patterns for Kapu Tī
 *
 * Pre-generated sentence structures with colored slots.
 * Each pattern defines a grammatical structure that players fill with cards.
 * 
 * KEY: Tense markers (yellow) are playable slots, not fixed in templates!
 * 
 * Topics: kai, feelings, actions, animals, people, places
 * Lengths: 2-7 slots for variety
 */

import { SentencePattern, TYPE_TO_COLOR } from '../types/sentencePattern.types';

export const SLOT_PATTERNS: SentencePattern[] = [
  // ============================================================================
  // 2-SLOT PATTERNS (Simple)
  // ============================================================================
  
  // [tense] [verb] - "Ka haere" / "Kei te kai"
  {
    id: 'tense_verb_2',
    name: '[tense] [verb]',
    maoriTemplate: '___ ___',
    englishTemplate: 'Is ___ing / Will ___',
    slots: [
      { position: 0, color: TYPE_TO_COLOR.tense, wordType: 'tense', hint: 'ka/kei te/kua', required: true },
      { position: 1, color: TYPE_TO_COLOR.verb, wordType: 'verb', hint: 'action', required: true },
    ],
    topicIds: ['actions', 'kai'],
    difficulty: 'beginner',
  },

  // [tense] [adjective] - "Kei te pai" (is good)
  {
    id: 'tense_adj_2',
    name: '[tense] [adjective]',
    maoriTemplate: '___ ___',
    englishTemplate: 'Is ___',
    slots: [
      { position: 0, color: TYPE_TO_COLOR.tense, wordType: 'tense', hint: 'kei te', required: true },
      { position: 1, color: TYPE_TO_COLOR.adjective, wordType: 'adjective', hint: 'feeling/state', required: true },
    ],
    topicIds: ['feelings'],
    difficulty: 'beginner',
  },

  // He [noun] - "He kai" (A food) - classification doesn't need tense
  {
    id: 'he_noun_2',
    name: 'He [noun]',
    maoriTemplate: 'He ___',
    englishTemplate: 'A ___',
    slots: [
      { position: 0, color: TYPE_TO_COLOR.noun, wordType: 'noun', hint: 'thing/person', required: true },
    ],
    topicIds: ['kai', 'animals', 'people', 'places'],
    difficulty: 'beginner',
  },

  // ============================================================================
  // 3-SLOT PATTERNS (Basic sentences)
  // ============================================================================

  // [tense] [verb] [pronoun] - "Ka haere au" (I will go)
  {
    id: 'tense_verb_pronoun_3',
    name: '[tense] [verb] [pronoun]',
    maoriTemplate: '___ ___ ___',
    englishTemplate: '___ will ___ / is ___ing',
    slots: [
      { position: 0, color: TYPE_TO_COLOR.tense, wordType: 'tense', hint: 'ka/kei te', required: true },
      { position: 1, color: TYPE_TO_COLOR.verb, wordType: 'verb', hint: 'action', required: true },
      { position: 2, color: TYPE_TO_COLOR.pronoun, wordType: 'pronoun', hint: 'au/ia/koe', required: true },
    ],
    topicIds: ['actions', 'kai'],
    difficulty: 'beginner',
  },

  // [tense] [adjective] [pronoun] - "Kei te pai au" (I am good)
  {
    id: 'tense_adj_pronoun_3',
    name: '[tense] [adjective] [pronoun]',
    maoriTemplate: '___ ___ ___',
    englishTemplate: '___ is ___',
    slots: [
      { position: 0, color: TYPE_TO_COLOR.tense, wordType: 'tense', hint: 'kei te', required: true },
      { position: 1, color: TYPE_TO_COLOR.adjective, wordType: 'adjective', hint: 'feeling', required: true },
      { position: 2, color: TYPE_TO_COLOR.pronoun, wordType: 'pronoun', hint: 'au/ia/koe', required: true },
    ],
    topicIds: ['feelings'],
    difficulty: 'beginner',
  },

  // He [noun] [pronoun] - "He kaiako ia" (She is a teacher)
  {
    id: 'he_noun_pronoun_3',
    name: 'He [noun] [pronoun]',
    maoriTemplate: 'He ___ ___',
    englishTemplate: '___ is a ___',
    slots: [
      { position: 0, color: TYPE_TO_COLOR.noun, wordType: 'noun', hint: 'role/thing', required: true },
      { position: 1, color: TYPE_TO_COLOR.pronoun, wordType: 'pronoun', hint: 'au/ia/koe', required: true },
    ],
    topicIds: ['people', 'animals'],
    difficulty: 'beginner',
  },

  // Ko [article] [noun] - "Ko te whare" (It is the house)
  {
    id: 'ko_art_noun_3',
    name: 'Ko [article] [noun]',
    maoriTemplate: 'Ko ___ ___',
    englishTemplate: 'It is the ___',
    slots: [
      { position: 0, color: TYPE_TO_COLOR.article, wordType: 'article', hint: 'te/ngā', required: true },
      { position: 1, color: TYPE_TO_COLOR.noun, wordType: 'noun', hint: 'thing', required: true },
    ],
    topicIds: ['places', 'animals', 'kai'],
    difficulty: 'beginner',
  },

  // ============================================================================
  // 4-SLOT PATTERNS (Extended sentences)
  // ============================================================================

  // [tense] [intensifier] [adjective] [pronoun] - "Kei te tino pai au" (I am very good)
  {
    id: 'tense_int_adj_pronoun_4',
    name: '[tense] tino [adjective] [pronoun]',
    maoriTemplate: '___ ___ ___ ___',
    englishTemplate: '___ is very ___',
    slots: [
      { position: 0, color: TYPE_TO_COLOR.tense, wordType: 'tense', hint: 'kei te', required: true },
      { position: 1, color: TYPE_TO_COLOR.intensifier, wordType: 'intensifier', hint: 'tino/rawa', required: true },
      { position: 2, color: TYPE_TO_COLOR.adjective, wordType: 'adjective', hint: 'feeling', required: true },
      { position: 3, color: TYPE_TO_COLOR.pronoun, wordType: 'pronoun', hint: 'who', required: true },
    ],
    topicIds: ['feelings'],
    difficulty: 'intermediate',
  },

  // He [adjective] [article] [noun] - "He pai te kai" (The food is good)
  {
    id: 'he_adj_art_noun_4',
    name: 'He [adjective] te [noun]',
    maoriTemplate: 'He ___ ___ ___',
    englishTemplate: 'The ___ is ___',
    slots: [
      { position: 0, color: TYPE_TO_COLOR.adjective, wordType: 'adjective', hint: 'quality', required: true },
      { position: 1, color: TYPE_TO_COLOR.article, wordType: 'article', hint: 'te/ngā', required: true },
      { position: 2, color: TYPE_TO_COLOR.noun, wordType: 'noun', hint: 'thing', required: true },
    ],
    topicIds: ['kai', 'animals', 'places', 'feelings'],
    difficulty: 'beginner',
  },

  // Ko [demonstrative] [article] [noun] - "Ko tēnei te whare" (This is the house)
  {
    id: 'ko_dem_art_noun_4',
    name: 'Ko [demonstrative] te [noun]',
    maoriTemplate: 'Ko ___ ___ ___',
    englishTemplate: '___ is the ___',
    slots: [
      { position: 0, color: TYPE_TO_COLOR.demonstrative, wordType: 'demonstrative', hint: 'tēnei/tēnā', required: true },
      { position: 1, color: TYPE_TO_COLOR.article, wordType: 'article', hint: 'te/ngā', required: true },
      { position: 2, color: TYPE_TO_COLOR.noun, wordType: 'noun', hint: 'thing', required: true },
    ],
    topicIds: ['places', 'animals', 'kai'],
    difficulty: 'intermediate',
  },

  // ============================================================================
  // 5-SLOT PATTERNS (Complex sentences)
  // ============================================================================

  // [tense] [verb] [pronoun] i te [noun] - "Kei te kai au i te āporo" (I am eating the apple)
  {
    id: 'tense_verb_pronoun_obj_5',
    name: '[tense] [verb] [pronoun] i te [noun]',
    maoriTemplate: '___ ___ ___ i te ___',
    englishTemplate: '___ is ___ing the ___',
    slots: [
      { position: 0, color: TYPE_TO_COLOR.tense, wordType: 'tense', hint: 'kei te/ka', required: true },
      { position: 1, color: TYPE_TO_COLOR.verb, wordType: 'verb', hint: 'action', required: true },
      { position: 2, color: TYPE_TO_COLOR.pronoun, wordType: 'pronoun', hint: 'who', required: true },
      { position: 3, color: TYPE_TO_COLOR.noun, wordType: 'noun', hint: 'object', required: true },
    ],
    topicIds: ['kai', 'actions'],
    difficulty: 'intermediate',
  },

  // Kei [locative] [article] [noun] [article] [noun] - Location pattern
  {
    id: 'kei_loc_5',
    name: 'Kei [place] te [noun]',
    maoriTemplate: 'Kei ___ ___ ___ ___ ___',
    englishTemplate: 'The ___ is at the ___',
    slots: [
      { position: 0, color: TYPE_TO_COLOR.locative, wordType: 'locative', hint: 'place', required: true },
      { position: 1, color: TYPE_TO_COLOR.article, wordType: 'article', hint: 'te', required: true },
      { position: 2, color: TYPE_TO_COLOR.noun, wordType: 'noun', hint: 'place', required: true },
      { position: 3, color: TYPE_TO_COLOR.article, wordType: 'article', hint: 'te', required: true },
      { position: 4, color: TYPE_TO_COLOR.noun, wordType: 'noun', hint: 'thing', required: true },
    ],
    topicIds: ['places', 'animals'],
    difficulty: 'intermediate',
  },

  // ============================================================================
  // 6-SLOT PATTERNS (Advanced sentences)
  // ============================================================================

  // [tense] [verb] [article] [noun] i te [noun] - "Kei te kai te ngeru i te ika"
  {
    id: 'tense_verb_subj_obj_6',
    name: '[tense] [verb] te [noun] i te [noun]',
    maoriTemplate: '___ ___ ___ ___ i te ___',
    englishTemplate: 'The ___ is ___ing the ___',
    slots: [
      { position: 0, color: TYPE_TO_COLOR.tense, wordType: 'tense', hint: 'kei te/ka', required: true },
      { position: 1, color: TYPE_TO_COLOR.verb, wordType: 'verb', hint: 'action', required: true },
      { position: 2, color: TYPE_TO_COLOR.article, wordType: 'article', hint: 'te', required: true },
      { position: 3, color: TYPE_TO_COLOR.noun, wordType: 'noun', hint: 'who/what', required: true },
      { position: 4, color: TYPE_TO_COLOR.noun, wordType: 'noun', hint: 'object', required: true },
    ],
    topicIds: ['kai', 'actions', 'animals'],
    difficulty: 'advanced',
  },

  // He [adjective] [intensifier] [article] [noun] [demonstrative]
  {
    id: 'he_adj_int_noun_dem_6',
    name: 'He [adj] [intensifier] te [noun] [dem]',
    maoriTemplate: 'He ___ ___ ___ ___ ___',
    englishTemplate: '___ ___ is very ___',
    slots: [
      { position: 0, color: TYPE_TO_COLOR.adjective, wordType: 'adjective', hint: 'quality', required: true },
      { position: 1, color: TYPE_TO_COLOR.intensifier, wordType: 'intensifier', hint: 'tino/rawa', required: true },
      { position: 2, color: TYPE_TO_COLOR.article, wordType: 'article', hint: 'te', required: true },
      { position: 3, color: TYPE_TO_COLOR.noun, wordType: 'noun', hint: 'thing', required: true },
      { position: 4, color: TYPE_TO_COLOR.demonstrative, wordType: 'demonstrative', hint: 'tēnei', required: true },
    ],
    topicIds: ['feelings', 'kai'],
    difficulty: 'advanced',
  },

  // ============================================================================
  // 7-SLOT PATTERNS (Full sentences)
  // ============================================================================

  // [tense] [verb] [pronoun] i te [noun] [adjective] ki te [noun]
  {
    id: 'tense_full_7',
    name: 'Full action sentence',
    maoriTemplate: '___ ___ ___ i te ___ ___ ki te ___',
    englishTemplate: '___ is ___ing the ___ ___ at the ___',
    slots: [
      { position: 0, color: TYPE_TO_COLOR.tense, wordType: 'tense', hint: 'kei te/ka', required: true },
      { position: 1, color: TYPE_TO_COLOR.verb, wordType: 'verb', hint: 'action', required: true },
      { position: 2, color: TYPE_TO_COLOR.pronoun, wordType: 'pronoun', hint: 'who', required: true },
      { position: 3, color: TYPE_TO_COLOR.noun, wordType: 'noun', hint: 'object', required: true },
      { position: 4, color: TYPE_TO_COLOR.adjective, wordType: 'adjective', hint: 'quality', required: true },
      { position: 5, color: TYPE_TO_COLOR.noun, wordType: 'noun', hint: 'place', required: true },
    ],
    topicIds: ['kai', 'actions', 'places'],
    difficulty: 'advanced',
  },
];

// Helper to get all pattern IDs
export const PATTERN_IDS = SLOT_PATTERNS.map(p => p.id);

// Index by difficulty
export const PATTERNS_BY_DIFFICULTY = {
  beginner: SLOT_PATTERNS.filter(p => p.difficulty === 'beginner'),
  intermediate: SLOT_PATTERNS.filter(p => p.difficulty === 'intermediate'),
  advanced: SLOT_PATTERNS.filter(p => p.difficulty === 'advanced'),
};

// Index by topic
export const PATTERNS_BY_TOPIC: Record<string, SentencePattern[]> = {};
['kai', 'feelings', 'actions', 'animals', 'people', 'places'].forEach(topicId => {
  PATTERNS_BY_TOPIC[topicId] = SLOT_PATTERNS.filter(p => p.topicIds.includes(topicId));
});
