# OmniConvert DOX

## Purpose
- OmniConvert is a Vite + React 19 file-conversion SaaS prototype.
- The app currently runs as a client-side sandbox with simulated auth, conversions, billing, referrals, dashboards, cloud pickers, and admin views.
- Deployment target is Cloudflare Workers Static Assets using Vite `dist` output.

## Ownership
- Root owns project-wide scripts, dependency manifests, Vite/TypeScript config, Cloudflare config, env templates, and this DOX index.
- Do not commit real secrets. Keep `.env.example` as placeholders only.
- `dist/` and `node_modules/` are generated and not part of source contracts.

## Local Contracts
- Source code lives under `src/`.
- Design explorations live under `design-mockups/` and are standalone HTML references, not production app routes.
- Deployment and dependency docs live under `docs/`.
- Project-local Codex skills live under `skills/`.
- GitHub Actions workflows live under `.github/workflows/`.
- Production auth and database are not implemented yet; current auth/data persistence is browser `localStorage`.

## Mandatory Loading Workflow
- Before any code change, read this root `AGENTS.md`, the nearest child `AGENTS.md` files for every area being changed, and any relevant project-local `skills/*/SKILL.md` file.
- Treat AGENTS files as the local contract for ownership, behavior, verification, and documentation expectations.
- Use project-local skills when the task matches their scope, such as React/Vite UI, Tailwind theme, conversion workflow, auth/data, Cloudflare deploy, or GitHub Actions.
- Do not start implementation until the relevant AGENTS and SKILL files have been loaded and reconciled with the user request.

## Contract Updates
- Whenever code changes alter behavior, ownership boundaries, deployment requirements, env keys, test expectations, or workflow rules, update the nearest child `AGENTS.md` in the same change.
- If the changed area has a matching project skill, update that skill when its instructions would otherwise become stale.
- If a new durable folder or subsystem is added, add an `AGENTS.md` for it and link it from the nearest parent Child DOX Index.
- If auth, database, deployment, secrets, or CI behavior changes, update `.env.example`, `docs/dependencies-and-deploy.md`, and the relevant AGENTS/SKILL files.

## Work Guidance
- Prefer small scoped edits that preserve the current prototype behavior unless the user asks for a broader rebuild.
- Keep UI changes consistent with the current light Format OS palette and existing Tailwind/glass utility system.
- When adding production services, document required env keys and update `.env.example`, `docs/dependencies-and-deploy.md`, and affected DOX files.
- For Cloudflare deployment, keep Wrangler config aligned with Workers Static Assets and SPA fallback.

## Verification and Tests
- Run `npm run build` for frontend, styling, deployment config, and Vite-related changes.
- Run `npm run lint` for TypeScript, prop, data-shape, and component behavior changes.
- Use browser verification for user-facing interactions, layout changes, theme changes, upload flows, auth modals, dashboard tabs, billing flows, and navigation changes.
- When changing deployment or CI, validate referenced scripts and secret names, and inspect workflow/config syntax.
- When changing programmatic SEO pages, verify keyword bundles, unique metadata, canonical URLs, static page content, structured data, sitemap coverage, robots access, internal links, and unknown-slug 404/noindex behavior.
- When adding testable business logic, prefer adding or updating focused tests if a test framework exists; if no test framework exists, document the manual verification performed and avoid introducing an unused test stack without explicit direction.
- If a relevant check cannot be run, state why and include the remaining risk in the final response.

## Child DOX Index
- `.github/AGENTS.md` - GitHub workflow and automation contracts.
- `design-mockups/AGENTS.md` - Standalone design exploration contracts.
- `docs/AGENTS.md` - durable project documentation contracts.
- `skills/AGENTS.md` - project-local Codex skill contracts.
- `src/AGENTS.md` - application source contracts.
