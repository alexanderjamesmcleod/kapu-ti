'use client';

import { useEffect, useState } from 'react';
import type { VerificationVote } from '@/types/multiplayer.types';

interface VoteResultModalProps {
  approved: boolean;
  speakerName: string;
  isCurrentPlayer: boolean;
  votes: VerificationVote[];
  playerNames: Record<string, string>;
  onDismiss: () => void;
}

/**
 * Shows the result of the Kōrero vote with dramatic reveal!
 */
export default function VoteResultModal({
  approved,
  speakerName,
  isCurrentPlayer,
  votes,
  playerNames,
  onDismiss,
}: VoteResultModalProps) {
  const [showResult, setShowResult] = useState(false);

  // Dramatic delay before showing result
  useEffect(() => {
    const timer = setTimeout(() => setShowResult(true), 800);
    return () => clearTimeout(timer);
  }, []);

  // Auto-dismiss after showing result
  useEffect(() => {
    if (showResult) {
      const timer = setTimeout(onDismiss, 3000);
      return () => clearTimeout(timer);
    }
  }, [showResult, onDismiss]);

  const approvedCount = votes.filter(v => v.approved).length;
  const declinedCount = votes.filter(v => !v.approved).length;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className={`
        rounded-2xl p-8 max-w-md w-full shadow-2xl transform transition-all duration-500
        ${showResult
          ? (approved
              ? 'bg-gradient-to-br from-green-600 to-green-800 scale-100'
              : 'bg-gradient-to-br from-red-600 to-red-800 scale-100')
          : 'bg-gray-800 scale-95'
        }
      `}>
        {!showResult ? (
          // Counting animation
          <div className="text-center">
            <p className="text-2xl text-gray-300 mb-4">Counting votes...</p>
            <div className="flex justify-center gap-2">
              <div className="w-3 h-3 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-3 h-3 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-3 h-3 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        ) : (
          // Result
          <div className="text-center">
            {/* Big result icon */}
            <div className={`
              text-8xl mb-4 transform transition-all duration-300
              ${showResult ? 'scale-100 rotate-0' : 'scale-0 rotate-180'}
            `}>
              {approved ? '✓' : '✗'}
            </div>

            {/* Result text */}
            <h2 className="text-4xl font-bold text-white mb-2">
              {approved ? 'Āe!' : 'Kāo!'}
            </h2>
            <p className="text-xl text-white/90 mb-4">
              {approved
                ? (isCurrentPlayer
                    ? 'Ka pai! Your Kōrero was approved!'
                    : `${speakerName}'s Kōrero was approved!`)
                : (isCurrentPlayer
                    ? 'Aue! Pick up those cards...'
                    : `${speakerName} picks up the cards!`)
              }
            </p>

            {/* Vote breakdown */}
            <div className="flex justify-center gap-8 mb-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-white">{approvedCount}</p>
                <p className="text-white/70 text-sm">Āe</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-white">{declinedCount}</p>
                <p className="text-white/70 text-sm">Kāo</p>
              </div>
            </div>

            {/* Individual votes */}
            <div className="flex flex-wrap justify-center gap-2">
              {votes.map((vote) => (
                <span
                  key={vote.playerId}
                  className={`
                    px-3 py-1 rounded-full text-sm font-semibold
                    ${vote.approved
                      ? 'bg-green-900/50 text-green-200'
                      : 'bg-red-900/50 text-red-200'
                    }
                  `}
                >
                  {playerNames[vote.playerId] || 'Player'}: {vote.approved ? 'Āe' : 'Kāo'}
                </span>
              ))}
            </div>

            {/* Consequence reminder */}
            <p className="mt-6 text-white/70 text-sm">
              {approved
                ? (isCurrentPlayer
                    ? 'You may discard up to 3 cards and pick the next topic!'
                    : `${speakerName} picks the next topic!`)
                : (isCurrentPlayer
                    ? 'You must pick up all the cards on the table.'
                    : 'The table cards go back to their hand.')
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
