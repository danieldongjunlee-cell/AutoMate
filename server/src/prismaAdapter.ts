import { PrismaPg } from '@prisma/adapter-pg';

/** AutoMate's tables live in a dedicated schema; used when the URL omits ?schema=. */
export const DEFAULT_SCHEMA = 'automate';

/**
 * Build the pg driver adapter Prisma 7 needs at runtime.
 *
 * The `?schema=` query param (e.g. `...pooler.supabase.com:6543/postgres?schema=automate`)
 * is a Prisma convention that node-postgres doesn't understand, so we parse it
 * out of the URL and pass it to the adapter explicitly. When it's absent — e.g.
 * the bare URL Supabase's "Connect" tab gives you — we default to `automate` so
 * the app, migrations, and RLS all agree on one schema. Other Prisma-only params
 * (`pgbouncer`, `connection_limit`) are harmless — pg ignores unknown params.
 */
export function makeAdapter(connectionString = process.env.DATABASE_URL): PrismaPg {
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set — cannot connect to Postgres.');
  }
  let schema = DEFAULT_SCHEMA;
  try {
    schema = new URL(connectionString).searchParams.get('schema') ?? DEFAULT_SCHEMA;
  } catch {
    // unparseable URL — fall back to the default schema
  }
  return new PrismaPg({ connectionString }, { schema });
}

