import { createContext, useContext, useReducer, useEffect, useCallback, useRef, type ReactNode } from 'react';
import type { CartItem } from '@mgs/types';
import { dispatch as emitEvent, EventNames, useEventBus } from '@mgs/event-bus';
import {
  buildState,
  cartReducer,
  loadFromStorage,
  saveToStorage,
  STORAGE_KEY,
  type CartState,
} from './cartState';

const SYNC_EVENT = 'mgs:cart:sync'; // same-tab sync (StorageEvent only fires cross-tab)

// ---- Context ----
interface CartContextValue extends CartState {
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (gameId: string) => void;
  updateQuantity: (gameId: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

// Unique ID per provider instance so it can ignore its own sync broadcasts
let instanceCounter = 0;

export function CartProvider({ children }: { children: ReactNode }) {
  // Lazy initialiser — reads localStorage at mount time (not module-load time)
  const [state, localDispatch] = useReducer(cartReducer, undefined, () => buildState(loadFromStorage()));
  const instanceId = useRef(++instanceCounter);
  // Serialized snapshot of the items we last persisted or synced in. Comparing against
  // it prevents echoing a change back out (which would loop), without the fragile
  // "skip the next effect run" latch that could get stuck on a no-op sync.
  const lastSynced = useRef<string>();
  if (lastSynced.current === undefined) {
    lastSynced.current = JSON.stringify(state.items);
  }

  // Adopt the latest items from storage without re-broadcasting them.
  const pullFromStorage = useCallback(() => {
    const items = loadFromStorage();
    lastSynced.current = JSON.stringify(items);
    localDispatch({ type: 'SYNC', payload: items });
  }, []);

  // Listen for external "add to cart" events from other MFs
  useEventBus(EventNames.CART_ITEM_ADDED, (payload) => {
    localDispatch({ type: 'ADD_ITEM', payload });
  });

  // Sync across OTHER CartProvider instances on the same page (custom event)
  useEffect(() => {
    const onSync = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      // Ignore events we fired ourselves
      if (detail?.sourceId === instanceId.current) return;
      pullFromStorage();
    };
    window.addEventListener(SYNC_EVENT, onSync);
    return () => window.removeEventListener(SYNC_EVENT, onSync);
  }, [pullFromStorage]);

  // Sync across tabs via StorageEvent (only fires in other tabs)
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) pullFromStorage();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [pullFromStorage]);

  // Persist + broadcast only when the cart actually changed; always notify external
  // listeners (e.g. the host's cart-count badge) of the current totals so they hydrate
  // on mount even when nothing changed.
  useEffect(() => {
    emitEvent(EventNames.CART_UPDATED, {
      items: state.items,
      totalItems: state.totalItems,
      totalPrice: state.totalPrice,
    });

    const serialized = JSON.stringify(state.items);
    if (lastSynced.current === serialized) return;
    lastSynced.current = serialized;

    saveToStorage(state.items);
    // Notify other CartProvider instances on this page
    window.dispatchEvent(
      new CustomEvent(SYNC_EVENT, { detail: { sourceId: instanceId.current } }),
    );
  }, [state.items, state.totalItems, state.totalPrice]);

  const addItem = useCallback(
    (item: Omit<CartItem, 'quantity'>) => localDispatch({ type: 'ADD_ITEM', payload: item }),
    [],
  );

  const removeItem = useCallback(
    (gameId: string) => localDispatch({ type: 'REMOVE_ITEM', payload: { gameId } }),
    [],
  );

  const updateQuantity = useCallback(
    (gameId: string, quantity: number) =>
      localDispatch({ type: 'UPDATE_QUANTITY', payload: { gameId, quantity } }),
    [],
  );

  const clearCart = useCallback(() => localDispatch({ type: 'CLEAR' }), []);

  return (
    <CartContext.Provider value={{ ...state, addItem, removeItem, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within <CartProvider>');
  return ctx;
}
