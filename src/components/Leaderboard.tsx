'use client';

import React from 'react';

interface LeaderboardEntry {
  initials: string;
  score: number;
  date: string;
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentPlayerScore?: number;
  currentPlayerRank?: number;
  isLoading?: boolean;
}

/**
 * Leaderboard sidebar component displaying top 10 scores
 * Shows medals for top 3, highlights current player, and displays rank if not in top 10
 */
export function Leaderboard({
  entries,
  currentPlayerScore,
  currentPlayerRank,
  isLoading = false
}: LeaderboardProps) {
  // Medal emojis for top 3
  const getMedal = (position: number): string => {
    switch (position) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '';
    }
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="w-56 bg-gray-800 rounded-lg shadow-xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">🏆</span>
          <h2 className="text-xl font-bold text-amber-400">TOP 10</h2>
        </div>
        <div className="space-y-2">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-8 bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (entries.length === 0) {
    return (
      <div className="w-56 bg-gray-800 rounded-lg shadow-xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">🏆</span>
          <h2 className="text-xl font-bold text-amber-400">TOP 10</h2>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-400 text-sm">
            No scores yet - be the first!
          </p>
        </div>
      </div>
    );
  }

  // Take only top 10 entries
  const top10 = entries.slice(0, 10);

  return (
    <div className="w-56 bg-gray-800 rounded-lg shadow-xl p-4 sticky top-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 border-b border-gray-700 pb-3">
        <span className="text-2xl">🏆</span>
        <h2 className="text-xl font-bold text-amber-400">TOP 10</h2>
      </div>

      {/* Leaderboard entries */}
      <div className="space-y-1">
        {top10.map((entry, index) => {
          const position = index + 1;
          const medal = getMedal(position);
          const isTopThree = position <= 3;

          return (
            <div
              key={`${entry.initials}-${entry.score}-${index}`}
              className={`
                flex items-center justify-between px-3 py-2 rounded
                ${isTopThree
                  ? 'bg-amber-900/30 text-amber-300'
                  : index % 2 === 0
                    ? 'bg-gray-700/50'
                    : 'bg-gray-700/30'
                }
                ${isTopThree ? 'font-semibold' : 'text-gray-300'}
              `}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono w-6 text-right">
                  {position}.
                </span>
                <span className="font-medium">
                  {entry.initials}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">
                  {entry.score.toLocaleString()}
                </span>
                {medal && <span className="text-lg">{medal}</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Current player rank (if not in top 10) */}
      {currentPlayerRank && currentPlayerRank > 10 && currentPlayerScore !== undefined && (
        <div className="mt-4 pt-3 border-t border-gray-700">
          <div className="bg-teal-900/30 text-teal-300 px-3 py-2 rounded flex items-center justify-between">
            <span className="font-semibold">YOU:</span>
            <span className="text-sm">
              {currentPlayerScore.toLocaleString()} (#{currentPlayerRank})
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
