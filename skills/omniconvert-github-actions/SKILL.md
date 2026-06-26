---
name: omniconvert-github-actions
description: Use when changing OmniConvert GitHub Actions workflows, CI/CD deployment, repository secrets/variables, branch triggers, build/lint steps, or Wrangler action configuration.
---

# OmniConvert GitHub Actions

## Core workflow

1. Read `AGENTS.md`, `.github/AGENTS.md`, `.github/workflows/AGENTS.md`, and `docs/dependencies-and-deploy.md` before workflow edits.
2. Keep workflows explicit and minimal: checkout, setup Node, install, lint, build, deploy.
3. Use GitHub secrets/vars; never hardcode secret values.
4. Keep secret names aligned across workflow, `.env.example`, and docs.

## Current workflow contract

- Workflow: `.github/workflows/deploy-cloudflare-workers.yml`.
- Triggers: push to `develop`, push to `main`, manual `workflow_dispatch`.
- Node version: 22.
- Install: `npm ci`.
- Checks: `npm run lint`, `npm run build`.
- Deploy: `cloudflare/wrangler-action@v3` with `command: deploy`.
- Required secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`.
- Recommended variable: `APP_URL`.

## Implementation rules

- Add permissions only when needed.
- Use concurrency for deployment workflows to avoid overlapping deploys from the same ref.
- Keep optional future service secrets documented before use.

## Verification

- Validate referenced scripts exist in `package.json`.
- Run `npm run lint` and `npm run build` locally after workflow-relevant changes.
- Inspect YAML indentation carefully.
