import { useState } from 'react';
import { Button, Input, Card, StarRating } from '@mgs/design-system';
import { dispatch, EventNames } from '@mgs/event-bus';
import type { Review } from '@mgs/types';

interface ReviewFormProps {
  gameId: string;
  onSubmit?: (review: Review) => void;
}

export default function ReviewForm({ gameId, onSubmit }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [author, setAuthor] = useState('');
  const [comment, setComment] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0 || !author.trim() || !comment.trim()) return;

    const review: Review = {
      id: `r-${Date.now()}`,
      gameId,
      author: author.trim(),
      rating,
      comment: comment.trim(),
      date: new Date().toISOString().slice(0, 10),
      helpful: 0,
    };

    dispatch(EventNames.REVIEW_SUBMITTED, {
      gameId,
      rating,
      comment: comment.trim(),
      author: author.trim(),
    });

    onSubmit?.(review);
    setSubmitted(true);
    setTimeout(() => {
      setRating(0);
      setAuthor('');
      setComment('');
      setSubmitted(false);
      setIsOpen(false);
    }, 2000);
  };

  if (!isOpen) {
    return (
      <Button variant="secondary" onClick={() => setIsOpen(true)}>
        Write a Review
      </Button>
    );
  }

  if (submitted) {
    return (
      <Card variant="outlined" padding="md" className="text-center animate-bounce-in">
        <p className="text-success font-semibold text-lg">✓ Review submitted!</p>
        <p className="text-text-muted text-sm mt-1">Thank you for your feedback.</p>
      </Card>
    );
  }

  return (
    <Card variant="outlined" padding="md" className="animate-slide-down">
      <h3 className="font-display font-semibold text-text-primary mb-4">Write a Review</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-text-secondary mb-2 block">Your Rating</label>
          <StarRating rating={rating} interactive onRate={setRating} size="lg" />
        </div>
        <Input
          label="Display Name"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Your username"
          required
        />
        <div className="flex flex-col gap-1.5">
          <label htmlFor="review-comment" className="text-sm font-medium text-text-secondary">
            Your Review
          </label>
          <textarea
            id="review-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this game..."
            rows={4}
            required
            className="bg-surface-elevated border border-white/10 rounded-lg px-4 py-2.5 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all resize-none"
          />
        </div>
        <div className="flex gap-3">
          <Button type="submit" disabled={rating === 0 || !author.trim() || !comment.trim()}>
            Submit Review
          </Button>
          <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}
