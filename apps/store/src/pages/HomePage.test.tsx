import '@testing-library/jest-dom/vitest';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HomePage } from './HomePage';

const renderHome = () =>
  render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>,
  );

describe('HomePage', () => {
  it('renders the full catalog', () => {
    renderHome();
    expect(screen.getByText('10 games')).toBeInTheDocument();
  });

  it('filters by search query', () => {
    renderHome();
    fireEvent.change(screen.getByPlaceholderText('Search games...'), {
      target: { value: 'Echoes' },
    });
    expect(screen.getByText('Echoes of Eternity')).toBeInTheDocument();
    expect(screen.getByText('1 games')).toBeInTheDocument();
  });

  it('shows an empty state when nothing matches', () => {
    renderHome();
    fireEvent.change(screen.getByPlaceholderText('Search games...'), {
      target: { value: 'zzzzzzz' },
    });
    expect(screen.getByText('No games found')).toBeInTheDocument();
  });

  it('filters by genre and applies each sort option', () => {
    renderHome();
    fireEvent.click(screen.getByRole('button', { name: 'RPG' }));
    const sort = screen.getByLabelText('Sort games');
    ['price-asc', 'price-desc', 'title', 'rating'].forEach((value) =>
      fireEvent.change(sort, { target: { value } }),
    );
    fireEvent.click(screen.getByRole('button', { name: 'RPG' })); // toggle off
    expect(screen.getByText('10 games')).toBeInTheDocument();
  });
});
