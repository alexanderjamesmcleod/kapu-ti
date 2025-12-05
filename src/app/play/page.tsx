'use client';

import { useState, useCallback, useMemo } from 'react';
import { Card, CardHand, SentenceBuilder } from '@/components';
import { validateKoSentence, validateHeSentence } from '@/lib';
import { ALL_WORDS, SAMPLE_CHALLENGES, type Challenge } from '@/data';
import type { Card as CardType, ValidationResult } from '@/types';
import type { Challenge as ValidatorChallenge } from '@/types/validation.types';
import { playSentence, AUDIO_ATTRIBUTION } from '@/lib/audio';

// Convert curriculum Challenge to validator-compatible format
function toValidatorChallenge(challenge: Challenge): ValidatorChallenge {
  return {
    id: challenge.id,
    instruction: challenge.instruction,
    pattern: challenge.pattern,
    target: challenge.target,
    hints: challenge.hints?.map(h => h.message),
  };
}

// Convert word data to card format
function wordToCard(word: typeof ALL_WORDS[0]): CardType {
  return {
    id: word.id,
    maori: word.maori,
    english: word.english,
    type: word.type,
    color: word.color,
  };
}

// Shuffle array
function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Get pattern colors from challenge
function getPatternColors(pattern: string[]): string[] {
  const typeToColor: Record<string, string> = {
    'Ko': 'purple',
    'He': 'purple',
    'Kei te': 'yellow',
    'particle': 'purple',
    'article': 'gray',
    'te': 'gray',
    'ngā': 'gray',
    'noun': 'blue',
    'pronoun': 'red',
    'verb': 'green',
    'adjective': 'lightblue',
    'tense_marker': 'yellow',
    'demonstrative': 'orange',
    'intensifier': 'pink',
    'locative': 'brown',
  };
  return pattern.map(p => typeToColor[p] || 'gray');
}

export default function PlayPage() {
  // Game state
  const [playerHand, setPlayerHand] = useState<CardType[]>(() => {
    const cards = ALL_WORDS.slice(0, 30).map(wordToCard);
    return shuffle(cards).slice(0, 7);
  });

  const [selectedCard, setSelectedCard] = useState<CardType | null>(null);
  const [placedCards, setPlacedCards] = useState<(CardType | null)[]>([]);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [score, setScore] = useState(0);
  const [currentChallenge, setCurrentChallenge] = useState(() =>
    SAMPLE_CHALLENGES[Math.floor(Math.random() * SAMPLE_CHALLENGES.length)]
  );

  // Pattern for current challenge
  const slotColors = useMemo(
    () => getPatternColors(currentChallenge.pattern),
    [currentChallenge]
  );

  // Initialize placed cards array based on pattern
  useMemo(() => {
    if (placedCards.length !== slotColors.length) {
      setPlacedCards(new Array(slotColors.length).fill(null));
    }
  }, [slotColors.length, placedCards.length]);

  // Handle card selection from hand
  const handleSelectCard = useCallback((card: CardType) => {
    setSelectedCard(prev => prev?.id === card.id ? null : card);
  }, []);

  // Handle slot click to place card
  const handleSlotClick = useCallback((index: number) => {
    if (!selectedCard) return;

    setPlacedCards(prev => {
      const newPlaced = [...prev];
      newPlaced[index] = selectedCard;
      return newPlaced;
    });

    // Remove from hand
    setPlayerHand(prev => prev.filter(c => c.id !== selectedCard.id));
    setSelectedCard(null);
    setValidation(null);
  }, [selectedCard]);

  // Handle removing a card from builder
  const handleRemoveCard = useCallback((index: number) => {
    const card = placedCards[index];
    if (!card) return;

    setPlacedCards(prev => {
      const newPlaced = [...prev];
      newPlaced[index] = null;
      return newPlaced;
    });

    // Return to hand
    setPlayerHand(prev => [...prev, card]);
    setValidation(null);
  }, [placedCards]);

  // Validate the built sentence
  const handleValidate = useCallback(() => {
    const cards = placedCards.filter(Boolean) as CardType[];
    if (cards.length === 0) return;

    // Determine which validator to use
    let result: ValidationResult;
    const firstCard = cards[0];

    const validatorChallenge = toValidatorChallenge(currentChallenge);

    if (firstCard.maori === 'Ko') {
      result = validateKoSentence(cards, validatorChallenge);
    } else if (firstCard.maori === 'He') {
      result = validateHeSentence(cards, validatorChallenge);
    } else {
      // Default validation
      result = {
        valid: false,
        correct: false,
        feedback: {
          type: 'error',
          message: 'Start with Ko or He for this challenge',
          hint: 'The first card should be a particle (purple)',
        },
        translation: '',
        breakdown: [],
      };
    }

    setValidation(result);

    if (result.correct) {
      setScore(prev => prev + cards.length * 10);
      // Play the sentence!
      playSentence(cards.map(c => c.maori));
    }
  }, [placedCards, currentChallenge]);

  // Next challenge
  const handleNextChallenge = useCallback(() => {
    // Clear the builder but keep cards that were placed
    setPlacedCards([]);
    setValidation(null);
    setCurrentChallenge(
      SAMPLE_CHALLENGES[Math.floor(Math.random() * SAMPLE_CHALLENGES.length)]
    );

    // Deal more cards if hand is low
    if (playerHand.length < 5) {
      const newCards = shuffle(ALL_WORDS.slice(0, 30).map(wordToCard)).slice(0, 3);
      setPlayerHand(prev => [...prev, ...newCards]);
    }
  }, [playerHand.length]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="text-center mb-6">
          <h1 className="text-4xl font-bold text-teal-800 mb-2">
            Kapu Tī 🍵
          </h1>
          <p className="text-gray-600">
            Build sentences, empty your hand, or make the tea!
          </p>
          <div className="mt-2 text-2xl font-bold text-teal-600">
            Score: {score}
          </div>
        </header>

        {/* Challenge */}
        <div className="bg-white rounded-xl p-4 mb-6 shadow-md">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">
            Challenge:
          </h2>
          <p className="text-xl font-bold text-teal-700">
            {currentChallenge.instruction}
          </p>
          <p className="text-lg text-gray-600 mt-1">
            &quot;{currentChallenge.target.english}&quot;
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Target: <span className="font-mono">{currentChallenge.target.maori}</span>
          </p>
        </div>

        {/* Sentence Builder */}
        <div className="mb-6">
          <SentenceBuilder
            slots={slotColors}
            placedCards={placedCards}
            validation={validation}
            onSlotClick={handleSlotClick}
            onRemoveCard={handleRemoveCard}
          />

          {/* Action buttons */}
          <div className="flex justify-center gap-4 mt-4">
            <button
              onClick={handleValidate}
              disabled={!placedCards.some(Boolean)}
              className="px-6 py-3 bg-teal-600 text-white rounded-lg font-bold
                       hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed
                       transition-colors"
            >
              Check Sentence ✓
            </button>

            {validation?.correct && (
              <button
                onClick={handleNextChallenge}
                className="px-6 py-3 bg-green-600 text-white rounded-lg font-bold
                         hover:bg-green-700 transition-colors"
              >
                Next Challenge →
              </button>
            )}
          </div>
        </div>

        {/* Player Hand */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2 text-center">
            Your Hand {selectedCard && '(tap a slot to place)'}
          </h3>
          <CardHand
            cards={playerHand}
            selectedCardId={selectedCard?.id}
            onSelectCard={handleSelectCard}
          />
        </div>

        {/* Instructions */}
        <div className="text-center text-sm text-gray-500 mt-8">
          <p>1. Select a card from your hand</p>
          <p>2. Tap a matching slot to place it</p>
          <p>3. Click &quot;Check Sentence&quot; to validate</p>
          <p className="mt-2">🔊 Tap the speaker on any card to hear pronunciation</p>
        </div>

        {/* Attribution */}
        <footer className="text-center text-xs text-gray-400 mt-8">
          <p>{AUDIO_ATTRIBUTION.text}</p>
          <p>Created by {AUDIO_ATTRIBUTION.creators} • Supported by {AUDIO_ATTRIBUTION.supporter}</p>
        </footer>
      </div>
    </div>
  );
}
