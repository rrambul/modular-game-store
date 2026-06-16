# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm install            # Node >= 18, pnpm >= 8 (pnpm 10 used locally)
pnpm dev                # run store (:3000), cart (:3001), reviews (:3002) concurrently
pnpm build              # production build of all apps (invokes Zephyr — see below)
DISABLE_ZEPHYR=1 pnpm build   # offline/CI build, no Zephyr Cloud contact
pnpm typecheck          # tsc --noEmit across every workspace
pnpm lint               # eslint .   (lint:fix to autofix)
pnpm format             # prettier --write .   (format:check to verify)
pnpm test               # vitest run (all unit tests)
pnpm test:coverage      # vitest run --coverage; enforces per-file 80% thresholds
```

Run a subset of tests with Vitest filters (no per-package test runner — one root Vitest config):

```bash
pnpm exec vitest run CartProvider          # files matching a path substring
pnpm exec vitest run -t "adds a new item"  # tests matching a name
pnpm exec vitest                            # watch mode
```

There is **no type-checking during build** — `builtin:swc-loader` strips types without checking. `pnpm typecheck` is the only thing that catches type errors; run it after changes.

## Architecture

Micro-frontend monorepo (pnpm workspaces + Rspack + Module Federation, deployed to the edge via Zephyr Cloud). Read `ARCHITECTURE.md` for the full picture; the points below are the ones that span multiple files and aren't obvious from any single one.

**Apps vs packages.** `apps/{store,cart,reviews}` are independently buildable MF apps (`store` is the host; `cart`/`reviews` expose remotes). `packages/{design-system,event-bus,types}` are **consumed as source** — `main` points at `./src/index.ts`, there is no package build step, and they're resolved via workspace symlinks (Rspack), tsconfig path aliases (`tsconfig.base.json`), and Vitest aliases (`vitest.config.ts`). Editing a package's `src` is picked up directly. Package tsconfigs are `noEmit`; do not commit generated `.d.ts` into package `src`.

**Remote resolution (the host).** The host declares static remotes in `apps/store/rspack.config.js` (`cart@http://localhost:3001/...`), but those localhost URLs are dev fallbacks: in a Zephyr build a runtime plugin rewrites each remote entry to its deployed edge URL before it loads. `apps/store/src/components/RemoteComponent.tsx` is the single choke point — it maps logical names to `import('cart/CartWidget')` lazy imports wrapped in `Suspense` + `ErrorBoundary` so an offline remote degrades gracefully. Federated module types are **hand-maintained** in `apps/store/src/remotes.d.ts` (`dts: false` in every MF config — there is no auto-generated `@mf-types`).

**Cross-MF communication.** `@mgs/event-bus` is a typed wrapper over `window` `CustomEvent`s (`dispatch`/`listen`/`useEventBus`). Producers and consumers are decoupled — e.g. `GameCard` dispatches `CART_ITEM_ADDED`, the Cart MF's provider handles it, and the host header re-derives its badge count purely from `CART_UPDATED`. Active events: `CART_ITEM_ADDED`, `CART_UPDATED`, `REVIEW_SUBMITTED`.

**Cart state (the subtlest part).** There is intentionally **no global store** (it would conflict with MF isolation). Multiple `CartProvider` instances coexist on one page (the header's `CartWidget` and the `CartPage`). They stay in sync through localStorage + a same-tab `mgs:cart:sync` DOM event + cross-tab `StorageEvent`. Echo loops are prevented by comparing a **last-synced serialized snapshot** (not a "skip the next effect" latch — that approach was buggy and was removed). Pure logic (reducer, totals, storage load/validate) lives in `apps/cart/src/store/cartState.ts`; the React wiring/effects live in `CartProvider.tsx`. Test the pure module directly.

**Entry points.** Each app's `src/index.ts` is just `import('./bootstrap')` — the async boundary is required so Module Federation's share scope initializes before any app code runs. Don't add logic there.

## Testing

Vitest + React Testing Library + jsdom, configured once at the root (`vitest.config.ts`, `vitest.setup.ts`). Notable: the config aliases the federated specifiers (`cart/CartWidget`, `reviews/ReviewList`, …) to stubs in `test/` because they don't resolve outside an MF build — that's how `RemoteComponent` is testable. Coverage thresholds are **per-file at 80%** on statements/branches/functions/lines, so adding a source file without matching tests will fail `pnpm test:coverage` and CI. Entry points, `bootstrap.tsx`, and `packages/types` (type-only) are excluded from coverage.

CI (`.github/workflows/ci.yml`) runs typecheck → lint → `test:coverage` → a `DISABLE_ZEPHYR=1` build on push/PR.
