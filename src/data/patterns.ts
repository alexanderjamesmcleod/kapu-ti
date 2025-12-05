// Sentence patterns
export const PATTERNS = {
  KO_SIMPLE: ['Ko', 'article', 'noun'],
  KO_DEMONSTRATIVE: ['Ko', 'article', 'noun', 'demonstrative'],
  EQUATIVE: ['Ko', 'pronoun', 'article', 'noun'],
  HE_CLASSIFICATION: ['He', 'noun', 'pronoun'],
  KEI_TE: ['Kei te', 'verb', 'pronoun']
} as const;

export type PatternKey = keyof typeof PATTERNS;
