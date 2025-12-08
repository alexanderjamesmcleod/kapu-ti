/**
 * Leaderboard module for Kapu Ti multiplayer game
 * Persists high scores to JSON file with CRUD operations
 */

import * as fs from 'fs';
import * as path from 'path';

export interface LeaderboardEntry {
  initials: string;       // 3 uppercase letters, e.g., "TAM"
  score: number;          // Cumulative/game score
  date: string;           // ISO date string
  gamesPlayed?: number;   // Optional: total games
}

export interface Leaderboard {
  entries: LeaderboardEntry[];
  lastUpdated: string;
}

// Profanity blocklist (simple, common words)
const PROFANITY_BLOCKLIST = ['ASS', 'FUK', 'FCK', 'SHT', 'DIK', 'COK', 'CUM', 'PUS', 'FAG'];

// Path to leaderboard data file
const LEADERBOARD_PATH = path.join(__dirname, 'data', 'leaderboard.json');

/**
 * Load leaderboard from file (create if doesn't exist)
 */
export function loadLeaderboard(): Leaderboard {
  try {
    if (!fs.existsSync(LEADERBOARD_PATH)) {
      // Create directory if it doesn't exist
      const dir = path.dirname(LEADERBOARD_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Create initial empty leaderboard
      const initialLeaderboard: Leaderboard = {
        entries: [],
        lastUpdated: new Date().toISOString(),
      };
      fs.writeFileSync(LEADERBOARD_PATH, JSON.stringify(initialLeaderboard, null, 2));
      return initialLeaderboard;
    }

    const data = fs.readFileSync(LEADERBOARD_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading leaderboard:', error);
    return {
      entries: [],
      lastUpdated: new Date().toISOString(),
    };
  }
}

/**
 * Save leaderboard to file
 */
export function saveLeaderboard(leaderboard: Leaderboard): void {
  try {
    leaderboard.lastUpdated = new Date().toISOString();
    fs.writeFileSync(LEADERBOARD_PATH, JSON.stringify(leaderboard, null, 2));
  } catch (error) {
    console.error('Error saving leaderboard:', error);
    throw error;
  }
}

/**
 * Get top N entries
 */
export function getTopEntries(n: number = 100): LeaderboardEntry[] {
  const leaderboard = loadLeaderboard();
  return leaderboard.entries.slice(0, n);
}

/**
 * Check if score qualifies for leaderboard (top 100)
 */
export function qualifiesForLeaderboard(score: number): boolean {
  const leaderboard = loadLeaderboard();

  // If we have fewer than 100 entries, it qualifies
  if (leaderboard.entries.length < 100) {
    return true;
  }

  // Otherwise, check if it beats the lowest score
  const lowestScore = leaderboard.entries[leaderboard.entries.length - 1]?.score ?? 0;
  return score > lowestScore;
}

/**
 * Get rank for a given score (where would it place?)
 */
export function getRankForScore(score: number): number {
  const leaderboard = loadLeaderboard();
  let rank = 1;

  for (const entry of leaderboard.entries) {
    if (score >= entry.score) {
      return rank;
    }
    rank++;
  }

  return rank;
}

/**
 * Validate initials (3 uppercase A-Z only)
 */
export function validateInitials(initials: string): boolean {
  // Check length
  if (!initials || initials.length !== 3) {
    return false;
  }

  // Check all uppercase A-Z
  if (!/^[A-Z]{3}$/.test(initials)) {
    return false;
  }

  // Check profanity
  if (PROFANITY_BLOCKLIST.includes(initials.toUpperCase())) {
    return false;
  }

  return true;
}

/**
 * Add new entry (maintains sorted order, caps at 100)
 */
export function addEntry(initials: string, score: number): LeaderboardEntry {
  // Validate inputs
  if (!validateInitials(initials)) {
    throw new Error(`Invalid initials: "${initials}". Must be 3 uppercase letters (A-Z) without profanity.`);
  }

  if (!Number.isInteger(score) || score <= 0) {
    throw new Error('Score must be a positive integer');
  }

  // Create new entry
  const entry: LeaderboardEntry = {
    initials: initials.toUpperCase(),
    score,
    date: new Date().toISOString(),
  };

  // Load current leaderboard
  const leaderboard = loadLeaderboard();

  // Add entry and sort by score descending, then by date ascending (earlier date wins on tie)
  leaderboard.entries.push(entry);
  leaderboard.entries.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score; // Higher score first
    }
    // On tie, earlier date first
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  // Keep only top 100
  leaderboard.entries = leaderboard.entries.slice(0, 100);

  // Save updated leaderboard
  saveLeaderboard(leaderboard);

  return entry;
}
