import type { ReactNode, HTMLAttributes } from 'react';
export interface LayoutProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
}
export interface HeaderProps extends HTMLAttributes<HTMLElement> {
    children: ReactNode;
}
export declare function Layout({ children, className, ...props }: LayoutProps): import("react/jsx-runtime").JSX.Element;
export declare function Header({ children, className, ...props }: HeaderProps): import("react/jsx-runtime").JSX.Element;
export declare function Main({ children, className, ...props }: LayoutProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=Layout.d.ts.map