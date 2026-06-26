# Source DOX

## Purpose
- Owns the React application source, global styles, static tool data, and TypeScript domain types.

## Ownership
- `App.tsx` owns top-level app state, routing between in-app pages, localStorage persistence, and shell composition.
- `main.tsx` owns React mounting only.
- `index.css` owns Tailwind import, theme tokens, global glass utilities, light/dark palette behavior, and generated utility shims.
- `components/`, `data/`, and `types/` have child DOX files for local rules.

## Local Contracts
- Current app state is client-side and mostly persisted with `localStorage` keys prefixed by `omni_`.
- Theme mode is class-driven with `.dark` on `document.documentElement`; keep Tailwind v4 `@custom-variant dark` intact.
- The Format OS light palette is the current design-system direction.
- Do not add real secrets or privileged server calls directly to client components.

## Work Guidance
- Preserve existing page names and prop contracts unless updating all call sites.
- Prefer reusing existing shared CSS utilities (`glass`, `glass-card`, `glass-input`, `btn-primary`) before adding new visual primitives.
- Keep text compact and operational; this is a product app, not a marketing landing page.

## Verification
- Run `npm run build` after source changes.
- Run `npm run lint` after TypeScript or prop/type changes.

## Child DOX Index
- `components/AGENTS.md` - React component behavior and UI contracts.
- `data/AGENTS.md` - tool catalog data contracts.
- `types/AGENTS.md` - shared TypeScript type contracts.
