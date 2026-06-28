# CAD Programmatic SEO Plan

## Goal

Make OmniConvert discoverable for CAD conversion searches by publishing high-intent, crawlable CAD category and converter pages backed by structured data, unique metadata, sitemap coverage, and honest conversion limitations.

## Current state

- OmniConvert is a Vite React SPA with simulated client-side conversion behavior.
- `/cad-converter/` exists as a dynamic category hub in the app shell.
- `src/data/tools.ts` contains 21 CAD tools ordered by research popularity from `cad.csv`.
- `src/data/cadSeoPages.ts` maps all 21 indexable CAD detail URLs to tool records, keyword bundles, unique copy, FAQs, limitations, and related links.
- `/cad/<slug>` detail routes are implemented in the app shell for every current CAD tool.
- `robots.txt`, `sitemap.xml`, canonical handling, noindex handling for unknown CAD slugs, and client-managed JSON-LD are implemented.
- Static/prerendered HTML is still a future enhancement; current detail pages are client-rendered inside the Vite SPA.

## Keyword universe

### Primary route keywords

Create a keyword bundle for every CAD tool. Each bundle should include:

- Primary query: exact conversion pair or tool intent.
- Secondary variants: `online`, `free`, `converter`, `without AutoCAD`, `batch`, `secure`, and format aliases.
- Use-case modifiers: `engineering drawing`, `architecture`, `mechanical`, `3D printing`, `CNC`, `layer`, `version`, `preview`.
- Limitations copy: especially for lossy/reconstructed flows like `PDF to DWG`, `PDF to DXF`, and `STL to STEP`.

### Priority groups

1. Five-star / highest intent: `dwg to dxf`, `dxf to dwg`, `dwg to pdf`, `cad file viewer`, `dwg viewer online`, `dxf viewer online`.
2. Four-star / commercial intent: `pdf to dwg`, `pdf to dxf`, `step to stl`, `stp to stl`, `dwg version converter`, `obj to stl`, `3d model converter`.
3. Three-star / long tail: `stl to step`, `iges to stl`, `dwg to svg`, `dxf to svg`, `stl to obj`, `fbx to obj`, `cad drawing compress`, `cad layer extractor`.
4. Existing catalog extras: `iges to step`, `dwg to image`, `3ds to obj`, `cad compress`.

## Page architecture

### Category card design direction

- Use the approved card systems from `design-mockups/card-systems-5.html` for category pages: 3D Tilt Conversion Cards, Format Rail Cards, and Dense Utility Cards.
- Use Dense Utility Cards for the CAD category grid because it has many route cards.
- CAD grid cards should look clickable on mouseover, avoid visible credit labels, and use light arrow surfaces instead of dark arrow pills.
- On CAD detail pages, place up to 6 Related CAD converters directly below the upload/converter section in a 2-row grid with a Browse all CAD tools link.
- Keep cross-category recommendations separate as a Popular tools section with 3 rows, each row representing a different category with 3 popular tools.

### Hub pages

- `/cad-converter/`: category hub with all CAD routes, source/target format summaries, FAQs, and internal links.
- Future `/cad/`: optional canonical SEO hub if we want shorter evergreen category URLs.

### Programmatic detail pages

Use stable URLs such as:

- `/cad/dwg-to-pdf`
- `/cad/dxf-to-dwg`
- `/cad/cad-file-viewer`
- `/cad/pdf-to-dwg`
- `/cad/step-to-stl`
- `/cad/dwg-version-converter`
- `/cad/obj-to-stl`
- `/cad/3d-model-converter`
- `/cad/cad-layer-extractor`

Each detail page must map to a CAD tool record and a keyword bundle. Do not generate generic pages without distinct intent, copy, and metadata.

## Data model todo

Use `src/data/cadSeoPages.ts` with fields:

- `slug`
- `toolId`
- `primaryKeyword`
- `secondaryKeywords`
- `searchIntent`
- `inputFormats`
- `outputFormats`
- `title`
- `metaDescription`
- `h1`
- `intro`
- `steps`
- `useCases`
- `limitations`
- `faqs`
- `relatedSlugs`
- `schemaType`
- `noindex` for experimental or unsupported pages

## Page template requirements

Every indexable CAD detail page needs:

- Unique URL, title, meta description, canonical URL, and H1.
- Static intro content visible in initial HTML.
- Conversion module or CTA near the top.
- Supported input/output formats.
- Format-specific best-use cases.
- Known limitations and fidelity notes.
- Privacy/security copy.
- Related CAD converter links.
- FAQs with keyword variants naturally included.
- JSON-LD: `SoftwareApplication`, `FAQPage`, and `BreadcrumbList` where appropriate.

## Indexing infrastructure todo

1. Add CAD SEO page data model.
2. Add all 21 CAD page records from `src/data/tools.ts`.
3. Choose rendering approach:
   - Preferred: static/prerendered HTML for every CAD slug during build.
   - Short-term acceptable: SPA route with complete visible content, but weaker than prerendering.
4. Add crawlable routes for `/cad-converter/` and `/cad/:slug`.
5. Add `public/robots.txt` with sitemap reference.
6. Add `public/sitemap.xml` or sitemap generator including all CAD URLs.
7. Add canonical URL handling using `APP_URL` / `VITE_APP_URL`.
8. Add unique title/meta/canonical per page.
9. Add internal links from CAD hub to every CAD page and related links between detail pages.
10. Add 404/noindex behavior for unknown slugs.
11. Add Search Console after deploy and submit sitemap.
12. Track impressions, CTR, indexed pages, crawl errors, and query coverage.

## Programmatic SEO quality checks

Before shipping CAD SEO changes, verify:

- Every CAD tool has a matching SEO keyword bundle or an explicit `noindex` reason.
- Every indexable CAD slug has unique title, meta description, H1, canonical, intro, FAQs, and related links.
- No two pages target the same primary keyword unless one is canonicalized/noindexed.
- `/cad-converter/` links to every indexable CAD detail page.
- Each detail page links back to `/cad-converter/` and at least 3 relevant related CAD pages when possible.
- Sitemap includes every indexable CAD URL and excludes noindex/unknown slugs.
- Robots references sitemap and does not block public CAD URLs.
- Page source or prerendered output includes static title, meta description, canonical, H1, body copy, and JSON-LD.
- Unknown CAD slug returns a real 404 or noindex state, not a soft app-shell page.
- Copy does not claim production conversion fidelity while conversion behavior is simulated.

## Implementation phases

### Phase 1: Data and copy foundation

- [ ] Create CAD SEO page data model.
- [ ] Add keyword bundles for all 21 CAD tools.
- [ ] Add unique title/meta/H1/intro/FAQ/limitations per page.
- [ ] Mark experimental or unsupported routes with `noindex` if needed.

### Phase 2: Routes and rendering

- [ ] Add CAD hub/detail routing.
- [ ] Add converter detail template.
- [ ] Add related links and breadcrumbs.
- [ ] Add unknown slug 404/noindex handling.
- [ ] Evaluate prerender/static generation for all CAD routes.

### Phase 3: Metadata and schema

- [ ] Add document title/meta/canonical per page.
- [ ] Add JSON-LD `SoftwareApplication`.
- [ ] Add JSON-LD `FAQPage`.
- [ ] Add JSON-LD `BreadcrumbList`.

### Phase 4: Crawl/index files

- [ ] Add `public/robots.txt`.
- [ ] Add `public/sitemap.xml` or sitemap generation script.
- [ ] Include all indexable CAD URLs in sitemap.
- [ ] Add production base URL config.

### Phase 5: QA and monitoring

- [ ] `npm run lint` passes.
- [ ] `npm run build` passes.
- [ ] Browser-check `/cad-converter/` and representative detail pages.
- [ ] Inspect generated/source HTML for metadata and static content.
- [ ] Verify `/robots.txt`, `/sitemap.xml`, and unknown slug behavior.
- [ ] Submit sitemap in Google Search Console after deploy.
- [ ] Review Search Console query coverage and expand long-tail pages.

## Sources

- Google Search Central: JavaScript SEO basics - https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics
- Google Search Central: Sitemaps - https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview
- Google Search Central: robots.txt - https://developers.google.com/search/docs/crawling-indexing/robots/intro
- Google Search Central: Title links - https://developers.google.com/search/docs/appearance/title-link
- Google Search Central: Snippets and meta descriptions - https://developers.google.com/search/docs/appearance/snippet
