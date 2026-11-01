# Test-Driven Development

Spenda is developed **test-first**. A test that describes the desired behaviour
is written and made to fail before any production code exists. Implementation is
then written only until the test passes, and the code is refactored with the test
held green.

## The loop

1. **Red** — write a failing test for the next small behaviour.
2. **Green** — write the minimum production code that passes.
3. **Refactor** — improve names, boundaries, duplication; keep the test green.

Rules:

- One behaviour per test. The test name states the behaviour, not the method.
- Tests assert observable outcomes (HTTP status + body, returned values, rows
  written), never private internals.
- Never change a test to make failing code pass; change the code.
- Bug fixes start with a failing regression test that reproduces the bug.

## Testing by layer

Because the codebase is layered (`route → controller → service → model`), each
layer is tested at its own level.

| Layer | Test type | What it verifies |
| --- | --- | --- |
| Model | Integration | Queries against a real Postgres/Supabase test project, including RLS behaviour per role. |
| Service | Unit | Business rules with the model layer stubbed. Fast, no network. |
| Controller | Unit or integration | Request in → status/body out, with the service stubbed. |
| Route + middleware | Integration | End-to-end through Express: auth, validation, error mapping, status codes. |
| Contract | Static | `prisma contract emit` succeeds and migrations apply cleanly. |

Test pyramid: many unit tests for services and controllers, fewer integration
tests for models and HTTP routes, a small number of full-stack flows.

## Test locations and naming

Each module keeps its tests in a `test/` folder beside the module files, so a
feature and its tests move together:

```
src/modules/auth/
  auth.route.js
  auth.controller.js
  auth.service.js
  test/
    auth.route.test.js
    auth.controller.test.js
    auth.service.test.js
```

Tests for cross-cutting middleware live in the test folder of the module that
owns the behaviour they protect (for example `auth/test/auth-handler.test.js`).

- File name: `<unit>.test.js`.
- Describe blocks mirror the module; test names read as sentences:
  `it('returns 401 when the Authorization header is missing')`.
- Shared fixtures live in a `test/` helper, never duplicated inline.

## Tooling

Node's built-in test runner is the baseline — no extra dependency:

```json
{
  "scripts": {
    "test": "node --test",
    "test:watch": "node --test --watch"
  }
}
```

Integration tests that drive Express may use `supertest`; that is the only
addition expected. If a test needs a live database, point it at a dedicated
Supabase test project via environment variables — never at production.

## Environment

- Unit tests must run with no network and no database.
- Integration tests require `DIRECT_URL` and `SUPABASE_URL`/JWKS pointing at the
  **test** project, with the same contract and RLS policies applied as production.
- Tests must be deterministic: no reliance on wall-clock time, auto-increment
  ids, or row order without an explicit `orderBy`. Seed and clean up per test.

## What to test first

Priority order for new work:

1. **Auth** — missing header → 401; malformed token → 401; expired token → 401;
   valid token → 200 with claims.
2. **Ownership / RLS** — a user cannot read or mutate another user's rows;
   failures surface as `404`, not `403`.
3. **Validation** — bad bodies return `400` with a useful message.
4. **Business rules** — one test per rule, including edge cases.
5. **Error handling** — unexpected errors return the standard shape and do not
   leak stack traces outside development.

## Definition of done

A change is done when:

- New behaviour has failing-then-passing tests.
- `npm test` passes locally.
- `prisma contract emit` is clean if the contract changed.
- Migrations apply against the test project and RLS is verified for the affected
  tables.

## Anti-patterns

- Writing tests after the implementation and calling it TDD.
- Testing implementation details (private functions, call order) instead of
  behaviour.
- Mocking the layer under test; mock only its collaborators.
- Order-dependent tests or shared mutable state between tests.
- Skipping the failing step — a test that has never failed proves nothing.
