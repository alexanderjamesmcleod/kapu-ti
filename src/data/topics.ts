/**
 * Topic-Based Sentence Generation System
 *
 * Players choose a topic, and sentences are generated around that topic.
 * Sentences can morph into related sentences as the game progresses.
 */

import { ALL_WORDS, getWordById, getWordsByType, type Word } from './wordLibrary';

// ============================================================================
// TYPES
// ============================================================================

export interface Topic {
  id: string;
  name: string;
  maori: string;
  description: string;
  icon: string;  // Emoji for UI
  primaryWords: string[];      // Word IDs that are central to this topic
  relatedWords: string[];      // Word IDs that can be used with this topic
  morphTargets: string[];      // Topic IDs this can morph into
  sentencePatterns: SentencePattern[];  // Patterns available for this topic
}

export interface SentencePattern {
  id: string;
  name: string;
  structure: string[];         // Word types in order
  example: {
    maori: string;
    english: string;
  };
  difficulty: 'easy' | 'medium' | 'hard';
  morphsTo?: string;           // Pattern ID this can evolve into
}

export interface GeneratedSentence {
  pattern: SentencePattern;
  words: Word[];
  maori: string;
  english: string;
  topic: Topic;
  canMorphTo: GeneratedSentence[];
}

// ============================================================================
// SENTENCE PATTERNS (building blocks for all topics)
// ============================================================================

export const SENTENCE_PATTERNS: Record<string, SentencePattern> = {
  // He patterns (classification - "A thing")
  he_simple: {
    id: 'he_simple',
    name: 'He Simple',
    structure: ['particle_he', 'noun'],
    example: { maori: 'He kai', english: 'A food' },
    difficulty: 'easy',
    morphsTo: 'he_pronoun'
  },
  he_pronoun: {
    id: 'he_pronoun',
    name: 'He + Pronoun',
    structure: ['particle_he', 'noun', 'pronoun'],
    example: { maori: 'He kaiako ia', english: 'He/she is a teacher' },
    difficulty: 'easy',
    morphsTo: 'keite_state'
  },

  // Ko patterns (identity - "THE thing")
  ko_simple: {
    id: 'ko_simple',
    name: 'Ko Simple',
    structure: ['particle_ko', 'article', 'noun'],
    example: { maori: 'Ko te whare', english: 'The house' },
    difficulty: 'easy',
    morphsTo: 'ko_demonstrative'
  },
  ko_demonstrative: {
    id: 'ko_demonstrative',
    name: 'Ko + Demonstrative',
    structure: ['particle_ko', 'article', 'noun', 'demonstrative'],
    example: { maori: 'Ko te whare tēnei', english: 'This is the house' },
    difficulty: 'medium',
    morphsTo: 'ko_equative'
  },
  ko_equative: {
    id: 'ko_equative',
    name: 'Ko Equative',
    structure: ['particle_ko', 'pronoun', 'article', 'noun'],
    example: { maori: 'Ko au te kaiako', english: 'I am the teacher' },
    difficulty: 'medium'
  },

  // Kei te patterns (present continuous - "doing/being NOW")
  keite_state: {
    id: 'keite_state',
    name: 'Kei te State',
    structure: ['tense_marker', 'adjective', 'pronoun'],
    example: { maori: 'Kei te pai au', english: 'I am good' },
    difficulty: 'easy',
    morphsTo: 'keite_intensified'
  },
  keite_action: {
    id: 'keite_action',
    name: 'Kei te Action',
    structure: ['tense_marker', 'verb', 'pronoun'],
    example: { maori: 'Kei te kai au', english: 'I am eating' },
    difficulty: 'easy',
    morphsTo: 'keite_location'
  },
  keite_intensified: {
    id: 'keite_intensified',
    name: 'Kei te + Intensifier',
    structure: ['tense_marker', 'intensifier', 'adjective', 'pronoun'],
    example: { maori: 'Kei te tino pai au', english: 'I am very good' },
    difficulty: 'medium'
  },
  keite_location: {
    id: 'keite_location',
    name: 'Kei te + Location',
    structure: ['tense_marker', 'verb', 'pronoun', 'particle_locative', 'noun'],
    example: { maori: 'Kei te kai au i te whare', english: 'I am eating at the house' },
    difficulty: 'hard'
  }
};

// ============================================================================
// TOPICS
// ============================================================================

export const TOPICS: Topic[] = [
  // --- FOOD (Kai) ---
  {
    id: 'kai',
    name: 'Food',
    maori: 'Kai',
    description: 'Food, eating, and hunger',
    icon: '🍎',
    primaryWords: ['v_kai'],
    relatedWords: ['adj_matekai', 'adj_makona', 'n_whare'],
    morphTargets: ['feelings', 'actions'],
    sentencePatterns: [
      SENTENCE_PATTERNS.he_simple,
      SENTENCE_PATTERNS.keite_action,
      SENTENCE_PATTERNS.keite_location
    ]
  },

  // --- FEELINGS (Kare ā-roto) ---
  {
    id: 'feelings',
    name: 'Feelings',
    maori: 'Kare ā-roto',
    description: 'Emotions and states of being',
    icon: '😊',
    primaryWords: ['adj_pai', 'adj_harikoa', 'adj_pouri', 'adj_riri', 'adj_ngenge'],
    relatedWords: ['adj_mauiui', 'adj_ora', 'adj_hiamoe', 'adj_matekai', 'adj_hiainu'],
    morphTargets: ['actions', 'people'],
    sentencePatterns: [
      SENTENCE_PATTERNS.keite_state,
      SENTENCE_PATTERNS.keite_intensified
    ]
  },

  // --- ACTIONS (Mahi) ---
  {
    id: 'actions',
    name: 'Actions',
    maori: 'Mahi',
    description: 'Things you do',
    icon: '🏃',
    primaryWords: ['v_haere', 'v_kai', 'v_noho', 'v_oma', 'v_mahi', 'v_ako'],
    relatedWords: ['v_mahaki', 'n_kura', 'n_whare'],
    morphTargets: ['places', 'feelings'],
    sentencePatterns: [
      SENTENCE_PATTERNS.keite_action,
      SENTENCE_PATTERNS.keite_location
    ]
  },

  // --- ANIMALS (Kararehe) ---
  {
    id: 'animals',
    name: 'Animals',
    maori: 'Kararehe',
    description: 'Creatures and pets',
    icon: '🐱',
    primaryWords: ['n_ngeru', 'n_kuri', 'n_manu', 'n_kaka'],
    relatedWords: ['art_te', 'art_nga'],
    morphTargets: ['places', 'people'],
    sentencePatterns: [
      SENTENCE_PATTERNS.he_simple,
      SENTENCE_PATTERNS.ko_simple,
      SENTENCE_PATTERNS.ko_demonstrative
    ]
  },

  // --- PEOPLE (Tangata) ---
  {
    id: 'people',
    name: 'People',
    maori: 'Tangata',
    description: 'People and roles',
    icon: '👨‍👩‍👧‍👦',
    primaryWords: ['n_tangata', 'n_kaiako', 'n_tauira', 'n_tamaiti', 'n_tamariki'],
    relatedWords: ['n_pouako', 'pr_au', 'pr_ia', 'pr_koe'],
    morphTargets: ['feelings', 'actions'],
    sentencePatterns: [
      SENTENCE_PATTERNS.he_simple,
      SENTENCE_PATTERNS.he_pronoun,
      SENTENCE_PATTERNS.ko_equative
    ]
  },

  // --- PLACES (Wāhi) ---
  {
    id: 'places',
    name: 'Places',
    maori: 'Wāhi',
    description: 'Locations and buildings',
    icon: '🏠',
    primaryWords: ['n_whare', 'n_kura', 'n_tamaki'],
    relatedWords: ['pl_i', 'pl_ki', 'v_haere', 'v_noho'],
    morphTargets: ['actions', 'people'],
    sentencePatterns: [
      SENTENCE_PATTERNS.ko_simple,
      SENTENCE_PATTERNS.ko_demonstrative,
      SENTENCE_PATTERNS.keite_location
    ]
  }
];

// ============================================================================
// MĀORI NUMBERS (for turn order cards)
// ============================================================================

export interface NumberCard {
  value: number;
  maori: string;
  english: string;
  pronunciation: string;
}

export const MAORI_NUMBERS: NumberCard[] = [
  { value: 1, maori: 'tahi', english: 'one', pronunciation: 'tah-hee' },
  { value: 2, maori: 'rua', english: 'two', pronunciation: 'roo-ah' },
  { value: 3, maori: 'toru', english: 'three', pronunciation: 'taw-roo' },
  { value: 4, maori: 'whā', english: 'four', pronunciation: 'fah' },
  { value: 5, maori: 'rima', english: 'five', pronunciation: 'ree-mah' },
  { value: 6, maori: 'ono', english: 'six', pronunciation: 'oh-noh' },
  { value: 7, maori: 'whitu', english: 'seven', pronunciation: 'fee-too' },
  { value: 8, maori: 'waru', english: 'eight', pronunciation: 'wah-roo' },
  { value: 9, maori: 'iwa', english: 'nine', pronunciation: 'ee-wah' },
  { value: 10, maori: 'tekau', english: 'ten', pronunciation: 'teh-kah-oo' },
  { value: 11, maori: 'tekau mā tahi', english: 'eleven', pronunciation: 'teh-kah-oo mar tah-hee' },
  { value: 12, maori: 'tekau mā rua', english: 'twelve', pronunciation: 'teh-kah-oo mar roo-ah' },
  { value: 13, maori: 'tekau mā toru', english: 'thirteen', pronunciation: 'teh-kah-oo mar taw-roo' },
  { value: 14, maori: 'tekau mā whā', english: 'fourteen', pronunciation: 'teh-kah-oo mar fah' },
  { value: 15, maori: 'tekau mā rima', english: 'fifteen', pronunciation: 'teh-kah-oo mar ree-mah' },
  { value: 16, maori: 'tekau mā ono', english: 'sixteen', pronunciation: 'teh-kah-oo mar oh-noh' },
  { value: 17, maori: 'tekau mā whitu', english: 'seventeen', pronunciation: 'teh-kah-oo mar fee-too' },
  { value: 18, maori: 'tekau mā waru', english: 'eighteen', pronunciation: 'teh-kah-oo mar wah-roo' },
  { value: 19, maori: 'tekau mā iwa', english: 'nineteen', pronunciation: 'teh-kah-oo mar ee-wah' },
  { value: 20, maori: 'rua tekau', english: 'twenty', pronunciation: 'roo-ah teh-kah-oo' }
];

// ============================================================================
// SENTENCE GENERATOR
// ============================================================================

/**
 * Get a random element from an array
 */
function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Get a word that matches the required type from the topic
 */
function getWordForType(
  wordType: string,
  topic: Topic,
  usedWordIds: Set<string> = new Set()
): Word | null {
  // Map structure types to actual word types
  const typeMap: Record<string, string[]> = {
    'particle_he': ['particle'],
    'particle_ko': ['particle'],
    'noun': ['noun'],
    'pronoun': ['pronoun'],
    'article': ['article'],
    'demonstrative': ['demonstrative'],
    'tense_marker': ['tense_marker'],
    'adjective': ['adjective'],
    'verb': ['verb'],
    'intensifier': ['intensifier'],
    'particle_locative': ['particle_locative']
  };

  const actualTypes = typeMap[wordType] || [wordType];

  // First, try to find a word from the topic's primary/related words
  const topicWordIds = [...topic.primaryWords, ...topic.relatedWords];
  const topicWords = topicWordIds
    .map(id => getWordById(id))
    .filter((w): w is Word =>
      w !== undefined &&
      actualTypes.includes(w.type) &&
      !usedWordIds.has(w.id)
    );

  if (topicWords.length > 0) {
    return randomFrom(topicWords);
  }

  // Fall back to any word of the right type
  const allOfType = getWordsByType(actualTypes[0])
    .filter(w => !usedWordIds.has(w.id));

  // Special handling for particles
  if (wordType === 'particle_he') {
    return getWordById('p_he') || null;
  }
  if (wordType === 'particle_ko') {
    return getWordById('p_ko') || null;
  }
  if (wordType === 'tense_marker') {
    return getWordById('tm_keite') || null;
  }

  return allOfType.length > 0 ? randomFrom(allOfType) : null;
}

/**
 * Generate a sentence based on a topic and pattern
 */
export function generateSentence(
  topic: Topic,
  pattern?: SentencePattern
): GeneratedSentence | null {
  // Pick a random pattern if not specified
  const selectedPattern = pattern || randomFrom(topic.sentencePatterns);

  const words: Word[] = [];
  const usedWordIds = new Set<string>();

  // Build the sentence word by word
  for (const wordType of selectedPattern.structure) {
    const word = getWordForType(wordType, topic, usedWordIds);
    if (!word) {
      console.warn(`Could not find word for type: ${wordType}`);
      return null;
    }
    words.push(word);
    usedWordIds.add(word.id);
  }

  // Build the Māori and English strings
  const maori = words.map(w => w.maori).join(' ');
  const english = buildEnglishTranslation(words, selectedPattern);

  // Find possible morphs
  const canMorphTo: GeneratedSentence[] = [];
  if (selectedPattern.morphsTo) {
    const nextPattern = SENTENCE_PATTERNS[selectedPattern.morphsTo];
    if (nextPattern && topic.sentencePatterns.some(p => p.id === nextPattern.id)) {
      const morphed = generateSentence(topic, nextPattern);
      if (morphed) {
        canMorphTo.push(morphed);
      }
    }
  }

  return {
    pattern: selectedPattern,
    words,
    maori,
    english,
    topic,
    canMorphTo
  };
}

/**
 * Build English translation from words
 */
function buildEnglishTranslation(words: Word[], pattern: SentencePattern): string {
  // Simple translation building - can be improved
  const parts: string[] = [];

  for (const word of words) {
    if (word.type === 'particle') {
      // Skip particles in English
      continue;
    }
    if (word.type === 'article') {
      parts.push(word.english);
    } else if (word.type === 'tense_marker') {
      // Kei te = present continuous
      if (word.maori === 'Kei te') {
        parts.push('is/am/are');
      }
    } else if (word.type === 'intensifier') {
      parts.push(word.english);
    } else if (word.type === 'pronoun') {
      parts.push(word.english);
    } else if (word.type === 'demonstrative') {
      parts.push(word.english);
    } else if (word.type === 'verb') {
      // Add -ing for present continuous
      parts.push(word.english + 'ing');
    } else if (word.type === 'adjective') {
      parts.push(word.english);
    } else if (word.type === 'noun') {
      parts.push(word.english);
    } else if (word.type === 'particle_locative') {
      parts.push(word.english);
    }
  }

  // Capitalize first letter
  const result = parts.join(' ');
  return result.charAt(0).toUpperCase() + result.slice(1);
}

/**
 * Generate multiple sentences for a topic
 */
export function generateSentencesForTopic(
  topic: Topic,
  count: number = 5
): GeneratedSentence[] {
  const sentences: GeneratedSentence[] = [];
  const patterns = [...topic.sentencePatterns];

  // Shuffle patterns
  for (let i = patterns.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [patterns[i], patterns[j]] = [patterns[j], patterns[i]];
  }

  for (let i = 0; i < count; i++) {
    const pattern = patterns[i % patterns.length];
    const sentence = generateSentence(topic, pattern);
    if (sentence) {
      sentences.push(sentence);
    }
  }

  return sentences;
}

/**
 * Get topic by ID
 */
export function getTopicById(id: string): Topic | undefined {
  return TOPICS.find(t => t.id === id);
}

/**
 * Deal turn order cards to players
 */
export function dealTurnOrderCards(playerCount: number): NumberCard[] {
  // Shuffle the number cards
  const shuffled = [...MAORI_NUMBERS].sort(() => Math.random() - 0.5);
  // Deal one to each player
  return shuffled.slice(0, playerCount);
}

/**
 * Determine player order from dealt cards (highest first)
 */
export function getPlayerOrder(dealtCards: NumberCard[]): number[] {
  return dealtCards
    .map((card, index) => ({ card, index }))
    .sort((a, b) => b.card.value - a.card.value)
    .map(item => item.index);
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  TOPICS,
  SENTENCE_PATTERNS,
  MAORI_NUMBERS,
  generateSentence,
  generateSentencesForTopic,
  getTopicById,
  dealTurnOrderCards,
  getPlayerOrder
};
