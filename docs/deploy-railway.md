# Deploying the backend to Railway

Two Railway services from this one repo give you the two remaining Vercel
env values:

| Railway service | Repo root dir | Yields |
|---|---|---|
| `automate-api` | `server/` | `EXPO_PUBLIC_API_URL` |
| `automate-damage-ai` | `services/damage-ai/` | `EXPO_PUBLIC_DAMAGE_AI_URL` |

Both are push-to-deploy once linked: Railway rebuilds on every push to the
tracked branch.

## A. Express API (`server/`)

1. [railway.com](https://railway.com) → **Login with GitHub** (the account
   with access to `danieldongjunlee-cell/AutoMate`).
2. **New Project → Deploy from GitHub repo** → pick `AutoMate` (authorize the
   Railway GitHub app for it if asked).
3. The service builds the repo root by default — fix that first:
   **Service → Settings → Source**:
   - **Root Directory:** `server`
   - **Branch:** `claude/automate-react-native-build-v79e2r` (or `main` once
     merged).
   Railway's Nixpacks auto-detects Node and runs `npm ci` → `npm run build`
   (which runs `prisma generate && tsc`) → `npm start` (`node
   dist/src/index.js`). No custom build/start commands needed.
4. **Variables tab** — add:
   | Variable | Value / where it comes from |
   |---|---|
   | `DATABASE_URL` | Supabase → Project Settings → **Database → Connection string → Transaction pooler** (port **6543**), password filled in |
   | `DIRECT_URL` | same page, **Direct connection** (port **5432**) — used by migrations |
   | `AUTH_SECRET` | a fresh random secret: `openssl rand -base64 32` |
   | `DAMAGE_AI_URL` | fill in after Part B (the AI service's URL); omit until then |
   | `PUBLIC_ORIGIN` | the service's public URL (add after step 6) — used to build absolute upload URLs |
5. *(Recommended)* **Settings → Deploy → Pre-deploy Command:**
   `npx prisma migrate deploy` — keeps the Supabase schema current on every
   deploy (no-op when already migrated, like now).
6. **Settings → Networking → Generate Domain** → Railway assigns
   `https://automate-api-production-xxxx.up.railway.app`.
   **That URL is your `EXPO_PUBLIC_API_URL`.** Go back and set
   `PUBLIC_ORIGIN` to it (step 4) — the service redeploys.
7. **Verify** (should be a 401, i.e. reached auth logic + DB):
   ```bash
   curl -s -X POST https://<api-url>/auth/login \
     -H 'content-type: application/json' -d '{"email":"x@y.z","password":"no"}'
   # → {"error":"Invalid email or password"}
   ```
   Then a real end-to-end: signup → verify-otp (code `123456`) → GET /points
   with the returned token.

## B. Damage-AI service (`services/damage-ai/`)

1. In the **same Railway project** → **+ New → GitHub Repo** → pick
   `AutoMate` again (a second service from the same repo).
2. **Settings → Source → Root Directory:** `services/damage-ai`, same branch.
   Railway finds the `Dockerfile` there and builds it — the image defaults to
   `MODEL_MODE=mock` and the CMD honors Railway's injected `$PORT`. **No
   variables needed.**
3. **Settings → Networking → Generate Domain** →
   `https://automate-damage-ai-production-xxxx.up.railway.app`.
   **That's your `EXPO_PUBLIC_DAMAGE_AI_URL.`**
4. **Verify:**
   ```bash
   curl -s https://<ai-url>/health
   # → {"ok":true,"service":"damage-ai","model_mode":"mock",...}
   ```
5. Back on the **API service → Variables**, set `DAMAGE_AI_URL` to this URL
   so the server proxies estimates to it. (Optional optimization: Railway
   private networking lets the API reach it via
   `http://<service-name>.railway.internal:<port>` without leaving the
   project.)

## C. Flip Vercel to the live backend

Vercel → Project → **Settings → Environment Variables** (Production):

```
EXPO_PUBLIC_API_URL          = https://<api-url>
EXPO_PUBLIC_DAMAGE_AI_URL    = https://<ai-url>          (optional)
EXPO_PUBLIC_SUPABASE_URL     = https://<project>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY= <anon key>
```

Then **Deployments → ⋯ → Redeploy** (env is baked in at build time; the
`--clear` in the build command prevents a stale bundle). Run the guest
estimate → signup flow on the production URL and confirm rows land in
Supabase (`damage_requests`, `points_ledger`, `vehicles`).

## Caveats at this stage

- **Uploads are ephemeral** on Railway's filesystem (`UPLOAD_DIR`) — fine for
  the pilot; move to Supabase Storage/S3 before real launch.
- **Live AI mode** needs trained weights + `Dockerfile.gpu` on a GPU host
  (or Modal via `services/damage-ai/deploy/modal_app.py`); mock mode is the
  disclosed "estimate mode" until then.
- Costs: Railway Hobby ($5/mo incl. usage) comfortably runs both services at
  pilot traffic; watch the usage page the first week.
