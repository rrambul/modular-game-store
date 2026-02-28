export interface PriceBadgeProps {
  price: number;
  originalPrice?: number;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses: Record<string, string> = {
  sm: 'text-sm',
  md: 'text-lg',
  lg: 'text-2xl',
};

export function PriceBadge({ price, originalPrice, size = 'md' }: PriceBadgeProps) {
  const hasDiscount = originalPrice && originalPrice > price;
  const discount = hasDiscount ? Math.round((1 - price / originalPrice) * 100) : 0;

  return (
    <div className="inline-flex items-center gap-2">
      {hasDiscount && (
        <>
          <span className="bg-success/20 text-success text-xs font-bold px-2 py-0.5 rounded">
            -{discount}%
          </span>
          <span className="text-text-muted line-through text-sm">${originalPrice.toFixed(2)}</span>
        </>
      )}
      <span className={`${sizeClasses[size]} font-bold text-text-primary`}>
        {price === 0 ? 'Free' : `$${price.toFixed(2)}`}
      </span>
    </div>
  );
}
