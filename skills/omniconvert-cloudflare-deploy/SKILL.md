---
name: omniconvert-cloudflare-deploy
description: Use when changing OmniConvert Cloudflare Workers deployment, wrangler.toml, Worker static assets config, Cloudflare env/secrets, D1/R2/KV bindings, or local deploy commands.
---

# OmniConvert Cloudflare Deploy

## Core workflow

1. Read `AGENTS.md`, `docs/AGENTS.md`, `.github/AGENTS.md`, and `docs/dependencies-and-deploy.md` before deployment edits.
2. Keep `wrangler.toml` configured for Vite `dist` output and SPA fallback.
3. Keep deployment secrets out of the repo.
4. Update `.env.example` and docs whenever required Cloudflare keys or bindings change.

## Current deploy contract

- Build command: `npm run build`.
- Deploy command: `npx wrangler deploy` or `npm run deploy`.
- Assets directory: `./dist`.
- SPA fallback: `not_found_handling = "single-page-application"`.
- Required GitHub secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`.

## Future bindings

- D1 binding should be named `DB` unless a specific reason exists.
- Add D1 database id as a placeholder only; never commit real IDs unless the user explicitly treats them as public config.
- Consider R2 for file storage and KV for lightweight settings/cache.

## Verification

- Run `npm run build` after config changes.
- Inspect `wrangler.toml` for valid TOML and correct `dist` path.
- Do not run live deploy commands unless the user explicitly asks and required credentials are available.
