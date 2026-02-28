import type { HTMLAttributes } from 'react';
export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    variant?: 'default' | 'accent' | 'success' | 'warning' | 'info';
    size?: 'sm' | 'md';
}
export declare function Badge({ variant, size, className, children, ...props }: BadgeProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=Badge.d.ts.map