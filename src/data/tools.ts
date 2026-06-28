export interface Tool {
  id: number;
  name: string;
  category: string;
  description: string;
  input: string;
  output: string;
  creditCost: number;
  popular?: boolean;
}

export interface Category {
  id: string;
  name: string;
  count: number;
  icon: string;
  color: string;
  accent: string;
  description: string;
}

export const CATEGORIES: Category[] = [
  {
    id: 'Documents',
    name: 'Documents',
    count: 30,
    icon: 'FileText',
    color: 'from-blue-500/20 to-indigo-500/10 hover:border-blue-500/30 text-blue-400',
    accent: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    description: 'Convert PDFs, Word docs, text files, and HTML.'
  },
  {
    id: 'Spreadsheets',
    name: 'Spreadsheets',
    count: 8,
    icon: 'Table',
    color: 'from-emerald-500/20 to-teal-500/10 hover:border-emerald-500/30 text-emerald-400',
    accent: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    description: 'Handle XLS, XLSX, ODS, and CSV data tables.'
  },
  {
    id: 'Presentations',
    name: 'Presentations',
    count: 8,
    icon: 'Presentation',
    color: 'from-amber-500/20 to-orange-500/10 hover:border-amber-500/30 text-amber-400',
    accent: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    description: 'Convert PowerPoint slides, Keynotes, and ODP files.'
  },
  {
    id: 'Images',
    name: 'Images',
    count: 22,
    icon: 'Image',
    color: 'from-purple-500/20 to-pink-500/10 hover:border-purple-500/30 text-purple-400',
    accent: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    description: 'JPG, PNG, WebP, GIF, HEIC conversion and compression.'
  },
  {
    id: 'Audio',
    name: 'Audio',
    count: 18,
    icon: 'Music',
    color: 'from-rose-500/20 to-red-500/10 hover:border-rose-500/30 text-rose-400',
    accent: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    description: 'Extract tracks, convert MP3, WAV, FLAC, and text-to-speech.'
  },
  {
    id: 'Video',
    name: 'Video',
    count: 20,
    icon: 'Video',
    color: 'from-violet-500/20 to-fuchsia-500/10 hover:border-violet-500/30 text-violet-400',
    accent: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    description: 'MP4, AVI, MKV conversion, video trimming, and recording.'
  },
  {
    id: 'Archives',
    name: 'Archives',
    count: 13,
    icon: 'Archive',
    color: 'from-yellow-500/20 to-amber-500/10 hover:border-yellow-500/30 text-yellow-400',
    accent: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    description: 'Extract and compress ZIP, RAR, 7Z formats.'
  },
  {
    id: 'Ebooks',
    name: 'Ebooks',
    count: 10,
    icon: 'BookOpen',
    color: 'from-cyan-500/20 to-sky-500/10 hover:border-cyan-500/30 text-cyan-400',
    accent: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    description: 'EPUB, MOBI, AZW3 file format adaptions for e-readers.'
  },
  {
    id: 'Fonts',
    name: 'Fonts',
    count: 9,
    icon: 'Type',
    color: 'from-indigo-500/20 to-blue-500/10 hover:border-indigo-500/30 text-indigo-400',
    accent: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    description: 'Convert TrueType (TTF), OpenType (OTF), and WOFF web fonts.'
  },
  {
    id: 'Vectors',
    name: 'Vectors',
    count: 11,
    icon: 'Cpu',
    color: 'from-emerald-500/20 to-green-500/10 hover:border-emerald-500/30 text-emerald-400',
    accent: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    description: 'Scalable vector art conversion including SVG, AI, EPS.'
  },
  {
    id: 'CAD',
    name: 'CAD',
    count: 21,
    icon: 'Compass',
    color: 'from-sky-500/20 to-teal-500/10 hover:border-sky-500/30 text-sky-400',
    accent: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    description: 'DWG, DXF, PDF, STEP, STL, SVG, viewer, and 3D model CAD tools.'
  }
];

export const TOOLS: Tool[] = [
  // --- Documents (30 Tools) ---
  { id: 1, name: 'PDF to Word', category: 'Documents', description: 'Convert PDF to editable Microsoft Word format', input: 'PDF', output: 'DOCX, DOC', creditCost: 4, popular: true },
  { id: 2, name: 'Word to PDF', category: 'Documents', description: 'Convert Word document to secure PDF format', input: 'DOCX, DOC, DOTX, DOTM', output: 'PDF', creditCost: 3, popular: true },
  { id: 3, name: 'PDF to Excel', category: 'Documents', description: 'Extract tables from PDF to spreadsheet', input: 'PDF', output: 'XLSX, XLS, CSV', creditCost: 4, popular: true },
  { id: 4, name: 'Excel to PDF', category: 'Documents', description: 'Convert spreadsheets to PDF', input: 'XLSX, XLS, ODS', output: 'PDF', creditCost: 3, popular: true },
  { id: 5, name: 'PDF to PowerPoint', category: 'Documents', description: 'Convert PDF slides to editable presentation slides', input: 'PDF', output: 'PPTX, PPT', creditCost: 4 },
  { id: 6, name: 'PowerPoint to PDF', category: 'Documents', description: 'Convert slide deck presentations to PDF', input: 'PPTX, PPT, PPSX, PPS', output: 'PDF', creditCost: 3, popular: true },
  { id: 7, name: 'PDF to Text', category: 'Documents', description: 'Extract clean plain text from PDF documents', input: 'PDF', output: 'TXT, RTF', creditCost: 2 },
  { id: 8, name: 'Text to PDF', category: 'Documents', description: 'Convert plain text into standard PDF document', input: 'TXT, RTF', output: 'PDF', creditCost: 2 },
  { id: 9, name: 'PDF to HTML', category: 'Documents', description: 'Convert PDF layout to static HTML code', input: 'PDF', output: 'HTML, HTM', creditCost: 4 },
  { id: 10, name: 'HTML to PDF', category: 'Documents', description: 'Save a live webpage or source HTML file to PDF', input: 'HTML, HTM, URL', output: 'PDF', creditCost: 4 },
  { id: 11, name: 'Word to OpenDocument', category: 'Documents', description: 'Word document to ODT format', input: 'DOCX, DOC', output: 'ODT', creditCost: 3 },
  { id: 12, name: 'OpenDocument to Word', category: 'Documents', description: 'ODT to Microsoft Word standard', input: 'ODT', output: 'DOCX, DOC', creditCost: 3 },
  { id: 13, name: 'DOC to DOCX', category: 'Documents', description: 'Upgrade legacy Word .DOC format to modern XML .DOCX', input: 'DOC, DOT', output: 'DOCX', creditCost: 1 },
  { id: 14, name: 'DOCX to DOC', category: 'Documents', description: 'Downgrade XML Word document for older word processors', input: 'DOCX, DOTX', output: 'DOC', creditCost: 1 },
  { id: 15, name: 'RTF to Word', category: 'Documents', description: 'Rich Text format to MS Word editable document', input: 'RTF', output: 'DOCX, DOC', creditCost: 2 },
  { id: 16, name: 'Word to RTF', category: 'Documents', description: 'Word document to Rich Text standard formatting', input: 'DOCX, DOC', output: 'RTF', creditCost: 2 },
  { id: 17, name: 'WPS to Word', category: 'Documents', description: 'Convert WPS office document to Word file', input: 'WPS, WPT', output: 'DOCX', creditCost: 3 },
  { id: 18, name: 'Word to WPS', category: 'Documents', description: 'Convert Word doc to WPS writer standard', input: 'DOCX, DOC', output: 'WPS', creditCost: 3 },
  { id: 19, name: 'Pages to Word', category: 'Documents', description: 'Apple Pages document to editable MS Word file', input: 'PAGES, KEYNOTE', output: 'DOCX', creditCost: 4 },
  { id: 20, name: 'Word to Pages', category: 'Documents', description: 'Word document to Apple Pages compatibility format', input: 'DOCX, DOC', output: 'PAGES', creditCost: 3 },
  { id: 21, name: 'ODT to Text', category: 'Documents', description: 'Extract text characters from OpenDocument text', input: 'ODT', output: 'TXT', creditCost: 2 },
  { id: 22, name: 'Text to ODT', category: 'Documents', description: 'Standard plain text to OpenDocument writer file', input: 'TXT', output: 'ODT', creditCost: 2 },
  { id: 23, name: 'XPS to PDF', category: 'Documents', description: 'Microsoft XML Paper Specification file to PDF', input: 'XPS, OXPS', output: 'PDF', creditCost: 3 },
  { id: 24, name: 'PDF to XPS', category: 'Documents', description: 'Standard PDF document to Microsoft XPS file', input: 'PDF', output: 'XPS', creditCost: 3 },
  { id: 25, name: 'DJVU to PDF', category: 'Documents', description: 'Convert compressed scanned DjVu document to PDF', input: 'DJVU, DJV', output: 'PDF', creditCost: 4 },
  { id: 26, name: 'Markdown to PDF', category: 'Documents', description: 'Format and render markdown markup file as PDF', input: 'MD, MARKDOWN', output: 'PDF', creditCost: 2, popular: true },
  { id: 27, name: 'Markdown to HTML', category: 'Documents', description: 'Parse and compile markdown text to HTML structure', input: 'MD, MARKDOWN', output: 'HTML', creditCost: 1 },
  { id: 28, name: 'Markdown to Word', category: 'Documents', description: 'Convert markdown formatting to a Word document', input: 'MD, MARKDOWN', output: 'DOCX', creditCost: 2 },
  { id: 29, name: 'CSV to Excel', category: 'Documents', description: 'Parse comma-separated file to structured XLSX file', input: 'CSV, TSV', output: 'XLSX, XLS', creditCost: 1 },
  { id: 30, name: 'Excel to CSV', category: 'Documents', description: 'Dump Excel worksheet rows to a comma-separated CSV', input: 'XLSX, XLS, ODS', output: 'CSV, TSV', creditCost: 1 },

  // --- Spreadsheets (8 Tools) ---
  { id: 31, name: 'Excel to OpenDocument', category: 'Spreadsheets', description: 'Convert Excel spreadsheet to ODS open format', input: 'XLSX, XLS', output: 'ODS', creditCost: 2 },
  { id: 32, name: 'OpenDocument to Excel', category: 'Spreadsheets', description: 'Convert ODS open sheet to MS Excel workbook', input: 'ODS', output: 'XLSX, XLS', creditCost: 2 },
  { id: 33, name: 'XLS to XLSX', category: 'Spreadsheets', description: 'Upgrade legacy binary XLS spreadsheet to modern open XML XLSX', input: 'XLS, XLT', output: 'XLSX', creditCost: 1 },
  { id: 34, name: 'XLSX to XLS', category: 'Spreadsheets', description: 'Convert modern XLSX spreadsheet back to XLS for backwards compatibility', input: 'XLSX, XLTX', output: 'XLS', creditCost: 1 },
  { id: 35, name: 'Spreadsheet to PDF', category: 'Spreadsheets', description: 'Render table layouts of a spreadsheet to PDF layout', input: 'XLSX, XLS, ODS, CSV', output: 'PDF', creditCost: 3 },
  { id: 36, name: 'PDF to Spreadsheet', category: 'Spreadsheets', description: 'Analyze structural rows/columns in PDF pages to export XLSX', input: 'PDF', output: 'XLSX, CSV', creditCost: 4 },
  { id: 37, name: 'Numbers to Excel', category: 'Spreadsheets', description: 'Apple Numbers spreadsheet to Microsoft Excel format', input: 'NUMBERS', output: 'XLSX', creditCost: 4 },
  { id: 38, name: 'Excel to Numbers', category: 'Spreadsheets', description: 'Excel spreadsheet into native Apple Numbers file', input: 'XLSX, XLS', output: 'NUMBERS', creditCost: 3 },

  // --- Presentations (8 Tools) ---
  { id: 39, name: 'PowerPoint to OpenDocument', category: 'Presentations', description: 'PPT slides to ODP open presentation', input: 'PPTX, PPT', output: 'ODP', creditCost: 2 },
  { id: 40, name: 'OpenDocument to PowerPoint', category: 'Presentations', description: 'ODP open presentation to MS PowerPoint deck', input: 'ODP', output: 'PPTX, PPT', creditCost: 2 },
  { id: 41, name: 'PPT to PPTX', category: 'Presentations', description: 'Upgrade legacy PPT slide deck to open xml PPTX format', input: 'PPT, PPS, POT', output: 'PPTX', creditCost: 1 },
  { id: 42, name: 'PPTX to PPT', category: 'Presentations', description: 'Downgrade modern PPTX presentation file to PPT binary format', input: 'PPTX, PPSX, POTX', output: 'PPT', creditCost: 1 },
  { id: 43, name: 'Keynote to PowerPoint', category: 'Presentations', description: 'Apple Keynote presentation slide deck to MS PowerPoint PPTX', input: 'KEY, KEYNOTE', output: 'PPTX', creditCost: 4 },
  { id: 44, name: 'PowerPoint to Keynote', category: 'Presentations', description: 'PowerPoint PPTX slide deck converted to Apple Keynote layout', input: 'PPTX, PPT', output: 'KEY', creditCost: 3 },
  { id: 45, name: 'Presentation to PDF', category: 'Presentations', description: 'Convert presentation slides to high contrast printable PDF', input: 'PPTX, PPT, ODP, KEY', output: 'PDF', creditCost: 3 },
  { id: 46, name: 'PDF to Presentation', category: 'Presentations', description: 'Extract pages of a PDF and align them into PPTX presentation slides', input: 'PDF', output: 'PPTX', creditCost: 4 },

  // --- Images (22 Tools) ---
  { id: 47, name: 'JPG to PNG', category: 'Images', description: 'Convert lossy JPG raster file to lossless alpha PNG format', input: 'JPG, JPEG', output: 'PNG', creditCost: 1, popular: true },
  { id: 48, name: 'PNG to JPG', category: 'Images', description: 'Convert high quality PNG to high compression standard JPEG', input: 'PNG', output: 'JPG, JPEG', creditCost: 1, popular: true },
  { id: 49, name: 'Image to WebP', category: 'Images', description: 'Convert classic images into web optimized Google WebP format', input: 'JPG, PNG, GIF, BMP, TIFF', output: 'WebP', creditCost: 1, popular: true },
  { id: 50, name: 'WebP to Image', category: 'Images', description: 'Export next-gen WebP images to standard PNG or JPEG raster formats', input: 'WebP', output: 'JPG, PNG, GIF', creditCost: 1 },
  { id: 51, name: 'Image to PDF', category: 'Images', description: 'Pack single or multiple uploaded raster/vector images into a PDF book', input: 'JPG, PNG, GIF, BMP, TIFF, WebP', output: 'PDF', creditCost: 2 },
  { id: 52, name: 'PDF to Image', category: 'Images', description: 'Convert pages of a PDF into high resolution standalone images', input: 'PDF', output: 'JPG, PNG, TIFF', creditCost: 3 },
  { id: 53, name: 'HEIC to JPG', category: 'Images', description: 'Convert Apple iOS standard HEIC photo format to standard web JPG', input: 'HEIC, HEIF', output: 'JPG, PNG', creditCost: 2, popular: true },
  { id: 54, name: 'RAW to JPG', category: 'Images', description: 'Compile high density professional camera RAW digital negatives to JPEG', input: 'CR2, NEF, ARW, DNG, ORF, RAF, PEF, RW2', output: 'JPG, PNG, TIFF', creditCost: 4 },
  { id: 55, name: 'SVG to PNG', category: 'Images', description: 'Rasterize scalable XML vectors (SVG) to specific width/height PNGs', input: 'SVG', output: 'PNG, JPG', creditCost: 2 },
  { id: 56, name: 'PNG to SVG', category: 'Images', description: 'Trace and vectorise pixel raster graphics into clean SVG vector path layouts', input: 'PNG, JPG, BMP', output: 'SVG', creditCost: 4 },
  { id: 57, name: 'BMP to PNG', category: 'Images', description: 'Convert uncompressed Windows bitmap files to standard PNG', input: 'BMP', output: 'PNG, JPG', creditCost: 1 },
  { id: 58, name: 'TIFF to JPG', category: 'Images', description: 'Convert multi-layer uncompressed TIFF layout to standard JPEG photo', input: 'TIFF, TIF', output: 'JPG, PNG', creditCost: 2 },
  { id: 59, name: 'GIF to MP4', category: 'Images', description: 'Transcode cyclic animated GIF to a highly compressed small MP4 stream', input: 'GIF', output: 'MP4, WebM', creditCost: 2 },
  { id: 60, name: 'Image to ICO', category: 'Images', description: 'Generate multi-resolution Windows executable program or favicon.ico icons', input: 'JPG, PNG, BMP', output: 'ICO', creditCost: 2 },
  { id: 61, name: 'ICO to Image', category: 'Images', description: 'Extract raster frames of an executable .ico file back to single images', input: 'ICO', output: 'PNG, JPG', creditCost: 2 },
  { id: 62, name: 'PSD to JPG', category: 'Images', description: 'Flatten and render Adobe Photoshop layer design layouts to flat JPG images', input: 'PSD', output: 'JPG, PNG', creditCost: 3 },
  { id: 63, name: 'Image to AVIF', category: 'Images', description: 'Upgrade images to ultra high compression AV1 standard image files', input: 'JPG, PNG, WebP', output: 'AVIF', creditCost: 2 },
  { id: 64, name: 'Image Resize', category: 'Images', description: 'Resize pixel dimensions of any image preserving ratio or stretching', input: 'JPG, PNG, GIF, WebP, BMP', output: 'Same', creditCost: 1, popular: true },
  { id: 65, name: 'Image Compress', category: 'Images', description: 'Significantly reduce byte size of images while retaining optical quality', input: 'JPG, PNG, WebP', output: 'Same', creditCost: 1, popular: true },
  { id: 66, name: 'Image Crop', category: 'Images', description: 'Trim borders or focus area of any photo', input: 'JPG, PNG, GIF, WebP', output: 'Same', creditCost: 1 },
  { id: 67, name: 'Image Rotate', category: 'Images', description: 'Rotate image angles by degrees or orientation tags', input: 'JPG, PNG, GIF, WebP', output: 'Same', creditCost: 1 },
  { id: 68, name: 'Image Flip', category: 'Images', description: 'Mirror image graphics horizontally or vertically', input: 'JPG, PNG, GIF, WebP', output: 'Same', creditCost: 1 },

  // --- Audio (18 Tools) ---
  { id: 69, name: 'MP3 to WAV', category: 'Audio', description: 'Decompress MP3 audio file into a raw uncompressed WAV audio stream', input: 'MP3', output: 'WAV', creditCost: 2, popular: true },
  { id: 70, name: 'WAV to MP3', category: 'Audio', description: 'Compress heavy raw WAV files into tiny 128/192/320kbps MP3 files', input: 'WAV', output: 'MP3', creditCost: 2, popular: true },
  { id: 71, name: 'Audio to MP3', category: 'Audio', description: 'Convert non-standard files to universal MP3 standard', input: 'AAC, FLAC, OGG, WMA, M4A, AIFF, AMR, Opus', output: 'MP3', creditCost: 2, popular: true },
  { id: 72, name: 'MP3 to AAC', category: 'Audio', description: 'MP3 to efficient AAC standard formatted for apple ecosystem', input: 'MP3', output: 'AAC, M4A', creditCost: 2 },
  { id: 73, name: 'FLAC to MP3', category: 'Audio', description: 'Extract and compress high-res lossless FLAC tracks into standard MP3s', input: 'FLAC', output: 'MP3, AAC', creditCost: 2 },
  { id: 74, name: 'WMA to MP3', category: 'Audio', description: 'Windows Media Audio to universal MP3 transcode', input: 'WMA', output: 'MP3', creditCost: 2 },
  { id: 75, name: 'OGG to MP3', category: 'Audio', description: 'Convert Ogg Vorbis stream tracks to standard MP3 stream', input: 'OGG, OGA', output: 'MP3', creditCost: 2 },
  { id: 76, name: 'M4A to MP3', category: 'Audio', description: 'Convert Apple AAC / ALAC encoded M4A tracks to standard MP3 audio', input: 'M4A, AAC', output: 'MP3', creditCost: 2 },
  { id: 77, name: 'Audio to WAV', category: 'Audio', description: 'Extract and save any source sound tracks into raw WAV', input: 'MP3, AAC, FLAC, OGG, M4A', output: 'WAV', creditCost: 2 },
  { id: 78, name: 'Audio to FLAC', category: 'Audio', description: 'Pack sound streams into audiophile lossless FLAC files', input: 'MP3, AAC, WAV, OGG', output: 'FLAC', creditCost: 3 },
  { id: 79, name: 'Audio to OGG', category: 'Audio', description: 'Convert source tracks to Ogg Vorbis web standard compression', input: 'MP3, AAC, WAV, FLAC', output: 'OGG', creditCost: 2 },
  { id: 80, name: 'Audio to M4A', category: 'Audio', description: 'Encode tracks into apple standard M4A files', input: 'MP3, WAV, FLAC, OGG', output: 'M4A, AAC', creditCost: 2 },
  { id: 81, name: 'Audio Compress', category: 'Audio', description: 'Reduce bitrates or sample rates of audio tracks to compress byte sizes', input: 'MP3, AAC, WAV, FLAC', output: 'MP3, AAC, OGG', creditCost: 2 },
  { id: 82, name: 'Audio Trim', category: 'Audio', description: 'Cut out desired parts, trim silence, or export specific loops', input: 'MP3, WAV, AAC, FLAC', output: 'Same', creditCost: 2 },
  { id: 83, name: 'Audio Merge', category: 'Audio', description: 'Stitch and glue separate audio files sequentially into one continuous track', input: 'MP3, WAV, AAC', output: 'MP3, WAV', creditCost: 3 },
  { id: 84, name: 'Audio Normalize', category: 'Audio', description: 'Balance volume peak levels and normalize amplitudes of audio clips', input: 'MP3, WAV, AAC, FLAC', output: 'Same', creditCost: 2 },
  { id: 85, name: 'Text to Speech', category: 'Audio', description: 'Convert text characters into high fidelity voice narration speech streams', input: 'TXT, PDF, DOCX', output: 'MP3, WAV', creditCost: 4, popular: true },
  { id: 86, name: 'Speech to Text', category: 'Audio', description: 'Transcribe and extract word characters from voice clips or recordings', input: 'MP3, WAV, M4A, FLAC', output: 'TXT, DOCX, SRT', creditCost: 6, popular: true },

  // --- Video (20 Tools) ---
  { id: 87, name: 'MP4 to AVI', category: 'Video', description: 'Transcode MP4 video files into legacy Microsoft AVI container', input: 'MP4, M4V', output: 'AVI', creditCost: 5 },
  { id: 88, name: 'AVI to MP4', category: 'Video', description: 'Convert raw heavy AVI files into universally optimized MP4 files', input: 'AVI', output: 'MP4, M4V', creditCost: 5, popular: true },
  { id: 89, name: 'Video to MP4', category: 'Video', description: 'Convert any raw or stream video to highly compatible H.264 MP4', input: 'AVI, MKV, MOV, WMV, FLV, WebM, 3GP, MTS', output: 'MP4', creditCost: 5, popular: true },
  { id: 90, name: 'MP4 to MKV', category: 'Video', description: 'Change video container structure from MP4 to open Matroska MKV', input: 'MP4, M4V', output: 'MKV', creditCost: 3 },
  { id: 91, name: 'Video to WebM', category: 'Video', description: 'Convert video structures to royalty-free HTML5 web optimized WebM format', input: 'MP4, AVI, MOV, MKV, FLV', output: 'WebM', creditCost: 4 },
  { id: 92, name: 'MOV to MP4', category: 'Video', description: 'Convert Apple QuickTime movie captures to standard compression MP4', input: 'MOV, QT', output: 'MP4', creditCost: 4, popular: true },
  { id: 93, name: 'WMV to MP4', category: 'Video', description: 'Convert Windows Media Video files into universal MP4 files', input: 'WMV, ASF', output: 'MP4', creditCost: 4 },
  { id: 94, name: 'FLV to MP4', category: 'Video', description: 'Convert legacy Adobe Flash videos to standard MP4 formats', input: 'FLV, F4V', output: 'MP4', creditCost: 4 },
  { id: 95, name: '3GP to MP4', category: 'Video', description: 'Upgrade legacy cellular 3G videos to modern compressed MP4 standard', input: '3GP, 3G2', output: 'MP4', creditCost: 4 },
  { id: 96, name: 'Video to AVI', category: 'Video', description: 'Convert various video file containers to standard AVI raw format', input: 'MP4, MKV, MOV, WMV', output: 'AVI', creditCost: 5 },
  { id: 97, name: 'MP4 to GIF', category: 'Video', description: 'Extract specific seconds of a video and export animated GIF loop files', input: 'MP4, AVI, MOV', output: 'GIF', creditCost: 3, popular: true },
  { id: 98, name: 'GIF to MP4', category: 'Video', description: 'Transcode basic image GIFs into true standard looping H264 MP4 videos', input: 'GIF', output: 'MP4, WebM', creditCost: 3 },
  { id: 99, name: 'Video Compress', category: 'Video', description: 'Reduce bitrates, dimensions, and byte density of heavy video clips', input: 'MP4, AVI, MKV, MOV, WMV', output: 'MP4', creditCost: 6 },
  { id: 100, name: 'Video Trim', category: 'Video', description: 'Cut out desired ranges of a video by defining start and end hours/secs', input: 'MP4, AVI, MKV, MOV', output: 'Same', creditCost: 4 },
  { id: 101, name: 'Video Merge', category: 'Video', description: 'Join separate uploaded video segments into one consecutive master clip', input: 'MP4, AVI, MOV, MKV', output: 'MP4', creditCost: 8 },
  { id: 102, name: 'Video to Audio', category: 'Video', description: 'Strip out the visual track completely and export the soundtrack as MP3/WAV', input: 'MP4, AVI, MKV, MOV, WMV, FLV', output: 'MP3, AAC, WAV', creditCost: 3, popular: true },
  { id: 103, name: 'Video Rotate', category: 'Video', description: 'Rotate video clips by 90, 180, or 270 degrees to adjust phone captures', input: 'MP4, AVI, MOV, MKV', output: 'Same', creditCost: 4 },
  { id: 104, name: 'Video Resize', category: 'Video', description: 'Crop or downscale video frame dimensions (e.g. 1080p to 720p or 480p)', input: 'MP4, AVI, MKV, MOV', output: 'Same', creditCost: 5 },
  { id: 105, name: 'Screen Recording to MP4', category: 'Video', description: 'Record browser screens or app windows directly and save as highly compressed MP4', input: 'MKV, WebM, AVI', output: 'MP4', creditCost: 8, popular: true },
  { id: 106, name: 'Video to MP3', category: 'Video', description: 'Extract video track sound streams directly into compressed MP3 format', input: 'MP4, AVI, MKV, MOV, FLV', output: 'MP3', creditCost: 3 },

  // --- Archives (13 Tools) ---
  { id: 107, name: 'ZIP Extractor', category: 'Archives', description: 'Extract folder hierarchies and unpacked files out of compressed ZIPs', input: 'ZIP', output: 'Extracted Files', creditCost: 2, popular: true },
  { id: 108, name: 'Create ZIP', category: 'Archives', description: 'Pack single or multiple files inside an optimized compressed ZIP archive', input: 'Any', output: 'ZIP', creditCost: 2, popular: true },
  { id: 109, name: 'RAR Extractor', category: 'Archives', description: 'Decompress WinRAR structured .RAR archives and extract folders', input: 'RAR', output: 'Extracted Files', creditCost: 3, popular: true },
  { id: 110, name: '7Z to ZIP', category: 'Archives', description: 'Convert compressed 7-Zip archives directly to standard ZIP formats', input: '7Z', output: 'ZIP', creditCost: 2 },
  { id: 111, name: 'ZIP to 7Z', category: 'Archives', description: 'Repack standard ZIP archives into high performance 7-Zip archives', input: 'ZIP', output: '7Z', creditCost: 2 },
  { id: 112, name: 'TAR Extractor', category: 'Archives', description: 'Extract consolidated UNIX tarballs (.tar, .tar.gz, .tgz) safely', input: 'TAR, TGZ, GZ', output: 'Extracted Files', creditCost: 3 },
  { id: 113, name: 'Create TAR', category: 'Archives', description: 'Consolidate file directories into standard UNIX tape archives', input: 'Any', output: 'TAR, GZ', creditCost: 3 },
  { id: 114, name: 'GZIP Compress', category: 'Archives', description: 'Compress standalone large files using Gzip compression', input: 'Any', output: 'GZ', creditCost: 2 },
  { id: 115, name: 'BZIP2 Compress', category: 'Archives', description: 'High density Bzip2 file compression', input: 'Any', output: 'BZ2', creditCost: 2 },
  { id: 116, name: 'XZ Compress', category: 'Archives', description: 'Compress files using modern ultra high density LZMA2 XZ standard', input: 'Any', output: 'XZ', creditCost: 3 },
  { id: 117, name: 'RAR to ZIP', category: 'Archives', description: 'Transcode proprietary RAR archives to open standard ZIP archives', input: 'RAR', output: 'ZIP', creditCost: 3 },
  { id: 118, name: 'DEB Extractor', category: 'Archives', description: 'Extract files from Debian packages', input: 'DEB', output: 'Extracted Files', creditCost: 4 },
  { id: 119, name: 'RPM Extractor', category: 'Archives', description: 'Extract files from Red Hat RPM packages', input: 'RPM', output: 'Extracted Files', creditCost: 4 },

  // --- Ebooks (10 Tools) ---
  { id: 120, name: 'EPUB to MOBI', category: 'Ebooks', description: 'Convert standard open EPUB e-books to Amazon Kindle MOBI files', input: 'EPUB', output: 'MOBI, AZW3', creditCost: 3, popular: true },
  { id: 121, name: 'MOBI to EPUB', category: 'Ebooks', description: 'Convert Amazon Kindle formatted books back to open standard EPUB', input: 'MOBI, AZW3', output: 'EPUB', creditCost: 3 },
  { id: 122, name: 'EPUB to PDF', category: 'Ebooks', description: 'Compile flowable EPUB book chapters into fixed-layout printable PDFs', input: 'EPUB', output: 'PDF', creditCost: 3, popular: true },
  { id: 123, name: 'PDF to EPUB', category: 'Ebooks', description: 'Reflow static layout text blocks of PDF pages into readable EPUB structures', input: 'PDF', output: 'EPUB', creditCost: 4 },
  { id: 124, name: 'AZW3 to EPUB', category: 'Ebooks', description: 'Kindle KF8 format books into standard open EPUB format', input: 'AZW3', output: 'EPUB', creditCost: 3 },
  { id: 125, name: 'EPUB to AZW3', category: 'Ebooks', description: 'Convert standard EPUB ebooks to Kindle Format 8 compatible files', input: 'EPUB', output: 'AZW3', creditCost: 3 },
  { id: 126, name: 'FB2 to EPUB', category: 'Ebooks', description: 'Convert FictionBook XML ebook format into standard open EPUB', input: 'FB2', output: 'EPUB, MOBI', creditCost: 3 },
  { id: 127, name: 'PDF to MOBI', category: 'Ebooks', description: 'Reflow static PDF text paragraphs into Kindle MOBI formats', input: 'PDF', output: 'MOBI, AZW3', creditCost: 3 },
  { id: 128, name: 'Ebook Compress', category: 'Ebooks', description: 'Optimize and reduce size of images inside ebooks', input: 'EPUB, MOBI, AZW3, PDF', output: 'Same', creditCost: 2 },
  { id: 129, name: 'Ebook Merge', category: 'Ebooks', description: 'Consolidate multiple separate chapters or small ebooks into one book', input: 'EPUB, MOBI', output: 'EPUB, MOBI', creditCost: 4 },

  // --- Fonts (9 Tools) ---
  { id: 130, name: 'TTF to OTF', category: 'Fonts', description: 'Convert legacy TrueType vector outlines to modern OpenType standards', input: 'TTF', output: 'OTF', creditCost: 3 },
  { id: 131, name: 'OTF to TTF', category: 'Fonts', description: 'Convert high density OpenType vector fonts to backwards compatible TrueType standard', input: 'OTF', output: 'TTF', creditCost: 3 },
  { id: 132, name: 'Font to WOFF', category: 'Fonts', description: 'Convert offline vector fonts (TTF/OTF) to compressed WOFF web fonts', input: 'TTF, OTF', output: 'WOFF, WOFF2', creditCost: 3, popular: true },
  { id: 133, name: 'Font to WOFF2', category: 'Fonts', description: 'Convert fonts to next-gen ultra compressed WOFF2 web standard', input: 'TTF, OTF, WOFF', output: 'WOFF2', creditCost: 3, popular: true },
  { id: 134, name: 'WOFF to TTF', category: 'Fonts', description: 'Decompress compressed WOFF/WOFF2 web fonts back into vector TrueType fonts', input: 'WOFF, WOFF2', output: 'TTF', creditCost: 3 },
  { id: 135, name: 'Font to EOT', category: 'Fonts', description: 'Generate legacy Embedded OpenType fonts for old Internet Explorer support', input: 'TTF, OTF', output: 'EOT', creditCost: 3 },
  { id: 136, name: 'PostScript to OTF', category: 'Fonts', description: 'Convert older Adobe Type 1 PostScript outlines to OpenType', input: 'PFA, PFB', output: 'OTF', creditCost: 4 },
  { id: 137, name: 'CFF to OTF', category: 'Fonts', description: 'Convert Compact Font Format outlines to complete OpenType', input: 'CFF', output: 'OTF', creditCost: 4 },
  { id: 138, name: 'DFONT to TTF', category: 'Fonts', description: 'Extract standard vector TrueType font files from legacy Mac OS DFONT data forks', input: 'DFONT', output: 'TTF', creditCost: 4 },

  // --- Vectors (11 Tools) ---
  { id: 139, name: 'AI to SVG', category: 'Vectors', description: 'Convert Adobe Illustrator layouts into browser native scaleable SVG xml', input: 'AI', output: 'SVG', creditCost: 4, popular: true },
  { id: 140, name: 'SVG to AI', category: 'Vectors', description: 'Convert open SVG vectors to native Adobe Illustrator artwork', input: 'SVG', output: 'AI, EPS', creditCost: 4 },
  { id: 141, name: 'EPS to SVG', category: 'Vectors', description: 'Convert encapsulated PostScript artwork to responsive XML SVG vectors', input: 'EPS', output: 'SVG', creditCost: 3, popular: true },
  { id: 142, name: 'SVG to EPS', category: 'Vectors', description: 'Export SVG vector outlines into postscript vector print layouts', input: 'SVG', output: 'EPS', creditCost: 3 },
  { id: 143, name: 'CDR to SVG', category: 'Vectors', description: 'Convert CorelDRAW graphics designs into open scaleable vectors', input: 'CDR', output: 'SVG, AI', creditCost: 4 },
  { id: 144, name: 'EMF to SVG', category: 'Vectors', description: 'Convert Windows Enhanced Metafile graphics to standard SVG outlines', input: 'EMF, WMF', output: 'SVG', creditCost: 3 },
  { id: 145, name: 'SVG to EMF', category: 'Vectors', description: 'Convert SVG vector outlines to Windows Enhanced Metafile standard', input: 'SVG', output: 'EMF, WMF', creditCost: 3 },
  { id: 146, name: 'AI to PDF', category: 'Vectors', description: 'Convert Adobe Illustrator vector projects to multi-layer PDF vectors', input: 'AI', output: 'PDF', creditCost: 4 },
  { id: 147, name: 'PDF to SVG', category: 'Vectors', description: 'Analyze PDF layouts and extract editable vector lines and paths', input: 'PDF', output: 'SVG', creditCost: 4, popular: true },
  { id: 148, name: 'SVG to PNG', category: 'Vectors', description: 'Convert vector SVG coordinates to solid pixel PNG or JPG frames', input: 'SVG', output: 'PNG, JPG', creditCost: 2 },
  { id: 149, name: 'PLT to SVG', category: 'Vectors', description: 'Convert HPGL Hewlett-Packard plotter files into scaleable vectors', input: 'PLT, HPGL', output: 'SVG', creditCost: 4 },

  // --- CAD (21 Tools, ordered by research popularity) ---
  { id: 150, name: 'DWG to DXF', category: 'CAD', description: 'Convert AutoCAD DWG drawings to interoperable DXF exchange files', input: 'DWG', output: 'DXF', creditCost: 5, popular: true },
  { id: 153, name: 'DXF to DWG', category: 'CAD', description: 'Convert DXF exchange files back to standard AutoCAD DWG archives', input: 'DXF', output: 'DWG', creditCost: 5, popular: true },
  { id: 151, name: 'DWG to PDF', category: 'CAD', description: 'Render DWG and DXF CAD drawings as shareable vector PDF files', input: 'DWG, DXF', output: 'PDF', creditCost: 5, popular: true },
  { id: 224, name: 'CAD File Viewer', category: 'CAD', description: 'Preview CAD drawings and 3D model files online before converting', input: 'DWG, DXF, STEP, STL', output: 'Web preview', creditCost: 2, popular: true },
  { id: 217, name: 'PDF to DWG', category: 'CAD', description: 'Convert PDF drawing references into editable DWG or DXF CAD formats', input: 'PDF', output: 'DWG, DXF', creditCost: 6, popular: true },
  { id: 152, name: 'STEP to STL', category: 'CAD', description: 'Convert STEP and STP engineering solid models to 3D printable STL meshes', input: 'STEP, STP', output: 'STL', creditCost: 6, popular: true },
  { id: 223, name: 'DWG Version Converter', category: 'CAD', description: 'Convert DWG files between AutoCAD version targets for compatibility', input: 'DWG', output: 'DWG', creditCost: 4, popular: true },
  { id: 225, name: 'OBJ to STL', category: 'CAD', description: 'Convert Wavefront OBJ models to 3D printing ready STL meshes', input: 'OBJ', output: 'STL', creditCost: 4, popular: true },
  { id: 228, name: '3D Model Converter', category: 'CAD', description: 'Convert common 3D model formats for design, printing, and visualization', input: 'OBJ, FBX, STL, STEP, DAE', output: 'OBJ, FBX, STL, STEP, DAE', creditCost: 6, popular: true },
  { id: 219, name: 'STL to STEP', category: 'CAD', description: 'Convert 3D printing STL meshes back into STEP CAD interchange files', input: 'STL', output: 'STEP', creditCost: 6 },
  { id: 220, name: 'IGES to STL', category: 'CAD', description: 'Convert IGES and IGS CAD models to STL files for 3D printing workflows', input: 'IGES, IGS', output: 'STL', creditCost: 6 },
  { id: 221, name: 'DWG to SVG', category: 'CAD', description: 'Convert DWG or DXF drawings to scalable SVG vector graphics', input: 'DWG, DXF', output: 'SVG', creditCost: 4 },
  { id: 222, name: 'DXF to SVG', category: 'CAD', description: 'Convert DXF drawings to browser-friendly scalable SVG vectors', input: 'DXF', output: 'SVG', creditCost: 4 },
  { id: 155, name: 'STL to OBJ', category: 'CAD', description: 'Convert STL rapid-prototyping triangles to standard textured OBJ meshes', input: 'STL', output: 'OBJ', creditCost: 4 },
  { id: 227, name: 'FBX to OBJ', category: 'CAD', description: 'Convert Autodesk FBX 3D assets into Wavefront OBJ model files', input: 'FBX', output: 'OBJ', creditCost: 5 },
  { id: 229, name: 'CAD Drawing Compress', category: 'CAD', description: 'Reduce DWG and DXF drawing file sizes while preserving structure', input: 'DWG, DXF', output: 'DWG, DXF', creditCost: 3 },
  { id: 230, name: 'CAD Layer Extractor', category: 'CAD', description: 'Export selected layers from DWG or DXF drawings to CAD or PDF outputs', input: 'DWG, DXF', output: 'DWG, DXF, PDF', creditCost: 5 },
  { id: 154, name: 'IGES to STEP', category: 'CAD', description: 'Convert legacy IGES files to modern standard STEP mechanical solid models', input: 'IGES, IGS', output: 'STEP', creditCost: 6 },
  { id: 156, name: 'DWG to Image', category: 'CAD', description: 'Render blueprint CAD documents as high resolution viewable JPG/PNGs', input: 'DWG', output: 'PNG, JPG', creditCost: 4 },
  { id: 157, name: '3DS to OBJ', category: 'CAD', description: 'Convert legacy 3D Studio Max files into standard Wavefront OBJ models', input: '3DS', output: 'OBJ', creditCost: 5 },
  { id: 158, name: 'CAD Compress', category: 'CAD', description: 'Optimize vertices, compact coordinate indices, and reduce 3D mesh files', input: 'STEP, STL, OBJ, DWG', output: 'Same', creditCost: 4 }
];
