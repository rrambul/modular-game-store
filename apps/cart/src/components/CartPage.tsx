import { Button, Card } from '@mgs/design-system';
import { useCart, CartProvider } from '../store/CartProvider';

function CartPageInner() {
  const { items, totalItems, totalPrice, removeItem, updateQuantity, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <svg width="48" height="48" className="w-12 h-12 text-text-muted mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
        </svg>
        <h2 className="text-2xl font-display font-bold text-text-primary mb-2">Your cart is empty</h2>
        <p className="text-text-secondary">Browse the store and add some games!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-display font-bold text-text-primary">
          Shopping Cart <span className="text-lg text-text-muted font-normal">({totalItems} items)</span>
        </h1>
        <Button variant="ghost" size="sm" onClick={clearCart}>
          Clear Cart
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Items list */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => (
            <Card key={item.gameId} variant="outlined" padding="none">
              <div className="flex items-center gap-4 p-4">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-24 h-16 rounded object-cover bg-surface-elevated"
                  loading="lazy"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-text-primary truncate">{item.title}</h3>
                  <p className="text-sm text-text-secondary">${item.price.toFixed(2)} each</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.gameId, item.quantity - 1)}
                    className="w-8 h-8 rounded bg-surface-elevated hover:bg-surface-overlay text-text-primary flex items-center justify-center transition-colors"
                    aria-label={`Decrease quantity for ${item.title}`}
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-text-primary font-medium">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.gameId, item.quantity + 1)}
                    className="w-8 h-8 rounded bg-surface-elevated hover:bg-surface-overlay text-text-primary flex items-center justify-center transition-colors"
                    aria-label={`Increase quantity for ${item.title}`}
                  >
                    +
                  </button>
                </div>
                <span className="text-lg font-bold text-text-primary w-24 text-right">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
                <button
                  onClick={() => removeItem(item.gameId)}
                  className="text-text-muted hover:text-accent transition-colors p-1"
                  aria-label={`Remove ${item.title} from cart`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </Card>
          ))}
        </div>

        {/* Order summary */}
        <Card variant="default" padding="lg" className="self-start">
          <h2 className="text-lg font-display font-semibold text-text-primary mb-4">Order Summary</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-text-secondary">
              <span>Subtotal ({totalItems} items)</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-text-secondary">
              <span>Discount</span>
              <span className="text-success">−$0.00</span>
            </div>
            <hr className="border-white/10" />
            <div className="flex justify-between text-text-primary font-bold text-lg">
              <span>Total</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
          </div>
          <Button className="w-full mt-6" size="lg">
            Checkout
          </Button>
        </Card>
      </div>
    </div>
  );
}

export default function CartPage() {
  return (
    <CartProvider>
      <CartPageInner />
    </CartProvider>
  );
}
