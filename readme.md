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
| `pnpm typecheck` | Type-check every package (`tsc --noEmit`) |
| `pnpm lint` | Lint with ESLint (flat config + react-hooks) |
| `pnpm format` | Format with Prettier |
| `pnpm test` | Run the Vitest unit suite |
| `pnpm clean` | Remove all `dist/` folders |

---

## Microfrontends

### Store (Host) — `apps/store`

The shell application that orchestrates all remotes. Does **not** expose any federated modules.

- **Game catalog** with search, genre filtering, and sorting
- **Game detail pages** with embedded Reviews MF
- **Cart page** with embedded Cart MF
- **Federated remotes** — Cart and Reviews are loaded via Module Federation; remote entry URLs are resolved at runtime by Zephyr Cloud (the localhost entries in `rspack.config.js` are dev fallbacks)
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
| `CART_UPDATED` | `{ items, totalItems, totalPrice }` |
| `REVIEW_SUBMITTED` | `{ gameId, rating, comment, author }` |

API: `dispatch()`, `listen()`, and a `useEventBus()` React hook.

### `@mgs/types`

Shared interfaces: `Game`, `Genre`, `Platform`, `CartItem`, `Review`.

---

## Quality

| Script | Checks |
|---|---|
| `pnpm typecheck` | `tsc --noEmit` across all workspaces |
| `pnpm lint` | ESLint (flat config, `react-hooks` rules) |
| `pnpm test` | Vitest unit suite |

Unit tests cover the cart reducer, cart persistence/validation, and the event bus. CI (`.github/workflows/ci.yml`) runs typecheck → lint → test → a Zephyr-free production build (`DISABLE_ZEPHYR=1`) on every push and PR.

---

## Key Design Decisions

- **Federated remotes + Zephyr** — the host declares its remotes in `rspack.config.js`; Zephyr Cloud rewrites the remote entry URLs at runtime for edge deployment (localhost entries serve as dev fallbacks). Set `DISABLE_ZEPHYR=1` for a plain offline build.
- **Shared singletons** — React and ReactDOM shared as singletons across all MFs (not eager-loaded to avoid `factory is undefined` errors)
- **CSS isolation** — each MF processes its own Tailwind CSS from the shared preset; Rspack `experiments.css` enabled with `postcss-loader`
- **Cart state** — localStorage-backed for persistence, with a custom DOM event for same-tab sync and `StorageEvent` for cross-tab sync; a last-synced snapshot prevents echo loops between provider instances
- **Error resilience** — `ErrorBoundary` + `Suspense` wrapper around every remote component with skeleton fallbacks

---

## Architecture

See [ARCHITECTURE.md](ARCHITECTURE.md) for a detailed explanation of the system architecture, data flow, and module federation setup.
