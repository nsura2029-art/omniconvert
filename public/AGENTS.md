# Public Assets DOX

## Purpose
- Owns static files copied directly into the Vite build output.
- `robots.txt` and `sitemap.xml` live here for crawler discovery.

## Local Contracts
- Keep sitemap URLs aligned with indexable programmatic SEO pages.
- Do not add unknown or noindex routes to `sitemap.xml`.
- Keep `robots.txt` permissive for public converter pages and point it at the production sitemap URL.
- `seed-files/` contains tiny public test fixtures for browser-side upload/conversion QA. Keep them synthetic, non-sensitive, and small enough for source control.

## Verification
- Run `npm run build` after static crawl-file changes.
- Verify `/robots.txt` and `/sitemap.xml` are served locally before publishing SEO changes.
- Verify seed files return `200` locally before using them for upload-flow checks.

## Child DOX Index
- `seed-files/AGENTS.md` - public synthetic fixture contracts.
