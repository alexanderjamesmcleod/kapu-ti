/**
 * useAudio Hook
 * Audio playback utilities for Kapu Tī cards
 */

export function useAudio() {
  /**
   * Play audio from URL
   * @param url - The audio URL to play
   */
  const playAudio = async (url: string): Promise<void> => {
    try {
      const audio = new Audio(url);
      await audio.play();
    } catch (error) {
      console.warn('Failed to play audio:', error);
    }
  };

  /**
   * Preload audio files for better performance
   * @param urls - Array of audio URLs to preload
   */
  const preloadAudio = (urls: string[]): void => {
    urls.forEach((url) => {
      if (url) {
        const audio = new Audio();
        audio.preload = 'auto';
        audio.src = url;
      }
    });
  };

  return { playAudio, preloadAudio };
}
