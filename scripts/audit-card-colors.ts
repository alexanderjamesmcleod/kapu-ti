#!/usr/bin/env npx tsx
/**
 * Card Color Audit Script
 *
 * Analyzes all cards in the word library and provides a report
 * on color assignments by word type.
 *
 * Run with: npx tsx scripts/audit-card-colors.ts
 */

import { ALL_WORDS } from '../src/data/wordLibrary';

// Expected color mapping based on word types
const EXPECTED_TYPE_COLORS: Record<string, string> = {
  'particle': 'purple',
  'article': 'gray',
  'noun': 'blue',
  'pronoun': 'red',
  'verb': 'green',
  'adjective': 'lightblue',
  'tense_marker': 'yellow',
  'demonstrative': 'orange',
  'particle_locative': 'brown',
  'intensifier': 'pink',
  'time_word': 'teal',
};

// Group words by color
const wordsByColor: Record<string, typeof ALL_WORDS> = {};
ALL_WORDS.forEach(word => {
  if (!wordsByColor[word.color]) {
    wordsByColor[word.color] = [];
  }
  wordsByColor[word.color].push(word);
});

// Group words by type
const wordsByType: Record<string, typeof ALL_WORDS> = {};
ALL_WORDS.forEach(word => {
  if (!wordsByType[word.type]) {
    wordsByType[word.type] = [];
  }
  wordsByType[word.type].push(word);
});

console.log('='.repeat(60));
console.log('KAPU TI CARD COLOR AUDIT REPORT');
console.log('='.repeat(60));
console.log();

// Summary stats
console.log('SUMMARY');
console.log('-'.repeat(40));
console.log(`Total words: ${ALL_WORDS.length}`);
console.log(`Unique colors: ${Object.keys(wordsByColor).length}`);
console.log(`Unique types: ${Object.keys(wordsByType).length}`);
console.log();

// Colors used
console.log('COLORS USED');
console.log('-'.repeat(40));
Object.entries(wordsByColor)
  .sort((a, b) => b[1].length - a[1].length)
  .forEach(([color, words]) => {
    console.log(`  ${color.padEnd(12)} : ${words.length} words`);
  });
console.log();

// Types and their colors
console.log('WORD TYPES AND ASSIGNED COLORS');
console.log('-'.repeat(40));
Object.entries(wordsByType)
  .sort((a, b) => a[0].localeCompare(b[0]))
  .forEach(([type, words]) => {
    const colors = [...new Set(words.map(w => w.color))];
    const expected = EXPECTED_TYPE_COLORS[type] || '???';
    const match = colors.length === 1 && colors[0] === expected ? '✓' : '✗';
    console.log(`  ${type.padEnd(20)} : ${colors.join(', ').padEnd(12)} (expected: ${expected}) ${match}`);
  });
console.log();

// Check for mismatches
console.log('POTENTIAL ISSUES');
console.log('-'.repeat(40));
let issueCount = 0;

ALL_WORDS.forEach(word => {
  const expected = EXPECTED_TYPE_COLORS[word.type];
  if (expected && word.color !== expected) {
    issueCount++;
    console.log(`  [MISMATCH] "${word.maori}" (${word.english})`);
    console.log(`             type: ${word.type}, color: ${word.color}, expected: ${expected}`);
    console.log(`             id: ${word.id}`);
    console.log();
  }
});

if (issueCount === 0) {
  console.log('  No color mismatches found! All words have correct colors.');
}
console.log();

// Detailed color breakdown
console.log('DETAILED COLOR BREAKDOWN');
console.log('-'.repeat(40));
Object.entries(wordsByColor)
  .sort((a, b) => a[0].localeCompare(b[0]))
  .forEach(([color, words]) => {
    console.log(`\n${color.toUpperCase()} (${words.length} words):`);
    words.forEach(w => {
      console.log(`  - ${w.maori.padEnd(20)} ${w.english.padEnd(25)} [${w.type}]`);
    });
  });

console.log();
console.log('='.repeat(60));
console.log('END OF REPORT');
console.log('='.repeat(60));
