/**
 * Sentence Patterns for Kapu Tī
 *
 * Pre-generated sentence structures with colored slots.
 * Each pattern defines a grammatical structure that players can practice.
 */

import { SentencePattern, TYPE_TO_COLOR } from '../types/sentencePattern.types';

export const SENTENCE_PATTERNS: SentencePattern[] = [
  // 1. Ko wai? (Who is...?)
  // Pattern: Ko [noun] [pronoun/noun]
  // Example: "Ko Maia au" (I am Maia)
  {
    id: 'pattern_ko_wai',
    name: 'Ko wai? - Who is...?',
    maoriTemplate: 'Ko ___ ___',
    englishTemplate: 'I am ___',
    slots: [
      {
        position: 0,
        color: TYPE_TO_COLOR.noun,
        wordType: 'noun',
        hint: 'name or identity',
        required: true,
      },
      {
        position: 1,
        color: TYPE_TO_COLOR.pronoun,
        wordType: 'pronoun',
        hint: 'who (au, ia, koe)',
        required: true,
      },
    ],
    topicIds: ['intro', 'greetings', 'identity'],
    difficulty: 'beginner',
  },

  // 2. He aha tēnei? (What is this?)
  // Pattern: He [noun] tēnei
  // Example: "He kapu tēnei" (This is a cup)
  {
    id: 'pattern_he_aha',
    name: 'He aha tēnei? - What is this?',
    maoriTemplate: 'He ___ tēnei',
    englishTemplate: 'This is a ___',
    slots: [
      {
        position: 0,
        color: TYPE_TO_COLOR.noun,
        wordType: 'noun',
        hint: 'object or thing',
        required: true,
      },
    ],
    topicIds: ['objects', 'identification', 'intro'],
    difficulty: 'beginner',
  },

  // 3. Kei hea? (Where is...?)
  // Pattern: Kei [locative] [article] [noun]
  // Example: "Kei te tēpu te kapu" (The cup is on the table)
  {
    id: 'pattern_kei_hea',
    name: 'Kei hea? - Where is...?',
    maoriTemplate: 'Kei ___ ___ ___',
    englishTemplate: 'The ___ is ___',
    slots: [
      {
        position: 0,
        color: TYPE_TO_COLOR.locative,
        wordType: 'locative',
        hint: 'location (te, runga, raro)',
        required: true,
      },
      {
        position: 1,
        color: TYPE_TO_COLOR.article,
        wordType: 'article',
        hint: 'the (te/ngā)',
        required: true,
      },
      {
        position: 2,
        color: TYPE_TO_COLOR.noun,
        wordType: 'noun',
        hint: 'object',
        required: true,
      },
    ],
    topicIds: ['location', 'objects', 'prepositions'],
    difficulty: 'intermediate',
  },

  // 4. Kei te aha? (What are you doing?)
  // Pattern: Kei te [verb] [pronoun]
  // Example: "Kei te kai au" (I am eating)
  {
    id: 'pattern_kei_te_verb',
    name: 'Kei te aha? - What are you doing?',
    maoriTemplate: 'Kei te ___ ___',
    englishTemplate: '___ is/am/are ___ing',
    slots: [
      {
        position: 0,
        color: TYPE_TO_COLOR.verb,
        wordType: 'verb',
        hint: 'action',
        required: true,
      },
      {
        position: 1,
        color: TYPE_TO_COLOR.pronoun,
        wordType: 'pronoun',
        hint: 'who (au, ia, koe)',
        required: true,
      },
    ],
    topicIds: ['actions', 'present_tense', 'daily_activities'],
    difficulty: 'beginner',
  },

  // 5. E [verb] ana (Present continuous)
  // Pattern: E [verb] ana [pronoun]
  // Example: "E moe ana ia" (He/she is sleeping)
  {
    id: 'pattern_e_ana',
    name: 'E...ana - Present continuous',
    maoriTemplate: 'E ___ ana ___',
    englishTemplate: '___ is ___ing',
    slots: [
      {
        position: 0,
        color: TYPE_TO_COLOR.verb,
        wordType: 'verb',
        hint: 'action',
        required: true,
      },
      {
        position: 1,
        color: TYPE_TO_COLOR.pronoun,
        wordType: 'pronoun',
        hint: 'who (au, ia, koe)',
        required: true,
      },
    ],
    topicIds: ['actions', 'present_tense', 'daily_activities'],
    difficulty: 'intermediate',
  },

  // 6. He [adjective] (Simple description)
  // Pattern: He [adjective] [article] [noun]
  // Example: "He pai te kai" (The food is good)
  {
    id: 'pattern_he_adjective',
    name: 'He [adjective] - Simple description',
    maoriTemplate: 'He ___ ___ ___',
    englishTemplate: 'The ___ is ___',
    slots: [
      {
        position: 0,
        color: TYPE_TO_COLOR.adjective,
        wordType: 'adjective',
        hint: 'quality/state',
        required: true,
      },
      {
        position: 1,
        color: TYPE_TO_COLOR.article,
        wordType: 'article',
        hint: 'the (te/ngā)',
        required: true,
      },
      {
        position: 2,
        color: TYPE_TO_COLOR.noun,
        wordType: 'noun',
        hint: 'object',
        required: true,
      },
    ],
    topicIds: ['descriptions', 'statives', 'opinions'],
    difficulty: 'beginner',
  },

  // 7. Ko [demonstrative] (This/that is...)
  // Pattern: Ko [demonstrative] [article] [noun]
  // Example: "Ko tēnei te whare" (This is the house)
  {
    id: 'pattern_ko_demonstrative',
    name: 'Ko tēnei/tēnā - This/that is...',
    maoriTemplate: 'Ko ___ ___ ___',
    englishTemplate: '___ is the ___',
    slots: [
      {
        position: 0,
        color: TYPE_TO_COLOR.demonstrative,
        wordType: 'demonstrative',
        hint: 'this/that (tēnei/tēnā/tērā)',
        required: true,
      },
      {
        position: 1,
        color: TYPE_TO_COLOR.article,
        wordType: 'article',
        hint: 'the (te/ngā)',
        required: true,
      },
      {
        position: 2,
        color: TYPE_TO_COLOR.noun,
        wordType: 'noun',
        hint: 'object',
        required: true,
      },
    ],
    topicIds: ['identification', 'objects', 'demonstratives'],
    difficulty: 'intermediate',
  },

  // 8. I [verb] (Past tense)
  // Pattern: I [verb] [pronoun]
  // Example: "I kai au" (I ate)
  {
    id: 'pattern_i_past',
    name: 'I [verb] - Past tense',
    maoriTemplate: 'I ___ ___',
    englishTemplate: '___ ___ed',
    slots: [
      {
        position: 0,
        color: TYPE_TO_COLOR.verb,
        wordType: 'verb',
        hint: 'action',
        required: true,
      },
      {
        position: 1,
        color: TYPE_TO_COLOR.pronoun,
        wordType: 'pronoun',
        hint: 'who (au, ia, koe)',
        required: true,
      },
    ],
    topicIds: ['past_tense', 'actions', 'daily_activities'],
    difficulty: 'intermediate',
  },
];

// Helper to get all pattern IDs
export const PATTERN_IDS = SENTENCE_PATTERNS.map(p => p.id);

// Index by difficulty
export const PATTERNS_BY_DIFFICULTY = {
  beginner: SENTENCE_PATTERNS.filter(p => p.difficulty === 'beginner'),
  intermediate: SENTENCE_PATTERNS.filter(p => p.difficulty === 'intermediate'),
  advanced: SENTENCE_PATTERNS.filter(p => p.difficulty === 'advanced'),
};
