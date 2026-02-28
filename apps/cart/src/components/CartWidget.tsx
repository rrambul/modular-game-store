import { useState } from 'react';
import { Badge } from '@mgs/design-system';
import { useCart } from '../store/CartProvider';
import { CartProvider } from '../store/CartProvider';

/** Standalone-safe wrapper — provides CartProvider if none exists */
function CartWidgetInner() {
  const { items, totalItems, totalPrice } = useCart();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-elevated hover:bg-surface-overlay transition-colors"
        aria-label={`Shopping cart with ${totalItems} items`}
        aria-expanded={isOpen}
      >
        <svg className="w-5 h-5 text-text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
        </svg>
        {totalItems > 0 && (
          <Badge variant="accent" size="sm" className="absolute -top-1.5 -right-1.5 min-w-[20px] justify-center animate-bounce-in">
            {totalItems}
          </Badge>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-surface-secondary rounded-card shadow-card-hover border border-white/10 animate-slide-down z-50">
          <div className="p-4 border-b border-white/10">
            <h3 className="font-display font-semibold text-text-primary">Shopping Cart</h3>
          </div>

          {items.length === 0 ? (
            <div className="p-6 text-center text-text-muted">
              <p>Your cart is empty</p>
            </div>
          ) : (
            <>
              <ul className="max-h-64 overflow-y-auto divide-y divide-white/5">
                {items.map((item) => (
                  <li key={item.gameId} className="flex items-center gap-3 p-3">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-12 h-12 rounded object-cover bg-surface-elevated"
                      loading="lazy"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">{item.title}</p>
                      <p className="text-xs text-text-muted">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-sm font-semibold text-text-primary whitespace-nowrap">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="p-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-sm text-text-secondary">Total</span>
                <span className="text-lg font-bold text-text-primary">${totalPrice.toFixed(2)}</span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/** Exported federated component — wraps with CartProvider for isolation */
export default function CartWidget() {
  return (
    <CartProvider>
      <CartWidgetInner />
    </CartProvider>
  );
}
