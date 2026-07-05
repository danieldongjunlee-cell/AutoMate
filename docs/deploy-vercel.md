# Deploying AutoMate (web) to Vercel

The repo is Vercel-ready: `vercel.json` sets the build
(`npx expo export --platform web --clear`), the output dir (`dist`), SPA
rewrites, and immutable caching for hashed bundles. You only import the repo
and set env vars.

**What deploys:** the Expo web app only. With no env vars it runs in full
**offline demo mode** (mock services — the whole flow works, perfect for a
shareable demo). The Express API, damage-AI service, and Supabase are wired
later via env vars (step 7).

## One-time setup

1. **Push the code** you want live (already done for the feature branch).
2. **vercel.com → Sign Up → Continue with GitHub** (use the account that owns
   `danieldongjunlee-cell/AutoMate`). Hobby plan is fine.
3. **Add New… → Project** → *Import Git Repository* → authorize the Vercel
   GitHub app for the `AutoMate` repo → **Import**.
4. **Configure Project** screen:
   - Framework Preset: **Other** (vercel.json overrides everything anyway).
   - Root Directory: leave as `./`.
   - Build/Output settings: leave as-is (picked up from `vercel.json`).
   - Environment Variables: none needed for the demo publish. Skip.
5. **Deploy.** First build takes a few minutes → you get a
   `https://<project>-<hash>.vercel.app` preview and a production URL
   `https://<project>.vercel.app`.

## Production branch

Vercel deploys **production** from the repo's default branch (`main`) and a
**preview** for every other branch/PR push. Two options:

- **Fastest:** Project → Settings → **Environments → Production →
  Branch Tracking** → set the branch to
  `claude/automate-react-native-build-v79e2r` → redeploy.
- **Cleaner:** merge the feature branch into `main` (PR or fast-forward);
  production then follows `main` automatically on every push.

## Verify after the first deploy

- Open the URL on desktop + phone; hard-refresh.
- Deep links (`/quotes`, any route) load the app, not a 404.
- Run the guest estimate flow end-to-end (mock mode: everything local).
- Vercel → Deployment → *Functions/Logs* should be empty (static site).

## Custom domain (optional)

Project → Settings → **Domains** → add `automate.yourdomain.com` → create the
CNAME record Vercel shows at your DNS provider → wait for the ✓.

## Wiring the real backend later

The API and AI service don't run on Vercel — host them elsewhere
(Railway / Render / Fly for `server/`; same or Modal for
`services/damage-ai/`), Supabase for Postgres. Then in Vercel → Settings →
**Environment Variables** (Production), add:

| Var | Value |
|---|---|
| `EXPO_PUBLIC_API_URL` | `https://<your-api-host>` |
| `EXPO_PUBLIC_DAMAGE_AI_URL` | `https://<your-ai-host>` (optional) |
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (public-safe; RLS on) |

Then **Deployments → ⋯ → Redeploy** (env vars are baked in at build time —
a redeploy is required; the `--clear` in the build command guarantees Metro
doesn't serve a stale bundle). Never add `DATABASE_URL`/`AUTH_SECRET` here —
those belong to the API host only.

## CLI alternative

```bash
npm i -g vercel
vercel login            # GitHub auth
vercel                  # from the repo root: link + preview deploy
vercel --prod           # promote to production
```
