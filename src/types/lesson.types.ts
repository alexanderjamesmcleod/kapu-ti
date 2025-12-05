/**
 * Lesson and Curriculum Types
 * Aligned with Supabase schema
 */

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
  availableCards?: string[]; // For free build
  hints?: Array<{
    trigger: string;
    message: string;
  }>;
}

export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  description: string;
  order_index: number;
  lesson_type: 'tutorial' | 'practice' | 'challenge' | 'test';
  grammar?: {
    structure: string;
    pattern: string[];
    explanation: string;
    tips: string[];
  };
  vocabulary_introduced?: string[]; // Word IDs
}

export interface Module {
  id: string;
  title: string;
  description: string;
  order_index: number;
  lessons: Lesson[];
}
