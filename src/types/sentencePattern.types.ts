/**
 * Sentence Pattern Types for Kapu Tī
 *
 * Defines the schema for pre-generated sentence patterns used in gameplay.
 * Patterns have colored slots that players fill by matching card colors.
 */

// Word types mapped to colors
export type WordType =
  | 'particle'      // purple - e.g., "ko", "he", "kei"
  | 'article'       // gray - "te", "ngā"
  | 'noun'          // blue - objects, people
  | 'pronoun'       // red - "au", "ia", "koe"
  | 'verb'          // green - action words
  | 'adjective'     // lightblue - statives
  | 'tense'         // yellow - "kei te", "ka", "i"
  | 'demonstrative' // orange - "tēnei", "tēnā"
  | 'intensifier'   // pink - "tino", "rawa"
  | 'locative'      // brown - "ki", "i", "kei"
  | 'time';         // teal - time words

// Color to word type mapping
export const COLOR_TO_TYPE: Record<string, WordType> = {
  purple: 'particle',
  gray: 'article',
  blue: 'noun',
  red: 'pronoun',
  green: 'verb',
  lightblue: 'adjective',
  yellow: 'tense',
  orange: 'demonstrative',
  pink: 'intensifier',
  brown: 'locative',
  teal: 'time',
};

// Type to color mapping (reverse lookup)
export const TYPE_TO_COLOR: Record<WordType, string> = {
  particle: 'purple',
  article: 'gray',
  noun: 'blue',
  pronoun: 'red',
  verb: 'green',
  adjective: 'lightblue',
  tense: 'yellow',
  demonstrative: 'orange',
  intensifier: 'pink',
  locative: 'brown',
  time: 'teal',
};

// A slot in a sentence pattern
export interface PatternSlot {
  position: number;
  color: string;           // Card color that can fill this
  wordType: WordType;      // What type of word goes here
  hint?: string;           // Optional hint text (e.g., "subject")
  required: boolean;       // Is this slot required to complete?
}

// A complete sentence pattern
export interface SentencePattern {
  id: string;
  name: string;            // e.g., "Ko wai koe?" pattern
  maoriTemplate: string;   // e.g., "Ko ___ au" (with blanks)
  englishTemplate: string; // e.g., "I am ___"
  slots: PatternSlot[];
  topicIds: string[];      // Which topics use this pattern
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

// Pattern instance with target words (for a specific game round)
export interface PatternInstance {
  patternId: string;
  pattern: SentencePattern;
  targetSentence: string;      // The complete target (hidden from players)
  targetTranslation: string;   // English translation
  slots: PatternSlotInstance[];
}

export interface PatternSlotInstance extends PatternSlot {
  targetCardId?: string;   // The correct card ID (for validation)
  targetWord?: string;     // The target word for this slot
}
