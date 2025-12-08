/**
 * Vocabulary Classification Script
 *
 * Classifies Māori words by their part of speech and assigns appropriate
 * game colors based on linguistic patterns.
 *
 * Usage:
 *   This script contains classification logic and can be used as reference
 *   for understanding how words are categorized.
 */

interface VocabularyWord {
  word: string;
  english: string;
  isVerb: boolean;
  possession: string | null;
  audioUrl: string | null;
  partOfSpeech?: string;
  verbType?: string;
  category?: string;
  color?: string;
}

/**
 * Māori passive suffixes that indicate transitive verbs
 * These are hints in parentheses like (tia), (hia), (a), etc.
 */
const PASSIVE_PATTERNS = [
  /\(tia\)/,
  /\(hia\)/,
  /\(a\)/,
  /\(ina\)/,
  /\(kia\)/,
  /\(mia\)/,
  /\(na\)/,
  /\(ngia\)/,
  /\(ria\)/,
  /\(whia\)/,
  /\(nga\)/,
];

/**
 * Stative verbs (adjective-like words)
 * These describe qualities and don't take passive forms
 */
const STATIVE_WORDS = [
  'pai', 'reka', 'nui', 'iti', 'roa', 'poto', 'teitei', 'pāpaku',
  'mahana', 'makariri', 'tika', 'reri', 'kī', 'ora',
  'harikoa', 'māuiui', 'ngenge', 'pōuri', 'riri', 'hiamoe',
  'matekai', 'hiainu', 'mā', 'pango', 'whero', 'kākāriki',
  'kōwhai', 'kikorangi', 'kahurangi', 'māwhero', 'waiporoporo',
  'karaka', 'pākākā',
];

/**
 * Particles (sentence markers and prepositions)
 */
const PARTICLES = [
  'ko', 'he', 'kei', 'i', 'ki', 'mā', 'mō', 'nā', 'nō', 'e',
  'kia', 'hei', 'kei te', 'i te',
];

/**
 * Articles
 */
const ARTICLES = ['te', 'ngā', 'a', 'o'];

/**
 * Pronouns
 */
const PRONOUNS = [
  'au', 'koe', 'ia',
  'māua', 'tāua', 'kōrua', 'rāua',
  'mātou', 'tātou', 'koutou', 'rātou',
];

/**
 * Tense markers
 */
const TENSE_MARKERS = [
  'kei te', 'ka', 'i', 'kua', 'e...ana', 'i te', 'me',
];

/**
 * Demonstratives
 */
const DEMONSTRATIVES = [
  'tēnei', 'tēnā', 'tērā',
  'ēnei', 'ēnā', 'ērā',
  'tēnei', 'tēna', 'tēra', 'ēnei', 'ēna', 'ēra',
];

/**
 * Locatives
 */
const LOCATIVES = [
  'runga', 'raro', 'roto', 'waho', 'mua', 'muri',
  'uta', 'tai',
];

/**
 * Time words
 */
const TIME_WORDS = [
  'inanahi', 'āpōpō', 'ināianei', 'ānamata', 'rā', 'wiki',
  // Days of week
  'Rāhina', 'Rātū', 'Rāapa', 'Rāpare', 'Rāmere', 'Rāhoroi', 'Rātapu',
  // Months
  'Kohitātea', 'Huitanguru', 'Poutūterangi', 'Paengawhāwhā',
  'Haratua', 'Pipiri', 'Hōngongoi', 'Hereturikōkā', 'Mahuru',
  'Whiringa-ā-nuku', 'Whiringa-ā-rangi', 'Hakihea',
];

/**
 * Numbers
 */
const NUMBERS = [
  'tahi', 'rua', 'toru', 'whā', 'rima', 'ono', 'whitu', 'waru',
  'iwa', 'tekau', 'rau', 'mano', 'tua-', 'toko-',
];

/**
 * Word type to color mapping
 * Matches the game's color scheme for different word types
 */
export const TYPE_TO_COLOR: Record<string, string> = {
  particle: 'purple',
  article: 'gray',
  noun: 'blue',
  pronoun: 'red',
  verb: 'green',
  stative: 'lightblue',
  tense_marker: 'yellow',
  demonstrative: 'orange',
  intensifier: 'pink',
  locative: 'brown',
  time: 'teal',
  number: 'cyan',
};

/**
 * Cleans a word by removing passive suffix hints
 */
export function cleanWord(word: string): string {
  let cleaned = word;

  // Remove passive suffix patterns
  PASSIVE_PATTERNS.forEach(pattern => {
    cleaned = cleaned.replace(pattern, '');
  });

  // Remove other parenthetical notes
  cleaned = cleaned.replace(/\([^)]*\)/g, '');

  // Trim whitespace
  cleaned = cleaned.trim();

  return cleaned;
}

/**
 * Determines the category/topic for a word based on its English meaning
 */
export function determineCategory(word: VocabularyWord): string {
  const english = word.english.toLowerCase();
  const maori = word.word.toLowerCase();

  // Family/people
  if (english.match(/mother|father|parent|son|daughter|sister|brother|sibling|child|person|elder|friend|wife|husband|niece|nephew|grandparent|ancestor|teacher|student|worker|visitor|people/)) {
    return 'people';
  }

  // Food
  if (english.match(/food|eat|drink|water|sandwich|fruit|vegetable|meat|ice cream|chicken|fish|seafood|breakfast|cup|plate/) || maori.includes('kai')) {
    return 'food';
  }

  // Places
  if (english.match(/house|home|school|beach|island|street|road|area|region|table|chair|bedroom|toilet|television|fridge|office|department|garden/)) {
    return 'places';
  }

  // Animals/nature
  if (english.match(/cat|dog|bird|parrot|spider|fish|chicken|muttonbird/)) {
    return 'animals';
  }

  // Colors
  if (english.match(/white|yellow|orange|black|brown|green|red|pink|purple|blue|clean|colour/)) {
    return 'colors';
  }

  // Body/feelings
  if (english.match(/good|happy|sad|angry|tired|sick|well|sleepy|hungry|thirsty|warm|cold/)) {
    return 'feelings';
  }

  // Actions
  if (english.match(/go|run|sit|work|learn|read|write|swim|play|cook|wash|wake|sleep|look|see|find|listen|sing|walk|dig|grow|plant|call|welcome|greet/)) {
    return 'actions';
  }

  // Māori culture
  if (english.match(/marae|meeting house|carved|protocol|custom|welcome|speech|song|prayer|hongi|tribe|carved house|barge board/)) {
    return 'culture';
  }

  // Time
  if (english.match(/day|week|yesterday|tomorrow|now|future|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|January|February|March|April|May|June|July|August|September|October|November|December/)) {
    return 'time';
  }

  // Numbers
  if (english.match(/one|two|three|four|five|six|seven|eight|nine|ten|hundred|thousand|number|counting/)) {
    return 'numbers';
  }

  return 'general';
}

/**
 * Classifies a word by its part of speech
 */
export function classifyWord(word: VocabularyWord): Partial<VocabularyWord> {
  const cleaned = cleanWord(word.word);
  const lowerWord = cleaned.toLowerCase();
  const english = word.english.toLowerCase();

  // Check for particles
  if (PARTICLES.includes(lowerWord) || PARTICLES.some(p => word.word.includes(p))) {
    return {
      partOfSpeech: 'particle',
      color: TYPE_TO_COLOR.particle,
      category: 'grammar',
    };
  }

  // Check for articles
  if (ARTICLES.includes(lowerWord)) {
    return {
      partOfSpeech: 'article',
      color: TYPE_TO_COLOR.article,
      category: 'grammar',
    };
  }

  // Check for pronouns
  if (PRONOUNS.includes(lowerWord)) {
    return {
      partOfSpeech: 'pronoun',
      color: TYPE_TO_COLOR.pronoun,
      category: 'grammar',
    };
  }

  // Check for tense markers
  if (TENSE_MARKERS.some(tm => lowerWord.includes(tm) || word.word.toLowerCase().includes(tm))) {
    return {
      partOfSpeech: 'tense_marker',
      color: TYPE_TO_COLOR.tense_marker,
      category: 'grammar',
    };
  }

  // Check for demonstratives
  if (DEMONSTRATIVES.includes(lowerWord)) {
    return {
      partOfSpeech: 'demonstrative',
      color: TYPE_TO_COLOR.demonstrative,
      category: 'grammar',
    };
  }

  // Check for locatives
  if (LOCATIVES.includes(lowerWord)) {
    return {
      partOfSpeech: 'locative',
      color: TYPE_TO_COLOR.locative,
      category: 'location',
    };
  }

  // Check for time words
  if (TIME_WORDS.includes(lowerWord) || TIME_WORDS.some(tw => word.word.includes(tw))) {
    return {
      partOfSpeech: 'time',
      color: TYPE_TO_COLOR.time,
      category: 'time',
    };
  }

  // Check for numbers
  if (NUMBERS.includes(lowerWord) || english.match(/^(one|two|three|four|five|six|seven|eight|nine|ten|hundred|thousand)$/)) {
    return {
      partOfSpeech: 'number',
      color: TYPE_TO_COLOR.number,
      category: 'numbers',
    };
  }

  // Check for stative verbs (adjectives)
  if (STATIVE_WORDS.includes(lowerWord)) {
    return {
      partOfSpeech: 'stative',
      color: TYPE_TO_COLOR.stative,
      category: determineCategory(word),
    };
  }

  // Check for verbs with passive suffixes (transitive verbs)
  if (word.isVerb || PASSIVE_PATTERNS.some(pattern => pattern.test(word.word))) {
    const hasPassive = PASSIVE_PATTERNS.some(pattern => pattern.test(word.word));
    return {
      partOfSpeech: 'verb',
      verbType: hasPassive ? 'transitive' : 'intransitive',
      color: TYPE_TO_COLOR.verb,
      category: determineCategory(word),
    };
  }

  // Default to noun (using possession as hint)
  return {
    partOfSpeech: 'noun',
    color: TYPE_TO_COLOR.noun,
    category: determineCategory(word),
  };
}

/**
 * Processes entire vocabulary list and adds classifications
 */
export function classifyVocabulary(words: VocabularyWord[]): VocabularyWord[] {
  return words.map(word => {
    const classification = classifyWord(word);
    return {
      ...word,
      ...classification,
    };
  });
}

/**
 * Example usage (can be run with ts-node)
 */
if (require.main === module) {
  console.log('Vocabulary Classification Script');
  console.log('=================================\n');

  console.log('Passive patterns detected:', PASSIVE_PATTERNS.length);
  console.log('Stative words:', STATIVE_WORDS.length);
  console.log('Particles:', PARTICLES.length);
  console.log('Pronouns:', PRONOUNS.length);
  console.log('\nType to color mapping:');
  Object.entries(TYPE_TO_COLOR).forEach(([type, color]) => {
    console.log(`  ${type.padEnd(15)} → ${color}`);
  });
}
