import '@testing-library/jest-dom/vitest';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ReviewList from './ReviewList';

describe('ReviewList', () => {
  it('renders existing reviews and the rating summary', () => {
    render(<ReviewList gameId="game-1" />);
    expect(screen.getByText('GamerPro99')).toBeInTheDocument();
    expect(screen.getByText('4.7')).toBeInTheDocument(); // (5+4+5)/3
    expect(screen.getByText('3 reviews')).toBeInTheDocument();
  });

  it('filters by star rating', () => {
    render(<ReviewList gameId="game-1" />);
    fireEvent.click(screen.getByRole('button', { name: '4★' }));
    expect(screen.getByText('CasualPlayer')).toBeInTheDocument();
    expect(screen.queryByText('GamerPro99')).not.toBeInTheDocument();
  });

  it('sorts reviews without error', () => {
    render(<ReviewList gameId="game-1" />);
    const sort = screen.getByLabelText('Sort reviews');
    ['oldest', 'highest', 'lowest', 'helpful', 'newest'].forEach((value) =>
      fireEvent.change(sort, { target: { value } }),
    );
    expect(screen.getByText('RPGLover')).toBeInTheDocument();
  });

  it('adds a submitted review and updates the count', () => {
    render(<ReviewList gameId="game-1" />);
    expect(screen.getByText('3 reviews')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Write a Review' }));
    fireEvent.click(screen.getByRole('radio', { name: 'Rate 5 stars' }));
    fireEvent.change(screen.getByLabelText('Display Name'), { target: { value: 'NewbieReviewer' } });
    fireEvent.change(screen.getByLabelText('Your Review'), { target: { value: 'Loved it' } });
    fireEvent.click(screen.getByRole('button', { name: 'Submit Review' }));

    expect(screen.getByText('NewbieReviewer')).toBeInTheDocument();
    expect(screen.getByText('4 reviews')).toBeInTheDocument();
  });

  it('shows an empty message when a filter matches nothing', () => {
    render(<ReviewList gameId="game-1" />);
    fireEvent.click(screen.getByRole('button', { name: '1★' }));
    expect(screen.getByText('No reviews match your filter.')).toBeInTheDocument();
  });
});
