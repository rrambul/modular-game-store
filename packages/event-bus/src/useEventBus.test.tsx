import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { useEventBus, dispatch, EventNames } from './index';

type AddPayload = { gameId: string; title: string; price: number; image: string };

function Listener({ onEvent }: { onEvent: (p: AddPayload) => void }) {
  useEventBus(EventNames.CART_ITEM_ADDED, onEvent);
  return null;
}

const payload = (gameId: string): AddPayload => ({ gameId, title: 'X', price: 1, image: 'i' });

describe('useEventBus', () => {
  it('invokes the handler when the event fires', () => {
    const onEvent = vi.fn();
    render(<Listener onEvent={onEvent} />);
    dispatch(EventNames.CART_ITEM_ADDED, payload('1'));
    expect(onEvent).toHaveBeenCalledWith(payload('1'));
  });

  it('calls the latest handler without re-subscribing', () => {
    const first = vi.fn();
    const second = vi.fn();
    const { rerender } = render(<Listener onEvent={first} />);
    rerender(<Listener onEvent={second} />);
    dispatch(EventNames.CART_ITEM_ADDED, payload('2'));
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledOnce();
  });

  it('stops listening after unmount', () => {
    const onEvent = vi.fn();
    const { unmount } = render(<Listener onEvent={onEvent} />);
    unmount();
    dispatch(EventNames.CART_ITEM_ADDED, payload('3'));
    expect(onEvent).not.toHaveBeenCalled();
  });
});
