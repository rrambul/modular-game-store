import React, { Suspense, useMemo } from 'react';
import { Skeleton } from '@mgs/design-system';
import { ErrorBoundary } from './ErrorBoundary';

/**
 * Registry of federated module imports.
 * These use standard Module Federation imports that Zephyr resolves at build time.
 * Localhost URLs in rspack.config.js serve as dev fallbacks.
 */
const remoteModules: Record<string, Record<string, () => Promise<{ default: React.ComponentType<any> }>>> = {
  cart: {
    CartWidget: () => import('cart/CartWidget'),
    CartPage: () => import('cart/CartPage'),
  },
  reviews: {
    ReviewList: () => import('reviews/ReviewList'),
    ReviewForm: () => import('reviews/ReviewForm'),
    ReviewSummary: () => import('reviews/ReviewSummary'),
  },
};

interface RemoteComponentProps {
  remoteName: string;
  componentName: string;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
  [key: string]: any;
}

/**
 * Wrapper that loads a federated remote component with:
 * - Suspense (shows skeleton during load)
 * - ErrorBoundary (graceful fallback if remote is unavailable)
 * - Zephyr-resolved remote URLs (build-time injection)
 */
export function RemoteComponent({
  remoteName,
  componentName,
  fallback,
  errorFallback,
  ...props
}: RemoteComponentProps) {
  const LazyComponent = useMemo(
    () =>
      React.lazy(() => {
        const loader = remoteModules[remoteName]?.[componentName];
        if (!loader) {
          return Promise.resolve({
            default: () => {
              throw new Error(`Unknown remote module: ${remoteName}/${componentName}`);
            },
          });
        }
        return loader().catch((err) => {
          console.warn(`[RemoteComponent] Failed to load ${remoteName}/${componentName}:`, err);
          return {
            default: () => {
              throw err;
            },
          };
        });
      }),
    [remoteName, componentName],
  );

  const defaultFallback = (
    <div className="space-y-3 p-4">
      <Skeleton variant="rectangular" height="24px" width="60%" />
      <Skeleton variant="rectangular" height="120px" />
      <Skeleton variant="text" width="80%" />
    </div>
  );

  const defaultErrorFallback = (
    <div className="rounded-card bg-surface-secondary border border-white/10 p-6 text-center">
      <div className="text-3xl mb-2">⚠️</div>
      <p className="text-text-secondary text-sm">
        <strong className="text-text-primary">{componentName}</strong> is currently unavailable.
      </p>
      <p className="text-text-muted text-xs mt-1">
        The {remoteName} microfrontend may be offline.
      </p>
    </div>
  );

  return (
    <ErrorBoundary fallback={errorFallback ?? defaultErrorFallback}>
      <Suspense fallback={fallback ?? defaultFallback}>
        <LazyComponent {...props} />
      </Suspense>
    </ErrorBoundary>
  );
}
