/**
 * Curriculum Data for Te Reo Academy
 * Modules, Lessons, and Challenges
 * Ported from v3: te-reo-card-game/src/data/module1.js, module2.js
 * 
 * Simplified structure optimized for Supabase database seeding
 */

import { Module, Lesson } from '../types/lesson.types';

export interface Challenge {
  id: string;
  type: 'build' | 'choose_correct' | 'free_build';
  difficulty: 'easy' | 'medium' | 'hard';
  instruction: string;
  target: {
    maori: string;
    english: string;
  };
  pattern: string[];
  requiredCards?: string[]; // Word IDs
  availableCards?: string[]; // Word IDs for free build
  hints?: Array<{
    trigger: string;
    message: string;
  }>;
}

// ============================================================================
// MODULE 1: Tūāpapa (Foundations) - Ko/He Sentences
// ============================================================================

export const MODULE_1: Module = {
  id: 'module_1',
  title: 'Tūāpapa (Foundations)',
  description: 'Master Ko and He sentences to identify and classify people and things',
  order_index: 1,
  lessons: [
    // Lesson 1.1: Meet Ko
    {
      id: 'lesson_1_1',
      module_id: 'module_1',
      title: 'Meet Ko - Introducing Ko sentences',
      description: 'Learn to identify specific things using Ko',
      order_index: 1,
      lesson_type: 'tutorial',
      grammar: {
        structure: 'Ko + te/ngā + noun',
        pattern: ['Ko', 'article', 'noun'],
        explanation: 'Ko is a definite particle that introduces something specific. Always followed by te (singular) or ngā (plural).',
        tips: [
          'Ko is like pointing at something and saying "THAT one!"',
          'te is for ONE thing (singular)',
          'ngā is for MANY things (plural)'
        ]
      },
      vocabulary_introduced: ['p_ko', 'art_te', 'art_nga', 'n_whare', 'n_ngeru', 'n_kaiako', 'n_tangata']
    },

    // Lesson 1.2: He Classification
    {
      id: 'lesson_1_2',
      module_id: 'module_1',
      title: 'He Sentences - Classification',
      description: 'Learn to classify things using He',
      order_index: 2,
      lesson_type: 'practice',
      grammar: {
        structure: 'He + noun',
        pattern: ['He', 'noun'],
        explanation: 'He classifies things - "a/an" or "some". Never use articles (te/ngā) after He!',
        tips: [
          'He = "a/an" for classification',
          'Ko = "the" for specific things',
          'NEVER use te/ngā after He'
        ]
      },
      vocabulary_introduced: ['p_he']
    },

    // Lesson 1.3: Demonstratives
    {
      id: 'lesson_1_3',
      module_id: 'module_1',
      title: 'Tēnei, Tēnā, Tērā - This and That',
      description: 'Add demonstratives to Ko sentences',
      order_index: 3,
      lesson_type: 'practice',
      grammar: {
        structure: 'Ko + te/ngā + noun + demonstrative',
        pattern: ['Ko', 'article', 'noun', 'demonstrative'],
        explanation: 'Demonstratives indicate distance: tēnei (near speaker), tēnā (near listener), tērā (far from both)',
        tips: [
          'tēnei = this (by me)',
          'tēnā = that (by you)',
          'tērā = that (over there)',
          'Demonstrative comes AFTER the noun'
        ]
      },
      vocabulary_introduced: ['d_tenei', 'd_tena', 'd_tera']
    },

    // Lesson 1.4: Equative Sentences
    {
      id: 'lesson_1_4',
      module_id: 'module_1',
      title: 'Equative Sentences - I am, You are',
      description: 'Connect pronouns to nouns using Ko',
      order_index: 4,
      lesson_type: 'challenge',
      grammar: {
        structure: 'Ko + pronoun + te/ngā + noun',
        pattern: ['Ko', 'pronoun', 'article', 'noun'],
        explanation: 'Equative sentences connect who someone is to what they are',
        tips: [
          'Ko + pronoun + te/ngā + noun',
          'au = I/me',
          'koe = you (singular)',
          'ia = he/she/it (gender neutral!)'
        ]
      },
      vocabulary_introduced: ['pr_au', 'pr_koe', 'pr_ia']
    }
  ]
};

// ============================================================================
// MODULE 2: Kei te (Present Tense)
// ============================================================================

export const MODULE_2: Module = {
  id: 'module_2',
  title: 'Kei te (Present Tense)',
  description: 'Express actions and states happening right now',
  order_index: 2,
  lessons: [
    // Lesson 2.1: Kei te Basics
    {
      id: 'lesson_2_1',
      module_id: 'module_2',
      title: 'Kei te Basics - Present Continuous',
      description: 'Learn to express current states and actions',
      order_index: 1,
      lesson_type: 'tutorial',
      grammar: {
        structure: 'Kei te + adjective/verb + pronoun',
        pattern: ['Kei te', 'adjective/verb', 'pronoun'],
        explanation: 'Kei te indicates present continuous - actions or states happening RIGHT NOW',
        tips: [
          'Kei te = present continuous (right now!)',
          'Verbs never change form in te reo',
          'Word order: Kei te + action/state + who'
        ]
      },
      vocabulary_introduced: ['tm_keite', 'adj_pai', 'adj_harikoa', 'adj_ngenge', 'v_haere', 'v_kai']
    },

    // Lesson 2.2: Intensifiers
    {
      id: 'lesson_2_2',
      module_id: 'module_2',
      title: 'Intensifiers - Very and Somewhat',
      description: 'Add intensity with tino and āhua',
      order_index: 2,
      lesson_type: 'practice',
      grammar: {
        structure: 'Kei te + intensifier + adjective/verb + pronoun',
        pattern: ['Kei te', 'intensifier', 'adjective/verb', 'pronoun'],
        explanation: 'Intensifiers modify the degree of the adjective or verb',
        tips: [
          'tino = very',
          'āhua = somewhat/rather',
          'Intensifier goes BEFORE the adjective/verb',
          'Kei te + tino/āhua + adjective + pronoun'
        ]
      },
      vocabulary_introduced: ['int_tino', 'int_ahua']
    },

    // Lesson 2.3: Locations
    {
      id: 'lesson_2_3',
      module_id: 'module_2',
      title: 'Locations - At and To',
      description: 'Add locations with i and ki',
      order_index: 3,
      lesson_type: 'challenge',
      grammar: {
        structure: 'Kei te + verb + pronoun + i/ki + location',
        pattern: ['Kei te', 'verb', 'pronoun', 'locative', 'location'],
        explanation: 'i indicates location (at/in), ki indicates direction (to/towards)',
        tips: [
          'i = at/in (where you are)',
          'ki = to/towards (where you\'re going)',
          'Only works with VERBS, not adjectives',
          'Location comes at the END'
        ]
      },
      vocabulary_introduced: ['pl_i', 'pl_ki', 'n_kura', 'n_tamaki', 'v_noho']
    }
  ]
};

export const CURRICULUM: Module[] = [MODULE_1, MODULE_2];

// Sample challenges for database seeding
export const SAMPLE_CHALLENGES: Challenge[] = [
  // Module 1 challenges
  {
    id: 'c_1_1_1',
    type: 'build',
    difficulty: 'easy',
    instruction: 'Build this sentence:',
    target: { maori: 'Ko te whare', english: 'The house' },
    pattern: ['Ko', 'te', 'noun'],
    requiredCards: ['p_ko', 'art_te', 'n_whare']
  },
  {
    id: 'c_1_1_2',
    type: 'build',
    difficulty: 'easy',
    instruction: 'Build this sentence:',
    target: { maori: 'Ko ngā ngeru', english: 'The cats' },
    pattern: ['Ko', 'ngā', 'noun'],
    requiredCards: ['p_ko', 'art_nga', 'n_ngeru']
  },
  {
    id: 'c_1_2_1',
    type: 'build',
    difficulty: 'easy',
    instruction: 'Build: A house',
    target: { maori: 'He whare', english: 'A house' },
    pattern: ['He', 'noun'],
    requiredCards: ['p_he', 'n_whare']
  },
  {
    id: 'c_1_4_1',
    type: 'build',
    difficulty: 'medium',
    instruction: 'Build: I am the teacher',
    target: { maori: 'Ko au te kaiako', english: 'I am the teacher' },
    pattern: ['Ko', 'pronoun', 'te', 'noun'],
    requiredCards: ['p_ko', 'pr_au', 'art_te', 'n_kaiako']
  },
  // Module 2 challenges
  {
    id: 'c_2_1_1',
    type: 'build',
    difficulty: 'easy',
    instruction: 'Build: I am good',
    target: { maori: 'Kei te pai au', english: 'I am good' },
    pattern: ['Kei te', 'adjective', 'pronoun'],
    requiredCards: ['tm_keite', 'adj_pai', 'pr_au']
  },
  {
    id: 'c_2_1_2',
    type: 'build',
    difficulty: 'easy',
    instruction: 'Build: You are happy',
    target: { maori: 'Kei te harikoa koe', english: 'You are happy' },
    pattern: ['Kei te', 'adjective', 'pronoun'],
    requiredCards: ['tm_keite', 'adj_harikoa', 'pr_koe']
  },
  {
    id: 'c_2_2_1',
    type: 'build',
    difficulty: 'medium',
    instruction: 'Build: I am very good',
    target: { maori: 'Kei te tino pai au', english: 'I am very good' },
    pattern: ['Kei te', 'intensifier', 'adjective', 'pronoun'],
    requiredCards: ['tm_keite', 'int_tino', 'adj_pai', 'pr_au']
  },
  {
    id: 'c_2_3_1',
    type: 'build',
    difficulty: 'hard',
    instruction: 'Build: I am living in Auckland',
    target: { maori: 'Kei te noho au i Tāmaki Makaurau', english: 'I am living in Auckland' },
    pattern: ['Kei te', 'verb', 'pronoun', 'locative', 'location'],
    requiredCards: ['tm_keite', 'v_noho', 'pr_au', 'pl_i', 'n_tamaki']
  }
];

// Helper functions
export function getModuleById(id: string): Module | undefined {
  return CURRICULUM.find(m => m.id === id);
}

export function getLessonById(lessonId: string): Lesson | undefined {
  for (const module of CURRICULUM) {
    const lesson = module.lessons.find(l => l.id === lessonId);
    if (lesson) return lesson;
  }
  return undefined;
}

export function getChallengeById(challengeId: string): Challenge | undefined {
  return SAMPLE_CHALLENGES.find(c => c.id === challengeId);
}

/**
 * Get all challenges for a specific lesson
 * Matches challenges by lesson ID pattern (e.g., lesson_1_1 -> c_1_1_*)
 */
export function getChallengesForLesson(lessonId: string): Challenge[] {
  // Extract lesson number pattern from lesson ID (e.g., "lesson_1_1" -> "1_1")
  const lessonPattern = lessonId.replace('lesson_', '');
  const challengePrefix = `c_${lessonPattern}_`;

  return SAMPLE_CHALLENGES.filter(c => c.id.startsWith(challengePrefix));
}

/**
 * Get the next lesson in sequence
 */
export function getNextLesson(currentLessonId: string): Lesson | undefined {
  const currentLesson = getLessonById(currentLessonId);
  if (!currentLesson) return undefined;

  const module = getModuleById(currentLesson.module_id);
  if (!module) return undefined;

  const sortedLessons = [...module.lessons].sort((a, b) => a.order_index - b.order_index);
  const currentIndex = sortedLessons.findIndex(l => l.id === currentLessonId);

  if (currentIndex === -1 || currentIndex === sortedLessons.length - 1) {
    return undefined; // Last lesson in module
  }

  return sortedLessons[currentIndex + 1];
}

/**
 * Get the previous lesson in sequence
 */
export function getPreviousLesson(currentLessonId: string): Lesson | undefined {
  const currentLesson = getLessonById(currentLessonId);
  if (!currentLesson) return undefined;

  const module = getModuleById(currentLesson.module_id);
  if (!module) return undefined;

  const sortedLessons = [...module.lessons].sort((a, b) => a.order_index - b.order_index);
  const currentIndex = sortedLessons.findIndex(l => l.id === currentLessonId);

  if (currentIndex <= 0) {
    return undefined; // First lesson in module
  }

  return sortedLessons[currentIndex - 1];
}

export default {
  CURRICULUM,
  MODULE_1,
  MODULE_2,
  SAMPLE_CHALLENGES,
  getModuleById,
  getLessonById,
  getChallengeById,
  getChallengesForLesson,
  getNextLesson,
  getPreviousLesson
};
