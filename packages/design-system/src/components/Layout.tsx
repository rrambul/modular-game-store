import type { ReactNode, HTMLAttributes } from 'react';

export interface LayoutProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export interface HeaderProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
}

export function Layout({ children, className = '', ...props }: LayoutProps) {
  return (
    <div className={`min-h-screen bg-surface text-text-primary font-sans ${className}`} {...props}>
      {children}
    </div>
  );
}

export function Header({ children, className = '', ...props }: HeaderProps) {
  return (
    <header
      className={`sticky top-0 z-40 bg-surface-secondary/80 backdrop-blur-md border-b border-white/5 ${className}`}
      {...props}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {children}
      </div>
    </header>
  );
}

export function Main({ children, className = '', ...props }: LayoutProps) {
  return (
    <main className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${className}`} {...props}>
      {children}
    </main>
  );
}
