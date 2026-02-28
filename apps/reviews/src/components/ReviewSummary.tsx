import { StarRating, Badge } from '@mgs/design-system';

interface ReviewSummaryProps {
  averageRating: number;
  reviewCount: number;
}

export default function ReviewSummary({ averageRating, reviewCount }: ReviewSummaryProps) {
  return (
    <div className="inline-flex items-center gap-2">
      <StarRating rating={averageRating} size="sm" />
      <span className="text-sm font-medium text-text-primary">{averageRating.toFixed(1)}</span>
      <Badge variant="default" size="sm">
        {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
      </Badge>
    </div>
  );
}
