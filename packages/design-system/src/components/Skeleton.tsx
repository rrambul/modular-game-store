import type { HTMLAttributes } from 'react';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'rectangular' | 'circular';
  width?: string;
  height?: string;
}

const variantClasses: Record<string, string> = {
  text: 'rounded h-4',
  rectangular: 'rounded-card',
  circular: 'rounded-full',
};

export function Skeleton({ variant = 'text', width, height, className = '', style, ...props }: SkeletonProps) {
  return (
    <div
      className={`${variantClasses[variant]} bg-white/5 animate-pulse ${className}`}
      style={{ width, height, ...style }}
      role="status"
      aria-label="Loading"
      {...props}
    />
  );
}
