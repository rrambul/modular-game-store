import '@testing-library/jest-dom/vitest';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { dispatch, EventNames } from '@mgs/event-bus';
import CartPage from './CartPage';

const addEcho = () =>
  act(() =>
    dispatch(EventNames.CART_ITEM_ADDED, { gameId: 'g1', title: 'Echoes', price: 10, image: 'i' }),
  );

describe('CartPage', () => {
  beforeEach(() => localStorage.clear());

  it('renders an empty state', () => {
    render(<CartPage />);
    expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
  });

  it('supports quantity changes and removal', () => {
    render(<CartPage />);
    addEcho();
    expect(screen.getByText('Echoes')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Increase quantity/i }));
    expect(screen.getByText('2')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Decrease quantity/i }));
    fireEvent.click(screen.getByRole('button', { name: /Remove Echoes/i }));
    expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
  });

  it('clears the whole cart', () => {
    render(<CartPage />);
    addEcho();
    fireEvent.click(screen.getByRole('button', { name: /Clear Cart/i }));
    expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
  });
});
