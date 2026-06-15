import { describe, it, expect, beforeEach } from 'vitest';
import type { CartItem } from '@mgs/types';
import {
  buildState,
  cartReducer,
  isCartItem,
  loadFromStorage,
  STORAGE_KEY,
} from './cartState';

const item = (over: Partial<CartItem> = {}): CartItem => ({
  gameId: 'g1',
  title: 'Game',
  price: 10,
  image: 'img',
  quantity: 1,
  ...over,
});

describe('cartReducer', () => {
  it('adds a new item with quantity 1 and computes totals', () => {
    const next = cartReducer(buildState([]), {
      type: 'ADD_ITEM',
      payload: { gameId: 'g1', title: 'Game', price: 10, image: 'img' },
    });
    expect(next.items).toHaveLength(1);
    expect(next.items[0].quantity).toBe(1);
    expect(next.totalItems).toBe(1);
    expect(next.totalPrice).toBe(10);
  });

  it('increments quantity when adding an existing item', () => {
    const next = cartReducer(buildState([item({ quantity: 1 })]), {
      type: 'ADD_ITEM',
      payload: { gameId: 'g1', title: 'Game', price: 10, image: 'img' },
    });
    expect(next.items).toHaveLength(1);
    expect(next.items[0].quantity).toBe(2);
    expect(next.totalPrice).toBe(20);
  });

  it('removes an item', () => {
    const next = cartReducer(buildState([item(), item({ gameId: 'g2' })]), {
      type: 'REMOVE_ITEM',
      payload: { gameId: 'g1' },
    });
    expect(next.items.map((i) => i.gameId)).toEqual(['g2']);
  });

  it('removes the item when quantity is updated to 0 or below', () => {
    const next = cartReducer(buildState([item({ quantity: 2 })]), {
      type: 'UPDATE_QUANTITY',
      payload: { gameId: 'g1', quantity: 0 },
    });
    expect(next.items).toHaveLength(0);
  });

  it('updates quantity and recomputes totals', () => {
    const next = cartReducer(buildState([item({ quantity: 1, price: 10 })]), {
      type: 'UPDATE_QUANTITY',
      payload: { gameId: 'g1', quantity: 3 },
    });
    expect(next.items[0].quantity).toBe(3);
    expect(next.totalItems).toBe(3);
    expect(next.totalPrice).toBe(30);
  });

  it('clears the cart', () => {
    const next = cartReducer(buildState([item()]), { type: 'CLEAR' });
    expect(next.items).toHaveLength(0);
    expect(next.totalPrice).toBe(0);
  });

  it('returns the same state reference for an identical SYNC (no needless re-render)', () => {
    const state = buildState([item({ quantity: 2 })]);
    const synced = cartReducer(state, { type: 'SYNC', payload: [item({ quantity: 2 })] });
    expect(synced).toBe(state);
  });

  it('applies a SYNC when items actually differ', () => {
    const state = buildState([item({ quantity: 1 })]);
    const next = cartReducer(state, { type: 'SYNC', payload: [item({ quantity: 5 })] });
    expect(next).not.toBe(state);
    expect(next.items[0].quantity).toBe(5);
    expect(next.totalItems).toBe(5);
  });
});

describe('isCartItem', () => {
  it('accepts a well-formed item', () => {
    expect(isCartItem(item())).toBe(true);
  });

  it('rejects malformed values', () => {
    expect(isCartItem(null)).toBe(false);
    expect(isCartItem({ gameId: 'g1' })).toBe(false);
    expect(isCartItem({ ...item(), price: 'free' })).toBe(false);
    expect(isCartItem({ ...item(), quantity: 0 })).toBe(false);
  });
});

describe('loadFromStorage', () => {
  beforeEach(() => localStorage.clear());

  it('returns [] when storage is empty', () => {
    expect(loadFromStorage()).toEqual([]);
  });

  it('returns [] for corrupt JSON', () => {
    localStorage.setItem(STORAGE_KEY, '{not valid json');
    expect(loadFromStorage()).toEqual([]);
  });

  it('filters out malformed items so totals never become NaN', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([item(), { gameId: 'bad' }, 42]));
    const loaded = loadFromStorage();
    expect(loaded).toHaveLength(1);
    expect(loaded[0].gameId).toBe('g1');
  });
});
