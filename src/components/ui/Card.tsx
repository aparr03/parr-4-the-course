import { ReactNode } from 'react';
import { componentStyles, combineClasses } from '../../styles/theme';
import { animationClasses } from '../../styles/animations';

interface CardProps {
  children: ReactNode;
  className?: string;
  animate?: boolean;
  variant?: 'default' | 'bordered' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

const Card = ({
  children,
  className = '',
  animate = false,
  variant = 'default',
  padding = 'md',
  onClick,
}: CardProps) => {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8',
  };
  
  const variantClasses = {
    default: componentStyles.card,
    bordered: 'bg-white border border-secondary-200 rounded-xl',
    elevated: 'bg-white rounded-xl shadow-strong',
  };

  const classes = combineClasses([
    variantClasses[variant],
    paddingClasses[padding],
    animate ? animationClasses.fadeIn : '',
    onClick ? 'cursor-pointer transition-transform hover:scale-[1.01]' : '',
    className
  ]);

  return (
    <div className={classes} onClick={onClick}>
      {children}
    </div>
  );
};

export default Card;
