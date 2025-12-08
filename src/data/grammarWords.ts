/**
 * Essential Grammar Words for Te Reo Māori
 *
 * These are fundamental grammatical particles, articles, and function words
 * that are essential for sentence construction but may not be in the main
 * scraped vocabulary.
 *
 * These words are manually curated to ensure the game has all necessary
 * building blocks for proper Te Reo sentences.
 */

export interface GrammarWord {
  word: string;
  english: string;
  partOfSpeech: string;
  color: string;
  category: string;
  usage?: string;
  examples?: string[];
}

/**
 * Particles (purple) - Sentence markers and prepositions
 * These introduce or mark different types of sentences
 */
export const PARTICLES: GrammarWord[] = [
  {
    word: 'ko',
    english: 'definite particle (THE)',
    partOfSpeech: 'particle',
    color: 'purple',
    category: 'grammar',
    usage: 'Points to specific things - introduces definite statements',
    examples: ['Ko te whare (THE house)', 'Ko ia (It is him/her)'],
  },
  {
    word: 'he',
    english: 'indefinite particle (A/AN)',
    partOfSpeech: 'particle',
    color: 'purple',
    category: 'grammar',
    usage: 'Classifies things - introduces indefinite statements',
    examples: ['He kaiako ia (He/she is A teacher)', 'He pai (It is good)'],
  },
  {
    word: 'kei',
    english: 'at, in (location marker)',
    partOfSpeech: 'particle',
    color: 'purple',
    category: 'grammar',
    usage: 'Indicates current location',
    examples: ['Kei hea? (Where is?)'],
  },
  {
    word: 'i',
    english: 'at, in, object marker, past tense',
    partOfSpeech: 'particle',
    color: 'purple',
    category: 'grammar',
    usage: 'Multiple uses: past tense marker, object marker, location',
    examples: ['I kai au (I ate)', 'i te whare (at the house)'],
  },
  {
    word: 'ki',
    english: 'to, towards',
    partOfSpeech: 'particle',
    color: 'purple',
    category: 'grammar',
    usage: 'Indicates direction or destination',
    examples: ['ki te kura (to school)'],
  },
  {
    word: 'mā',
    english: 'for (intended for)',
    partOfSpeech: 'particle',
    color: 'purple',
    category: 'grammar',
    usage: 'Indicates something is for someone',
    examples: ['mā koe (for you)'],
  },
  {
    word: 'mō',
    english: 'for, about, concerning',
    partOfSpeech: 'particle',
    color: 'purple',
    category: 'grammar',
    usage: 'Indicates purpose or topic',
    examples: ['mō te kai (for the food, about the food)'],
  },
  {
    word: 'nā',
    english: 'by, belonging to (agent marker)',
    partOfSpeech: 'particle',
    color: 'purple',
    category: 'grammar',
    usage: 'Indicates possession or agency',
    examples: ['nā au (by me, mine)'],
  },
  {
    word: 'nō',
    english: 'from, belonging to',
    partOfSpeech: 'particle',
    color: 'purple',
    category: 'grammar',
    usage: 'Indicates origin or possession',
    examples: ['nō Aotearoa (from New Zealand)'],
  },
  {
    word: 'e',
    english: 'particle (various uses)',
    partOfSpeech: 'particle',
    color: 'purple',
    category: 'grammar',
    usage: 'Used with numbers 2-9, in e...ana construction',
    examples: ['e rua (two)', 'e kai ana (eating)'],
  },
];

/**
 * Articles (gray) - Determiners
 * Define whether nouns are singular/plural and definite
 */
export const ARTICLES: GrammarWord[] = [
  {
    word: 'te',
    english: 'the (singular)',
    partOfSpeech: 'article',
    color: 'gray',
    category: 'grammar',
    usage: 'Singular definite article',
    examples: ['te whare (the house)', 'te kai (the food)'],
  },
  {
    word: 'ngā',
    english: 'the (plural)',
    partOfSpeech: 'article',
    color: 'gray',
    category: 'grammar',
    usage: 'Plural definite article',
    examples: ['ngā whare (the houses)', 'ngā tamariki (the children)'],
  },
  {
    word: 'a',
    english: 'of (a-class possession)',
    partOfSpeech: 'article',
    color: 'gray',
    category: 'grammar',
    usage: 'Possessive article for a-class items (acquired/controlled)',
    examples: ['taku pukapuka (my book)', 'tana kuri (his/her dog)'],
  },
  {
    word: 'o',
    english: 'of (o-class possession)',
    partOfSpeech: 'article',
    color: 'gray',
    category: 'grammar',
    usage: 'Possessive article for o-class items (inherent/uncontrolled)',
    examples: ['toku whaea (my mother)', 'tona ingoa (his/her name)'],
  },
];

/**
 * Pronouns (red) - Personal pronouns
 * Te Reo has inclusive/exclusive distinctions
 */
export const PRONOUNS: GrammarWord[] = [
  {
    word: 'au',
    english: 'I, me',
    partOfSpeech: 'pronoun',
    color: 'red',
    category: 'grammar',
    usage: 'First person singular',
    examples: ['Ko au (It is me)'],
  },
  {
    word: 'koe',
    english: 'you (singular)',
    partOfSpeech: 'pronoun',
    color: 'red',
    category: 'grammar',
    usage: 'Second person singular',
    examples: ['Ko koe (It is you)'],
  },
  {
    word: 'ia',
    english: 'he, she, it',
    partOfSpeech: 'pronoun',
    color: 'red',
    category: 'grammar',
    usage: 'Third person singular (gender neutral)',
    examples: ['Ko ia (It is him/her)'],
  },
  {
    word: 'māua',
    english: 'we two (exclusive)',
    partOfSpeech: 'pronoun',
    color: 'red',
    category: 'grammar',
    usage: 'First person dual, excluding listener',
    examples: ['Ko māua (It is us two - not you)'],
  },
  {
    word: 'tāua',
    english: 'we two (inclusive)',
    partOfSpeech: 'pronoun',
    color: 'red',
    category: 'grammar',
    usage: 'First person dual, including listener',
    examples: ['Ko tāua (It is us two - you and me)'],
  },
  {
    word: 'kōrua',
    english: 'you two',
    partOfSpeech: 'pronoun',
    color: 'red',
    category: 'grammar',
    usage: 'Second person dual',
    examples: ['Ko kōrua (It is you two)'],
  },
  {
    word: 'rāua',
    english: 'they two',
    partOfSpeech: 'pronoun',
    color: 'red',
    category: 'grammar',
    usage: 'Third person dual',
    examples: ['Ko rāua (It is those two)'],
  },
  {
    word: 'mātou',
    english: 'we (exclusive)',
    partOfSpeech: 'pronoun',
    color: 'red',
    category: 'grammar',
    usage: 'First person plural, excluding listener',
    examples: ['Ko mātou (It is us - not you)'],
  },
  {
    word: 'tātou',
    english: 'we (inclusive)',
    partOfSpeech: 'pronoun',
    color: 'red',
    category: 'grammar',
    usage: 'First person plural, including listener',
    examples: ['Ko tātou (It is all of us - including you)'],
  },
  {
    word: 'koutou',
    english: 'you (plural)',
    partOfSpeech: 'pronoun',
    color: 'red',
    category: 'grammar',
    usage: 'Second person plural',
    examples: ['Ko koutou (It is you all)'],
  },
  {
    word: 'rātou',
    english: 'they, them',
    partOfSpeech: 'pronoun',
    color: 'red',
    category: 'grammar',
    usage: 'Third person plural',
    examples: ['Ko rātou (It is them)'],
  },
];

/**
 * Tense Markers (yellow) - Indicate when actions happen
 * Te Reo verbs don't conjugate - tense markers do the work
 */
export const TENSE_MARKERS: GrammarWord[] = [
  {
    word: 'kei te',
    english: 'present continuous',
    partOfSpeech: 'tense_marker',
    color: 'yellow',
    category: 'grammar',
    usage: 'Indicates action happening RIGHT NOW',
    examples: ['Kei te kai au (I am eating)'],
  },
  {
    word: 'ka',
    english: 'will, future tense',
    partOfSpeech: 'tense_marker',
    color: 'yellow',
    category: 'grammar',
    usage: 'Indicates future action',
    examples: ['Ka kai au (I will eat)'],
  },
  {
    word: 'kua',
    english: 'have, perfect tense',
    partOfSpeech: 'tense_marker',
    color: 'yellow',
    category: 'grammar',
    usage: 'Indicates completed action with present relevance',
    examples: ['Kua kai au (I have eaten)'],
  },
  {
    word: 'i te',
    english: 'was/were (past continuous)',
    partOfSpeech: 'tense_marker',
    color: 'yellow',
    category: 'grammar',
    usage: 'Past continuous tense',
    examples: ['I te kai au (I was eating)'],
  },
  {
    word: 'me',
    english: 'should, ought to',
    partOfSpeech: 'tense_marker',
    color: 'yellow',
    category: 'grammar',
    usage: 'Indicates obligation or suggestion',
    examples: ['Me kai koe (You should eat)'],
  },
];

/**
 * Demonstratives (orange) - This/that/these/those
 * Distance-based system: near speaker, near listener, far from both
 */
export const DEMONSTRATIVES: GrammarWord[] = [
  {
    word: 'tēnei',
    english: 'this (near speaker)',
    partOfSpeech: 'demonstrative',
    color: 'orange',
    category: 'grammar',
    usage: 'Singular, near speaker',
    examples: ['tēnei whare (this house here)'],
  },
  {
    word: 'tēnā',
    english: 'that (near listener)',
    partOfSpeech: 'demonstrative',
    color: 'orange',
    category: 'grammar',
    usage: 'Singular, near listener',
    examples: ['tēnā whare (that house near you)'],
  },
  {
    word: 'tērā',
    english: 'that (far from both)',
    partOfSpeech: 'demonstrative',
    color: 'orange',
    category: 'grammar',
    usage: 'Singular, away from both',
    examples: ['tērā whare (that house over there)'],
  },
  {
    word: 'ēnei',
    english: 'these (near speaker)',
    partOfSpeech: 'demonstrative',
    color: 'orange',
    category: 'grammar',
    usage: 'Plural, near speaker',
    examples: ['ēnei whare (these houses here)'],
  },
  {
    word: 'ēnā',
    english: 'those (near listener)',
    partOfSpeech: 'demonstrative',
    color: 'orange',
    category: 'grammar',
    usage: 'Plural, near listener',
    examples: ['ēnā whare (those houses near you)'],
  },
  {
    word: 'ērā',
    english: 'those (far from both)',
    partOfSpeech: 'demonstrative',
    color: 'orange',
    category: 'grammar',
    usage: 'Plural, away from both',
    examples: ['ērā whare (those houses over there)'],
  },
];

/**
 * Locatives (brown) - Directional/positional words
 */
export const LOCATIVES: GrammarWord[] = [
  {
    word: 'runga',
    english: 'above, on top',
    partOfSpeech: 'locative',
    color: 'brown',
    category: 'location',
    usage: 'Indicates position above',
    examples: ['ki runga (upwards)', 'i runga (on top)'],
  },
  {
    word: 'raro',
    english: 'below, under',
    partOfSpeech: 'locative',
    color: 'brown',
    category: 'location',
    usage: 'Indicates position below',
    examples: ['ki raro (downwards)', 'i raro (underneath)'],
  },
  {
    word: 'roto',
    english: 'inside',
    partOfSpeech: 'locative',
    color: 'brown',
    category: 'location',
    usage: 'Indicates inside',
    examples: ['ki roto (inside)', 'i roto (in)'],
  },
  {
    word: 'waho',
    english: 'outside',
    partOfSpeech: 'locative',
    color: 'brown',
    category: 'location',
    usage: 'Indicates outside',
    examples: ['ki waho (outside)', 'i waho (out)'],
  },
  {
    word: 'mua',
    english: 'front, before',
    partOfSpeech: 'locative',
    color: 'brown',
    category: 'location',
    usage: 'Indicates front or before',
    examples: ['ki mua (forwards)', 'i mua (in front)'],
  },
  {
    word: 'muri',
    english: 'back, behind, after',
    partOfSpeech: 'locative',
    color: 'brown',
    category: 'location',
    usage: 'Indicates back or behind',
    examples: ['ki muri (backwards)', 'i muri (behind)'],
  },
];

/**
 * All grammar words combined
 */
export const ALL_GRAMMAR_WORDS: GrammarWord[] = [
  ...PARTICLES,
  ...ARTICLES,
  ...PRONOUNS,
  ...TENSE_MARKERS,
  ...DEMONSTRATIVES,
  ...LOCATIVES,
];

/**
 * Export counts for reference
 */
export const GRAMMAR_WORD_COUNTS = {
  particles: PARTICLES.length,
  articles: ARTICLES.length,
  pronouns: PRONOUNS.length,
  tenseMarkers: TENSE_MARKERS.length,
  demonstratives: DEMONSTRATIVES.length,
  locatives: LOCATIVES.length,
  total: ALL_GRAMMAR_WORDS.length,
};
