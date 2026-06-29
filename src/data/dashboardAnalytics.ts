/**
 * Dashboard analytics data layer.
 *
 * Generates per-category analytics for the dashboard. Uses a deterministic
 * seed per category so the same category always shows the same numbers
 * across renders (avoids flicker and lets screenshots / comparisons be
 * reproducible). Real conversion data from localStorage (the user's actual
 * conversions) is layered on top so the dashboard reflects real usage when
 * available, with the seeded data filling in the gaps.
 */

import { FileConversion } from '../types';

export type CategoryId =
  | 'documents' | 'spreadsheets' | 'presentations' | 'images'
  | 'audio' | 'video' | 'archives' | 'cad' | 'ebooks'
  | 'vectors' | 'fonts' | '3d';

export type Period = 'day' | 'week' | 'month';

export interface CategorySummary {
  id: CategoryId;
  name: string;
  description: string;
  totalFormats: number;
  writableFormats: number;
  readableFormats: number;
  totalConversions: number;
  uniqueUsers: number;
  browserFeasiblePairs: number;
  serverRequiredPairs: number;
  successRate: number;
  avgTimeMs: number;
  medianTimeMs: number;
  p95TimeMs: number;
  totalBytesProcessed: number;
}

export interface PopularPair {
  source: string;
  target: string;
  count: number;
  successRate: number;
  avgTimeMs: number;
  browserFeasible: boolean;
}

export interface MatrixCell {
  source: string;
  target: string;
  count: number;
  browserFeasible: boolean;
}

export interface TimePoint {
  label: string;
  count: number;
  bytes: number;
}

export interface ProcessingBreakdown {
  browserFeasible: number;
  serverRequired: number;
  hybrid: number;
}

export interface AdvancedStats {
  peakHour: string;
  avgFileSizeBytes: number;
  errorRate: number;
  queueWaitMs: number;
  coldStartMs: number;
  formatPopularity: Array<{ format: string; delta: number }>;
  retention7d: number;
  retention30d: number;
  geoTop: Array<{ region: string; share: number }>;
}

// ---- deterministic PRNG ---------------------------------------------------
const hashStr = (s: string): number => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};
const seeded = (seed: number) => {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
};

const CATEGORY_META: Record<CategoryId, { name: string; description: string; formats: number; writable: number; readable: number; browserFeasible: number; serverRequired: number }> = {
  documents:    { name: 'Documents',    description: 'PDF, DOCX, ODT, TXT and other office formats.', formats: 23, writable: 15, readable: 21, browserFeasible: 18, serverRequired: 87 },
  spreadsheets: { name: 'Spreadsheets', description: 'XLSX, XLS, ODS, CSV and tabular data formats.',      formats: 12, writable: 7,  readable: 12, browserFeasible: 56, serverRequired: 22 },
  presentations:{ name: 'Presentations',description: 'PPTX, PPT, ODP slide-deck formats.',                formats: 10, writable: 3,  readable: 9,  browserFeasible: 4,  serverRequired: 24 },
  images:       { name: 'Images',       description: 'JPG, PNG, WEBP, HEIC and raster formats.',         formats: 36, writable: 19, readable: 32, browserFeasible: 312, serverRequired: 18 },
  audio:        { name: 'Audio',        description: 'MP3, WAV, FLAC, AAC and audio formats.',           formats: 22, writable: 19, readable: 22, browserFeasible: 198,serverRequired: 14 },
  video:        { name: 'Video',        description: 'MP4, MOV, MKV, WEBM and video formats.',           formats: 29, writable: 23, readable: 28, browserFeasible: 274,serverRequired: 38 },
  archives:     { name: 'Archives',     description: 'ZIP, TAR, 7Z and compressed formats.',             formats: 15, writable: 9,  readable: 15, browserFeasible: 89, serverRequired: 11 },
  cad:          { name: 'CAD',          description: 'DWG, DXF, STEP, STL, OBJ and CAD formats.',         formats: 18, writable: 16, readable: 18, browserFeasible: 12, serverRequired: 240 },
  ebooks:       { name: 'eBooks',       description: 'EPUB, MOBI, FB2 and reader formats.',              formats: 8,  writable: 3,  readable: 8,  browserFeasible: 6,  serverRequired: 18 },
  vectors:      { name: 'Vectors',      description: 'SVG, EPS, EMF and vector graphics formats.',       formats: 12, writable: 6,  readable: 11, browserFeasible: 42, serverRequired: 24 },
  fonts:        { name: 'Fonts',        description: 'TTF, OTF, WOFF, WOFF2 and font formats.',          formats: 9,  writable: 5,  readable: 9,  browserFeasible: 36, serverRequired: 4 },
  '3d':         { name: '3D Models',    description: 'GLTF, GLB, FBX, DAE and 3D model formats.',         formats: 11, writable: 10, readable: 11, browserFeasible: 78, serverRequired: 32 },
};

export const CATEGORY_LIST: Array<{ id: CategoryId; name: string; description: string; icon: string }> = (Object.keys(CATEGORY_META) as CategoryId[]).map(id => ({
  id,
  name: CATEGORY_META[id].name,
  description: CATEGORY_META[id].description,
  icon: iconForCategory(id),
}));

function iconForCategory(id: CategoryId): string {
  switch (id) {
    case 'documents': return 'file-text';
    case 'spreadsheets': return 'table';
    case 'presentations': return 'presentation';
    case 'images': return 'image';
    case 'audio': return 'volume-2';
    case 'video': return 'video';
    case 'archives': return 'archive';
    case 'cad': return 'box';
    case 'ebooks': return 'book-open';
    case 'vectors': return 'pen-tool';
    case 'fonts': return 'type';
    case '3d': return 'box';
  }
}

// ---- builders --------------------------------------------------------------
export function buildCategorySummary(cat: CategoryId, realConversions: FileConversion[]): CategorySummary {
  const meta = CATEGORY_META[cat];
  const rand = seeded(hashStr(`summary:${cat}`));
  const realCat = realConversions.filter(c => c.category?.toLowerCase() === cat);
  const realCount = realCat.length;
  // Layer: real count when present, else seeded deterministic value
  const totalConversions = realCount > 0 ? realCount : Math.floor(200 + rand() * 4800);
  const uniqueUsers = Math.floor(totalConversions / (1.2 + rand() * 1.8));
  return {
    id: cat,
    name: meta.name,
    description: meta.description,
    totalFormats: meta.formats,
    writableFormats: meta.writable,
    readableFormats: meta.readable,
    totalConversions,
    uniqueUsers,
    browserFeasiblePairs: meta.browserFeasible,
    serverRequiredPairs: meta.serverRequired,
    successRate: 92 + Math.floor(rand() * 7), // 92-98%
    avgTimeMs: Math.floor(800 + rand() * 4200),
    medianTimeMs: Math.floor(500 + rand() * 2800),
    p95TimeMs: Math.floor(3000 + rand() * 14000),
    totalBytesProcessed: totalConversions * Math.floor(180_000 + rand() * 1_400_000),
  };
}

export function buildPopularPairs(cat: CategoryId, count = 8): PopularPair[] {
  const meta = CATEGORY_META[cat];
  const rand = seeded(hashStr(`popular:${cat}`));
  const sources = pickFormatsForCategory(cat, 6, rand);
  const targets = pickFormatsForCategory(cat, 6, rand);
  const out: PopularPair[] = [];
  for (let i = 0; i < count; i++) {
    const src = sources[i % sources.length];
    const tgt = targets[(i * 3 + 1) % targets.length];
    if (src === tgt) continue;
    const browserFeasible = rand() > 0.55;
    out.push({
      source: src,
      target: tgt,
      count: Math.floor(40 + rand() * 1200),
      successRate: 90 + Math.floor(rand() * 9),
      avgTimeMs: Math.floor(600 + rand() * 3800),
      browserFeasible,
    });
  }
  return out.sort((a, b) => b.count - a.count).slice(0, count);
}

export function buildMatrix(cat: CategoryId): { sources: string[]; targets: string[]; cells: MatrixCell[] } {
  const meta = CATEGORY_META[cat];
  const rand = seeded(hashStr(`matrix:${cat}`));
  const sources = pickFormatsForCategory(cat, Math.min(meta.formats, 6), rand);
  const targets = pickFormatsForCategory(cat, Math.min(meta.formats, 6), rand);
  const cells: MatrixCell[] = [];
  sources.forEach(s => {
    targets.forEach(t => {
      if (s === t) return;
      cells.push({
        source: s,
        target: t,
        count: Math.floor(rand() * 800),
        browserFeasible: rand() > 0.45,
      });
    });
  });
  return { sources, targets, cells };
}

export function buildProcessingBreakdown(cat: CategoryId): ProcessingBreakdown {
  const meta = CATEGORY_META[cat];
  const total = meta.browserFeasible + meta.serverRequired;
  return {
    browserFeasible: Math.round((meta.browserFeasible / total) * 100),
    serverRequired: Math.round((meta.serverRequired / total) * 100),
    hybrid: Math.round((meta.browserFeasible / total) * 100) > 70 ? 8 : 15,
  };
}

export function buildUsageTimeline(cat: CategoryId, period: Period): TimePoint[] {
  const rand = seeded(hashStr(`timeline:${cat}:${period}`));
  const buckets = period === 'day' ? 24 : period === 'week' ? 7 : 30;
  const points: TimePoint[] = [];
  for (let i = 0; i < buckets; i++) {
    // Hourly peak around 14:00 for day, weekly peak around Wednesday for week
    let seasonal = 1;
    if (period === 'day') {
      const hour = i;
      seasonal = 0.4 + 0.6 * Math.exp(-Math.pow((hour - 14) / 4, 2));
    } else if (period === 'week') {
      const dayOfWeek = i;
      seasonal = 0.6 + 0.4 * Math.exp(-Math.pow((dayOfWeek - 3) / 2, 2));
    } else {
      const day = i;
      seasonal = 0.7 + 0.3 * Math.sin(day / 5);
    }
    const count = Math.floor((40 + rand() * 200) * seasonal);
    const bytes = count * Math.floor(180_000 + rand() * 800_000);
    const label = period === 'day'
      ? `${i.toString().padStart(2, '0')}:00`
      : period === 'week'
        ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]
        : `D${i + 1}`;
    points.push({ label, count, bytes });
  }
  return points;
}

export function buildAdvancedStats(cat: CategoryId, summary: CategorySummary): AdvancedStats {
  const rand = seeded(hashStr(`advanced:${cat}`));
  const formats = pickFormatsForCategory(cat, 5, rand);
  return {
    peakHour: '14:00',
    avgFileSizeBytes: Math.floor(summary.totalBytesProcessed / Math.max(1, summary.totalConversions)),
    errorRate: 100 - summary.successRate,
    queueWaitMs: Math.floor(120 + rand() * 480),
    coldStartMs: Math.floor(180 + rand() * 320),
    formatPopularity: formats.map(f => ({ format: f, delta: Math.floor((rand() - 0.4) * 80) })),
    retention7d: 64 + Math.floor(rand() * 18),
    retention30d: 38 + Math.floor(rand() * 22),
    geoTop: [
      { region: 'United States', share: 32 + Math.floor(rand() * 8) },
      { region: 'India',         share: 18 + Math.floor(rand() * 6) },
      { region: 'Germany',       share: 9 + Math.floor(rand() * 4) },
      { region: 'United Kingdom',share: 7 + Math.floor(rand() * 3) },
      { region: 'Brazil',        share: 5 + Math.floor(rand() * 3) },
    ],
  };
}

// ---- helpers ---------------------------------------------------------------
function pickFormatsForCategory(cat: CategoryId, n: number, rand: () => number): string[] {
  const sets: Record<CategoryId, string[]> = {
    documents:    ['PDF','DOCX','DOC','ODT','TXT','RTF','HTML','MD','EPUB','MOBI','JSON','XML','TEX'],
    spreadsheets: ['XLSX','XLS','ODS','CSV','TSV','DBF','FODS'],
    presentations:['PPTX','PPT','ODP','KEY','PDF'],
    images:       ['JPG','PNG','WEBP','GIF','BMP','TIFF','HEIC','AVIF','SVG','PSD','ICO'],
    audio:        ['MP3','WAV','FLAC','AAC','OGG','M4A','OPUS','WMA','AIFF','AMR'],
    video:        ['MP4','MOV','AVI','MKV','WEBM','FLV','WMV','MPEG','3GP','M4V','TS'],
    archives:     ['ZIP','TAR','7Z','GZ','BZ2','XZ','RAR','LZMA','CPIO'],
    cad:          ['STL','OBJ','STEP','STP','IGES','IGS','DWG','DXF','FBX','3DS','DAE','PLY','IFC','SKP','VSDX','CGM','SVGZ'],
    ebooks:       ['EPUB','MOBI','FB2','AZW3','LIT','PDF','TXT','HTML'],
    vectors:      ['SVG','EPS','EMF','WMF','ODG','PDF','AI','CDR','SK1'],
    fonts:        ['TTF','OTF','WOFF','WOFF2','EOT','SVG','DFONT'],
    '3d':         ['GLTF','GLB','FBX','OBJ','STL','PLY','DAE','3DS','X3D','WRL'],
  };
  const pool = sets[cat] || ['PDF','DOCX','JPG','PNG','MP4','ZIP','STL','OBJ','EPUB','SVG'];
  const shuffled = [...pool].sort(() => rand() - 0.5);
  return shuffled.slice(0, Math.min(n, pool.length));
}