import React, { Suspense, useMemo } from 'react';
import { Skeleton } from '@mgs/design-system';
import { loadRemoteComponent } from '../utils/remoteLoader';
import { ErrorBoundary } from './ErrorBoundary';

interface RemoteComponentProps {
  remoteName: string;
  componentName: string;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
  [key: string]: any;
}

/**
 * Wrapper that dynamically loads a federated remote component with:
 * - Suspense (shows skeleton during load)
 * - ErrorBoundary (graceful fallback if remote is unavailable)
 * - Runtime manifest-based resolution
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
      React.lazy(() =>
        loadRemoteComponent(remoteName, componentName).catch((err) => {
          console.warn(`[RemoteComponent] Failed to load ${remoteName}/${componentName}:`, err);
          // Return a module with a component that throws so ErrorBoundary catches it
          return {
            default: () => {
              throw err;
            },
          };
        }),
      ),
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
