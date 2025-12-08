# Vocabulary Data

This directory contains the Te Reo Māori vocabulary database for Kapu Tī.

## Files

- **`vocabulary.json`** - Original vocabulary (222 words from kupu.maori.nz)
- **`vocabulary-classified.json`** - Enhanced version with part-of-speech classifications

## Activating Classified Vocabulary

The classified vocabulary includes proper linguistic categorization for all 222 words:

```bash
# Backup original
mv vocabulary.json vocabulary-original.json

# Activate classified version
mv vocabulary-classified.json vocabulary.json
```

## Classification Fields

Each word in `vocabulary-classified.json` includes:

- **`partOfSpeech`**: verb, noun, stative, particle, article, pronoun, tense_marker, demonstrative, locative, time, number
- **`verbType`**: transitive, intransitive (for verbs)
- **`category`**: Topic/domain (people, food, places, animals, colors, feelings, actions, culture, time, numbers, grammar, general)
- **`color`**: Game color based on part of speech (green, blue, lightblue, purple, gray, red, yellow, orange, brown, teal, cyan)

## Word Type Color Mapping

| Part of Speech | Color | Description |
|---------------|-------|-------------|
| particle | purple | Sentence markers (ko, he, ki, i) |
| article | gray | Determiners (te, ngā, a, o) |
| noun | blue | Objects, people, places |
| pronoun | red | Personal pronouns (au, koe, ia) |
| verb | green | Action verbs (kai, haere, mahi) |
| stative | lightblue | Adjective-like (pai, nui, reka) |
| tense_marker | yellow | Tense indicators (kei te, ka, kua) |
| demonstrative | orange | This/that (tēnei, tēnā, tērā) |
| locative | brown | Directional (runga, raro, roto) |
| time | teal | Time words (days, months, time refs) |
| number | cyan | Numbers (tahi, rua, toru) |

## Classification Logic

See `/scripts/classify-vocabulary.ts` for the full classification algorithm.

Key patterns detected:
- **Passive suffixes**: (tia), (hia), (a), (ina) → transitive verbs
- **Stative words**: pai, reka, nui, mahana → adjectives/qualities
- **Grammar words**: particles, articles, pronouns → from grammarWords.ts

## Integration with Code

The word library (`src/data/wordLibrary.ts`) can use either version:

```typescript
import { getClassifiedVocabularyWords, getGrammarWords } from './wordLibrary';

// Get all classified words
const classifiedWords = getClassifiedVocabularyWords();

// Get essential grammar words
const grammarWords = getGrammarWords();

// Get unique combined set
const allWords = getUniqueVocabularyWords();
```

## Statistics (Classified Version)

Total words: 222

By part of speech:
- Nouns: ~120
- Verbs: ~60
- Statives: ~15
- Time words: ~20
- Numbers: ~15
- Particles: ~5
- Other grammar: ~15

By category:
- People: ~35
- Food: ~15
- Places: ~25
- Actions: ~50
- Culture: ~20
- Time: ~20
- Numbers: ~15
- Colors: ~12
- General: ~30
