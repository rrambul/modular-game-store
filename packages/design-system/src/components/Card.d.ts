import { type HTMLAttributes } from 'react';
export interface CardProps extends HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'interactive' | 'outlined';
    padding?: 'none' | 'sm' | 'md' | 'lg';
}
export declare const Card: import("react").ForwardRefExoticComponent<CardProps & import("react").RefAttributes<HTMLDivElement>>;
//# sourceMappingURL=Card.d.ts.map