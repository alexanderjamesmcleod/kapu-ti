// Card and validation types for validators

export interface Card {
  id: string;
  maori: string;
  english: string;
  type: string;
  color: string;
  [key: string]: string | number | boolean | undefined; // Allow additional properties
}

// Validator-specific challenge input (simpler than full Challenge from lesson.types)
// Validators import this directly from validation.types.ts to avoid conflicts
export interface ValidatorChallenge {
  id: string;
  instruction: string;
  pattern: string[];
  target?: {
    maori: string;
    english: string;
  };
  requiredWords?: string[];
  hints?: string[];
}

// Alias for backward compatibility with existing validators
export type Challenge = ValidatorChallenge;

export interface ValidationFeedback {
  type: 'success' | 'warning' | 'error';
  message: string;
  hint?: string;
  explanation?: string;
  naturalness?: string;
}

export interface WordBreakdown {
  word: string;
  role: string;
  meaning: string;
}

export interface ValidationResult {
  valid: boolean;
  correct: boolean;
  feedback: ValidationFeedback;
  translation: string;
  breakdown: WordBreakdown[];
}
