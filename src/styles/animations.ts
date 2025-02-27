/**
 * Animation utilities for consistent motion throughout the application
 */

// Staggered animation helper - returns a delay for each item in a list
export const staggeredDelay = (index: number, baseDelay: number = 0.1): string => {
  return `${baseDelay * index}s`;
};

// Animation variants for framer-motion components
export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } }
};

export const slideUp = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } }
};

export const slideDown = {
  hidden: { y: -20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.3, ease: "easeOut" } }
};

export const slideInRight = {
  hidden: { x: 20, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } }
};

export const staggeredContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

// CSS animation classes for use with Tailwind
export const animationClasses = {
  fadeIn: 'animate-fade-in',
  slideUp: 'animate-slide-up',
  slideDown: 'animate-slide-down',
  slideInRight: 'animate-slide-in-right',
  bounceSubtle: 'animate-bounce-subtle',
  pulseSubtle: 'animate-pulse-subtle',
};

// Animation delay classes
export const delayClasses = {
  100: 'delay-100',
  200: 'delay-200',
  300: 'delay-300',
  500: 'delay-500',
  700: 'delay-700',
  1000: 'delay-1000',
};
