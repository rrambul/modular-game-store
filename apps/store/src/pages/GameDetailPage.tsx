import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button, Badge, PriceBadge, Card, StarRating } from '@mgs/design-system';
import { dispatch, EventNames } from '@mgs/event-bus';
import { getGameById } from '../data/games';
import { RemoteComponent } from '../components/RemoteComponent';

export function GameDetailPage() {
  const { id } = useParams<{ id: string }>();
  const game = getGameById(id || '');
  const [added, setAdded] = useState(false);

  if (!game) {
    return (
      <div className="text-center py-16">
        <h1 className="text-3xl font-display font-bold text-text-primary mb-4">Game Not Found</h1>
        <Link to="/" className="text-accent hover:text-accent-hover transition-colors">
          ← Back to Store
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    dispatch(EventNames.CART_ITEM_ADDED, {
      gameId: game.id,
      title: game.title,
      price: game.price,
      image: game.image,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="text-sm text-text-muted">
        <Link to="/" className="hover:text-text-primary transition-colors">Store</Link>
        <span className="mx-2">/</span>
        <span className="text-text-primary">{game.title}</span>
      </nav>

      {/* Hero */}
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-card overflow-hidden">
            <img
              src={game.image}
              alt={game.title}
              className="w-full aspect-video object-cover"
            />
          </div>
        </div>

        <Card variant="default" padding="lg" className="self-start">
          <h1 className="text-2xl font-display font-bold text-text-primary mb-2">{game.title}</h1>

          <div className="flex items-center gap-2 mb-4">
            <StarRating rating={game.rating} size="md" />
            <span className="text-sm text-text-secondary">{game.rating.toFixed(1)}</span>
            <span className="text-xs text-text-muted">({game.reviewCount} reviews)</span>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-4">
            <Badge variant="accent">{game.genre}</Badge>
            {game.platforms.map((p) => (
              <Badge key={p} variant="default">{p}</Badge>
            ))}
          </div>

          <div className="mb-6">
            <PriceBadge price={game.price} originalPrice={game.originalPrice} size="lg" />
          </div>

          <Button
            className="w-full"
            size="lg"
            variant={added ? 'success' : 'primary'}
            onClick={handleAddToCart}
            disabled={added}
          >
            {added ? '✓ Added to Cart' : 'Add to Cart'}
          </Button>

          <div className="mt-6 space-y-2 text-sm">
            <div className="flex justify-between text-text-secondary">
              <span>Developer</span>
              <span className="text-text-primary">{game.developer}</span>
            </div>
            <div className="flex justify-between text-text-secondary">
              <span>Publisher</span>
              <span className="text-text-primary">{game.publisher}</span>
            </div>
            <div className="flex justify-between text-text-secondary">
              <span>Release Date</span>
              <span className="text-text-primary">
                {new Date(game.releaseDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-white/10">
            {game.tags.map((tag) => (
              <Badge key={tag} variant="info" size="sm">{tag}</Badge>
            ))}
          </div>
        </Card>
      </div>

      {/* Description */}
      <Card variant="outlined" padding="lg">
        <h2 className="text-xl font-display font-semibold text-text-primary mb-3">About This Game</h2>
        <p className="text-text-secondary leading-relaxed">{game.description}</p>
      </Card>

      {/* Reviews — loaded from Reviews MF */}
      <section>
        <h2 className="text-xl font-display font-semibold text-text-primary mb-4">Player Reviews</h2>
        <RemoteComponent
          remoteName="reviews"
          componentName="ReviewList"
          gameId={game.id}
        />
      </section>
    </div>
  );
}
