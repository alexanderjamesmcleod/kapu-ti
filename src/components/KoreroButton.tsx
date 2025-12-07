'use client';

import { useState } from 'react';

interface KoreroButtonProps {
  disabled?: boolean;
  sentence: string;
  onKorero: (translation: string) => void;
}

/**
 * The Kōrero button - when a player completes a sentence, they click this
 * to speak it aloud and provide a translation for the other players to judge.
 */
export default function KoreroButton({ disabled, sentence, onKorero }: KoreroButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [translation, setTranslation] = useState('');

  const handleClick = () => {
    if (disabled) return;
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (translation.trim()) {
      onKorero(translation.trim());
      setShowModal(false);
      setTranslation('');
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    setTranslation('');
  };

  return (
    <>
      <button
        onClick={handleClick}
        disabled={disabled}
        className={`
          px-6 py-3 rounded-xl font-bold text-lg
          transition-all transform
          ${disabled
            ? 'bg-gray-400 cursor-not-allowed opacity-50'
            : 'bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 hover:scale-105 shadow-lg hover:shadow-xl active:scale-95'
          }
          text-white
        `}
      >
        Kōrero!
      </button>

      {/* Translation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
              Kōrero!
            </h2>

            {/* The sentence they built */}
            <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl p-4 mb-4">
              <p className="text-sm text-gray-500 mb-1">Your sentence:</p>
              <p className="text-xl font-bold text-teal-800">{sentence}</p>
            </div>

            {/* Instructions */}
            <div className="mb-4 text-center">
              <p className="text-gray-600 mb-2">
                1. Say the sentence aloud in Māori
              </p>
              <p className="text-gray-600">
                2. Enter your English translation below
              </p>
            </div>

            {/* Translation input */}
            <div className="mb-6">
              <label className="block text-sm text-gray-500 mb-1">
                English translation:
              </label>
              <input
                type="text"
                value={translation}
                onChange={(e) => setTranslation(e.target.value)}
                placeholder="Enter the English meaning..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none text-lg"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && translation.trim()) {
                    handleSubmit();
                  }
                }}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!translation.trim()}
                className={`
                  flex-1 py-3 rounded-xl font-bold transition-colors
                  ${translation.trim()
                    ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white hover:from-amber-400 hover:to-orange-500'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }
                `}
              >
                Submit
              </button>
            </div>

            {/* Warning */}
            <p className="mt-4 text-center text-sm text-gray-500">
              Other players will vote on your pronunciation & translation!
            </p>
          </div>
        </div>
      )}
    </>
  );
}
