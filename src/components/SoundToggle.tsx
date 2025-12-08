'use client';

import { useState, useEffect } from 'react';
import { isSoundEnabled, toggleSound, getVolume, setVolume, initAudio } from '@/lib/sounds';

interface SoundToggleProps {
  compact?: boolean;
}

/**
 * Sound toggle button with optional volume slider
 */
export default function SoundToggle({ compact = false }: SoundToggleProps) {
  const [enabled, setEnabled] = useState(true);
  const [volume, setVolumeState] = useState(0.5);
  const [showVolume, setShowVolume] = useState(false);

  // Load settings on mount
  useEffect(() => {
    setEnabled(isSoundEnabled());
    setVolumeState(getVolume());
  }, []);

  const handleToggle = () => {
    initAudio(); // Ensure audio context is ready
    const newEnabled = toggleSound();
    setEnabled(newEnabled);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolumeState(newVolume);
    setVolume(newVolume);
  };

  if (compact) {
    return (
      <button
        onClick={handleToggle}
        className={`
          p-2 rounded-lg transition-colors
          ${enabled
            ? 'bg-teal-100 text-teal-600 hover:bg-teal-200'
            : 'bg-gray-200 text-gray-400 hover:bg-gray-300'
          }
        `}
        title={enabled ? 'Sound On' : 'Sound Off'}
      >
        {enabled ? '🔊' : '🔇'}
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={handleToggle}
        onMouseEnter={() => setShowVolume(true)}
        onMouseLeave={() => setShowVolume(false)}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg transition-colors
          ${enabled
            ? 'bg-teal-100 text-teal-700 hover:bg-teal-200'
            : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
          }
        `}
      >
        <span className="text-lg">{enabled ? '🔊' : '🔇'}</span>
        <span className="text-sm font-medium">
          {enabled ? 'Sound On' : 'Sound Off'}
        </span>
      </button>

      {/* Volume slider popup */}
      {showVolume && enabled && (
        <div
          className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-white rounded-lg shadow-lg p-3 z-50"
          onMouseEnter={() => setShowVolume(true)}
          onMouseLeave={() => setShowVolume(false)}
        >
          <p className="text-xs text-gray-500 mb-2 text-center">Volume</p>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={handleVolumeChange}
            className="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-500"
          />
          <p className="text-xs text-center text-gray-400 mt-1">
            {Math.round(volume * 100)}%
          </p>
        </div>
      )}
    </div>
  );
}
