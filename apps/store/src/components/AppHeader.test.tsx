import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { dispatch, EventNames } from '@mgs/event-bus';

vi.mock('./RemoteComponent', () => ({
  RemoteComponent: () => <div data-testid="cart-widget" />,
}));

import { AppHeader } from './AppHeader';

describe('AppHeader', () => {
  it('renders navigation and updates the cart badge from CART_UPDATED', () => {
    render(
      <MemoryRouter>
        <AppHeader />
      </MemoryRouter>,
    );
    expect(screen.getByText('GameStore')).toBeInTheDocument();
    expect(screen.getByTestId('cart-widget')).toBeInTheDocument();

    act(() =>
      dispatch(EventNames.CART_UPDATED, { items: [], totalItems: 3, totalPrice: 0 }),
    );
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('marks the cart route as active when on /cart', () => {
    render(
      <MemoryRouter initialEntries={['/cart']}>
        <AppHeader />
      </MemoryRouter>,
    );
    expect(screen.getByRole('link', { name: /^Cart/ })).toHaveClass('text-accent');
  });
});
