---
name: omniconvert-auth-data
description: Use when changing OmniConvert authentication, demo users, localStorage persistence, referrals, user plans, admin data, database planning, or production auth/database migration notes.
---

# OmniConvert Auth and Data

## Core workflow

1. Read `AGENTS.md`, `src/AGENTS.md`, `src/components/AGENTS.md`, and `docs/dependencies-and-deploy.md` before editing auth/data behavior.
2. Identify whether the request is sandbox behavior or production integration.
3. Keep docs honest: current auth and data persistence are browser `localStorage` mocks.
4. Do not add secret values to client code or committed files.

## Current sandbox data

- `AuthModal.tsx` simulates sign-in, sign-up, Google/GitHub social login, and demo users.
- `App.tsx` persists active user, conversions, integrations, guest limits, system stats, referrals, and recently used tools with `omni_` localStorage keys.
- Admin, billing, dashboard, and referral surfaces read/write localStorage-backed data.

## Production migration guidance

- Add real auth only when requested; likely keys are `VITE_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` if Clerk is chosen.
- Prefer Cloudflare D1 for relational app data on Workers.
- Consider R2 for uploaded/source/output files and KV for small settings/cache.
- Move hardcoded demo users and privileged admin checks out of client code before production.

## Verification

- Run `npm run build` and `npm run lint` after auth/data type changes.
- Browser-check sign-in/sign-up, logout, dashboard access, referrals, and admin behavior when affected.
- Update `.env.example`, `docs/dependencies-and-deploy.md`, and relevant AGENTS files when production contracts change.
