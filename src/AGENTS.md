# Source DOX

## Purpose
- Owns the React application source, global styles, static tool data, and TypeScript domain types.

## Ownership
- `App.tsx` owns top-level app state, routing between in-app pages, localStorage persistence, and shell composition.
- `main.tsx` owns React mounting only.
- `index.css` owns Tailwind import, theme tokens, global glass utilities, light/dark palette behavior, and generated utility shims.
- `components/`, `data/`, `pages/`, and `types/` have child DOX files for local rules.
- `pages/Pricing.tsx` owns the 3-tier pricing surface (anonymous / registered / paid).
- `pages/admin/` owns the admin panel shell + sections (Dashboard, Analytics, Users, Conversions, Gamification, Settings). See per-section files there for contracts.
- `pages/stubRouter.tsx` provides a `Link` placeholder so routes compile without `react-router-dom`. Swap for the real `Link`/`useParams`/`Navigate` when the dep is added.

## Local Contracts
- Current app state is client-side and mostly persisted with `localStorage` keys prefixed by `omni_`.
- Theme mode is class-driven with `.dark` on `document.documentElement`; keep Tailwind v4 `@custom-variant dark` intact.
- The Format OS light palette is the current design-system direction.
- Do not add real secrets or privileged server calls directly to client components.
- Gamification state lives in `src/data/gamification.ts` (credits / upvotes / referrals / shares) with cross-tab sync via `BroadcastChannel('omniconvert-gamification')`. Schema shapes mirror D1 brief 1:1 so Phase-2 Worker + D1 swap is a one-file change.
- Admin sections poll `localStorage` (typically `omni_users`, `omni_conversions`, `omni_gam_*`) every 3–5 seconds + listen to the gamification BroadcastChannel. Real counts blend into KPI tiles; seeded analytics fill gaps.

## Work Guidance
- Preserve existing page names and prop contracts unless updating all call sites.
- Prefer reusing existing shared CSS utilities (`glass`, `glass-card`, `glass-input`, `btn-primary`) before adding new visual primitives.
- Keep text compact and operational; this is a product app, not a marketing landing page.
- Use `motion/react` (Framer Motion) for entrance/exit/spring animations — already in package.json. Don't introduce another animation lib.
- The floating gamification pill (`src/components/gamification/FloatingCreditPill.tsx`) is mounted once at root and must stay visible on every page except while the modal itself is open.

## Verification
- Run `npm run build` after source changes.
- Run `npm run lint` after TypeScript or prop/type changes.

## Child DOX Index
- `components/AGENTS.md` - React component behavior and UI contracts (including gamification + admin + analytics contracts).
- `data/AGENTS.md` - tool catalog + gamification store data contracts.
- `pages/AGENTS.md` - top-level pages mounted from `App.tsx` (Pricing, legacy Dashboard, admin shell).
- `types/AGENTS.md` - shared TypeScript type contracts.
