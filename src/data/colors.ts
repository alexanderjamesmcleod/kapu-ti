// Card colors for different word types
export const CARD_COLORS = {
  purple: '#9333EA',    // Particles (Ko, He, Kei te)
  gray: '#6B7280',      // Articles (te, ngā)
  blue: '#3B82F6',      // Nouns
  green: '#10B981',     // Verbs
  red: '#EF4444',       // Pronouns
  orange: '#F59E0B',    // Demonstratives, prepositions
  yellow: '#EAB308'     // Tense markers
} as const;

export type CardColor = keyof typeof CARD_COLORS;
