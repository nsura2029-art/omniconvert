# Data DOX

## Purpose
- Owns static product/tool catalog data used by the app.

## Ownership
- `tools.ts` defines available conversion tools and category metadata.
- `cadSeoPages.ts` defines indexable CAD keyword/page data mapped to CAD tools.

## Local Contracts
- Tool records must stay compatible with the `Tool` type in `src/types/index.ts`.
- Category names should stay aligned with app filters and labels.
- Credit costs and input/output strings are displayed directly in UI.

## Work Guidance
- Keep tool data deterministic and client-safe.
- When adding categories or fields, update shared types and all UI consumers.
- For programmatic SEO entries, every indexable page must map to a real tool, unique keyword bundle, canonical slug, visible copy, FAQs, limitations, and related links.

## Verification
- Run `npm run build` after schema or data shape changes.
- Verify every indexable SEO slug is present in `public/sitemap.xml` and linked from its category hub.

## Child DOX Index
- No child DOX files yet.
