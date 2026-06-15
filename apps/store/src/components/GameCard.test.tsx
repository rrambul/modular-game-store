import '@testing-library/jest-dom/vitest';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { Game } from '@mgs/types';
import { listen, EventNames } from '@mgs/event-bus';
import { GameCard } from './GameCard';
import { getGameById } from '../data/games';

const baseGame = getGameById('game-1') as Game;

const renderCard = (game: Game = baseGame) =>
  render(
    <MemoryRouter>
      <GameCard game={game} />
    </MemoryRouter>,
  );

describe('GameCard', () => {
  it('renders the game and dispatches an add-to-cart event', () => {
    const events: unknown[] = [];
    const off = listen(EventNames.CART_ITEM_ADDED, (p) => events.push(p));
    renderCard();
    expect(screen.getByText('Echoes of Eternity')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Add to Cart' }));
    expect(events).toHaveLength(1);
    expect(screen.getByRole('button', { name: '✓ Added' })).toBeDisabled();
    off();
  });

  it('shows a Free badge for a zero-price game', () => {
    renderCard({ ...baseGame, price: 0, originalPrice: undefined });
    expect(screen.getAllByText('Free').length).toBeGreaterThan(0);
  });

  it('renders multiple platform icons', () => {
    renderCard({ ...baseGame, platforms: ['Nintendo', 'Mobile', 'PlayStation'] });
    expect(screen.getByText('Echoes of Eternity')).toBeInTheDocument();
  });
});
