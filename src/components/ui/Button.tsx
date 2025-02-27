import { ReactNode } from 'react';
import { colors, combineClasses } from '../../styles/theme';

type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'danger' | 'ghost';
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  className?: string;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  rounded?: boolean;
  loading?: boolean;
}

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  type = 'button',
  disabled = false,
  className = '',
  icon,
  iconPosition = 'left',
  fullWidth = false,
  rounded = false,
  loading = false,
}: ButtonProps) => {
  // Button color classes based on variant
  const variantClasses = {
    primary: combineClasses([
      colors.button.primary.bg,
      colors.button.primary.text,
      colors.button.primary.hover,
      colors.button.primary.active,
      colors.button.primary.focus,
      'shadow-sm',
    ]),
    secondary: combineClasses([
      colors.button.secondary.bg,
      colors.button.secondary.text,
      colors.button.secondary.hover,
      colors.button.secondary.active,
      colors.button.secondary.focus,
      colors.button.secondary.border,
    ]),
    accent: combineClasses([
      colors.button.accent.bg,
      colors.button.accent.text,
      colors.button.accent.hover,
      colors.button.accent.active,
      colors.button.accent.focus,
      'shadow-sm',
    ]),
    danger: combineClasses([
      colors.button.danger.bg,
      colors.button.danger.text,
      colors.button.danger.hover,
      colors.button.danger.active,
      colors.button.danger.focus,
      'shadow-sm',
    ]),
    ghost: combineClasses([
      'bg-transparent',
      colors.text.secondary,
      'hover:bg-secondary-100',
      'active:bg-secondary-200',
      'focus:ring focus:ring-secondary-200',
    ]),
  };
  
  // Button size classes
  const sizeClasses = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-2.5 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
    xl: 'px-6 py-3 text-lg',
  };
  
  // Icon classes for positioning
  const getIconClasses = () => {
    return iconPosition === 'left' ? 'mr-2 -ml-1' : 'ml-2 -mr-1';
  };
  
  // Common button classes
  const buttonClasses = combineClasses([
    'inline-flex',
    'items-center',
    'justify-center',
    'font-medium',
    'transition-all',
    'duration-200',
    'ease-in-out',
    rounded ? 'rounded-full' : 'rounded-md',
    'focus:outline-none',
    disabled || loading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer',
    fullWidth ? 'w-full' : '',
    variantClasses[variant],
    sizeClasses[size],
    className,
  ]);
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={buttonClasses}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      
      {icon && iconPosition === 'left' && !loading && (
        <span className={getIconClasses()}>{icon}</span>
      )}
      
      {children}
      
      {icon && iconPosition === 'right' && (
        <span className={getIconClasses()}>{icon}</span>
      )}
    </button>
  );
};

export default Button;
