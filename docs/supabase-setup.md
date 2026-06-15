# Connecting AutoMate to Supabase

This is a **standalone-first** runbook: stand up the consumer app against a
throwaway Supabase project, test the real auth + persistence path, then later
point the same migrations at your dealer-portal Supabase project. Nothing here
is required to demo the app — without `EXPO_PUBLIC_API_URL` the frontend runs
entirely on mocks.

All consumer tables live in a dedicated **`automate` Postgres schema** so they
never collide with the dealer portal's own tables.

---

## Why standalone first

- The migrations only ever create `automate.*`, so the exact same files apply to
  a throwaway project today and to the portal project later — switching is a
  connection-string change, not a rewrite.
- No risk of touching portal data, because a standalone project has none.
- The only genuinely new work at portal-integration time is the **shared tables**
  (dealers / quotes / bookings) — deciding read/write ownership. Until then the
  app seeds its own demo dealers/quotes.

---

## 1. Create a Supabase project

Dashboard → New project. Note the project ref, region, and database password.

## 2. Configure connections

Copy `server/.env.example` → `server/.env` and fill in the two Supabase URLs
(Dashboard → Project Settings → Database → Connection string):

- **`DATABASE_URL`** = the **Transaction pooler** (port `6543`), with
  `?schema=automate&pgbouncer=true&connection_limit=1` — used by the running app.
- **`DIRECT_URL`** = the **direct** connection (port `5432`), with
  `?schema=automate` — used by `prisma migrate` only (PgBouncer can't run DDL).

> The `automate` schema is created automatically by the first migration.

## 3. Run migrations + RLS + seed

```bash
cd server
npx prisma migrate deploy          # creates automate.* tables (uses DIRECT_URL)
psql "$DIRECT_URL" -f prisma/sql/automate_rls.sql   # or paste it in the SQL editor
npm run seed                       # demo user + Accord + State Farm + quotes/bookings
```

Demo login after seeding: `demo@automate.app` / `Demo1234!` (OTP `123456`).

## 4. Keep the schema private (security)

Dashboard → Project Settings → API → **Exposed schemas**: leave it as
`public, graphql_public`. **Do not add `automate`.** Combined with the RLS in
`prisma/sql/automate_rls.sql`, this keeps consumer data unreachable from the
public Data API. See that file's header for the full security model (the
Express backend uses a BYPASSRLS connection and scopes every query by userId).

## 5. Point the app at the backend

```bash
# server/
npm run dev                        # Express API on :4000

# repo root (Expo) — flip the frontend off mocks onto the real API:
EXPO_PUBLIC_API_URL=http://localhost:4000 npm start
```

With `EXPO_PUBLIC_API_URL` set, `src/services/index.ts` swaps every mock service
for its `./api` twin. Unset it to go back to mocks.

---

## Later: integrating with the dealer-portal project

1. Point `DATABASE_URL` / `DIRECT_URL` at the **portal** project (still
   `?schema=automate`). Run `prisma migrate deploy` again — it only adds
   `automate.*`, touching nothing the portal owns. Re-run the RLS script.
2. **Auth decision (decide before you have real users):** the app keeps its own
   pool in `automate.users`, separate from any dealer/portal accounts. That ports
   trivially. Merging consumers + dealers into one auth pool is the one change
   that's awkward later.
3. **Shared tables (dealers / quotes / bookings):** in standalone these are
   seeded; in the portal they become the portal's real tables. Switch the
   consumer app's dealer/quote reads to the portal tables behind the service
   layer, and agree read/write ownership first. Per the project rules, confirm
   before writing to any portal-shared table.
4. To read the portal's `public` tables AND write `automate` from Prisma, enable
   the `multiSchema` preview feature and add `@@schema(...)` annotations. Not
   needed for standalone.
