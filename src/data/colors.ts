// Card colors for different word types
export const CARD_COLORS = {
  purple: '#8A2BE2',    // Particles (Ko, He, Kei te) - BlueViolet
  gray: '#6B7280',      // Articles (te, ngā)
  blue: '#0000FF',      // Nouns - Pure Blue
  green: '#00FF00',     // Verbs - Pure Green
  red: '#FF0000',       // Pronouns - Pure Red
  orange: '#FFA500',    // Demonstratives, prepositions - Pure Orange
  yellow: '#FFD700'     // Tense markers (gold)
} as const;

export type CardColor = keyof typeof CARD_COLORS;
