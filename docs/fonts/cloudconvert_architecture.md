# CloudConvert-Style Format Conversion Platform — Architecture & Data Model

## Overview

This document reverse-engineers the architecture of **CloudConvert.com** to help build a similar file conversion platform. The platform supports **203 formats** across **12 categories** with an estimated **27,516+ valid conversion pairs**.

---

## 1. Format Catalog (12 Categories, 203 Formats)

| # | Category | Icon | Formats | Description |
|---|----------|------|---------|-------------|
| 1 | Documents | 📄 | 23 | Word processing, PDF, text, ePub |
| 2 | Spreadsheets | 📊 | 12 | Excel, CSV, ODS, Numbers |
| 3 | Presentations | 🎨 | 10 | PowerPoint, Keynote, ODP |
| 4 | Images | 🖼️ | 35 | JPG, PNG, RAW, HEIC, TIFF |
| 5 | Audio | 🎵 | 22 | MP3, WAV, FLAC, AAC, OGG |
| 6 | Video | 🎬 | 28 | MP4, AVI, MOV, MKV, WebM |
| 7 | Archives | 📦 | 15 | ZIP, RAR, 7Z, TAR |
| 8 | CAD | 🏗️ | 18 | DWG, DXF, STEP, IGES, STL |
| 9 | eBooks | 📚 | 8 | EPUB, MOBI, AZW3, FB2 |
| 10 | Vectors | ✏️ | 12 | SVG, AI, EPS, CDR, EMF |
| 11 | Fonts | 🔤 | 9 | TTF, OTF, WOFF, WOFF2 |
| 12 | 3D Models | 🧊 | 11 | STL, OBJ, GLTF, GLB, FBX |

---

## 2. User Flow & Page Architecture

### 2.1 Home Page (`/`)

```
┌─────────────────────────────────────────────────────────────┐
│  HERO: "Convert Any File"                                   │
│  [ Drag & Drop Zone ]  or  [ Select File ]                  │
│                                                             │
│  → Auto-detects file type → redirects to converter          │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│  FORMAT CATALOG                                             │
│  [Documents] [Spreadsheets] [Images] [Audio] ... (12 tabs)  │
│                                                             │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ...  (format grid)            │
│  │PDF │ │DOCX│ │ODT │ │TXT │                                 │
│  └────┘ └────┘ └────┘ └────┘                                 │
│                                                             │
│  → Click any format → navigates to /convert/{format}        │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│  COMMON CONVERSION TYPES                                    │
│  PDF → DOCX | JPG → PNG | MP4 → AVI | MP3 → WAV ...         │
│                                                             │
│  → Click pair → opens converter with pre-filled formats     │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Converter Page (`/convert/{source-format}`)

```
┌─────────────────────────────────────────────────────────────┐
│  CONVERT FROM: [ PDF ▼ ]          CONVERT TO: [ DOCX ▼ ]   │
│                                                             │
│  → Changing source updates "Convert To" dropdown           │
│  → Only valid target formats shown                          │
│  → URL auto-updates: /convert/pdf-to-docx                   │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│  FILE UPLOAD WIZARD                                         │
│  [ Drag files here ]  [ From URL ]  [ Cloud Storage ]     │
│                                                             │
│  → Validates file extension matches "Convert From"         │
│  → Shows file size, name, format detected                   │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│  CONVERSION OPTIONS (format-specific)                       │
│  Quality: [High ▼] | Engine: [LibreOffice ▼] | ...         │
│                                                             │
│  → Options loaded from API: /api/v1/conversions/pdf/docx   │
└─────────────────────────────────────────────────────────────┘
│  [ 🔴 CONVERT NOW ]                                         │
└─────────────────────────────────────────────────────────────┘
```

### 2.3 Direct File Upload Flow

```
User drops file on home page
        ↓
Frontend detects MIME type / extension
        ↓
Redirects to /convert/{detected-format}
        ↓
Converter page shows ALL possible "Convert To" targets
        ↓
User selects target format
        ↓
URL updates to /convert/{source}-to-{target}
        ↓
File is already attached from the drop
        ↓
User clicks Convert → Job created → Processing → Download
```

---

## 3. Database Schema

### 3.1 Categories Table
```sql
CREATE TABLE categories (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    icon VARCHAR(10),
    description TEXT,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 3.2 Formats Table
```sql
CREATE TABLE formats (
    id SERIAL PRIMARY KEY,
    ext VARCHAR(20) NOT NULL,
    name VARCHAR(50) NOT NULL,
    full_name VARCHAR(200),
    slug VARCHAR(50) UNIQUE NOT NULL,
    mime_type VARCHAR(200),
    category_id VARCHAR(50) REFERENCES categories(id),
    can_read BOOLEAN DEFAULT TRUE,
    can_write BOOLEAN DEFAULT TRUE,
    is_popular BOOLEAN DEFAULT FALSE,
    icon_url VARCHAR(500),
    description TEXT,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 3.3 Conversions Table (The Matrix)
```sql
CREATE TABLE conversions (
    id SERIAL PRIMARY KEY,
    source_format_id INT REFERENCES formats(id),
    target_format_id INT REFERENCES formats(id),
    engine VARCHAR(100) NOT NULL,
    engine_version VARCHAR(50),
    credits_cost INT DEFAULT 1,
    is_popular BOOLEAN DEFAULT FALSE,
    conversion_time_avg_sec INT,
    options_schema JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(source_format_id, target_format_id, engine)
);

CREATE INDEX idx_conversions_source ON conversions(source_format_id);
CREATE INDEX idx_conversions_target ON conversions(target_format_id);
CREATE INDEX idx_conversions_pair ON conversions(source_format_id, target_format_id);
```

### 3.4 Conversion Options Table
```sql
CREATE TABLE conversion_options (
    id SERIAL PRIMARY KEY,
    conversion_id INT REFERENCES conversions(id),
    option_name VARCHAR(100) NOT NULL,
    option_type VARCHAR(50), -- enum, number, string, boolean
    default_value TEXT,
    min_value NUMERIC,
    max_value NUMERIC,
    choices JSONB,
    description TEXT,
    is_required BOOLEAN DEFAULT FALSE
);
```

### 3.5 Jobs Table
```sql
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed, error
    source_format VARCHAR(20) NOT NULL,
    target_format VARCHAR(20) NOT NULL,
    input_url TEXT,
    output_url TEXT,
    file_size_bytes BIGINT,
    credits_used INT DEFAULT 0,
    engine_used VARCHAR(100),
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    started_at TIMESTAMP,
    completed_at TIMESTAMP
);
```

---

## 4. API Endpoints

### 4.1 Public Endpoints (No Auth)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/categories` | List all categories with format counts |
| GET | `/api/v1/categories/{id}/formats` | List formats in a category |
| GET | `/api/v1/formats` | List all formats (filterable) |
| GET | `/api/v1/formats/{slug}` | Format details + popular conversions |
| GET | `/api/v1/formats/{slug}/conversions` | All valid "convert to" targets |
| GET | `/api/v1/conversions/popular` | Most common conversion pairs |
| GET | `/api/v1/conversions/{source}/{target}` | Specific conversion details + options |
| GET | `/api/v1/operations` | List all supported operations (like CloudConvert) |

### 4.2 Authenticated Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/jobs` | Create conversion job |
| GET | `/api/v1/jobs/{id}` | Get job status & progress |
| GET | `/api/v1/jobs/{id}/download` | Download converted file |
| DELETE | `/api/v1/jobs/{id}` | Cancel pending job |

---

## 5. URL Routing Structure

| Route | Description |
|-------|-------------|
| `/` | Home page with hero + format catalog |
| `/formats` | Full format catalog |
| `/formats/{category-slug}` | Category-specific format list |
| `/convert/{source-format}` | Converter with source pre-selected |
| `/convert/{source-format}-to-{target-format}` | Converter with both formats pre-selected |
| `/tools` | All tools listing |
| `/tools/{tool-slug}` | Individual tool page |
| `/docs` | API documentation |
| `/pricing` | Pricing plans |

---

## 6. Engine Mapping (Simplified)

| Category | Engine | Examples |
|----------|--------|----------|
| Documents, Spreadsheets, Presentations | `libreoffice` | DOCX↔PDF, XLSX↔CSV |
| Images | `imagemagick` | JPG↔PNG, TIFF↔WEBP |
| Audio | `ffmpeg` | MP3↔WAV, FLAC↔AAC |
| Video | `ffmpeg` | MP4↔AVI, MOV↔WebM |
| Archives | `7zip` | ZIP↔RAR, TAR↔GZ |
| CAD | `cad_converter` | DWG↔DXF, STEP↔IGES |
| eBooks | `calibre` | EPUB↔MOBI, PDF↔EPUB |
| Vectors | `inkscape` | SVG↔PNG, AI↔SVG |
| Fonts | `fontforge` | TTF↔WOFF, OTF↔WOFF2 |
| 3D Models | `assimp` | STL↔OBJ, GLTF↔GLB |
| Cross: Doc→Image | `libreoffice` | PDF→PNG, PPTX→JPG |
| Cross: Image→Doc | `ocr` | JPG→PDF (with OCR) |
| Cross: Vector→Image | `inkscape` | SVG→PNG, AI→JPG |
| Cross: Video→Audio | `ffmpeg` | MP4→MP3, AVI→WAV |

---

## 7. Key Statistics

| Metric | Value |
|--------|-------|
| Total Categories | 12 |
| Total Formats | 203 |
| Total Conversion Pairs | ~27,516 |
| Common Conversions (flagged) | 66 |
| Cross-Category Conversions | ~24,749 |
| Read-Only Formats | ~15 |
| Write-Only Formats | ~0 |
| Estimated Engines | 10+ |

---

## 8. Files Generated

1. **`cloudconvert_format_catalog.json`** — Full format catalog with categories
2. **`cloudconvert_format_catalog.csv`** — Flat format list (203 rows)
3. **`cloudconvert_conversion_matrix.csv`** — All conversion pairs (27,516 rows)
4. **`cloudconvert_architecture.json`** — Full architecture document
5. **`cloudconvert_architecture.md`** — This document

---

*Generated for building a CloudConvert-style file conversion platform.*
