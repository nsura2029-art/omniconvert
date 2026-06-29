---
name: omniconvert-conversion-matrix
description: Use when adding a new conversion category, expanding the tool catalog, or designing UI/API surfaces for a new from->to path. Drives the format support, browser-vs-server feasibility, validation rules, and implementation TODOs for any new conversion.
---

# SKILL: Conversion Matrix & Feasibility Analyzer

## PURPOSE
This is a REUSABLE SKILL for the OmniConvert development agent. Before implementing ANY category or conversion feature, the agent MUST run this analysis to determine:
1. What conversions are supported (from -> to matrix)
2. File validation requirements for each format
3. Whether each conversion is doable in-browser or requires server-side API
4. Which libraries/tools to use for each conversion path
5. What the per-category analytics dashboard view should show (see §5 below)

## INPUT FILES (MUST READ BEFORE ANALYSIS)
The agent MUST read these files on every invocation:
1. `cloudconvert_format_catalog.json` - Full format catalog (all categories, all formats)
2. `cloudconvert_format_catalog.csv` - Flat format list with can_read/can_write flags
3. `cloudconvert_conversion_matrix.csv` - All conversion pairs with engines
4. `cloudconvert_architecture.json` - DB schema, API endpoints, URL routing

## ANALYSIS WORKFLOW (MUST FOLLOW STEP-BY-STEP)

### STEP 1: Extract Category Data
```
READ cloudconvert_format_catalog.json
EXTRACT formats where category_id == {TARGET_CATEGORY}
FOR EACH format:
  - Record: ext, name, full_name, mime_type, can_read, can_write
  - Count: total formats, readable formats, writable formats
OUTPUT: Category format summary table
```

### STEP 2: Build Conversion Matrix
```
FOR EACH source_format IN category (where can_read == true):
  FOR EACH target_format IN ALL formats (where can_write == true):
    IF source_format == target_format: SKIP
    RECORD pair: {source} -> {target}
    DETERMINE: is_same_category, is_cross_category
    DETERMINE: is_popular (check against known popular pairs)
OUTPUT: Full conversion matrix (CSV-style table)
```

### STEP 3: Determine Browser vs Server Feasibility
```
FOR EACH conversion pair:
  CHECK browser_feasibility_rules (see table below)
  DETERMINE: feasibility = YES | NO | PARTIAL
  IF YES:   browser_libs = [list], server_required = false
  IF NO:    server_libs = [list], server_required = true
  IF PARTIAL: browser_libs = [list], server_libs = [list], server_required = true_for_some
OUTPUT: Feasibility matrix with justification
```

### STEP 4: Define File Validation Requirements
```
FOR EACH format in category:
  DETERMINE:
    - accepted_extensions: [".ext"]
    - accepted_mime_types: ["mime/type"]
    - max_file_size: bytes (category-specific)
    - magic_bytes_signature: hex signature for validation
    - validation_method: extension | mime | magic_bytes | content_parse
    - error_message_if_invalid: "Only .ext files up to X MB are supported"
OUTPUT: Validation rules table per format
```

### STEP 5: Generate Implementation TODO Lists
```
GENERATE four TODO lists:
  1. UI TODO: Components, pages, interactions needed
  2. API TODO: Endpoints, workers, storage needed (only for server-required conversions)
  3. DOCS TODO: API documentation, examples, guides needed
  4. ANALYTICS DASHBOARD TODO: Per-category analytics view. The dashboard
     is **admin-only** (Approach: Admin Panel → Analytics section).
     Every category MUST be reachable from the Analytics section's 12
     category cards and render the following panels in its deep-dive:
       - KPI cards (8): total conversions, unique users, success rate,
         avg time, formats supported, browser-feasible pairs, server-required
         pairs, bytes processed
       - From -> To matrix heatmap (browser-feasible vs server-required cells)
       - Popular conversion pairs table (source / target / volume /
         success / avg time / path)
       - Processing path breakdown (browser / hybrid / server, % bars)
       - Latency breakdown (avg / median / p95 / queue wait / cold start)
       - Trending line chart of conversions over time
       - Usage timeline with day/week/month toggle (peak + bytes)
       - Advanced analytics panel (peak hour, avg file size, error rate,
         cold start, 7d/30d retention, format popularity trend, top regions)
     Realtime signal: the Analytics section polls `omni_conversions` and
     the gamification store every 5 seconds, so real conversion counts
     blend into KPI tiles. Seeded analytics fill the gaps for categories
     with no real conversions yet.
     When a new category is added:
       - Append its id to CATEGORY_LIST in `src/data/dashboardAnalytics.ts`
       - Register its icon name (existing lucide-react icon)
       - Add a format pool entry in `pickFormatsForCategory(cat, n, rand)`
         so `buildPopularPairs` / `buildMatrix` / `buildUsageTimeline`
         produce realistic-feeling format names for the new category
       - Verify the admin Analytics section shows the new category card
         and the per-category deep-dive renders without runtime errors
OUTPUT: Four prioritized todo lists
```

---

## BROWSER FEASIBILITY RULES (REFERENCE TABLE)

Use this table to determine if a conversion can happen in the browser. The agent MUST NOT guess - it must reference this table.

| Source Category | Target Category | Feasibility | Browser Libraries | Server Required | Notes |
|-----------------|-----------------|-------------|-------------------|-----------------|-------|
| documents | documents | PARTIAL | mammoth.js, pdf-lib.js, pdfjs-dist, docx.js | YES for complex | Text extraction/simple HTML works. Complex formatting, PDF rendering needs server. |
| spreadsheets | spreadsheets | YES | xlsx.js (SheetJS), papaparse | NO | XLSX<->CSV/JSON/TSV works fully in browser. |
| presentations | presentations | PARTIAL | pptx-parser, pdf-lib.js | YES | Text extraction works. Slide rendering needs server. |
| images | images | YES | sharp (WASM), canvas API, pica, image-js | NO | JPG<->PNG<->WEBP<->BMP works in browser. RAW may need server. |
| audio | audio | YES | ffmpeg.wasm | NO | MP3<->WAV<->FLAC<->AAC works in browser. Large files (>50MB) may need server. |
| video | video | YES | ffmpeg.wasm | NO | Format conversion works. Large files may need server. |
| video | images | YES | ffmpeg.wasm | NO | Frame extraction works in browser. |
| video | audio | YES | ffmpeg.wasm | NO | Audio extraction works in browser. |
| archives | archives | YES | fflate, zip.js, tar-js | NO | ZIP<->TAR<->GZ works in browser. RAR/7Z may need server. |
| cad | cad | NO | N/A | YES | CAD conversion is complex. Server required. |
| cad | images | PARTIAL | three.js, opencascade.js | YES for conversion | 3D rendering works in browser. Format conversion needs server. |
| ebooks | ebooks | PARTIAL | epub.js, mobi-parser | YES | Reading/extraction works. Format conversion needs server (Calibre). |
| vectors | vectors | PARTIAL | fabric.js, svg.js, canvg | YES for AI/CDR | SVG<->PNG/JPG works in browser. AI/CDR/EPS need server. |
| vectors | images | YES | fabric.js, svg.js, canvg | NO | SVG->PNG/JPG works in browser. |
| fonts | fonts | YES | opentype.js, fonteditor-core, ttf2woff, woff2 (WASM) | NO | TTF/OTF/WOFF/WOFF2 conversion works in browser. |
| fonts | images | YES | opentype.js, canvas API | NO | Glyph rendering to PNG works in browser. |
| 3d | 3d | PARTIAL | three.js, babylon.js, assimpjs | YES for complex | Some conversions via assimp.js. Complex ones need server. |
| 3d | images | YES | three.js, babylon.js | NO | 3D rendering to image works in browser. |
| ANY | documents | NO | N/A | YES | OCR or complex rendering always needs server. |
| ANY | pdf | PARTIAL | pdf-lib.js | YES for complex | Simple PDF creation works. Complex rendering needs server. |

**RULE**: If feasibility is YES -> implement in browser, no API needed.
**RULE**: If feasibility is NO -> implement server API, no browser attempt.
**RULE**: If feasibility is PARTIAL -> implement browser for simple cases, server fallback for complex cases.

---

## FILE VALIDATION RULES BY CATEGORY

### Documents
| Format | Extensions | MIME Types | Max Size | Validation | Magic Bytes |
|--------|------------|------------|----------|------------|-------------|
| PDF | .pdf | application/pdf | 50MB | extension + magic | `%PDF-1.x` |
| DOCX | .docx | application/vnd.openxmlformats... | 50MB | extension + content | `PK    ` (ZIP) + `[Content_Types].xml` |
| DOC | .doc | application/msword | 50MB | extension + magic | `      ` (OLE) |
| ODT | .odt | application/vnd.oasis.opendocument.text | 50MB | extension + content | `PK    ` (ZIP) |
| TXT | .txt | text/plain | 10MB | extension + mime | none |
| MD | .md | text/markdown | 10MB | extension + mime | none |
| RTF | .rtf | application/rtf | 25MB | extension + magic | `{\rtf` |
| HTML | .html, .htm | text/html | 10MB | extension + content | `<!DOCTYPE` or `<html` |
| EPUB | .epub | application/epub+zip | 100MB | extension + content | `PK    ` (ZIP) |
| MOBI | .mobi | application/x-mobipocket-ebook | 100MB | magic | BOOKMOBI |

### Spreadsheets
| Format | Extensions | MIME Types | Max Size | Validation |
|--------|------------|------------|----------|------------|
| XLSX | .xlsx | application/vnd.openxmlformats... | 50MB | extension + content (ZIP) |
| XLS | .xls | application/vnd.ms-excel | 50MB | extension + magic (OLE2) |
| CSV | .csv | text/csv | 100MB | content (text scan) |
| ODS | .ods | application/vnd.oasis.opendocument.spreadsheet | 50MB | extension + content |
| TSV | .tsv | text/tab-separated-values | 100MB | extension + content |

### Presentations
| Format | Extensions | MIME Types | Max Size | Validation |
|--------|------------|------------|----------|------------|
| PPTX | .pptx | application/vnd.openxmlformats... | 50MB | extension + content (ZIP) |
| PPT | .ppt | application/vnd.ms-powerpoint | 50MB | extension + magic (OLE2) |
| ODP | .odp | application/vnd.oasis.opendocument.presentation | 50MB | extension + content |

### Images
| Format | Extensions | MIME Types | Max Size | Validation | Magic Bytes |
|--------|------------|------------|----------|------------|-------------|
| JPG | .jpg, .jpeg | image/jpeg | 50MB | extension + magic | `FF D8 FF` |
| PNG | .png | image/png | 50MB | extension + magic | `89 50 4E 47` |
| WEBP | .webp | image/webp | 50MB | extension + magic | `RIFF...WEBP` |
| GIF | .gif | image/gif | 20MB | extension + magic | `GIF87a` / `GIF89a` |
| BMP | .bmp | image/bmp | 50MB | extension + magic | `BM` |
| TIFF | .tiff, .tif | image/tiff | 100MB | extension + magic | `II*\0` or `MM\0*` |
| HEIC | .heic | image/heic | 50MB | extension + magic (ftyp box) | `....ftypheic` |
| AVIF | .avif | image/avif | 50MB | extension + magic | `....ftypavif` |
| SVG | .svg | image/svg+xml | 5MB | extension + content (XML) | `<svg` |
| ICO | .ico | image/x-icon | 5MB | extension + magic | `\0\0\1\0` |

### Audio
| Format | Extensions | MIME Types | Max Size |
|--------|------------|------------|----------|
| MP3 | .mp3 | audio/mpeg | 200MB |
| WAV | .wav | audio/wav | 500MB |
| FLAC | .flac | audio/flac | 500MB |
| AAC | .aac | audio/aac | 200MB |
| OGG | .ogg, .oga | audio/ogg | 200MB |
| M4A | .m4a | audio/mp4 | 200MB |
| OPUS | .opus | audio/opus | 200MB |
| WMA | .wma | audio/x-ms-wma | 200MB |
| AIFF | .aiff, .aif | audio/aiff | 500MB |

### Video
| Format | Extensions | MIME Types | Max Size |
|--------|------------|------------|----------|
| MP4 | .mp4 | video/mp4 | 2GB |
| MOV | .mov | video/quicktime | 2GB |
| AVI | .avi | video/x-msvideo | 2GB |
| MKV | .mkv | video/x-matroska | 2GB |
| WEBM | .webm | video/webm | 2GB |
| FLV | .flv | video/x-flv | 1GB |
| WMV | .wmv | video/x-ms-wmv | 2GB |
| MPEG | .mpeg, .mpg | video/mpeg | 2GB |

### Archives
| Format | Extensions | MIME Types | Max Size |
|--------|------------|------------|----------|
| ZIP | .zip | application/zip | 1GB |
| 7Z | .7z | application/x-7z-compressed | 1GB |
| TAR | .tar | application/x-tar | 1GB |
| GZ | .gz | application/gzip | 1GB |
| BZ2 | .bz2 | application/x-bzip2 | 1GB |
| XZ | .xz | application/x-xz | 1GB |
| RAR | .rar | application/vnd.rar | 1GB |

### CAD
| Format | Extensions | MIME Types | Max Size | Magic |
|--------|------------|------------|----------|-------|
| DWG | .dwg | application/acad | 200MB | `AC10xx` |
| DXF | .dxf | application/dxf | 100MB | (text scan) |
| STEP | .step, .stp | application/step | 100MB | `ISO-10303-21` |
| IGES | .iges, .igs | application/iges | 100MB | (text scan) |
| STL | .stl | model/stl | 200MB | `solid` (ASCII) or 80-byte binary |
| OBJ | .obj | model/obj | 200MB | `#` or `v ` |
| 3DS | .3ds | application/x-3ds | 200MB | `4D4D` (binary) |
| FBX | .fbx | application/x-fbx | 200MB | `Kaydara FBX Binary` |
| DAE | .dae | model/vnd.collada+xml | 100MB | `<COLLADA` |
| PLY | .ply | model/ply | 200MB | `ply` or binary |
| IFC | .ifc | application/x-step | 100MB | `ISO-10303-21` |
| SKP | .skp | application/octet-stream | 200MB | binary signature |
| VSDX | .vsdx | application/vnd.ms-visio.drawing | 50MB | ZIP+vsdx |
| CGM | .cgm | image/cgm | 25MB | binary |
| SVGZ | .svgz | image/svg+xml | 25MB | gzip+svg |

### eBooks
| Format | Extensions | MIME Types | Max Size |
|--------|------------|------------|----------|
| EPUB | .epub | application/epub+zip | 100MB |
| MOBI | .mobi | application/x-mobipocket-ebook | 100MB |
| FB2 | .fb2 | application/xml | 50MB |

### Vectors
| Format | Extensions | MIME Types | Max Size |
|--------|------------|------------|----------|
| SVG | .svg | image/svg+xml | 5MB |
| EPS | .eps | application/postscript | 50MB |
| EMF | .emf | image/emf | 25MB |
| WMF | .wmf | image/wmf | 25MB |

### Fonts
| Format | Extensions | MIME Types |
|--------|------------|------------|
| TTF | .ttf | font/ttf |
| OTF | .otf | font/otf |
| WOFF | .woff | font/woff |
| WOFF2 | .woff2 | font/woff2 |
| EOT | .eot | application/vnd.ms-fontobject |

### 3D Models
| Format | Extensions | MIME Types |
|--------|------------|------------|
| GLTF | .gltf | model/gltf+json |
| GLB | .glb | model/gltf-binary |
| STL | .stl | model/stl |
| OBJ | .obj | model/obj |
| PLY | .ply | model/ply |
| FBX | .fbx | application/x-fbx |
| 3DS | .3ds | application/x-3ds |
| DAE | .dae | model/vnd.collada+xml |

---

## 8-SECTION ANALYSIS REPORT TEMPLATE

Every invocation of this skill MUST end with an 8-section analysis report:

```
§1 Category & Format Summary  -  totals (readable/writable), exemplar formats
§2 Cross-Category Target Universe  -  which other categories can be reached
§3 Feasibility Decision  -  YES/NO/PARTIAL with justification
§4 Validation Rules  -  extensions, MIME, magic bytes, max size, error msg
§5 Implementation TODOs  -  UI, API, Docs, ANALYTICS DASHBOARD
§6 API TODOs  -  POST /api/v1/jobs, GET /api/v1/jobs/{id}, etc.
§7 Docs TODOs  -  per-target feasibility table, examples
§8 Verification Plan  -  manual + e2e checks before shipping
```

The agent MUST NOT start coding until §1-§8 are produced and (when relevant)
committed to the conversation history.

---

## PER-CATEGORY ANALYTICS DASHBOARD CONTRACT

The dashboard is **admin-only** and ships inside the Admin Panel.
Reference implementation lives at:
- `src/pages/admin/AdminPanel.tsx` - shell with left-rail nav
- `src/pages/admin/AdminAnalyticsSection.tsx` - 12 category cards + per-category deep-dive + realtime polling
- `src/components/dashboard/DashboardSidebar.tsx` - left sidebar inside the dashboard page
- `src/components/dashboard/KpiCard.tsx` - KPI cards + KpiGrid + formatBytes/formatMs helpers
- `src/components/dashboard/FromToMatrix.tsx` - heatmap
- `src/components/dashboard/DashboardPanels.tsx` - Popular pairs, Trending chart, Processing breakdown, Latency breakdown, Usage timeline, Advanced analytics
- `src/data/dashboardAnalytics.ts` - seeded data + builders (KPI summaries, popular pairs, matrix, processing breakdown, timeline, advanced stats)
- `src/data/localConversions.ts` - real-signal layer over `omni_conversions`
- `src/pages/stubRouter.tsx` - Link stub; replace with real `react-router-dom` Link/useParams when added

When shipping a new category, the agent MUST:
1. Append the category id + name + description to CATEGORY_META in
   `src/data/dashboardAnalytics.ts`.
2. Register the icon name in CATEGORY_LIST (use an existing
   lucide-react icon, or import one).
3. Add a format pool in `pickFormatsForCategory(cat, n, rand)` so
   `buildPopularPairs` / `buildMatrix` / `buildUsageTimeline` produce
   realistic-feeling format names for the new category.
4. Verify the new category surfaces in the admin Analytics section's
   12 category cards and the per-category deep-dive renders without
   runtime errors.

Adding the analytics view is part of the category's DOX contract; a
category is NOT considered shipped until its dashboard panel renders
without errors and the data layer produces seeded values consistent
with the rest of the platform. Non-admin visitors see a "Admin only"
sign-in prompt instead of the dashboard, so adding a public route
that exposes analytics is a DOX violation.