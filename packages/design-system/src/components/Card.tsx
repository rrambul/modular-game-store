import { type HTMLAttributes, forwardRef } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'interactive' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const variantClasses: Record<string, string> = {
  default: 'bg-surface-secondary shadow-card',
  interactive: 'bg-surface-secondary shadow-card hover:shadow-card-hover hover:-translate-y-1 cursor-pointer',
  outlined: 'bg-surface-secondary/50 border border-white/10',
};

const paddingClasses: Record<string, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-8',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', padding = 'md', className = '', children, ...props }, ref) => (
    <div
      ref={ref}
      className={`${variantClasses[variant]} ${paddingClasses[padding]} rounded-card transition-all duration-300 ${className}`}
      {...props}
    >
      {children}
    </div>
  ),
);

Card.displayName = 'Card';
