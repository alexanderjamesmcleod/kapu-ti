'use client';

import { useState, useEffect } from 'react';
import type { VerificationVote } from '@/types/multiplayer.types';
import { playSound } from '@/lib/sounds';

interface VotingOverlayProps {
  speakerName: string;
  sentence: string;
  translation: string;
  votes: VerificationVote[];
  totalVoters: number;
  hasVoted: boolean;
  isCurrentPlayer: boolean;
  onVote: (approved: boolean) => void;
}

/**
 * The voting overlay - shown to all players during the verification phase.
 * The speaker sees who has voted, other players see big Āe/Kāo buttons.
 */
export default function VotingOverlay({
  speakerName,
  sentence,
  translation,
  votes,
  totalVoters,
  hasVoted,
  isCurrentPlayer,
  onVote,
}: VotingOverlayProps) {
  const [timeLeft, setTimeLeft] = useState(15);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const approvedCount = votes.filter(v => v.approved).length;
  const declinedCount = votes.filter(v => !v.approved).length;
  const waitingCount = totalVoters - votes.length;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-gray-700">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-1">
            {isCurrentPlayer ? 'Awaiting Votes...' : `${speakerName} says...`}
          </h2>
          <p className="text-gray-400 text-sm">
            {isCurrentPlayer
              ? 'Other players are judging your Kōrero!'
              : 'Did they say it right? Does the translation match?'
            }
          </p>
        </div>

        {/* The sentence */}
        <div className="bg-gradient-to-r from-teal-900/50 to-blue-900/50 rounded-xl p-4 mb-4">
          <p className="text-sm text-teal-400 mb-1">Māori:</p>
          <p className="text-2xl font-bold text-white mb-3">{sentence}</p>
          <p className="text-sm text-blue-400 mb-1">Translation:</p>
          <p className="text-lg text-blue-200">&quot;{translation}&quot;</p>
        </div>

        {/* Timer */}
        <div className="flex justify-center mb-6">
          <div className={`
            px-4 py-2 rounded-full text-sm font-bold
            ${timeLeft > 5 ? 'bg-gray-700 text-gray-300' : 'bg-red-600 text-white animate-pulse'}
          `}>
            {timeLeft}s remaining
          </div>
        </div>

        {/* Voting buttons (for non-speakers who haven't voted) */}
        {!isCurrentPlayer && !hasVoted && (
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => {
                playSound('voteSubmit');
                onVote(true);
              }}
              className="
                flex-1 py-6 rounded-2xl
                bg-gradient-to-br from-green-500 to-green-700
                hover:from-green-400 hover:to-green-600
                active:scale-95 transform transition-all
                shadow-lg hover:shadow-xl
                flex flex-col items-center gap-2
              "
            >
              <span className="text-5xl">✓</span>
              <span className="text-2xl font-bold text-white">Āe</span>
              <span className="text-green-200 text-sm">Approve</span>
            </button>
            <button
              onClick={() => {
                playSound('voteSubmit');
                onVote(false);
              }}
              className="
                flex-1 py-6 rounded-2xl
                bg-gradient-to-br from-red-500 to-red-700
                hover:from-red-400 hover:to-red-600
                active:scale-95 transform transition-all
                shadow-lg hover:shadow-xl
                flex flex-col items-center gap-2
              "
            >
              <span className="text-5xl">✗</span>
              <span className="text-2xl font-bold text-white">Kāo</span>
              <span className="text-red-200 text-sm">Decline</span>
            </button>
          </div>
        )}

        {/* Already voted message */}
        {!isCurrentPlayer && hasVoted && (
          <div className="text-center mb-6 py-4">
            <p className="text-green-400 font-semibold text-lg">
              Vote submitted! Waiting for others...
            </p>
          </div>
        )}

        {/* Vote tally */}
        <div className="bg-gray-700/50 rounded-xl p-4">
          <div className="flex justify-between items-center">
            <div className="text-center flex-1">
              <p className="text-green-400 text-3xl font-bold">{approvedCount}</p>
              <p className="text-gray-400 text-sm">Āe</p>
            </div>
            <div className="text-center flex-1 border-x border-gray-600">
              <p className="text-gray-300 text-3xl font-bold">{waitingCount}</p>
              <p className="text-gray-400 text-sm">Waiting</p>
            </div>
            <div className="text-center flex-1">
              <p className="text-red-400 text-3xl font-bold">{declinedCount}</p>
              <p className="text-gray-400 text-sm">Kāo</p>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-teal-500 to-blue-500 transition-all duration-300"
            style={{ width: `${(votes.length / totalVoters) * 100}%` }}
          />
        </div>
        <p className="text-center text-gray-500 text-xs mt-2">
          {votes.length} of {totalVoters} votes
        </p>
      </div>
    </div>
  );
}
