# Dependencies, Secrets, and Deployment

## Current project dependencies

Runtime UI:
- React 19 and React DOM
- Vite 6
- Tailwind CSS 4 via `@tailwindcss/vite`
- lucide-react icons
- motion animations
- Recharts charts
- canvas-confetti completion effects

Server/AI packages present but not fully wired into production flows yet:
- `@google/genai` for Gemini API calls
- `express`, `dotenv`, and `tsx` for possible server/local scripts

## Authentication status

Current implementation: sandbox authentication in `src/components/AuthModal.tsx` using browser `localStorage`.

No production auth dependency is installed yet. There is no Clerk, Auth.js, Supabase Auth, Firebase Auth, or custom backend session dependency currently wired.

Recommended production path:
- Add Clerk or Auth.js when real accounts are needed.
- Move hardcoded demo users out of the client.
- Store users/sessions server-side instead of `localStorage`.

Likely auth keys if Clerk is chosen:
- `VITE_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`

## Database status

Current implementation: browser `localStorage` for users, conversions, integrations, referrals, admin data, AND the full gamification store (credits / upvotes / referrals / shares / daily_login_streak).

Gamification keys (mirrors the D1 brief schema 1:1 so Phase-2 swap is a one-file change):
- `omni_gam_user`, `omni_gam_tx`, `omni_gam_upvotes`, `omni_gam_referrals`, `omni_gam_shares`, `omni_gam_limits`, `omni_gam_pending_ref`, `omni_gam_banned_users`, `omni_gam_flags`, `omni_session`.

No real database dependency or migration tool is installed yet. There is no Prisma, Drizzle, Supabase client, Neon client, or Cloudflare D1 client code currently wired.

Recommended Cloudflare-native path:
- Cloudflare D1 for relational app data (users, credit_transactions, upvotes, referrals, shares, daily_limits). The gamification data layer in `src/data/gamification.ts` is the migration boundary — function names + types stay the same, only the storage primitives change.
- Optional Cloudflare R2 for uploaded/source/output files.
- Optional Cloudflare KV for lightweight cache/settings.
- Optional Cloudflare Durable Objects for real-time WebSocket push of credit / upvote / share events to the admin Gamification dashboard.

Likely database keys/bindings:
- `CLOUDFLARE_D1_DATABASE_ID`
- `DB` binding in `wrangler.toml`
- `OMNI_GAMIFICATION` Durable Object binding (Phase 2)
- `DATABASE_URL` only if a non-D1 database is introduced.

## Cloudflare Workers deployment

This repo now includes `wrangler.toml` configured for Cloudflare Workers Static Assets. Vite builds to `dist`, and Wrangler deploys that directory as a Worker-backed SPA.

Required GitHub repository secrets:
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

Recommended GitHub repository variables:
- `APP_URL`

Optional GitHub repository secrets:
- `GEMINI_API_KEY`
- `CLERK_SECRET_KEY`
- `CLOUDFLARE_D1_DATABASE_ID`

Optional GitHub repository variables:
- `VITE_CLERK_PUBLISHABLE_KEY`

## GitHub Actions workflow

Workflow file:
- `.github/workflows/deploy-cloudflare-workers.yml`

Triggers:
- Push to `develop`
- Push to `main`
- Manual `workflow_dispatch`

Steps:
- Checkout
- Setup Node 22
- `npm ci`
- `npm run lint`
- `npm run build`
- `cloudflare/wrangler-action@v3` with `wrangler deploy`

## Local deploy commands

Build locally:

```bash
npm run build
```

Deploy locally after authenticating Wrangler:

```bash
npx wrangler deploy
```

Cloudflare references used:
- Workers Static Assets: https://developers.cloudflare.com/workers/static-assets/
- GitHub Actions with Wrangler: https://developers.cloudflare.com/workers/ci-cd/external-cicd/github-actions/
