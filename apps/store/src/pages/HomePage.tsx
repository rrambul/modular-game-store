import { useState, useMemo } from 'react';
import { Badge, Input } from '@mgs/design-system';
import { games, genres } from '../data/games';
import { GameCard } from '../components/GameCard';

export function HomePage() {
  const [search, setSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'title' | 'price-asc' | 'price-desc' | 'rating'>('rating');

  const filteredGames = useMemo(() => {
    let result = games;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (g) =>
          g.title.toLowerCase().includes(q) ||
          g.description.toLowerCase().includes(q) ||
          g.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }

    if (selectedGenre) {
      result = result.filter((g) => g.genre === selectedGenre);
    }

    return result.sort((a, b) => {
      switch (sortBy) {
        case 'title': return a.title.localeCompare(b.title);
        case 'price-asc': return a.price - b.price;
        case 'price-desc': return b.price - a.price;
        case 'rating': return b.rating - a.rating;
        default: return 0;
      }
    });
  }, [search, selectedGenre, sortBy]);

  return (
    <div className="space-y-8">
      {/* Hero section */}
      <section className="text-center py-12">
        <h1 className="text-5xl font-display font-bold text-text-primary mb-4">
          Modular Game Store
        </h1>
        <p className="text-xl text-text-secondary max-w-2xl mx-auto">
          Discover your next favorite game. Powered by microfrontends with Module Federation.
        </p>
      </section>

      {/* Filters bar */}
      <section className="flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Search games..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedGenre(null)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              !selectedGenre ? 'bg-accent text-white' : 'bg-surface-elevated text-text-muted hover:text-text-primary'
            }`}
          >
            All
          </button>
          {genres.map((genre) => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(selectedGenre === genre ? null : genre)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedGenre === genre ? 'bg-accent text-white' : 'bg-surface-elevated text-text-muted hover:text-text-primary'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="bg-surface-elevated border border-white/10 rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
          aria-label="Sort games"
        >
          <option value="rating">Top Rated</option>
          <option value="title">Name A-Z</option>
          <option value="price-asc">Price: Low → High</option>
          <option value="price-desc">Price: High → Low</option>
        </select>
      </section>

      {/* Results count */}
      <div className="flex items-center gap-2">
        <Badge variant="default" size="md">{filteredGames.length} games</Badge>
        {selectedGenre && (
          <Badge variant="accent" size="md">{selectedGenre}</Badge>
        )}
      </div>

      {/* Game grid */}
      {filteredGames.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-2xl text-text-muted mb-2">No games found</p>
          <p className="text-text-muted">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredGames.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </section>
      )}
    </div>
  );
}
