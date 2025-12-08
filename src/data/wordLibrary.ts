/**
 * Word Library for Te Reo Academy
 * Complete vocabulary for Modules 1 & 2
 * Ported from v3: te-reo-card-game/src/data/wordLibrary.js
 *
 * All words include NZSL placeholders for Phase 4 integration
 *
 * UPDATED: Now integrates with classified vocabulary.json (222 words)
 * and grammarWords.ts (essential grammar words)
 */

import vocabularyData from '../../data/vocabulary.json';
import { ALL_GRAMMAR_WORDS, type GrammarWord } from './grammarWords';

export interface Word {
  id: string;
  maori: string;
  english: string;
  type: string;
  color: string;
  pronunciation?: string;
  module?: number;
  nzsl_video_url?: string | null;
  nzsl_description?: string | null;
  usage?: string;
  examples?: Array<{ maori: string; english: string }>;
  culturalNote?: string;
  note?: string;
  plural?: string;
  theme?: string;
  topics?: string[];
  breakdown?: string;
  distance?: string;
  person?: string;
  category?: string;
  verbType?: string;
  audioUrl?: string | null;
}

// Create audio URL lookup map from vocabulary.json
const audioMap = new Map<string, string>();
vocabularyData.words.forEach((w: { word: string; audioUrl: string }) => {
  // Normalize the word (lowercase, remove special chars from key)
  const normalizedWord = w.word.toLowerCase().replace(/\s*\(.*?\)\s*/g, '').trim();
  audioMap.set(normalizedWord, w.audioUrl);
});

/**
 * Get audio URL for a Māori word from vocabulary database
 * @param maoriWord - The Māori word to look up
 * @returns Audio URL if found, undefined otherwise
 */
export function getAudioUrl(maoriWord: string): string | undefined {
  const normalized = maoriWord.toLowerCase().trim();
  return audioMap.get(normalized);
}

/**
 * Cleans a word by removing passive suffix hints and parenthetical notes
 * Example: "kai(nga)" → "kai", "rongo (rangona)" → "rongo"
 */
export function cleanWord(word: string): string {
  return word
    .replace(/\s*\([^)]*\)\s*/g, '') // Remove (passive) hints
    .replace(/\s*\/\s*\S+/g, '') // Remove alternatives like "matua / mātua" → "matua"
    .trim();
}

/**
 * Generates a unique word ID from the Māori word
 */
export function generateWordId(word: string): string {
  const cleaned = cleanWord(word);
  const normalized = cleaned.toLowerCase().replace(/[^a-z0-9]/g, '_');
  return `voc_${normalized}`;
}

/**
 * Converts a grammar word to Word interface
 */
export function grammarWordToWord(gw: GrammarWord): Word {
  return {
    id: generateWordId(gw.word),
    maori: gw.word,
    english: gw.english,
    type: gw.partOfSpeech,
    color: gw.color,
    category: gw.category,
    usage: gw.usage,
    examples: gw.examples?.map(ex => ({ maori: ex, english: '' })),
    audioUrl: getAudioUrl(gw.word),
  };
}

/**
 * Converts vocabulary.json entries to Word interface
 * Handles both classified and unclassified vocabulary
 */
export function vocabularyToWord(voc: any): Word {
  const cleaned = cleanWord(voc.word);

  return {
    id: generateWordId(voc.word),
    maori: cleaned,
    english: voc.english,
    type: voc.partOfSpeech || (voc.isVerb ? 'verb' : 'noun'),
    color: voc.color || (voc.isVerb ? 'green' : 'blue'),
    category: voc.category || 'general',
    verbType: voc.verbType,
    audioUrl: voc.audioUrl,
  };
}

/**
 * Get all words from classified vocabulary
 * Filters to only include words with proper classifications
 */
export function getClassifiedVocabularyWords(): Word[] {
  return vocabularyData.words
    .filter((w: any) => w.partOfSpeech) // Only classified words
    .map(vocabularyToWord);
}

/**
 * Get all grammar words as Word objects
 */
export function getGrammarWords(): Word[] {
  return ALL_GRAMMAR_WORDS.map(grammarWordToWord);
}

// Module 1: Tūāpapa (Foundations) - Ko/He Sentences
export const WORDS_MODULE_1 = {
  particles: [
    {
      id: 'p_ko',
      maori: 'Ko',
      english: 'definite particle',
      type: 'particle',
      color: 'purple',
      pronunciation: 'kaw (like "core")',
      usage: 'Points to specific things - THE thing',
      examples: [
        { maori: 'Ko te whare', english: 'THE house (that specific one)' },
        { maori: 'Ko ia', english: 'It is him/her' }
      ],
      culturalNote: 'Ko often begins introductions and formal speeches',
      module: 1,
      nzsl_video_url: null,
      nzsl_description: null
    },
    {
      id: 'p_he',
      maori: 'He',
      english: 'indefinite particle',
      type: 'particle',
      color: 'purple',
      pronunciation: 'heh',
      usage: 'Classifies things - A/AN thing',
      examples: [
        { maori: 'He kaiako ia', english: 'He/she is A teacher (one of many)' },
        { maori: 'He whare nui', english: 'A big house' }
      ],
      module: 1,
      nzsl_video_url: null,
      nzsl_description: null
    }
  ] as Word[],

  articles: [
    {
      id: 'art_te',
      maori: 'te',
      english: 'the (singular)',
      type: 'article',
      color: 'gray',
      pronunciation: 'teh',
      usage: 'Singular definite article',
      examples: [
        { maori: 'te ngeru', english: 'the cat' },
        { maori: 'te whare', english: 'the house' }
      ],
      module: 1,
      nzsl_video_url: null,
      nzsl_description: null
    },
    {
      id: 'art_nga',
      maori: 'ngā',
      english: 'the (plural)',
      type: 'article',
      color: 'gray',
      pronunciation: 'ngar',
      usage: 'Plural definite article',
      examples: [
        { maori: 'ngā ngeru', english: 'the cats' },
        { maori: 'ngā whare', english: 'the houses' }
      ],
      note: 'ng is like "ng" in "singer"',
      module: 1,
      nzsl_video_url: null,
      nzsl_description: null
    }
  ] as Word[],

  nouns_basic: [
    {
      id: 'n_whare',
      maori: 'whare',
      english: 'house',
      type: 'noun',
      color: 'blue',
      pronunciation: 'fah-reh',
      plural: 'whare',
      theme: 'places',
      topics: ['places'],
      module: 1,
      culturalNote: 'Also means meeting house on marae',
      nzsl_video_url: null,
      nzsl_description: null
    },
    {
      id: 'n_ngeru',
      maori: 'ngeru',
      english: 'cat',
      type: 'noun',
      color: 'blue',
      pronunciation: 'nge-roo',
      plural: 'ngeru',
      theme: 'animals',
      topics: ['animals'],
      module: 1,
      nzsl_video_url: null,
      nzsl_description: null
    },
    {
      id: 'n_kaiako',
      maori: 'kaiako',
      english: 'teacher',
      type: 'noun',
      color: 'blue',
      pronunciation: 'kai-ah-kaw',
      plural: 'kaiako',
      breakdown: 'kai (food/eat) + ako (learn)',
      theme: 'people',
      topics: ['people'],
      module: 1,
      culturalNote: 'Literally "one who feeds learning"',
      nzsl_video_url: null,
      nzsl_description: null
    },
    {
      id: 'n_tangata',
      maori: 'tangata',
      english: 'person',
      type: 'noun',
      color: 'blue',
      pronunciation: 'tah-nga-tah',
      plural: 'tangata',
      theme: 'people',
      topics: ['people'],
      module: 1,
      nzsl_video_url: null,
      nzsl_description: null
    },
    {
      id: 'n_kuri',
      maori: 'kuri',
      english: 'dog',
      type: 'noun',
      color: 'blue',
      pronunciation: 'koo-ree',
      plural: 'kuri',
      theme: 'animals',
      topics: ['animals'],
      module: 1,
      nzsl_video_url: null,
      nzsl_description: null
    },
    {
      id: 'n_tamaiti',
      maori: 'tamaiti',
      english: 'child',
      type: 'noun',
      color: 'blue',
      pronunciation: 'tah-my-tee',
      plural: 'tamariki',
      theme: 'people',
      topics: ['people'],
      module: 1,
      nzsl_video_url: null,
      nzsl_description: null
    },
    {
      id: 'n_tamariki',
      maori: 'tamariki',
      english: 'children',
      type: 'noun',
      color: 'blue',
      pronunciation: 'tah-mah-ree-kee',
      theme: 'people',
      topics: ['people'],
      module: 1,
      note: 'Plural of tamaiti',
      nzsl_video_url: null,
      nzsl_description: null
    },
    {
      id: 'n_kaka',
      maori: 'kākā',
      english: 'parrot (native NZ bird)',
      type: 'noun',
      color: 'blue',
      pronunciation: 'kar-kar',
      plural: 'kākā',
      theme: 'animals',
      topics: ['animals'],
      module: 1,
      culturalNote: 'Endemic forest parrot, important in Māori culture',
      nzsl_video_url: null,
      nzsl_description: null
    },
    {
      id: 'n_manu',
      maori: 'manu',
      english: 'bird',
      type: 'noun',
      color: 'blue',
      pronunciation: 'mah-noo',
      plural: 'manu',
      theme: 'animals',
      topics: ['animals'],
      module: 1,
      nzsl_video_url: null,
      nzsl_description: null
    },
    {
      id: 'n_pouako',
      maori: 'pouako',
      english: 'teacher',
      type: 'noun',
      color: 'blue',
      pronunciation: 'poh-ah-kaw',
      plural: 'pouako',
      theme: 'people',
      topics: ['people'],
      module: 1,
      note: 'Alternative to kaiako',
      nzsl_video_url: null,
      nzsl_description: null
    },
    {
      id: 'n_tauira',
      maori: 'tauira',
      english: 'student',
      type: 'noun',
      color: 'blue',
      pronunciation: 'tah-oo-ee-rah',
      plural: 'tauira',
      theme: 'people',
      topics: ['people'],
      module: 1,
      nzsl_video_url: null,
      nzsl_description: null
    }
  ] as Word[],

  pronouns_basic: [
    {
      id: 'pr_au',
      maori: 'au',
      english: 'I/me',
      type: 'pronoun',
      color: 'red',
      pronunciation: 'ah-oo',
      person: '1st singular',
      module: 1,
      nzsl_video_url: null,
      nzsl_description: null
    },
    {
      id: 'pr_ia',
      maori: 'ia',
      english: 'he/she/it',
      type: 'pronoun',
      color: 'red',
      pronunciation: 'ee-ah',
      person: '3rd singular',
      module: 1,
      note: 'Gender neutral!',
      nzsl_video_url: null,
      nzsl_description: null
    },
    {
      id: 'pr_koe',
      maori: 'koe',
      english: 'you (singular)',
      type: 'pronoun',
      color: 'red',
      pronunciation: 'kaw-eh',
      person: '2nd singular',
      module: 1,
      nzsl_video_url: null,
      nzsl_description: null
    }
  ] as Word[],

  demonstratives_basic: [
    {
      id: 'd_tenei',
      maori: 'tēnei',
      english: 'this (near me)',
      type: 'demonstrative',
      color: 'orange',
      pronunciation: 'tay-nay',
      distance: 'near speaker',
      examples: [
        { maori: 'Ko tēnei te whare', english: 'This (here) is the house' }
      ],
      module: 1,
      nzsl_video_url: null,
      nzsl_description: null
    },
    {
      id: 'd_tena',
      maori: 'tēnā',
      english: 'that (near you)',
      type: 'demonstrative',
      color: 'orange',
      pronunciation: 'tay-nar',
      distance: 'near listener',
      examples: [
        { maori: 'Ko tēnā te whare', english: 'That (by you) is the house' }
      ],
      module: 1,
      nzsl_video_url: null,
      nzsl_description: null
    },
    {
      id: 'd_tera',
      maori: 'tērā',
      english: 'that (over there)',
      type: 'demonstrative',
      color: 'orange',
      pronunciation: 'tay-rar',
      distance: 'far from both',
      examples: [
        { maori: 'Ko tērā te whare', english: 'That (over there) is the house' }
      ],
      module: 1,
      nzsl_video_url: null,
      nzsl_description: null
    }
  ] as Word[]
};

// Module 2: Kei te (Present Tense)
export const WORDS_MODULE_2 = {
  tense_markers: [
    {
      id: 'tm_keite',
      maori: 'Kei te',
      english: 'present continuous marker',
      type: 'tense_marker',
      color: 'yellow',
      pronunciation: 'kay teh',
      usage: 'Indicates actions happening RIGHT NOW',
      examples: [
        { maori: 'Kei te pai au', english: 'I am good (right now)' },
        { maori: 'Kei te haere ia', english: 'He/she is going (now)' }
      ],
      culturalNote: 'Kei te is ONLY for present tense - verbs never change form',
      module: 2,
      nzsl_video_url: null,
      nzsl_description: null
    }
  ] as Word[],

  adjectives: [
    {
      id: 'adj_pai',
      maori: 'pai',
      english: 'good',
      type: 'adjective',
      color: 'lightblue',
      pronunciation: 'pie',
      usage: 'Describes something positive/good',
      examples: [
        { maori: 'Kei te pai au', english: 'I am good' },
        { maori: 'He pai te kai', english: 'The food is good' }
      ],
      topics: ['feelings'],
      module: 2,
      nzsl_video_url: null,
      nzsl_description: null
    },
    {
      id: 'adj_harikoa',
      maori: 'harikoa',
      english: 'happy',
      type: 'adjective',
      color: 'lightblue',
      pronunciation: 'hah-ree-kaw-ah',
      usage: 'Describes happiness/joy',
      examples: [
        { maori: 'Kei te harikoa ia', english: 'He/she is happy' }
      ],
      topics: ['feelings'],
      module: 2,
      nzsl_video_url: null,
      nzsl_description: null
    },
    {
      id: 'adj_mauiui',
      maori: 'māuiui',
      english: 'sick/unwell',
      type: 'adjective',
      color: 'lightblue',
      pronunciation: 'mar-oo-wee',
      usage: 'Describes illness',
      examples: [
        { maori: 'Kei te māuiui koe?', english: 'Are you sick?' }
      ],
      topics: ['feelings'],
      module: 2,
      nzsl_video_url: null,
      nzsl_description: null
    },
    {
      id: 'adj_ngenge',
      maori: 'ngenge',
      english: 'tired',
      type: 'adjective',
      color: 'lightblue',
      pronunciation: 'nge-nge',
      usage: 'Describes tiredness',
      examples: [
        { maori: 'Kei te ngenge au', english: 'I am tired' }
      ],
      module: 2,
      nzsl_video_url: null,
      nzsl_description: null
    },
    {
      id: 'adj_pouri',
      maori: 'pōuri',
      english: 'sad',
      type: 'adjective',
      color: 'lightblue',
      pronunciation: 'paw-oo-ree',
      usage: 'Describes sadness',
      examples: [
        { maori: 'Kei te pōuri ia', english: 'He/she is sad' }
      ],
      module: 2,
      nzsl_video_url: null,
      nzsl_description: null
    },
    {
      id: 'adj_riri',
      maori: 'riri',
      english: 'angry',
      type: 'adjective',
      color: 'lightblue',
      pronunciation: 'ree-ree',
      usage: 'Describes anger',
      examples: [
        { maori: 'Kei te riri koe?', english: 'Are you angry?' }
      ],
      module: 2,
      nzsl_video_url: null,
      nzsl_description: null
    },
    {
      id: 'adj_ora',
      maori: 'ora',
      english: 'well/alive/healthy',
      type: 'adjective',
      color: 'lightblue',
      pronunciation: 'aw-rah',
      usage: 'Describes wellness/health',
      examples: [
        { maori: 'Kei te ora au', english: 'I am well' }
      ],
      culturalNote: 'Ora has deep meaning - wellness, life force, health',
      module: 2,
      nzsl_video_url: null,
      nzsl_description: null
    },
    {
      id: 'adj_hiamoe',
      maori: 'hiamoe',
      english: 'sleepy',
      type: 'adjective',
      color: 'lightblue',
      pronunciation: 'hee-ah-maw-eh',
      usage: 'Describes sleepiness',
      examples: [
        { maori: 'Kei te hiamoe au', english: 'I am sleepy' }
      ],
      module: 2,
      nzsl_video_url: null,
      nzsl_description: null
    },
    {
      id: 'adj_matekai',
      maori: 'matekai',
      english: 'hungry',
      type: 'adjective',
      color: 'lightblue',
      pronunciation: 'mah-teh-kai',
      breakdown: 'mate (desire) + kai (food)',
      usage: 'Describes hunger',
      examples: [
        { maori: 'Kei te matekai au', english: 'I am hungry' }
      ],
      module: 2,
      nzsl_video_url: null,
      nzsl_description: null
    },
    {
      id: 'adj_hiainu',
      maori: 'hiainu',
      english: 'thirsty',
      type: 'adjective',
      color: 'lightblue',
      pronunciation: 'hee-ah-ee-noo',
      breakdown: 'hia (desire) + inu (drink)',
      usage: 'Describes thirst',
      examples: [
        { maori: 'Kei te hiainu koe?', english: 'Are you thirsty?' }
      ],
      module: 2,
      nzsl_video_url: null,
      nzsl_description: null
    }
  ] as Word[],

  verbs: [
    {
      id: 'v_haere',
      maori: 'haere',
      english: 'go',
      type: 'verb',
      color: 'green',
      pronunciation: 'high-reh',
      usage: 'To go/leave/travel',
      examples: [
        { maori: 'Kei te haere au', english: 'I am going' },
        { maori: 'Kei te haere ia ki te kura', english: 'He/she is going to school' }
      ],
      topics: ['actions'],
      culturalNote: 'Common in greetings: "Haere mai" (welcome/come here)',
      module: 2,
      nzsl_video_url: null,
      nzsl_description: null
    },
    {
      id: 'v_kai',
      maori: 'kai',
      english: 'eat/food',
      type: 'verb',
      color: 'green',
      pronunciation: 'kai (like "kite")',
      usage: 'To eat (verb) or food (noun)',
      examples: [
        { maori: 'Kei te kai au', english: 'I am eating' },
        { maori: 'Kei te kai mātou', english: 'We are eating' }
      ],
      topics: ['kai', 'actions'],
      culturalNote: 'Kai is central to Māori culture - food and hospitality',
      module: 2,
      nzsl_video_url: null,
      nzsl_description: null
    },
    {
      id: 'v_noho',
      maori: 'noho',
      english: 'sit/live/stay',
      type: 'verb',
      color: 'green',
      pronunciation: 'naw-haw',
      usage: 'To sit/live/stay in a place',
      examples: [
        { maori: 'Kei te noho au', english: 'I am sitting/staying' },
        { maori: 'Kei te noho au i Tāmaki Makaurau', english: 'I am living in Auckland' }
      ],
      topics: ['actions'],
      module: 2,
      nzsl_video_url: null,
      nzsl_description: null
    },
    {
      id: 'v_oma',
      maori: 'oma',
      english: 'run',
      type: 'verb',
      color: 'green',
      pronunciation: 'aw-mah',
      usage: 'To run',
      examples: [
        { maori: 'Kei te oma ia', english: 'He/she is running' }
      ],
      topics: ['actions'],
      module: 2,
      nzsl_video_url: null,
      nzsl_description: null
    },
    {
      id: 'v_mahi',
      maori: 'mahi',
      english: 'work/do',
      type: 'verb',
      color: 'green',
      pronunciation: 'mah-hee',
      usage: 'To work/do something',
      examples: [
        { maori: 'Kei te mahi au', english: 'I am working' }
      ],
      topics: ['actions'],
      module: 2,
      nzsl_video_url: null,
      nzsl_description: null
    },
    {
      id: 'v_ako',
      maori: 'ako',
      english: 'learn/teach',
      type: 'verb',
      color: 'green',
      pronunciation: 'ah-kaw',
      usage: 'To learn or teach (context dependent)',
      examples: [
        { maori: 'Kei te ako au', english: 'I am learning' }
      ],
      topics: ['actions'],
      culturalNote: 'Learning and teaching are intertwined in Māori worldview',
      module: 2,
      nzsl_video_url: null,
      nzsl_description: null
    },
    {
      id: 'v_mahaki',
      maori: 'māhaki',
      english: 'rest',
      type: 'verb',
      color: 'green',
      pronunciation: 'mar-hah-kee',
      usage: 'To rest/relax',
      examples: [
        { maori: 'Kei te māhaki ia', english: 'He/she is resting' }
      ],
      topics: ['actions'],
      module: 2,
      nzsl_video_url: null,
      nzsl_description: null
    }
  ] as Word[],

  particles_locative: [
    {
      id: 'pl_i',
      maori: 'i',
      english: 'at/in (locative)',
      type: 'particle_locative',
      color: 'brown',
      pronunciation: 'ee',
      usage: 'Indicates location or object',
      examples: [
        { maori: 'Kei te noho au i Tāmaki', english: 'I am living in Auckland' },
        { maori: 'i te whare', english: 'at the house' }
      ],
      module: 2,
      nzsl_video_url: null,
      nzsl_description: null
    },
    {
      id: 'pl_ki',
      maori: 'ki',
      english: 'to/towards (directional)',
      type: 'particle_locative',
      color: 'brown',
      pronunciation: 'kee',
      usage: 'Indicates direction/destination',
      examples: [
        { maori: 'Kei te haere ia ki te kura', english: 'He/she is going to school' },
        { maori: 'ki te whare', english: 'to the house' }
      ],
      module: 2,
      nzsl_video_url: null,
      nzsl_description: null
    }
  ] as Word[],

  intensifiers: [
    {
      id: 'int_ahua',
      maori: 'āhua',
      english: 'somewhat/rather',
      type: 'intensifier',
      color: 'pink',
      pronunciation: 'ar-hoo-ah',
      usage: 'Moderate intensity - "somewhat/rather"',
      examples: [
        { maori: 'Kei te āhua ngenge au', english: 'I am somewhat tired' }
      ],
      module: 2,
      nzsl_video_url: null,
      nzsl_description: null
    },
    {
      id: 'int_tino',
      maori: 'tino',
      english: 'very',
      type: 'intensifier',
      color: 'pink',
      pronunciation: 'tee-naw',
      usage: 'High intensity - "very"',
      examples: [
        { maori: 'Kei te tino pai au', english: 'I am very good' }
      ],
      module: 2,
      nzsl_video_url: null,
      nzsl_description: null
    }
  ] as Word[],

  nouns_places: [
    {
      id: 'n_kura',
      maori: 'kura',
      english: 'school',
      type: 'noun',
      color: 'blue',
      pronunciation: 'koo-rah',
      theme: 'places',
      topics: ['places'],
      examples: [
        { maori: 'Kei te haere au ki te kura', english: 'I am going to school' }
      ],
      module: 2,
      nzsl_video_url: null,
      nzsl_description: null
    },
    {
      id: 'n_tamaki',
      maori: 'Tāmaki Makaurau',
      english: 'Auckland',
      type: 'noun',
      color: 'blue',
      pronunciation: 'tar-mah-kee mah-kow-row',
      theme: 'places',
      topics: ['places'],
      culturalNote: 'Traditional Māori name for Auckland - "Tāmaki of a hundred lovers"',
      module: 2,
      nzsl_video_url: null,
      nzsl_description: null
    }
  ] as Word[],

  pronouns_plural: [
    {
      id: 'pr_matou',
      maori: 'mātou',
      english: 'we/us (exclusive)',
      type: 'pronoun',
      color: 'red',
      pronunciation: 'mar-toh',
      person: '1st plural exclusive',
      note: 'Does NOT include the listener',
      module: 2,
      nzsl_video_url: null,
      nzsl_description: null
    },
    {
      id: 'pr_tatou',
      maori: 'tātou',
      english: 'we/us (inclusive)',
      type: 'pronoun',
      color: 'red',
      pronunciation: 'tar-toh',
      person: '1st plural inclusive',
      note: 'INCLUDES the listener - "all of us"',
      module: 2,
      nzsl_video_url: null,
      nzsl_description: null
    },
    {
      id: 'pr_koutou',
      maori: 'koutou',
      english: 'you (plural)',
      type: 'pronoun',
      color: 'red',
      pronunciation: 'koh-toh',
      person: '2nd plural',
      module: 2,
      nzsl_video_url: null,
      nzsl_description: null
    },
    {
      id: 'pr_ratou',
      maori: 'rātou',
      english: 'they/them',
      type: 'pronoun',
      color: 'red',
      pronunciation: 'rar-toh',
      person: '3rd plural',
      module: 2,
      nzsl_video_url: null,
      nzsl_description: null
    }
  ] as Word[]
};

// Module 3: Past and Future Tense
export const WORDS_MODULE_3 = {
  tense_markers_past: [
    {
      id: 'tm_i',
      maori: 'I',
      english: 'simple past marker',
      type: 'tense_marker',
      color: 'yellow',
      pronunciation: 'ee',
      usage: 'Marks completed actions in past - simple past',
      examples: [
        { maori: 'I kai au', english: 'I ate' },
        { maori: 'I haere ia', english: 'He/she went' }
      ],
      module: 3,
      nzsl_video_url: null,
      nzsl_description: null
    },
    {
      id: 'tm_kua',
      maori: 'Kua',
      english: 'perfect past marker',
      type: 'tense_marker',
      color: 'yellow',
      pronunciation: 'koo-ah',
      usage: 'Marks completed actions with present relevance',
      examples: [
        { maori: 'Kua kai au', english: 'I have eaten (already)' },
        { maori: 'Kua haere ia', english: 'He/she has gone' }
      ],
      module: 3,
      nzsl_video_url: null,
      nzsl_description: null
    }
  ] as Word[],

  tense_markers_future: [
    {
      id: 'tm_ka',
      maori: 'Ka',
      english: 'future tense marker',
      type: 'tense_marker',
      color: 'yellow',
      pronunciation: 'kah',
      usage: 'Marks actions that will happen',
      examples: [
        { maori: 'Ka kai au', english: 'I will eat' },
        { maori: 'Ka haere ia', english: 'He/she will go' }
      ],
      module: 3,
      nzsl_video_url: null,
      nzsl_description: null
    }
  ] as Word[],

  time_words: [
    {
      id: 'tw_inanahi',
      maori: 'inanahi',
      english: 'yesterday',
      type: 'time_word',
      color: 'teal',
      pronunciation: 'ee-nah-nah-hee',
      usage: 'Time reference for past',
      examples: [
        { maori: 'I kai au inanahi', english: 'I ate yesterday' }
      ],
      module: 3,
      nzsl_video_url: null,
      nzsl_description: null
    },
    {
      id: 'tw_apopo',
      maori: 'āpōpō',
      english: 'tomorrow',
      type: 'time_word',
      color: 'teal',
      pronunciation: 'ar-paw-paw',
      usage: 'Time reference for future',
      examples: [
        { maori: 'Ka kai au āpōpō', english: 'I will eat tomorrow' }
      ],
      module: 3,
      nzsl_video_url: null,
      nzsl_description: null
    },
    {
      id: 'tw_inaianei',
      maori: 'ināianei',
      english: 'now',
      type: 'time_word',
      color: 'teal',
      pronunciation: 'ee-nai-ah-nay',
      usage: 'Time reference for present',
      examples: [
        { maori: 'Kei te kai au ināianei', english: 'I am eating now' }
      ],
      module: 3,
      nzsl_video_url: null,
      nzsl_description: null
    },
    {
      id: 'tw_anamata',
      maori: 'ānamata',
      english: 'future/in the future',
      type: 'time_word',
      color: 'teal',
      pronunciation: 'ar-nah-mah-tah',
      usage: 'General future time reference',
      examples: [
        { maori: 'Ka haere au ki te kura ānamata', english: 'I will go to school in the future' }
      ],
      module: 3,
      nzsl_video_url: null,
      nzsl_description: null
    }
  ] as Word[]
};

// Flattened word arrays
export const MODULE_1_ALL_WORDS: Word[] = [
  ...WORDS_MODULE_1.particles,
  ...WORDS_MODULE_1.articles,
  ...WORDS_MODULE_1.nouns_basic,
  ...WORDS_MODULE_1.pronouns_basic,
  ...WORDS_MODULE_1.demonstratives_basic
];

export const MODULE_2_ALL_WORDS: Word[] = [
  ...WORDS_MODULE_2.tense_markers,
  ...WORDS_MODULE_2.adjectives,
  ...WORDS_MODULE_2.verbs,
  ...WORDS_MODULE_2.particles_locative,
  ...WORDS_MODULE_2.intensifiers,
  ...WORDS_MODULE_2.nouns_places,
  ...WORDS_MODULE_2.pronouns_plural
];

export const MODULE_3_ALL_WORDS: Word[] = [
  ...WORDS_MODULE_3.tense_markers_past,
  ...WORDS_MODULE_3.tense_markers_future,
  ...WORDS_MODULE_3.time_words
];

export const ALL_WORDS: Word[] = [
  ...MODULE_1_ALL_WORDS,
  ...MODULE_2_ALL_WORDS,
  ...MODULE_3_ALL_WORDS
];

// Helper functions
export function getWordById(id: string): Word | undefined {
  return ALL_WORDS.find(w => w.id === id);
}

export function getWordsByType(type: string): Word[] {
  return ALL_WORDS.filter(w => w.type === type);
}

export function getWordsByColor(color: string): Word[] {
  return ALL_WORDS.filter(w => w.color === color);
}

export function getWordsByModule(moduleNumber: number): Word[] {
  return ALL_WORDS.filter(w => w.module === moduleNumber);
}

export function getWordsByCategory(category: string): Word[] {
  return ALL_WORDS.filter(w => w.category === category);
}

/**
 * Combined vocabulary: Manual curriculum + Classified vocabulary + Grammar words
 * This provides access to all 222+ words from vocabulary.json plus essential grammar
 */
export const VOCABULARY_CLASSIFIED_WORDS = getClassifiedVocabularyWords();
export const VOCABULARY_GRAMMAR_WORDS = getGrammarWords();

/**
 * ALL_VOCABULARY_WORDS: Complete word set
 * Combines manually curated curriculum words with classified vocabulary
 */
export const ALL_VOCABULARY_WORDS: Word[] = [
  ...ALL_WORDS, // Manual curriculum (Modules 1-3)
  ...VOCABULARY_CLASSIFIED_WORDS, // From classified vocabulary.json
  ...VOCABULARY_GRAMMAR_WORDS, // Essential grammar words
];

/**
 * Get unique words (deduplicated by Māori word)
 * Prefers manually curated words over auto-generated ones
 */
export function getUniqueVocabularyWords(): Word[] {
  const wordMap = new Map<string, Word>();

  // Add in priority order (first wins)
  [
    ...ALL_WORDS,
    ...VOCABULARY_GRAMMAR_WORDS,
    ...VOCABULARY_CLASSIFIED_WORDS,
  ].forEach(word => {
    const key = word.maori.toLowerCase();
    if (!wordMap.has(key)) {
      wordMap.set(key, word);
    }
  });

  return Array.from(wordMap.values());
}

// Default export for convenience
export default {
  WORDS_MODULE_1,
  WORDS_MODULE_2,
  WORDS_MODULE_3,
  MODULE_1_ALL_WORDS,
  MODULE_2_ALL_WORDS,
  MODULE_3_ALL_WORDS,
  ALL_WORDS,
  VOCABULARY_CLASSIFIED_WORDS,
  VOCABULARY_GRAMMAR_WORDS,
  ALL_VOCABULARY_WORDS,
  getWordById,
  getWordsByType,
  getWordsByColor,
  getWordsByModule,
  getWordsByCategory,
  getUniqueVocabularyWords,
  getClassifiedVocabularyWords,
  getGrammarWords,
};
