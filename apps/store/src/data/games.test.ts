import { describe, it, expect } from 'vitest';
import { games, genres, getGameById, getGamesByGenre } from './games';

describe('games data', () => {
  it('exposes the full catalog', () => {
    expect(games.length).toBeGreaterThanOrEqual(10);
    expect(games.every((g) => g.id && g.title && typeof g.price === 'number')).toBe(true);
  });

  it('finds a game by id', () => {
    expect(getGameById('game-1')?.title).toBe('Echoes of Eternity');
  });

  it('returns undefined for an unknown id', () => {
    expect(getGameById('does-not-exist')).toBeUndefined();
  });

  it('derives a unique, non-empty genre list', () => {
    expect(genres).toContain('RPG');
    expect(new Set(genres).size).toBe(genres.length);
  });

  it('filters games by genre', () => {
    const rpgs = getGamesByGenre('RPG');
    expect(rpgs.length).toBeGreaterThan(0);
    expect(rpgs.every((g) => g.genre === 'RPG')).toBe(true);
    expect(getGamesByGenre('NotAGenre')).toEqual([]);
  });
});
