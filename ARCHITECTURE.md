# Architecture — Modular Game Store

This document explains how the Modular Game Store micro-frontend platform is architected, covering the monorepo structure, Module Federation configuration, runtime loading mechanics, shared dependency negotiation, cross-MF communication, and state management strategies.

---

## Table of Contents

1. [High-Level Overview](#high-level-overview)
2. [Monorepo Layout](#monorepo-layout)
3. [Module Federation Setup](#module-federation-setup)
4. [Remote Resolution](#remote-resolution)
5. [Shared Dependency Negotiation](#shared-dependency-negotiation)
6. [Cross-MF Communication](#cross-mf-communication)
7. [Cart State Management](#cart-state-management)
8. [Styling Architecture](#styling-architecture)
9. [Build Pipeline](#build-pipeline)
10. [Deployment](#deployment)
11. [Error Handling](#error-handling)

---

## High-Level Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Browser (localhost:3000)              │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │                 Store Host Shell                   │  │
│  │   ┌──────────┐  ┌──────────┐  ┌──────────────┐   │  │
│  │   │  React   │  │  Router  │  │  Error       │   │  │
│  │   │  18      │  │  v6      │  │  Boundaries  │   │  │
│  │   └──────────┘  └──────────┘  └──────────────┘   │  │
│  │                                                   │  │
│  │   ┌─────────────────┐  ┌────────────────────┐    │  │
│  │   │  RemoteComponent│  │  Zephyr runtime    │    │  │
│  │   │  (Lazy+Suspend) │  │  remote resolution │    │  │
│  │   └────────┬────────┘  └────────┬───────────┘    │  │
│  └────────────┼─────────────────────┼────────────────┘  │
│               │                     │                    │
│       ┌───────▼───────┐    ┌───────▼───────┐            │
│       │  Cart MF      │    │  Reviews MF   │            │
│       │  :3001        │    │  :3002        │            │
│       │               │    │               │            │
│       │  CartWidget   │    │  ReviewList   │            │
│       │  CartPage     │    │  ReviewForm   │            │
│       │               │    │  ReviewSummary│            │
│       └───────────────┘    └───────────────┘            │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │              Shared Singletons                    │  │
│  │           react 18   ·   react-dom 18            │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

The host shell at port 3000 loads remote modules from Cart (port 3001) and Reviews (port 3002) at runtime. All three share a single instance of React and ReactDOM negotiated by Module Federation's shared scope.

---

## Monorepo Layout

The project uses **pnpm workspaces** with two workspace roots:

```yaml
# pnpm-workspace.yaml
packages:
  - 'packages/*'
  - 'apps/*'
```

### Packages (shared libraries — not bundled independently)

| Package | Purpose | Consumed By |
|---|---|---|
| `@mgs/design-system` | UI components + Tailwind preset | All apps |
| `@mgs/event-bus` | Typed CustomEvent dispatch/listen | All apps |
| `@mgs/types` | Shared TypeScript interfaces | All apps + event-bus |

Packages are referenced as `workspace:*` dependencies and resolved by each app's bundler via TypeScript path aliases defined in `tsconfig.base.json`:

```json
{
  "paths": {
    "@mgs/design-system": ["./packages/design-system/src"],
    "@mgs/event-bus": ["./packages/event-bus/src"],
    "@mgs/types": ["./packages/types/src"]
  }
}
```

### Apps (independently runnable and deployable)

Each app has its own `rspack.config.ts`, `tailwind.config.js`, `postcss.config.js`, and `tsconfig.json`.

---

## Module Federation Setup

Each app uses `@module-federation/enhanced` for its Module Federation plugin. The configuration follows a specific pattern:

### Remote Configuration (Cart & Reviews)

```typescript
// Simplified example from apps/cart/rspack.config.ts
new ModuleFederationPlugin({
  name: 'cart',
  filename: 'remoteEntry.js',
  exposes: {
    './CartWidget': './src/components/CartWidget',
    './CartPage': './src/components/CartPage',
  },
  shared: {
    react: { singleton: true, requiredVersion: '^18.0.0' },
    'react-dom': { singleton: true, requiredVersion: '^18.0.0' },
  },
});
```

### Host Configuration (Store)

The host declares its remotes statically; Zephyr rewrites the entry URLs at runtime (see [Remote Resolution](#remote-resolution)). The localhost entries are dev fallbacks:

```javascript
// apps/store/rspack.config.js
new ModuleFederationPlugin({
  name: 'store',
  dts: false,
  remotes: {
    cart: 'cart@http://localhost:3001/remoteEntry.js',
    reviews: 'reviews@http://localhost:3002/remoteEntry.js',
  },
  shared: {
    react: { singleton: true, requiredVersion: '^18.3.0' },
    'react-dom': { singleton: true, requiredVersion: '^18.3.0' },
  },
});
```

Key config decisions:
- **`eager: false`** for shared deps (avoids `factory is undefined` runtime error)
- **`splitChunks.chunks: 'async'`** in the host (prevents shared modules from being split into sync chunks that load before federation initializes)
- **`dts: false`** — federated types are hand-maintained in `apps/store/src/remotes.d.ts` rather than auto-generated

---

## Remote Resolution

The host imports remotes with standard Module Federation syntax. `RemoteComponent` wraps each one in `React.lazy` + `Suspense` + an `ErrorBoundary`:

```tsx
// apps/store/src/components/RemoteComponent.tsx
const remoteModules = {
  cart: {
    CartWidget: () => import('cart/CartWidget'),
    CartPage: () => import('cart/CartPage'),
  },
  reviews: {
    ReviewList: () => import('reviews/ReviewList'),
    // ...
  },
};
```

The `import('cart/CartWidget')` specifiers are matched against the `remotes` map in the host's `rspack.config.js`, which points at localhost `remoteEntry.js` URLs for local dev.

### Zephyr runtime resolution

In a Zephyr build (`withZephyr()`), a runtime plugin is injected into the host bundle. On startup it fetches Zephyr's `zephyr-manifest.json` and **rewrites each remote's entry URL** to its deployed edge URL before the remote is requested — so the same host bundle resolves to whichever version Zephyr has published, without rebuilding. The static localhost URLs are only used for local dev or when Zephyr is disabled (`DISABLE_ZEPHYR=1`).

```
RemoteComponent → import('cart/CartWidget')
        │
        ▼
  Module Federation runtime
        │  (Zephyr beforeRequest hook rewrites the entry URL)
        ▼
  fetch <edge-host>/remoteEntry.js → container.get('./CartWidget')
        │
        ▼
  React.lazy resolves → Suspense renders the component
```

---

## Shared Dependency Negotiation

Module Federation negotiates shared dependencies at runtime through the **share scope** mechanism:

```
Host declares:  react (singleton, ^18.0.0)
Cart declares:  react (singleton, ^18.0.0)
Reviews declares: react (singleton, ^18.0.0)
                    │
                    ▼
    Federation picks the highest compatible version
    available in the share scope → single React instance
```

This prevents:
- Multiple React instances (which break hooks)
- Version mismatches across MFs
- Duplicate bundle weight

The `singleton: true` flag ensures exactly one copy is used, even if versions differ slightly. The `requiredVersion` constraint guards against incompatible major versions.

---

## Cross-MF Communication

MFs communicate through a typed event bus built on the browser's native `CustomEvent` API:

```
┌──────────┐    dispatch('CART_ITEM_ADDED', payload)     ┌──────────┐
│  Store   │ ──────────────────────────────────────────► │   Cart   │
│  Host    │                                             │   MF     │
│          │ ◄────────────────────────────────────────── │          │
└──────────┘    dispatch('CART_UPDATED', payload)         └──────────┘
      │         dispatch('REVIEW_SUBMITTED', payload)
      └ ◄──────────────────────────────────────────────  ┌──────────┐
                                                          │ Reviews  │
                                                          │   MF     │
                                                          └──────────┘
```

### Event Bus API

```typescript
// Dispatch an event (any MF)
dispatch(CART_ITEM_ADDED, { gameId: '1', title: 'Game', price: 29.99, image: '...' });

// Listen for events (with auto-cleanup React hook)
useEventBus(CART_ITEM_ADDED, (payload) => {
  // handle the event
});
```

### Why CustomEvents?

- Zero dependencies — built into every browser
- Decoupled — producers and consumers don't need to know about each other
- Typed — TypeScript generics ensure payload correctness at compile time
- Debuggable — events are visible in browser DevTools

---

## Cart State Management

The Cart MF uses a multi-layered state strategy to handle the unique challenge of having multiple `CartProvider` instances on the same page (one in `CartWidget` in the header, another in `CartPage`):

```
┌──────────────────────────────────────────────────────┐
│                    Single Browser Tab                  │
│                                                        │
│  ┌─────────────────┐       ┌─────────────────┐        │
│  │  CartProvider    │       │  CartProvider    │        │
│  │  (CartWidget)    │◄─────►│  (CartPage)     │        │
│  │  instanceId: A   │ DOM   │  instanceId: B   │        │
│  └────────┬─────────┘ event └────────┬─────────┘        │
│           │                           │                  │
│           └────────┬──────────────────┘                  │
│                    │                                     │
│                    ▼                                     │
│           ┌───────────────┐                              │
│           │  localStorage │    key: 'mgs:cart'           │
│           │  (persistence)│                              │
│           └───────┬───────┘                              │
│                   │                                      │
└───────────────────┼──────────────────────────────────────┘
                    │  StorageEvent
┌───────────────────┼──────────────────────────────────────┐
│  Another Tab      │                                      │
│           ┌───────▼───────┐                              │
│           │  CartProvider  │    Receives StorageEvent     │
│           └───────────────┘    and dispatches SYNC action │
└──────────────────────────────────────────────────────────┘
```

### State Flow

1. **Initialize** — `useReducer` with a lazy initializer that reads (and validates) `localStorage` on mount
2. **Dispatch action** — the reducer produces new state → a `useEffect` always emits `CART_UPDATED` (so the host's badge hydrates), and **only when the items differ from the last-synced snapshot** writes to `localStorage` and emits a custom `mgs:cart:sync` DOM event
3. **Same-tab sync** — other `CartProvider` instances receive the DOM event, ignore their own broadcasts via `sourceId`, then re-read storage and dispatch a `SYNC` action
4. **Cross-tab sync** — `StorageEvent` fires when another tab writes to `localStorage`; the listener re-reads storage and dispatches `SYNC`
5. **Echo guard** — each provider tracks the serialized snapshot it last persisted or synced in; a matching snapshot is skipped, which prevents broadcast loops without a fragile "skip the next effect" latch

### Why Not a Global Store?

Each federated module is independently loaded and may have its own React tree. A global store (Redux, Zustand) would require coordinating a single store instance across separately bundled modules — which conflicts with Module Federation's isolation model. Instead, each `CartProvider` manages its own state and syncs via the browser's native persistence and event APIs.

---

## Styling Architecture

### Tailwind CSS Sharing Strategy

Each MF processes Tailwind independently but uses a **shared preset** for consistency:

```
┌─────────────────────────────────────────┐
│  @mgs/design-system/tailwind-preset.js  │
│                                         │
│  Colors: brand, surface, accent, text   │
│  Fonts: Inter, Poppins, JetBrains Mono  │
│  Animations: fadeIn, slideUp, bounceIn  │
│  Shadows: card, card-hover, glow        │
└──────────────────┬──────────────────────┘
                   │  imported as preset
        ┌──────────┼──────────┐
        ▼          ▼          ▼
   store/       cart/      reviews/
  tailwind.    tailwind.   tailwind.
  config.js    config.js   config.js
```

Each app's `tailwind.config.js`:
```javascript
const designSystemPreset = require('@mgs/design-system/tailwind-preset');
module.exports = {
  presets: [designSystemPreset],
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    '../../packages/design-system/src/**/*.{js,ts,jsx,tsx}',
  ],
};
```

The `content` array includes the design system source so Tailwind generates utility classes used by shared components.

### CSS Build Pipeline

```
.css/.tsx files
      │
      ▼
  postcss-loader  (runs Tailwind + autoprefixer)
      │
      ▼
  Rspack css/auto  (experiments.css: true)
      │
      ▼
  Bundled CSS output
```

Each MF outputs its own CSS bundle. Since they all use the same preset, visual consistency is maintained without CSS-in-JS runtime overhead or style conflicts between MFs.

---

## Build Pipeline

### Development

```bash
pnpm dev
```

Runs `concurrently`:
- `rspack serve` for Store (port 3000)
- `rspack serve` for Cart (port 3001)
- `rspack serve` for Reviews (port 3002)

Each dev server supports hot module replacement. Changes to shared packages are picked up via path aliases (no rebuild needed — source is consumed directly).

### Production

```bash
pnpm build
```

Runs `pnpm -r build` which triggers `rspack build --mode production` in each app.

### Rspack Configuration Pattern

All apps share a common Rspack config structure:

```
Entry: ./src/bootstrap.tsx  (async boundary for federation)
  │
  ├─ builtin:swc-loader (TypeScript/JSX)
  ├─ postcss-loader (CSS)
  ├─ Asset modules (images, fonts)
  │
  ├─ ModuleFederationPlugin (dts: false)
  ├─ HtmlRspackPlugin (index.html template)
  │
  └─ experiments: { css: true }
```

The `bootstrap.tsx` async entry is a Module Federation best practice — it ensures the share scope is initialized before any React code runs.

---

## Deployment

Builds are deployed to the edge via **Zephyr Cloud**. Each app's `rspack.config.js` wraps its config with `withZephyr()`; on build, Zephyr publishes the output and records the remote entry URLs in its manifest. The host's `zephyr:dependencies` (in `apps/store/package.json`) declare which remotes it consumes:

```json
"zephyr:dependencies": {
  "cart": "-mgs-cart@workspace:*",
  "reviews": "-mgs-reviews@workspace:*"
}
```

At runtime the host resolves each remote to its currently-published edge URL (see [Remote Resolution](#remote-resolution)), so a remote can be redeployed to a new version without rebuilding the host — Zephyr's manifest simply points the host at the new entry.

For local or CI builds that should not contact Zephyr, set `DISABLE_ZEPHYR=1`; the config falls back to a plain Module Federation build using the localhost remote URLs.

---

## Error Handling

```
RemoteComponent
    │
    ├── Suspense
    │   └── Skeleton fallback while loading
    │
    └── ErrorBoundary
        └── Graceful fallback UI if remote fails
            (network error, version mismatch, etc.)
```

Every remote component is wrapped in a `RemoteComponent` that provides:

- **Loading state** — `Suspense` with a `Skeleton` component as fallback
- **Error recovery** — `ErrorBoundary` catches render errors and displays a user-friendly message with a retry option
- **Network resilience** — if a remote's `remoteEntry.js` fails to load (server down, CORS, etc.), the error boundary catches the promise rejection and renders the fallback instead of crashing the host

This ensures a single offline MF never takes down the entire application.
