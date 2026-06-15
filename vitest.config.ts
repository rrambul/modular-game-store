import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

// Resolve workspace packages to their source so tests run against TS directly,
// matching how rspack consumes them (no build step for packages).
export default defineConfig({
  // Use the automatic JSX runtime everywhere (incl. root-level test stubs that
  // aren't covered by a package tsconfig).
  esbuild: { jsx: 'automatic' },
  resolve: {
    alias: {
      '@mgs/types': resolve(__dirname, 'packages/types/src/index.ts'),
      '@mgs/event-bus': resolve(__dirname, 'packages/event-bus/src/index.ts'),
      '@mgs/design-system': resolve(__dirname, 'packages/design-system/src/index.ts'),
      // Federated remote specifiers only resolve inside a Module Federation build,
      // so point them at local stubs when testing RemoteComponent directly.
      'cart/CartWidget': resolve(__dirname, 'test/remoteStub.tsx'),
      'cart/CartPage': resolve(__dirname, 'test/remoteStub.tsx'),
      'reviews/ReviewList': resolve(__dirname, 'test/remoteStub.tsx'),
      'reviews/ReviewSummary': resolve(__dirname, 'test/remoteStub.tsx'),
      'reviews/ReviewForm': resolve(__dirname, 'test/remoteThrows.tsx'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['{apps,packages}/**/src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'html'],
      all: true,
      include: ['apps/*/src/**/*.{ts,tsx}', 'packages/*/src/**/*.{ts,tsx}'],
      exclude: [
        '**/*.test.{ts,tsx}',
        '**/*.d.ts',
        'apps/*/src/index.ts', // dynamic-import entry points
        'apps/*/src/bootstrap.tsx', // DOM mount glue
        'packages/types/src/**', // type-only declarations
      ],
      thresholds: {
        perFile: true,
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});
