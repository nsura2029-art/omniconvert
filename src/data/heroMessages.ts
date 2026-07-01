/* ============================================================================
 * heroMessages.ts — Dynamic headline/subheadline + Converting chip data,
 *                   keyed by picked-file extension.
 *
 * The home page's hero swaps into a tool-specific message the moment a
 * user picks a file. `DynamicHeroText` looks up the message here via
 * `getHeroMessage(fileName)` which dispatches through `ROUTER` (an ordered
 * list of RegExp → key pairs, first match wins).
 *
 * ── Why ordering matters ──────────────────────────────────────────────────
 *   *.svg  matches BOTH `image` and `xml` (SVG is XML). Listing `.svg`
 *   routes to image before the XML catch-all, so it goes to image.
 *   Same idea: `xml` is listed AFTER `image` so SVG never reaches it.
 *   *.epub / .mobi / .azw*    → ebook (overlaps with archive)
 *   *.csv                    → csv (overlaps with excel — csv wins because
 *                              users mean spreadsheet, not generic XML)
 *   *.md                     → markdown (overlaps with nothing but listed
 *                              for clarity)
 *
 * ── Why not just lazy-eval the description? ──────────────────────────────
 *   We hand-pick the headline so it reads like a tool-specific landing
 *   page rather than a generic format blurb. Marketing copy lives here,
 *   not in code logic.
 * ========================================================================== */

export type HeroMessageKey =
  | 'default'
  | 'pdf'
  | 'word'
  | 'excel'
  | 'powerpoint'
  | 'image'
  | 'audio'
  | 'video'
  | 'archive'
  | 'ebook'
  | 'font'
  | 'cad'
  | 'csv'
  | 'json'
  | 'xml'
  | 'markdown';

export interface HeroMessage {
  key: HeroMessageKey;
  /** Short label, used for the SEO keywords tag + fallback */
  label: string;
  /** Brand-color portion of the H1 ("DXF to STEP") */
  headlineFrom: string;
  /** Pill portion of the H1 ("Converter") */
  headlinePill: string;
  /** H1 sub-headline (one short line) */
  subheadline: string;
  /** Long-form description used in the <meta> tag */
  description: string;
  /** Format chip ("Converting PDF → DOCX, DOC") */
  convertingChip: { from: string; to: string };
  /** Drop-zone accepted hint ("Supports PDF CAD files.") */
  acceptedHint: string;
  /** Optional emoji shown in the static header chip */
  emoji?: string;
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  The 16 messages                                                          */
/* ────────────────────────────────────────────────────────────────────────── */

const MESSAGES: Record<HeroMessageKey, HeroMessage> = {
  default: {
    key: 'default',
    label: 'Any Format',
    headlineFrom: 'Any Format',
    headlinePill: 'Converter',
    subheadline: 'Convert your files to any format — browser-based, no signup.',
    description:
      'Pick any file from your computer, the cloud, or a URL. Convert it to a clean target format in seconds. OmniConvert supports 100+ file formats across documents, images, audio, video, archives, and CAD.',
    convertingChip: { from: 'any format', to: 'PDF, DOCX, DWG, DXF…' },
    acceptedHint: 'PDF, DOCX, XLSX, PPTX, PNG, JPG, MP4, ZIP, …',
    emoji: '🚀',
  },
  pdf: {
    key: 'pdf',
    label: 'PDF',
    headlineFrom: 'PDF',
    headlinePill: 'Converter',
    subheadline: 'Convert your PDF files to editable documents and clean formats.',
    description:
      'Convert PDF to Word, Excel, PowerPoint, JPG, PNG, text, and more. Browser-based, no upload, no signup. Maintain formatting fidelity across every conversion.',
    convertingChip: { from: 'PDF', to: 'DOCX, XLSX, PPTX, JPG, PNG, TXT' },
    acceptedHint: 'PDF documents up to 1 GB.',
    emoji: '📄',
  },
  word: {
    key: 'word',
    label: 'Word Documents',
    headlineFrom: 'Word',
    headlinePill: 'Converter',
    subheadline: 'Convert Microsoft Word and rich-text documents to any format.',
    description:
      'Convert DOCX, DOC, RTF, WPS, and ODT to PDF, EPUB, HTML, Markdown, or plain text. Preserves styles, headings, and tables. Browser-based, no signup.',
    convertingChip: { from: 'DOCX, DOC, RTF', to: 'PDF, EPUB, MD, TXT, HTML' },
    acceptedHint: 'Word documents, RTF, WPS, ODT.',
    emoji: '📝',
  },
  excel: {
    key: 'excel',
    label: 'Spreadsheets',
    headlineFrom: 'Excel',
    headlinePill: 'Converter',
    subheadline: 'Convert spreadsheets between Excel, CSV, ODS, and PDF.',
    description:
      'Convert XLSX, XLS, CSV, and ODS to PDF, CSV, JSON, TSV, or HTML. Preserves formulas and tables. Browser-based batch conversion for accountants and analysts.',
    convertingChip: { from: 'XLSX, XLS, CSV', to: 'PDF, CSV, JSON, HTML' },
    acceptedHint: 'Spreadsheets up to 1 GB.',
    emoji: '📊',
  },
  powerpoint: {
    key: 'powerpoint',
    label: 'Presentations',
    headlineFrom: 'PowerPoint',
    headlinePill: 'Converter',
    subheadline: 'Convert slide decks to PDF, image slides, or video.',
    description:
      'Convert PowerPoint PPT and PPTX presentations to PDF, JPG, PNG, MP4 for free. Browser-based, no signup. Share-ready presentations in seconds.',
    convertingChip: { from: 'PPTX, PPT, ODP', to: 'PDF, JPG, PNG, MP4' },
    acceptedHint: 'PPTX, PPT, PPSX, PPS, ODP, KEY.',
    emoji: '🎞️',
  },
  image: {
    key: 'image',
    label: 'Images',
    headlineFrom: 'Image',
    headlinePill: 'Converter',
    subheadline: 'Convert, resize, and optimize images between any standard format.',
    description:
      'Convert PNG, JPG, WebP, TIFF, GIF, AVIF, HEIC, SVG, BMP, and more. Resize, compress, and strip metadata. Browser-based image processing for designers and creators.',
    convertingChip: { from: 'PNG, JPG, WebP', to: 'PDF, SVG, ICO, AVIF' },
    acceptedHint: 'Images up to 50 MB each.',
    emoji: '🖼️',
  },
  audio: {
    key: 'audio',
    label: 'Audio',
    headlineFrom: 'Audio',
    headlinePill: 'Converter',
    subheadline: 'Convert audio files between MP3, WAV, AAC, FLAC, and more.',
    description:
      'Convert MP3, WAV, AAC, FLAC, M4A, OGG, and Opus. Re-encode, normalize, or extract audio from video. Browser-based audio transcoding.',
    convertingChip: { from: 'MP3, WAV, AAC', to: 'FLAC, M4A, OGG, Opus' },
    acceptedHint: 'Audio up to 500 MB.',
    emoji: '🎵',
  },
  video: {
    key: 'video',
    label: 'Video',
    headlineFrom: 'Video',
    headlinePill: 'Converter',
    subheadline: 'Convert videos between MP4, MOV, AVI, WebM, MKV, and more.',
    description:
      'Convert MP4, MOV, AVI, MKV, WebM, M4V, WMV, and FLV. Compress for web, strip metadata, or extract audio. Browser-based video processing for editors.',
    convertingChip: { from: 'MP4, MOV, AVI', to: 'WebM, MKV, GIF, MP3' },
    acceptedHint: 'Videos up to 1 GB.',
    emoji: '🎬',
  },
  archive: {
    key: 'archive',
    label: 'Archives',
    headlineFrom: 'Archive',
    headlinePill: 'Converter',
    subheadline: 'Convert between ZIP, RAR, 7Z, TAR, GZ, and other archive formats.',
    description:
      'Convert ZIP, RAR, 7Z, TAR, GZ, and TGZ. Repackage or compress archives without extracting. Browser-based archive conversion.',
    convertingChip: { from: 'ZIP, RAR, 7Z', to: 'TAR, GZ, TGZ' },
    acceptedHint: 'Archive files up to 1 GB.',
    emoji: '🗜️',
  },
  ebook: {
    key: 'ebook',
    label: 'eBooks',
    headlineFrom: 'eBook',
    headlinePill: 'Converter',
    subheadline: 'Convert EPUB, MOBI, AZW, and FB2 to PDF and other reading formats.',
    description:
      'Convert EPUB, MOBI, AZW3, FB2, and LIT to PDF, EPUB, or MOBI. Reshape your library for any device. Browser-based eBook transcoding.',
    convertingChip: { from: 'EPUB, MOBI, AZW3', to: 'PDF, EPUB, MOBI' },
    acceptedHint: 'eBook files up to 200 MB.',
    emoji: '📚',
  },
  font: {
    key: 'font',
    label: 'Fonts',
    headlineFrom: 'Font',
    headlinePill: 'Converter',
    subheadline: 'Convert between TTF, OTF, WOFF, WOFF2, and EOT font formats.',
    description:
      'Convert TTF, OTF, WOFF, WOFF2, and EOT. Repackage fonts for web, desktop, or iOS. Browser-based font conversion for designers and developers.',
    convertingChip: { from: 'TTF, OTF', to: 'WOFF, WOFF2, EOT' },
    acceptedHint: 'Font files up to 50 MB.',
    emoji: '🔤',
  },
  cad: {
    key: 'cad',
    label: 'CAD & 3D',
    headlineFrom: 'CAD',
    headlinePill: 'Converter',
    subheadline: 'Convert DWG, DXF, STEP, STL, OBJ, and other engineering formats.',
    description:
      'Convert DWG, DXF, STEP, IGES, STL, OBJ, 3MF, 3DS, and SLDPRT. Engineering-grade CAD transcoding. Browser-based for fast iteration on drawings, meshes, and assemblies.',
    convertingChip: { from: 'DWG, DXF, STEP', to: 'STL, OBJ, DXF, DWG' },
    acceptedHint: 'PDF CAD files.',
    emoji: '📐',
  },
  csv: {
    key: 'csv',
    label: 'CSV',
    headlineFrom: 'CSV',
    headlinePill: 'Converter',
    subheadline: 'Convert CSV to Excel, JSON, PDF, or HTML.',
    description:
      'Convert CSV to XLSX, JSON, PDF, HTML, or TSV. Delimiter-aware, header-aware. Browser-based data import/export for engineers and analysts.',
    convertingChip: { from: 'CSV', to: 'XLSX, JSON, PDF' },
    acceptedHint: 'CSV files up to 200 MB.',
    emoji: '📑',
  },
  json: {
    key: 'json',
    label: 'JSON & Data',
    headlineFrom: 'JSON',
    headlinePill: 'Converter',
    subheadline: 'Convert JSON, YAML, and TOML between data interchange formats.',
    description:
      'Convert JSON, YAML, TOML, and CSV. Pretty-print, minify, or validate. Browser-based data interchange for developers and API builders.',
    convertingChip: { from: 'JSON, YAML', to: 'TOML, CSV, XML' },
    acceptedHint: 'JSON, YAML, TOML.',
    emoji: '🧩',
  },
  xml: {
    key: 'xml',
    label: 'XML',
    headlineFrom: 'XML',
    headlinePill: 'Converter',
    subheadline: 'Convert XML and XHTML to JSON, HTML, or text.',
    description:
      'Convert XML and XHTML to JSON, CSV, HTML, or plain text. Validate against schema, strip namespaces, prettify. Browser-based XML processing.',
    convertingChip: { from: 'XML, XHTML', to: 'JSON, CSV, HTML' },
    acceptedHint: 'XML, XHTML, SVG.',
    emoji: '📰',
  },
  markdown: {
    key: 'markdown',
    label: 'Markdown',
    headlineFrom: 'Markdown',
    headlinePill: 'Converter',
    subheadline: 'Convert Markdown to HTML, PDF, EPUB, or rich text.',
    description:
      'Convert Markdown MD files to HTML, PDF, EPUB, DOCX, or RTF. Preserve code fences, tables, and front-matter. Browser-based for documentation teams.',
    convertingChip: { from: 'MD, Markdown', to: 'HTML, PDF, EPUB' },
    acceptedHint: 'Markdown files up to 50 MB.',
    emoji: '✍️',
  },
};

/* ────────────────────────────────────────────────────────────────────────── */
/*  Extension router                                                         */
/*                                                                            */
/*  Each entry: [RegExp, HeroMessageKey]. First match wins.                   */
/*  Order matters — see header comment for collision handling.                */
/* ────────────────────────────────────────────────────────────────────────── */

const ROUTER: ReadonlyArray<[RegExp, HeroMessageKey]> = [
  // Document family
  [/\.pdf$/i,                                       'pdf'],
  [/\.(docx?|dotx?|dotm?|rtf|wps|wpt|odt)$/i,       'word'],
  [/\.(xlsx?|xlsm?|xlsb?|ods)$/i,                   'excel'],
  [/\.csv$/i,                                       'csv'],    // before excel so .csv never reaches .xlsx?
  [/\.(pptx?|ppt|ppsx?|pps|odp|key)$/i,             'powerpoint'],

  // Media
  [/\.(svgz?)$/i,                                   'image'],  // SVG before XML
  [/\.(png|jpe?g|gif|webp|bmp|tiff?|heic|avif|ico)$/i, 'image'],
  [/\.(mp3|wav|aac|flac|m4a|ogg|opus)$/i,           'audio'],
  [/\.(mp4|mov|avi|mkv|webm|m4v|wmv|flv)$/i,        'video'],

  // Archives / eBooks
  [/\.(zip|rar|7z|tar|gz|tgz)$/i,                   'archive'],
  [/\.(epub|mobi|azw3?|fb2|lit)$/i,                 'ebook'],

  // Specialty
  [/\.(ttf|otf|woff2?|eot)$/i,                      'font'],
  [/\.(dwg|dxf|step|stp|iges|igs|stl|obj|3mf|3ds|sldprt|sldasm)$/i, 'cad'],

  // Data / Markup
  [/\.(md|markdown)$/i,                             'markdown'],
  [/\.(json|toml|ya?ml)$/i,                         'json'],
  [/\.(xml|xhtml|rss|atom)$/i,                      'xml'],
];

/**
 * Resolve a hero message key from a file name (or full path). Falls back
 * to `default` when no rule matches. Pure function, safe to call per render.
 */
export function getHeroMessageKey(fileName: string | null | undefined): HeroMessageKey {
  if (!fileName) return 'default';
  for (const [re, key] of ROUTER) {
    if (re.test(fileName)) return key;
  }
  return 'default';
}

/**
 * Resolve a full hero message object for the given file name.
 */
export function getHeroMessage(fileName: string | null | undefined): HeroMessage {
  return MESSAGES[getHeroMessageKey(fileName)];
}

/**
 * Pick a sensible default target extension given a file's input format.
 * Used by the per-row "TO STEP ▼" dropdown to bias the first option to
 * what the user most likely wants.
 */
export function suggestOutputExtension(inputLabel: string): string {
  const u = inputLabel.toUpperCase();
  if (u.includes('PDF'))   return 'DOCX';
  if (u.includes('DOC'))   return 'PDF';
  if (u.includes('XLS'))   return 'PDF';
  if (u.includes('PPT'))   return 'PDF';
  if (u.includes('PNG') || u.includes('JPG') || u.includes('WEBP')) return 'JPG';
  if (u.includes('SVG'))   return 'PNG';
  if (u.includes('MP4') || u.includes('MOV')) return 'MP3';
  if (u.includes('MP3') || u.includes('WAV')) return 'MP3';
  if (u.includes('DWG'))   return 'DXF';
  if (u.includes('DXF'))   return 'DWG';
  if (u.includes('STEP') || u.includes('STP')) return 'STL';
  if (u.includes('IGES') || u.includes('IGS')) return 'STEP';
  if (u.includes('STL'))   return 'STEP';
  if (u.includes('OBJ'))   return 'STL';
  if (u.includes('EPUB'))  return 'PDF';
  if (u.includes('ZIP'))   return 'TAR.GZ';
  if (u.includes('MD') || u.includes('MARKDOWN')) return 'HTML';
  return 'PDF';
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Output catalog for the per-row TO [STEP ▾] dropdown                      */
/*                                                                            */
/*  Each entry is "this category, this format list". The UI renders tabs       */
/*  for the categories and chips for the formats.                            */
/* ────────────────────────────────────────────────────────────────────────── */

export interface OutputOption {
  /** Tab/category label (CAD, Documents, Image, …) */
  category: string;
  /** Format extensions exposed in this tab */
  extensions: string[];
}

export const OUTPUT_CATALOG: ReadonlyArray<OutputOption> = [
  { category: 'Documents',  extensions: ['PDF', 'DOCX', 'TXT', 'RTF', 'ODT', 'HTML', 'MD'] },
  { category: 'Spreadsheets', extensions: ['XLSX', 'CSV', 'ODS', 'JSON', 'TSV'] },
  { category: 'Presentations', extensions: ['PPTX', 'PDF', 'PNG', 'JPG', 'MP4'] },
  { category: 'Image',      extensions: ['PNG', 'JPG', 'WEBP', 'GIF', 'BMP', 'TIFF', 'AVIF', 'SVG', 'ICO', 'PDF'] },
  { category: 'Audio',      extensions: ['MP3', 'WAV', 'AAC', 'FLAC', 'M4A', 'OGG', 'OPUS'] },
  { category: 'Video',      extensions: ['MP4', 'MOV', 'AVI', 'MKV', 'WEBM', 'GIF', 'MP3'] },
  { category: 'Archive',    extensions: ['ZIP', 'TAR', 'GZ', 'TGZ', '7Z'] },
  { category: 'eBook',      extensions: ['EPUB', 'PDF', 'MOBI', 'AZW3'] },
  { category: 'Font',       extensions: ['TTF', 'OTF', 'WOFF', 'WOFF2', 'EOT'] },
  { category: 'CAD',        extensions: ['DWG', 'DXF', 'STEP', 'STL', 'OBJ', 'IGES', '3MF', '3DS'] },
  { category: 'Data',       extensions: ['JSON', 'YAML', 'TOML', 'CSV', 'XML'] },
  { category: 'Web',        extensions: ['HTML', 'HTM', 'XHTML', 'PDF', 'MD'] },
];
