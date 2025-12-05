// Placeholder for types

// User types
export * from './user.types';

// Progress types
export * from './progress.types';

// Game types
export * from './game.types';

// Lesson types - primary Challenge type for app
export type { Challenge, Lesson, Module } from './lesson.types';

// Validation types - validators import directly from './types/validation.types'
// Not re-exported here to avoid Challenge name conflict
// (ValidatorChallenge can be imported directly if needed)
export type {
  Card,
  ValidationFeedback,
  WordBreakdown,
  ValidationResult
} from './validation.types';
