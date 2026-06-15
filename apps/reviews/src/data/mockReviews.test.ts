import { describe, it, expect } from 'vitest';
import { getReviewsForGame } from './mockReviews';

describe('mockReviews', () => {
  it('returns the reviews for a known game', () => {
    const reviews = getReviewsForGame('game-1');
    expect(reviews.length).toBe(3);
    expect(reviews.every((r) => r.gameId === 'game-1')).toBe(true);
  });

  it('returns an empty array for a game with no reviews', () => {
    expect(getReviewsForGame('nonexistent')).toEqual([]);
  });
});
