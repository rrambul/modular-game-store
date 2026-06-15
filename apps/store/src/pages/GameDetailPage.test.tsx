import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { listen, EventNames } from '@mgs/event-bus';

vi.mock('../components/RemoteComponent', () => ({
  RemoteComponent: ({ componentName }: { componentName: string }) => (
    <div data-testid="remote">{componentName}</div>
  ),
}));

import { GameDetailPage } from './GameDetailPage';

const renderAt = (id: string) =>
  render(
    <MemoryRouter initialEntries={[`/game/${id}`]}>
      <Routes>
        <Route path="/game/:id" element={<GameDetailPage />} />
      </Routes>
    </MemoryRouter>,
  );

describe('GameDetailPage', () => {
  it('renders a game and embeds the reviews remote, dispatching add-to-cart', () => {
    const events: unknown[] = [];
    const off = listen(EventNames.CART_ITEM_ADDED, (p) => events.push(p));
    renderAt('game-1');

    expect(screen.getByRole('heading', { name: 'Echoes of Eternity' })).toBeInTheDocument();
    expect(screen.getByTestId('remote')).toHaveTextContent('ReviewList');

    fireEvent.click(screen.getByRole('button', { name: 'Add to Cart' }));
    expect(events).toHaveLength(1);
    off();
  });

  it('shows a not-found state for an unknown id', () => {
    renderAt('does-not-exist');
    expect(screen.getByText('Game Not Found')).toBeInTheDocument();
  });
});
