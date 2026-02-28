import { useEffect, useState } from 'react';
import { EventNames, useEventBus } from '@mgs/event-bus';
import { Badge } from '@mgs/design-system';
import { Link, useLocation } from 'react-router-dom';
import { RemoteComponent } from './RemoteComponent';

export function AppHeader() {
  const location = useLocation();
  const [cartCount, setCartCount] = useState(0);

  useEventBus(EventNames.CART_UPDATED, (payload) => {
    setCartCount(payload.totalItems);
  });

  // Also listen for individual adds to increment optimistically
  useEventBus(EventNames.CART_ITEM_ADDED, () => {
    setCartCount((prev) => prev + 1);
  });

  return (
    <header className="sticky top-0 z-40 bg-surface-secondary/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <span className="text-2xl">🎮</span>
          <span className="text-xl font-display font-bold text-text-primary group-hover:text-accent transition-colors">
            GameStore
          </span>
          <Badge variant="info" size="sm">MF</Badge>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
          <Link
            to="/"
            className={`text-sm font-medium transition-colors ${
              location.pathname === '/' ? 'text-accent' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Store
          </Link>
          <Link
            to="/cart"
            className={`text-sm font-medium transition-colors ${
              location.pathname === '/cart' ? 'text-accent' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Cart
            {cartCount > 0 && (
              <Badge variant="accent" size="sm" className="ml-1.5 animate-bounce-in">
                {cartCount}
              </Badge>
            )}
          </Link>
        </nav>

        {/* Cart widget (from Cart MF) */}
        <div className="flex items-center gap-3">
          <RemoteComponent
            remoteName="cart"
            componentName="CartWidget"
            fallback={
              <div className="w-10 h-10 rounded-lg bg-surface-elevated animate-pulse" />
            }
            errorFallback={
              <Link to="/cart" className="relative flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-elevated hover:bg-surface-overlay transition-colors">
                <svg className="w-5 h-5 text-text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                </svg>
                {cartCount > 0 && (
                  <Badge variant="accent" size="sm" className="absolute -top-1.5 -right-1.5">
                    {cartCount}
                  </Badge>
                )}
              </Link>
            }
          />
        </div>
      </div>
    </header>
  );
}
