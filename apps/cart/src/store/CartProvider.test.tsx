import '@testing-library/jest-dom/vitest';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { dispatch, listen, EventNames } from '@mgs/event-bus';
import { CartProvider, useCart } from './CartProvider';
import { STORAGE_KEY } from './cartState';

function Consumer() {
  const { items, totalItems, totalPrice, addItem, removeItem, updateQuantity, clearCart } = useCart();
  return (
    <div>
      <span data-testid="count">{totalItems}</span>
      <span data-testid="price">{totalPrice}</span>
      <ul>
        {items.map((i) => (
          <li key={i.gameId}>
            {i.title}:{i.quantity}
          </li>
        ))}
      </ul>
      <button onClick={() => addItem({ gameId: 'g1', title: 'G1', price: 10, image: 'i' })}>add</button>
      <button onClick={() => updateQuantity('g1', 3)}>qty3</button>
      <button onClick={() => updateQuantity('g1', 0)}>qty0</button>
      <button onClick={() => removeItem('g1')}>remove</button>
      <button onClick={clearCart}>clear</button>
    </div>
  );
}

function renderCart() {
  return render(
    <CartProvider>
      <Consumer />
    </CartProvider>,
  );
}

describe('CartProvider', () => {
  beforeEach(() => localStorage.clear());

  it('throws when useCart is used outside a provider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Consumer />)).toThrow(/useCart must be used within/);
    spy.mockRestore();
  });

  it('adds, updates, removes and clears items, persisting to localStorage', () => {
    renderCart();
    fireEvent.click(screen.getByText('add'));
    expect(screen.getByTestId('count')).toHaveTextContent('1');
    expect(screen.getByTestId('price')).toHaveTextContent('10');
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toHaveLength(1);

    fireEvent.click(screen.getByText('qty3'));
    expect(screen.getByTestId('count')).toHaveTextContent('3');

    fireEvent.click(screen.getByText('remove'));
    expect(screen.getByTestId('count')).toHaveTextContent('0');

    fireEvent.click(screen.getByText('add'));
    fireEvent.click(screen.getByText('clear'));
    expect(screen.getByTestId('count')).toHaveTextContent('0');
  });

  it('removes an item when its quantity drops to zero', () => {
    renderCart();
    fireEvent.click(screen.getByText('add'));
    fireEvent.click(screen.getByText('qty0'));
    expect(screen.getByTestId('count')).toHaveTextContent('0');
  });

  it('hydrates from localStorage on mount', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([{ gameId: 'g1', title: 'G1', price: 10, image: 'i', quantity: 2 }]),
    );
    renderCart();
    expect(screen.getByTestId('count')).toHaveTextContent('2');
  });

  it('reacts to CART_ITEM_ADDED from the event bus and emits CART_UPDATED', () => {
    const updates: number[] = [];
    const off = listen(EventNames.CART_UPDATED, (p) => updates.push(p.totalItems));
    renderCart();
    act(() => dispatch(EventNames.CART_ITEM_ADDED, { gameId: 'g9', title: 'G9', price: 5, image: 'i' }));
    expect(screen.getByTestId('count')).toHaveTextContent('1');
    expect(updates.at(-1)).toBe(1);
    off();
  });

  it('syncs from a cross-tab StorageEvent', () => {
    renderCart();
    act(() => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify([{ gameId: 'g1', title: 'G1', price: 10, image: 'i', quantity: 4 }]),
      );
      window.dispatchEvent(
        new StorageEvent('storage', { key: STORAGE_KEY, newValue: localStorage.getItem(STORAGE_KEY) }),
      );
    });
    expect(screen.getByTestId('count')).toHaveTextContent('4');
  });
});
