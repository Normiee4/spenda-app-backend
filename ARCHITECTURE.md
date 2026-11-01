# Architecture

Spenda is a **client-server** application with a **layered, module-oriented**
codebase that follows **MVC** — with one deliberate twist: the *view* is the
route layer. There is no server-rendered UI; the "view" is the HTTP surface
(paths, verbs, status codes, response shape) that a separate frontend consumes.

## Client–server

```
┌────────────────────────┐        HTTPS + JSON        ┌────────────────────────┐
│  Client (frontend)     │  Authorization: Bearer ... │  Server (this repo)    │
│  - Supabase Auth SDK   │ ─────────────────────────► │  - Express 5 API       │
│  - owns access/refresh │ ◄───────────────────────── │  - Prisma 8 + Supabase │
│    tokens, sessions    │        JSON responses      │  - RLS-bound queries   │
└────────────────────────┘                            └────────────────────────┘
```

- The **client** owns authentication: signup, login, token refresh, logout are
  handled by Supabase Auth on the frontend. It stores the session and sends
  `Authorization: Bearer <access_token>` with every API request.
- The **server** never issues tokens. It verifies the Bearer token against
  Supabase's JWKS, binds the request to the user's role, and delegates row-level
  authorization to PostgreSQL **RLS** (`auth.uid()`).
- Communication is stateless JSON over HTTP; no server-side sessions.

## Layered architecture

Dependencies point **downward**. A layer only calls the layer beneath it.

```
Presentation        routes · controllers · middlewares
     │
Application         services (business rules, orchestration)
     │
Data access         models (Prisma 8 role-bound `db.orm.*` / `db.sql.*`)
     │
Infrastructure      config · db client · Supabase extension · migrations
```

| Layer | Location | Responsibility |
| --- | --- | --- |
| Presentation | `src/modules/<domain>/<domain>.route.js`, `<domain>.controller.js`, `src/middlewares/` | Parse the request, validate input, translate service results into HTTP responses. |
| Application | `src/modules/<domain>/<domain>.service.js` | Business logic and orchestration. No HTTP objects, no SQL. |
| Data access | `src/modules/<domain>/<domain>.model.js`, `src/prisma/` | Contract, migrations, and all queries. The only layer that touches `db`. |
| Infrastructure | `src/config/`, `src/prisma/db.js`, `src/app.js`, `src/server.js` | Configuration, process bootstrap, cross-cutting wiring. |

Cross-cutting concerns — error handling, rate limiting, auth — live in
`src/middlewares/` and are applied in `src/app.js`.

## MVC mapping

| MVC | Here | What it is |
| --- | --- | --- |
| **Model** | `<domain>.model.js` | Data shape and data access. Query construction lives here, against the Prisma 8 contract. |
| **Controller** | `<domain>.controller.js` | Receives the HTTP request, calls the service, shapes the response. |
| **View** | `<domain>.route.js` | The HTTP presentation: which paths/verbs exist, what status codes and payloads the client sees. |

`<domain>.service.js` is not part of classic MVC; it sits between Controller and
Model so business rules do not leak into either HTTP handling or queries.

A request flows:

```
route (view) → middleware → controller → service → model → Postgres (RLS)
                    │                                    │
                    └────────── error handler ◄──────────┘
```

## Module layout

Each domain is a folder under `src/modules/` with the same four files, so a
feature is added or removed without touching other domains:

```
src/modules/auth/
  auth.route.js       view  — endpoint definitions
  auth.controller.js  controller — request/response handling
  auth.service.js     application — auth rules
  auth.model.js       model — queries (none needed for token verification)
```

### Auth in this architecture

Auth is intentionally thin:

- `src/middlewares/auth-handler.js` (`requireAuth`) extracts the Bearer token,
  calls `db.asUser(token)` (JWT signature + expiry verification), and attaches
  `req.db` and `req.auth` for downstream layers.
- No auth *model* queries are required. Authorization is enforced by RLS in the
  database, not by application code.
- `public.user` / `public.profile` are app tables mirroring Supabase's
  `auth.users`; feature modules own their creation/sync strategy.

## Data and security

- **Single source of truth:** `src/prisma/contract.prisma`. Emitted to
  `contract.json` / `contract.d.ts`; migrations live in `src/prisma/migrations/`.
- **Prisma 8** — no `PrismaClient`. Queries go through the role-bound client in
  `src/prisma/db.js`: `db.asUser(jwt)`, `db.asAnon()`, `db.asServiceRole()`.
- **RLS everywhere:** every app table declares `@@rls` plus explicit
  per-operation policies. `service_role` bypasses RLS; `anon` is denied by
  default. Ownership is derived from `auth.uid()`.
- **Configuration** is environment-driven (`src/config/env.js`); secrets never
  live in code.

## Boundaries

- Controllers never import `db`; models never import Express.
- Services never build SQL or touch `req`/`res`.
- Routes do not contain logic beyond wiring middleware to controllers.
- Errors bubble to `src/middlewares/error-handler.js`; handlers should not
  invent response formats ad hoc.

See `TDD.md` for how changes are driven by tests.
