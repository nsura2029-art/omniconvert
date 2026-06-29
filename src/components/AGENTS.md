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
- The conversion pipeline runs each file **in parallel** via `Promise.all(itemsToConvert.map(processSingleFile))`. Per-file state (progress, logs, conversion record) is kept independent through closures; do not reintroduce a sequential `for...await` loop.
- A file whose TO has been changed via the picker (or via `applyCadConvertAll`) must be re-processed on the next Convert click even if its previous run completed. The conversion state tracks `lastConvertedTargets[fileName]` so the filter can compare current target vs last-used target; both are cleared by Clear all, tool change, and on per-file remove.
- The per-row **Target format** selector uses the inline `TargetFormatPicker` component (search + category list + format chips, click-outside and Escape to close). Categories are derived from `FORMAT_CATEGORY_MAP` (Image, Audio, Video, Document, Archive, 3D, Other) and limited to the tool's `outputs` enriched by `CAD_TARGET_MATRIX[sourceExt]`. The picker is **light-themed** (white / slate-50 surfaces, dark text, blue accent on active category and selected chip); do not return to a dark zinc-950 surface without updating the DOX. Do not replace this picker with a native `<select>` or introduce a third-party dropdown/menu library without updating the DOX contract.
- Each file row renders a **type-specific colored icon chip** for both the input file and the converted output. The mapping lives in `FILE_TYPE_TABLE` and is keyed by extension (Image=pink / Audio=violet / Video=rose / PDF=red / DOC/DOCX=blue / Sheets=emerald / Text=slate / Markup=orange / Code=amber / Ebook=indigo / Archive=yellow / 3D/CAD=orange / fallback=neutral). The converted-output icon gets a small green ✓ badge in the bottom-right corner to keep the success signal. Do not collapse back to a single generic File icon for all rows without updating the DOX.
- The per-row progress bar (`UploadProgressBar`) is **dual-anchored**: two fills grow inward from the left and right edges at half the progress value, meeting at the center at 100%. Use the `motion/react` width animation, do not switch to a single left-anchored fill or a radial / circular indicator without updating the DOX.
- Files that have already been converted must render a **static** "Done" pill (green check + "100%") in the progress column instead of the animated `UploadProgressBar`. The animated bar is reserved for files that are currently being processed or are pending / analyzing. This prevents already-converted rows from looking like they're reprocessing when the user adds a new file and clicks Convert.
- Changing the global **Convert all to** dropdown (`applyCadConvertAll`) must update `targetFormats` for every file AND re-run `handleConvert(true)` so each row shows a fresh converted-output card with the new format. Prior `conversions` are cleared at the start of that forced pass so rows never carry a stale result.
- The CAD shell action area below the file list is structured as **three behavior-driven rows**: (1) Inputs row — `Attach more files` on the left (flex-1) and `Save to` on the right (fixed w-72), each with an upward-anchored popover; (2) Bulk ops row — `Convert all to` select on the left, status counter (`X of Y converted [· N pending/in progress]`) right-aligned, then `Clear all` and `Download all`; (3) Primary action row — full-width `Convert N files` when idle, `Converting...` spinner when processing, and **two-button grid** (`Regenerate all` secondary + `Download all (N files)` primary) when `allConverted`. All button labels use derived counts (`pendingCount` for Convert, `completedCount` for Download), never raw `files.length` or `conversions.length`, so they stay accurate after deletions, new uploads, and TO changes. State-based tinting: idle = white/slate-100 borders, processing = blue-50/40 bg + blue-100 borders + locked inputs, all-converted = emerald-50/30 bg + emerald-100 borders + ✓ badge on Save destination. Both popovers expand **upward** via `bottom-full mb-2`. Save-to popover lists providers with brand colors (Google `#4285f4` / Dropbox `#0061FF` / OneDrive `#0078D4`) and an active ✓ marker. `Regenerate all` calls `handleConvert(true)` to force a fresh pass over every file. Both popovers close when the other opens (mutually exclusive).
- Transient CAD notices (zip progress, download success, download error) auto-dismiss via `flashCadNotice` after 7s for success / 10s for error. Successive notices reset the timer; the timeout is cleared on unmount.

## Verification
- Run `npm run build` for component changes.
- Use browser checks for changed interactions such as upload source selection, auth modals, dashboard tabs, or billing checkout.

## Child DOX Index
- No child DOX files yet.
