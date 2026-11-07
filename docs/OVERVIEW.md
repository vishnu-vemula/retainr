# Retainr — Architecture & Features Guide

A guided tour of how Retainr is built and what it does. Use it to get oriented before you read the code.

- **Rules and laws** live in [`ARCHITECTURE.md`](../ARCHITECTURE.md), which wins if the two documents disagree.
- **Setup and commands** live in [`README.md`](../README.md).
- **Agent workflows** live in [`AGENTS.md`](../AGENTS.md) and [`SKILLS.md`](../SKILLS.md).

---

## 1. What Retainr is

Retainr is a proposal-to-renewal workspace for performance-marketing agencies. It follows a client from first lead to signed retainer and through renewal:

```
Lead ─► Discovery ─► Scope sent ─► Client review ─► Won ─► Onboarding ─► Retainer health ─► Renewal
         (pipeline)              (shareable proposal)   (5 handoff tasks)  (alerts, dashboard)
```

Every record belongs to one user (`ownerId`). Shared workspaces are planned work and not built yet.

---

## 2. System at a glance

```
┌──────────────────────────── Browser ────────────────────────────┐
│ Next.js 16 App Router                                            │
│  (site)  public marketing pages   — server components           │
│  (auth)  /login, /signup          — Firebase JS SDK              │
│  (crm)   signed-in workspace      — client components + RQ       │
│  proposal/[token]  public client view of a proposal             │
└───────────────┬─────────────────────────────────────────────────┘
                │ Authorization: Bearer <Firebase ID token>
                ▼
┌──────────────────────── Express API (/api/v1) ──────────────────┐
│ helmet · CORS allow-list · compression · pino · rate limit      │
│ router ─► controller (Zod) ─► service (DI) ─► repository        │
└───────────────┬───────────────────────────────┬─────────────────┘
                ▼                               ▼
        PostgreSQL (Prisma)            Firebase Admin (verify tokens,
                                       custom role claims)
```

| Concern | Choice |
|---|---|
| Language | TypeScript (strict) on both sides |
| Backend | Express, Zod, Prisma, firebase-admin, Pino |
| Frontend | Next.js 16 App Router, React, React Query, Tailwind, @hello-pangea/dnd |
| Identity | Firebase Authentication (email/password + Google) |
| Data | PostgreSQL, every row owner-scoped |
| Tests | Vitest (unit / integration / regression), headless Chrome journey, Node test runner (frontend) |

---

## 3. Backend architecture

### 3.1 Request lifecycle

1. `src/main.ts` boots `createApp()` from `src/app.ts`.
2. `app.ts` installs the global middleware (helmet, CORS, compression, pino-http with the auth header redacted, a rate limit per 15 minutes, a 1 MB JSON limit), then mounts one router per feature under `/api/v1/<feature>`. `GET /health` sits outside the prefix.
3. The feature router applies `auth.requireAuth` and, for admin routes, `auth.requireRole('ADMIN')`.
4. The **controller** reads `req.user`, parses the body or query with the feature's Zod schema, and calls the service.
5. The **service** applies the business rules: ownership checks, stage logic, side effects through ports.
6. The **repository** runs Prisma queries, always filtered by `ownerId`.
7. The response is `{ data }`. Any thrown error goes to `common/middleware/error.middleware.ts`, which returns `{ error: { code, message, details? } }`. Zod errors become 422, Prisma P2025 becomes 404, P2002 becomes 409, and P2003 becomes 422.

### 3.2 Folder map

```
backend/src/
├── config/env.ts            # the only reader of process.env (Zod-validated, fails fast)
├── common/
│   ├── middleware/          # auth.middleware.ts, error.middleware.ts
│   └── utils/               # AppError, asyncHandler, and the cross-feature ports
├── database/                # prisma.ts, firebase.ts
├── features/<name>/         # router · controller · service · repository · schemas · spec
├── container.ts             # composition root: builds every object exactly once
└── app.ts / main.ts
```

### 3.3 Dependency injection

There is no DI framework. `container.ts` creates Prisma, then the repositories, services, controllers and routers in dependency order. Services depend on **interfaces** (`IDealsRepository`, `AuditLogger`, and so on), so unit tests pass in-memory fakes.

When one feature needs a narrow capability from another, the container passes a small object literal instead of the whole service. For example, contacts receives `{ companyOwnedByOwner }` from the companies repository.

### 3.4 Ports (cross-feature side effects)

| Port (`common/utils`) | Implemented by | Used for |
|---|---|---|
| `AuditLogger` | `AuditService` | CREATE / UPDATE / DELETE / STAGE_CHANGE rows on every mutation |
| `NotificationDispatcher` | `NotificationsService` | `DEAL_WON` and other in-app alerts |
| `OnboardingTaskCreator` | `TasksService` | Five onboarding tasks when a deal is won |
| `RenewalAlertSync` | `NotificationsService` | Renewal-due and at-risk alerts, synced when data is read |
| `TagsOwnershipChecker` | `TagsService` | Check that every attached tag belongs to the requester |

### 3.5 Ownership and security model

- Every CRM table has `ownerId`. Update and delete use the compound unique key `@@unique([id, ownerId])`, so the database also rejects access to another user's rows.
- Nested resources (deal items) load the parent through `DealsService.get` first, so ownership comes from the parent.
- Foreign keys supplied by the client (contactId, companyId, tagIds, productId) are checked for ownership before they are linked.
- The API reads the user's role from the database on every request, so role changes apply immediately. Admin routes also require a verified email that matches the stored email.
- Proposal links are **capability URLs**. Only a SHA-256 hash of the token is stored, the raw token is returned once, and the public routes are registered before the auth guard.

### 3.6 Data model

```
User (id = Firebase UID, role USER|ADMIN)
 ├── Company ──< Contact ──< Deal >── Company
 │                │   └──< Task >───────┘
 │                ├──< Activity (NOTE / CALL / EMAIL / MEETING; also on Deal, Company)
 │                └──< Tag (M2M; also on Deal)
 ├── Product ──< DealItem >── Deal        (BASE / PACKAGE / ADD_ON)
 ├── Deal ──< Proposal                    (immutable snapshot, hashed token, expiry)
 └── Notification                         (deduped by ownerId + dedupeKey)

AuditLog (owner × entity × action)
```

The stored deal-stage enum is `NEW, QUALIFIED, PROPOSAL, NEGOTIATION, WON, LOST`. The UI labels these Lead, Discovery, Scope sent, Client review, Won and Lost.

---

## 4. Frontend architecture

### 4.1 Routing (`frontend/app`)

| Group | Routes | Notes |
|---|---|---|
| `(site)` | `/`, `/features`, `/pricing`, `/security`, `/about`, `/contact` | Server components with `metadata`. Copy lives in `features/marketing/model/content.ts` |
| `(auth)` | `/login`, `/signup` | Firebase sign-in and sign-up |
| `(crm)` | `/dashboard`, `/contacts[/:id]`, `/companies[/:id]`, `/deals[/:id]`, `/renewals`, `/tasks`, `/activities`, `/reports`, `/notifications`, `/settings/{account,tags,products,users}` | The layout redirects signed-out users to `/login`. `/settings/users` is ADMIN-only |
| `proposal/[token]` | Public proposal view | No login, no referrer, not cached, not indexed |

Page files are thin `'use client'` wrappers that render a feature component.

### 4.2 Three-layer data fetching

```
features/<name>/api/*.ts        pure async functions via shared apiFetch, no React
          │
features/<name>/hooks/*.ts      React Query: query keys, optimistic updates, invalidation, toasts
          │
features/<name>/components/*.tsx  render only; never call fetch or api/ directly
```

- `shared/lib/api-client.ts` attaches the Firebase ID token, unwraps `{ data }` and throws `ApiError` for errors.
- `useReorderDeals` updates the Kanban board optimistically and rolls back if the request fails.
- Response types live in `shared/types.ts` and must match the backend Zod schemas.

### 4.3 Auth on the client

`AuthProvider` (`features/auth`) watches the Firebase user. On each login it calls `POST /auth/session` once to sync the profile and role, then exposes `{ firebaseUser, profile, role, loading }`. It clears the React Query cache when the account changes.

### 4.4 UI system

- Theme tokens are HSL variables in `app/globals.css`, exposed through `tailwind.config.mjs`. Components use tokens, never raw hex values.
- Primitives in `shared/components/ui/` (buttons, cards, inputs) hold all base styling.
- `AppShell` combines a floating `AppSidebar` (navigation, Ctrl/⌘+K global search, unread badge, account menu) with the content area. On small screens the sidebar opens as a drawer. Navigation entries live in `shared/lib/navigation.ts`.

---

## 5. Features

Each feature lists what the user sees, then where it lives in the code (backend `features/<x>`, frontend `features/<x>`).

### 5.1 Public website — `marketing`
Home, features, pricing (monthly/annual toggle), security, about and contact pages. These pages render without Firebase configured. Only the navbar, pricing toggle and contact form are client components.

### 5.2 Authentication and users — `auth`, `users`
- Email/password and Google sign-in. Password signup sends a verification email, and Account settings can resend it.
- Verified emails listed in `BOOTSTRAP_ADMIN_EMAILS` are promoted to ADMIN. This setting never demotes anyone.
- Admins list users and change roles with `PATCH /users/:id/role`, which updates the database row and the Firebase custom claim.
- The Account page shows the profile, role, sign-in method, password reset and sign-out.

### 5.3 Contacts — `contacts`
CRUD with status, source, company link and tags. Supports search and pagination, and CSV export (`GET /contacts/export`, routed before `/:id`). The contact detail page shows the activity timeline, related deals and tasks, and the audit trail. `lastActivityAt` updates whenever an activity is logged.

### 5.4 Companies — `companies`
Profiles with industry, size and revenue. The detail page lists the company's contacts and deals.

### 5.5 Pipeline and engagements — `deals`
- A Kanban board with drag-and-drop between stages. `PATCH /deals/reorder` saves stage and position for many cards in one transaction.
- Each engagement is a project or a retainer, with one-time and monthly values, service, renewal and review dates, renewal health, probability, and loss or churn reasons.
- **Stage rules** in `DealsService.update`:
  - A stage change sets a default probability: NEW 10 … NEGOTIATION 75, WON 100, LOST 0.
  - `closedAt` is set or cleared only when the stage actually changes.
  - Each stage change writes a `STAGE_CHANGE` audit row.
  - Moving to WON sends a deduped `DEAL_WON` notification and creates the onboarding checklist.

### 5.6 Quote builder — `deals` (items) and `products`
- Line items come from the product catalog or free text, each marked BASE, PACKAGE or ADD_ON.
- Every item change recalculates `deal.value`.
- Three templates (`deal-templates.ts`) append starter items: paid ads management retainer, SEO retainer, and website build and maintenance. Template prices are examples to review before sharing.
- Products are managed in Settings → Products.

### 5.7 Shareable proposals — `proposals`
1. The owner creates a proposal from an open deal. The current quote items are saved as an immutable snapshot, and the response contains a 256-bit token once. The link expires after 1–90 days.
2. The client opens `/proposal/<token>`. The proposal is marked viewed.
3. The client picks packages and add-ons, then accepts or declines.
4. On acceptance, `ProposalsRepository` runs one transaction that:
   - checks the selected item IDs against the snapshot,
   - records the decision,
   - sets the deal value to the selected total,
   - moves the deal to WON,
   - writes the decision and stage audit rows.
5. After the transaction, the won notification and the idempotent onboarding tasks are created. Replaying the accepted response retries this step safely.

Proposals cannot be created for closed deals, and a stale proposal cannot overwrite a deal that is already won or lost. Acceptance is not an electronic signature or a payment.

### 5.8 Onboarding and tasks — `tasks`
- Tasks have a priority and due date, can link to a contact and a deal, track overdue status, and support quick-complete.
- A won deal creates five onboarding tasks: collect assets and access (+1 day), schedule kickoff (+2), confirm scope (+3), assign account owner (+5), and schedule the first client review (+7).
- These tasks are idempotent through the unique key `(ownerId, dealId, onboardingKey)`.

### 5.9 Activities — `activities`
Notes, calls, emails and meetings attached to contacts, deals or companies. Records show a timeline of their activities, and `/activities` is a workspace-wide feed grouped by day and filterable by type.

### 5.10 Tags — `tags`
Colored tags on contacts and deals, managed in Settings → Tags. `PATCH .../:id/tags` replaces a record's tags after `TagsService.assertAllOwned` checks that every tag belongs to the requester.

### 5.11 Notifications — `notifications`
- An in-app bell with an unread count, plus a `/notifications` page. Users can mark selected notifications or all of them as read.
- Alert types and their dedupe keys:
  - `deal-won:<id>`
  - `task-overdue:<id>`
  - `renewal-due:<id>:<date>`
  - `retainer-at-risk:<id>`
- There is no scheduler. Overdue-task and renewal alerts are synced when the notifications list or the dashboard loads.

### 5.12 Audit trail — `audit`
Every create, update, delete and stage change is recorded per owner and per entity. Detail pages show it through the shared audit timeline (`GET /audit?entityType=&entityId=`).

### 5.13 Global search — `search`
One owner-scoped query across contacts, companies and deals, opened from the sidebar or with Ctrl/⌘+K.

### 5.14 Dashboard, reports and renewals — `dashboard`
`DashboardService` is the one service allowed to run Prisma aggregates directly. It is owner-scoped and powers three pages:
- **Dashboard**:
  - pipeline value, won value and average deal size,
  - a six-month revenue trend and stage distribution,
  - top companies, tasks due soon and recent activity,
  - v1 metrics: time from lead to accepted proposal, missed renewals, onboarding completion time, MRR, and whether the owner was active in the last seven days.
- **Reports**: win rate, revenue trend, pipeline by stage, contact mix, task health and top companies.
- **Renewals**:
  - renewals due in the next 30, 60 and 90 days, plus missed renewals,
  - inactive accounts, overdue onboarding and account health,
  - MRR and a weighted renewal forecast for each currency.

---

## 6. Key flows end to end

### Win a deal from the board
```
drag card to Won ─► useReorderDeals (optimistic) ─► PATCH /deals/reorder
  └─ DealsService: stage rules ─► AuditLogger(STAGE_CHANGE)
                               ─► NotificationDispatcher(DEAL_WON, deduped)
                               ─► OnboardingTaskCreator(5 tasks, idempotent)
  └─ invalidate ['deals'], ['dashboard'], ['tasks'], ['notifications']
```

### Client accepts a proposal
```
/proposal/<token> ─► GET /proposals/public/:token (hash lookup, mark viewed)
choose items ─► POST /proposals/public/:token/respond
  └─ ProposalsRepository transaction: validate items · record decision ·
     deal.value = selected total · stage = WON · audit rows
  └─ after commit: syncWon ─► onboarding tasks + DEAL_WON notification
```

### Renewal alert
```
open dashboard or notifications ─► RenewalAlertSync
  └─ dealsRepository.findRenewalAlerts(owner, horizon)
  └─ upsert renewal-due / retainer-at-risk notifications by dedupeKey
```

---

## 7. Testing and CI

| Suite | Command (in `backend/` unless noted) | Needs |
|---|---|---|
| Backend unit | `npm test` | Nothing; uses fake repositories |
| Integration | `npm run test:integration` | Scratch Postgres on :5434 |
| Regression (route order, owner isolation) | `npm run test:regression` | Same scratch Postgres |
| Browser journey (proposal → won → onboarding → renewal) | `npm run test:browser` | Scratch Postgres, frontend deps, Chrome/Edge |
| Frontend unit | `npm test` in `frontend/` | Nothing |

GitHub Actions runs separate backend, frontend and lint workflows on pull requests and on pushes to `main`.

---

## 8. Where to add things

| You want to… | Touch |
|---|---|
| Add an API resource | `backend/src/features/<name>/` (router, controller, service, repository, schemas, spec), wire it in `container.ts`, mount it in `app.ts` |
| Add a screen | `frontend/src/features/<name>/{api,hooks,components}` and a thin page in `app/(crm)/…`, then add a nav entry in `shared/lib/navigation.ts` |
| Add an env var | `backend/src/config/env.ts` and `.env.example`, and document it in README and ARCHITECTURE |
| Change the schema | `prisma/schema.prisma`, then `npx prisma migrate dev --name <change>`, then update repository fakes |
| Add a cross-feature side effect | Define a port in `common/utils` and inject it from `container.ts` |
