import type { CartItem } from '@mgs/types';

/** localStorage key for the persisted cart */
export const STORAGE_KEY = 'mgs:cart';

// ---- State ----
export interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
}

export type CartAction =
  | { type: 'ADD_ITEM'; payload: Omit<CartItem, 'quantity'> }
  | { type: 'REMOVE_ITEM'; payload: { gameId: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { gameId: string; quantity: number } }
  | { type: 'CLEAR' }
  | { type: 'SYNC'; payload: CartItem[] };

export function computeTotals(items: CartItem[]): Pick<CartState, 'totalItems' | 'totalPrice'> {
  return {
    totalItems: items.reduce((sum, i) => sum + i.quantity, 0),
    totalPrice: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
  };
}

export function buildState(items: CartItem[]): CartState {
  return { items, ...computeTotals(items) };
}

export function cartReducer(state: CartState, action: CartAction): CartState {
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
      // Avoid unnecessary re-renders when the synced items are identical
      if (JSON.stringify(state.items) === JSON.stringify(action.payload)) return state;
      return buildState(action.payload);
    }
    default:
      return state;
  }
}

// ---- Persistence ----
export function isCartItem(value: unknown): value is CartItem {
  if (typeof value !== 'object' || value === null) return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.gameId === 'string' &&
    typeof item.title === 'string' &&
    typeof item.price === 'number' &&
    typeof item.image === 'string' &&
    typeof item.quantity === 'number' &&
    item.quantity > 0
  );
}

export function loadFromStorage(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    // Validate shape so malformed/corrupt data can't produce NaN totals downstream
    return Array.isArray(parsed) ? parsed.filter(isCartItem) : [];
  } catch {
    /* ignore corrupt data */
    return [];
  }
}

export function saveToStorage(items: CartItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* quota exceeded — silently ignore */
  }
}
