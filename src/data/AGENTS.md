# Data DOX

## Purpose
- Owns static product/tool catalog data AND runtime user-data stores used by the app.

## Ownership
- `tools.ts` defines available conversion tools and category metadata.
- `cadSeoPages.ts` defines indexable CAD keyword/page data mapped to CAD tools.
- `gamification.ts` is the **runtime data layer** for credits / upvotes / referrals / shares. Schema mirrors the D1 brief 1:1 so Phase-2 Worker + D1 swap is a one-file change. Exports the public API used by `src/components/gamification/*` and admin sections (TIER_TABLE, award/spend/refund/getBalance/getHistory, claimDailyLogin, computeConversionCost, admin ops, getLeaderboard, onGamificationEvent, tier helpers).
- `dashboardAnalytics.ts` is the **deterministic seeded per-category analytics builder** (KPI summaries, popular pairs, matrix, processing breakdown, timeline, advanced stats). Used by the admin Analytics section.
- `localConversions.ts` is the **real-signal layer** that reads/writes `omni_conversions` for the admin Analytics + Conversions sections.

## Local Contracts
- Tool records must stay compatible with the `Tool` type in `src/types/index.ts`.
- Category names should stay aligned with app filters and labels.
- Credit costs and input/output strings are displayed directly in UI.
- Gamification storage keys: `omni_gam_user`, `omni_gam_tx`, `omni_gam_upvotes`, `omni_gam_referrals`, `omni_gam_shares`, `omni_gam_limits`, `omni_gam_pending_ref`, `omni_gam_banned_users`, `omni_gam_flags`, `omni_session`. Do NOT prefix them with anything else — admin sections hardcode these strings.
- The gamification store's public function names + types must stay stable. Internal storage primitives (read/write/broadcast) may change between localStorage and Worker-fetch as long as the public API is preserved.

## Work Guidance
- Keep tool data deterministic and client-safe.
- When adding categories or fields, update shared types and all UI consumers.
- For programmatic SEO entries, every indexable page must map to a real tool, unique keyword bundle, canonical slug, visible copy, FAQs, limitations, and related links.
- Adding a new gamification reward tier amount is a single-line edit to `TIER_TABLE[<tier>].rewards` in `gamification.ts`. The Pricing page, admin dashboard, and modal all reflect it automatically.
- Adding a new analytics category: append to CATEGORY_LIST in `dashboardAnalytics.ts` AND register in `pickFormatsForCategory`. The admin Analytics section surfaces it on the next render.

## Verification
- Run `npm run build` after schema or data shape changes.
- Verify every indexable SEO slug is present in `public/sitemap.xml` and linked from its category hub.
- For gamification changes: poll `localStorage` keys in DevTools to confirm shape; check admin Gamification dashboard KPIs reflect the change.

## Child DOX Index
- No child DOX files yet.
