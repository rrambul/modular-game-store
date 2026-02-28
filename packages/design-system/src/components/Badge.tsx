import type { HTMLAttributes } from 'react';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'accent' | 'success' | 'warning' | 'info';
  size?: 'sm' | 'md';
}

const variants: Record<string, string> = {
  default: 'bg-white/10 text-text-primary',
  accent: 'bg-accent/20 text-accent',
  success: 'bg-success/20 text-success',
  warning: 'bg-warning/20 text-warning',
  info: 'bg-brand-500/20 text-brand-400',
};

const sizes: Record<string, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
};

export function Badge({ variant = 'default', size = 'sm', className = '', children, ...props }: BadgeProps) {
  return (
    <span
      className={`${variants[variant]} ${sizes[size]} inline-flex items-center rounded-full font-medium ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
