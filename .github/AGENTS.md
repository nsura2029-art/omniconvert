# GitHub DOX

## Purpose
- Owns repository automation and CI/CD configuration.

## Ownership
- `workflows/` owns GitHub Actions workflow definitions.

## Local Contracts
- Cloudflare deploy workflows must use GitHub secrets for API tokens and account IDs.
- Do not hardcode Cloudflare credentials, Gemini keys, auth secrets, or database IDs in workflows.
- Keep workflow secret names aligned with `.env.example` and `docs/dependencies-and-deploy.md`.

## Work Guidance
- Prefer explicit build, type-check, and deploy steps.
- Keep deployment branch triggers intentional; current deploy branches are `develop` and `main`.

## Verification
- Validate YAML structure by inspection and run local `npm run build` / `npm run lint` for app steps.

## Child DOX Index
- `workflows/AGENTS.md` - individual GitHub Actions workflow contracts.
