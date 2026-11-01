# Spenda Backend — Session Memory

## Scope
Data model lives in `src/prisma/`. The user writes logic, routes, and controllers;
`src/modules/` is now started (auth only). `ARCHITECTURE.md` is still empty.

## Objective
Make `src/prisma/contract.prisma` the single source of truth and apply it to the
Supabase project, with RLS enforced for client (Supabase Auth) access.

## Stack facts
- Prisma **8** (rc). No `schema.prisma`, no generated `PrismaClient`.
- `@prisma/client@7.10.1` is still in `package.json` but is **unused and incompatible**
  with the Prisma 8 contract. Do not import `PrismaClient`.
- `prisma.config.ts`: contract `./src/prisma/contract.prisma`, `extensions: [supabasePack]`,
  `db.connection = DIRECT_URL`, migrations `./src/prisma/migrations`.
- `.env`: `DATABASE_URL` is the transaction pooler (`:6543`) — do **not** use it with Prisma.
  `DIRECT_URL` is the session pooler (`:5432`) — used for both migrations and runtime.
- Supabase auto-enables RLS on every new `public` table. Models must declare `@@rls`
  or `db migrate` fails `MIGRATION.SCHEMA_VERIFY_FAILED`.
- Auth strategy: **Supabase Auth**. Frontend signs up/in; backend verifies the access
  token with `db.asUser(jwt)` and relies on RLS. No custom JWT/bcrypt for auth.

## Contract changes made
- 5 models: `User`, `Profile`, `ExpenseLog`, `ExpenseHistory`, `Category`;
  `User.id` is `Uuid` linked to `supabase:auth.AuthUser`; enum `DURATION`.
- `ExpenseLog.category_id` is now **required** (`Int`), `category` non-null,
  `onDelete: Restrict`. Category → many logs (N:1).
- `ExpenseHistory.log_id` is now **@unique** (1:1 with `ExpenseLog`); the redundant
  `@@index([log_id])` was removed.
- `@onUpdate(now())` on `User.updated_at` and `Profile.updated_at`.
- `@@index([user_id, created_at])` on `ExpenseLog` (plus `user_id`, `category_id`).
- `@@rls` on all 5 models plus 17 `policy_*` blocks (all `authenticated`):
  - User/Profile/ExpenseLog: select/insert/update/delete scoped to the owner
    (`id` or `user_id` = `auth.uid()`); update uses `using` + `withCheck`.
  - ExpenseHistory: same four ops, ownership derived via
    `exists (select 1 from public.expense_log l where l.id = "expense_history"."log_id" and l.user_id = auth.uid())`.
  - Category: `SELECT` for all authenticated (`using = sql\`true\``); no write policies,
    so writes are service_role only.
- `service_role` bypasses RLS; `anon` gets nothing.

## Database state
- App storage hash / marker: `556c6aad3bad930bf8b908e5a933f0d83ec36a8abe0eb871d93b185f4493f154`.
- Supabase pack space hash: `110ad99e1e466691bdb0a4349a17365561e76ad017f58beb272f4496b05b8e9e`.
- Applied via `npx prisma db update --yes` (22 operations): NOT NULL + unique
  constraint + FK + all 17 policies. Live-verified with `pg_policies`, `pg_constraint`,
  `pg_attribute` (RLS on all 5 tables).
- The migration snapshot store had been deleted, which broke `db migrate`/`verify` with
  `MIGRATION.CONTRACT_SPACE_VIOLATION`. Restored the Supabase pack snapshot at
  `migrations/snapshots/110ad.../contract.json` from the installed pack.
- `db update` advanced the `db` ref and wrote:
  - `migrations/app/refs/db.json`
  - `migrations/snapshots/556c.../contract.{json,d.ts}`
- Only `migrations/app/` + `migrations/snapshots/` + `migrations/supabase/refs` exist;
  there are no authored migration bundles.
- Tables were empty at migration time, so NOT NULL / unique changes were safe.

## Known blocker (not ours)
- Full `db verify` reports **37 failures**, all in the external Supabase pack space
  (`auth`, `storage`). Cause: installed `@prisma/orm-extension-supabase` `8.0.0-rc.21`
  is older than the live Supabase schema; rc.21 is the latest published pack.
  Does not affect `public`. Do not try to "fix" these with migrations.

## Prisma runtime (`src/prisma/db.js`)
- Created. Builds the client from `contract.json` with
  `contractFromJson` (`@prisma/orm-postgres/static`) and `supabase()`
  (`@prisma/orm-extension-supabase/runtime`).
- Uses `databaseUrl` (= `DIRECT_URL`) and `supabaseJwksUrl` from `src/config/env.js`;
  throws at startup if either is missing. Top-level `await` (ESM); the factory fetches
  JWKS once. No new env vars needed (`env.js` derives JWKS from `SUPABASE_URL`).
- Role-first: `db.asUser(jwt)` / `db.asAnon()` / `db.asServiceRole()`; there is no
  top-level `db.orm` / `db.sql` and no `db.user`.

## Auth module state
- `src/modules/auth/auth.model.js` — implemented:
  - `getAuthenticatedUser(jwt)` → `db.asUser(jwt)`, `decodeJwt` for `sub`/`email`,
    upserts `public.user` + `public.profile`, returns `{ user, profile }`.
- `auth.controller.js`, `auth.route.js` — empty.
- `auth.service.js` — user WIP, contains syntax errors; not committed.
- `src/middlewares/auth-handler.js` — empty.
- Not yet mounted in `src/app.js` (`// Mount routes here.`).

## API design (agreed direction, not implemented)
- Base `/api/v1`; Supabase handles signup/login; every route uses `Authorization: Bearer`.
- Self-only: `GET/PATCH /auth/me`, `PATCH /auth/profile`, `DELETE /auth/account`.
- Shared read: `GET /categories`, `GET /categories/:id`; no client writes.
- Self-only expenses: list/create/get/patch/delete under `/expenses` (required
  `category_id`); history nested under `/expenses/:id/history` (1:1).
- No user directory, no cross-user reads, no `user_id` in bodies, ownership failures
  return 404 not 403.
- Open questions: profile route location, history nesting, account-deletion scope
  (app data vs Supabase Auth user), pagination style, summary/aggregates, username privacy.

## Current file tree
```
src/
  app.js, server.js
  config/env.js
  middlewares/{auth-handler.js (empty), error-handler.js, rate-limiter.js}
  modules/auth/{auth.model.js, auth.controller.js (empty), auth.route.js (empty), auth.service.js (WIP)}
  prisma/{contract.prisma, contract.json, contract.d.ts, db.js, migrations/}
```

## Verified
- `node src/server.js` boots; `GET /health` → 200.
- `import './src/prisma/db.js'` loads; contract namespace `public`; role methods present.
- `import './src/modules/auth/auth.model.js'` exports `getAuthenticatedUser`.

## Next steps
1. Finish API contract (endpoint schemas) and then controller/service/route.
2. Add `requireAuth` middleware: read Bearer token, `req.db = await db.asUser(token)`,
   map `SUPABASE.JWT_INVALID` to 401.
3. Mount `/auth` in `src/app.js`.
4. After any contract change: `npx prisma contract emit`, then `npx prisma db update`
   (or plan a migration) and re-check `public`.
5. Leave Supabase-pack `db verify` failures alone.
