#!/usr/bin/env node
/**
 * Apply Classification to Vocabulary
 *
 * Reads vocabulary.json and applies part-of-speech classification
 * to all words, then writes the updated file back.
 */

const fs = require('fs');
const path = require('path');

// Classification constants
const PASSIVE_PATTERNS = [
  /\(tia\)/, /\(hia\)/, /\(a\)/, /\(ina\)/, /\(kia\)/, /\(mia\)/,
  /\(na\)/, /\(ngia\)/, /\(ria\)/, /\(whia\)/, /\(nga\)/
];

const STATIVE_WORDS = [
  'pai', 'reka', 'nui', 'iti', 'roa', 'poto', 'teitei', 'pāpaku',
  'mahana', 'makariri', 'tika', 'reri', 'kī', 'ora',
  'harikoa', 'māuiui', 'ngenge', 'pōuri', 'riri', 'hiamoe',
  'matekai', 'hiainu', 'mā', 'pango', 'whero', 'kākāriki',
  'kōwhai', 'kikorangi', 'kahurangi', 'māwhero', 'waiporoporo',
  'karaka', 'pākākā'
];

const PARTICLES = ['ko', 'he', 'kei', 'i', 'ki', 'mā', 'mō', 'nā', 'nō', 'e', 'kia', 'hei'];
const ARTICLES = ['te', 'ngā', 'a', 'o'];
const PRONOUNS = ['au', 'koe', 'ia', 'māua', 'tāua', 'kōrua', 'rāua', 'mātou', 'tātou', 'koutou', 'rātou'];
const DEMONSTRATIVES = ['tēnei', 'tēnā', 'tērā', 'ēnei', 'ēnā', 'ērā'];
const LOCATIVES = ['runga', 'raro', 'roto', 'waho', 'mua', 'muri', 'uta', 'tai'];

const TIME_WORDS = [
  'inanahi', 'āpōpō', 'ināianei', 'ānamata', 'rā', 'wiki',
  'Rāhina', 'Rātū', 'Rāapa', 'Rāpare', 'Rāmere', 'Rāhoroi', 'Rātapu',
  'Kohitātea', 'Huitanguru', 'Poutūterangi', 'Paengawhāwhā',
  'Haratua', 'Pipiri', 'Hōngongoi', 'Hereturikōkā', 'Mahuru',
  'Whiringa-ā-nuku', 'Whiringa-ā-rangi', 'Hakihea'
];

const NUMBERS = [
  'tahi', 'rua', 'toru', 'whā', 'rima', 'ono', 'whitu', 'waru',
  'iwa', 'tekau', 'rau', 'mano', 'tua-', 'toko-'
];

const TYPE_TO_COLOR = {
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
  number: 'cyan'
};

function cleanWord(word) {
  let cleaned = word;
  PASSIVE_PATTERNS.forEach(pattern => {
    cleaned = cleaned.replace(pattern, '');
  });
  cleaned = cleaned.replace(/\([^)]*\)/g, '').trim();
  return cleaned;
}

function determineCategory(word) {
  const english = word.english.toLowerCase();
  const maori = word.word.toLowerCase();

  if (english.match(/mother|father|parent|son|daughter|sister|brother|sibling|child|person|elder|friend|wife|husband|niece|nephew|grandparent|ancestor|teacher|student|worker|visitor|people|man|woman/)) {
    return 'people';
  }
  if (english.match(/food|eat|drink|water|sandwich|fruit|vegetable|meat|ice cream|chicken|fish|seafood|breakfast|cup|plate/) || maori.includes('kai')) {
    return 'food';
  }
  if (english.match(/house|home|school|beach|island|street|road|area|region|table|chair|bedroom|toilet|television|fridge|office|department|garden|shed|porch/)) {
    return 'places';
  }
  if (english.match(/cat|dog|bird|parrot|spider|fish|chicken|muttonbird/) || maori.match(/ngeru|kuri|manu|ika/)) {
    return 'animals';
  }
  if (english.match(/white|yellow|orange|black|brown|green|red|pink|purple|blue|clean|colour/)) {
    return 'colors';
  }
  if (english.match(/good|happy|sad|angry|tired|sick|well|sleepy|hungry|thirsty|warm|cold|tasty|sweet/)) {
    return 'feelings';
  }
  if (english.match(/go|run|sit|work|learn|read|write|swim|play|cook|wash|wake|sleep|look|see|find|listen|sing|walk|dig|grow|plant|call|welcome|greet|dive|paddle|follow|chase|hold|bathe|boil|cut|buy|remember|close|shake|press|tread/)) {
    return 'actions';
  }
  if (english.match(/marae|meeting house|carved|protocol|custom|welcome|speech|song|prayer|hongi|tribe|gable|ridge|porch|visitors|bench|barge/)) {
    return 'culture';
  }
  if (english.match(/day|week|yesterday|tomorrow|now|future|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|January|February|March|April|May|June|July|August|September|October|November|December/)) {
    return 'time';
  }
  if (english.match(/one|two|three|four|five|six|seven|eight|nine|ten|hundred|thousand|number|counting|prefix/)) {
    return 'numbers';
  }

  return 'general';
}

function classifyWord(word) {
  const cleaned = cleanWord(word.word);
  const lowerWord = cleaned.toLowerCase();
  const english = word.english.toLowerCase();

  // Numbers
  if (NUMBERS.includes(lowerWord) || english.match(/^(one|two|three|four|five|six|seven|eight|nine|ten|hundred|thousand)$/)) {
    return { partOfSpeech: 'number', color: 'cyan', category: 'numbers' };
  }

  // Time words
  if (TIME_WORDS.some(tw => word.word.includes(tw) || lowerWord === tw.toLowerCase())) {
    return { partOfSpeech: 'time', color: 'teal', category: 'time' };
  }

  // Locatives
  if (LOCATIVES.includes(lowerWord)) {
    return { partOfSpeech: 'locative', color: 'brown', category: 'location' };
  }

  // Demonstratives
  if (DEMONSTRATIVES.some(d => lowerWord === d.toLowerCase())) {
    return { partOfSpeech: 'demonstrative', color: 'orange', category: 'grammar' };
  }

  // Pronouns
  if (PRONOUNS.includes(lowerWord)) {
    return { partOfSpeech: 'pronoun', color: 'red', category: 'grammar' };
  }

  // Articles
  if (ARTICLES.includes(lowerWord)) {
    return { partOfSpeech: 'article', color: 'gray', category: 'grammar' };
  }

  // Particles
  if (PARTICLES.includes(lowerWord)) {
    return { partOfSpeech: 'particle', color: 'purple', category: 'grammar' };
  }

  // Statives (adjectives)
  if (STATIVE_WORDS.includes(lowerWord)) {
    return { partOfSpeech: 'stative', color: 'lightblue', category: determineCategory(word) };
  }

  // Verbs
  if (word.isVerb || PASSIVE_PATTERNS.some(pattern => pattern.test(word.word))) {
    const hasPassive = PASSIVE_PATTERNS.some(pattern => pattern.test(word.word));
    return {
      partOfSpeech: 'verb',
      verbType: hasPassive ? 'transitive' : 'intransitive',
      color: 'green',
      category: determineCategory(word)
    };
  }

  // Default to noun
  return { partOfSpeech: 'noun', color: 'blue', category: determineCategory(word) };
}

// Main execution
const vocabPath = path.join(__dirname, '..', 'data', 'vocabulary.json');
const vocab = JSON.parse(fs.readFileSync(vocabPath, 'utf8'));

console.log('Classifying', vocab.words.length, 'words...\n');

// Track statistics
const stats = {};

// Classify all words
const classifiedWords = vocab.words.map((word, index) => {
  const classification = classifyWord(word);
  const classified = { ...word, ...classification };

  // Update stats
  const pos = classification.partOfSpeech;
  stats[pos] = (stats[pos] || 0) + 1;

  // Log first few for verification
  if (index < 5) {
    console.log(`${word.word.padEnd(20)} → ${classification.partOfSpeech.padEnd(15)} (${classification.color}) [${classification.category}]`);
  }

  return classified;
});

// Update vocabulary object
vocab.words = classifiedWords;
vocab.lastUpdated = new Date().toISOString();

// Write back to file
fs.writeFileSync(vocabPath, JSON.stringify(vocab, null, 2));

console.log('\n✓ Classified', classifiedWords.length, 'words');
console.log('✓ Updated vocabulary.json\n');

console.log('Classification Statistics:');
Object.entries(stats)
  .sort((a, b) => b[1] - a[1])
  .forEach(([pos, count]) => {
    const color = TYPE_TO_COLOR[pos] || 'unknown';
    console.log(`  ${pos.padEnd(15)} → ${count.toString().padStart(3)} words (${color})`);
  });

console.log('\nTotal:', classifiedWords.length, 'words classified');
