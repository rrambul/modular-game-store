import { useState } from 'react';

export interface StarRatingProps {
  rating: number;
  maxStars?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onRate?: (rating: number) => void;
}

const sizeClasses: Record<string, string> = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

function StarIcon({ filled, half, className }: { filled: boolean; half: boolean; className: string }) {
  if (half) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="halfStar">
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="50%" stopColor="transparent" />
          </linearGradient>
        </defs>
        <path
          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          fill="url(#halfStar)"
          stroke="#f59e0b"
          strokeWidth="1.5"
        />
      </svg>
    );
  }
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        fill={filled ? '#f59e0b' : 'none'}
        stroke={filled ? '#f59e0b' : '#64748b'}
        strokeWidth="1.5"
      />
    </svg>
  );
}

export function StarRating({ rating, maxStars = 5, size = 'md', interactive = false, onRate }: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);
  const displayRating = hoverRating || rating;

  return (
    <div className="inline-flex items-center gap-0.5" role={interactive ? 'radiogroup' : 'img'} aria-label={`Rating: ${rating} out of ${maxStars} stars`}>
      {Array.from({ length: maxStars }, (_, i) => {
        const starValue = i + 1;
        const filled = displayRating >= starValue;
        const half = !filled && displayRating >= starValue - 0.5;

        if (interactive) {
          return (
            <button
              key={i}
              type="button"
              className="focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded transition-transform hover:scale-110"
              onClick={() => onRate?.(starValue)}
              onMouseEnter={() => setHoverRating(starValue)}
              onMouseLeave={() => setHoverRating(0)}
              aria-label={`Rate ${starValue} star${starValue > 1 ? 's' : ''}`}
              role="radio"
              aria-checked={rating === starValue}
            >
              <StarIcon filled={filled} half={half} className={sizeClasses[size]} />
            </button>
          );
        }

        return <StarIcon key={i} filled={filled} half={half} className={sizeClasses[size]} />;
      })}
    </div>
  );
}
