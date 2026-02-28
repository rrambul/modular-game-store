# Modular Game Store

A micro-frontend game marketplace built with **Rspack** and **Module Federation**, using **pnpm workspaces** for monorepo management. Each domain (store, cart, reviews) is independently developed and deployed as a federated module.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Bundler | Rspack 1.7 with `@rspack/cli` |
| Module Federation | `@module-federation/enhanced` 0.8 |
| UI | React 18, React Router 6 |
| Styling | Tailwind CSS 3.4 with shared preset |
| Language | TypeScript 5.5 (strict mode) |
| Monorepo | pnpm workspaces |

---

## Project Structure

```
modular-game-store/
├── apps/
│   ├── store/          # Host shell — port 3000
│   ├── cart/           # Cart microfrontend — port 3001
│   └── reviews/        # Reviews microfrontend — port 3002
├── packages/
│   ├── design-system/  # Shared UI components + Tailwind preset
│   ├── event-bus/      # Cross-MF communication (CustomEvents)
│   └── types/          # Shared TypeScript interfaces
├── scripts/
│   └── build-version.js  # Multi-version build + manifest generation
├── pnpm-workspace.yaml
└── tsconfig.base.json
```

---

## Running Locally

### Prerequisites

- **Node.js** >= 18
- **pnpm** >= 8

### Install & Start

```bash
pnpm install
pnpm dev
```

This starts all three apps concurrently:

| App | URL | Role |
|---|---|---|
| Store | `http://localhost:3000` | Host shell (entry point) |
| Cart | `http://localhost:3001` | Cart MF (standalone) |
| Reviews | `http://localhost:3002` | Reviews MF (standalone) |

Open `http://localhost:3000` to use the full application.

### Available Scripts

| Script | Description |
|---|---|
| `pnpm dev` | Start all apps in development mode |
| `pnpm build` | Build all packages and apps |
| `pnpm build:store` | Build only the store host |
| `pnpm build:cart` | Build only the cart MF |
| `pnpm build:reviews` | Build only the reviews MF |
| `pnpm build:version` | Build multiple versions + generate manifest |
| `pnpm clean` | Remove all `dist/` folders |

---

## Microfrontends

### Store (Host) — `apps/store`

The shell application that orchestrates all remotes. Does **not** expose any federated modules.

- **Game catalog** with search, genre filtering, and sorting
- **Game detail pages** with embedded Reviews MF
- **Cart page** with embedded Cart MF
- **Dynamic remote loading** — remotes resolved at runtime from `remotes-manifest.json`
- **Version toolbar** — switch remote versions at runtime
- **Prefetching** — remote entry scripts prefetched via `requestIdleCallback`
- **Error boundaries** — graceful fallback when a remote is unavailable

### Cart — `apps/cart`

Exposes: `./CartWidget`, `./CartPage`

- **CartWidget** — header dropdown with item count badge, item list, and total
- **CartPage** — full-page cart with quantity controls, remove, clear, and order summary
- **State management** — React Context + `useReducer` with localStorage persistence
- **Same-tab sync** — multiple CartProvider instances stay in sync via custom DOM events
- **Cross-tab sync** — `StorageEvent` listener keeps tabs in sync
- **Event bus integration** — listens for `CART_ITEM_ADDED` from other MFs, emits `CART_UPDATED`

### Reviews — `apps/reviews`

Exposes: `./ReviewList`, `./ReviewForm`, `./ReviewSummary`

- **ReviewList** — sortable (newest, oldest, highest, lowest, helpful) and filterable by star rating
- **ReviewForm** — collapsible form with interactive star rating, emits `REVIEW_SUBMITTED` event
- **ReviewSummary** — inline widget showing average rating and review count
- **Mock data** — 8 reviews across 4 games

---

## Shared Packages

### `@mgs/design-system`

11 UI components: `Button`, `Card`, `Badge`, `Input`, `Modal`, `Layout`, `Header`, `Main`, `StarRating`, `Skeleton`, `PriceBadge`.

Includes a **Tailwind preset** (`@mgs/design-system/tailwind-preset`) with:

- Dark theme color palette (brand, surface, accent, text)
- Custom fonts (Inter, Poppins, JetBrains Mono)
- Animations (fade-in, slide-up, slide-down, pulse-glow, bounce-in)
- Custom shadows (card, card-hover, glow)

### `@mgs/event-bus`

Typed cross-MF communication using `CustomEvent` on `window`.

| Event | Payload |
|---|---|
| `CART_ITEM_ADDED` | `{ gameId, title, price, image }` |
| `CART_ITEM_REMOVED` | `{ gameId }` |
| `CART_UPDATED` | `{ items, totalItems, totalPrice }` |
| `REVIEW_SUBMITTED` | `{ gameId, rating, comment, author }` |
| `NAVIGATE` | `{ path }` |

API: `dispatch()`, `listen()`, and a `useEventBus()` React hook.

### `@mgs/types`

Shared interfaces: `Game`, `Genre`, `Platform`, `CartItem`, `Review`, `RemoteManifestEntry`, `RemoteManifest`.

---

## Versioning Simulation

The `build:version` script builds each remote at multiple versions (1.0.0, 2.0.0), outputs to `dist/v{version}/`, and generates an updated `remotes-manifest.json`.

A **VersionToolbar** in the host app (bottom-right floating button) lets you switch between remote versions at runtime — the page reloads with the selected version's `remoteEntry.js`.

A `CartWidgetV2` component exists as a v2 demonstration with enhanced animations and a slide-out mini cart panel.

---

## Key Design Decisions

- **Dynamic remotes** — no static remote URLs in the host's Rspack config; everything resolved from a runtime manifest
- **Shared singletons** — React and ReactDOM shared as singletons across all MFs (not eager-loaded to avoid `factory is undefined` errors)
- **CSS isolation** — each MF processes its own Tailwind CSS from the shared preset; Rspack `experiments.css` enabled with `postcss-loader`
- **Cart state** — localStorage-backed for persistence, with custom DOM events for same-tab sync and `StorageEvent` for cross-tab sync
- **Error resilience** — `ErrorBoundary` + `Suspense` wrapper around every remote component with skeleton fallbacks

---

## Architecture

See [ARCHITECTURE.md](ARCHITECTURE.md) for a detailed explanation of the system architecture, data flow, and module federation setup.
