# Docs DOX

## Purpose
- Owns durable project documentation for dependencies, deployment, operations, and production-readiness notes.

## Ownership
- `dependencies-and-deploy.md` documents current dependencies, secret names, Cloudflare deploy setup, and auth/database status.
- `cad-seo-plan.md` documents CAD conversion keyword priorities, programmatic SEO page requirements, indexable page checks, and implementation todos.

## Local Contracts
- Docs must distinguish implemented behavior from recommended/future production work.
- Never include real secret values.
- Keep GitHub secret/variable names consistent with `.env.example`, `wrangler.toml`, and workflow files.

## Work Guidance
- Update docs whenever deployment, auth, database, or workflow contracts change.
- Prefer concise operational checklists over long narrative.
- CAD SEO docs must track keyword bundle coverage, route coverage, sitemap/robots requirements, metadata requirements, structured-data requirements, and noindex/404 expectations.

## Verification
- For docs-only changes, inspect rendered Markdown mentally and verify referenced file names/commands exist.

## Child DOX Index
- `fonts/AGENTS.md` - Fonts converter planning, imported source prompts, and future implementation notes.
