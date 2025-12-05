/**
 * Audio utilities for Kapu Tī
 * Pronunciation audio from kupu.maori.nz (with attribution)
 */

// Audio URL patterns for kupu.maori.nz
const KUPU_AUDIO_BASE = 'https://kupu.maori.nz/blobs/Audio';

// Known audio mappings (word -> filename)
// Some words use verb forms like kai(nga), mahi(a)
const AUDIO_MAPPINGS: Record<string, string> = {
  // Verbs with passive suffix
  'kai': 'kai(nga)',
  'mahi': 'mahi(a)',
  'ako': 'ako(na)',
  'noho': 'noho(ia)',

  // Nouns with alternate forms
  'tangata': 'tangata-tāngata',

  // Direct matches (most words)
  'whare': 'whare',
  'ngeru': 'ngeru',
  'pai': 'pai',
  'moe': 'moe',
  'nui': 'nui',
  'kura': 'kura',
  'reo': 'reo',
  'tae': 'tae',
};

/**
 * Get the audio URL for a Māori word
 */
export function getAudioUrl(word: string): string | null {
  const filename = AUDIO_MAPPINGS[word.toLowerCase()] || word.toLowerCase();
  return `${KUPU_AUDIO_BASE}/${encodeURIComponent(filename)}.mp3`;
}

/**
 * Check if audio exists for a word (cached results)
 */
const audioExistsCache = new Map<string, boolean>();

export async function checkAudioExists(word: string): Promise<boolean> {
  const url = getAudioUrl(word);
  if (!url) return false;

  if (audioExistsCache.has(word)) {
    return audioExistsCache.get(word)!;
  }

  try {
    const response = await fetch(url, { method: 'HEAD' });
    const exists = response.ok;
    audioExistsCache.set(word, exists);
    return exists;
  } catch {
    audioExistsCache.set(word, false);
    return false;
  }
}

/**
 * Play pronunciation audio for a word
 */
export async function playPronunciation(word: string): Promise<boolean> {
  const url = getAudioUrl(word);
  if (!url) return false;

  try {
    const audio = new Audio(url);
    await audio.play();
    return true;
  } catch (error) {
    console.warn(`Audio not available for "${word}", falling back to TTS`);
    return speakWithTTS(word);
  }
}

/**
 * Fallback: Use Web Speech API for text-to-speech
 */
export function speakWithTTS(text: string, lang: 'mi' | 'en' = 'mi'): boolean {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    return false;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  // Try Māori voice, fall back to default
  utterance.lang = lang === 'mi' ? 'mi-NZ' : 'en-NZ';
  utterance.rate = 0.8; // Slightly slower for learning

  window.speechSynthesis.speak(utterance);
  return true;
}

/**
 * Play a full sentence (word by word or as phrase)
 */
export async function playSentence(words: string[], asPhrase = true): Promise<void> {
  if (asPhrase) {
    // Try to speak the whole sentence
    speakWithTTS(words.join(' '));
  } else {
    // Play each word with a pause
    for (const word of words) {
      await playPronunciation(word);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
}

// Attribution (must be displayed when using kupu.maori.nz audio)
export const AUDIO_ATTRIBUTION = {
  source: 'kupu.maori.nz',
  creators: 'Kelly Keane & Franz Ombler',
  supporter: 'Mā te Reo',
  text: 'Pronunciation audio from kupu.maori.nz',
};
