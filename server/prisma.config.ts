import { defineConfig } from 'prisma/config';

// With a prisma.config.ts present, Prisma no longer auto-loads .env — do it here
// so DIRECT_URL is available to the migrate/CLI commands below.
try {
  process.loadEnvFile();
} catch {
  // no .env file — rely on the actual environment
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  // Migrations / introspection use the DIRECT (session-pooler, port 5432) URL —
  // DDL can't run over Supabase's transaction pooler. The ?schema=automate param
  // is honored by the migrate engine, so migrations land in the automate schema.
  datasource: {
    url: process.env.DIRECT_URL,
  },
  migrations: {
    seed: 'tsx prisma/seed.ts',
  },
});
