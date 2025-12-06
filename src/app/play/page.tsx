'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHand, SentenceBuilder } from '@/components';
import { validateKoSentence, validateHeSentence, validateKeiTeSentence } from '@/lib';
import { ALL_WORDS, SAMPLE_CHALLENGES, getWordById, type Challenge } from '@/data';
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

// Get required cards for a challenge
function getRequiredCardsForChallenge(challenge: Challenge): CardType[] {
  if (!challenge.requiredCards) return [];
  return challenge.requiredCards
    .map(id => getWordById(id))
    .filter(Boolean)
    .map(word => wordToCard(word!));
}

// Setup a new challenge with guaranteed solvable hand
function setupChallenge(): { challenge: Challenge; hand: CardType[]; deck: CardType[] } {
  // Pick a random challenge
  const challenge = SAMPLE_CHALLENGES[Math.floor(Math.random() * SAMPLE_CHALLENGES.length)];

  // Get required cards for the challenge
  const requiredCards = getRequiredCardsForChallenge(challenge);
  const requiredIds = new Set(requiredCards.map(c => c.id));

  // Get all other cards (excluding required ones)
  const otherCards = ALL_WORDS
    .filter(w => !requiredIds.has(w.id))
    .map(wordToCard);

  // Shuffle other cards
  const shuffledOthers = shuffle(otherCards);

  // Hand = required cards + some extras (up to 7 total)
  const extraCount = Math.max(0, 7 - requiredCards.length);
  const extraCards = shuffledOthers.slice(0, extraCount);
  const hand = shuffle([...requiredCards, ...extraCards]);

  // Deck = remaining cards
  const deck = shuffledOthers.slice(extraCount);

  return { challenge, hand, deck };
}

export default function PlayPage() {
  // Game state - use deterministic initial values to avoid hydration mismatch
  const [playerHand, setPlayerHand] = useState<CardType[]>([]);
  const [drawPile, setDrawPile] = useState<CardType[]>([]);
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null);
  const [placedCards, setPlacedCards] = useState<(CardType | null)[]>([]);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [score, setScore] = useState(0);
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Initialize game on client only to avoid hydration mismatch
  useEffect(() => {
    setIsClient(true);
    const { challenge, hand, deck } = setupChallenge();
    setCurrentChallenge(challenge);
    setPlayerHand(hand);
    setDrawPile(deck);
  }, []);

  // Pattern for current challenge
  const slotColors = useMemo(
    () => currentChallenge ? getPatternColors(currentChallenge.pattern) : [],
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
    if (cards.length === 0 || !currentChallenge) return;

    // Determine which validator to use
    let result: ValidationResult;
    const firstCard = cards[0];

    const validatorChallenge = toValidatorChallenge(currentChallenge);

    if (firstCard.maori === 'Ko') {
      result = validateKoSentence(cards, validatorChallenge);
    } else if (firstCard.maori === 'He') {
      result = validateHeSentence(cards, validatorChallenge);
    } else if (firstCard.maori === 'Kei te') {
      result = validateKeiTeSentence(cards, validatorChallenge);
    } else {
      // Default validation
      result = {
        valid: false,
        correct: false,
        feedback: {
          type: 'error',
          message: 'Start with Ko, He, or Kei te',
          hint: 'Use a sentence starter particle (purple/yellow)',
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

  // Draw a card from the pile
  const handleDrawCard = useCallback(() => {
    if (drawPile.length === 0) return;

    const [drawnCard, ...remainingPile] = drawPile;
    setDrawPile(remainingPile);
    setPlayerHand(prev => [...prev, drawnCard]);
  }, [drawPile]);

  // Next challenge
  const handleNextChallenge = useCallback(() => {
    // Setup new challenge with fresh hand containing required cards
    const { challenge, hand, deck } = setupChallenge();

    setPlacedCards([]);
    setValidation(null);
    setCurrentChallenge(challenge);
    setPlayerHand(hand);
    setDrawPile(deck);
  }, []);

  // Show loading state during SSR/hydration
  if (!isClient || !currentChallenge) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-teal-50 to-blue-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-teal-800 mb-4">Kapu Ti</h1>
          <p className="text-gray-600">Loading game...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="text-center mb-6">
          <div className="flex justify-between items-start mb-2">
            <div></div>
            <h1 className="text-4xl font-bold text-teal-800">
              Kapu Ti
            </h1>
            <div className="flex gap-2">
              <Link
                href="/play/topic"
                className="px-3 py-1 bg-purple-500 text-white text-sm rounded-lg
                         hover:bg-purple-600 transition-colors font-semibold"
              >
                Solo
              </Link>
              <Link
                href="/play/multiplayer"
                className="px-3 py-1 bg-amber-500 text-white text-sm rounded-lg
                         hover:bg-amber-600 transition-colors font-semibold"
              >
                Local
              </Link>
              <Link
                href="/play/room"
                className="px-3 py-1 bg-teal-600 text-white text-sm rounded-lg
                         hover:bg-teal-700 transition-colors font-semibold"
              >
                Online
              </Link>
            </div>
          </div>
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

        {/* Player Hand + Draw Pile */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-700">
              Your Hand {selectedCard && '(tap a slot to place)'}
            </h3>
            {/* Draw Pile */}
            <button
              onClick={handleDrawCard}
              disabled={drawPile.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg
                       font-bold hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed
                       transition-colors shadow-md"
            >
              <span className="text-xl">🃏</span>
              <span>Draw ({drawPile.length})</span>
            </button>
          </div>
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
