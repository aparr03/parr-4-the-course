/**
 * Application color theme and style constants
 * Use these constants throughout the app for consistent styling
 */
import { animationClasses } from './animations';

export const colors = {
  // Background colors
  background: {
    primary: 'bg-secondary-50',
    secondary: 'bg-white',
    accent: 'bg-primary-50',
    card: 'bg-white',
    form: 'bg-white',
  },
  
  // Text colors
  text: {
    primary: 'text-secondary-900',
    secondary: 'text-secondary-700',
    muted: 'text-secondary-500',
    accent: 'text-primary-700',
    light: 'text-secondary-100',
    danger: 'text-red-600',
    success: 'text-green-600',
  },
  
  // Button colors
  button: {
    primary: {
      bg: 'bg-primary-600',
      text: 'text-white',
      hover: 'hover:bg-primary-700',
      active: 'active:bg-primary-800',
      focus: 'focus:ring focus:ring-primary-200',
    },
    secondary: {
      bg: 'bg-white',
      text: 'text-secondary-800',
      hover: 'hover:bg-secondary-50',
      active: 'active:bg-secondary-100',
      focus: 'focus:ring focus:ring-secondary-200',
      border: 'border border-secondary-300',
    },
    accent: {
      bg: 'bg-accent-500',
      text: 'text-white',
      hover: 'hover:bg-accent-600',
      active: 'active:bg-accent-700',
      focus: 'focus:ring focus:ring-accent-200',
    },
    danger: {
      bg: 'bg-red-600',
      text: 'text-white',
      hover: 'hover:bg-red-700',
      active: 'active:bg-red-800',
      focus: 'focus:ring focus:ring-red-200',
    },
  },
  
  // Border colors
  border: {
    light: 'border-secondary-200',
    default: 'border-secondary-300',
    dark: 'border-secondary-400',
    accent: 'border-primary-500',
  }
};

// Helper function to combine multiple color classes
export const combineClasses = (classNames: (string | undefined | false)[]): string => {
  return classNames.filter(Boolean).join(' ');
};

// Common component classes with modern styling and animations
export const componentStyles = {
  // Card styles with subtle shadow and animation
  card: combineClasses([
    colors.background.card,
    'rounded-xl',
    'shadow-soft',
    'p-6',
    'transition-all',
    'duration-300',
    'hover:shadow-strong',
    colors.text.primary,
  ]),
  
  // Form input with modern focus states
  formInput: combineClasses([
    'w-full',
    'px-3',
    'py-2.5',
    'border',
    colors.border.default,
    'rounded-md',
    'bg-white',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-primary-500/50',
    'focus:border-primary-500',
    'transition-all',
    'duration-200',
  ]),
  
  // Headings with subtle fade in animation
  pageHeading: combineClasses([
    colors.text.primary,
    'text-3xl',
    'sm:text-4xl',
    'font-display',
    'font-bold',
    'mb-6',
    'tracking-tight',
    animationClasses.fadeIn,
  ]),
  
  // Section headings
  sectionHeading: combineClasses([
    colors.text.primary,
    'text-xl',
    'font-display',
    'font-semibold',
    'mb-4',
  ]),
  
  // Container with responsive padding
  container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  
  // Grid layout for lists and cards
  grid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6',
  
  // Modern navbar styling
  navbar: combineClasses([
    'sticky',
    'top-0',
    'z-40',
    'backdrop-blur-md',
    'bg-white/90',
    'border-b',
    colors.border.light,
    'shadow-sm',
  ]),
  
  // Modern footer
  footer: combineClasses([
    'border-t',
    colors.border.light,
    'py-12',
    'mt-16',
    colors.background.primary,
  ]),
};
