'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { TopicSelector, CardHand } from '@/components';
import {
  type Topic,
  type GeneratedSentence,
  generateSentencesForTopic,
  ALL_WORDS,
  getWordsByType
} from '@/data';
import type { Card as CardType } from '@/types';

type GamePhase = 'topic-select' | 'playing' | 'checking' | 'correct' | 'incorrect';

// Convert word to card format
function wordToCard(word: { id: string; maori: string; english: string; type: string; color: string }): CardType {
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

// Get distractor cards (wrong cards to make it challenging)
function getDistractorCards(neededCards: CardType[], count: number): CardType[] {
  const neededIds = new Set(neededCards.map(c => c.id));
  const neededTypes = new Set(neededCards.map(c => c.type));

  // Get cards of similar types (to make it tricky) but not the ones we need
  const distractors: CardType[] = [];

  for (const type of neededTypes) {
    const sameTypeCards = getWordsByType(type)
      .filter(w => !neededIds.has(w.id))
      .map(wordToCard);
    distractors.push(...sameTypeCards);
  }

  // Also add some random other cards
  const otherCards = ALL_WORDS
    .filter(w => !neededIds.has(w.id) && !distractors.some(d => d.id === w.id))
    .map(wordToCard);

  distractors.push(...otherCards);

  // Shuffle and take the requested count
  return shuffle(distractors).slice(0, count);
}

export default function TopicPlayPage() {
  // Game state
  const [phase, setPhase] = useState<GamePhase>('topic-select');
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [sentences, setSentences] = useState<GeneratedSentence[]>([]);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);

  // Card game state
  const [playerHand, setPlayerHand] = useState<CardType[]>([]);
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null);
  const [placedCards, setPlacedCards] = useState<(CardType | null)[]>([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);

  // Current sentence
  const currentSentence = sentences[currentSentenceIndex];

  // Setup a sentence with needed cards + distractors
  const setupSentence = useCallback((sentence: GeneratedSentence) => {
    const neededCards = sentence.words.map(wordToCard);
    // Add 3-5 distractor cards to make it challenging
    const distractorCount = Math.min(5, Math.max(3, sentence.words.length));
    const distractors = getDistractorCards(neededCards, distractorCount);

    // Combine and shuffle
    const hand = shuffle([...neededCards, ...distractors]);

    setPlayerHand(hand);
    setPlacedCards(new Array(sentence.pattern.structure.length).fill(null));
    setSelectedCard(null);
    setPhase('playing');
  }, []);

  // Handle topic selection - go straight to playing (single player)
  const handleSelectTopic = useCallback((topic: Topic) => {
    setSelectedTopic(topic);
    const generatedSentences = generateSentencesForTopic(topic, 5);
    setSentences(generatedSentences);
    setCurrentSentenceIndex(0);
    setScore(0);
    setStreak(0);

    // Start playing immediately (no turn order for single player)
    if (generatedSentences.length > 0) {
      setupSentence(generatedSentences[0]);
    }
  }, [setupSentence]);

  // Auto-check when all slots are filled
  useEffect(() => {
    if (phase !== 'playing') return;
    if (!currentSentence) return;

    const allFilled = placedCards.every(c => c !== null);
    if (!allFilled) return;

    // Brief delay before checking (feels more natural)
    const timer = setTimeout(() => {
      setPhase('checking');

      // Check after a moment
      setTimeout(() => {
        const builtSentence = placedCards.map(c => c!.maori).join(' ');
        const targetSentence = currentSentence.maori;

        if (builtSentence === targetSentence) {
          // Correct!
          const points = 100 + (streak * 25); // Bonus for streaks
          setScore(prev => prev + points);
          setStreak(prev => prev + 1);
          setPhase('correct');
        } else {
          // Incorrect
          setStreak(0);
          setPhase('incorrect');
        }
      }, 500);
    }, 300);

    return () => clearTimeout(timer);
  }, [placedCards, phase, currentSentence, streak]);

  // Handle placing a card in a slot
  const handleSlotClick = useCallback((index: number) => {
    if (phase !== 'playing') return;

    const currentCard = placedCards[index];

    if (currentCard) {
      // Return card to hand
      setPlayerHand(prev => [...prev, currentCard]);
      setPlacedCards(prev => {
        const newPlaced = [...prev];
        newPlaced[index] = null;
        return newPlaced;
      });
    } else if (selectedCard) {
      // Place selected card
      setPlacedCards(prev => {
        const newPlaced = [...prev];
        newPlaced[index] = selectedCard;
        return newPlaced;
      });
      setPlayerHand(prev => prev.filter(c => c.id !== selectedCard.id));
      setSelectedCard(null);
    }
  }, [phase, placedCards, selectedCard]);

  // Try again (incorrect answer)
  const handleTryAgain = useCallback(() => {
    // Return all placed cards to hand
    const cardsToReturn = placedCards.filter(c => c !== null) as CardType[];
    setPlayerHand(prev => shuffle([...prev, ...cardsToReturn]));
    setPlacedCards(new Array(currentSentence.pattern.structure.length).fill(null));
    setSelectedCard(null);
    setPhase('playing');
  }, [placedCards, currentSentence]);

  // Next sentence
  const handleNextSentence = useCallback(() => {
    if (currentSentenceIndex < sentences.length - 1) {
      const nextIndex = currentSentenceIndex + 1;
      setCurrentSentenceIndex(nextIndex);
      setupSentence(sentences[nextIndex]);
    }
  }, [currentSentenceIndex, sentences, setupSentence]);

  // Reset to topic selection
  const handleNewTopic = useCallback(() => {
    setPhase('topic-select');
    setSelectedTopic(null);
    setSentences([]);
    setCurrentSentenceIndex(0);
    setScore(0);
    setStreak(0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="text-center mb-6">
          <div className="flex justify-between items-center mb-2">
            <Link href="/play" className="text-teal-600 hover:text-teal-800">
              ← Back
            </Link>
            <h1 className="text-3xl font-bold text-teal-800">
              Topic Mode
            </h1>
            <div className="text-right">
              <div className="text-xl font-bold text-amber-600">
                Score: {score}
              </div>
              {streak > 1 && (
                <div className="text-sm text-orange-500">
                  🔥 {streak} streak!
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Phase: Topic Selection */}
        {phase === 'topic-select' && (
          <TopicSelector
            onSelectTopic={handleSelectTopic}
            selectedTopicId={selectedTopic?.id}
          />
        )}

        {/* Playing phases */}
        {phase !== 'topic-select' && currentSentence && (
          <div>
            {/* Topic indicator */}
            <div className="text-center mb-4">
              <span className="inline-block px-4 py-2 bg-white rounded-full shadow-md">
                {selectedTopic?.icon} {selectedTopic?.name} ({selectedTopic?.maori})
              </span>
              <span className="ml-2 text-sm text-gray-500">
                {currentSentenceIndex + 1}/{sentences.length}
              </span>
            </div>

            {/* Challenge */}
            <div className="bg-white rounded-xl p-4 mb-6 shadow-md">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">
                Build this sentence:
              </h2>
              <p className="text-xl font-bold text-teal-700">
                &quot;{currentSentence.english}&quot;
              </p>
            </div>

            {/* Sentence builder slots */}
            <div className="flex flex-wrap justify-center gap-3 mb-6">
              {placedCards.map((card, index) => (
                <div
                  key={index}
                  onClick={() => handleSlotClick(index)}
                  className={`
                    w-28 h-20 rounded-xl border-2
                    flex items-center justify-center
                    transition-all cursor-pointer
                    ${card
                      ? phase === 'correct'
                        ? 'border-green-400 bg-green-50 shadow-md'
                        : phase === 'incorrect'
                          ? 'border-red-400 bg-red-50 shadow-md'
                          : 'border-solid border-gray-300 bg-white shadow-md'
                      : selectedCard
                        ? 'border-dashed border-teal-400 bg-teal-50'
                        : 'border-dashed border-gray-300 bg-gray-50'
                    }
                    ${phase === 'checking' ? 'animate-pulse' : ''}
                  `}
                >
                  {card ? (
                    <div className="text-center p-2">
                      <div className="font-bold text-gray-800">{card.maori}</div>
                      <div className="text-xs text-gray-500">{card.english}</div>
                    </div>
                  ) : (
                    <span className="text-gray-400 text-sm">
                      {currentSentence.pattern.structure[index]}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Checking indicator */}
            {phase === 'checking' && (
              <div className="text-center mb-6">
                <p className="text-lg text-gray-600">Checking...</p>
              </div>
            )}

            {/* Correct! */}
            {phase === 'correct' && (
              <div className="text-center mb-6 animate-bounce-once">
                <div className="text-5xl mb-2">🎉</div>
                <p className="text-2xl font-bold text-green-600 mb-2">Ka pai! Correct!</p>
                <p className="text-gray-600 mb-1">
                  {currentSentence.maori}
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  = &quot;{currentSentence.english}&quot;
                </p>

                {currentSentenceIndex < sentences.length - 1 ? (
                  <button
                    onClick={handleNextSentence}
                    className="px-8 py-4 bg-amber-500 text-white rounded-xl font-bold
                             text-xl hover:bg-amber-600 transition-colors shadow-lg"
                  >
                    Next Sentence →
                  </button>
                ) : (
                  <div>
                    <p className="text-xl font-bold text-teal-700 mb-4">
                      Topic complete! Final score: {score}
                    </p>
                    <button
                      onClick={handleNewTopic}
                      className="px-8 py-4 bg-teal-600 text-white rounded-xl font-bold
                               text-xl hover:bg-teal-700 transition-colors shadow-lg"
                    >
                      Choose Another Topic
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Incorrect */}
            {phase === 'incorrect' && (
              <div className="text-center mb-6">
                <div className="text-5xl mb-2">🤔</div>
                <p className="text-2xl font-bold text-red-600 mb-2">Not quite...</p>
                <p className="text-gray-600 mb-4">
                  You built: <span className="font-mono">{placedCards.map(c => c?.maori).join(' ')}</span>
                </p>
                <button
                  onClick={handleTryAgain}
                  className="px-8 py-4 bg-amber-500 text-white rounded-xl font-bold
                           text-xl hover:bg-amber-600 transition-colors shadow-lg"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Player hand */}
            {(phase === 'playing' || phase === 'checking') && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Your Hand {selectedCard && '(tap a slot to place)'}
                </h3>
                <CardHand
                  cards={playerHand}
                  selectedCardId={selectedCard?.id}
                  onSelectCard={(card) => setSelectedCard(
                    selectedCard?.id === card.id ? null : card
                  )}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
