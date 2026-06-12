/** Central env/config for the AutoMate server. */

// Load server/.env if present (real env vars take precedence).
try {
  process.loadEnvFile();
} catch {
  // no .env file — rely on the actual environment
}

export const PORT = Number(process.env.PORT ?? 4000);

/** JWT signing secret — set AUTH_SECRET in production. */
export const AUTH_SECRET = process.env.AUTH_SECRET ?? 'automate-dev-secret-change-me';

/** JWT lifetime. */
export const TOKEN_TTL = '30d';

/** Demo OTP accepted by /auth/verify-otp (no SMS provider yet). */
export const DEMO_OTP = '123456';

/** Points valuation (approved decision): 1 point = $0.01. */
export const POINT_VALUE_USD = 0.01;

/** Where the local StorageProvider writes files. */
export const UPLOAD_DIR = process.env.UPLOAD_DIR ?? 'uploads';

/** Public origin used to build absolute upload URLs. */
export const PUBLIC_ORIGIN = process.env.PUBLIC_ORIGIN ?? `http://localhost:${PORT}`;
