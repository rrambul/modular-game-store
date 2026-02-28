import { createContext, useContext, useReducer, useEffect, useCallback, useRef, type ReactNode } from 'react';
import type { CartItem } from '@mgs/types';
import { dispatch as emitEvent, EventNames, useEventBus } from '@mgs/event-bus';

// ---- Persistence ----
const STORAGE_KEY = 'mgs:cart';
const SYNC_EVENT = 'mgs:cart:sync'; // same-tab sync (StorageEvent only fires cross-tab)

function loadFromStorage(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore corrupt data */ }
  return [];
}

function saveToStorage(items: CartItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch { /* quota exceeded — silently ignore */ }
}

// ---- State ----
interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
}

function computeTotals(items: CartItem[]): Pick<CartState, 'totalItems' | 'totalPrice'> {
  return {
    totalItems: items.reduce((sum, i) => sum + i.quantity, 0),
    totalPrice: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
  };
}

function buildState(items: CartItem[]): CartState {
  return { items, ...computeTotals(items) };
}

// ---- Actions ----
type CartAction =
  | { type: 'ADD_ITEM'; payload: Omit<CartItem, 'quantity'> }
  | { type: 'REMOVE_ITEM'; payload: { gameId: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { gameId: string; quantity: number } }
  | { type: 'CLEAR' }
  | { type: 'SYNC'; payload: CartItem[] };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find((i) => i.gameId === action.payload.gameId);
      const items = existing
        ? state.items.map((i) =>
            i.gameId === action.payload.gameId ? { ...i, quantity: i.quantity + 1 } : i,
          )
        : [...state.items, { ...action.payload, quantity: 1 }];
      return buildState(items);
    }
    case 'REMOVE_ITEM': {
      const items = state.items.filter((i) => i.gameId !== action.payload.gameId);
      return buildState(items);
    }
    case 'UPDATE_QUANTITY': {
      if (action.payload.quantity <= 0) {
        const items = state.items.filter((i) => i.gameId !== action.payload.gameId);
        return buildState(items);
      }
      const items = state.items.map((i) =>
        i.gameId === action.payload.gameId ? { ...i, quantity: action.payload.quantity } : i,
      );
      return buildState(items);
    }
    case 'CLEAR':
      return buildState([]);
    case 'SYNC': {
      // Avoid unnecessary re-renders if items haven't actually changed
      const currentIds = state.items.map((i) => `${i.gameId}:${i.quantity}`).join(',');
      const nextIds = action.payload.map((i) => `${i.gameId}:${i.quantity}`).join(',');
      if (currentIds === nextIds) return state;
      return buildState(action.payload);
    }
    default:
      return state;
  }
}

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
  const skipNextSync = useRef(false);

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
      const items = loadFromStorage();
      skipNextSync.current = true;
      localDispatch({ type: 'SYNC', payload: items });
    };
    window.addEventListener(SYNC_EVENT, onSync);
    return () => window.removeEventListener(SYNC_EVENT, onSync);
  }, []);

  // Sync across tabs via StorageEvent (only fires in other tabs)
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          skipNextSync.current = true;
          localDispatch({ type: 'SYNC', payload: JSON.parse(e.newValue) });
        } catch { /* ignore */ }
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Persist to localStorage & broadcast whenever cart changes
  useEffect(() => {
    if (skipNextSync.current) {
      skipNextSync.current = false;
      return;
    }
    saveToStorage(state.items);

    // Notify other CartProvider instances on this page
    window.dispatchEvent(
      new CustomEvent(SYNC_EVENT, { detail: { sourceId: instanceId.current } }),
    );

    // Broadcast for the host's own listeners (e.g. cart count badge)
    emitEvent(EventNames.CART_UPDATED, {
      items: state.items,
      totalItems: state.totalItems,
      totalPrice: state.totalPrice,
    });
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
