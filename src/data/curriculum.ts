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
// Following the 12 Guidelines: Start simple, everyday contexts, natural Māori
export const SAMPLE_CHALLENGES: Challenge[] = [
  // ============================================================================
  // MODULE 1: Ko/He Sentences - Progressive Difficulty
  // ============================================================================

  // --- EASY: 2-card He sentences (classification) ---
  {
    id: 'c_he_house',
    type: 'build',
    difficulty: 'easy',
    instruction: 'Build: A house',
    target: { maori: 'He whare', english: 'A house' },
    pattern: ['He', 'noun'],
    requiredCards: ['p_he', 'n_whare']
  },
  {
    id: 'c_he_cat',
    type: 'build',
    difficulty: 'easy',
    instruction: 'Build: A cat',
    target: { maori: 'He ngeru', english: 'A cat' },
    pattern: ['He', 'noun'],
    requiredCards: ['p_he', 'n_ngeru']
  },
  {
    id: 'c_he_dog',
    type: 'build',
    difficulty: 'easy',
    instruction: 'Build: A dog',
    target: { maori: 'He kuri', english: 'A dog' },
    pattern: ['He', 'noun'],
    requiredCards: ['p_he', 'n_kuri']
  },
  {
    id: 'c_he_teacher',
    type: 'build',
    difficulty: 'easy',
    instruction: 'Build: A teacher',
    target: { maori: 'He kaiako', english: 'A teacher' },
    pattern: ['He', 'noun'],
    requiredCards: ['p_he', 'n_kaiako']
  },
  {
    id: 'c_he_child',
    type: 'build',
    difficulty: 'easy',
    instruction: 'Build: A child',
    target: { maori: 'He tamaiti', english: 'A child' },
    pattern: ['He', 'noun'],
    requiredCards: ['p_he', 'n_tamaiti']
  },
  {
    id: 'c_he_student',
    type: 'build',
    difficulty: 'easy',
    instruction: 'Build: A student',
    target: { maori: 'He tauira', english: 'A student' },
    pattern: ['He', 'noun'],
    requiredCards: ['p_he', 'n_tauira']
  },
  {
    id: 'c_he_bird',
    type: 'build',
    difficulty: 'easy',
    instruction: 'Build: A bird',
    target: { maori: 'He manu', english: 'A bird' },
    pattern: ['He', 'noun'],
    requiredCards: ['p_he', 'n_manu']
  },

  // --- EASY: 3-card Ko sentences (specific things) ---
  {
    id: 'c_ko_house',
    type: 'build',
    difficulty: 'easy',
    instruction: 'Build: The house',
    target: { maori: 'Ko te whare', english: 'The house' },
    pattern: ['Ko', 'te', 'noun'],
    requiredCards: ['p_ko', 'art_te', 'n_whare']
  },
  {
    id: 'c_ko_cat',
    type: 'build',
    difficulty: 'easy',
    instruction: 'Build: The cat',
    target: { maori: 'Ko te ngeru', english: 'The cat' },
    pattern: ['Ko', 'te', 'noun'],
    requiredCards: ['p_ko', 'art_te', 'n_ngeru']
  },
  {
    id: 'c_ko_dog',
    type: 'build',
    difficulty: 'easy',
    instruction: 'Build: The dog',
    target: { maori: 'Ko te kuri', english: 'The dog' },
    pattern: ['Ko', 'te', 'noun'],
    requiredCards: ['p_ko', 'art_te', 'n_kuri']
  },
  {
    id: 'c_ko_teacher',
    type: 'build',
    difficulty: 'easy',
    instruction: 'Build: The teacher',
    target: { maori: 'Ko te kaiako', english: 'The teacher' },
    pattern: ['Ko', 'te', 'noun'],
    requiredCards: ['p_ko', 'art_te', 'n_kaiako']
  },
  {
    id: 'c_ko_child',
    type: 'build',
    difficulty: 'easy',
    instruction: 'Build: The child',
    target: { maori: 'Ko te tamaiti', english: 'The child' },
    pattern: ['Ko', 'te', 'noun'],
    requiredCards: ['p_ko', 'art_te', 'n_tamaiti']
  },

  // --- MEDIUM: 3-card Ko sentences with plural ---
  {
    id: 'c_ko_cats',
    type: 'build',
    difficulty: 'medium',
    instruction: 'Build: The cats',
    target: { maori: 'Ko ngā ngeru', english: 'The cats' },
    pattern: ['Ko', 'ngā', 'noun'],
    requiredCards: ['p_ko', 'art_nga', 'n_ngeru']
  },
  {
    id: 'c_ko_dogs',
    type: 'build',
    difficulty: 'medium',
    instruction: 'Build: The dogs',
    target: { maori: 'Ko ngā kuri', english: 'The dogs' },
    pattern: ['Ko', 'ngā', 'noun'],
    requiredCards: ['p_ko', 'art_nga', 'n_kuri']
  },
  {
    id: 'c_ko_children',
    type: 'build',
    difficulty: 'medium',
    instruction: 'Build: The children',
    target: { maori: 'Ko ngā tamariki', english: 'The children' },
    pattern: ['Ko', 'ngā', 'noun'],
    requiredCards: ['p_ko', 'art_nga', 'n_tamariki']
  },
  {
    id: 'c_ko_birds',
    type: 'build',
    difficulty: 'medium',
    instruction: 'Build: The birds',
    target: { maori: 'Ko ngā manu', english: 'The birds' },
    pattern: ['Ko', 'ngā', 'noun'],
    requiredCards: ['p_ko', 'art_nga', 'n_manu']
  },

  // --- MEDIUM: 4-card Equative sentences (identity) ---
  {
    id: 'c_equative_i_teacher',
    type: 'build',
    difficulty: 'medium',
    instruction: 'Build: I am the teacher',
    target: { maori: 'Ko au te kaiako', english: 'I am the teacher' },
    pattern: ['Ko', 'pronoun', 'te', 'noun'],
    requiredCards: ['p_ko', 'pr_au', 'art_te', 'n_kaiako']
  },
  {
    id: 'c_equative_you_student',
    type: 'build',
    difficulty: 'medium',
    instruction: 'Build: You are the student',
    target: { maori: 'Ko koe te tauira', english: 'You are the student' },
    pattern: ['Ko', 'pronoun', 'te', 'noun'],
    requiredCards: ['p_ko', 'pr_koe', 'art_te', 'n_tauira']
  },
  {
    id: 'c_equative_she_teacher',
    type: 'build',
    difficulty: 'medium',
    instruction: 'Build: He/she is the teacher',
    target: { maori: 'Ko ia te kaiako', english: 'He/she is the teacher' },
    pattern: ['Ko', 'pronoun', 'te', 'noun'],
    requiredCards: ['p_ko', 'pr_ia', 'art_te', 'n_kaiako']
  },

  // ============================================================================
  // MODULE 2: Kei te (Present Tense) - Feelings & Actions
  // ============================================================================

  // --- EASY: 3-card Feelings (everyday contexts!) ---
  {
    id: 'c_keite_i_good',
    type: 'build',
    difficulty: 'easy',
    instruction: 'Build: I am good',
    target: { maori: 'Kei te pai au', english: 'I am good' },
    pattern: ['Kei te', 'adjective', 'pronoun'],
    requiredCards: ['tm_keite', 'adj_pai', 'pr_au']
  },
  {
    id: 'c_keite_you_happy',
    type: 'build',
    difficulty: 'easy',
    instruction: 'Build: You are happy',
    target: { maori: 'Kei te harikoa koe', english: 'You are happy' },
    pattern: ['Kei te', 'adjective', 'pronoun'],
    requiredCards: ['tm_keite', 'adj_harikoa', 'pr_koe']
  },
  {
    id: 'c_keite_she_sad',
    type: 'build',
    difficulty: 'easy',
    instruction: 'Build: He/she is sad',
    target: { maori: 'Kei te pōuri ia', english: 'He/she is sad' },
    pattern: ['Kei te', 'adjective', 'pronoun'],
    requiredCards: ['tm_keite', 'adj_pouri', 'pr_ia']
  },
  {
    id: 'c_keite_i_tired',
    type: 'build',
    difficulty: 'easy',
    instruction: 'Build: I am tired',
    target: { maori: 'Kei te ngenge au', english: 'I am tired' },
    pattern: ['Kei te', 'adjective', 'pronoun'],
    requiredCards: ['tm_keite', 'adj_ngenge', 'pr_au']
  },
  {
    id: 'c_keite_you_angry',
    type: 'build',
    difficulty: 'easy',
    instruction: 'Build: You are angry',
    target: { maori: 'Kei te riri koe', english: 'You are angry' },
    pattern: ['Kei te', 'adjective', 'pronoun'],
    requiredCards: ['tm_keite', 'adj_riri', 'pr_koe']
  },
  {
    id: 'c_keite_i_well',
    type: 'build',
    difficulty: 'easy',
    instruction: 'Build: I am well',
    target: { maori: 'Kei te ora au', english: 'I am well' },
    pattern: ['Kei te', 'adjective', 'pronoun'],
    requiredCards: ['tm_keite', 'adj_ora', 'pr_au']
  },
  {
    id: 'c_keite_i_hungry',
    type: 'build',
    difficulty: 'easy',
    instruction: 'Build: I am hungry',
    target: { maori: 'Kei te matekai au', english: 'I am hungry' },
    pattern: ['Kei te', 'adjective', 'pronoun'],
    requiredCards: ['tm_keite', 'adj_matekai', 'pr_au']
  },
  {
    id: 'c_keite_you_thirsty',
    type: 'build',
    difficulty: 'easy',
    instruction: 'Build: You are thirsty',
    target: { maori: 'Kei te hiainu koe', english: 'You are thirsty' },
    pattern: ['Kei te', 'adjective', 'pronoun'],
    requiredCards: ['tm_keite', 'adj_hiainu', 'pr_koe']
  },
  {
    id: 'c_keite_i_sleepy',
    type: 'build',
    difficulty: 'easy',
    instruction: 'Build: I am sleepy',
    target: { maori: 'Kei te hiamoe au', english: 'I am sleepy' },
    pattern: ['Kei te', 'adjective', 'pronoun'],
    requiredCards: ['tm_keite', 'adj_hiamoe', 'pr_au']
  },
  {
    id: 'c_keite_she_sick',
    type: 'build',
    difficulty: 'easy',
    instruction: 'Build: He/she is sick',
    target: { maori: 'Kei te māuiui ia', english: 'He/she is sick' },
    pattern: ['Kei te', 'adjective', 'pronoun'],
    requiredCards: ['tm_keite', 'adj_mauiui', 'pr_ia']
  },

  // --- EASY: 3-card Actions ---
  {
    id: 'c_keite_i_going',
    type: 'build',
    difficulty: 'easy',
    instruction: 'Build: I am going',
    target: { maori: 'Kei te haere au', english: 'I am going' },
    pattern: ['Kei te', 'verb', 'pronoun'],
    requiredCards: ['tm_keite', 'v_haere', 'pr_au']
  },
  {
    id: 'c_keite_i_eating',
    type: 'build',
    difficulty: 'easy',
    instruction: 'Build: I am eating',
    target: { maori: 'Kei te kai au', english: 'I am eating' },
    pattern: ['Kei te', 'verb', 'pronoun'],
    requiredCards: ['tm_keite', 'v_kai', 'pr_au']
  },
  {
    id: 'c_keite_she_running',
    type: 'build',
    difficulty: 'easy',
    instruction: 'Build: He/she is running',
    target: { maori: 'Kei te oma ia', english: 'He/she is running' },
    pattern: ['Kei te', 'verb', 'pronoun'],
    requiredCards: ['tm_keite', 'v_oma', 'pr_ia']
  },
  {
    id: 'c_keite_i_working',
    type: 'build',
    difficulty: 'easy',
    instruction: 'Build: I am working',
    target: { maori: 'Kei te mahi au', english: 'I am working' },
    pattern: ['Kei te', 'verb', 'pronoun'],
    requiredCards: ['tm_keite', 'v_mahi', 'pr_au']
  },
  {
    id: 'c_keite_i_learning',
    type: 'build',
    difficulty: 'easy',
    instruction: 'Build: I am learning',
    target: { maori: 'Kei te ako au', english: 'I am learning' },
    pattern: ['Kei te', 'verb', 'pronoun'],
    requiredCards: ['tm_keite', 'v_ako', 'pr_au']
  },
  {
    id: 'c_keite_she_resting',
    type: 'build',
    difficulty: 'easy',
    instruction: 'Build: He/she is resting',
    target: { maori: 'Kei te māhaki ia', english: 'He/she is resting' },
    pattern: ['Kei te', 'verb', 'pronoun'],
    requiredCards: ['tm_keite', 'v_mahaki', 'pr_ia']
  },

  // --- MEDIUM: 4-card with Intensifiers ---
  {
    id: 'c_keite_i_very_good',
    type: 'build',
    difficulty: 'medium',
    instruction: 'Build: I am very good',
    target: { maori: 'Kei te tino pai au', english: 'I am very good' },
    pattern: ['Kei te', 'intensifier', 'adjective', 'pronoun'],
    requiredCards: ['tm_keite', 'int_tino', 'adj_pai', 'pr_au']
  },
  {
    id: 'c_keite_you_very_happy',
    type: 'build',
    difficulty: 'medium',
    instruction: 'Build: You are very happy',
    target: { maori: 'Kei te tino harikoa koe', english: 'You are very happy' },
    pattern: ['Kei te', 'intensifier', 'adjective', 'pronoun'],
    requiredCards: ['tm_keite', 'int_tino', 'adj_harikoa', 'pr_koe']
  },
  {
    id: 'c_keite_i_somewhat_tired',
    type: 'build',
    difficulty: 'medium',
    instruction: 'Build: I am somewhat tired',
    target: { maori: 'Kei te āhua ngenge au', english: 'I am somewhat tired' },
    pattern: ['Kei te', 'intensifier', 'adjective', 'pronoun'],
    requiredCards: ['tm_keite', 'int_ahua', 'adj_ngenge', 'pr_au']
  },
  {
    id: 'c_keite_she_very_sad',
    type: 'build',
    difficulty: 'medium',
    instruction: 'Build: He/she is very sad',
    target: { maori: 'Kei te tino pōuri ia', english: 'He/she is very sad' },
    pattern: ['Kei te', 'intensifier', 'adjective', 'pronoun'],
    requiredCards: ['tm_keite', 'int_tino', 'adj_pouri', 'pr_ia']
  },
  {
    id: 'c_keite_i_very_hungry',
    type: 'build',
    difficulty: 'medium',
    instruction: 'Build: I am very hungry',
    target: { maori: 'Kei te tino matekai au', english: 'I am very hungry' },
    pattern: ['Kei te', 'intensifier', 'adjective', 'pronoun'],
    requiredCards: ['tm_keite', 'int_tino', 'adj_matekai', 'pr_au']
  },
  {
    id: 'c_keite_you_somewhat_sick',
    type: 'build',
    difficulty: 'medium',
    instruction: 'Build: You are somewhat sick',
    target: { maori: 'Kei te āhua māuiui koe', english: 'You are somewhat sick' },
    pattern: ['Kei te', 'intensifier', 'adjective', 'pronoun'],
    requiredCards: ['tm_keite', 'int_ahua', 'adj_mauiui', 'pr_koe']
  },

  // --- HARD: 5-card with Locations (ki = to) ---
  {
    id: 'c_keite_going_school',
    type: 'build',
    difficulty: 'hard',
    instruction: 'Build: I am going to school',
    target: { maori: 'Kei te haere au ki te kura', english: 'I am going to school' },
    pattern: ['Kei te', 'verb', 'pronoun', 'locative', 'noun'],
    requiredCards: ['tm_keite', 'v_haere', 'pr_au', 'pl_ki', 'n_kura']
  },
  {
    id: 'c_keite_she_going_auckland',
    type: 'build',
    difficulty: 'hard',
    instruction: 'Build: He/she is going to Auckland',
    target: { maori: 'Kei te haere ia ki Tāmaki Makaurau', english: 'He/she is going to Auckland' },
    pattern: ['Kei te', 'verb', 'pronoun', 'locative', 'noun'],
    requiredCards: ['tm_keite', 'v_haere', 'pr_ia', 'pl_ki', 'n_tamaki']
  },

  // --- HARD: 5-card with Locations (i = at/in) ---
  {
    id: 'c_keite_living_auckland',
    type: 'build',
    difficulty: 'hard',
    instruction: 'Build: I am living in Auckland',
    target: { maori: 'Kei te noho au i Tāmaki Makaurau', english: 'I am living in Auckland' },
    pattern: ['Kei te', 'verb', 'pronoun', 'locative', 'noun'],
    requiredCards: ['tm_keite', 'v_noho', 'pr_au', 'pl_i', 'n_tamaki']
  },
  {
    id: 'c_keite_working_school',
    type: 'build',
    difficulty: 'hard',
    instruction: 'Build: I am working at school',
    target: { maori: 'Kei te mahi au i te kura', english: 'I am working at school' },
    pattern: ['Kei te', 'verb', 'pronoun', 'locative', 'noun'],
    requiredCards: ['tm_keite', 'v_mahi', 'pr_au', 'pl_i', 'n_kura']
  },
  {
    id: 'c_keite_learning_school',
    type: 'build',
    difficulty: 'hard',
    instruction: 'Build: I am learning at school',
    target: { maori: 'Kei te ako au i te kura', english: 'I am learning at school' },
    pattern: ['Kei te', 'verb', 'pronoun', 'locative', 'noun'],
    requiredCards: ['tm_keite', 'v_ako', 'pr_au', 'pl_i', 'n_kura']
  },

  // --- MEDIUM: Plural pronouns ---
  {
    id: 'c_keite_we_eating',
    type: 'build',
    difficulty: 'medium',
    instruction: 'Build: We are eating (all of us)',
    target: { maori: 'Kei te kai tātou', english: 'We are eating (all of us)' },
    pattern: ['Kei te', 'verb', 'pronoun'],
    requiredCards: ['tm_keite', 'v_kai', 'pr_tatou']
  },
  {
    id: 'c_keite_they_going',
    type: 'build',
    difficulty: 'medium',
    instruction: 'Build: They are going',
    target: { maori: 'Kei te haere rātou', english: 'They are going' },
    pattern: ['Kei te', 'verb', 'pronoun'],
    requiredCards: ['tm_keite', 'v_haere', 'pr_ratou']
  },
  {
    id: 'c_keite_you_all_happy',
    type: 'build',
    difficulty: 'medium',
    instruction: 'Build: You (all) are happy',
    target: { maori: 'Kei te harikoa koutou', english: 'You (all) are happy' },
    pattern: ['Kei te', 'adjective', 'pronoun'],
    requiredCards: ['tm_keite', 'adj_harikoa', 'pr_koutou']
  },
  {
    id: 'c_keite_we_learning',
    type: 'build',
    difficulty: 'medium',
    instruction: 'Build: We are learning (not you)',
    target: { maori: 'Kei te ako mātou', english: 'We are learning (not you)' },
    pattern: ['Kei te', 'verb', 'pronoun'],
    requiredCards: ['tm_keite', 'v_ako', 'pr_matou']
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
