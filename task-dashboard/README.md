# Task Dashboard

A production-style Task Management Dashboard built for the Senior Front End (Angular) assignment — Angular 20 (standalone components, signals), a hybrid signals/NgRx state layer, PrimeNG, and a self-contained mock backend so the app runs with zero external services.

- **Live design reference:** the layout, colors, and component styling were matched against the provided Figma file (colors were sampled directly from the file's color styles, not eyeballed from a screenshot).
- **Data:** seeded from `data-fetching/generate-data.js` (see `../DATA_README.md`), regenerated with fresh relative dates on every `npm run` that touches it — see [Mock backend](#mock-backend--data-layer) below.

---

## Table of contents

- [Tech stack & why](#tech-stack--why)
- [Getting started](#getting-started)
- [Available scripts](#available-scripts)
- [Environment configuration](#environment-configuration)
- [Architecture](#architecture)
- [State management](#state-management-signals--ngrx-hybrid)
- [Mock backend / data layer](#mock-backend--data-layer)
- [Testing strategy](#testing-strategy)
- [Performance](#performance)
- [Accessibility & responsive design](#accessibility--responsive-design)
- [Known limitations & future improvements](#known-limitations--future-improvements)

---

## Tech stack & why

| Concern | Choice | Why |
|---|---|---|
| Framework | Angular 20, standalone components | Required by the brief; standalone components remove the last real reason to reach for NgModules |
| Reactivity | Signals (`signal`, `computed`, `effect`, `toSignal`) | Angular's modern default — no manual subscription/unsubscription bookkeeping, and change detection can stay `OnPush` everywhere |
| Global state | NgRx (store, effects, entity) | See [State management](#state-management-signals--ngrx-hybrid) — used deliberately, not by default, for the one domain (tasks) that actually needs cross-cutting shared state, optimistic updates, and cache-aware effects |
| Data fetching | `HttpClient` (via NgRx effects) **and** the new `httpResource` API | Both are demonstrated on purpose: `httpResource` for the simple, read-mostly statistics; classic `HttpClient` for tasks, where NgRx effects need an actual `Observable` to compose with actions |
| UI library | PrimeNG 20 | Rich, accessible component set (dialogs, forms, menus, charts) without hand-rolling a11y-sensitive widgets from scratch |
| Drag-and-drop | Angular CDK | First-party, no extra dependency weight, integrates cleanly with signals-driven templates |
| Charts | Chart.js via PrimeNG's `p-chart` wrapper | Matches the assignment's suggestion directly |
| Styling | Plain CSS custom properties + component-scoped styles | The design's tokens (colors, radii, spacing) are simple enough that a full design-token pipeline would be over-engineering for this scope |
| Testing | Jasmine + Karma (Angular's default) | Zero extra build configuration risk; the goal was maximizing real test coverage, not migrating test runners. See [Testing strategy](#testing-strategy) |
| Lint/format | ESLint (`angular-eslint`) + Prettier + Husky/`lint-staged` | Required by the brief; wired to run on every commit |

## Getting started

**Prerequisites:** Node.js ^20.19 / ^22.12 / ^24 (Angular 20's supported range), npm.

```bash
cd task-dashboard
npm install

# (Re)generate the mock data with fresh relative dates (see DATA_README.md)
node ../data-fetching/generate-data.js

npm start
```

Then open `http://localhost:4200`.

## Available scripts

Run from inside `task-dashboard/`:

| Script | Purpose |
|---|---|
| `npm start` | Dev server with live reload (`ng serve`) |
| `npm run build` | Production build to `dist/task-dashboard` |
| `npm run watch` | Development-mode build that rebuilds on file changes |
| `npm test` | Unit tests (Karma + Chrome). Add `-- --no-watch --browsers=ChromeHeadless --code-coverage` for a single CI-style run with a coverage report |
| `npm run lint` | ESLint over `.ts` and `.html` |
| `npm run format` / `format:check` | Prettier write / check |

The Husky `pre-commit` hook runs `lint-staged` (ESLint `--fix` + Prettier) automatically on every commit — no manual step needed.

## Environment configuration

There is no `environment.ts`/build-time config in this project by design: every "environment-specific" concern is either a compile-time constant (the mock API's simulated latency, the tasks cache TTL — both are named constants at the top of their respective files) or is meant to be replaced wholesale when a real backend exists (see [Mock backend](#mock-backend--data-layer)). No API keys, secrets, or per-environment URLs are needed to run this project.

## Architecture

```
src/app/
├── core/                 # Cross-cutting, app-wide concerns
│   ├── data/             # Static reference data (mocked user roster)
│   ├── interceptors/     # Mock API HttpInterceptor
│   ├── models/           # Task/Statistic/Activity TypeScript interfaces
│   ├── services/         # Injectable services (API clients, filters, dialogs, the mock store)
│   └── theme/            # PrimeNG theme preset (brand colors from Figma)
├── state/tasks/          # NgRx slice for the Tasks domain (actions/reducer/selectors/effects)
├── layout/               # Shell, header, sidebar — the app chrome
├── shared/               # Presentational components, pure utils, form validators
└── features/             # One folder per routed feature, lazy-loaded
    ├── dashboard/         # Stat cards + board + recent activity
    ├── tasks/              # Kanban board, filters, task form dialog
    ├── analytics/          # Chart.js visualizations
    └── team/               # Mocked user roster with per-user task counts
```

**Smart vs. presentational.** Route-level "page" components (`*-page.component.ts`) and the board are *smart*: they inject the store/services and own decisions. Everything under `shared/components/` and small pieces like `StatCardComponent`, `TaskCardComponent`, `PriorityTagComponent`, and `AssigneeAvatarComponent` are *presentational*: pure `input()`/`output()` signals, no injected business logic, `OnPush` by construction since they have no mutable internal state to invalidate it.

**Routing & lazy loading.** Every feature is lazy-loaded via `loadComponent`/`loadChildren` in `app.routes.ts`; the shell (sidebar + header + the two app-wide dialogs) loads eagerly since it's needed on every route. Confirmed via `ng build`: each feature produces its own chunk (see the build output's "Lazy chunk files" list).

## State management: signals + NgRx hybrid

This was a deliberate split, not "NgRx for everything" or "signals for everything":

- **NgRx (`state/tasks/`)** owns the **Tasks** domain specifically, because it's the one place with real cross-cutting concerns: optimistic updates with rollback (create/update/delete/move all apply immediately and revert on server failure), a cache-aware load effect (skips the network call if the cache is still fresh, satisfying the brief's "use NgRx Effects to cache API responses"), and it's the domain multiple unrelated components need to read consistently (the board, the dashboard's recent-activity panel, the analytics charts, and the team page's per-user counts).
- **`httpResource` (`StatisticsResource`)** owns the dashboard **statistics** — deliberately *not* put in NgRx, because there's no mutation and nothing else depends on it. Since `httpResource` has no built-in retry, a one-shot auto-retry is wired by hand with an `effect()` watching `.error()` — see the class's doc comment for why.
- **Plain signals (`TaskFilterService`, `TaskDialogService`)** own UI-local state that several components need to share but that isn't worth centralizing: the search/status/priority filters (read by the header and the board, written by the header and the filter bar) and whether the create/edit dialog is open and for which task.

## Mock backend / data layer

There's no real backend. `core/interceptors/mock-api.interceptor.ts` is a functional `HttpInterceptorFn` that intercepts any request to `/api/*` and serves it from an in-memory store (`MockDataStoreService`), which lazily `fetch()`es the generated `public/data/tasks.json` / `statistics.json` on first use (via the native `fetch`, not `HttpClient`, so it can never re-enter the interceptor chain). It:

- Simulates realistic network latency (`delay(500ms)`) on every response.
- Simulates **one** transient `503` failure per unique endpoint on its very first request, so the app's retry logic (`retry(1)` in `TaskApiService`, the hand-rolled retry in `StatisticsResource`) has something real to demonstrate on initial load — not just untested code paths.
- Supports the full CRUD surface tasks need: `GET/POST /api/tasks`, `GET/PATCH/DELETE /api/tasks/:id`, `GET /api/statistics`, with proper 404s for unknown ids/resources.

Swapping in a real backend later means deleting the interceptor registration in `app.config.ts` and pointing `TaskApiService`/`StatisticsResource` at real URLs — nothing else in the app depends on the mock.

## Testing strategy

**163 specs, 98%+ coverage** on statements/branches/functions/lines (`npm test -- --no-watch --browsers=ChromeHeadless --code-coverage`).

Coverage was pursued as a byproduct of testing real behavior, not padded with trivial assertions — and it caught two genuine bugs during development:

1. Editing an already-overdue task failed validation immediately (the due-date-in-the-past validator didn't distinguish create from edit).
2. Date-only strings (`"YYYY-MM-DD"`) were parsed/formatted via UTC (`new Date(str)`, `.toISOString()`) instead of local calendar fields — for some timezones this could silently save the wrong due date, or misclassify a task due "today" as overdue.

What's covered, by layer:

- **Pure logic** (`shared/utils`, `shared/validators`): exhaustive edge cases (today/tomorrow/weeks, overdue-by-N, blank/whitespace input, past-date boundaries).
- **NgRx** (`state/tasks`): every reducer action handler including optimistic-apply and rollback; selectors against realistic multi-task state; effects tested with `provideMockActions`/`provideMockStore` and a spied `TaskApiService`, covering the cache-skip path, success, failure, and the mock backend's real error-message shape.
- **Services**: `TaskApiService` via `HttpTestingController`; `MockDataStoreService` with a spied `fetch`; `StatisticsResource` (an `httpResource`) via `HttpTestingController` + `fakeAsync`/`tick()`, including its one-shot retry; the interceptor itself, end to end, including its simulated-failure behavior (with a small test-only `resetMockApiAttempts()` export, since that tracking is intentionally module-level state).
- **Components**: presentational components by input/output contract; the board and dialogs against a `MockStore`, including drag-and-drop's `moveTask` dispatch and the delete-confirmation accept/reject paths via a spied `ConfirmationService`.

One non-obvious gotcha worth flagging for anyone extending this suite: `provideMockStore({ selectors: [...] })` overrides the *shared, module-level* NgRx selector exports in place. Every spec file that uses it must call `store.resetSelectors()` in `afterEach` — otherwise the override leaks into unrelated spec files bundled into the same Karma run (this bit us once; see the git history).

## Performance

- `ChangeDetectionStrategy.OnPush` on every component (there are no exceptions).
- Signals + `@for`'s built-in `track` throughout — no manual `trackBy` functions needed, no unnecessary re-renders.
- Every feature route is lazy-loaded (see [Architecture](#architecture)).
- The tasks NgRx effect skips the network entirely when the cached data is still fresh (60s TTL), rather than refetching on every navigation.
- `provideAnimationsAsync()` instead of the synchronous animations module, so PrimeNG's animation code splits into its own chunk instead of bloating the main bundle.

One area flagged rather than silently left as-is: a couple of lazy chunks (`shell`, `analytics`) are larger than ideal (~450-500KB), most likely PrimeNG modules and Chart.js not tree-shaking as tightly as they could. Given the time budget this wasn't chased further — see [Known limitations](#known-limitations--future-improvements).

## Accessibility & responsive design

- Buttons and icon-only controls have `aria-label`s; the mobile navigation backdrop is a real `<button>` (not a `click`-handled `<div>`) so it's keyboard- and screen-reader-reachable.
- PrimeNG's dialog/menu/confirm-dialog components carry their own focus-trapping and ARIA roles out of the box.
- **Responsive breakpoints:** below 1024px the sidebar becomes an off-canvas drawer (hamburger toggle in the header, tap-outside-to-close backdrop); below 640px the filter bar stacks vertically and its status tabs scroll horizontally instead of wrapping; below 480px the header's search bar takes the full available width and the notification bell hides to make room; the task dialog narrows to ~92vw and its paired fields stack into a single column. Verified via Chrome DevTools' device-metrics emulation at 390px/768px/1440px, not just written and assumed to work.

## Known limitations & future improvements

- **No CI pipeline yet** — planned as the next step after this README (GitHub Actions running lint + the full test suite with coverage on every PR).
- **No Docker/i18n** — scoped out deliberately to keep effort concentrated on the core functionality, architecture, and test coverage that make up the bulk of the evaluation criteria, rather than spreading thin across every bonus item.
- **Drag-and-drop** is implemented with standard Angular CDK primitives and structurally exercised in `TaskBoardComponent`'s tests (dispatch assertions on drop events), but wasn't separately verified with a real synthetic pointer-drag sequence in an automated test — CDK's drag simulation in headless test environments is notoriously fiddly, and the actual interaction was manually verified in a running browser instead.
- **Only one screen existed in the Figma file** (the dashboard/board overview). Analytics, Team, Calendar, and Settings pages were designed to match the existing visual language (colors, spacing, card styling) rather than against a provided mockup, since none existed for those routes.
- **Chunk sizes** for `shell` and `analytics` are larger than ideal — see [Performance](#performance).
- **Single mocked "logged-in user"**: the header avatar is a static "JD" — there's no auth flow, by design, since none was requested.
