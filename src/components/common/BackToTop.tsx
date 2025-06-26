'use client';

import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled up to given distance
  const toggleVisibility = () => {
    if (window.scrollY > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Set the scroll event listener
  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  // Scroll to top smoothly with custom animation
  const scrollToTop = () => {
    const currentPosition = window.pageYOffset;
    const targetPosition = 0;
    const distance = targetPosition - currentPosition;
    const duration = 1000; // 1 second
    let start: number | null = null;

    const animation = (currentTime: number) => {
      if (start === null) start = currentTime;
      const timeElapsed = currentTime - start;
      const progress = Math.min(timeElapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeInOutCubic = (t: number) => {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      };

      window.scrollTo(0, currentPosition + distance * easeInOutCubic(progress));

      if (timeElapsed < duration) {
        requestAnimationFrame(animation);
      }
    };

    requestAnimationFrame(animation);
  };

  return (
    <div
      className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 lg:bottom-8 lg:right-8 z-50 transition-all duration-500 ease-in-out ${
        isVisible
          ? 'opacity-100 translate-y-0 scale-100'
          : 'opacity-0 translate-y-12 scale-75 pointer-events-none'
      }`}
    >
      <div className="relative group">
        {/* Glow effect background - pointer-events-none để không chặn click */}
        <div className="absolute -inset-0.5 sm:-inset-1 bg-gradient-to-r from-[var(--cinehub-accent)] via-[var(--cinehub-accent-hover)] to-[var(--cinehub-accent)] rounded-full blur-sm opacity-60 group-hover:opacity-80 group-hover:blur-md transition-all duration-300 pointer-events-none"></div>
        
        {/* Main button */}
        <Button
          onClick={scrollToTop}
          className="relative h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-gradient-to-br from-[var(--cinehub-accent)] to-[var(--cinehub-accent-hover)] hover:from-[var(--cinehub-accent-hover)] hover:to-[var(--cinehub-accent)] border-2 border-[var(--cinehub-accent)]/30 shadow-lg sm:shadow-xl hover:shadow-xl sm:hover:shadow-2xl hover:shadow-[var(--cinehub-accent)]/40 transition-all duration-300 cursor-pointer transform hover:scale-110 active:scale-95 group z-10"
          aria-label="Back to top"
        >
          {/* Inner circle for better visual depth - pointer-events-none */}
          <div className="absolute inset-0.5 sm:inset-1 rounded-full bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
          
          <ArrowUp className="h-5 w-5 sm:h-6 sm:w-6 text-[var(--bg-main)] drop-shadow-sm transition-transform duration-300 group-hover:translate-y-[-2px] relative z-10 pointer-events-none" />
          
          {/* Pulse animation on hover - pointer-events-none */}
          <div className="absolute inset-0 rounded-full bg-[var(--cinehub-accent)]/20 scale-100 group-hover:scale-125 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none"></div>
        </Button>
        
        {/* Additional decorative ring - pointer-events-none */}
        <div className="absolute inset-0 rounded-full border border-[var(--cinehub-accent)]/20 group-hover:border-[var(--cinehub-accent)]/40 transition-all duration-300 scale-110 group-hover:scale-125 pointer-events-none"></div>
      </div>
    </div>
  );
};

export default BackToTop; 