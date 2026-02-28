import { useState } from 'react';
import { Card, Badge, PriceBadge, Button } from '@mgs/design-system';
import { dispatch, EventNames } from '@mgs/event-bus';
import type { Game } from '@mgs/types';
import { Link } from 'react-router-dom';

interface GameCardProps {
  game: Game;
}

export function GameCard({ game }: GameCardProps) {
  const [added, setAdded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(EventNames.CART_ITEM_ADDED, {
      gameId: game.id,
      title: game.title,
      price: game.price,
      image: game.image,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <Link to={`/game/${game.id}`} className="block group">
      <Card variant="interactive" padding="none" className="overflow-hidden">
        <div className="relative aspect-video overflow-hidden">
          <img
            src={game.image}
            alt={game.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute top-2 left-2 flex gap-1.5">
            <Badge variant="accent">{game.genre}</Badge>
            {game.originalPrice && (
              <Badge variant="success">Sale</Badge>
            )}
            {game.price === 0 && (
              <Badge variant="success">Free</Badge>
            )}
          </div>
        </div>
        <div className="p-4 space-y-3">
          <h3 className="font-display font-semibold text-text-primary text-lg truncate group-hover:text-accent transition-colors">
            {game.title}
          </h3>
          <p className="text-text-secondary text-sm line-clamp-2 leading-relaxed">
            {game.description}
          </p>
          <div className="flex items-center gap-2 text-sm text-text-muted">
            {game.platforms.map((p) => (
              <span key={p} className="text-xs">{platformIcon(p)}</span>
            ))}
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            <PriceBadge price={game.price} originalPrice={game.originalPrice} size="md" />
            <Button
              size="sm"
              variant={added ? 'success' : 'primary'}
              onClick={handleAddToCart}
              disabled={added}
            >
              {added ? '✓ Added' : 'Add to Cart'}
            </Button>
          </div>
        </div>
      </Card>
    </Link>
  );
}

function platformIcon(platform: string): string {
  switch (platform) {
    case 'PC': return '🖥';
    case 'PlayStation': return '🎮';
    case 'Xbox': return '🟢';
    case 'Nintendo': return '🔴';
    case 'Mobile': return '📱';
    default: return '🎮';
  }
}
