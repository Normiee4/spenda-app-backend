# Spenda Backend — Session Memory

## Scope (corrected)
Work stays **inside `src/prisma/`**. The goal is the data model only.
The user writes all logic, routes, and controllers. `src/modules/` stays **empty**.

## Objective
Make `src/prisma/contract.prisma` the single source of truth and apply it to the
Supabase project.

## Stack facts
- Prisma **8** (rc). No `schema.prisma`, no `@prisma/client`.
- `prisma.config.ts`: contract `./src/prisma/contract.prisma`, `extensions: [supabasePack]`,
  `db.connection = DIRECT_URL`, migrations `./src/prisma/migrations`.
- `.env`: `DATABASE_URL` is the transaction pooler (`:6543`) — do **not** use it with Prisma.
  `DIRECT_URL` is the session pooler (`:5432`) — used for both migrations and runtime.
- Supabase auto-enables RLS on every new `public` table (`ensure_rls` → `rls_auto_enable`).
  A model **without** `@@rls` makes `db migrate` fail `MIGRATION.SCHEMA_VERIFY_FAILED`
  because the live table still has RLS. RLS is deny-all; the backend connects as
  table owner, so it is unaffected.

## Contract changes made
- `ExpenseLog.category_id Int?` + `category Category?` (nullable, required for `onDelete: SetNull`).
- `@onUpdate(now())` on `User.updated_at` and `Profile.updated_at`.
- Added `@@index([user_id, created_at])` to `ExpenseLog`.
- `@@rls` was added, then **removed by the user** after commit `ea8574b`;
  the contract was re-emitted so `contract.json` matches (no `@@rls` now).
- Final shape: 5 models — `User`, `Profile`, `ExpenseLog`, `ExpenseHistory`, `Category`;
  `User.id` is `Uuid` linked to `supabase:auth.AuthUser`; enum `DURATION`.

## Database state
- `contract.json` / `contract.d.ts` re-emitted after the contract edits.
- Deleted a stale, never-applied migration (`app/20261029T0916_init`) and its snapshot.
- Planned and applied a fresh migration (`app/20261029T1140_init`), then the local
  `migrations/app/` folder was removed. Only `migrations/supabase/refs` is tracked.
- Applied marker/storage hash: `6cb7f1fcdafe8e70615dbda472702537f01b7ab884e915925153c4dab7bf49df`.
- `prisma db verify --schema-only` → **0 issues** for `database/public`. App tables exist in Supabase.
- **The live `public` tables still have RLS enabled** (Supabase trigger), while the
  contract no longer has `@@rls`. A future `db migrate` will fail verify until the
  history is rebuilt or `@@rls` is restored.

## Known blocker (not ours)
- Full `db verify` reports ~37 failures, all in the external Supabase pack space
  (`auth`, `storage`). Cause: installed `@prisma/orm-extension-supabase` `8.0.0-rc.21`
  is older than the live Supabase schema; rc.21 is the latest published pack.
  Does not affect `public`. Do not try to "fix" these with migrations.

## Server layout (defined by user)
- `src/server.js` — HTTP server + server health. Serves `GET /health` before handing
  requests to the Express app. No DB dependency.
- `src/app.js` — builds the Express app: dependencies, middleware, and route mounting.
  Contains a trailing 404 and error handler. Routes are mounted by the user.
- **No `index.js` router.**

## Current file tree
```
src/
  app.js
  server.js
  config/env.js
  prisma/{contract.prisma, contract.json, contract.d.ts, migrations/}
  modules/            (empty)
```

## What was reverted
A first pass built out the Express app (modules, controllers, services, auth,
middlewares, Prisma client). It was deleted:
- `src/modules/*` — all module code removed, folder kept empty.
- `src/index.js` — removed.
- `src/middlewares/`, `src/utils/`, `src/config/db.js` — removed.
- Old `src/modules/ProfileSettings/` and `src/prisma/db.ts` — removed.
- `jose` remains installed but unused.

## Verified
- `node src/server.js` boots.
- `GET /health` → 200 with service, environment, uptime.
- `GET /` → app root JSON.

## Next steps
1. Continue **model work only** in `src/prisma/`: fields, relations, indexes, `@@rls`.
2. After any contract change: `npx prisma contract emit`, then
   `npx prisma db migrate` (new migration) and `npx prisma db verify --schema-only`.
3. Decide how to handle RLS: either restore `@@rls` on all models, or rebuild the
   `migrations/app` history so verify accepts the current contract.
4. Leave the Supabase-pack `db verify` failures alone.
5. The user will add routes/controllers and mount them in `src/app.js`.
