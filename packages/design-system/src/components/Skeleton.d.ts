import type { HTMLAttributes } from 'react';
export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
    variant?: 'text' | 'rectangular' | 'circular';
    width?: string;
    height?: string;
}
export declare function Skeleton({ variant, width, height, className, style, ...props }: SkeletonProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=Skeleton.d.ts.map