import { useState, useEffect, useCallback } from 'react';

export const useScroll = (threshold: number = 10) => {
  const [scrolled, setScrolled] = useState(false);

  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;
    setScrolled(currentScrollY > threshold);
  }, [threshold]);

  useEffect(() => {
    // Use requestAnimationFrame for smooth performance
    let ticking = false;
    
    const scrollListener = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', scrollListener, { passive: true });
    return () => window.removeEventListener('scroll', scrollListener);
  }, [handleScroll]);

  return scrolled;
}; 