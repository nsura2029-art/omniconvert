# Workflows DOX

## Purpose
- Owns GitHub Actions workflow files.

## Ownership
- `deploy-cloudflare-workers.yml` builds the app and deploys it with Wrangler to Cloudflare Workers.

## Local Contracts
- Required repository secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`.
- Recommended repository variable: `APP_URL`.
- Optional future secrets/vars must be documented before use.

## Work Guidance
- Use `actions/checkout`, `actions/setup-node`, `npm ci`, `npm run lint`, `npm run build`, then `cloudflare/wrangler-action`.
- Do not put secret values in workflow files.

## Verification
- Confirm referenced scripts exist in `package.json`.
- Confirm Cloudflare deployment config exists in `wrangler.toml`.

## Child DOX Index
- No child DOX files yet.
