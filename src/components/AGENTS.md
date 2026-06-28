# Components DOX

## Purpose
- Owns the React UI components for navigation, auth, conversion workflow, dashboard, billing, admin, onboarding, hero selector, and workflow builder.

## Ownership
- `ConversionPanel.tsx` owns upload sources, drag/drop, conversion simulation, progress logs, generated outputs, and related dialogs.
- `AuthModal.tsx` owns sandbox sign-in/sign-up and social-login simulation.
- `Dashboard.tsx`, `Billing.tsx`, and `AdminDashboard.tsx` own localStorage-backed product/account/admin surfaces.
- `Navbar.tsx` owns navigation, the Tools/All Tools header menu, theme toggle, user menu, and credit indicators.
- `CategoryPage.tsx` owns dynamic category converter landing pages, category-specific bento matching, supported-format summaries, FAQs, and category-only tool grids.

## Local Contracts
- Auth is currently simulated in the client; do not present it as production authentication.
- Admin/user/conversion/referral data currently comes from browser `localStorage`.
- Cloud upload sources are mock pickers unless a future backend integration is added.
- Upload UX should use the inline icon/button source selector before deeper URL/cloud picker modals; avoid falling back to native select menus for choose-file source picking.
- CAD seed fixtures under `public/seed-files/cad/` are for URL/manual browser QA. Do not show a production-facing "Try sample file" button unless explicitly requested.
- The Tools/All Tools header menu should follow the Convertio-style category menu pattern: category entries link to dedicated dynamic category pages instead of simply scrolling users to the generic tools directory. CAD should be promoted as a first-class category because it is not a common default browsing path.

## Work Guidance
- Keep component edits behavior-preserving unless the user explicitly asks for product logic changes.
- Avoid layout churn in established panels; prefer targeted control/state updates.
- Category pages should be dynamically populated from category/tool data, SEO-friendly, and show a category home experience with a bento grid matcher plus only that category's supported source and target formats.
- Approved category-card visual systems from `design-mockups/card-systems-5.html` are 3D Tilt Conversion Cards for featured/high-intent routes, Format Rail Cards for explicit source-target education, and Dense Utility Cards for large route grids.
- CAD category tool grids should use Dense Utility Cards: compact clickable cards, no visible credit labels, clear mouseover affordance, and light arrow surfaces instead of dark arrow pills.
- CAD detail pages should place Related CAD converters directly below the upload/converter section, showing up to 6 related tools in a 2-row grid plus a Browse all CAD tools link. Cross-category popular tools belong in a separate Popular tools section grouped by 3 categories with 3 tools each.
- Programmatic SEO category/detail page UI must preserve unique H1/body copy, related links, FAQs, and route-specific limitations from the SEO data model.
- Informational pages such as Security must align with category-page rhythm: use comparable H1/body/section heading sizes, keep breadcrumb-to-heading spacing compact, keep breadcrumbs left-aligned and sticky, and maintain section gaps consistent with `CategoryPage.tsx` rather than landing-page hero spacing.
- Use lucide-react icons already imported or add icons from lucide-react when needed.
- Match the Format OS light palette and avoid reintroducing purple-heavy gradients as the dominant visual language.
- In `ConversionPanel.tsx`, the bundled **Download all** action (next to **Clear all** in the CAD converter shell) zips every converted output into `omniconvert-conversions-YYYY-MM-DD.zip` via the inline `buildZip` STORE writer. Do not introduce a third-party ZIP dependency unless the writer's scope grows beyond the current single-bundle download.
- Primary action buttons that drive a single conversion (CAD **Convert** button, **Initiate Sandbox Convert**) must reuse the `btn-primary` mesh-gradient token so they match the navbar `Sign In` button.
- The **Convert** action in `ConversionPanel.tsx` must only process files whose current entry in `fileProgresses` is missing or not `completed`. Already-converted files are skipped, their progress is preserved, and conversions from prior runs are merged into `conversions` rather than replaced. Creator tools (TTS, Markdown to HTML) keep their virtual-file fallback when `files` is empty. `handleConvert` accepts an optional `forceAll` flag used by `applyCadConvertAll` to force a fresh pass; do not reset `conversions` or `fileProgresses` inside `handleConvert` itself — that reset belongs in explicit user actions (Clear all, tool change) or in callers that opt into a forced pass.
- A file whose TO has been changed via the picker (or via `applyCadConvertAll`) must be re-processed on the next Convert click even if its previous run completed. The conversion state tracks `lastConvertedTargets[fileName]` so the filter can compare current target vs last-used target; both are cleared by Clear all, tool change, and on per-file remove.
- The per-row **Target format** selector uses the inline `TargetFormatPicker` component (search + category list + format chips, click-outside and Escape to close). Categories are derived from `FORMAT_CATEGORY_MAP` (Image, Audio, Video, Document, Archive, 3D, Other) and limited to the tool's `outputs` enriched by `CAD_TARGET_MATRIX[sourceExt]`. The picker is **light-themed** (white / slate-50 surfaces, dark text, blue accent on active category and selected chip); do not return to a dark zinc-950 surface without updating the DOX. Do not replace this picker with a native `<select>` or introduce a third-party dropdown/menu library without updating the DOX contract.
- Changing the global **Convert all to** dropdown (`applyCadConvertAll`) must update `targetFormats` for every file AND re-run `handleConvert(true)` so each row shows a fresh converted-output card with the new format. Prior `conversions` are cleared at the start of that forced pass so rows never carry a stale result.
- The CAD shell action area below the file list is structured as two rows: (1) right-aligned `Convert all to` + select + `Clear all` + `Download all` in a single flex row, (2) full-width `Convert` (btn-primary) below. `Clear all` and `Download all` both use the `btn-primary` token to match the navbar Sign In button. `Download all` is disabled until `allConverted` is true. The `Download all` action must trigger the inline `buildZip` STORE bundle, not per-file downloads.
- Transient CAD notices (zip progress, download success, download error) auto-dismiss via `flashCadNotice` after 7s for success / 10s for error. Successive notices reset the timer; the timeout is cleared on unmount.

## Verification
- Run `npm run build` for component changes.
- Use browser checks for changed interactions such as upload source selection, auth modals, dashboard tabs, or billing checkout.

## Child DOX Index
- No child DOX files yet.
