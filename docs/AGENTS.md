# Docs DOX

## Purpose
- Owns durable project documentation for dependencies, deployment, operations, and production-readiness notes.

## Ownership
- `dependencies-and-deploy.md` documents current dependencies, secret names, Cloudflare deploy setup, and auth/database status.

## Local Contracts
- Docs must distinguish implemented behavior from recommended/future production work.
- Never include real secret values.
- Keep GitHub secret/variable names consistent with `.env.example`, `wrangler.toml`, and workflow files.

## Work Guidance
- Update docs whenever deployment, auth, database, or workflow contracts change.
- Prefer concise operational checklists over long narrative.

## Verification
- For docs-only changes, inspect rendered Markdown mentally and verify referenced file names/commands exist.

## Child DOX Index
- No child DOX files yet.
