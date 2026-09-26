# Retainr — Architecture

Single source of truth for architecture decisions. Every PR is reviewed against these laws (see `AGENTS.md` for the agent-facing summary and `SKILLS.md` for task workflows).

---

## 1. System overview

```
Browser (Next.js App Router — client-rendered CRM UI)
  │  Firebase JS SDK ── email/password + Google sign-in
  │  Authorization: Bearer <Firebase ID token>
  ▼
Express API (TypeScript)                     Firebase Auth (identity, custom claims)
  ├─ helmet / CORS allow-list / rate limit
  ├─ Zod validation (controllers)
  ├─ Services (business logic, DI)
  ├─ Repositories (Prisma only)
  ▼
PostgreSQL via Prisma ORM
```

- **Identity** lives in Firebase; **authorization** (roles) is a Firebase custom claim mirrored to a `User` row.
- **Data ownership**: every CRM row carries `ownerId`; all queries filter by it (law 7). The DB layer enforces it with `@@unique([id, ownerId])` compound keys.
- **Admin**: users in `BOOTSTRAP_ADMIN_EMAILS` are promoted on first login; admins can change roles via `PATCH /users/:id/role` (sets claim + row).

## 2. Backend (`backend/`)

### 2.1 Layering

```
router        route table + guards (auth.requireAuth, requireRole) — reorder-style static routes before /:id
controller    thin: requireUser + Zod parse (body/query) + delegate + envelope response
service       business logic (ownership checks, position math, FK ownership guards)
repository    the only layer that touches Prisma
```

- Controllers never import Prisma; services never touch `req`/`res`.
- Cross-feature ownership checks (e.g. "does this contact belong to me?") are done through the feature's own repository (`relationOwnedByOwner`) — services accept narrow collaborator interfaces, not other services.

### 2.2 Feature folder shape

```
src/features/<name>/
├── <name>.router.ts        # build<Name>Router(controller, authMiddleware)
├── <name>.controller.ts    # class with asyncHandler methods
├── <name>.service.ts       # class, collaborators via constructor
├── <name>.repository.ts    # I<Name>Repository interface + Prisma implementation
├── <name>.schemas.ts       # Zod: list query + create/update bodies
└── <name>.service.spec.ts  # unit tests with fake repositories
```

### 2.3 Dependency injection

There is no DI framework. `src/container.ts` is the composition root: it instantiates Prisma, repositories, services, controllers, routers exactly once and hands routers to `app.ts`. `app.ts` and `main.ts` contain no feature logic.

Rules:
- Services declare constructor dependencies as repository **interfaces** (`IContactsRepository`), so unit tests pass in-memory fakes.
- Only `container.ts` may `new` services/controllers.
- `process.env` is read exclusively in `src/config/env.ts` (Zod-validated, fails fast at boot).

### 2.4 Cross-cutting collaborators (ports)

Side effects that span features are defined as interfaces in `common/utils` and injected like repositories:

- `AuditLogger` (implemented by `AuditService`) — mutations in contacts/companies/deals/tasks/activities/tags/products/proposals write audit rows.
- `NotificationDispatcher` (implemented by `NotificationsService`) — deals dispatch `DEAL_WON`; overdue tasks and renewal alerts sync lazily on dashboard/notifications reads.
- `OnboardingTaskCreator` (implemented by `TasksService`) — won-deal transitions create the five owner-scoped onboarding handoffs through an idempotent repository insert.
- `RenewalAlertSync` (implemented by `NotificationsService`) — dashboard reads trigger the same deduped renewal alert pass as notifications reads.
- `TagsOwnershipChecker` (implemented by `TagsService`) — tag attach endpoints validate every tag belongs to the requester.

Sanctioned Prisma aggregates (no repository): `DashboardService` (stats) and `SearchService`'s repository lives in its feature; both are owner-scoped.

### 2.4 Auth flow

1. Client sends `Authorization: Bearer <Firebase ID token>`.
2. `AuthMiddleware.requireAuth` verifies via `firebase-admin` `verifyIdToken`.
3. `UsersService.ensureFromToken` upserts/refreshes the `User` row (1h in-memory cache per uid) and applies bootstrap-admin promotion.
4. `req.user = { uid, email, role }`; `requireRole('ADMIN')` guards admin routes.
5. Errors: 401 `UNAUTHENTICATED`, 403 `FORBIDDEN` — always the error envelope.

### 2.5 Error handling

`common/middleware/error.middleware.ts` is the single exit path:

| Source | Status | Code |
|--------|--------|------|
| `AppError` | its `.status` | its `.code` |
| Zod `ZodError` | 422 | `VALIDATION_ERROR` (+ field details) |
| Prisma `P2025` | 404 | `NOT_FOUND` |
| Prisma `P2002` | 409 | `CONFLICT` |
| Prisma `P2003` | 422 | `INVALID_RELATION` |
| anything else | 500 | `INTERNAL_ERROR` (logged, never leaked) |

### 2.6 Domain model (Prisma)

```
User (id = Firebase UID, role)
 ├── Company ──< Contact ──< Deal >── Company
 │               │   └──< Task >──────┘
 │               ├──< Activity (NOTE/CALL/EMAIL/MEETING; also on Deal/Company)
 │               └──< Tag (M2M; also on Deal)
 ├── Product ──< DealItem >── Deal
 ├── Deal ──< Proposal (immutable snapshot, hashed expiring share token)
 └── Notification (task, deal-won, renewal and risk alerts; deduped by ownerId+dedupeKey)

AuditLog (action × entity per owner: CREATE/UPDATE/DELETE/STAGE_CHANGE)
```

- Enums include `EngagementType`, `RenewalHealth`, `DealItemKind`, and `ProposalStatus`; existing `DealStage` values remain stable while the UI labels them Lead → Discovery → Scope sent → Client review → Won/Lost.
- `Deal.position` orders cards inside a stage; `POST /deals` appends at `max+1`; `PATCH /deals/reorder` writes batch updates in a transaction.
- **Stage business rules** (`DealsService.update`): stage change sets default probability (NEW 10 → NEGOTIATION 75, WON 100, LOST 0), stamps/clears `closedAt` only when the stage actually changes, writes a `STAGE_CHANGE` audit row, and dispatches a deduped `DEAL_WON` notification and onboarding checklist on WON. Editing an already-won deal preserves its original close date.
- **Quote builder**: `DealItem` rows (product or free text) carry `BASE`, `PACKAGE`, or `ADD_ON`; item mutations recalculate `deal.value`. Three reusable templates append starter quote items.
- **Proposals**: creation snapshots current quote items for open engagements and returns a 256-bit share token once. Only its SHA-256 hash is stored. Public read marks viewed; an accepted response validates package/add-on choices and atomically records the decision, sets the deal value to selected items, moves it to WON, and writes the decision/stage audit rows in `ProposalsRepository`. This is the one cross-entity repository transaction needed to keep an acceptance consistent. A second outstanding proposal cannot overwrite a won or lost engagement, and new proposals cannot be created for closed engagements. The won notification and idempotent onboarding tasks sync after the transaction and can be retried by replaying the accepted response. Links expire after 1–90 days. The public proposal page sends no referrer, is not cacheable, and is excluded from search indexing. Public routes are capability-token exceptions to the owner query rule; owner list/create remain owner-scoped.
- **Renewals**: the dashboard aggregate scopes won retainers by owner, reports 30/60/90-day windows, inactive accounts, overdue onboarding, MRR and weighted forecast by currency. Notifications sync renewal-due and at-risk alerts on read; there is no scheduler.
- **Activities**: create/update touches `contact.lastActivityAt` so lists can show recency.
- Relation deletes: owner cascade (`User`), `SetNull` for contact/company links (history survives).

## 3. Frontend (`frontend/`)

### 3.1 Folder shape

```
app/                        # Next.js App Router — views only (.tsx)
├── layout.tsx              # root layout: html/body + Providers (React Query, AuthProvider, toasts)
├── providers.tsx           # 'use client' composition of client providers
├── (site)/                 # public website (server components + metadata): /, /features, /pricing, /security, /about, /contact
├── (auth)/login|signup/    # public routes
├── proposal/[token]/       # public, read-only proposal and decision view
└── (crm)/                  # auth-guarded route group (layout checks Firebase user)
    ├── dashboard/page.tsx  # /dashboard
    ├── renewals/page.tsx   # /renewals
    ├── contacts/[contactId]/page.tsx …  # thin 'use client' wrappers importing feature components
src/features/<name>/
├── api/<name>-api.ts     # pure async functions, apiFetch, ZERO React imports (.ts)
├── hooks/                # React Query: query keys, optimistic updates, toasts (.ts)
├── components/           # presentational views, consume hooks only (.tsx)
└── model/schema.ts       # form Zod schemas (.ts)
src/shared/               # api-client, firebase, types.ts, format helpers, UI primitives (.tsx)
```

Views are `.tsx` (app routes + components); operations are `.ts` (api, hooks, model, lib). Workspace and interactive proposal route pages are thin `'use client'` wrappers. Public marketing pages are server components with route metadata; only interactive sections become client components.

### 3.2 Three-layer data rule (law 5)

- `api/` functions own URL/typing concerns and parse the envelope via `shared/lib/api-client.ts` (`ApiError` on failures).
- `hooks/` own query keys (`['deals', params]`), optimistic mutations with rollback (`useReorderDeals`), and cache invalidation (`['deals']`, `['dashboard']`).
- `components/` never import `api/` directly.

### 3.3 Auth on the client

`shared/lib/firebase.ts` lazily initializes the SDK (client-only singleton `getFirebaseAuth()`) from `NEXT_PUBLIC_FIREBASE_*` env. `AuthProvider` (features/auth) tracks the Firebase user, calls `POST /auth/session` once per login to sync the profile + role, and exposes `{ firebaseUser, profile, role, loading }`. Route guards live in `app/`: the `(crm)` layout redirects unauthenticated users to `/login`, and `app/(crm)/settings/users/page.tsx` is ADMIN-only.

### 3.4 UI system

- **Theme tokens** live in `app/globals.css` (`:root` HSL variables: light warm-neutral surfaces, red-orange `--primary`, dark `--ink` for high-emphasis pills) and are exposed through `tailwind.config.mjs` (`primary`, `ink`, the `brand-50…950` scale, `shadow-soft/lift/glow`, `font-display`). Components use tokens, never raw hex.
- **Primitives** in `shared/components/ui/` are the only place base styling lives (pill buttons incl. the `ink` variant, rounded-3xl cards, soft-focus inputs); feature components compose them.
- **Workspace shell**: `AppShell` = `AppSidebar` (floating left sidebar: logo, Ctrl/⌘+K `GlobalSearch`, workspace + settings nav, unread badge, early-access card, account menu) + content. There is no top bar or footer on desktop; below `lg` a slim bar opens the sidebar as a drawer. Links come from `shared/lib/navigation.ts` — add new routes there.
- **Website**: `features/marketing` holds the public site. `app/(site)/*/page.tsx` are server components that export `metadata` and render static feature components; only the navbar, pricing toggle and contact form are client components. All copy (plans, FAQs, features, contact email) lives in `features/marketing/model/content.ts`.
- **Brand**: `BrandMark`/`BrandLogo` (`shared/components/brand-logo.tsx`) render the logo as inline SVG in `currentColor`, so it always matches `--primary` (or white via `inverted`). `public/favicon.svg` and `public/logo.svg` are the static copies.

## 4. Environments

Declared and validated in `backend/src/config/env.ts`; mirrored in `.env.example` files.

| Var | Where | Purpose |
|-----|-------|---------|
| `DATABASE_URL` | backend | Postgres (add `?sslmode=require` on Neon/Supabase) |
| `CORS_ORIGIN` | backend | comma-separated browser origins |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | backend | single-line service-account JSON (preferred) |
| `FIREBASE_PROJECT_ID` / `FIREBASE_CLIENT_EMAIL` / `FIREBASE_PRIVATE_KEY` | backend | discrete alternative |
| `BOOTSTRAP_ADMIN_EMAILS` | backend | emails promoted to ADMIN on login |
| `SEED_OWNER_UID` | backend | seed data owner |
| `RATE_LIMIT_MAX` | backend | requests / 15 min / IP |
| `NEXT_PUBLIC_API_BASE_URL` | frontend | API base, default `http://localhost:4000/api/v1` |
| `NEXT_PUBLIC_FIREBASE_*` | frontend | web-app config (public by design; frontend dev port 3000 — keep it in `CORS_ORIGIN`) |

## 5. Testing strategy

- **Backend unit (Vitest)**: services with fake repositories — ownership scoping, position math, FK guards. Run `npm test` or `npm run test:unit`; no DB is required.
- **Backend integration (Vitest + Supertest + PostgreSQL)**: API flows, including public proposal acceptance through onboarding and renewal alerts, run against a scratch Postgres on port 5434. Run `npm run test:integration` (or its `test:e2e` alias) after applying migrations.
- **Backend regression (Vitest + Supertest + PostgreSQL)**: isolated tests protect high-risk route ordering and owner-isolation behavior. Run `npm run test:regression` against the same scratch database.
- **Frontend**: typecheck + lint + build are the current gates; hook tests with `QueryClient` wrapper are the next step.
- Contract safety: frontend types in `shared/types.ts` must stay in sync with Zod schemas — changing one without the other is a review blocker.

## 6. Future work (proposals, not commitments)

After solo-agency validation: workspace ownership/membership migration, Playwright smoke tests, BFF/proxy deployment option, and optional AI drafting, payment/e-signature/calendar/email integrations.
