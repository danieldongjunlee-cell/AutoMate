import { PrismaPg } from '@prisma/adapter-pg';

/**
 * Build the pg driver adapter Prisma 7 needs at runtime.
 *
 * The `?schema=` query param (e.g. `...pooler.supabase.com:6543/postgres?schema=automate`)
 * is a Prisma convention that node-postgres doesn't understand, so we parse it
 * out of the URL and pass it to the adapter explicitly. Other Prisma-only params
 * (`pgbouncer`, `connection_limit`) are harmless — pg ignores unknown params.
 */
export function makeAdapter(connectionString = process.env.DATABASE_URL): PrismaPg {
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set — cannot connect to Postgres.');
  }
  let schema: string | undefined;
  try {
    schema = new URL(connectionString).searchParams.get('schema') ?? undefined;
  } catch {
    schema = undefined;
  }
  return new PrismaPg({ connectionString }, schema ? { schema } : undefined);
}
