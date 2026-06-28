# MASTER PROMPT: Build Font Converter Category for Widgetly

## CONTEXT
You are building the **Fonts** category for Widgetly (widgetly.tech), a file conversion marketplace platform similar to CloudConvert.com. This is the FIRST category to implement. The platform will eventually support 12 categories (Documents, Spreadsheets, Presentations, Images, Audio, Video, Archives, CAD, eBooks, Vectors, Fonts, 3D Models) with 203+ formats.

## REFERENCE FILES (attached)
1. `cloudconvert_format_catalog.json` — Full format catalog (all 12 categories, 203 formats)
2. `cloudconvert_format_catalog.csv` — Flat format list for database import
3. `cloudconvert_conversion_matrix.csv` — All 27,516+ conversion pairs with engines
4. `cloudconvert_architecture.json` — Complete architecture (DB schema, API endpoints, URL routing, page flows)
5. `cloudconvert_architecture.md` — Full documentation with schema, API, and flows

Extract all **Fonts** category data from these files before starting implementation.

---

## PART A: FONT CATEGORY DATA (Extract from attached files)

### A.1 Font Formats (9 formats)
| Ext | Name | Full Name | MIME | Can Read | Can Write | Notes |
|-----|------|-----------|------|----------|-----------|-------|
| ttf | TTF | TrueType Font | font/ttf | ✅ | ✅ | Most popular source |
| otf | OTF | OpenType Font | font/otf | ✅ | ✅ | Most popular source |
| woff | WOFF | Web Open Font Format | font/woff | ✅ | ✅ | Web standard |
| woff2 | WOFF2 | Web Open Font Format 2 | font/woff2 | ✅ | ✅ | Modern web standard |
| eot | EOT | Embedded OpenType | application/vnd.ms-fontobject | ✅ | ✅ | Legacy IE |
| pfa | PFA | PostScript Font ASCII | application/x-font-type1 | ✅ | ❌ | Read-only |
| pfb | PFB | PostScript Font Binary | application/x-font-type1 | ✅ | ❌ | Read-only |
| pcf | PCF | Portable Compiled Format | application/x-font-pcf | ✅ | ❌ | Read-only |
| snf | SNF | Server Normal Format | application/x-font-snf | ✅ | ❌ | Read-only |

### A.2 Popular Font Conversions (MVP Priority)
| From | To | Engine | Why |
|------|-----|--------|-----|
| TTF → WOFF | fontforge | Web font deployment |
| TTF → WOFF2 | fontforge | Modern web font deployment |
| OTF → WOFF2 | fontforge | Modern web font deployment |
| TTF → OTF | fontforge | Format upgrade |
| OTF → TTF | fontforge | Compatibility |
| WOFF → WOFF2 | fontforge | Compression upgrade |
| EOT → WOFF | fontforge | Legacy → modern |
| PFA → TTF | fontforge | PostScript → TrueType |
| PFB → OTF | fontforge | PostScript → OpenType |

### A.3 Font Conversion Matrix Scope
- **Conversions FROM Fonts**: 1,210 pairs (9 sources × ~134 writable targets)
- **Conversions TO Fonts**: 1,020 pairs (~170 readable sources × 5 writable targets: ttf, otf, woff, woff2, eot)
- **Total Font-related pairs**: 2,230
- **MVP scope**: Focus on same-category conversions (TTF, OTF, WOFF, WOFF2, EOT) + top 5 cross-category (PDF, SVG, PNG for preview)

---

## PART B: TECH STACK (Widgetly Platform)

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS |
| Backend | Cloudflare Workers (serverless), Hono framework |
| Database | Cloudflare D1 (SQLite) |
| Storage | Cloudflare R2 (S3-compatible) |
| File Processing | Browser-based (opentype.js, fontkit, woff2_compress) + Cloudflare Workers for heavy ops |
| CDN | Cloudflare |
| Deployment | Cloudflare Pages + Workers |

**CRITICAL DECISION**: Determine if font conversion can happen **entirely in the browser** (no API call) or requires **server-side processing**. Research:
- `opentype.js` — Read/write TTF/OTF in browser
- `fontkit` — Advanced font manipulation in browser
- `woff2` compression — Requires WASM (available via `fonteditor-core` or `woff2-encoder`)
- `sfnt2woff` / `woff2sfnt` — For WOFF conversion
- **Conclusion**: Same-category font conversions (TTF↔OTF↔WOFF↔WOFF2) CAN happen in-browser. Cross-category (Font→PDF, Font→Image) requires server-side.

---

## PART C: UI FLOW TO BUILD

### C.1 Landing Page (`/`) — Hero Section
```
┌─────────────────────────────────────────────────────────────┐
│  WIDGETLY — AI-Powered File Conversion Marketplace          │
│                                                             │
│  [ Category Grid: Documents | Spreadsheets | Images |        │
│    Audio | Video | Archives | CAD | eBooks | Vectors |      │
│    FONTS (highlighted/active) | 3D Models ]                │
│                                                             │
│  → Click FONTS → navigates to /convert/fonts               │
│                                                             │
│  [ Drag & Drop Any File ]  or  [ Browse Files ]            │
│                                                             │
│  → Auto-detects file type → if font, redirects to          │
│    /convert/{detected-font-format}                        │
└─────────────────────────────────────────────────────────────┘
```

### C.2 Font Category Page (`/convert/fonts`)
```
┌─────────────────────────────────────────────────────────────┐
│  🔤 Fonts — 9 Formats Supported                              │
│                                                             │
│  [ Search formats... ]                                      │
│                                                             │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                  │
│  │ TTF │ │ OTF │ │WOFF │ │WOFF2│ │ EOT │  ← Clickable     │
│  │🔤   │ │🔤   │ │🌐   │ │🌐   │ │📰   │    cards         │
│  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘                  │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                          │
│  │ PFA │ │ PFB │ │ PCF │ │ SNF │  ← Read-only (grayed)    │
│  │📄   │ │📄   │ │📄   │ │📄   │                            │
│  └─────┘ └─────┘ └─────┘ └─────┘                          │
│                                                             │
│  → Click TTF → navigates to /convert/ttf                   │
│  → Click OTF → navigates to /convert/otf                   │
│  → Click PFA → shows "Convert From PFA" but targets        │
│    limited to writable formats only                          │
└─────────────────────────────────────────────────────────────┘
│  POPULAR FONT CONVERSIONS                                   │
│  TTF → WOFF | TTF → WOFF2 | OTF → WOFF2 | OTF → TTF       │
│  → Click pair → opens /convert/ttf-to-woff with pre-fill   │
└─────────────────────────────────────────────────────────────┘
```

### C.3 Converter Page (`/convert/{source-format}`) — e.g., `/convert/ttf`
```
┌─────────────────────────────────────────────────────────────┐
│  CONVERT FROM: [ TTF ▼ ]          CONVERT TO: [ Select ▼ ] │
│                                                             │
│  → "Convert From" is FIXED (from URL param)                 │
│  → "Convert To" dropdown shows ONLY valid targets for TTF:   │
│     • Fonts: OTF, WOFF, WOFF2, EOT                         │
│     • Documents: PDF (preview), TXT (metadata)              │
│     • Images: PNG (font preview image)                      │
│  → Selecting target updates URL to /convert/ttf-to-woff      │
│  → CONVERT button is DISABLED until target selected         │
│  → When target selected: CONVERT button HIGHLIGHTS (green)  │
└─────────────────────────────────────────────────────────────┘
│  FILE UPLOAD WIZARD                                         │
│  [ Drag font files here (.ttf, .otf) ]                     │
│  [ Upload from URL ] [ Google Drive ] [ Dropbox ]           │
│                                                             │
│  → Validates file extension matches "Convert From"         │
│  → Shows file name, size, detected format                    │
│  → Multiple files supported (batch conversion)              │
└─────────────────────────────────────────────────────────────┘
│  CONVERSION OPTIONS (appear after target selected)         │
│  ┌─────────────────────────────────────────┐                │
│  │ Subset Characters: [ All ▼ ]            │                │
│  │ Remove Hinting: [ ] checkbox            │                │
│  │ Compression Level: [ Default ▼ ]        │                │
│  │ (Options vary by target format)         │                │
│  └─────────────────────────────────────────┘                │
└─────────────────────────────────────────────────────────────┘
│  [ 🚀 CONVERT NOW ]  ← HIGHLIGHTED when ready              │
└─────────────────────────────────────────────────────────────┘
```

### C.4 Converter Page (`/convert/{source}-to-{target}`) — e.g., `/convert/ttf-to-woff2`
```
┌─────────────────────────────────────────────────────────────┐
│  CONVERT FROM: [ TTF ▼ ]          CONVERT TO: [ WOFF2 ▼ ] │
│                                                             │
│  → Both dropdowns pre-filled from URL                      │
│  → Changing either dropdown updates URL dynamically          │
│  → Browser history.pushState for SPA navigation             │
│  → Back/forward buttons work correctly                     │
└─────────────────────────────────────────────────────────────┘
│  DYNAMIC TEXT (Programmable SEO)                            │
│                                                             │
│  Title: "Convert TTF to WOFF2 Online — Free Font Converter" │
│  H1: "TTF to WOFF2 Converter"                               │
│  Description: "Convert TrueType fonts to WOFF2 format..."   │
│  Meta: "Free online TTF to WOFF2 converter. Convert..."     │
│  Schema.org: Tool → Application → HowTo markup             │
│  OG Tags: Dynamic image showing TTF → WOFF2 icon flow      │
│                                                             │
│  → ALL text changes dynamically based on URL params         │
│  → Use Next.js generateMetadata for SSR meta tags           │
│  → Pre-render top 50 conversion pairs at build time         │
└─────────────────────────────────────────────────────────────┘
```

### C.5 Conversion Progress / Result Page
```
┌─────────────────────────────────────────────────────────────┐
│  CONVERTING...                                              │
│  [████████████░░░░░░░░] 60%                                 │
│  File: MyFont.ttf → MyFont.woff2                             │
│  Engine: fontforge (browser)                                │
│                                                             │
│  → If browser-based: show "Processing in your browser"     │
│  → If server-based: show "Processing on our secure servers"  │
└─────────────────────────────────────────────────────────────┘
│  ✅ CONVERSION COMPLETE                                     │
│  MyFont.woff2 — 45.2 KB (compressed from 128 KB)           │
│  [ ⬇️ DOWNLOAD ]  [ 📋 Copy Link ]  [ 🔄 Convert Another ] │
│                                                             │
│  → Download starts automatically                           │
│  → File expires in 24 hours (R2 TTL)                       │
│  → Show "Related Conversions": TTF→WOFF, OTF→WOFF2, etc.   │
└─────────────────────────────────────────────────────────────┘
```

---

## PART D: PROGRAMMABLE SEO REQUIREMENTS

### D.1 Dynamic Content Generation
For EVERY conversion pair URL (`/convert/{source}-to-{target}`), generate:

| Element | Template | Example |
|---------|----------|---------|
| `<title>` | `{Source} to {Target} Converter — Free Online Font Conversion` | `TTF to WOFF2 Converter — Free Online Font Conversion` |
| `<meta name="description">` | `Convert {Source} files to {Target} format online. Free, fast, and secure {source}-to-{target} converter.` | `Convert TTF files to WOFF2 format online...` |
| `<h1>` | `{Source} to {Target} Converter` | `TTF to WOFF2 Converter` |
| `<h2>` | `How to Convert {Source} to {Target}` | `How to Convert TTF to WOFF2` |
| `<h2>` | `{Source} to {Target} Conversion Features` | `TTF to WOFF2 Conversion Features` |
| Content | `Our {Source} to {Target} converter supports...` | `Our TTF to WOFF2 converter supports...` |
| FAQ | `What is {Source}?`, `What is {Target}?`, `Why convert {Source} to {Target}?` | `What is TTF?`, `What is WOFF2?` |
| Schema.org | `Tool` + `HowTo` structured data | JSON-LD with steps |
| OG Image | Dynamic SVG showing format icons | `TTF icon → arrow → WOFF2 icon` |
| Canonical | `https://widgetly.tech/convert/{source}-to-{target}` | `.../convert/ttf-to-woff2` |

### D.2 Pre-rendering Strategy
- **Build-time**: Pre-render top 50 font conversion pairs (TTF→WOFF, TTF→WOFF2, OTF→WOFF2, etc.)
- **Runtime**: Dynamic rendering for remaining 2,180+ pairs using `generateMetadata` + `generateStaticParams` fallback
- **Sitemap**: Auto-generate sitemap.xml with all conversion pair URLs

### D.3 URL Structure for SEO
```
/convert/ttf                    → "TTF Converter — Convert TrueType Fonts Online"
/convert/ttf-to-woff            → "TTF to WOFF Converter — Free Online"
/convert/ttf-to-woff2           → "TTF to WOFF2 Converter — Free Online"
/convert/fonts                  → "Font Converter — 9 Formats Supported"
/fonts                          → "Font Formats — Widgetly"
```

---

## PART E: API DESIGN (if needed)

### E.1 Decision Matrix: Browser vs API

| Conversion Type | Browser-Only? | API Needed? | Reason |
|-----------------|---------------|-------------|--------|
| TTF ↔ OTF ↔ WOFF ↔ WOFF2 | ✅ YES | ❌ NO | `opentype.js` + `fonteditor-core` handle in browser |
| EOT → WOFF/WOFF2 | ✅ YES | ❌ NO | `ttf2eot` / `eot2ttf` WASM available |
| PFA/PFB → TTF/OTF | ⚠️ MAYBE | ⚠️ MAYBE | PostScript parsing is complex; may need server |
| PCF/SNF → TTF/OTF | ❌ NO | ✅ YES | Legacy bitmap fonts need server processing |
| Font → PDF | ❌ NO | ✅ YES | PDF generation requires server |
| Font → PNG/SVG preview | ✅ YES | ❌ NO | Canvas API can render font glyphs |
| Font → TXT (metadata) | ✅ YES | ❌ NO | Parse font tables in browser |

### E.2 API Endpoints (if server-side needed)

```typescript
// GET /api/v1/font-formats
// Returns all font formats with capabilities
{
  "categories": [{
    "id": "fonts",
    "name": "Fonts",
    "formats": [
      { "ext": "ttf", "name": "TTF", "canRead": true, "canWrite": true, "browserConvertible": true },
      { "ext": "pfa", "name": "PFA", "canRead": true, "canWrite": false, "browserConvertible": false }
    ]
  }]
}

// GET /api/v1/conversions/{source}/{target}
// Returns conversion details
{
  "source": "ttf",
  "target": "woff2",
  "engine": "fontforge",
  "browserSupported": true,
  "options": [
    { "name": "subset", "type": "string", "default": "all" },
    { "name": "hinting", "type": "boolean", "default": true }
  ],
  "estimatedTime": "2s"
}

// POST /api/v1/jobs
// For server-side conversions only
{
  "sourceFormat": "pcf",
  "targetFormat": "ttf",
  "fileUrl": "https://r2.widgetly.tech/uploads/...",
  "options": { "hinting": false }
}

// GET /api/v1/jobs/{id}
// Poll for status
{
  "id": "job-123",
  "status": "completed", // pending, processing, completed, error
  "progress": 100,
  "downloadUrl": "https://r2.widgetly.tech/output/...",
  "expiresAt": "2026-06-28T15:00:00Z"
}
```

### E.3 Browser-Only Conversion Flow (No API)
```
User selects TTF → WOFF2
        ↓
Frontend loads opentype.js + woff2 WASM
        ↓
File parsed in browser (ArrayBuffer)
        ↓
Font tables extracted and re-encoded
        ↓
WOFF2 blob generated client-side
        ↓
Download triggered via URL.createObjectURL()
        ↓
NO API CALL MADE — 100% client-side
```

---

## PART F: DELIVERABLES — TODO LISTS

### F.1 UI TODO List

| # | Task | Status | Priority |
|---|------|--------|----------|
| 1 | Create `/convert/fonts` category page with 9 format cards | ⬜ | P0 |
| 2 | Build format card component (icon, name, ext, read/write badge) | ⬜ | P0 |
| 3 | Implement category navigation from home page hero grid | ⬜ | P0 |
| 4 | Create `/convert/{source}` page with "Convert From" fixed | ⬜ | P0 |
| 5 | Build "Convert To" dropdown with dynamic valid targets | ⬜ | P0 |
| 6 | Implement URL sync: dropdown change → URL update | ⬜ | P0 |
| 7 | Highlight CONVERT button when target selected | ⬜ | P0 |
| 8 | Build file upload wizard (drag-drop, URL, cloud) | ⬜ | P0 |
| 9 | Validate file extension matches "Convert From" | ⬜ | P0 |
| 10 | Show conversion options panel (format-specific) | ⬜ | P1 |
| 11 | Build progress indicator for browser-based conversion | ⬜ | P1 |
| 12 | Build result page (download, copy link, convert another) | ⬜ | P1 |
| 13 | Show "Related Conversions" on result page | ⬜ | P2 |
| 14 | Add batch conversion support (multiple files) | ⬜ | P2 |
| 15 | Responsive design for mobile/tablet | ⬜ | P1 |
| 16 | Dark mode support | ⬜ | P3 |

### F.2 API TODO List (if server-side needed)

| # | Task | Status | Priority |
|---|------|--------|----------|
| 1 | Design `GET /api/v1/font-formats` endpoint | ⬜ | P0 |
| 2 | Design `GET /api/v1/conversions/{source}/{target}` endpoint | ⬜ | P0 |
| 3 | Design `POST /api/v1/jobs` endpoint (for server-side only) | ⬜ | P1 |
| 4 | Design `GET /api/v1/jobs/{id}` polling endpoint | ⬜ | P1 |
| 5 | Implement R2 upload presigned URL generation | ⬜ | P1 |
| 6 | Implement R2 download presigned URL generation | ⬜ | P1 |
| 7 | Build font processing worker (Cloudflare Worker) | ⬜ | P1 |
| 8 | Integrate fontforge/fonttools in worker | ⬜ | P2 |
| 9 | Add job queue with D1 status tracking | ⬜ | P2 |
| 10 | Add error handling and retry logic | ⬜ | P2 |
| 11 | Add rate limiting for job creation | ⬜ | P3 |
| 12 | Add webhook support for completion notification | ⬜ | P3 |

### F.3 API Documentation TODO List

| # | Task | Status | Priority |
|---|------|--------|----------|
| 1 | Create `/docs` page with API overview | ⬜ | P0 |
| 2 | Document `GET /api/v1/font-formats` with examples | ⬜ | P0 |
| 3 | Document `GET /api/v1/conversions/{source}/{target}` | ⬜ | P0 |
| 4 | Document `POST /api/v1/jobs` request/response schema | ⬜ | P1 |
| 5 | Document `GET /api/v1/jobs/{id}` status codes | ⬜ | P1 |
| 6 | Add interactive API tester (like Swagger UI) | ⬜ | P2 |
| 7 | Add code examples (cURL, JavaScript, Python) | ⬜ | P2 |
| 8 | Document rate limits and error codes | ⬜ | P2 |
| 9 | Add authentication guide (API keys) | ⬜ | P3 |
| 10 | Add SDK documentation (if building SDKs) | ⬜ | P3 |

---

## PART G: IMPLEMENTATION GUIDANCE

### G.1 Font Conversion Libraries (Browser)
| Library | Use Case | NPM |
|---------|----------|-----|
| `opentype.js` | Parse TTF/OTF, extract glyphs, metadata | `opentype.js` |
| `fonteditor-core` | Convert between TTF/OTF/WOFF/WOFF2/EOT | `fonteditor-core` |
| `woff2` | WOFF2 compression (WASM) | `woff2` |
| `ttf2woff` | TTF to WOFF conversion | `ttf2woff` |
| `ttf2eot` | TTF to EOT conversion | `ttf2eot` |
| `canvas` API | Render font preview as PNG | Built-in |
| `file-saver` | Trigger file downloads | `file-saver` |

### G.2 Font Conversion Libraries (Server/Worker)
| Library | Use Case |
|---------|----------|
| `fontforge` (Python) | Universal font conversion |
| `fonttools` (Python) | Low-level font manipulation |
| `woff2` (Google) | WOFF2 encode/decode |
| `sfnt2woff` | WOFF generation |
| `freetype-py` | Font rendering |

### G.3 Component Structure
```
app/
├── convert/
│   ├── fonts/
│   │   └── page.tsx              # /convert/fonts category page
│   ├── [source]/
│   │   └── page.tsx              # /convert/ttf — source selected
│   └── [source]-to-[target]/
│       └── page.tsx              # /convert/ttf-to-woff2 — both selected
│
├── api/
│   └── v1/
│       ├── font-formats/
│       │   └── route.ts          # GET /api/v1/font-formats
│       ├── conversions/
│       │   └── [source]/
│       │       └── [target]/
│       │           └── route.ts  # GET /api/v1/conversions/ttf/woff2
│       └── jobs/
│           ├── route.ts          # POST /api/v1/jobs
│           └── [id]/
│               └── route.ts      # GET /api/v1/jobs/{id}
│
├── docs/
│   └── page.tsx                  # API documentation page
│
├── components/
│   ├── FormatCard.tsx            # Format selection card
│   ├── ConvertFromDropdown.tsx   # Source format selector
│   ├── ConvertToDropdown.tsx     # Target format selector
│   ├── FileUploadWizard.tsx     # Drag-drop + URL + cloud
│   ├── ConversionOptions.tsx      # Format-specific options
│   ├── ConvertButton.tsx         # Highlighted action button
│   ├── ProgressIndicator.tsx     # Conversion progress
│   ├── ResultPanel.tsx           # Download + related conversions
│   └── DynamicSEO.tsx            # Programmable SEO meta tags
│
├── lib/
│   ├── fontConverter.ts          # Browser font conversion engine
│   ├── fontFormats.ts            # Font format data/constants
│   ├── conversions.ts            # Conversion matrix logic
│   └── seo.ts                    # Dynamic SEO text generation
│
└── types/
    └── font.ts                   # TypeScript interfaces
```

---

## PART H: ACCEPTANCE CRITERIA

### H.1 Must Have (P0)
- [ ] `/convert/fonts` page displays all 9 font formats as clickable cards
- [ ] Clicking a format navigates to `/convert/{format}`
- [ ] Converter page shows "Convert From" fixed, "Convert To" dynamic
- [ ] "Convert To" only shows valid targets for selected source
- [ ] Selecting target updates URL to `/convert/{source}-to-{target}`
- [ ] CONVERT button highlights (green/active) when target selected
- [ ] File upload validates extension matches "Convert From"
- [ ] Browser-based conversion works for TTF↔OTF↔WOFF↔WOFF2
- [ ] Dynamic SEO meta tags change per conversion pair
- [ ] Page titles and H1s update based on URL params

### H.2 Should Have (P1)
- [ ] Conversion options panel (subset, hinting, compression)
- [ ] Progress indicator for browser conversion
- [ ] Result page with download + related conversions
- [ ] Batch file upload support
- [ ] API endpoints for server-side conversions (PCF, SNF, cross-category)
- [ ] API documentation page at `/docs`

### H.3 Nice to Have (P2)
- [ ] Font preview rendering (glyphs grid)
- [ ] Font metadata display (family, style, weight, glyph count)
- [ ] Google Drive/Dropbox integration
- [ ] Conversion history for logged-in users

---

## INSTRUCTION TO AGENT

1. **Read all 5 attached files** to understand the full platform context.
2. **Extract Font category data** specifically from the format catalog and conversion matrix.
3. **Determine the technical approach**: For each font conversion pair, decide if it can be done in-browser (using `opentype.js`, `fonteditor-core`, WASM) or requires a server API call.
4. **Build the UI flow** starting from `/convert/fonts` → format selection → converter page → file upload → conversion → result.
5. **Implement Programmable SEO** — every conversion pair URL must have unique, dynamic title, meta description, H1, and structured data.
6. **Create API endpoints** ONLY for conversions that cannot be done in-browser. Document all endpoints.
7. **Generate the three TODO lists**: UI, API, and API Documentation.
8. **Output code** for the Next.js + Cloudflare stack as specified.
9. **Start with the simplest conversion first** (TTF → WOFF2 in browser) and iterate.

**Start building now. Focus on the Font category MVP first.**
