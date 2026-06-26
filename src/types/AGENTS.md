# Types DOX

## Purpose
- Owns shared TypeScript interfaces and domain types.

## Ownership
- `index.ts` defines shared app types such as users, conversions, cloud integrations, and plan names.

## Local Contracts
- Types must reflect the current client-side data shape used by localStorage and component props.
- Changes to persisted type fields may require migration or defensive reads in components.

## Work Guidance
- Keep types narrow and explicit.
- Update components and docs when adding production auth/database fields.

## Verification
- Run `npm run lint` and `npm run build` after type changes.

## Child DOX Index
- No child DOX files yet.
