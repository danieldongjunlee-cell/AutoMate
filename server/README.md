# AutoMate server (phase 2 — DB + auth)

Node + Express + Prisma + PostgreSQL backend for the AutoMate app. Mirrors the
app's mock services 1:1 so the Expo client can switch between mock and API
mode with a single env var.

## Run locally

```bash
# 1. Start PostgreSQL (postgres:16, repo-root docker-compose.yml)
docker compose up -d db

# 2. Install + configure
cd server
npm install
cp .env.example .env

# 3. Create the schema
npx prisma migrate dev --name init

# 4. Seed demo data (demo@automate.app / Demo1234!, OTP 123456)
npm run seed

# 5. Start the API → http://localhost:4000
npm run dev
```

Point the app at it from the repo root:

```bash
EXPO_PUBLIC_API_URL=http://localhost:4000 npx expo start
```

No `EXPO_PUBLIC_API_URL` → the app stays in mock mode (no server needed).

## Demo credentials

| What        | Value               |
| ----------- | ------------------- |
| Email       | `demo@automate.app` |
| Password    | `Demo1234!`         |
| OTP         | `123456`            |

## Endpoints

- `POST /auth/signup` · `POST /auth/login` (bcrypt) · `POST /auth/verify-otp`
  (demo code `123456` → JWT) · `POST /auth/resend-otp` · `POST /auth/social`
  (demo shortcut: signs in as the seeded user)
- `GET /quotes/request` · `GET /quotes` · `POST /quotes/submit` ·
  `POST /quotes/:id/accept`
- `GET /bookings` · `POST /bookings` (repair booking) · `POST /bookings/pay`
  (maintenance checkout + payment record)
- `GET /maintenance/vehicle` · `GET /maintenance/upcoming` ·
  `GET /maintenance/history` · `POST /maintenance/history` (save scan/manual record)
- `GET /notifications` · `POST /notifications/read-all` · `POST /notifications/:id/read`
- `GET /community/channels` · `GET /community/feed` · `GET /community/posts/:id` ·
  `POST /community/posts`
- `GET /profile` · `PUT /profile` · vehicles CRUD `(/profile/vehicles…)` ·
  insurance policies CRUD `(/profile/policies…)`
- `GET /points` · `POST /points/earn` · `POST /points/redeem`
  (1 point = $0.01, `POINT_VALUE_USD` in `src/config.ts`)
- `GET /pro` · `POST /pro/purchase` ($10 lifetime)
- `POST /uploads` (multipart `files`) → `{ ref, url }`; served from `GET /uploads/*`

All non-auth routes require `Authorization: Bearer <jwt>` (`AUTH_SECRET` env).

## Storage

Uploads go through the `StorageProvider` interface
(`src/storage/StorageProvider.ts`). The active implementation is local disk
(`server/uploads/`); swap in an S3-compatible provider by implementing the
interface and changing one line in `src/storage/index.ts`.

## Notes

- `upcoming services` and `community channels` are served from
  `src/staticData.ts` constants (no tables yet — later phases own real
  scheduling/membership).
- Points valuation is the approved decision: **1 point = $0.01**.
- The seed is idempotent: it deletes and recreates the demo user (cascades)
  plus the authorless wireframe posts.
