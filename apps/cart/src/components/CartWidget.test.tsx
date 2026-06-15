import '@testing-library/jest-dom/vitest';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { dispatch, EventNames } from '@mgs/event-bus';
import CartWidget from './CartWidget';

describe('CartWidget', () => {
  beforeEach(() => localStorage.clear());

  it('shows an empty cart when opened', () => {
    render(<CartWidget />);
    fireEvent.click(screen.getByRole('button', { name: /shopping cart/i }));
    expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
  });

  it('shows a badge and the item list after an add event', () => {
    render(<CartWidget />);
    act(() =>
      dispatch(EventNames.CART_ITEM_ADDED, { gameId: 'g1', title: 'Echoes', price: 10, image: 'i' }),
    );
    expect(screen.getByText('1')).toBeInTheDocument(); // count badge
    fireEvent.click(screen.getByRole('button', { name: /shopping cart/i }));
    expect(screen.getByText('Echoes')).toBeInTheDocument();
    expect(screen.getAllByText('$10.00').length).toBeGreaterThan(0);
  });
});
