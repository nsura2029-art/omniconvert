# Pages DOX

## Purpose
- Owns top-level pages mounted directly from `App.tsx` based on `currentPage`.

## Ownership
- `Dashboard.tsx` - legacy user-facing dashboard (stats + cloud upload + referral panel). Mounted at `currentPage === 'dashboard'`.
- `Pricing.tsx` - 3-tier pricing surface (anonymous / registered / paid) with cost calculator, earn-credits table, FAQ. Mounted at `currentPage === 'pricing'`.
- `stubRouter.tsx` - `Link` placeholder so route helpers compile without `react-router-dom`. Replace with real `Link` / `useParams` / `Navigate` when the dep is added.
- `admin/` - admin panel shell + per-section files (see `admin/AGENTS.md`).

## Local Contracts
- Pages consume `currentUser` + `currentPage` from `App.tsx`; they do NOT own auth or routing state themselves.
- The admin panel is the only place admin-only UI lives. Non-admin users always see a "Admin only" sign-in prompt instead of the panel.
- New top-level pages go here as siblings. Don't put admin-only content under `pages/admin/` if it's also accessible to non-admins.

## Work Guidance
- Keep `currentPage` value list in `App.tsx` in sync with this folder's pages.
- Pages that need admin gating must add the `currentUser?.email === 'admin@omniconvert.com'` check in `App.tsx` (same pattern as `admin` + `analytics:catId`).

## Verification
- `npm run build` for any page add/change.
- Manually: navigate to the page via the navbar / NavLink and confirm rendering.