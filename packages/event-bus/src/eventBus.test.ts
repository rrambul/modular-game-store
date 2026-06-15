import { describe, it, expect, vi } from 'vitest';
import { dispatch, listen, EventNames } from './eventBus';

describe('event bus', () => {
  it('delivers a dispatched payload to a listener', () => {
    const handler = vi.fn();
    const off = listen(EventNames.CART_ITEM_ADDED, handler);

    dispatch(EventNames.CART_ITEM_ADDED, { gameId: '1', title: 'X', price: 9.99, image: 'img' });

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith({ gameId: '1', title: 'X', price: 9.99, image: 'img' });
    off();
  });

  it('stops delivering after unsubscribe', () => {
    const handler = vi.fn();
    const off = listen(EventNames.CART_UPDATED, handler);
    off();

    dispatch(EventNames.CART_UPDATED, { items: [], totalItems: 0, totalPrice: 0 });

    expect(handler).not.toHaveBeenCalled();
  });

  it('only notifies listeners for the matching event name', () => {
    const handler = vi.fn();
    const off = listen(EventNames.REVIEW_SUBMITTED, handler);

    dispatch(EventNames.CART_ITEM_ADDED, { gameId: '1', title: 'X', price: 1, image: 'i' });

    expect(handler).not.toHaveBeenCalled();
    off();
  });
});
