#!/usr/bin/env npx tsx
/**
 * Vocabulary Scraper for Kapu Tī
 *
 * Fetches word details from kupu.maori.nz including:
 * - Word type (verb, noun, stative)
 * - Verb classification (transitive, intransitive, experience)
 * - Noun possession category (a/o)
 * - Audio URL
 * - Example sentences
 *
 * Usage: npx tsx scripts/scrape-vocabulary.ts
 */

import * as fs from 'fs';
import * as path from 'path';

// Word URLs from KUPU.md
const WORD_URLS: string[] = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../docs/KUPU.md'), 'utf-8')
);

interface WordEntry {
  url: string;
  word: string;
  english: string[];
  partOfSpeech: 'verb' | 'noun' | 'stative' | 'particle' | 'unknown';
  verbType?: 'transitive' | 'intransitive' | 'experience';
  possessionCategory?: 'a' | 'o';
  audioUrl?: string;
  examples?: { maori: string; english: string }[];
  error?: string;
}

interface VocabularyDatabase {
  lastUpdated: string;
  source: string;
  totalWords: number;
  words: WordEntry[];
}

// Extract word from URL
function extractWordFromUrl(url: string): string {
  const match = url.match(/\/kupu\/(.+)$/);
  if (!match) return '';
  return decodeURIComponent(match[1]);
}

// Generate audio URL from word
function generateAudioUrl(word: string): string {
  // Clean up word - remove passive suffixes in parentheses
  const cleanWord = word.replace(/\(.+\)/, '').trim();
  // URL encode for macrons
  const encoded = encodeURIComponent(cleanWord);
  return `https://kupu.maori.nz/blobs/Audio/${encoded}.mp3`;
}

// Fetch and parse a single word page
async function fetchWordDetails(url: string): Promise<WordEntry> {
  const word = extractWordFromUrl(url);

  const entry: WordEntry = {
    url,
    word,
    english: [],
    partOfSpeech: 'unknown',
  };

  try {
    const response = await fetch(url);
    if (!response.ok) {
      entry.error = `HTTP ${response.status}`;
      return entry;
    }

    const html = await response.text();

    // Extract English meaning from h2
    const h2Match = html.match(/<h2[^>]*>([^<]+)<\/h2>/);
    if (h2Match) {
      entry.english = h2Match[1].split(/[,;]/).map(s => s.trim()).filter(Boolean);
    }

    // Detect part of speech from page content
    const lowerHtml = html.toLowerCase();

    if (lowerHtml.includes('transitive verb') || lowerHtml.includes('transitive action')) {
      entry.partOfSpeech = 'verb';
      entry.verbType = 'transitive';
    } else if (lowerHtml.includes('intransitive verb') || lowerHtml.includes('intransitive action')) {
      entry.partOfSpeech = 'verb';
      entry.verbType = 'intransitive';
    } else if (lowerHtml.includes('experience verb')) {
      entry.partOfSpeech = 'verb';
      entry.verbType = 'experience';
    } else if (lowerHtml.includes('stative')) {
      entry.partOfSpeech = 'stative';
    }

    // Check for noun indicators
    if (entry.partOfSpeech === 'unknown') {
      // If examples use "he X" or "ko X" patterns, likely a noun
      if (html.match(/\bHe\s+\w+\s+te\s/i) || html.match(/\bKo\s+\w+\s+t[āa]/i)) {
        entry.partOfSpeech = 'noun';
      }
    }

    // Detect possession category from examples
    if (html.includes('tāku') || html.includes('taku') || html.includes('āku') || html.includes('aku')) {
      entry.possessionCategory = 'a';
    } else if (html.includes('tōku') || html.includes('toku') || html.includes('ōku') || html.includes('oku')) {
      entry.possessionCategory = 'o';
    }

    // Check if audio exists
    if (html.includes('blobs/Audio/')) {
      entry.audioUrl = generateAudioUrl(word);
    }

    // Extract example sentences (simplified)
    const examples: { maori: string; english: string }[] = [];
    // Look for pattern: Māori sentence followed by English translation
    const sentencePattern = /([A-ZĀĒĪŌŪ][^.!?]*[.!?])\s*<br\s*\/?>\s*([A-Z][^.!?]*[.!?])/g;
    let match;
    while ((match = sentencePattern.exec(html)) !== null && examples.length < 3) {
      examples.push({
        maori: match[1].replace(/<[^>]+>/g, '').trim(),
        english: match[2].replace(/<[^>]+>/g, '').trim()
      });
    }
    if (examples.length > 0) {
      entry.examples = examples;
    }

  } catch (error) {
    entry.error = error instanceof Error ? error.message : 'Unknown error';
  }

  return entry;
}

// Main scraper function
async function scrapeVocabulary(): Promise<void> {
  console.log(`Starting vocabulary scrape of ${WORD_URLS.length} words...`);

  const database: VocabularyDatabase = {
    lastUpdated: new Date().toISOString(),
    source: 'kupu.maori.nz',
    totalWords: 0,
    words: []
  };

  // Process in batches to avoid overwhelming the server
  const BATCH_SIZE = 5;
  const DELAY_MS = 500;

  for (let i = 0; i < WORD_URLS.length; i += BATCH_SIZE) {
    const batch = WORD_URLS.slice(i, i + BATCH_SIZE);
    console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(WORD_URLS.length / BATCH_SIZE)}...`);

    const results = await Promise.all(batch.map(url => fetchWordDetails(url)));
    database.words.push(...results);

    // Progress update
    const successCount = database.words.filter(w => !w.error).length;
    console.log(`  Completed: ${database.words.length}/${WORD_URLS.length} (${successCount} successful)`);

    // Rate limiting
    if (i + BATCH_SIZE < WORD_URLS.length) {
      await new Promise(resolve => setTimeout(resolve, DELAY_MS));
    }
  }

  database.totalWords = database.words.filter(w => !w.error).length;

  // Write output
  const outputPath = path.join(__dirname, '../data/vocabulary.json');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(database, null, 2));

  console.log(`\nScrape complete!`);
  console.log(`Total words: ${database.totalWords}`);
  console.log(`Errors: ${database.words.filter(w => w.error).length}`);
  console.log(`Output: ${outputPath}`);

  // Summary by type
  const byType = database.words.reduce((acc, w) => {
    acc[w.partOfSpeech] = (acc[w.partOfSpeech] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  console.log('\nBy part of speech:', byType);

  const byVerbType = database.words.filter(w => w.verbType).reduce((acc, w) => {
    acc[w.verbType!] = (acc[w.verbType!] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  console.log('By verb type:', byVerbType);

  const withAudio = database.words.filter(w => w.audioUrl).length;
  console.log(`With audio: ${withAudio}`);
}

// Run the scraper
scrapeVocabulary().catch(console.error);
