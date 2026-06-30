import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Upload, File, Sparkles, CheckCircle2, AlertTriangle, Play, Loader2, Download, Eye, Terminal, Trash2, ArrowRight, Settings, HelpCircle, HardDrive, RefreshCw, Volume2, Video, Laptop, Link, Globe, FolderOpen, Search, FileText, Cloud, Lock, ChevronDown, ChevronRight, Image, FolderArchive, Box, Music, FileCode, Sheet, FileType, BookOpen, Code, FileSpreadsheet, Presentation, Layers, Type } from 'lucide-react';
import { User, FileConversion, CloudIntegration } from '../types';
import { Tool, TOOLS, CATEGORIES } from '../data/tools';
import ToolPicker from './ToolPicker';
import { computeConversionCost, spend, refund, getUser } from '../data/gamification';
import UpvoteButton from './gamification/UpvoteButton';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';

interface ConversionPanelProps {
  currentUser: User | null;
  selectedTool: Tool;
  onConversionCompleted: (conversion: FileConversion) => void;
  onOpenAuth: () => void;
  integrations: CloudIntegration[];
  onSelectTool?: (tool: Tool) => void;
}

const GOOGLE_DRIVE_MOCK_FILES = [
  { name: 'Financial_Statement_2026.pdf', size: 12582912, ext: 'pdf' },
  { name: 'Corporate_Presentation.pptx', size: 8493465, ext: 'pptx' },
  { name: 'Product_Backlog.docx', size: 4404019, ext: 'docx' },
  { name: 'Marketing_Visual.png', size: 2936012, ext: 'png' },
  { name: 'User_Feedback_Raw.txt', size: 122880, ext: 'txt' },
  { name: 'OmniConvert_Pitch_Draft.md', size: 45000, ext: 'md' },
];

const DROPBOX_MOCK_FILES = [
  { name: 'Client_Agreement_Signed.pdf', size: 3670016, ext: 'pdf' },
  { name: 'Developer_Resume_2026.docx', size: 1887436, ext: 'docx' },
  { name: 'Profit_Loss_Model.xlsx', size: 2202009, ext: 'xlsx' },
  { name: 'Project_Logo_White.png', size: 1048576, ext: 'png' },
  { name: 'Readme_Cloud_Arch.md', size: 15400, ext: 'md' },
];

const ONEDRIVE_MOCK_FILES = [
  { name: 'System_Architecture_Whitepaper.pdf', size: 5242880, ext: 'pdf' },
  { name: 'Cloud_Database_Schema.png', size: 1572864, ext: 'png' },
  { name: 'API_Spec_Endpoint_List.md', size: 24576, ext: 'md' },
  { name: 'Archived_Logs_June.zip', size: 16777216, ext: 'zip' },
  { name: 'Tutorial_Guide_V1.txt', size: 35000, ext: 'txt' },
];

// Cross-category target universe per CAD source extension.
// Each entry spans multiple categories so the per-row TO picker surfaces
// every reachable category (CAD / 3D Models / Vectors / Images / Documents /
// Spreadsheets / Presentations / Archives / eBooks). Many of these pairs are
// NOT yet browser-feasible (DWG→PDF, STEP→DOCX, etc.) — they fall through to
// the simulated placeholder when the user clicks Convert. The goal of this
// expansion is to let the user SEE all reachable categories from the picker
// so the platform's capability surface is discoverable.
const CAD_TARGET_MATRIX: Record<string, string[]> = {
  dwg:  ['DXF','STEP','STL','OBJ','SVG','PDF','PNG','JPG','GLB','GLTF','PLY','FBX','3DS','DAE','DOCX','XLSX','PPTX','ZIP'],
  dxf:  ['DWG','SVG','PDF','PNG','JPG','STEP','STL','OBJ','GLB','GLTF','PLY','FBX','3DS','DAE','DOCX','XLSX','PPTX','ZIP'],
  step: ['STP','IGES','STL','OBJ','3DS','DAE','GLB','GLTF','PLY','FBX','SVG','PDF','PNG','JPG','DOCX','XLSX','PPTX','ZIP','EPUB'],
  stp:  ['STEP','IGES','STL','OBJ','3DS','DAE','GLB','GLTF','PLY','FBX','SVG','PDF','PNG','JPG','DOCX','XLSX','PPTX','ZIP','EPUB'],
  stl:  ['STEP','IGES','OBJ','PLY','3DS','DAE','GLB','GLTF','FBX','DWG','DXF','SVG','PDF','PNG','JPG','DOCX','XLSX','PPTX','ZIP','EPUB'],
  obj:  ['STEP','IGES','STL','PLY','3DS','DAE','GLB','GLTF','FBX','DWG','DXF','SVG','PDF','PNG','JPG','DOCX','XLSX','PPTX','ZIP','EPUB'],
  '3ds':['STEP','IGES','STL','OBJ','PLY','DAE','GLB','GLTF','FBX','DWG','DXF','SVG','PDF','PNG','JPG','DOCX','XLSX','PPTX','ZIP','EPUB'],
  dae:  ['STEP','IGES','STL','OBJ','PLY','3DS','GLB','GLTF','FBX','DWG','DXF','SVG','PDF','PNG','JPG','DOCX','XLSX','PPTX','ZIP','EPUB'],
  fbx:  ['STEP','IGES','STL','OBJ','PLY','3DS','DAE','GLB','GLTF','DWG','DXF','SVG','PDF','PNG','JPG','DOCX','XLSX','PPTX','ZIP','EPUB'],
  ply:  ['STEP','IGES','STL','OBJ','3DS','DAE','GLB','GLTF','FBX','DWG','DXF','SVG','PDF','PNG','JPG','DOCX','XLSX','PPTX','ZIP','EPUB'],
  ifc:  ['STEP','STL','OBJ','GLB','GLTF','PLY','PDF','DOCX','ZIP'],
  skp:  ['STEP','STL','OBJ','GLB','GLTF','PLY','PDF','ZIP'],
  vsd:  ['VSDX','PDF','PNG','JPG','DOCX','XLSX','PPTX','ZIP'],
  vsdx: ['VSD','PDF','PNG','JPG','DOCX','XLSX','PPTX','ZIP'],
  svgz: ['SVG','PDF','PNG','JPG','DOCX','ZIP'],
  cgm:  ['SVG','PDF','PNG','JPG','DOCX','ZIP'],
  default: ['STEP','IGES','STL','OBJ','GLB','GLTF','SVG','PDF','PNG','JPG','DOCX','XLSX','PPTX','ZIP'],
};

const getFileExtension = (fileName: string) => fileName.split('.').pop()?.toLowerCase() || 'cad';

// Map a filename's extension to a colored icon chip so the row tells you
// what kind of file it is before you even read the name.
type FileTypeMeta = {
  Icon: React.ComponentType<{ className?: string }>;
  bg: string;
  fg: string;
  label: string;
};
const FILE_TYPE_TABLE: Array<{ exts: string[]; meta: FileTypeMeta }> = [
  { exts: ['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp', 'tiff', 'tif', 'heic', 'ico', 'avif'],
    meta: { Icon: Image,        bg: 'bg-pink-50',    fg: 'text-pink-600',    label: 'image' } },
  { exts: ['svg'],             meta: { Icon: Code,         bg: 'bg-pink-50',    fg: 'text-pink-600',    label: 'vector' } },
  { exts: ['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac', 'wma', 'm4r', 'dts', 'amr', 'mp2', 'voc', 'aiff', 'aif', '8svx', 'cvs', 'opus'],
    meta: { Icon: Music,        bg: 'bg-violet-50',  fg: 'text-violet-600',  label: 'audio' } },
  { exts: ['mp4', 'mov', 'avi', 'mkv', 'webm', 'flv', 'wmv', 'mpeg', 'mpg', '3gp', 'm4v', 'ts'],
    meta: { Icon: Video,        bg: 'bg-rose-50',    fg: 'text-rose-600',    label: 'video' } },
  { exts: ['pdf'],             meta: { Icon: FileText,     bg: 'bg-red-50',     fg: 'text-red-600',     label: 'pdf' } },
  { exts: ['doc', 'docx', 'odt', 'rtf'],
    meta: { Icon: FileType,     bg: 'bg-blue-50',    fg: 'text-blue-600',    label: 'document' } },
  { exts: ['xlsx', 'xls', 'csv'],
    meta: { Icon: Sheet,        bg: 'bg-emerald-50', fg: 'text-emerald-700', label: 'spreadsheet' } },
  { exts: ['txt', 'md', 'log'],
    meta: { Icon: FileText,     bg: 'bg-slate-50',   fg: 'text-slate-600',   label: 'text' } },
  { exts: ['html', 'htm'],     meta: { Icon: Code,         bg: 'bg-orange-50',  fg: 'text-orange-600',  label: 'markup' } },
  { exts: ['json', 'xml', 'css', 'js', 'jsx', 'ts', 'tsx', 'yaml', 'yml'],
    meta: { Icon: FileCode,     bg: 'bg-amber-50',   fg: 'text-amber-700',   label: 'code' } },
  { exts: ['epub', 'mobi'],    meta: { Icon: BookOpen,     bg: 'bg-indigo-50',   fg: 'text-indigo-600',  label: 'ebook' } },
  { exts: ['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz'],
    meta: { Icon: FolderArchive, bg: 'bg-yellow-50', fg: 'text-yellow-700', label: 'archive' } },
  { exts: ['stl', 'obj', 'step', 'stp', 'iges', 'igs', 'dwg', 'dxf', 'fbx', '3ds', 'glb', 'gltf', '3mf'],
    meta: { Icon: Box,          bg: 'bg-orange-50',  fg: 'text-orange-600',  label: '3d' } },
];
const FALLBACK_FILE_META: FileTypeMeta = { Icon: File, bg: 'bg-slate-100', fg: 'text-slate-500', label: 'file' };
const getFileTypeMeta = (fileName: string): FileTypeMeta => {
  const ext = getFileExtension(fileName);
  return FILE_TYPE_TABLE.find(g => g.exts.includes(ext))?.meta || FALLBACK_FILE_META;
};

// ===== Real browser-side CAD converters =====
// Per the omniconvert-conversion-matrix skill: pure CAD↔CAD conversion is
// server-territory, but a small subset of text-based mesh formats round-trip
// losslessly in the browser. We ship STL↔OBJ and OBJ↔PLY here. Anything
// else (DWG/DXF/STEP/IGES/...) falls back to the simulated placeholder.
const parseAsciiStl = (text: string): { triangles: { normal: [number, number, number]; v: [number, number, number][] }[] } => {
  const triangles: { normal: [number, number, number]; v: [number, number, number][] }[] = [];
  const lines = text.split(/\r?\n/);
  let i = 0;
  let cur: { normal: [number, number, number]; v: [number, number, number][] } | null = null;
  while (i < lines.length) {
    const line = lines[i].trim();
    if (line.startsWith('solid') || line.startsWith('endsolid')) { i++; continue; }
    if (line.startsWith('facet normal')) {
      const p = line.split(/\s+/);
      cur = { normal: [parseFloat(p[2]), parseFloat(p[3]), parseFloat(p[4])], v: [] };
    } else if (line.startsWith('vertex')) {
      const p = line.split(/\s+/);
      cur.v.push([parseFloat(p[1]), parseFloat(p[2]), parseFloat(p[3])]);
    } else if (line.startsWith('endfacet')) {
      if (cur) triangles.push(cur);
      cur = null;
    }
    i++;
  }
  return { triangles };
};

const writeAsciiStl = (triangles: { normal: [number, number, number]; v: [number, number, number][] }[]): string => {
  let out = 'solid omniconvert_converted\n';
  for (const t of triangles) {
    out += `  facet normal ${t.normal[0]} ${t.normal[1]} ${t.normal[2]}\n`;
    out += '    outer loop\n';
    for (const v of t.v) out += `      vertex ${v[0]} ${v[1]} ${v[2]}\n`;
    out += '    endloop\n  endfacet\n';
  }
  return out + 'endsolid omniconvert_converted\n';
};

const parseObj = (text: string): { vertices: [number, number, number][]; triangles: [number, number, number][] } => {
  const vertices: [number, number, number][] = [];
  const triangles: [number, number, number][] = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const p = line.split(/\s+/);
    if (p[0] === 'v' && p.length >= 4) {
      vertices.push([parseFloat(p[1]), parseFloat(p[2]), parseFloat(p[3])]);
    } else if (p[0] === 'f' && p.length >= 4) {
      const faceIdx = p.slice(1).map(tok => {
        const vSpec = tok.split('/')[0];
        const idx = parseInt(vSpec, 10);
        return idx < 0 ? vertices.length + idx + 1 : idx;
      });
      // Fan-triangulate n-gons.
      for (let k = 1; k < faceIdx.length - 1; k++) {
        triangles.push([faceIdx[0] - 1, faceIdx[k] - 1, faceIdx[k + 1] - 1]);
      }
    }
  }
  return { vertices, triangles };
};

const writeObj = (vertices: [number, number, number][], triangles: [number, number, number][]): string => {
  let out = '# Converted by OmniConvert\n';
  out += 'o OmniConvert_Output\n';
  for (const v of vertices) out += `v ${v[0]} ${v[1]} ${v[2]}\n`;
  for (const t of triangles) out += `f ${t[0] + 1} ${t[1] + 1} ${t[2] + 1}\n`;
  return out;
};

const stlToObj = (stlText: string): string => {
  const { triangles } = parseAsciiStl(stlText);
  const vertMap = new Map<string, number>();
  const vertices: [number, number, number][] = [];
  const outTris: [number, number, number][] = [];
  for (const t of triangles) {
    const idx: [number, number, number] = t.v.map(v => {
      const key = v.map(n => n.toFixed(6)).join(',');
      let i = vertMap.get(key);
      if (i === undefined) { i = vertices.length; vertices.push(v); vertMap.set(key, i); }
      return i;
    }) as [number, number, number];
    outTris.push(idx);
  }
  return writeObj(vertices, outTris);
};

const objToStl = (objText: string): string => {
  const { vertices, triangles } = parseObj(objText);
  const out = triangles.map(t => {
    const [a, b, c] = t.map(i => vertices[i]);
    const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2];
    const vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
    let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    const L = Math.hypot(nx, ny, nz) || 1;
    return { normal: [nx / L, ny / L, nz / L] as [number, number, number], v: [a, b, c] as [number, number, number][] };
  });
  return writeAsciiStl(out);
};

const PLY_ASCII_HEADER = `ply\nformat ascii 1.0\ncomment Converted by OmniConvert\n`;

const parsePly = (text: string): { vertices: [number, number, number][]; triangles: [number, number, number][] } => {
  const lines = text.split(/\r?\n/);
  let i = 0;
  let vertexCount = 0;
  let faceCount = 0;
  const properties: string[] = [];
  let inVertex = false;
  let inFace = false;
  while (i < lines.length) {
    const line = lines[i].trim();
    if (line.startsWith('element vertex')) { vertexCount = parseInt(line.split(/\s+/)[2], 10); inVertex = false; }
    else if (line.startsWith('element face')) { faceCount = parseInt(line.split(/\s+/)[2], 10); inVertex = false; inFace = false; }
    else if (line.startsWith('property') && (inVertex === false) && (inFace === false)) {
      properties.push(line.split(/\s+/).slice(-1)[0]);
    } else if (line === 'end_header') {
      inVertex = true; i++; break;
    }
    i++;
  }
  const vertices: [number, number, number][] = [];
  for (let v = 0; v < vertexCount; v++) {
    const parts = lines[i++].trim().split(/\s+/).map(parseFloat);
    vertices.push([parts[0], parts[1], parts[2]]);
  }
  const triangles: [number, number, number][] = [];
  for (let f = 0; f < faceCount; f++) {
    const parts = lines[i++].trim().split(/\s+/);
    const n = parseInt(parts[0], 10);
    for (let k = 1; k < n - 1; k++) {
      triangles.push([parseInt(parts[1], 10), parseInt(parts[k + 1], 10), parseInt(parts[k + 2], 10)]);
    }
  }
  return { vertices, triangles };
};

const writePlyAscii = (vertices: [number, number, number][], triangles: [number, number, number][]): string => {
  let out = PLY_ASCII_HEADER;
  out += `element vertex ${vertices.length}\nproperty float x\nproperty float y\nproperty float z\n`;
  out += `element face ${triangles.length}\nproperty list uchar int vertex_indices\n`;
  out += 'end_header\n';
  for (const v of vertices) out += `${v[0]} ${v[1]} ${v[2]}\n`;
  for (const t of triangles) out += `3 ${t[0]} ${t[1]} ${t[2]}\n`;
  return out;
};

const objToPly = (objText: string): string => {
  const { vertices, triangles } = parseObj(objText);
  return writePlyAscii(vertices, triangles);
};

const plyToObj = (plyText: string): string => {
  const { vertices, triangles } = parsePly(plyText);
  return writeObj(vertices, triangles);
};

// Try a real browser-side CAD conversion. Returns null when unsupported
// (caller should fall back to the simulated placeholder).
const tryRealCadConversion = async (file: File, targetExt: string): Promise<{ blob: Blob; mime: string } | null> => {
  const srcExt = getFileExtension(file.name).toLowerCase();
  const tgt = targetExt.toLowerCase();
  const text = await file.text();
  let out: string | null = null;
  let mime = 'text/plain';
  if (srcExt === 'stl' && tgt === 'obj') { out = stlToObj(text); mime = 'text/plain'; }
  else if (srcExt === 'obj' && tgt === 'stl') { out = objToStl(text); mime = 'model/stl'; }
  else if (srcExt === 'obj' && tgt === 'ply') { out = objToPly(text); mime = 'application/ply'; }
  else if (srcExt === 'ply' && tgt === 'obj') { out = plyToObj(text); mime = 'text/plain'; }
  if (out === null) return null;
  return { blob: new Blob([out], { type: mime }), mime };
};

const getCadTargetOptions = (fileName: string, fallbackOutput: string[]) => {
  const ext = getFileExtension(fileName);
  return CAD_TARGET_MATRIX[ext] || fallbackOutput || CAD_TARGET_MATRIX.default;
};

// Format -> category map for the categorized "to" picker. Covers every
// writable format from the CloudConvert catalog so the per-row picker
// surfaces ALL reachable categories from a single source extension. Keys
// are uppercase extension / name; missing entries fall through to 'Other'.
const FORMAT_CATEGORY_MAP: Record<string, string> = {
  // Documents
  PDF: 'Documents', DOC: 'Documents', DOCX: 'Documents', ODT: 'Documents',
  TXT: 'Documents', RTF: 'Documents', HTML: 'Documents', HTM: 'Documents',
  MD: 'Documents', TEX: 'Documents', JSON: 'Documents', XML: 'Documents',
  // Spreadsheets
  CSV: 'Spreadsheets', XLS: 'Spreadsheets', XLSX: 'Spreadsheets',
  ODS: 'Spreadsheets', TSV: 'Spreadsheets', DBF: 'Spreadsheets', FODS: 'Spreadsheets',
  // Presentations
  PPT: 'Presentations', PPTX: 'Presentations', ODP: 'Presentations',
  // Images
  PNG: 'Images', JPG: 'Images', JPEG: 'Images', WEBP: 'Images', GIF: 'Images',
  BMP: 'Images', TIFF: 'Images', TIF: 'Images', HEIC: 'Images', HEIF: 'Images',
  ICO: 'Images', AVIF: 'Images', PBM: 'Images', PCX: 'Images', PGM: 'Images',
  PPM: 'Images', XBM: 'Images', XPM: 'Images', DNG: 'Images',
  // Audio
  MP3: 'Audio', WAV: 'Audio', OGG: 'Audio', M4A: 'Audio', OPUS: 'Audio',
  FLAC: 'Audio', AAC: 'Audio', WMA: 'Audio', M4R: 'Audio', DTS: 'Audio',
  AMR: 'Audio', MP2: 'Audio', VOC: 'Audio', AIFF: 'Audio', AIF: 'Audio',
  AC3: 'Audio', AU: 'Audio', EAC3: 'Audio', MKA: 'Audio', SPX: 'Audio',
  TTA: 'Audio', WV: 'Audio',
  // Video
  MP4: 'Video', MOV: 'Video', AVI: 'Video', MKV: 'Video', WEBM: 'Video',
  FLV: 'Video', WMV: 'Video', MPEG: 'Video', MPG: 'Video',
  '3GP': 'Video', M4V: 'Video', TS: 'Video', ASF: 'Video', DIVX: 'Video',
  DV: 'Video', F4V: 'Video', M2TS: 'Video', M2V: 'Video', MTS: 'Video',
  MXF: 'Video', OGV: 'Video', SWF: 'Video', VOB: 'Video',
  // Archives
  ZIP: 'Archives', '7Z': 'Archives', TAR: 'Archives', GZ: 'Archives',
  BZ2: 'Archives', XZ: 'Archives', LZ: 'Archives', LZMA: 'Archives', CPIO: 'Archives',
  // CAD
  DWG: 'CAD', DXF: 'CAD', STEP: 'CAD', STP: 'CAD', IGES: 'CAD', IGS: 'CAD',
  IFC: 'CAD', VSDX: 'CAD', CGM: 'CAD', SVGZ: 'CAD',
  // eBooks
  EPUB: 'eBooks', MOBI: 'eBooks', FB2: 'eBooks',
  // Vectors
  SVG: 'Vectors', EPS: 'Vectors', EMF: 'Vectors', WMF: 'Vectors', ODG: 'Vectors',
  // Fonts
  TTF: 'Fonts', OTF: 'Fonts', WOFF: 'Fonts', WOFF2: 'Fonts', EOT: 'Fonts',
  // 3D Models
  STL: '3D Models', OBJ: '3D Models', GLTF: '3D Models', GLB: '3D Models',
  PLY: '3D Models', '3DS': '3D Models', DAE: '3D Models', FBX: '3D Models',
  WRL: '3D Models', X3D: '3D Models',
};

const CATEGORY_ORDER = [
  'CAD', '3D Models', 'Vectors', 'Images',
  'Documents', 'Spreadsheets', 'Presentations',
  'Audio', 'Video', 'Archives', 'eBooks', 'Fonts',
];

const categorizeFormats = (formats: string[]) => {
  const groups = new Map<string, string[]>();
  formats.forEach(raw => {
    const upper = raw.toUpperCase().trim();
    const cat = FORMAT_CATEGORY_MAP[upper] || 'Other';
    if (!groups.has(cat)) groups.set(cat, []);
    groups.get(cat)!.push(raw);
  });
  return CATEGORY_ORDER
    .filter(c => groups.has(c))
    .map(c => ({ name: c, formats: groups.get(c)!.slice().sort() }));
};

// Tiny conditional-class helper (no classnames dep).
const cls = (...parts: Array<string | false | null | undefined>): string =>
  parts.filter(Boolean).join(' ');

function ProviderIcon({ provider }: { provider: 'computer' | 'url' | 'gdrive' | 'dropbox' | 'onedrive' }) {
  if (provider === 'gdrive') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
        <path fill="#34a853" d="M8.2 3h7.6l-3.9 6.8H4.3z" />
        <path fill="#fbbc04" d="M15.8 3 22 13.7h-7.8L11.9 9.8z" />
        <path fill="#4285f4" d="M4.3 9.8 1.9 13.9 6 21h12l-3.8-7.3H6.6z" />
      </svg>
    );
  }

  if (provider === 'dropbox') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
        <path fill="#0061FF" d="m6.2 3.7 5.8 3.7-5.8 3.7L.5 7.4zm11.6 0 5.7 3.7-5.7 3.7L12 7.4zM.5 14.8l5.7-3.7 5.8 3.7-5.8 3.7zm17.3-3.7 5.7 3.7-5.7 3.7-5.8-3.7zm-11.6 8.7 5.8-3.7 5.8 3.7-5.8 3.5z" />
      </svg>
    );
  }

  if (provider === 'onedrive') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
        <path fill="#0078D4" d="M9.2 9.4a5.6 5.6 0 0 1 10.5 1.9 4.2 4.2 0 0 1-.4 8.4H7.4a4.9 4.9 0 0 1 1.8-10.3z" />
        <path fill="#50A6E8" d="M4.6 12.6a5.1 5.1 0 0 1 8.7-2.9 6 6 0 0 1 2.3 4.7H4.4z" />
      </svg>
    );
  }

  if (provider === 'url') {
    return <Link className="h-5 w-5" />;
  }

  return <FolderOpen className="h-5 w-5" />;
}

type UploadSourceId = 'computer' | 'url' | 'gdrive' | 'dropbox' | 'onedrive';

type UploadProgressState = {
  status: 'pending' | 'uploading' | 'processing' | 'saving' | 'completed' | 'failed';
  progress: number;
  statusText: string;
};

const formatReadableFileSize = (size: number) => {
  if (!size) return '0 KB';
  const units = ['B', 'KB', 'MB', 'GB'];
  const unitIndex = Math.min(Math.floor(Math.log(size) / Math.log(1024)), units.length - 1);
  const value = size / Math.pow(1024, unitIndex);
  return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
};

function UploadProgressBar({ value, label }: { value: number; label?: string }) {
  const safeValue = Math.max(0, Math.min(100, value));
  const halfWidth = safeValue / 2;

  return (
    <div className="w-full space-y-1.5" aria-label={label || `Upload progress ${safeValue}%`}>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-100">
        {/* Left-anchored fill: grows right from the left edge.
            Plain div + CSS transition (not motion.div) so rapid progress
            updates smoothly interpolate instead of triggering overlapping
            motion animations that visually jitter. */}
        <div
          className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-300"
          style={{ width: `${halfWidth}%`, transition: 'width 180ms ease-out' }}
        />
        {/* Right-anchored fill: grows left from the right edge. Same
            treatment so the dual-anchored cadence stays in lockstep. */}
        <div
          className="absolute top-0 right-0 h-full rounded-full bg-gradient-to-l from-emerald-400 to-emerald-300"
          style={{ width: `${halfWidth}%`, transition: 'width 180ms ease-out' }}
        />
      </div>
      {label && <p className="text-xs font-bold text-slate-500">{label}</p>}
    </div>
  );
}

/**
 * SingleProgressBar — a thin, single-fill, left-to-right progress bar placed
 * directly below the input filename inside UploadedFileRow. Replaces the older
 * dual-anchored UploadProgressBar that was jittering under rapid updates.
 *
 * Implementation notes:
 *  - Plain <div> + CSS transition for the width property. No motion library.
 *  - Solid blue fill on a slate-100 track so the filled portion is unambiguous
 *    (no gradient meeting point, no overlapping dual fills to fight each other).
 *  - Width = value% directly (no halving). Single fill, single source of truth.
 *  - When value = 100 the bar fades to a transparent track via the inline
 *    `opacity: 0` style; the parent UploadedFileRow swaps it for a static
 *    "Complete" inline indicator anyway, so this is a fallback safety net.
 */
function SingleProgressBar({ value }: { value: number }) {
  const safeValue = Math.max(0, Math.min(100, value));
  return (
    <div
      className="relative h-1.5 w-full overflow-hidden rounded-full bg-slate-100"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={safeValue}
    >
      <div
        className="absolute top-0 left-0 h-full rounded-full bg-blue-500"
        style={{
          width: `${safeValue}%`,
          transition: 'width 200ms ease-out',
          opacity: safeValue >= 100 ? 0 : 1,
        }}
      />
    </div>
  );
}

function UploadButton({
  label,
  onClick,
  disabled,
  loading,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? undefined : { y: -2 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 420, damping: 28 }}
      className="inline-flex min-h-14 min-w-[230px] items-center justify-center gap-2 bg-blue-600 px-7 text-base font-black text-white outline-none transition-colors hover:bg-blue-700 focus-visible:ring-4 focus-visible:ring-blue-200 disabled:cursor-not-allowed disabled:bg-slate-300"
    >
      {loading && <Loader2 className="h-5 w-5 animate-spin" />}
      {loading ? 'Uploading...' : label}
    </motion.button>
  );
}

function UploadError({ message }: { message: string }) {
  return (
    <motion.p
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto mt-4 flex max-w-2xl items-center justify-center gap-2 rounded-full border border-blue-100 bg-white/90 px-4 py-2 text-xs font-bold text-blue-700"
      role="status"
      aria-live="polite"
    >
      <AlertTriangle className="h-4 w-4" />
      {message}
    </motion.p>
  );
}

function UploadZone({
  dragActive,
  onDragEnter,
  onDragOver,
  onDragLeave,
  onDrop,
  children,
}: {
  dragActive: boolean;
  onDragEnter: React.DragEventHandler<HTMLDivElement>;
  onDragOver: React.DragEventHandler<HTMLDivElement>;
  onDragLeave: React.DragEventHandler<HTMLDivElement>;
  onDrop: React.DragEventHandler<HTMLDivElement>;
  children: React.ReactNode;
}) {
  return (
    /* Plain white browser background. No rounded card, no dashed border,
       no grid pattern, no animated tint. Phase 1 strips the "card" feel
       from the entire Choose Files flow. The drag affordance now lives
       on the UploadPlaceholder's primary button + the file picker, not
       on a bordered drop zone. */
    <div
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={cls(
        'relative w-full bg-white py-8 transition-colors',
        dragActive ? 'bg-blue-50/40' : 'bg-white'
      )}
    >
      {children}
    </div>
  );
}

function UploadPlaceholder({
  dragActive,
  inputFormat,
  outputFormat,
  title,
  subtitle,
  buttonLabel,
  isProcessing,
  onBrowse,
  sourceActions,
  children,
}: {
  dragActive: boolean;
  inputFormat: string;
  outputFormat: string;
  title: string;
  subtitle: string;
  buttonLabel: string;
  isProcessing: boolean;
  onBrowse: () => void;
  sourceActions: Array<{
    id: UploadSourceId;
    label: string;
    onClick: () => void;
    onEnter: () => void;
    onLeave: () => void;
  }>;
  children?: React.ReactNode;
}) {
  return (
    <div className="relative mx-auto flex min-h-[280px] w-full flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-5 py-10 text-center sm:px-8 sm:py-12">
      {/* Soft drop-zone tint when dragging */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 rounded-2xl transition-colors ${
          dragActive ? 'bg-blue-50/70' : 'bg-transparent'
        }`}
      />

      <motion.div
        animate={{ scale: dragActive ? 1.02 : 1 }}
        transition={{ type: 'spring', stiffness: 320, damping: 24 }}
        className="inline-flex max-w-full overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 shadow-[0_18px_42px_rgba(37,99,235,0.25)] ring-1 ring-blue-700/20"
      >
        <UploadButton label={isProcessing ? 'Uploading...' : buttonLabel} loading={isProcessing} disabled={isProcessing} onClick={onBrowse} />
        {sourceActions.map(source => (
          <motion.button
            key={source.id}
            type="button"
            aria-label={source.label}
            title={source.label}
            onMouseEnter={source.onEnter}
            onFocus={source.onEnter}
            onMouseLeave={source.onLeave}
            onBlur={source.onLeave}
            onClick={source.onClick}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="grid h-14 w-16 place-items-center border-l border-white/20 bg-transparent text-white/90 outline-none transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-4 focus-visible:ring-blue-200"
          >
            <ProviderIcon provider={source.id} />
          </motion.button>
        ))}
      </motion.div>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs font-semibold text-slate-500">
        <span className="inline-flex items-center gap-1">
          <Lock className="h-3.5 w-3.5 text-slate-400" />
          {dragActive ? 'Release to upload' : 'Drop files here, or use the button above'}
        </span>
        <span className="hidden sm:inline">·</span>
        <span>1 GB max per file</span>
        <span className="hidden sm:inline">·</span>
        <span>Supports {inputFormat} CAD files</span>
      </div>

      <div className="mt-3 inline-flex items-center justify-center gap-2 rounded-full bg-slate-50 px-4 py-1.5 text-[11px] font-black text-slate-600 ring-1 ring-slate-200">
        Converting <span className="font-mono uppercase text-blue-700">{inputFormat}</span>
        <ArrowRight className="h-3 w-3 text-slate-400" />
        <span className="font-mono uppercase text-blue-700">{outputFormat}</span>
      </div>

      {children}
    </div>
  );
}

const CategoryIcon: React.FC<{ name: string }> = ({ name }) => {
  switch (name) {
    case 'Documents':     return <FileText className="h-3.5 w-3.5" />;
    case 'Spreadsheets':  return <FileSpreadsheet className="h-3.5 w-3.5" />;
    case 'Presentations': return <Presentation className="h-3.5 w-3.5" />;
    case 'Images':        return <Image className="h-3.5 w-3.5" />;
    case 'Audio':         return <Volume2 className="h-3.5 w-3.5" />;
    case 'Video':         return <Video className="h-3.5 w-3.5" />;
    case 'Archives':      return <FolderArchive className="h-3.5 w-3.5" />;
    case 'CAD':           return <Box className="h-3.5 w-3.5" />;
    case 'eBooks':        return <BookOpen className="h-3.5 w-3.5" />;
    case 'Vectors':       return <Layers className="h-3.5 w-3.5" />;
    case 'Fonts':         return <Type className="h-3.5 w-3.5" />;
    case '3D Models':     return <Box className="h-3.5 w-3.5" />;
    default:              return <File className="h-3.5 w-3.5" />;
  }
};

interface TargetFormatPickerProps {
  currentTarget: string;
  formats: string[];
  disabled?: boolean;
  onChange: (format: string) => void;
  size?: 'sm' | 'md';
  ariaLabel?: string;
}

const TargetFormatPicker: React.FC<TargetFormatPickerProps> = ({
  currentTarget,
  formats,
  disabled,
  onChange,
  size = 'md',
  ariaLabel,
}) => {
  const [open, setOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [search, setSearch] = useState('');
  const [popover, setPopover] = useState<{ top: number; left: number; width: number; placement: 'down' | 'up' } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const categories = useMemo(() => categorizeFormats(formats), [formats]);

  const filteredCategories = useMemo(() => {
    if (!search.trim()) return categories;
    const q = search.trim().toLowerCase();
    return categories
      .map(c => ({ ...c, formats: c.formats.filter(f => f.toLowerCase().includes(q)) }))
      .filter(c => c.formats.length > 0);
  }, [categories, search]);

  // Pick / refresh active category: prefer one that contains the current target.
  useEffect(() => {
    if (filteredCategories.length === 0) return;
    if (!filteredCategories.find(c => c.name === activeCategory)) {
      const fromCurrent = filteredCategories.find(c => c.formats.includes(currentTarget));
      setActiveCategory((fromCurrent ?? filteredCategories[0]).name);
    }
  }, [filteredCategories, activeCategory, currentTarget]);

  // Calculate popover position from the trigger button (fixed positioning so
  // it overflows above the file-list overflow context without being clipped).
  // Stable: re-computed only on open + scroll + resize, not on every render.
  const computePopover = useCallback(() => {
    if (!rootRef.current) return;
    const r = rootRef.current.getBoundingClientRect();
    const width = Math.max(420, r.width + 80);
    const margin = 8;
    const spaceBelow = window.innerHeight - r.bottom;
    const placement = spaceBelow < 360 && r.top > 360 ? 'up' : 'down';
    const top = placement === 'down' ? r.bottom + margin : Math.max(margin, r.top - margin - 360);
    const left = Math.min(window.innerWidth - width - margin, Math.max(margin, r.left));
    setPopover({ top, left, width, placement });
  }, []);

  useEffect(() => {
    if (!open) return;
    computePopover();
    const onDocMouseDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (rootRef.current?.contains(t)) return;
      if (popoverRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDocMouseDown);
    document.addEventListener('keydown', onKey);
    window.addEventListener('scroll', computePopover, true);
    window.addEventListener('resize', computePopover);
    return () => {
      document.removeEventListener('mousedown', onDocMouseDown);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', computePopover, true);
      window.removeEventListener('resize', computePopover);
    };
  }, [open, computePopover]);

  // Focus search on open; reset on close.
  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => searchRef.current?.focus());
    } else {
      setSearch('');
      setPopover(null);
    }
  }, [open]);

  const visibleFormats = filteredCategories.find(c => c.name === activeCategory)?.formats ?? [];
  const triggerPad = size === 'sm' ? 'px-2 py-1 text-[10px]' : 'px-3 py-2 text-xs';

  return (
    <div ref={rootRef} className="relative inline-block">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        className={cls(
          'inline-flex min-h-11 items-center gap-1.5 rounded-xl border font-mono font-black outline-none',
          'bg-white border-slate-200 text-slate-800 hover:bg-slate-50',
          'focus-visible:ring-4 focus-visible:ring-blue-200',
          'disabled:cursor-not-allowed disabled:opacity-50',
          triggerPad
        )}
      >
        <span className="uppercase">{currentTarget || '---'}</span>
        <ChevronDown className={cls('h-3 w-3 text-slate-500 transition-transform', open && 'rotate-180')} />
      </button>
      {open && popover && createPortal(
        <div
          ref={popoverRef}
          role="listbox"
          style={{
            position: 'fixed',
            top: popover.top,
            left: popover.left,
            width: popover.width,
            zIndex: 60,
          }}
          className="rounded-xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/15 overflow-hidden"
        >
          <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-3 py-2">
            <Search className="h-3.5 w-3.5 text-slate-400" />
            <input
              ref={searchRef}
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search"
              className="flex-1 bg-transparent text-xs text-slate-700 placeholder:text-slate-400 outline-none"
            />
          </div>
          <div className="grid grid-cols-[150px_1fr] max-h-[360px]">
            <div className="border-r border-slate-100 bg-slate-50/60 overflow-y-auto py-1">
              {filteredCategories.length === 0 && (
                <p className="px-3 py-4 text-[11px] text-slate-500">No formats match.</p>
              )}
              {filteredCategories.map(cat => {
                const active = cat.name === activeCategory;
                return (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={() => setActiveCategory(cat.name)}
                    className={cls(
                      'flex w-full items-center justify-between px-3 py-2 text-xs',
                      active
                        ? 'bg-white text-blue-700 font-bold shadow-[inset_3px_0_0_0_theme(colors.blue.600)]'
                        : 'text-slate-600 hover:bg-white hover:text-slate-900'
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <CategoryIcon name={cat.name} />
                      {cat.name}
                    </span>
                    {active && <ChevronRight className="h-3.5 w-3.5 text-blue-600" />}
                  </button>
                );
              })}
            </div>
            <div className="overflow-y-auto p-3">
              {visibleFormats.length === 0 ? (
                <p className="px-1 py-6 text-center text-[11px] text-slate-500">No formats in this category.</p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {visibleFormats.map(fmt => {
                    const selected = fmt === currentTarget;
                    return (
                      <button
                        key={fmt}
                        type="button"
                        onClick={() => { onChange(fmt); setOpen(false); }}
                        className={cls(
                          'rounded-lg px-2 py-2 text-[11px] font-mono font-black uppercase text-center transition-colors',
                          selected
                            ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        )}
                      >
                        {fmt}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

type UploadedFileRowProps = {
  file: File;
  readiness: 'analyzing' | 'ready';
  progress?: UploadProgressState;
  converted: boolean;
  conversion?: FileConversion;
  currentTarget: string;
  formats: string[];
  isProcessing: boolean;
  onTargetChange: (format: string) => void;
  onRemove: () => void;
  onDownload: () => void;
};

const UploadedFileRow: React.FC<UploadedFileRowProps> = ({
  file,
  readiness,
  progress,
  converted,
  conversion,
  currentTarget,
  formats,
  isProcessing,
  onTargetChange,
  onRemove,
  onDownload,
}) => {
  const extension = getFileExtension(file.name);
  const isAnalyzing = readiness === 'analyzing' && !progress;
  const progressValue = progress?.progress ?? (converted ? 100 : isAnalyzing ? 44 : 0);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className="border-b border-slate-100 bg-white px-4 py-3 last:border-b-0"
    >
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_170px_90px_120px] lg:items-center">
        <div className="flex min-w-0 gap-3">
          {(() => {
            const { Icon: TypeIcon, bg, fg } = getFileTypeMeta(file.name);
            return (
              <span className={cls('grid h-10 w-10 shrink-0 place-items-center rounded-xl ring-1 ring-inset ring-black/[0.04]', bg, fg)}>
                <TypeIcon className="h-5 w-5" />
              </span>
            );
          })()}
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <p className="truncate text-sm font-black text-slate-900">{file.name}</p>
              {(() => {
                const { bg, fg } = getFileTypeMeta(file.name);
                return (
                  <span className={cls('rounded-full px-2 py-1 font-mono text-[10px] font-black uppercase', bg, fg)}>
                    {extension}
                  </span>
                );
              })()}
              {/* All status / progress text lives INLINE beside the filename
                  chip — no separate status line, no duplicate phrases. */}
              {converted ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-black text-emerald-700" aria-label="Complete 100%">
                  <CheckCircle2 className="h-3 w-3" />
                  100% Complete
                </span>
              ) : isAnalyzing ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-black text-amber-700">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Analyzing
                </span>
              ) : progress?.statusText ? (
                <span className="text-[11px] font-black text-slate-600">{progress.statusText}</span>
              ) : null}
            </div>
            <div className="mt-2">
              {converted ? (
                /* hidden in converted state — the inline pill above is the single
                   source of truth and replaces any second status line. */
                <span className="sr-only">Ready to download</span>
              ) : (
                <SingleProgressBar value={progressValue} />
              )}
            </div>
          </div>
        </div>

        <div className="flex min-h-11 items-center justify-center gap-2 justify-self-center text-center">
          <span className="text-xs font-black uppercase text-slate-500">TO</span>
          <TargetFormatPicker
            currentTarget={currentTarget}
            formats={formats}
            disabled={readiness === 'analyzing' || isProcessing}
            onChange={onTargetChange}
            size="md"
            ariaLabel={`Target format for ${file.name}`}
          />
        </div>

        <div className="text-center text-xs font-semibold text-slate-500 lg:text-right">
          {formatReadableFileSize(file.size)}
        </div>

        <div className="flex items-center justify-end gap-2">
          {converted && conversion ? (
            <span className="rounded-full bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-600">Converted</span>
          ) : (
            <span className="rounded-full bg-slate-50 px-3 py-2 text-xs font-black text-slate-500">Pending</span>
          )}
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove ${file.name}`}
            className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 outline-none hover:bg-rose-50 hover:text-rose-600 focus-visible:ring-4 focus-visible:ring-rose-100"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Output file row: ALWAYS rendered so the article's bounding box is
          locked whether the file is pending or done. Content swaps between the
          "converted output" view and a dashed "awaiting conversion" placeholder,
          but the surrounding box (border + padding + bg + radius) is identical
          between the two states so conversions complete without shifting the
          file list or the sticky action row below.

          Layout: file info on the left (flex-1), Download button right-aligned
          in the SAME row (only when converted). Pending branch intentionally
          has no Download affordance — a disabled ghost button only adds noise. */}
      <div
        className={cls(
          'mt-3 flex flex-wrap items-center gap-3 rounded-xl border px-4 py-3',
          converted && conversion
            ? 'border-emerald-100 bg-emerald-50/60'
            : 'border-dashed border-slate-200 bg-slate-50/40'
        )}
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {converted && conversion ? (
            (() => {
              const { Icon: OutIcon, bg, fg } = getFileTypeMeta(conversion.fileName);
              return (
                <span className="relative">
                  <span className={cls('grid h-9 w-9 shrink-0 place-items-center rounded-lg ring-1 ring-black/[0.04]', bg, fg)}>
                    <OutIcon className="h-4 w-4" />
                  </span>
                  <span className="absolute -right-1 -bottom-1 grid h-4 w-4 place-items-center rounded-full bg-emerald-500 text-white ring-2 ring-white">
                    <CheckCircle2 className="h-2.5 w-2.5" />
                  </span>
                </span>
              );
            })()
          ) : (
            (() => {
              const { Icon: OutIcon } = getFileTypeMeta(`placeholder.${currentTarget.toLowerCase()}`);
              return (
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-dashed border-slate-200 bg-white">
                  <OutIcon className="h-4 w-4 text-slate-300" />
                </span>
              );
            })()
          )}
          <div className="min-w-0 flex-1">
            {/* No label row here. The input row above already shows
                "Ready to download" + "100% Complete" inline, and the
                "Awaiting conversion" placeholder is implied by the dashed
                border + projected filename + ghost target chip — adding
                a "Converted output" / "Awaiting conversion" eyebrow just
                adds a redundant row of text. The output row is purely
                file info + Download action. */}
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <span className={cls(
                'truncate text-sm',
                converted && conversion ? 'font-black text-slate-900' : 'font-bold text-slate-400'
              )}>
                {converted && conversion
                  ? conversion.fileName
                  : (file.name.includes('.')
                      ? `${file.name.slice(0, file.name.lastIndexOf('.'))}.${currentTarget.toLowerCase()}`
                      : `${file.name}.${currentTarget.toLowerCase()}`)}
              </span>
              <span className={cls(
                'rounded-full px-2 py-0.5 font-mono text-[10px] font-black uppercase ring-1',
                converted && conversion
                  ? 'bg-white text-emerald-700 ring-emerald-200'
                  : 'bg-white text-slate-500 ring-slate-200'
              )}>
                {currentTarget}
              </span>
              {converted && conversion && (
                <span className="text-xs font-semibold text-slate-500">{formatReadableFileSize(conversion.fileSize)}</span>
              )}
              <span className={cls(
                'rounded-full px-2 py-1 font-mono text-[10px] font-black uppercase',
                converted && conversion
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-slate-100 text-slate-500'
              )}>
                {converted && conversion ? 'Done' : 'Pending'}
              </span>
            </div>
          </div>
        </div>

        {/* Download button: right-aligned in the SAME row. Only when converted. */}
        {converted && conversion && (
          <button
            type="button"
            onClick={onDownload}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-black text-white shadow-sm shadow-emerald-500/30 outline-none hover:bg-emerald-600 focus-visible:ring-4 focus-visible:ring-emerald-200"
          >
            <Download className="h-4 w-4" />
            Download
          </button>
        )}
      </div>

      {/* Gradient divider: always rendered so the visual cadence between
          rows is identical for every file. Previously this was conditional
          and contributed to the same flicker. */}
      <div
        aria-hidden="true"
        className="mt-4 h-px w-full bg-gradient-to-r from-transparent via-slate-300/60 to-transparent dark:via-slate-300/30"
      />
    </motion.article>
  );
};

// Minimal ZIP STORE writer used by the bundled "Download all" action.
// No compression, no external dependency — STORE method only.
// Spec reference: PKWARE APPNOTE.TXT (Local + Central + EOCD records).

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c >>> 0;
  }
  return table;
})();

const crc32 = (data: Uint8Array): number => {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < data.length; i++) {
    crc = CRC_TABLE[(crc ^ data[i]) & 0xFF] ^ (crc >>> 8);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
};

const buildZip = (files: Array<{ name: string; data: Uint8Array }>): Uint8Array => {
  const encoder = new TextEncoder();
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let offset = 0;

  for (const file of files) {
    const nameBytes = encoder.encode(file.name);
    const crc = crc32(file.data);
    const size = file.data.length;

    const local = new Uint8Array(30 + nameBytes.length);
    const lv = new DataView(local.buffer);
    lv.setUint32(0, 0x04034b50, true);       // Local file header signature
    lv.setUint16(4, 20, true);                // Version needed to extract
    lv.setUint16(6, 0, true);                 // General purpose bit flag
    lv.setUint16(8, 0, true);                 // Compression method: 0 = STORE
    lv.setUint16(10, 0, true);                // Last mod file time
    lv.setUint16(12, 0x21, true);             // Last mod file date (2000-01-01)
    lv.setUint32(14, crc, true);              // CRC-32
    lv.setUint32(18, size, true);             // Compressed size
    lv.setUint32(22, size, true);             // Uncompressed size
    lv.setUint16(26, nameBytes.length, true); // File name length
    lv.setUint16(28, 0, true);                // Extra field length
    local.set(nameBytes, 30);
    localParts.push(local, file.data);

    const central = new Uint8Array(46 + nameBytes.length);
    const cv = new DataView(central.buffer);
    cv.setUint32(0, 0x02014b50, true);        // Central directory signature
    cv.setUint16(4, 20, true);                 // Version made by
    cv.setUint16(6, 20, true);                 // Version needed
    cv.setUint16(8, 0, true);                  // General purpose bit flag
    cv.setUint16(10, 0, true);                 // Compression method
    cv.setUint16(12, 0, true);                 // Last mod file time
    cv.setUint16(14, 0x21, true);              // Last mod file date
    cv.setUint32(16, crc, true);               // CRC-32
    cv.setUint32(20, size, true);              // Compressed size
    cv.setUint32(24, size, true);              // Uncompressed size
    cv.setUint16(28, nameBytes.length, true);  // File name length
    cv.setUint16(30, 0, true);                 // Extra field length
    cv.setUint16(32, 0, true);                 // File comment length
    cv.setUint16(34, 0, true);                 // Disk number start
    cv.setUint16(36, 0, true);                 // Internal file attributes
    cv.setUint32(38, 0, true);                 // External file attributes
    cv.setUint32(42, offset, true);            // Relative offset of local header
    central.set(nameBytes, 46);
    centralParts.push(central);

    offset += local.length + file.data.length;
  }

  const centralStart = offset;
  let centralSize = 0;
  for (const part of centralParts) centralSize += part.length;

  const eocd = new Uint8Array(22);
  const ev = new DataView(eocd.buffer);
  ev.setUint32(0, 0x06054b50, true);          // End of central dir signature
  ev.setUint16(4, 0, true);                   // Number of this disk
  ev.setUint16(6, 0, true);                   // Disk with central dir
  ev.setUint16(8, files.length, true);        // Entries on this disk
  ev.setUint16(10, files.length, true);       // Total entries
  ev.setUint32(12, centralSize, true);        // Size of central directory
  ev.setUint32(16, centralStart, true);       // Offset of central dir
  ev.setUint16(20, 0, true);                  // Comment length

  const totalSize = offset + centralSize + 22;
  const out = new Uint8Array(totalSize);
  let p = 0;
  for (const part of localParts) { out.set(part, p); p += part.length; }
  for (const part of centralParts) { out.set(part, p); p += part.length; }
  out.set(eocd, p);
  return out;
};

const downloadUrlToBlob = async (url: string | undefined): Promise<Blob> => {
  if (!url || url === '#') {
    return new Blob(['OmniConvert sandbox conversion result'], { type: 'text/plain' });
  }
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.blob();
  } catch {
    return new Blob(['OmniConvert sandbox conversion result'], { type: 'text/plain' });
  }
};

const dedupeZipNames = (names: string[]): string[] => {
  const seen = new Map<string, number>();
  return names.map(name => {
    const count = seen.get(name) ?? 0;
    seen.set(name, count + 1);
    if (count === 0) return name;
    const dot = name.lastIndexOf('.');
    const base = dot > 0 ? name.slice(0, dot) : name;
    const ext = dot > 0 ? name.slice(dot) : '';
    return `${base} (${count + 1})${ext}`;
  });
};

const isCompatibleExtension = (fileName: string, toolInput: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  const inputLower = toolInput.toLowerCase();
  
  if (inputLower.includes('image') || inputLower.includes('jpg') || inputLower.includes('png') || inputLower.includes('webp')) {
    return ['png', 'jpg', 'jpeg', 'webp', 'bmp'].includes(ext || '');
  }
  if (inputLower.includes('markdown') || inputLower.includes('md')) {
    return ['md', 'markdown'].includes(ext || '');
  }
  if (inputLower.includes('pdf')) {
    return ['pdf'].includes(ext || '');
  }
  if (inputLower.includes('text') || inputLower.includes('txt')) {
    return ['txt', 'md', 'html', 'json'].includes(ext || '');
  }
  return true; // fallback
};

export default function ConversionPanel({
  currentUser,
  selectedTool,
  onConversionCompleted,
  onOpenAuth,
  integrations,
  onSelectTool,
}: ConversionPanelProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [targetFormats, setTargetFormats] = useState<Record<string, string>>({});
  const [conversions, setConversions] = useState<FileConversion[]>([]);
  const [lastConvertedTargets, setLastConvertedTargets] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileProgresses, setFileProgresses] = useState<Record<string, {
    status: 'pending' | 'uploading' | 'processing' | 'saving' | 'completed' | 'failed';
    progress: number;
    statusText: string;
  }>>({});
  const [currentLogs, setCurrentLogs] = useState<string[]>([]);
  const [showLogs, setShowLogs] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tool Specific Options
  const [resizeWidth, setResizeWidth] = useState('800');
  const [resizeHeight, setResizeHeight] = useState('600');
  const [compressQuality, setCompressQuality] = useState('80');
  const [ttsText, setTtsText] = useState('Welcome to OmniConvert, the fast and professional SaaS file conversion platform. Start converting your files directly from your browser today!');
  const [ttsVoice, setTtsVoice] = useState('default');
  const [flipDirection, setFlipDirection] = useState('horizontal');
  const [mdText, setMdText] = useState('# OmniConvert SaaS Workflow\n\n- **Fast**: High-speed Cloudflare Worker queues.\n- **Secure**: Secure end-to-end sandbox.\n- **Integrated**: Seamless Dropbox & S3 connectivity.');
  
  // Screen Recording States
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recordingTimerRef = useRef<any>(null);

  // File Upload Source States
  const [showSourceModal, setShowSourceModal] = useState(false);
  const [showUploadDropdown, setShowUploadDropdown] = useState(false);
  const [activeUploadSource, setActiveUploadSource] = useState<'menu' | 'url' | 'gdrive' | 'dropbox' | 'onedrive'>('menu');
  const [urlInput, setUrlInput] = useState('');
  const [selectedCloudFiles, setSelectedCloudFiles] = useState<string[]>([]);
  const [cloudSearchQuery, setCloudSearchQuery] = useState('');
  const [copiedLinkInPanel, setCopiedLinkInPanel] = useState(false);
  const [cadFileReadiness, setCadFileReadiness] = useState<Record<string, 'analyzing' | 'ready'>>({});
  const [cadUploadButtonLabel, setCadUploadButtonLabel] = useState('Choose Files');
  const [cadSaveDestination, setCadSaveDestination] = useState<'gdrive' | 'dropbox' | 'onedrive' | null>(null);
  const [cadNotice, setCadNotice] = useState('');
  const cadNoticeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flashCadNotice = (message: string, ms = 7000) => {
    if (cadNoticeTimeoutRef.current) {
      clearTimeout(cadNoticeTimeoutRef.current);
    }
    setCadNotice(message);
    cadNoticeTimeoutRef.current = setTimeout(() => {
      setCadNotice('');
      cadNoticeTimeoutRef.current = null;
    }, ms);
  };
  useEffect(() => () => {
    if (cadNoticeTimeoutRef.current) clearTimeout(cadNoticeTimeoutRef.current);
  }, []);

  // When the first file lands the workspace appears below the fold on most
  // viewports (the upload placeholder sits below the page intro). Scroll the
  // page so the convert row is in the browser visible area on first upload;
  // subsequent adds don't scroll because the workspace is already in view.
  const previousFileCountRef = useRef(0);
  useEffect(() => {
    if (files.length > 0 && previousFileCountRef.current === 0) {
      const el = document.getElementById('cad-conversion-workspace');
      el?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
    previousFileCountRef.current = files.length;
  }, [files.length]);
  const [showCadShareOptions, setShowCadShareOptions] = useState(false);
  const [showCadAddSources, setShowCadAddSources] = useState(false);
  const [cadAddSourcesPinned, setCadAddSourcesPinned] = useState(false);
  const [showSavePopover, setShowSavePopover] = useState(false);

  // Available Outputs list
  const outputs = selectedTool.output.split(',').map(s => s.trim());
  const isCadTool = selectedTool.category === 'CAD';
  const availableCredits = currentUser?.credits ?? 15;
  const referralUrl = `${window.location.origin}/?ref=${currentUser?.id || 'cad-preview'}`;

  useEffect(() => {
    // Reset file state on tool change
    setFiles([]);
    setConversions([]);
    setLastConvertedTargets({});
    setFileProgresses({});
    setIsProcessing(false);
    setCurrentLogs([]);
    setShowUploadDropdown(false);
    setCadFileReadiness({});
    setCadSaveDestination(null);
    setCadNotice('');
    setShowCadShareOptions(false);
    setCadUploadButtonLabel('Choose Files');
    setShowCadAddSources(false);
    setCadAddSourcesPinned(false);
  }, [selectedTool]);

  useEffect(() => {
    if (!isCadTool) return;

    files.forEach(file => {
      if (cadFileReadiness[file.name]) return;

      setCadFileReadiness(prev => ({ ...prev, [file.name]: 'analyzing' }));
      window.setTimeout(() => {
        setCadFileReadiness(prev => {
          if (!prev[file.name]) return prev;
          return { ...prev, [file.name]: 'ready' };
        });
      }, 1800);
    });

    setCadFileReadiness(prev => {
      const next = { ...prev };
      let changed = false;
      Object.keys(next).forEach(fileName => {
        if (!files.some(file => file.name === fileName)) {
          delete next[fileName];
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [cadFileReadiness, files, isCadTool]);

  // Drag and Drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFiles = Array.from(e.dataTransfer.files) as File[];
      setFiles(prev => [...prev, ...droppedFiles]);
      
      // Auto initialize outputs
      const initialFormats = { ...targetFormats };
      droppedFiles.forEach(f => {
        if (!initialFormats[f.name]) {
          initialFormats[f.name] = outputs[0];
        }
      });
      setTargetFormats(initialFormats);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFiles = Array.from(e.target.files) as File[];
      setFiles(prev => [...prev, ...selectedFiles]);
      setShowUploadDropdown(false);

      const initialFormats = { ...targetFormats };
      selectedFiles.forEach(f => {
        if (!initialFormats[f.name]) {
          initialFormats[f.name] = outputs[0];
        }
      });
      setTargetFormats(initialFormats);
      // Phase 1 cleanup: no auto-trigger. The inline Convert button (leftmost
      // in the unified action row) is now the explicit start. handleConvert
      // reads `files` from closure, so auto-triggering from this handler would
      // race with the setFiles/setTargetFormats updates above.
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => {
      const removed = prev[index];
      if (removed) {
        setLastConvertedTargets(t => {
          if (!(removed.name in t)) return t;
          const { [removed.name]: _drop, ...rest } = t;
          return rest;
        });
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  // Live Screen Recorder Feature (Actual browser Screen Recording!)
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: "monitor" },
        audio: true
      });
      
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' });
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      
      mediaRecorder.onstop = () => {
        const completeBlob = new Blob(chunks, { type: 'video/webm' });
        setRecordedBlob(completeBlob);
        
        // Wrap as a File
        const recFile = new File([completeBlob], `Screen_Record_${Date.now()}.webm`, { type: 'video/webm' });
        setFiles(prev => [...prev, recFile]);
        setTargetFormats(prev => ({ ...prev, [recFile.name]: 'MP4' }));
        
        // Clean up tracks
        stream.getTracks().forEach(track => track.stop());
        setIsRecording(false);
        setRecordDuration(0);
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Start duration counter
      let duration = 0;
      recordingTimerRef.current = setInterval(() => {
        duration += 1;
        setRecordDuration(duration);
      }, 1000);

    } catch (err) {
      console.error("Screen recording access denied or failed", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    }
  };

  // Native Client-side Text-to-Speech Preview
  const handleTextToSpeech = () => {
    if (!ttsText) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(ttsText);
    window.speechSynthesis.speak(utterance);
    
    // Add dynamic feedback
    confetti({
      particleCount: 30,
      spread: 60,
      colors: ['#6366f1', '#a855f7']
    });
  };

  // TRIGGER MASTER PROCESSING WORKER (REAL & SIMULATED PIPELINE)
  const handleConvert = async (forceAll = false, overrideTargets?: Record<string, string>) => {
    if (files.length === 0 && selectedTool.name !== 'Text to Speech' && selectedTool.name !== 'Markdown to HTML') {
      return;
    }

    // Compute + spend credit cost up front; refund on failure below.
    const totalSizeMB = files.reduce((s, f) => s + f.size, 0) / (1024 * 1024);
    const cost = computeConversionCost({
      toolCategory: selectedTool.category ?? 'Documents',
      inputFormat: selectedTool.input,
      totalSizeMB,
      fileCount: files.length || 1,
    }, currentUser);
    const spendResult = spend(cost, 'conversion_spend', {
      description: `Convert ${selectedTool.name} · ${files.length || 1} file(s)`,
      subtype: `${selectedTool.id}`,
    }, currentUser);
    if (!spendResult.ok) {
      setIsProcessing(false);
      const reason = 'reason' in spendResult ? spendResult.reason : 'insufficient';
      setCadNotice(reason === 'insufficient'
        ? `Not enough credits — this conversion costs ${cost} cr. Earn more via the floating pill.`
        : 'Your account is restricted. Contact support.');
      return;
    }
    const spendTxId = spendResult.tx.id;

    setIsProcessing(true);
    setShowLogs(true);

    // Prepare list of items to convert
    // - Skip files that have already completed in a prior run
    // - If the tool is a creator (like Text to Speech or Markdown to HTML) and there are no files,
    //   mock a single virtual file.
    const itemsToConvert = files.length > 0
      ? files.filter(file => {
          if (forceAll) return true;
          const progress = fileProgresses[file.name];
          const isCompleted = progress?.status === 'completed';
          // Never converted -> process.
          if (!isCompleted) return true;
          // Already converted -> only process if the target format changed since last run.
          const currentTarget = targetFormats[file.name] || outputs[0];
          const lastTarget = lastConvertedTargets[file.name];
          return lastTarget !== currentTarget;
        })
      : [
          new File([selectedTool.name === 'Text to Speech' ? ttsText : mdText],
            selectedTool.name === 'Text to Speech' ? 'narration_draft.txt' : 'document_preview.md',
            { type: 'text/plain' })
        ];

    if (itemsToConvert.length === 0) {
      // Nothing new to convert; preserve existing conversions and progress, just exit.
      setIsProcessing(false);
      return;
    }

    // Initialize individual progresses (merge so already-completed files keep their state).
    setFileProgresses(prev => {
      const next: Record<string, {
        status: 'pending' | 'uploading' | 'processing' | 'saving' | 'completed' | 'failed';
        progress: number;
        statusText: string;
      }> = { ...prev };
      itemsToConvert.forEach(file => {
        next[file.name] = {
          status: 'pending',
          progress: 0,
          statusText: 'Awaiting queue allocation...'
        };
      });
      return next;
    });

    const updateProgress = (
      fileName: string,
      status: 'pending' | 'uploading' | 'processing' | 'saving' | 'completed' | 'failed',
      progress: number,
      statusText: string
    ) => {
      setFileProgresses(prev => ({
        ...prev,
        [fileName]: { status, progress, statusText }
      }));
    };

    const processingOutputs: FileConversion[] = [];

    // Each file runs its own conversion pipeline concurrently; per-file state
    // (progress, logs, conversion record) is kept independent via closures.
    const processSingleFile = async (currentFile: File): Promise<FileConversion> => {
      // Resolve the target format with overrideTargets (from applyCadConvertAll)
      // taking precedence over the closure's targetFormats. The closure value is
      // stale when applyCadConvertAll calls handleConvert(true) in the SAME render
      // it just set the new targets — without this override the conversion would
      // be written against the OLD target format, and after re-render the row
      // would show a mismatched chip (new target) + filename (old target).
      const selectedTargetFormat =
        overrideTargets?.[currentFile.name] ?? targetFormats[currentFile.name] ?? outputs[0];
      const conversionId = 'conv_' + Math.random().toString(36).substr(2, 9);

      const logMessages: string[] = [];
      const addLog = (msg: string) => {
        const timestamp = new Date().toLocaleTimeString();
        const formatted = `[${timestamp}] ${msg}`;
        logMessages.push(formatted);
        setCurrentLogs(prev => [...prev, formatted]);
      };

      addLog(`Initializing conversion engine for: ${currentFile.name}`);
      addLog(`Determining server worker node deployment...`);
      updateProgress(currentFile.name, 'uploading', 5, 'Initializing engine...');

      // 1. QUEUEING
      addLog(`[QUEUE] File assigned to Cloudflare Worker queue #cf-${Math.floor(Math.random() * 90 + 10)}`);
      updateProgress(currentFile.name, 'uploading', 15, 'Assigning file to server worker queue...');
      await new Promise(resolve => setTimeout(resolve, 300));
      updateProgress(currentFile.name, 'uploading', 25, 'Connecting to secure sandbox node...');
      await new Promise(resolve => setTimeout(resolve, 300));

      // 2. STORAGE SYNC (S3, Azure, Google Cloud or Dropbox Integration check)
      const activeCloud = integrations.find(c => c.enabled);
      if (activeCloud) {
        addLog(`[STORAGE] Uploading active file chunk to user's secure ${activeCloud.provider.toUpperCase()} Bucket [${activeCloud.bucketOrFolder}]...`);
        updateProgress(currentFile.name, 'uploading', 35, `Uploading file chunk to user's ${activeCloud.provider.toUpperCase()} bucket...`);
      } else {
        addLog(`[STORAGE] Buffering file chunk to temporary cloud cache storage...`);
        updateProgress(currentFile.name, 'uploading', 35, 'Buffering file chunk to secure sandbox cache...');
      }
      await new Promise(resolve => setTimeout(resolve, 400));
      updateProgress(currentFile.name, 'processing', 45, 'Upload completed. Loading transcoding libraries...');
      await new Promise(resolve => setTimeout(resolve, 400));

      // 3. ACTUAL WORKER CONVERT
      addLog(`[WORKER] Spawning headless transcoder instance. Loading codec maps...`);
      updateProgress(currentFile.name, 'processing', 55, `Loading codecs for ${selectedTargetFormat}...`);
      
      // Perform Actual Conversions client-side if supported!
      let downloadUrl = '#';
      let realConversionPerformed = false;

      try {
        if (selectedTool.name === 'JPG to PNG' || selectedTool.name === 'PNG to JPG' || selectedTool.name === 'Image to WebP' || selectedTool.name === 'WebP to Image') {
          addLog(`[CONVERT] Initiating real-time client-side HTML5 canvas rasterization...`);
          updateProgress(currentFile.name, 'processing', 65, 'Compiling image parameters...');
          const imgUrl = URL.createObjectURL(currentFile);
          const img = new Image();
          img.src = imgUrl;
          await new Promise((resolve) => { img.onload = resolve; });
          
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0);

          let mime = 'image/png';
          let ext = 'png';
          if (selectedTargetFormat.toLowerCase() === 'jpg' || selectedTargetFormat.toLowerCase() === 'jpeg') {
            mime = 'image/jpeg';
            ext = 'jpg';
          } else if (selectedTargetFormat.toLowerCase() === 'webp') {
            mime = 'image/webp';
            ext = 'webp';
          }

          downloadUrl = canvas.toDataURL(mime);
          realConversionPerformed = true;
          addLog(`[CONVERT] Successfully rasterized ${currentFile.name} to ${selectedTargetFormat}`);
          updateProgress(currentFile.name, 'processing', 80, `Successfully rasterized to ${selectedTargetFormat.toUpperCase()}`);
        } 
        else if (selectedTool.name === 'Image Compress') {
          addLog(`[CONVERT] Compressing photo buffers. Adjusting target quality to ${compressQuality}%...`);
          updateProgress(currentFile.name, 'processing', 65, `Compressing image buffers to ${compressQuality}% quality...`);
          const imgUrl = URL.createObjectURL(currentFile);
          const img = new Image();
          img.src = imgUrl;
          await new Promise((resolve) => { img.onload = resolve; });
          
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0);
          
          downloadUrl = canvas.toDataURL('image/jpeg', parseFloat(compressQuality) / 100);
          realConversionPerformed = true;
          addLog(`[CONVERT] Image compression ratio calculated: Reduced size by approximately ${100 - parseInt(compressQuality)}%`);
          updateProgress(currentFile.name, 'processing', 80, 'Compression completed successfully!');
        }
        else if (selectedTool.name === 'Image Resize') {
          addLog(`[CONVERT] Scaling pixel dimensions to width: ${resizeWidth}px, height: ${resizeHeight}px...`);
          updateProgress(currentFile.name, 'processing', 65, `Resizing boundaries to ${resizeWidth}px x ${resizeHeight}px...`);
          const imgUrl = URL.createObjectURL(currentFile);
          const img = new Image();
          img.src = imgUrl;
          await new Promise((resolve) => { img.onload = resolve; });
          
          const canvas = document.createElement('canvas');
          canvas.width = parseInt(resizeWidth) || 800;
          canvas.height = parseInt(resizeHeight) || 600;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          downloadUrl = canvas.toDataURL('image/png');
          realConversionPerformed = true;
          addLog(`[CONVERT] Successfully scaled image bounds`);
          updateProgress(currentFile.name, 'processing', 80, 'Sizing dimensions complete');
        }
        else if (selectedTool.name === 'Image Flip') {
          addLog(`[CONVERT] Performing symmetry operations. Mode: ${flipDirection}...`);
          updateProgress(currentFile.name, 'processing', 65, `Flipping matrix ${flipDirection}...`);
          const imgUrl = URL.createObjectURL(currentFile);
          const img = new Image();
          img.src = imgUrl;
          await new Promise((resolve) => { img.onload = resolve; });
          
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            if (flipDirection === 'horizontal') {
              ctx.translate(canvas.width, 0);
              ctx.scale(-1, 1);
            } else {
              ctx.translate(0, canvas.height);
              ctx.scale(1, -1);
            }
            ctx.drawImage(img, 0, 0);
          }
          
          downloadUrl = canvas.toDataURL('image/png');
          realConversionPerformed = true;
          addLog(`[CONVERT] Symmetrical mirroring completed`);
          updateProgress(currentFile.name, 'processing', 80, 'Symmetric operations complete!');
        }
        else if (selectedTool.name === 'Markdown to HTML') {
          addLog(`[CONVERT] Parsing Markdown tokens into semantic clean HTML5 structure...`);
          updateProgress(currentFile.name, 'processing', 65, 'Compiling Markdown elements...');
          // Simple client markdown renderer
          const rawMd = currentFile.name === 'document_preview.md' ? mdText : await currentFile.text();
          const parsedHtml = rawMd
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^\- (.*$)/gim, '<li>$1</li>')
            .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
            .replace(/\*(.*)\*/gim, '<em>$1</em>');
          
          const formattedHtml = `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <title>Converted Markdown</title>
              <style>
                body { font-family: system-ui, sans-serif; line-height: 1.6; max-width: 800px; margin: 40px auto; padding: 20px; background: #18181b; color: #f4f4f5; }
                h1 { color: #818cf8; border-bottom: 1px solid #27272a; padding-bottom: 8px; }
                h2 { color: #c084fc; }
                li { margin-bottom: 8px; }
              </style>
            </head>
            <body>
              ${parsedHtml}
            </body>
            </html>
          `;
          const blob = new Blob([formattedHtml], { type: 'text/html' });
          downloadUrl = URL.createObjectURL(blob);
          realConversionPerformed = true;
          addLog(`[CONVERT] Created clean standard index.html package`);
          updateProgress(currentFile.name, 'processing', 80, 'AST parsing and HTML5 markup built!');
        }
        else if (selectedTool.name === 'Text to PDF' || selectedTool.name === 'Markdown to PDF') {
          addLog(`[CONVERT] Initializing typography engine. Formatting text parameters to legal vector nodes...`);
          updateProgress(currentFile.name, 'processing', 65, 'Formatting high-precision legal typography vectors...');
          const textContent = await currentFile.text();
          // Create basic HTML frame to simulate print-to-PDF output
          const htmlContent = `
            <html>
              <body style="font-family: serif; font-size: 14px; padding: 50px;">
                <h1 style="text-align: center;">OMNICONVERT RENDERED OUTPUT</h1>
                <hr/>
                <p style="white-space: pre-wrap;">${textContent}</p>
              </body>
            </html>
          `;
          const blob = new Blob([htmlContent], { type: 'text/html' });
          downloadUrl = URL.createObjectURL(blob);
          realConversionPerformed = true;
          addLog(`[CONVERT] Rendered beautiful high-contrast PDF container`);
          updateProgress(currentFile.name, 'processing', 80, 'Completed rendering text nodes to PDF container.');
        }
      } catch (err) {
        addLog(`[ERROR] High-speed client compilation threw unexpected error: ${err}`);
        updateProgress(currentFile.name, 'failed', 0, `Error occurred: ${err}`);
        refund(spendTxId, 'conversion_refund', { description: `Refund: ${selectedTool.name} failed` }, currentUser);
      }

      // Real browser-side CAD conversion for the small subset that round-trips losslessly.
      // Other CAD paths fall through to the simulated placeholder below.
      if (!realConversionPerformed && isCadTool) {
        try {
          const real = await tryRealCadConversion(currentFile, selectedTargetFormat);
          if (real) {
            downloadUrl = URL.createObjectURL(real.blob);
            realConversionPerformed = true;
            addLog(`[CONVERT] Real client-side parse/serialize completed (${(real.blob.size / 1024).toFixed(1)} KB).`);
            updateProgress(currentFile.name, 'processing', 85, 'Real CAD geometry converted in browser.');
          }
        } catch (err) {
          addLog(`[WARN] Real CAD path failed: ${err}. Falling back to placeholder.`);
        }
      }

      // If client-side convert is not possible/simulated, fallback to our gorgeous simulated queue download!
      if (!realConversionPerformed) {
        addLog(`[CONVERT] Running proprietary parser on cloud instance...`);
        updateProgress(currentFile.name, 'processing', 65, 'Starting cloud-hosted transcoder parser...');
        await new Promise(resolve => setTimeout(resolve, 500));
        updateProgress(currentFile.name, 'processing', 75, 'Constructing output stream payload...');
        await new Promise(resolve => setTimeout(resolve, 500));
        addLog(`[WORKER] Compiling final container format metadata blocks...`);
        updateProgress(currentFile.name, 'processing', 85, 'Injecting file container metadata tags...');
        await new Promise(resolve => setTimeout(resolve, 600));
        
        // Mock a downloadable payload
        const dummyBlob = new Blob([`Successfully converted by OmniConvert SaaS`], { type: 'text/plain' });
        downloadUrl = URL.createObjectURL(dummyBlob);
      }

      addLog(`[STORAGE] Uploading target output document back to Cloud Cache...`);
      updateProgress(currentFile.name, 'saving', 90, 'Writing output document back to secure Sandbox Cache...');
      await new Promise(resolve => setTimeout(resolve, 400));
      
      // Cloud backup integration
      let backupExecuted = false;
      integrations.forEach(c => {
        if (c.enabled) {
          addLog(`[BACKUP] Successfully archived conversion item to third-party cloud: ${c.provider.toUpperCase()} Bucket`);
          updateProgress(currentFile.name, 'saving', 95, `Saving synchronized archive backup to your ${c.provider.toUpperCase()} folder...`);
          backupExecuted = true;
        }
      });
      if (backupExecuted) {
        await new Promise(resolve => setTimeout(resolve, 400));
      }

      addLog(`[SUCCESS] Conversion finalized! Ready for high speed download.`);
      updateProgress(currentFile.name, 'completed', 100, 'Conversion completed successfully!');

      const resultFileName = currentFile.name.substring(0, currentFile.name.lastIndexOf('.')) + '.' + selectedTargetFormat.toLowerCase();

      const newConversion: FileConversion = {
        id: conversionId,
        fileName: resultFileName,
        fileSize: realConversionPerformed
          ? Math.max(1, downloadUrl && downloadUrl !== '#' ? (await fetch(downloadUrl).then(r => r.blob()).then(b => b.size).catch(() => Math.floor(currentFile.size * 0.9))) : Math.floor(currentFile.size * 0.9))
          : Math.floor(currentFile.size * (Math.random() * 0.4 + 0.8)), // simulated compressed size
        toolId: selectedTool.id,
        toolName: selectedTool.name,
        category: selectedTool.category,
        status: 'completed',
        progress: 100,
        creditCost: selectedTool.creditCost,
        timestamp: new Date().toISOString(),
        downloadUrl: downloadUrl,
        logs: logMessages
      };

      processingOutputs.push(newConversion);
      onConversionCompleted(newConversion);
      return newConversion;
    };

    // Run every file's pipeline in parallel. With N files the wall-clock time
    // drops from N * stepDuration to roughly stepDuration.
    await Promise.all(itemsToConvert.map(processSingleFile));

    // Record the target format we actually used for each processed file so the next
    // Convert click can detect when the user changed TO via the picker and re-process.
    setLastConvertedTargets(prev => {
      const next = { ...prev };
      itemsToConvert.forEach(file => {
        // Mirror the override resolution used in processSingleFile so the
        // `lastTarget` written here matches the target the conversion just ran
        // against. Otherwise Convert-all-to would leave pendingCount > 0 in
        // the next render (the old lastTarget would not equal the new target).
        next[file.name] =
          overrideTargets?.[file.name] ?? targetFormats[file.name] ?? outputs[0];
      });
      return next;
    });

    setConversions(prev => [...prev, ...processingOutputs]);
    setIsProcessing(false);

    // Celebration
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleDownloadSingle = (url: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadAllAsZip = async () => {
    // Source the zip contents from `conversions` only. The button's `disabled`
    // state already gates on both allConverted and a non-empty conversions
    // array, so reaching here with empty conversions should be rare — but if
    // it ever happens (race during Convert-all-to flow), flash a notice
    // instead of silently returning so the user knows why nothing happened.
    if (conversions.length === 0) {
      flashCadNotice('No converted files to bundle yet. Click Convert first.', 7000);
      return;
    }
    flashCadNotice('Bundling converted files into a zip archive...');
    try {
      const blobs = await Promise.all(
        conversions.map(conversion => downloadUrlToBlob(conversion.downloadUrl))
      );
      const uniqueNames = dedupeZipNames(conversions.map(c => c.fileName));
      const files = await Promise.all(uniqueNames.map(async (name, idx) => ({
        name,
        data: new Uint8Array(await blobs[idx].arrayBuffer())
      })));
      const zipBytes = buildZip(files);
      const zipBlob = new Blob([zipBytes], { type: 'application/zip' });
      const stamp = new Date().toISOString().slice(0, 10);
      const zipName = `omniconvert-conversions-${stamp}.zip`;
      handleDownloadSingle(URL.createObjectURL(zipBlob), zipName);
      flashCadNotice(`Downloaded ${files.length} file${files.length === 1 ? '' : 's'} as ${zipName}.`, 7000);
    } catch (err) {
      flashCadNotice(`Could not bundle files into a zip: ${err instanceof Error ? err.message : 'unknown error'}`, 10000);
    }
  };

  const handleCadCopyReferral = () => {
    navigator.clipboard?.writeText(referralUrl);
    setShowCadShareOptions(true);
    setCadNotice('Referral link copied. Share it to earn credits when a referred user registers.');
  };

  const applyCadConvertAll = (format: string) => {
    const nextTargets = { ...targetFormats };
    files.forEach(file => {
      nextTargets[file.name] = format;
    });
    setTargetFormats(nextTargets);
    if (files.length > 0) {
      // Clear prior outputs so each row shows the new format result (not the old one).
      setConversions([]);
      setFileProgresses({});
      // Pass nextTargets through explicitly. handleConvert runs in this same render,
      // so its closure's `targetFormats` still holds the OLD values — without the
      // override the conversion record would be written against the old format and
      // the row would show a mismatched chip (new) + filename (old).
      handleConvert(true, nextTargets);
    }
  };

  if (isCadTool) {
    // Helpers that derive counts from current `files` so labels stay in sync after
    // deletions / new uploads / TO changes — never trust raw `conversions.length`.
    const baseNameOf = (name: string) => name.includes('.') ? name.slice(0, name.lastIndexOf('.')) : name;
    const hasConversionFor = (name: string) => conversions.some(c => c.fileName.startsWith(baseNameOf(name)));
    const completedCount = files.filter(f => hasConversionFor(f.name)).length;
    const pendingCount = files.filter(f => {
      if (!hasConversionFor(f.name)) return true;
      const currentTarget = targetFormats[f.name] || outputs[0];
      const lastTarget = lastConvertedTargets[f.name];
      return lastTarget !== currentTarget;
    }).length;
    const allConverted = files.length > 0 && pendingCount === 0 && !isProcessing;
    // canDownload is the source of truth for the Download all button. allConverted
    // alone is not enough — it's derived from lastConvertedTargets/targetFormats
    // and can briefly report true while the actual conversions array is still
    // being repopulated by handleConvert (race during Convert-all-to flow). The
    // button must require a non-empty conversions array too, otherwise the click
    // handler exits silently with no feedback.
    const canDownload = allConverted && conversions.length > 0;
    // canConvert is the source of truth for the inline Convert button. The
    // button must gray out (disabled) whenever there is nothing left to
    // convert — including after every file has been converted (pendingCount
    // becomes 0). It re-enables the moment a new file lands via "Add more
    // files" or when the user changes a per-file target format so that
    // target stops matching lastConvertedTargets.
    const canConvert = files.length > 0 && pendingCount > 0 && !isProcessing;
    const primaryFile = files[0];
    const primarySourceFormat = primaryFile ? getFileExtension(primaryFile.name).toUpperCase() : selectedTool.input.split(',')[0].trim();
    const primaryTargetFormat = primaryFile
      ? (targetFormats[primaryFile.name] || outputs[0] || selectedTool.output).toUpperCase()
      : (outputs[0] || selectedTool.output).toUpperCase();
    const cadConvertAllTarget = primaryFile ? (targetFormats[primaryFile.name] || outputs[0] || 'PDF') : (outputs[0] || 'PDF');
    const cadConvertAllFormats = Array.from(new Set([
      cadConvertAllTarget,
      ...outputs,
      ...CAD_TARGET_MATRIX.default,
    ]));
    const converterTitle = `${primarySourceFormat} to ${primaryTargetFormat} Converter`;
    const converterSubtitle = primaryFile
      ? `Transform ${primarySourceFormat} files into ${primaryTargetFormat} online`
      : 'Convert your files to any format';

    const addCadSampleFiles = (source: string) => {
      const sampleFiles = [
        new File(['cad-cloud-payload'], 'site-plan.dwg', { type: 'application/octet-stream' }),
        new File(['cad-cloud-payload'], 'mechanical-bracket.step', { type: 'application/octet-stream' }),
      ];
      setFiles(prev => [...prev, ...sampleFiles]);
      setTargetFormats(prev => ({
        ...prev,
        'site-plan.dwg': outputs[0] || 'PDF',
        'mechanical-bracket.step': 'STL',
      }));
      setCadNotice(`${source} requires sign in. Added sample CAD files to preview the queue.`);
    };

    const addCadUrlFile = () => {
      const rawUrl = urlInput.trim() || 'https://example.com/site-plan.dwg';
      const filename = rawUrl.split('/').pop() || 'remote-cad-file.dwg';
      const virtualFile = new File(['url-cad-payload'], filename.includes('.') ? filename : 'remote-cad-file.dwg', { type: 'application/octet-stream' });
      setFiles(prev => [...prev, virtualFile]);
      setTargetFormats(prev => ({ ...prev, [virtualFile.name]: outputs[0] || 'PDF' }));
      setUrlInput('');
      setActiveUploadSource('menu');
      setCadNotice('URL file added. Analyzing source format...');
    };

    const cadSourceActions = ([
      ['computer', 'From Computer'],
    ] as Array<[UploadSourceId, string]>).map(([source, label]) => ({
      id: source,
      label,
      onEnter: () => setCadUploadButtonLabel(label),
      onLeave: () => setCadUploadButtonLabel('Choose Files'),
      onClick: () => {
        setCadUploadButtonLabel(label);
        setShowCadAddSources(false);
        setCadAddSourcesPinned(false);
        fileInputRef.current?.click();
      },
    }));

    return (
      <div className="w-full" id="cad-conversion-workspace">
        <div className="w-full bg-white">
          {files.length > 0 && (
            <div className="bg-white">
              <div className="px-5 pb-7 pt-1 text-center">
                <div className="flex items-center justify-center gap-3">
                  <h2 className="text-2xl font-extrabold tracking-tight text-blue-600 sm:text-3xl">{converterTitle}</h2>
                  <UpvoteButton
                    category={selectedTool.category ?? 'Documents'}
                    source={primarySourceFormat}
                    target={primaryTargetFormat}
                    currentUser={getUser(currentUser)}
                    size="sm"
                    showLabel
                  />
                </div>
                <p className="mt-2 text-sm font-semibold text-slate-600">{converterSubtitle}</p>
              </div>

              <div
                /* File list: only switches to internal scroll when the content
                   actually exceeds the cap. With 1 file (content ~150-220px),
                   the visible height is the natural content height and NO
                   scrollbar track is reserved. Once the list grows past the
                   cap (~4 files at 1080p), overflow-y-auto kicks in and the
                   sticky action row below stays pinned to the viewport bottom. */
                className={cls(
                  'border-b border-slate-100',
                  files.length > 2 ? 'max-h-[min(60vh,560px)] overflow-y-auto' : 'overflow-visible'
                )}
              >
                <AnimatePresence initial={false}>
                  {files.map((file, index) => {
                    const readiness = cadFileReadiness[file.name] || 'analyzing';
                    const progress = fileProgresses[file.name];
                    const baseName = file.name.includes('.') ? file.name.slice(0, file.name.lastIndexOf('.')) : file.name;
                    const conversion = conversions.find(item => item.fileName.startsWith(baseName));
                    const converted = Boolean(conversion);
                    const targetOptions = getCadTargetOptions(file.name, outputs);
                    const currentTarget = targetFormats[file.name] || outputs[0] || targetOptions[0];
                    // Picker expects the full union of options + the current target so users can
                    // always re-pick the format that's currently set.
                    const pickerFormats = Array.from(new Set([currentTarget, ...targetOptions]));

                    return (
                      <UploadedFileRow
                        /* Stable, content-derived key. file.name alone is not
                           unique (two picks of the same filename would collide);
                           appending size + lastModified makes the key unique per
                           File instance AND stable across re-orderings, so
                           removing a middle row does not re-mount the rows
                           below it (which would re-trigger the entrance
                           animation and look like a flicker). */
                        key={`${file.name}-${file.size}-${file.lastModified}`}
                        file={file}
                        readiness={readiness}
                        progress={progress}
                        converted={converted}
                        conversion={conversion}
                        currentTarget={currentTarget}
                        formats={pickerFormats}
                        isProcessing={isProcessing}
                        onTargetChange={(format) => setTargetFormats(prev => ({ ...prev, [file.name]: format }))}
                        onRemove={() => removeFile(index)}
                        onDownload={() => conversion && handleDownloadSingle(conversion.downloadUrl || '#', conversion.fileName)}
                      />
                    );
                  })}
                </AnimatePresence>
              </div>

              {/* Pinned action area: position:fixed pins to the browser viewport
                  bottom regardless of page/file-list scroll. The file list's
                  overflow-y-auto would otherwise make sticky pin to the file
                  list scroll, not the viewport — fixed solves that. */}
              <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white shadow-[0_-8px_24px_rgba(15,23,42,0.08)]">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {/* ============== ROW: Unified action bar (Phase 1 cleanup) ==============
                  Phase 1 keeps the layout to a single horizontal action row:
                    - LEFT cluster:  Convert all to (select) -> status counter -> Clear all
                    - RIGHT cluster (pushed by ml-auto):  Convert -> Add more files -> Download
                  The previous three-row layout (Inputs / Bulk ops / Primary) and the
                  Save-destination popover are intentionally collapsed. */}
              <div className={cls(
                'flex flex-wrap items-center gap-3 px-5 py-3',
                allConverted
                  ? 'border-b border-emerald-100 bg-emerald-50/30'
                  : isProcessing
                    ? 'border-b border-blue-100 bg-blue-50/40'
                    : 'border-b border-slate-100'
              )}>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Convert all to</label>
                <TargetFormatPicker
                  currentTarget={cadConvertAllTarget}
                  formats={cadConvertAllFormats}
                  disabled={isProcessing}
                  onChange={(format) => applyCadConvertAll(format)}
                  size="sm"
                  ariaLabel="Bulk convert target format"
                />
                <span className={cls(
                  'text-[11px] font-bold',
                  allConverted
                    ? 'font-black text-emerald-700'
                    : isProcessing
                      ? 'font-bold text-blue-600'
                      : 'text-slate-500'
                )}>
                  {files.length > 0
                    ? `${completedCount} of ${files.length} converted${isProcessing ? ` · ${pendingCount} in progress` : pendingCount > 0 ? ` · ${pendingCount} pending` : ''}`
                    : '0 files'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setFiles([]);
                    setConversions([]);
                    setLastConvertedTargets({});
                    setFileProgresses({});
                    setCadFileReadiness({});
                  }}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3 text-xs font-bold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isProcessing}
                >
                  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                  Clear all
                </button>

                {/* Right cluster pushed to far right */}
                <button
                  type="button"
                  onClick={() => handleConvert(false)}
                  disabled={!canConvert}
                  className={cls(
                    'ml-auto inline-flex h-9 items-center gap-1.5 rounded-lg px-4 text-xs font-black outline-none transition active:scale-[0.97]',
                    canConvert
                      ? 'btn-primary text-white shadow-sm shadow-blue-500/20'
                      : 'cursor-not-allowed bg-slate-100 text-slate-400'
                  )}
                >
                  {isProcessing ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  )}
                  {isProcessing ? 'Converting...' : 'Convert'}
                </button>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-blue-200 bg-white px-3 text-xs font-black text-blue-700 transition hover:border-blue-300 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14m-7-7h14"/></svg>
                  Add more files
                </button>
                <button
                  type="button"
                  onClick={handleDownloadAllAsZip}
                  disabled={!canDownload}
                  className={cls(
                    'inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-black outline-none transition active:scale-[0.97]',
                    canDownload
                      ? 'btn-primary text-white'
                      : 'cursor-not-allowed bg-slate-100 text-slate-400'
                  )}
                >
                  <Download className="h-3 w-3" />
                  Download all
                </button>
              </div>

              </div>
                </div>
              </div>
          )}

          {/* Spacer for fixed action bar — keeps file list last row clear. */}
          <div className="h-24" aria-hidden="true" />

          {/* Tool picker — 3-step Category → From → To with popular combos.
              Lives in the scrollable area so it doesn't fight the sticky bar.
              When the user picks a tool, onSelectTool is called and the parent
              (App.tsx) updates selectedTool + URL via pushState. */}
          {onSelectTool && (
            <ToolPicker
              activeCategory={selectedTool.category}
              activeFrom={selectedTool.input}
              activeTo={selectedTool.output}
              onChange={onSelectTool}
            />
          )}

          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            id="cad-file-upload-input"
          />

          {files.length === 0 && (
            <UploadZone
              dragActive={dragActive}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
            >
              <UploadPlaceholder
                dragActive={dragActive}
                inputFormat={selectedTool.input}
                outputFormat={selectedTool.output}
                title={converterTitle}
                subtitle={converterSubtitle}
                buttonLabel={cadUploadButtonLabel}
                isProcessing={isProcessing}
                onBrowse={() => fileInputRef.current?.click()}
                sourceActions={cadSourceActions}
              >
                <AnimatePresence>
                  {activeUploadSource === 'url' && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="mx-auto mt-4 flex w-full max-w-xl flex-col gap-2 sm:flex-row"
                    >
                      <input
                        type="url"
                        value={urlInput}
                        onChange={(event) => setUrlInput(event.target.value)}
                        placeholder="Paste file URL, for example https://example.com/model.dwg"
                        className="min-h-11 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                      />
                      <button type="button" onClick={addCadUrlFile} className="min-h-11 rounded-xl bg-blue-600 px-4 text-xs font-black text-white outline-none hover:bg-blue-700 focus-visible:ring-4 focus-visible:ring-blue-200">
                        Add URL
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {cadNotice && <UploadError message={cadNotice} />}
              </UploadPlaceholder>
            </UploadZone>
          )}

          {files.length > 0 && cadNotice && <UploadError message={cadNotice} />}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6" id="conversion-workspace">
      
      {/* Category Info Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl glass-card border border-zinc-200 dark:border-white/5 bg-zinc-500/5 dark:bg-white/2">
        <div>
          <span className="text-[10px] uppercase tracking-wider font-mono text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
            {selectedTool.category} Tool
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-800 dark:text-white mt-2" id="workspace-tool-title">
            {selectedTool.name}
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-300 mt-1" id="workspace-tool-desc">
            {selectedTool.description}
          </p>
        </div>
        
        {/* Credits Requirement Tag */}
        <div className="flex items-center gap-3 bg-zinc-100 dark:bg-black/40 p-3 rounded-xl border border-zinc-200 dark:border-white/5 shrink-0">
          <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400 animate-pulse" />
          <div>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-semibold uppercase font-mono">Ledger Cost</p>
            <p className="text-sm font-bold text-zinc-800 dark:text-zinc-100">{selectedTool.creditCost} Credits / Conversion</p>
          </div>
        </div>
      </div>

      {/* Main Action Stage */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Workspace controls & Uploads */}
        <div className="md:col-span-2 space-y-6">
          
          {/* File Upload / Screen Recorder Dragbox */}
          <div 
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => {
              if (files.length === 0 && !isProcessing) {
                setShowUploadDropdown(prev => !prev);
              }
            }}
            className={`relative min-h-[220px] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-6 text-center transition-all ${
              files.length === 0 && !isProcessing ? 'cursor-pointer hover:border-indigo-500/50 hover:bg-zinc-500/5 dark:hover:bg-white/4' : ''
            } ${
              dragActive 
                ? 'border-indigo-500 bg-indigo-500/5' 
                : 'border-zinc-200 dark:border-white/10 bg-zinc-500/5 dark:bg-white/2 backdrop-blur-sm'
            }`}
            id="drag-and-drop-zone"
          >
            <input 
               ref={fileInputRef}
               type="file" 
               multiple 
               onChange={handleFileSelect}
               className="hidden" 
               id="file-upload-input"
            />

            {files.length === 0 && !isProcessing ? (
              <div className="space-y-4">
                <div className="mx-auto w-12 h-12 rounded-full bg-zinc-500/5 dark:bg-white/5 border border-zinc-200 dark:border-white/10 flex items-center justify-center text-zinc-500 dark:text-zinc-400">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowUploadDropdown(prev => !prev);
                    }}
                    className="inline-flex items-center gap-1.5 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 focus:outline-none focus:underline"
                  >
                    Click to upload
                    <ArrowRight className={`w-3.5 h-3.5 transition-transform ${showUploadDropdown ? 'rotate-90' : ''}`} />
                  </button>
                  <span className="text-sm text-zinc-600 dark:text-zinc-400"> or drag and drop files here</span>
                  <p className="text-[11px] text-zinc-500 font-mono mt-1">
                    Accepts: {selectedTool.input} formats
                  </p>
                </div>

                <AnimatePresence>
                  {showUploadDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.16 }}
                      onClick={(e) => e.stopPropagation()}
                      className="absolute top-[136px] left-1/2 z-20 w-[min(420px,calc(100%-32px))] -translate-x-1/2 rounded-2xl glass border border-zinc-200 dark:border-white/10 p-3 text-left shadow-2xl"
                    >
                      <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-mono">
                        Upload source
                      </label>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                        {[
                          ['computer', 'Computer'],
                          ['url', 'URL'],
                          ['gdrive', 'Google Drive'],
                          ['dropbox', 'Dropbox'],
                          ['onedrive', 'OneDrive'],
                        ].map(([source, label]) => (
                          <button
                            key={source}
                            type="button"
                            onClick={() => {
                              setShowUploadDropdown(false);

                              if (source === 'computer') {
                                fileInputRef.current?.click();
                                return;
                              }

                              if (source === 'url') {
                                setShowSourceModal(true);
                                setActiveUploadSource('url');
                                return;
                              }

                              if (source === 'gdrive' || source === 'dropbox' || source === 'onedrive') {
                                setShowSourceModal(true);
                                setActiveUploadSource(source);
                                setSelectedCloudFiles([]);
                                setCloudSearchQuery('');
                              }
                            }}
                            className="flex min-h-[72px] flex-col items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white/85 px-2 py-2 text-center text-[10px] font-black text-zinc-700 transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:border-white/10 dark:bg-slate-900/80 dark:text-zinc-200 dark:hover:border-blue-300/30 dark:hover:bg-blue-400/10 dark:hover:text-blue-200"
                          >
                            <ProviderIcon provider={source as 'computer' | 'url' | 'gdrive' | 'dropbox' | 'onedrive'} />
                            <span>{label}</span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                {/* Direct Screen Recorder Trigger if it's Screen Recording tool */}
                {selectedTool.name === 'Screen Recording to MP4' && (
                  <div className="pt-2" onClick={(e) => e.stopPropagation()}>
                    <span className="text-zinc-500 text-xs block mb-2">— OR —</span>
                    {isRecording ? (
                      <button
                        onClick={(e) => { e.stopPropagation(); stopRecording(); }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-xl cursor-pointer shadow-lg shadow-red-600/15 animate-pulse"
                      >
                        <Video className="w-3.5 h-3.5 shrink-0" />
                        Stop Recording ({recordDuration}s)
                      </button>
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); startRecording(); }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-200 text-xs font-semibold rounded-xl cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5" />
                        Start Live Screen Capture
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full text-left space-y-4" id="uploaded-files-list">
                {/* Global Batch Progress Header */}
                {isProcessing && (
                  <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 space-y-2.5 shadow-xl shadow-indigo-950/25" id="global-batch-progress-monitor">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-indigo-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                        Parallel Batch Processing
                      </span>
                      <span className="font-mono text-indigo-400 font-bold">
                        {Math.round(
                          Object.keys(fileProgresses).reduce((acc, name) => acc + fileProgresses[name].progress, 0) / 
                          Math.max(Object.keys(fileProgresses).length, 1)
                        )}% Total
                      </span>
                    </div>
                    <div className="w-full h-2 bg-black/60 rounded-full overflow-hidden border border-white/5">
                      <motion.div 
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                        animate={{ 
                          width: `${
                            Object.keys(fileProgresses).reduce((acc, name) => acc + fileProgresses[name].progress, 0) / 
                            Math.max(Object.keys(fileProgresses).length, 1)
                          }%` 
                        }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                      <span>Files Completed: {Object.keys(fileProgresses).filter(name => fileProgresses[name].status === 'completed').length} / {Object.keys(fileProgresses).length}</span>
                      <span>Active Node: Cloudflare Worker Queue</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-xs font-bold text-zinc-400 font-mono">
                    {isProcessing ? 'Active Batch Conversions' : `Uploaded Queue (${files.length} items)`}
                  </span>
                  {!isProcessing && (
                    <button 
                      onClick={() => {
                        setFiles([]);
                        setFileProgresses({});
                      }}
                      className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Clear all
                    </button>
                  )}
                </div>
                
                <div className="max-h-[260px] overflow-y-auto space-y-3 pr-1">
                  {/* Loop through file progress data if active, otherwise display current uploaded files */}
                  {Object.keys(fileProgresses).length > 0 ? (
                    Object.keys(fileProgresses).map((fileName, idx) => {
                      const progressData = fileProgresses[fileName];
                      const matchedFile = files.find(f => f.name === fileName);
                      const displaySize = matchedFile 
                        ? `${(matchedFile.size / 1024).toFixed(1)} KB` 
                        : 'Creator Virtual File';

                      return (
                        <div 
                          key={idx}
                          className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-2.5 transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 min-w-0">
                              <File className={`w-4 h-4 shrink-0 ${
                                progressData.status === 'completed' ? 'text-emerald-400' :
                                progressData.status === 'failed' ? 'text-red-400' :
                                progressData.status !== 'pending' ? 'text-indigo-400 animate-pulse' : 'text-zinc-500'
                              }`} />
                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-zinc-200 truncate">{fileName}</p>
                                <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{displaySize}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] font-mono font-bold text-zinc-400">
                                {targetFormats[fileName] || outputs[0]}
                              </span>
                            </div>
                          </div>

                          {/* Real-time individual progress bar */}
                          <div className="space-y-1.5 pt-1.5 border-t border-white/5">
                            <div className="flex items-center justify-between text-[10px] font-mono">
                              <span className={`font-bold uppercase tracking-wider flex items-center gap-1 ${
                                progressData.status === 'completed' ? 'text-emerald-400' :
                                progressData.status === 'failed' ? 'text-red-400' :
                                progressData.status === 'saving' ? 'text-amber-400 animate-pulse' :
                                progressData.status === 'processing' ? 'text-purple-400 animate-pulse' : 'text-blue-400'
                              }`}>
                                {progressData.status === 'completed' && '✓ Completed'}
                                {progressData.status === 'failed' && '✗ Failed'}
                                {progressData.status === 'saving' && '⚡ Saving to Cloud'}
                                {progressData.status === 'processing' && '⚙ Processing'}
                                {progressData.status === 'uploading' && '☁ Uploading'}
                                {progressData.status === 'pending' && '⏱ Queued'}
                              </span>
                              <span className="text-zinc-300 font-bold">{progressData.progress}%</span>
                            </div>

                            {/* Individual Progress Bar Track */}
                            <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden border border-white/5">
                              <motion.div 
                                className={`h-full rounded-full ${
                                  progressData.status === 'completed' ? 'bg-emerald-500' :
                                  progressData.status === 'failed' ? 'bg-red-500' :
                                  progressData.status === 'saving' ? 'bg-gradient-to-r from-amber-400 to-pink-500' :
                                  progressData.status === 'processing' ? 'bg-gradient-to-r from-indigo-500 to-purple-500' : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                                }`}
                                initial={{ width: 0 }}
                                animate={{ width: `${progressData.progress}%` }}
                                transition={{ duration: 0.25, ease: 'easeOut' }}
                              />
                            </div>

                            {/* Individual fine-grained status feedback label */}
                            <p className="text-[10px] text-zinc-400 italic font-mono truncate leading-normal">
                              {progressData.statusText}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    files.map((file, idx) => (
                      <div 
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5 group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <File className="w-4 h-4 text-zinc-500 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-zinc-200 truncate">{file.name}</p>
                            <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{(file.size / 1024).toFixed(1)} KB</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Target Format picker (categorized + searchable) */}
                          {outputs.length > 1 && (
                            <TargetFormatPicker
                              currentTarget={targetFormats[file.name] || outputs[0]}
                              formats={Array.from(new Set([targetFormats[file.name] || outputs[0], ...outputs]))}
                              onChange={(format) => setTargetFormats(prev => ({ ...prev, [file.name]: format }))}
                              size="sm"
                              ariaLabel={`Target format for ${file.name}`}
                            />
                          )}
                          <button
                            onClick={() => removeFile(idx)}
                            className="p-1 text-zinc-600 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Tool specific custom workspaces */}
          {(selectedTool.name === 'Image Resize' || 
            selectedTool.name === 'Image Compress' || 
            selectedTool.name === 'Image Flip' || 
            selectedTool.name === 'Text to Speech' || 
            selectedTool.name === 'Markdown to HTML') && (
            <div className="p-5 rounded-2xl glass-card border border-white/5 space-y-4" id="tool-settings-panel">
              <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                <Settings className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-zinc-300">Advanced Engine Settings</span>
              </div>

              {selectedTool.name === 'Image Resize' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">Target Width (px)</label>
                    <input 
                      type="number" 
                      value={resizeWidth}
                      onChange={(e) => setResizeWidth(e.target.value)}
                      className="w-full glass-input rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">Target Height (px)</label>
                    <input 
                      type="number" 
                      value={resizeHeight}
                      onChange={(e) => setResizeHeight(e.target.value)}
                      className="w-full glass-input rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {selectedTool.name === 'Image Compress' && (
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                     <label className="text-xs font-medium text-zinc-400">Target Quality</label>
                     <span className="text-xs font-mono font-bold text-indigo-400">{compressQuality}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="10" 
                    max="100" 
                    value={compressQuality}
                    onChange={(e) => setCompressQuality(e.target.value)}
                    className="w-full accent-indigo-500 bg-black/40 rounded-lg h-1.5 appearance-none cursor-pointer"
                  />
                  <p className="text-[10px] text-zinc-500 mt-1">Lower quality reduces file size significantly.</p>
                </div>
              )}

              {selectedTool.name === 'Image Flip' && (
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">Flip Direction</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setFlipDirection('horizontal')}
                      className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                        flipDirection === 'horizontal' 
                          ? 'btn-primary text-white font-bold' 
                          : 'glass text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      Horizontal Symmetry
                    </button>
                    <button
                      onClick={() => setFlipDirection('vertical')}
                      className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                        flipDirection === 'vertical' 
                          ? 'btn-primary text-white font-bold' 
                          : 'glass text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      Vertical Symmetry
                    </button>
                  </div>
                </div>
              )}

              {selectedTool.name === 'Text to Speech' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">Text to render</label>
                    <textarea 
                      value={ttsText}
                      onChange={(e) => setTtsText(e.target.value)}
                      rows={3}
                      className="w-full glass-input rounded-xl px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none"
                      placeholder="Enter voice script text..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleTextToSpeech}
                      className="flex-1 inline-flex items-center justify-center gap-2 py-2 px-4 btn-primary text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      Listen & Render Narration
                    </button>
                  </div>
                </div>
              )}

              {selectedTool.name === 'Markdown to HTML' && (
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">Markdown Scratchpad Editor</label>
                  <textarea 
                    value={mdText}
                    onChange={(e) => setMdText(e.target.value)}
                    rows={4}
                    className="w-full glass-input rounded-xl px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none font-mono"
                    placeholder="# Hello World"
                  />
                </div>
              )}
            </div>
          )}

          {/* Trigger action button */}
          <button
            onClick={handleConvert}
            disabled={isProcessing || (files.length === 0 && selectedTool.name !== 'Text to Speech' && selectedTool.name !== 'Markdown to HTML')}
            className={`w-full py-3.5 rounded-xl text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg ${
              isProcessing 
                ? 'bg-white/5 text-zinc-400 cursor-not-allowed border border-white/5' 
                : files.length > 0 || selectedTool.name === 'Text to Speech' || selectedTool.name === 'Markdown to HTML'
                  ? 'btn-primary text-white'
                  : 'glass text-zinc-500 cursor-not-allowed'
            }`}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                Processing parallel batches on Cloudflare queue...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 text-emerald-400" />
                Initiate Sandbox Convert (uses {selectedTool.creditCost} credits)
              </>
            )}
          </button>

        </div>

        {/* Console monitor logs & Cloud integrations */}
        <div className="space-y-6">
          
          {/* Real-time server queues log console */}
          <div className="rounded-2xl glass-card border border-white/5 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between bg-white/2 border-b border-white/5 px-4 py-3">
              <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 font-mono flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                Queue Logs Console
              </span>
              <button 
                onClick={() => setShowLogs(!showLogs)}
                className="text-[10px] font-semibold text-indigo-400 hover:text-indigo-300"
              >
                {showLogs ? 'Hide console' : 'Reveal'}
              </button>
            </div>

            {showLogs ? (
              <div className="p-4 h-[180px] overflow-y-auto font-mono text-[10px] text-zinc-400 space-y-1.5 bg-black/20 leading-relaxed" id="live-terminal-logs">
                {currentLogs.length === 0 ? (
                  <p className="text-zinc-600 italic">No operations queued. Awaiting upload...</p>
                ) : (
                  currentLogs.map((log, idx) => {
                    let color = 'text-zinc-400';
                    if (log.includes('[SUCCESS]')) color = 'text-emerald-400 font-semibold';
                    else if (log.includes('[ERROR]')) color = 'text-red-400 font-bold';
                    else if (log.includes('[QUEUE]')) color = 'text-cyan-400';
                    else if (log.includes('[STORAGE]')) color = 'text-pink-400';
                    else if (log.includes('[CONVERT]')) color = 'text-purple-400';
                    return <p key={idx} className={color}>{log}</p>;
                  })
                )}
              </div>
            ) : (
              <div className="p-4 flex items-center justify-center h-[180px] bg-black/20 text-center">
                <p className="text-zinc-500 text-xs">Logs console minimized. Click "Reveal" to track progress steps in real time.</p>
              </div>
            )}
          </div>

          {/* active storage backends */}
          <div className="rounded-2xl glass-card border border-white/5 p-4 space-y-3">
            <div className="flex items-center gap-1.5">
              <HardDrive className="w-4 h-4 text-zinc-400" />
              <span className="text-xs font-bold text-zinc-300">Active Cloud Backends</span>
            </div>
            
            <div className="space-y-2">
              {integrations.filter(i => i.enabled).length === 0 ? (
                <p className="text-xs text-zinc-500 italic">No third-party storage integrated yet. Saved conversions will rest in Cloud Cache.</p>
              ) : (
                integrations.map((c, idx) => (
                  c.enabled && (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-black/40 border border-white/5 rounded-xl">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs font-semibold uppercase text-zinc-300">{c.provider} Storage Connected</span>
                    </div>
                  )
                ))
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Conversion Output Panel */}
      {conversions.length > 0 && (
        <div className="p-5 rounded-2xl glass-card border border-white/5 space-y-4 animate-fade-in" id="conversion-outputs-stage">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <h2 className="text-sm font-bold text-zinc-100">Batch Conversions Completed</h2>
            </div>
            <p className="text-xs text-zinc-500 font-mono">Completed: {conversions.length} file(s)</p>
          </div>

          <div className="space-y-2">
            {conversions.map((conv, idx) => (
              <div 
                key={idx}
                className="flex items-center justify-between p-4 rounded-xl bg-black/40 border border-white/5"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <File className="w-4.5 h-4.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-zinc-100 truncate">{conv.fileName}</p>
                    <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{(conv.fileSize / 1024).toFixed(1)} KB • {conv.toolName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleDownloadSingle(conv.downloadUrl || '#', conv.fileName)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 btn-primary active:scale-95 text-white text-xs font-bold rounded-lg transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download File
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Referral Program Hook Card (Gamification) */}
          <div className="mt-5 p-4 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-pink-500/10 border border-indigo-500/20 shadow-lg shadow-indigo-950/20 text-left relative overflow-hidden" id="conversion-referral-hook">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1 text-[9px] uppercase font-mono font-black tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
                  🎁 Referral Credits Hook
                </span>
                <h3 className="text-xs font-bold text-zinc-100">
                  {currentUser ? "Invite Coworkers & Get +100 Credits!" : "Get +15 Bonus Credits on Signup!"}
                </h3>
                <p className="text-[11px] text-zinc-400 leading-relaxed max-w-xl">
                  {currentUser ? (
                    <>
                      Share your unique referral link. When your friends register, they get <span className="text-emerald-400 font-semibold">+15 credits</span>. When they subscribe, both of you get <span className="text-indigo-400 font-bold font-mono">+100 bonus credits</span> instantly!
                    </>
                  ) : (
                    <>
                      Convert with no limits! Register a free account to unlock <span className="text-emerald-400 font-semibold">15 free daily credits</span> and active cloud connectors. Have a referral? Use it to get <span className="text-indigo-400 font-semibold">+15 bonus credits</span>!
                    </>
                  )}
                </p>
              </div>

              <div className="shrink-0 w-full md:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                {currentUser ? (
                  <div className="flex flex-col gap-2 w-full">
                    <div className="flex items-center gap-1.5 p-1 bg-black/40 border border-white/5 rounded-xl">
                      <span className="text-[9px] font-mono text-zinc-400 truncate max-w-[120px] pl-2">
                        {window.location.origin}/?ref={currentUser.id}
                      </span>
                      <button
                        onClick={() => {
                          const url = `${window.location.origin}/?ref=${currentUser.id}`;
                          navigator.clipboard.writeText(url);
                          setCopiedLinkInPanel(true);
                          setTimeout(() => setCopiedLinkInPanel(false), 2000);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black font-mono transition-all text-center cursor-pointer select-none ${
                          copiedLinkInPanel ? 'bg-emerald-600 text-white' : 'btn-primary text-white'
                        }`}
                      >
                        {copiedLinkInPanel ? 'Copied!' : 'Copy Link'}
                      </button>
                    </div>
                    {/* Share Buttons */}
                    <div className="flex items-center justify-end gap-1.5 mt-0.5">
                      <span className="text-[8px] uppercase tracking-wider font-mono text-zinc-500 mr-1 font-bold">Quick Share:</span>
                      {(() => {
                        const shareUrl = `${window.location.origin}/?ref=${currentUser.id}`;
                        const shareText = `Convert files instantly on OmniConvert! Sign up through my link to get +15 bonus credits, and we both get +100 premium credits on subscription! 🚀`;
                        
                        return (
                          <>
                            {/* Twitter/X */}
                            <a 
                              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
                              target="_blank" 
                              rel="noreferrer"
                              className="p-1 rounded bg-white/5 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors text-[9px] font-mono font-bold"
                              title="Share on X (Twitter)"
                            >
                              X
                            </a>
                            {/* LinkedIn */}
                            <a 
                              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                              target="_blank" 
                              rel="noreferrer"
                              className="p-1 rounded bg-white/5 hover:bg-blue-600/20 text-zinc-300 hover:text-blue-400 transition-colors text-[9px] font-mono font-bold"
                              title="Post to LinkedIn"
                            >
                              In
                            </a>
                            {/* WhatsApp */}
                            <a 
                              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`}
                              target="_blank" 
                              rel="noreferrer"
                              className="p-1 rounded bg-white/5 hover:bg-emerald-600/20 text-zinc-300 hover:text-emerald-400 transition-colors text-[9px] font-mono font-bold"
                              title="Share on WhatsApp"
                            >
                              WA
                            </a>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={onOpenAuth}
                    className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-lg transition-all text-center cursor-pointer"
                  >
                    Register & Claim +15 Credits
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* File Upload Source Selector Modal */}
      <AnimatePresence>
        {showSourceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSourceModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Modal Body */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="relative w-full max-w-xl rounded-3xl glass border border-zinc-200 dark:border-white/10 p-6 md:p-8 overflow-hidden shadow-2xl text-left"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Abstract decorative accent */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-white/5 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-zinc-800 dark:text-white tracking-tight">
                    {activeUploadSource === 'menu' && 'Select File Source'}
                    {activeUploadSource === 'url' && 'Import File by URL'}
                    {activeUploadSource === 'gdrive' && 'Google Drive File Picker'}
                    {activeUploadSource === 'dropbox' && 'Dropbox File Browser'}
                    {activeUploadSource === 'onedrive' && 'OneDrive Cloud Storage'}
                  </h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                    {activeUploadSource === 'menu' && 'Choose where to fetch your document from'}
                    {activeUploadSource === 'url' && 'Enter direct file link to pull into sandbox'}
                    {activeUploadSource === 'gdrive' && 'Access and import your Google Drive assets'}
                    {activeUploadSource === 'dropbox' && 'Import files securely from your Dropbox folder'}
                    {activeUploadSource === 'onedrive' && 'Browse and fetch files from your Microsoft OneDrive'}
                  </p>
                </div>
                <button 
                  onClick={() => setShowSourceModal(false)}
                  className="p-1.5 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-500/10 dark:hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4 rotate-45" />
                </button>
              </div>

              {/* MAIN OPTIONS MENU */}
              {activeUploadSource === 'menu' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Computer Option */}
                  <button
                    onClick={() => {
                      setShowSourceModal(false);
                      fileInputRef.current?.click();
                    }}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-500/5 dark:bg-white/3 border border-zinc-200 dark:border-white/5 hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all text-left group cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 dark:text-indigo-400 shrink-0 group-hover:scale-105 transition-transform">
                      <Laptop className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-100">From My Computer</h4>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">Upload local system documents</p>
                    </div>
                  </button>

                  {/* URL Option */}
                  <button
                    onClick={() => setActiveUploadSource('url')}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-500/5 dark:bg-white/3 border border-zinc-200 dark:border-white/5 hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all text-left group cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500 dark:text-purple-400 shrink-0 group-hover:scale-105 transition-transform">
                      <Link className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-100">By URL</h4>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">Stream direct download link</p>
                    </div>
                  </button>

                  {/* Google Drive Option */}
                  <button
                    onClick={() => {
                      setActiveUploadSource('gdrive');
                      setSelectedCloudFiles([]);
                      setCloudSearchQuery('');
                    }}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-500/5 dark:bg-white/3 border border-zinc-200 dark:border-white/5 hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all text-left group cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 dark:text-emerald-400 shrink-0 group-hover:scale-105 transition-transform">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-100">From Google Drive</h4>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">Browse your remote drive folders</p>
                    </div>
                  </button>

                  {/* Dropbox Option */}
                  <button
                    onClick={() => {
                      setActiveUploadSource('dropbox');
                      setSelectedCloudFiles([]);
                      setCloudSearchQuery('');
                    }}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-500/5 dark:bg-white/3 border border-zinc-200 dark:border-white/5 hover:border-blue-500/40 hover:bg-blue-500/5 transition-all text-left group cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-550 dark:text-blue-400 shrink-0 group-hover:scale-105 transition-transform">
                      <Cloud className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-100">From DropBox</h4>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">Sync stored Dropbox backups</p>
                    </div>
                  </button>

                  {/* OneDrive Option */}
                  <button
                    onClick={() => {
                      setActiveUploadSource('onedrive');
                      setSelectedCloudFiles([]);
                      setCloudSearchQuery('');
                    }}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-500/5 dark:bg-white/3 border border-zinc-200 dark:border-white/5 hover:border-cyan-500/40 hover:bg-cyan-500/5 transition-all text-left group cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-550 dark:text-cyan-400 shrink-0 group-hover:scale-105 transition-transform">
                      <FolderOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-100">From OneDrive</h4>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">Connect to Microsoft OneDrive</p>
                    </div>
                  </button>
                </div>
              )}

              {/* URL IMPORT SUB-VIEW */}
              {activeUploadSource === 'url' && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-600 dark:text-zinc-300 font-mono uppercase tracking-wider">DIRECT DOWNLOAD LINK</label>
                    <div className="relative">
                      <Link className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                      <input 
                        type="url"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        placeholder="https://example.com/assets/sample_document.pdf"
                        className="w-full glass-input rounded-xl py-2.5 pl-10 pr-4 text-xs"
                        autoFocus
                      />
                    </div>
                  </div>

                  <p className="text-[10px] text-zinc-550 dark:text-zinc-500 leading-normal italic font-mono bg-zinc-500/5 dark:bg-white/2 p-3 rounded-lg border border-zinc-200 dark:border-white/5">
                    * By submitting, the sandbox will automatically query the URL metadata, check headers, and download the content into the local workspace cache.
                  </p>

                  <div className="flex gap-2 justify-end pt-2 border-t border-zinc-200 dark:border-white/5">
                    <button 
                      onClick={() => setActiveUploadSource('menu')}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-zinc-500/5 dark:bg-white/5 hover:bg-zinc-500/10 dark:hover:bg-white/10 border border-zinc-200 dark:border-white/10 text-zinc-700 dark:text-zinc-300 cursor-pointer"
                    >
                      Back
                    </button>
                    <button 
                      onClick={() => {
                        if (!urlInput) return;
                        
                        // Extract filename from URL
                        let filename = 'document_url.bin';
                        try {
                          const parsed = new URL(urlInput);
                          const pathname = parsed.pathname;
                          const lastSegment = pathname.substring(pathname.lastIndexOf('/') + 1);
                          if (lastSegment && lastSegment.includes('.')) {
                            filename = lastSegment;
                          } else {
                            filename = `url_document.${outputs[0]?.toLowerCase() || 'pdf'}`;
                          }
                        } catch {
                          filename = `url_document.${outputs[0]?.toLowerCase() || 'pdf'}`;
                        }

                        // Create file
                        const virtualFile = new File(["url-payload"], filename, { type: "application/octet-stream" });
                        setFiles(prev => [...prev, virtualFile]);
                        setTargetFormats(prev => ({ ...prev, [virtualFile.name]: outputs[0] }));
                        setShowSourceModal(false);
                        setUrlInput('');
                      }}
                      disabled={!urlInput}
                      className={`px-5 py-2 rounded-xl text-xs font-bold text-white cursor-pointer ${
                        urlInput ? 'btn-primary' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 cursor-not-allowed border border-zinc-300 dark:border-white/5'
                      }`}
                    >
                      Connect & Pull Document
                    </button>
                  </div>
                </div>
              )}

              {/* CLOUD DRIVES FILE PICKER SUB-VIEW */}
              {(activeUploadSource === 'gdrive' || activeUploadSource === 'dropbox' || activeUploadSource === 'onedrive') && (
                <div className="space-y-4">
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-550" />
                    <input 
                      type="text"
                      value={cloudSearchQuery}
                      onChange={(e) => setCloudSearchQuery(e.target.value)}
                      placeholder="Search cloud drive files..."
                      className="w-full bg-zinc-100 dark:bg-black/60 border border-zinc-200 dark:border-white/5 rounded-xl py-2 pl-9 pr-4 text-xs text-zinc-800 dark:text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>

                  {/* Files List */}
                  <div className="max-h-[220px] overflow-y-auto space-y-2 border border-zinc-200 dark:border-white/5 bg-zinc-100/50 dark:bg-black/30 rounded-2xl p-2">
                    {(() => {
                      const sourceFiles = activeUploadSource === 'gdrive' 
                        ? GOOGLE_DRIVE_MOCK_FILES 
                        : activeUploadSource === 'dropbox' 
                          ? DROPBOX_MOCK_FILES 
                          : ONEDRIVE_MOCK_FILES;

                      const filtered = sourceFiles.filter(f => 
                        f.name.toLowerCase().includes(cloudSearchQuery.toLowerCase())
                      );

                      if (filtered.length === 0) {
                        return <p className="text-zinc-500 italic text-xs text-center py-8">No files found matching search criteria.</p>;
                      }

                      return filtered.map((file, idx) => {
                        const isSelected = selectedCloudFiles.includes(file.name);
                        const isMatched = isCompatibleExtension(file.name, selectedTool.input);
                        
                        // Custom extension color coding
                        let colorClass = 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20';
                        if (file.ext === 'pdf') colorClass = 'bg-blue-500/10 text-blue-500 dark:text-blue-400 border-blue-500/20';
                        else if (file.ext === 'docx' || file.ext === 'xlsx') colorClass = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
                        else if (file.ext === 'pptx') colorClass = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
                        else if (file.ext === 'png' || file.ext === 'jpg') colorClass = 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
                        else if (file.ext === 'md') colorClass = 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20';

                        return (
                          <div 
                            key={idx}
                            onClick={() => {
                              setSelectedCloudFiles(prev => 
                                isSelected 
                                  ? prev.filter(name => name !== file.name)
                                  : [...prev, file.name]
                              );
                            }}
                            className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                              isSelected 
                                ? 'bg-indigo-500/10 border-indigo-500/30' 
                                : 'bg-zinc-500/5 dark:bg-white/2 border-zinc-200 dark:border-white/5 hover:border-zinc-300 dark:hover:border-white/10 hover:bg-zinc-200/50 dark:hover:bg-white/3'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${colorClass}`}>
                                <FileText className="w-4 h-4" />
                              </div>
                              <div className="min-w-0 text-left">
                                <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate">{file.name}</p>
                                <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {isMatched && (
                                <span className="text-[9px] font-mono uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-bold">
                                  Matches Tool
                                </span>
                              )}
                              <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                                isSelected 
                                  ? 'bg-indigo-50 border-indigo-500 text-white' 
                                  : 'border-zinc-350 dark:border-white/20 bg-zinc-100 dark:bg-black/40'
                              }`}>
                                {isSelected && (
                                  <svg className="w-2.5 h-2.5 stroke-current" fill="none" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>

                  <div className="flex gap-2 justify-end pt-2 border-t border-zinc-200 dark:border-white/5">
                    <button 
                      onClick={() => setActiveUploadSource('menu')}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-zinc-500/5 dark:bg-white/5 hover:bg-zinc-500/10 dark:hover:bg-white/10 border border-zinc-200 dark:border-white/10 text-zinc-700 dark:text-zinc-300 cursor-pointer"
                    >
                      Back
                    </button>
                    <button 
                      onClick={() => {
                        if (selectedCloudFiles.length === 0) return;
                        
                        const imported: File[] = [];
                        const formatsUpdate = { ...targetFormats };
                        
                        selectedCloudFiles.forEach(name => {
                          const fileObj = new File(["cloud-payload"], name, { type: "application/octet-stream" });
                          imported.push(fileObj);
                          if (!formatsUpdate[name]) {
                            formatsUpdate[name] = outputs[0];
                          }
                        });

                        setFiles(prev => [...prev, ...imported]);
                        setTargetFormats(formatsUpdate);
                        setShowSourceModal(false);
                        setSelectedCloudFiles([]);
                      }}
                      disabled={selectedCloudFiles.length === 0}
                      className={`px-5 py-2 rounded-xl text-xs font-bold text-white cursor-pointer ${
                        selectedCloudFiles.length > 0 ? 'btn-primary' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 cursor-not-allowed border border-zinc-300 dark:border-white/5'
                      }`}
                    >
                      Import Selection ({selectedCloudFiles.length})
                    </button>
                  </div>
                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
