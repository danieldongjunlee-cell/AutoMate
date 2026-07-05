import { defineConfig } from 'prisma/config';

// With a prisma.config.ts present, Prisma no longer auto-loads .env — do it here
// so DIRECT_URL is available to the migrate/CLI commands below.
try {
  process.loadEnvFile();
} catch {
  // no .env file — rely on the actual environment
}

/**
 * Ensure the migrate URL targets the `automate` schema. Supabase's "Connect" tab
 * hands you a bare URL with no `?schema=`; without this, migrations would land in
 * `public` and diverge from the runtime adapter + RLS script. String-appends so
 * special characters in the password are never re-encoded.
 */
function withSchema(url: string | undefined, schema = 'automate'): string | undefined {
  if (!url || /[?&]schema=/.test(url)) return url;
  return `${url}${url.includes('?') ? '&' : '?'}schema=${schema}`;
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  // Migrations / introspection use the DIRECT (session-pooler, port 5432) URL —
  // DDL can't run over Supabase's transaction pooler.
  datasource: {
    url: withSchema(process.env.DIRECT_URL),
  },
  migrations: {
    seed: 'tsx prisma/seed.ts',
  },
});
