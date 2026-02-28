import { useState } from 'react';
import { Card, StarRating, Badge } from '@mgs/design-system';
import type { Review } from '@mgs/types';
import { getReviewsForGame, getAverageRating } from '../data/mockReviews';
import ReviewForm from './ReviewForm';

interface ReviewListProps {
  gameId: string;
}

type SortOption = 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful';

export default function ReviewList({ gameId }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>(() => getReviewsForGame(gameId));
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filterRating, setFilterRating] = useState<number | null>(null);

  const { average, count } = getAverageRating(gameId);

  const handleNewReview = (review: Review) => {
    setReviews((prev) => [review, ...prev]);
  };

  const sortedReviews = [...reviews]
    .filter((r) => (filterRating ? r.rating === filterRating : true))
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest': return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'oldest': return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'highest': return b.rating - a.rating;
        case 'lowest': return a.rating - b.rating;
        case 'helpful': return b.helpful - a.helpful;
        default: return 0;
      }
    });

  return (
    <div className="space-y-6">
      {/* Summary bar */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-3">
          <span className="text-4xl font-bold text-text-primary">{average.toFixed(1)}</span>
          <div>
            <StarRating rating={average} size="md" />
            <p className="text-sm text-text-muted mt-0.5">{count} reviews</p>
          </div>
        </div>

        <div className="flex-1" />

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className="bg-surface-elevated border border-white/10 rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
          aria-label="Sort reviews"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="highest">Highest rated</option>
          <option value="lowest">Lowest rated</option>
          <option value="helpful">Most helpful</option>
        </select>

        {/* Filter */}
        <div className="flex gap-1">
          <button
            onClick={() => setFilterRating(null)}
            className={`px-2 py-1 rounded text-xs transition-colors ${!filterRating ? 'bg-accent text-white' : 'bg-surface-elevated text-text-muted hover:text-text-primary'}`}
          >
            All
          </button>
          {[5, 4, 3, 2, 1].map((star) => (
            <button
              key={star}
              onClick={() => setFilterRating(filterRating === star ? null : star)}
              className={`px-2 py-1 rounded text-xs transition-colors ${filterRating === star ? 'bg-accent text-white' : 'bg-surface-elevated text-text-muted hover:text-text-primary'}`}
            >
              {star}★
            </button>
          ))}
        </div>
      </div>

      {/* Review form */}
      <ReviewForm gameId={gameId} onSubmit={handleNewReview} />

      {/* Review list */}
      <div className="space-y-4">
        {sortedReviews.length === 0 ? (
          <p className="text-center text-text-muted py-8">No reviews match your filter.</p>
        ) : (
          sortedReviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))
        )}
      </div>
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <Card variant="outlined" padding="md" className="animate-fade-in">
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-text-primary">{review.author}</span>
            <Badge variant="info" size="sm">Verified</Badge>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <StarRating rating={review.rating} size="sm" />
            <span className="text-xs text-text-muted">
              {new Date(review.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
        </div>
      </div>
      <p className="text-text-secondary text-sm leading-relaxed mt-3">{review.comment}</p>
      <div className="flex items-center gap-4 mt-4 text-xs text-text-muted">
        <button className="flex items-center gap-1 hover:text-text-primary transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
          </svg>
          Helpful ({review.helpful})
        </button>
      </div>
    </Card>
  );
}
