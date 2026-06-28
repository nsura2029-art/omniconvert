---
name: omniconvert-cad-seo
description: Use when researching CAD conversion keywords, planning or implementing programmatic SEO for OmniConvert CAD pages, adding or updating CAD category/detail pages, keyword bundles, metadata, sitemap/robots, structured data, internal linking, and search QA for CAD file conversion terms such as DWG, DXF, DWF, STEP, STP, STL, IGES, IGS, OBJ, SVG, FBX, and PDF.
---

# OmniConvert CAD SEO

## Core workflow

1. Read `AGENTS.md`, `docs/AGENTS.md`, `src/AGENTS.md`, `src/data/AGENTS.md`, and this skill before CAD SEO page work.
2. Check whether the task is research/planning, static metadata, page implementation, tool catalog updates, or indexing infrastructure.
3. Keep recommendations honest: current OmniConvert conversion behavior is simulated unless production conversion backends are explicitly implemented.
4. Update `docs/cad-seo-plan.md`, `src/data/tools.ts`, `src/data/cadSeoPages.ts`, sitemap/robots, and nearest AGENTS files when page contracts change.
5. For programmatic SEO work, map every indexable CAD page to a tool, keyword bundle, canonical URL, unique metadata, static content, related links, and schema.

## CAD keyword priorities

Prioritize exact format-pair pages before generic CAD pages:

1. `dwg to pdf`, `convert dwg to pdf online`, `autocad to pdf`
2. `dxf to pdf`, `convert dxf to pdf online`
3. `dwg to dxf`, `dxf to dwg`
4. `dwg viewer online`, `dxf viewer online`, `view CAD without AutoCAD`
5. `step to stl`, `stp to stl`, `stl to step`, `stl to stp`
6. `iges to step`, `igs to step`, `step to iges`
7. `obj to stl`, `stl to obj`, `fbx to obj`, `3d model converter`
8. `dwg to png`, `dwg to jpg`, `dwg to svg`, `dxf to svg`
9. `pdf to dwg`, `pdf to dxf` only with careful limitations language.
10. `dwg version converter`, `autocad version converter`, `cad drawing compress`, `cad layer extractor`.

Use modifiers in copy and FAQs: `online`, `free`, `without AutoCAD`, `batch`, `secure`, `large file`, `preserve layers`, `preserve scale`, `preserve units`, `engineering drawing`, `architecture`, `mechanical`, `3D printing`, `CNC`.

## Programmatic SEO contract

For each generated CAD URL:

- Map the page to one `src/data/tools.ts` CAD tool or mark it `noindex` with a reason.
- Use a unique primary keyword, title, meta description, H1, canonical, intro, FAQ set, and related-link set.
- Include modifiers naturally: `online`, `free`, `converter`, `without AutoCAD`, `batch`, `secure`, `large file`, `preserve layers`, `3D printing`, `CNC`.
- Use route-specific limitations copy for lossy workflows such as `PDF to DWG`, `PDF to DXF`, and `STL to STEP`.
- Avoid doorway/thin pages: each page needs distinct use cases, supported formats, limitations, FAQs, and related routes.

## Page contract

For each indexable CAD page:

- Use a stable crawlable URL such as `/cad/dwg-to-pdf`.
- Provide unique `<title>`, meta description, canonical URL, H1, and visible explanatory copy.
- Put the conversion module or tool CTA near the top, but include enough static text for crawlers and users.
- Include supported input/output formats, best-use cases, known limitations, and FAQs.
- Add internal links to related CAD pages and the `/cad-converter/` category hub.
- Add structured data where appropriate: `SoftwareApplication`, `FAQPage`, and `BreadcrumbList`.
- Avoid claiming real conversion fidelity that the current app cannot deliver.

## Indexing requirements

- Prefer pre-rendered/static HTML for SEO pages. A pure client-side route with only an app shell is weaker for indexing and snippets.
- Ensure pages return `200` only when valid; avoid soft-404 behavior for unknown converter slugs.
- Add `robots.txt` allowing public converter pages and referencing `sitemap.xml`.
- Add `sitemap.xml` with all public CAD URLs and update it whenever pages are added/removed.
- Use canonical URLs consistently and do not change canonicals only after client-side JavaScript runs.

## Implementation guidance

- If staying in Vite SPA, add a route/page data layer and generate static HTML pages during build before relying on SEO traffic.
- Keep CAD page content data-driven: category hub, slug, input format, output format, title, description, FAQs, related links, limitations.
- Use `src/data/cadSeoPages.ts` as the source of truth for CAD detail URLs, keyword bundles, metadata, FAQs, limitations, related links, and tool mappings.
- Use `/cad/<slug>` for CAD detail routes and `/cad-converter/` as the category hub that links to every indexable CAD detail page.
- Use Dense Utility Cards for the `/cad-converter/` tool grid: compact, visibly clickable on mouseover, no visible credit labels, and light arrow surfaces. Keep 3D Tilt Conversion Cards and Format Rail Cards available for featured/educational category sections.
- On CAD detail pages, place Related CAD converters immediately below the upload/converter section with up to 6 related CAD tools in a 2-row grid and a Browse all CAD tools link. Keep cross-category recommendations in a separate Popular tools section with 3 category rows and 3 tools per row.
- CAD conversion QA can use public synthetic fixtures under `public/seed-files/cad/`, especially through the URL upload path. Do not expose a production-facing "Try sample file" button unless explicitly requested.
- Keep `public/sitemap.xml` synchronized with every indexable CAD URL and keep `public/robots.txt` pointing at the production sitemap.
- Keep tool catalog entries aligned with `src/types/index.ts` and `src/data/tools.ts`.
- Keep UI consistent with the Format OS design system.

## Verification

- Run `npm run build` after page, metadata, or sitemap changes.
- Run `npm run lint` after TypeScript/data changes.
- Verify every CAD tool has a keyword bundle or explicit `noindex` reason.
- Verify all indexable CAD URLs appear in `sitemap.xml` and are not blocked by `robots.txt`.
- Verify `/cad-converter/` links to every indexable CAD detail page and every detail page links back to the hub.
- Inspect generated HTML/source for title, meta description, canonical, static H1/body content, and structured data.
- Verify `/robots.txt`, `/sitemap.xml`, and representative CAD URLs return `200` locally or in preview.
- Verify unknown CAD slugs return a real 404 or noindex state, not a soft app-shell page.
