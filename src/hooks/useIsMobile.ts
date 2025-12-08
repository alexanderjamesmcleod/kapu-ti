'use client';

import { useState, useEffect } from 'react';

export function useIsMobile(breakpoint: number = 768): boolean {
  // Default to true for SSR to avoid flash of desktop on mobile
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    // Check if window is available (client-side)
    if (typeof window === 'undefined') return;

    const checkMobile = () => {
      // Use both innerWidth and screen.width for better detection
      const width = Math.min(window.innerWidth, window.screen.width);
      setIsMobile(width < breakpoint);
    };

    // Initial check
    checkMobile();

    // Listen for resize and orientation change
    window.addEventListener('resize', checkMobile);
    window.addEventListener('orientationchange', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('orientationchange', checkMobile);
    };
  }, [breakpoint]);

  return isMobile;
}

export default useIsMobile;
