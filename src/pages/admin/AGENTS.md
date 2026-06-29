# Admin Panel DOX

## Purpose
- Owns the admin-only control room: Dashboard, Analytics, Users, Conversions, Gamification, Settings.
- All sections are gated on `currentUser?.email === 'admin@omniconvert.com'` in `src/App.tsx`.
- Non-admins land on a "Admin only" sign-in prompt for both `currentPage === 'admin'` and `currentPage.startsWith('analytics:')`.

## Ownership
- `AdminPanel.tsx` is the shell: left-rail nav, breadcrumb hint, section router. Section state is local to the shell; `onSectionChange` can be wired for deep-linking later.
- `AdminDashboardSection.tsx` — high-level KPIs (users / conversions / success rate / credits) + latest conversions feed + users snapshot. Polls `omni_users` + `omni_conversions` every 5s.
- `AdminAnalyticsSection.tsx` — 12 category cards + per-category deep-dive. Realtime poll every 5s.
- `AdminUsersSection.tsx` — registered users table + per-user `UserDrawer` (right-side drawer). Plan, credits, ban/unban, view activity.
- `AdminConversionsSection.tsx` — realtime conversion log table. Sort + filter.
- `AdminGamificationSection.tsx` — credits/upvotes/referrals/shares KPI grid + live credit-flow SVG chart + top earners + trending pairs + transactions table + anti-gaming alerts + CSV export. Polls every 3–5s + BroadcastChannel sync.
- `AdminSettingsSection.tsx` — hero preset toggle + Phase-2 backend wiring status.

## Local Contracts
- Sections are pure consumers: they read from localStorage + (when relevant) the gamification store. They do not own long-lived application state.
- Every KPI tile marked "Live" has a pulsing emerald dot and refreshes on its own polling cadence (3s for gamification, 5s for the rest).
- Left nav order is fixed: Dashboard → Analytics → Users → Conversions → Gamification → Settings. Adding a new section requires adding to the `NAV` array in `AdminPanel.tsx` AND extending the `AdminSection` union type.
- The shell uses `h-[calc(100vh-64px)]` so the page fills the viewport below the navbar. The main column scrolls independently.
- Each section's polling interval is the lowest cadence that keeps the data fresh without hammering storage — never faster than 3s.

## Work Guidance
- New sections go under `src/pages/admin/<Name>Section.tsx` and mount via a new entry in `AdminPanel.tsx`'s `NAV` + `AdminSection` union.
- Admin table rows must remain keyboard-accessible (Enter/Space activates the row action).
- Heavy aggregations (e.g. credit-flow SVG path generation, leaderboard) belong in `useMemo` keyed on the polling tick.

## Verification
- `npm run build` for any section add/change.
- Manually: sign in as `admin@omniconvert.com`, click each section in the left rail, confirm the panel renders without errors and KPIs update within their polling window.