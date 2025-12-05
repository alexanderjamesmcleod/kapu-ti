'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MultiplayerGame } from '@/components/multiplayer/MultiplayerGame';

export default function MultiplayerPage() {
  const [playerCount, setPlayerCount] = useState(2);
  const [playerNames, setPlayerNames] = useState<string[]>(['', '']);
  const [gameStarted, setGameStarted] = useState(false);

  // Update player count
  const handlePlayerCountChange = (count: number) => {
    setPlayerCount(count);
    const newNames = [...playerNames];
    while (newNames.length < count) {
      newNames.push('');
    }
    while (newNames.length > count) {
      newNames.pop();
    }
    setPlayerNames(newNames);
  };

  // Update player name
  const handleNameChange = (index: number, name: string) => {
    const newNames = [...playerNames];
    newNames[index] = name;
    setPlayerNames(newNames);
  };

  // Start game
  const handleStartGame = () => {
    // Fill empty names with defaults
    const finalNames = playerNames.map((name, i) =>
      name.trim() || `Player ${i + 1}`
    );
    setPlayerNames(finalNames);
    setGameStarted(true);
  };

  // Check if can start
  const canStart = playerNames.some(n => n.trim().length > 0);

  if (gameStarted) {
    return (
      <MultiplayerGame
        playerNames={playerNames}
        onExit={() => setGameStarted(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-blue-50 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-teal-800 mb-2">Kapu Ti</h1>
          <p className="text-gray-600">Multiplayer Setup</p>
        </header>

        {/* Back link */}
        <Link
          href="/play"
          className="inline-block mb-6 text-teal-600 hover:text-teal-800"
        >
          ← Back to Single Player
        </Link>

        {/* Player count selection */}
        <div className="bg-white rounded-xl p-6 shadow-md mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            How many players?
          </h2>
          <div className="flex justify-center gap-4">
            {[2, 3, 4].map(count => (
              <button
                key={count}
                onClick={() => handlePlayerCountChange(count)}
                className={`w-16 h-16 rounded-full text-2xl font-bold transition-all
                  ${playerCount === count
                    ? 'bg-teal-600 text-white scale-110'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
              >
                {count}
              </button>
            ))}
          </div>
        </div>

        {/* Player names */}
        <div className="bg-white rounded-xl p-6 shadow-md mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Enter player names
          </h2>
          <div className="space-y-3">
            {playerNames.map((name, index) => (
              <div key={index} className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-teal-100 text-teal-800
                               flex items-center justify-center font-bold">
                  {index + 1}
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={e => handleNameChange(index, e.target.value)}
                  placeholder={`Player ${index + 1}`}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg
                           focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Rules summary */}
        <div className="bg-amber-50 rounded-xl p-4 mb-6 text-sm">
          <h3 className="font-semibold text-amber-800 mb-2">How to Play</h3>
          <ul className="text-amber-700 space-y-1">
            <li>• Play cards on matching color slots</li>
            <li>• One card per color per turn</li>
            <li>• Speak the sentence + translate</li>
            <li>• Wrong? Pick up ALL table cards!</li>
            <li>• First to empty hand wins</li>
            <li>• Last with cards makes tea!</li>
          </ul>
        </div>

        {/* Start button */}
        <button
          onClick={handleStartGame}
          disabled={!canStart}
          className="w-full py-4 bg-teal-600 text-white rounded-xl font-bold text-xl
                   hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed
                   transition-colors shadow-lg"
        >
          Start Game
        </button>
      </div>
    </div>
  );
}
