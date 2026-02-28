export interface StarRatingProps {
    rating: number;
    maxStars?: number;
    size?: 'sm' | 'md' | 'lg';
    interactive?: boolean;
    onRate?: (rating: number) => void;
}
export declare function StarRating({ rating, maxStars, size, interactive, onRate }: StarRatingProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=StarRating.d.ts.map