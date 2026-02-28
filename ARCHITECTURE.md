# Architecture — Modular Game Store

This document explains how the Modular Game Store micro-frontend platform is architected, covering the monorepo structure, Module Federation configuration, runtime loading mechanics, shared dependency negotiation, cross-MF communication, and state management strategies.

---

## Table of Contents

1. [High-Level Overview](#high-level-overview)
2. [Monorepo Layout](#monorepo-layout)
3. [Module Federation Setup](#module-federation-setup)
4. [Dynamic Remote Loading](#dynamic-remote-loading)
5. [Shared Dependency Negotiation](#shared-dependency-negotiation)
6. [Cross-MF Communication](#cross-mf-communication)
7. [Cart State Management](#cart-state-management)
8. [Styling Architecture](#styling-architecture)
9. [Build Pipeline](#build-pipeline)
10. [Versioning Strategy](#versioning-strategy)
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
│  │   │  RemoteComponent│  │  remoteLoader.ts   │    │  │
│  │   │  (Lazy+Suspend) │  │  (Dynamic Imports) │    │  │
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
│  │   react 18  ·  react-dom 18  ·  react-router-dom │  │
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

The host declares **no static remotes**. All remotes are loaded dynamically at runtime:

```typescript
// apps/store/rspack.config.ts
new ModuleFederationPlugin({
  name: 'store',
  remotes: {},  // intentionally empty
  shared: {
    react: { singleton: true, requiredVersion: '^18.0.0' },
    'react-dom': { singleton: true, requiredVersion: '^18.0.0' },
  },
});
```

Key config decisions:
- **`eager: false`** for shared deps (avoids `factory is undefined` runtime error)
- **`splitChunks.chunks: 'async'`** in the host (prevents shared modules from being split into sync chunks that load before federation initializes)

---

## Dynamic Remote Loading

The host resolves remotes at runtime using a manifest file and a custom loader:

### Manifest (`remotes-manifest.json`)

```json
{
  "cart": {
    "activeVersion": "1.0.0",
    "versions": {
      "1.0.0": {
        "CartWidget": {
          "url": "http://localhost:3001/remoteEntry.js",
          "scope": "cart",
          "module": "./CartWidget",
          "version": "1.0.0"
        }
      }
    }
  }
}
```

### Loading Flow

```
1. RemoteComponent renders
          │
2. React.lazy calls loadRemoteComponent(remoteName, componentName)
          │
3. loadManifest() → fetch /remotes-manifest.json (cached)
          │
4. Resolve version (override > activeVersion)
          │
5. loadRemoteModule(url, scope, module)
          │
    ┌─────▼──────────────────────────────────────┐
    │  a. Inject <script> for remoteEntry.js     │
    │  b. __webpack_init_sharing__('default')     │
    │  c. container.init(__webpack_share_scopes__) │  ← only once per container
    │  d. container.get(module)                   │
    │  e. factory() → module exports             │
    └─────┬──────────────────────────────────────┘
          │
6. Return React component
          │
7. Suspense resolves → component renders
```

Critical implementation details:
- **Script caching** — a `Map` tracks injected script URLs to avoid duplicate `<script>` tags
- **Init guard** — an `initializedContainers` Set prevents calling `container.init()` twice on the same scope (which would throw)
- **Share scope initialization** — `__webpack_init_sharing__('default')` must be called before `container.init()` so the host's shared modules are available for negotiation

### Prefetching

On app mount, `requestIdleCallback` triggers `prefetchRemote()` for each remote URL, which injects `<link rel="prefetch" as="script">` tags. This hints the browser to fetch `remoteEntry.js` files during idle time.

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
      │
      │         dispatch('REVIEW_SUBMITTED', payload)
      │ ◄──────────────────────────────────────────────  ┌──────────┐
      │                                                  │ Reviews  │
      └──────────────────────────────────────────────►   │   MF     │
                dispatch('NAVIGATE', payload)            └──────────┘
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

1. **Initialize** — `useReducer` with a lazy initializer that reads from `localStorage` on mount
2. **Dispatch action** — reducer produces new state → `useEffect` writes to `localStorage` and emits a custom `mgs:cart:sync` DOM event
3. **Same-tab sync** — other `CartProvider` instances on the page receive the DOM event, check `sourceId` to ignore their own broadcasts, and dispatch a `SYNC` action with the new state
4. **Cross-tab sync** — `StorageEvent` fires when another tab writes to `localStorage`; the listener dispatches a `SYNC` action
5. **Event bus** — every state change also emits `CART_UPDATED` via the event bus so non-Cart MFs can react

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
  ├─ ModuleFederationPlugin
  ├─ HtmlRspackPlugin (index.html template)
  ├─ DefinePlugin (MF_VERSION injection)
  │
  └─ experiments: { css: true }
```

The `bootstrap.tsx` async entry is a Module Federation best practice — it ensures the share scope is initialized before any React code runs.

---

## Versioning Strategy

### Multi-Version Builds

The `build-version.js` script produces multiple versions of each remote:

```
scripts/build-version.js
    │
    ├── VERSION=1.0.0 pnpm --filter @mgs/cart build
    │   └── dist/v1.0.0/remoteEntry.js
    │
    ├── VERSION=2.0.0 pnpm --filter @mgs/cart build
    │   └── dist/v2.0.0/remoteEntry.js
    │
    └── Generates remotes-manifest.json with versioned URLs
```

Each version build uses `DefinePlugin` to inject `process.env.MF_VERSION` and sets the output `publicPath` and `path` to `dist/v{version}/`.

### Runtime Version Switching

The `VersionToolbar` component in the host:

1. Loads the manifest to discover available versions
2. Displays version selector buttons per remote
3. On selection, calls `setVersionOverride(remoteName, version)`
4. `setVersionOverride` clears cached scripts and containers
5. Page reloads → `loadRemoteComponent` reads the override → loads the selected version's `remoteEntry.js`

This simulates canary deployments where different users (or the same user) can be served different versions of a micro-frontend without redeploying the host.

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
