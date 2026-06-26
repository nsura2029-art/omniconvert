# Data DOX

## Purpose
- Owns static product/tool catalog data used by the app.

## Ownership
- `tools.ts` defines available conversion tools and category metadata.

## Local Contracts
- Tool records must stay compatible with the `Tool` type in `src/types/index.ts`.
- Category names should stay aligned with app filters and labels.
- Credit costs and input/output strings are displayed directly in UI.

## Work Guidance
- Keep tool data deterministic and client-safe.
- When adding categories or fields, update shared types and all UI consumers.

## Verification
- Run `npm run build` after schema or data shape changes.

## Child DOX Index
- No child DOX files yet.
