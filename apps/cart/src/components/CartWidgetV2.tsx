import { useState } from 'react';
import { Badge } from '@mgs/design-system';
import { useCart } from '../store/CartProvider';
import { CartProvider } from '../store/CartProvider';

/**
 * CartWidget v2 — Enhanced version with:
 * - Animated cart icon with pulse effect on add
 * - Item count badge
 * - Quick total display
 * - Slide-out mini cart panel
 */
function CartWidgetV2Inner() {
  const { items, totalItems, totalPrice, removeItem } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  // Animate on cart update
  const prevCount = useState(totalItems)[0];
  if (totalItems > prevCount && !justAdded) {
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 600);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
          justAdded
            ? 'bg-accent/20 animate-pulse-glow'
            : 'bg-surface-elevated hover:bg-surface-overlay'
        }`}
        aria-label={`Shopping cart with ${totalItems} items`}
        aria-expanded={isOpen}
      >
        {/* Animated cart icon */}
        <div className={`transition-transform ${justAdded ? 'scale-125' : 'scale-100'}`}>
          <svg className="w-5 h-5 text-text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
          </svg>
        </div>

        {/* Count badge */}
        {totalItems > 0 && (
          <Badge variant="accent" size="sm" className="absolute -top-2 -right-2 min-w-[22px] justify-center animate-bounce-in">
            {totalItems}
          </Badge>
        )}

        {/* Quick total */}
        {totalItems > 0 && (
          <span className="text-sm font-medium text-text-primary hidden sm:inline">
            ${totalPrice.toFixed(2)}
          </span>
        )}
      </button>

      {/* Slide-out panel */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} aria-hidden="true" />
          <div className="absolute right-0 top-full mt-2 w-96 bg-surface-secondary rounded-card shadow-card-hover border border-white/10 animate-slide-down z-50">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="font-display font-semibold text-text-primary">
                Cart <span className="text-text-muted font-normal text-sm">v2</span>
              </h3>
              <Badge variant="info" size="sm">{totalItems} items</Badge>
            </div>

            {items.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-4xl mb-3">🛒</div>
                <p className="text-text-muted">Your cart is empty</p>
                <p className="text-xs text-text-muted mt-1">Add games to get started</p>
              </div>
            ) : (
              <>
                <ul className="max-h-72 overflow-y-auto">
                  {items.map((item, idx) => (
                    <li
                      key={item.gameId}
                      className="flex items-center gap-3 p-3 border-b border-white/5 hover:bg-white/5 transition-colors animate-slide-up"
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-14 h-14 rounded-lg object-cover bg-surface-elevated"
                        loading="lazy"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">{item.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-text-muted">×{item.quantity}</span>
                          <span className="text-sm font-semibold text-accent">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(item.gameId)}
                        className="text-text-muted hover:text-accent transition-colors p-1 rounded-lg hover:bg-white/5"
                        aria-label={`Remove ${item.title}`}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="p-4 border-t border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">Total</span>
                    <span className="text-xl font-bold text-text-primary">${totalPrice.toFixed(2)}</span>
                  </div>
                  <button className="w-full bg-accent hover:bg-accent-hover text-white font-semibold py-2.5 rounded-lg transition-colors">
                    Checkout →
                  </button>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default function CartWidgetV2() {
  return (
    <CartProvider>
      <CartWidgetV2Inner />
    </CartProvider>
  );
}
