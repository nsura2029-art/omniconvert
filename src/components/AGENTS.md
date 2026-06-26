# Components DOX

## Purpose
- Owns the React UI components for navigation, auth, conversion workflow, dashboard, billing, admin, onboarding, hero selector, and workflow builder.

## Ownership
- `ConversionPanel.tsx` owns upload sources, drag/drop, conversion simulation, progress logs, generated outputs, and related dialogs.
- `AuthModal.tsx` owns sandbox sign-in/sign-up and social-login simulation.
- `Dashboard.tsx`, `Billing.tsx`, and `AdminDashboard.tsx` own localStorage-backed product/account/admin surfaces.
- `Navbar.tsx` owns navigation, theme toggle, user menu, and credit indicators.

## Local Contracts
- Auth is currently simulated in the client; do not present it as production authentication.
- Admin/user/conversion/referral data currently comes from browser `localStorage`.
- Cloud upload sources are mock pickers unless a future backend integration is added.
- Upload UX should use the inline dropdown source selector before deeper URL/cloud picker modals.

## Work Guidance
- Keep component edits behavior-preserving unless the user explicitly asks for product logic changes.
- Avoid layout churn in established panels; prefer targeted control/state updates.
- Use lucide-react icons already imported or add icons from lucide-react when needed.
- Match the Format OS light palette and avoid reintroducing purple-heavy gradients as the dominant visual language.

## Verification
- Run `npm run build` for component changes.
- Use browser checks for changed interactions such as upload source selection, auth modals, dashboard tabs, or billing checkout.

## Child DOX Index
- No child DOX files yet.
