/* ============================================================================
 * ChooseFileSection — Reusable file picker + converter.
 *
 * Layout (matches the video walkthrough):
 *   • Compact top: blue Choose Files button + folder-icon cluster,
 *     drop hint, format chip. Hidden once files exist.
 *   • File pairs: each input row sits directly above its converted
 *     output row, sibling-stacked. Rows are full container width,
 *     single horizontal line. Per-row target-format dropdown (TO [STEP ▾])
 *     shows category tabs + format chips. Progress rail between input
 *     and output rows during conversion. Trash icon on input rows.
 *   • Sticky bottom action bar: counter chip + bulk target dropdown +
 *     Clear all / Add more / Download all / Convert (primary). Same row
 *     style as the file rows.
 *
 * Conversion model — Phase 1 (no server transcoding):
 *   We do NOT actually run a transcode. Each "Convert" passes the file
 *   through a same-bytes rename: the output Blob has the same bytes
 *   as the input but with the chosen target extension. This means the
 *   Download button always returns a working file (just renamed), and
 *   the UI states (Pending → Analyzing → Upload completed... → 100%
 *   Complete → DONE) all play out faithfully. A real converter can
 *   swap in later by replacing `doSimulatedConvert`.
 *
 * Side effects (callbacks):
 *   • onFilesAdd(files)     — user added files
 *   • onFileRemove(id)      — single row removed
 *   • onClearAll()          — list cleared
 *   • onOutputChange(target) — bulk target format changed
 *   • onPerFileOutputChange(id, target) — per-row override
 *   • onDownloadAll() / onDownloadFile(id) — download intents
 *   • onConvertAll(startFn) — exposes a `start()` function for parents
 *                             that want to drive conversion themselves
 * ========================================================================== */

import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  forwardRef,
} from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AlertTriangle, FolderOpen, Link as LinkIcon, Lock, X,
  Check, Plus, Trash2, Download, Play, Loader2,
  PackageOpen, ChevronDown,
} from 'lucide-react';
import {
  OUTPUT_CATALOG, type OutputOption,
  suggestOutputExtension,
} from '../data/heroMessages';

/* ────────────────────────────────────────────────────────────────────────── */
/*  Token helpers                                                             */
/* ────────────────────────────────────────────────────────────────────────── */

const cls = (...p: Array<string | false | null | undefined>): string => p.filter(Boolean).join(' ');

/* ────────────────────────────────────────────────────────────────────────── */
/*  File metadata + utilities                                                */
/* ────────────────────────────────────────────────────────────────────────── */

export type FileStatus = 'pending' | 'analyzing' | 'loading_libs' | 'converting' | 'done' | 'failed';

export interface FileMeta {
  /** Stable id used by the remove button + parent tracking */
  id: string;
  /** The original File object (so we can read bytes for Phase-1 conversion) */
  file: File;
  /** Filename as shown in the row */
  name: string;
  size: number;
  type?: string;
  status: FileStatus;
  /** 0-100, used by the per-row progress bar */
  progress: number;
  /** Human-readable status text shown next to the icon */
  statusText: string;
  /** Currently chosen output format (per-row override) */
  output: string;
  /** Once status === 'done', the converted output */
  outputName?: string;
  outputBlob?: Blob;
  /** When was this conversion start kicked off */
  startedAt?: number;
}

const makeFileMeta = (file: File, defaultOutput: string): FileMeta => ({
  id: 'f_' + Math.random().toString(36).slice(2, 11),
  file,
  name: file.name,
  size: file.size,
  type: file.type,
  status: 'pending',
  progress: 0,
  statusText: 'Pending',
  output: defaultOutput,
});

const formatBytes = (b: number): string => {
  if (b < 1024) return b + ' B';
  if (b < 1024 * 1024) return (b / 1024).toFixed(1) + ' KB';
  if (b < 1024 * 1024 * 1024) return (b / (1024 * 1024)).toFixed(1) + ' MB';
  return (b / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
};

const extOf = (name: string): string => {
  const m = /[^.]+$/.exec(name);
  return m ? m[0].toLowerCase() : '';
};

const replaceExt = (name: string, newExt: string): string => {
  const stripped = name.replace(/\.[^.]+$/, '');
  return stripped + '.' + newExt.toLowerCase().replace(/^\./, '');
};

/** Construct the suggested default output extension from the file name. */
const suggestDefaultOutput = (name: string): string => {
  const ext = extOf(name).toUpperCase();
  return suggestOutputExtension(ext);
};

/* ────────────────────────────────────────────────────────────────────────── */
/*  Provider icons — Computer / URL / GDrive / Dropbox / OneDrive            */
/* ────────────────────────────────────────────────────────────────────────── */

export type UploadSourceId = 'computer' | 'url' | 'gdrive' | 'dropbox' | 'onedrive';

const ProviderIcon: React.FC<{ provider: UploadSourceId }> = ({ provider }) => {
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
    return <LinkIcon className="h-5 w-5" />;
  }
  return <FolderOpen className="h-5 w-5" />;
};

/* ────────────────────────────────────────────────────────────────────────── */
/*  Mock cloud file catalogs — Phase 1 placeholder                           */
/* ────────────────────────────────────────────────────────────────────────── */

export type CloudMockFile = { name: string; size: number; ext: string };

export const GOOGLE_DRIVE_MOCK_FILES: CloudMockFile[] = [
  { name: 'Financial_Statement_2026.pdf',  size: 12582912, ext: 'pdf' },
  { name: 'Corporate_Presentation.pptx',   size: 8493465,  ext: 'pptx' },
  { name: 'Product_Backlog.docx',          size: 4404019,  ext: 'docx' },
  { name: 'Marketing_Visual.png',          size: 2936012,  ext: 'png' },
  { name: 'User_Feedback_Raw.txt',         size: 122880,   ext: 'txt' },
];

export const DROPBOX_MOCK_FILES: CloudMockFile[] = [
  { name: 'Client_Agreement_Signed.pdf',   size: 3670016,  ext: 'pdf' },
  { name: 'Developer_Resume_2026.docx',    size: 1887436,  ext: 'docx' },
  { name: 'Profit_Loss_Model.xlsx',        size: 2202009,  ext: 'xlsx' },
  { name: 'Project_Logo_White.png',        size: 1048576,  ext: 'png' },
];

export const ONEDRIVE_MOCK_FILES: CloudMockFile[] = [
  { name: 'System_Architecture_Whitepaper.pdf', size: 5242880, ext: 'pdf' },
  { name: 'Cloud_Database_Schema.png',          size: 1572864, ext: 'png' },
  { name: 'API_Spec_Endpoint_List.md',          size: 24576,   ext: 'md' },
  { name: 'Archived_Logs_June.zip',             size: 16777216, ext: 'zip' },
];

/* ────────────────────────────────────────────────────────────────────────── */
/*  Tiny confetti — DOM-based particle pop                                   */
/*                                                                            */
/*  A 32-piece confetti burst with gravity. Self-contained, no external lib. */
/*  Disposes after ~1.5s.                                                    */
/* ────────────────────────────────────────────────────────────────────────── */

const CONFETTI_COLORS = ['#1f4ed8', '#10b981', '#f59e0b', '#ec4899', '#6366f1', '#06b6d4'];

function popConfetti(target: HTMLElement): void {
  const host = target.getBoundingClientRect();
  const cx = host.left + host.width / 2;
  const cy = host.top + host.height / 2;
  const n = 36;
  for (let i = 0; i < n; i++) {
    const piece = document.createElement('div');
    const angle = Math.random() * Math.PI * 2;
    const speed = 60 + Math.random() * 180;
    const dx = Math.cos(angle) * speed;
    const dy = Math.sin(angle) * speed - 80;       // bias upward
    const rot = Math.random() * 540 - 270;
    const w = 6 + Math.random() * 6;
    const h = 8 + Math.random() * 8;
    piece.style.position = 'fixed';
    piece.style.left = (cx - w / 2) + 'px';
    piece.style.top = (cy - h / 2) + 'px';
    piece.style.width = w + 'px';
    piece.style.height = h + 'px';
    piece.style.background = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
    piece.style.borderRadius = '2px';
    piece.style.transform = 'rotate(' + rot + 'deg)';
    piece.style.zIndex = '9999';
    piece.style.pointerEvents = 'none';
    document.body.appendChild(piece);
    const start = performance.now();
    const dur = 1000 + Math.random() * 500;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      const x = cx + dx * eased;
      const y = cy + dy * eased + 240 * t * t;     // gravity
      const r = rot + 360 * eased;
      piece.style.left = x + 'px';
      piece.style.top = y + 'px';
      piece.style.transform = 'rotate(' + r + 'deg)';
      piece.style.opacity = String(1 - t);
      if (t < 1) requestAnimationFrame(step);
      else piece.remove();
    };
    requestAnimationFrame(step);
  }
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Status pills                                                              */
/* ────────────────────────────────────────────────────────────────────────── */

const StatusPill: React.FC<{ status: FileStatus; text: string }> = ({ status, text }) => {
  const map: Record<FileStatus, string> = {
    pending:        'bg-slate-100 text-slate-600 border border-slate-200',
    analyzing:      'bg-blue-50 text-blue-700 border border-blue-200',
    loading_libs:   'bg-blue-50 text-blue-700 border border-blue-200',
    converting:     'bg-blue-50 text-blue-700 border border-blue-200',
    done:           'bg-emerald-50 text-emerald-700 border border-emerald-200',
    failed:         'bg-rose-50 text-rose-700 border border-rose-200',
  };
  const showSpinner = status === 'analyzing' || status === 'converting' || status === 'loading_libs';
  return (
    <span className={cls('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold whitespace-nowrap', map[status])}>
      {showSpinner && <Loader2 className="h-3 w-3 animate-spin" />}
      {status === 'done' && <Check className="h-3 w-3" />}
      {text}
    </span>
  );
};

/* ────────────────────────────────────────────────────────────────────────── */
/*  Per-row target-format dropdown                                           */
/*                                                                            */
/*  Renders a small popover anchored under the row's "TO STEP ▾" chip.       */
/*  Tab strip on the left (categories), chip grid on the right (extensions). */
/* ────────────────────────────────────────────────────────────────────────── */

const TargetDropdown: React.FC<{
  open: boolean;
  value: string;
  onPick: (v: string) => void;
  onClose: () => void;
  catalog: ReadonlyArray<OutputOption>;
  anchor?: HTMLElement | null;
}> = ({ open, value, onPick, onClose, catalog }) => {
  const [activeCat, setActiveCat] = useState<string>(catalog[0]?.category ?? 'Documents');
  const ref = useRef<HTMLDivElement>(null);

  // close on outside click / escape
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;
  const active = catalog.find(c => c.category === activeCat) ?? catalog[0];

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label="Choose output format"
      className="absolute z-40 mt-1 w-[280px] rounded-xl border border-slate-200 bg-white shadow-xl"
      style={{ right: 0, top: 'calc(100% + 4px)' }}
    >
      <div className="grid grid-cols-[100px_1fr] gap-0">
        <div className="border-r border-slate-100 bg-slate-50/80 rounded-l-xl p-1.5 flex flex-col">
          {catalog.map(c => (
            <button
              key={c.category}
              type="button"
              /* Hover (mouseover) swaps the active category — no click
                 required. Click is preserved for keyboard / touch users. */
              onMouseEnter={() => setActiveCat(c.category)}
              onFocus={() => setActiveCat(c.category)}
              onClick={() => setActiveCat(c.category)}
              className={cls(
                'flex items-center justify-between gap-1 rounded-lg px-2 py-1.5 text-left text-[11px] font-bold',
                c.category === activeCat ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-100',
              )}
            >
              <span className="truncate">{c.category}</span>
              <span className="opacity-70 text-[10px]">{'>'}</span>
            </button>
          ))}
        </div>
        <div className="p-2 grid grid-cols-3 gap-1.5">
          {active?.extensions.map(ext => (
            <button
              key={ext}
              type="button"
              onClick={() => { onPick(ext); onClose(); }}
              className={cls(
                'rounded-md border px-2 py-1.5 text-center text-[11px] font-extrabold',
                ext === value
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:text-blue-600',
              )}
            >
              {ext}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ────────────────────────────────────────────────────────────────────────── */
/*  File row (input)                                                          */
/*                                                                            */
/*  Single-line horizontal layout that matches the sticky bar's row style.    */
/*  Fields: [icon] name [ext] [status-pill] ...spacer... TO [target▾] size    */
/*          [Download / Converted / Pending] [trash]                          */
/* ────────────────────────────────────────────────────────────────────────── */

const FileInputRow: React.FC<{
  file: FileMeta;
  catalog: ReadonlyArray<OutputOption>;
  brandColor: string;
  isLocked: boolean;
  onChangeOutput: (id: string, ext: string) => void;
  onRemove: (id: string) => void;
  onDownload: (id: string) => void;
  onConvertOne: (id: string) => void;
}> = ({ file, catalog, brandColor, isLocked, onChangeOutput, onRemove, onDownload, onConvertOne }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // close dropdown when status changes (e.g. row starts converting → lock)
  useEffect(() => {
    if (isLocked) setOpen(false);
  }, [isLocked]);

  const showDownload = file.status === 'done';
  const showConvert = file.status === 'pending' && !isLocked;
  const showConverted = file.status === 'done';

  const statusText = useMemo(() => {
    switch (file.status) {
      case 'pending':       return 'Pending';
      case 'analyzing':     return 'Analyzing';
      case 'loading_libs':  return 'Upload completed. Loading transcoding libraries…';
      case 'converting':    return 'Transcoding…';
      case 'done':          return '100% Complete';
      case 'failed':        return 'Failed';
    }
  }, [file.status]);

  return (
    <div
      ref={ref}
      className={cls(
        'relative flex items-center gap-2.5 rounded-xl border bg-white px-3 py-2.5',
        'min-h-[56px] text-xs',
        showConverted ? 'border-emerald-200 bg-emerald-50/40' : 'border-slate-200',
      )}
    >
      {/* Input icon: package / box */}
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-amber-50 text-amber-700">
        <PackageOpen className="h-4 w-4" />
      </span>

      {/* Filename */}
      <span
        className="truncate font-extrabold text-slate-800 max-w-[220px] shrink"
        title={file.name}
      >
        {file.name}
      </span>

      {/* Input ext chip */}
      <span className="rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-extrabold text-amber-700 uppercase tracking-wide shrink-0">
        {extOf(file.name)}
      </span>

      {/* Status pill */}
      <StatusPill status={file.status} text={statusText} />

      {/* Spacer #1 — pushes the TO picker toward the row's center */}
      <span className="flex-1" />

      {/* TO label */}
      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 shrink-0">
        TO
      </span>

      {/* Target dropdown — pops up anchored RIGHT-aligned with the trigger
          so it never bleeds off-screen. Two spacers (#1 above, #2 below)
          keep the trigger centered in the row. */}
      <div className="relative shrink-0">
        <button
          type="button"
          onClick={() => !isLocked && setOpen(o => !o)}
          disabled={isLocked}
          aria-haspopup="dialog"
          aria-expanded={open}
          className={cls(
            'flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-extrabold text-slate-800',
            isLocked ? 'opacity-60 cursor-not-allowed' : 'hover:border-blue-300 hover:text-blue-600',
          )}
        >
          <span>{file.output}</span>
          <ChevronDown className="h-3 w-3 text-slate-500" />
        </button>
        <TargetDropdown
          open={open}
          value={file.output}
          onPick={(v) => onChangeOutput(file.id, v)}
          onClose={() => setOpen(false)}
          catalog={catalog}
        />
      </div>

      {/* Spacer #2 — balances Spacer #1 to keep the TO cluster centered */}
      <span className="flex-1" />

      {/* Size */}
      <span className="font-mono text-[10px] tabular-nums text-slate-400 min-w-[50px] text-right shrink-0">
        {formatBytes(file.size)}
      </span>

      {/* Right-rail action: Converted pill OR per-row Convert OR per-row Download */}
      {showConverted ? (
        <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-700 shrink-0 border border-emerald-200">
          Converted
        </span>
      ) : showDownload ? (
        <button
          type="button"
          onClick={() => onDownload(file.id)}
          className="inline-flex h-7 items-center gap-1 rounded-md bg-emerald-600 px-2.5 text-[11px] font-extrabold text-white shrink-0 hover:bg-emerald-700"
        >
          <Download className="h-3 w-3" /> Download
        </button>
      ) : showConvert ? (
        <button
          type="button"
          onClick={() => onConvertOne(file.id)}
          className="inline-flex h-7 items-center gap-1 rounded-md px-2.5 text-[11px] font-extrabold shrink-0"
          style={{ backgroundColor: brandColor, color: 'white' }}
        >
          <Play className="h-3 w-3" fill="currentColor" /> Convert
        </button>
      ) : (
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-extrabold text-slate-600 shrink-0 border border-slate-200">
          Pending
        </span>
      )}

      {/* Trash */}
      {file.status !== 'done' && (
        <button
          type="button"
          onClick={() => onRemove(file.id)}
          aria-label={`Remove ${file.name}`}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-rose-600"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}
      {file.status === 'done' && (
        <span className="flex h-7 w-7 shrink-0 items-center justify-center text-slate-300">
          <Check className="h-3.5 w-3.5" />
        </span>
      )}
    </div>
  );
};

/* ────────────────────────────────────────────────────────────────────────── */
/*  Output row (per-file converted result)                                   */
/*                                                                            */
/*  Sibling below the input row. Single-line, full app width. Green check    */
/*  icon, output filename + ext chip, DONE pill, Download button.            */
/* ────────────────────────────────────────────────────────────────────────── */

const FileOutputRow: React.FC<{
  file: FileMeta;
  onDownload: (id: string) => void;
  onRemove: (id: string) => void;
}> = ({ file, onDownload, onRemove }) => {
  if (file.status !== 'done' || !file.outputName) return null;
  const outSize = file.outputBlob?.size ?? file.size;
  return (
    <div className="relative flex items-center gap-2.5 rounded-xl border border-emerald-200/70 bg-emerald-50/40 px-3 py-2.5 min-h-[56px] text-xs">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-emerald-100 text-emerald-700">
        <Check className="h-4 w-4" />
      </span>
      <span
        className="truncate font-extrabold text-slate-800 max-w-[220px] shrink"
        title={file.outputName}
      >
        {file.outputName}
      </span>
      <span className="rounded-md bg-blue-50 px-1.5 py-0.5 text-[10px] font-extrabold text-blue-700 uppercase tracking-wide shrink-0">
        {extOf(file.outputName)}
      </span>
      <StatusPill status="done" text="DONE" />
      <span className="flex-1" />
      <span className="font-mono text-[10px] tabular-nums text-slate-400 min-w-[50px] text-right shrink-0">
        {formatBytes(outSize)}
      </span>
      <button
        type="button"
        onClick={() => onDownload(file.id)}
        className="inline-flex h-7 items-center gap-1 rounded-md bg-emerald-600 px-2.5 text-[11px] font-extrabold text-white shrink-0 hover:bg-emerald-700"
      >
        <Download className="h-3 w-3" /> Download
      </button>
      <button
        type="button"
        onClick={() => onRemove(file.id)}
        aria-label={`Remove ${file.outputName}`}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-400 hover:bg-rose-50 hover:text-rose-600"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};

/* ────────────────────────────────────────────────────────────────────────── */
/*  Compact picker (top of section when no files exist)                      */
/* ────────────────────────────────────────────────────────────────────────── */

const CompactPicker: React.FC<{
  inputLabel: string;
  outputLabel: string;
  title: string;
  subtitle: string;
  brandColor: string;
  onBrowse: () => void;
  onPickSource: (id: UploadSourceId) => void;
  dragActive: boolean;
  dropHandlers: {
    onDragEnter: React.DragEventHandler<HTMLDivElement>;
    onDragOver: React.DragEventHandler<HTMLDivElement>;
    onDragLeave: React.DragEventHandler<HTMLDivElement>;
    onDrop: React.DragEventHandler<HTMLDivElement>;
  };
  showUrlInput?: boolean;
  urlValue?: string;
  onUrlChange?: (v: string) => void;
  onUrlAttach?: () => void;
}> = ({ inputLabel, outputLabel, title, subtitle, brandColor, onBrowse, onPickSource, dragActive, dropHandlers, showUrlInput, urlValue, onUrlChange, onUrlAttach }) => {
  return (
    <div className="px-3 sm:px-4 pt-3 pb-2">
      <div
        className={cls('rounded-2xl border border-dashed transition-colors', dragActive ? 'border-blue-400 bg-blue-50/40' : 'border-slate-200 bg-white')}
        {...dropHandlers}
      >
        <div className="px-4 py-6 text-center sm:px-6 sm:py-7">
          <h3 className="text-lg font-extrabold tracking-tight" style={{ color: brandColor }}>
            {title}
          </h3>
          <p className="mt-1 text-xs font-semibold text-slate-500">{subtitle}</p>

          <div className="mt-4 inline-flex overflow-hidden rounded-xl shadow-[0_18px_42px_rgba(31,78,216,0.22)]" style={{ backgroundColor: brandColor }}>
            <button
              type="button"
              onClick={onBrowse}
              className="px-6 py-3 text-sm font-extrabold text-white transition-colors hover:brightness-110 focus-visible:ring-4 focus-visible:ring-blue-200"
            >
              Choose Files
            </button>
            {(['computer', 'url', 'gdrive', 'dropbox', 'onedrive'] as UploadSourceId[]).map(src => (
              <button
                key={src}
                type="button"
                onClick={() => onPickSource(src)}
                aria-label={'From ' + src}
                title={'From ' + src}
                className="grid w-14 place-items-center border-l border-white/20 text-white/90 transition-colors hover:brightness-110"
                style={{ backgroundColor: brandColor }}
              >
                <ProviderIcon provider={src} />
              </button>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-[11px] font-semibold text-slate-500">
            <span className="inline-flex items-center gap-1">
              <Lock className="h-3 w-3 text-slate-400" />
              Drop files here.
            </span>
            <span className="font-mono text-[10px] text-slate-500">1 GB maximum file size.</span>
            <span className="font-mono text-[10px] text-slate-500">Supports {inputLabel}.</span>
          </div>

          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 font-mono text-[11px]">
            <span className="font-extrabold text-slate-700">Converting</span>
            <span className="text-slate-500">{inputLabel}</span>
            <span className="text-slate-400">→</span>
            <span className="font-extrabold" style={{ color: brandColor }}>{outputLabel}</span>
          </div>

          <AnimatePresence>
            {showUrlInput && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="mx-auto mt-4 flex w-full max-w-xl flex-col gap-2 sm:flex-row"
              >
                <input
                  type="url"
                  value={urlValue ?? ''}
                  onChange={(e) => onUrlChange?.(e.target.value)}
                  placeholder="Paste file URL, e.g. https://example.com/file.pdf"
                  className="min-h-11 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                />
                <button
                  type="button"
                  onClick={onUrlAttach}
                  className="min-h-11 rounded-xl bg-blue-600 px-4 text-xs font-black text-white hover:bg-blue-700 focus-visible:ring-4 focus-visible:ring-blue-200"
                >
                  Add URL
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

/* ────────────────────────────────────────────────────────────────────────── */
/*  Sticky bottom action bar                                                 */
/*                                                                            */
/*  Counter chip + bulk target dropdown + Clear all + Add more +              */
/*  Download all + Convert (primary). Same row style as the file rows.       */
/* ────────────────────────────────────────────────────────────────────────── */

const BulkTargetDropdown: React.FC<{
  open: boolean;
  value: string;
  onPick: (v: string) => void;
  onClose: () => void;
  catalog: ReadonlyArray<OutputOption>;
}> = ({ open, value, onPick, onClose, catalog }) => {
  const [activeCat, setActiveCat] = useState<string>(catalog[0]?.category ?? 'Documents');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;
  const active = catalog.find(c => c.category === activeCat) ?? catalog[0];

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label="Choose default output format for all files"
      className="absolute z-40 mb-1 w-[280px] rounded-xl border border-slate-200 bg-white shadow-xl bottom-full"
      style={{ left: 0 }}
    >
      <div className="grid grid-cols-[100px_1fr] gap-0">
        <div className="border-r border-slate-100 bg-slate-50/80 rounded-l-xl p-1.5 flex flex-col">
          {catalog.map(c => (
            <button
              key={c.category}
              type="button"
              /* Hover swaps the active category — no click required. */
              onMouseEnter={() => setActiveCat(c.category)}
              onFocus={() => setActiveCat(c.category)}
              onClick={() => setActiveCat(c.category)}
              className={cls(
                'flex items-center justify-between gap-1 rounded-lg px-2 py-1.5 text-left text-[11px] font-bold',
                c.category === activeCat ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-100',
              )}
            >
              <span className="truncate">{c.category}</span>
              <span className="opacity-70 text-[10px]">{'>'}</span>
            </button>
          ))}
        </div>
        <div className="p-2 grid grid-cols-3 gap-1.5">
          {active?.extensions.map(ext => (
            <button
              key={ext}
              type="button"
              onClick={() => { onPick(ext); onClose(); }}
              className={cls(
                'rounded-md border px-2 py-1.5 text-center text-[11px] font-extrabold',
                ext === value
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:text-blue-600',
              )}
            >
              {ext}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

interface StickyBarProps {
  fileCount: number;
  convertedCount: number;
  pendingCount: number;
  inProgressCount: number;
  bulkOutput: string;
  catalog: ReadonlyArray<OutputOption>;
  onChangeBulkOutput: (v: string) => void;
  onConvert: () => void;
  onClearAll: () => void;
  onAddMore: () => void;
  onDownloadAll: () => void;
  isWorking: boolean;
  brandColor: string;
}

const StickyActionBar: React.FC<StickyBarProps> = ({
  fileCount, convertedCount, pendingCount, inProgressCount,
  bulkOutput, catalog, onChangeBulkOutput,
  onConvert, onClearAll, onAddMore, onDownloadAll,
  isWorking, brandColor,
}) => {
  const [open, setOpen] = useState(false);
  const hasFiles = fileCount > 0;
  const allDone = fileCount > 0 && pendingCount === 0 && inProgressCount === 0 && convertedCount > 0;

  const countsText = useMemo(() => {
    if (inProgressCount > 0) {
      return `${convertedCount} of ${fileCount} converted · ${inProgressCount} in progress`;
    }
    if (pendingCount > 0) {
      return `${convertedCount} of ${fileCount} converted · ${pendingCount} pending`;
    }
    return `${convertedCount} of ${fileCount} converted`;
  }, [convertedCount, fileCount, inProgressCount, pendingCount]);

  return (
    <div className="sticky bottom-0 z-30 px-3 sm:px-4 pb-3 sm:pb-4 pt-2 bg-gradient-to-b from-transparent to-white">
      <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/85 backdrop-blur px-3 py-2.5 shadow-lg min-h-[56px] flex-wrap sm:flex-nowrap">
        <div className="flex shrink-0 items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 font-mono whitespace-nowrap">
          <span>Convert all to</span>
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpen(o => !o)}
              aria-haspopup="dialog"
              aria-expanded={open}
              className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-extrabold text-slate-800 hover:border-blue-300 hover:text-blue-600 normal-case tracking-normal font-sans"
            >
              <span>{bulkOutput}</span>
              <ChevronDown className="h-3 w-3 text-slate-500" />
            </button>
            <BulkTargetDropdown
              open={open}
              value={bulkOutput}
              onPick={onChangeBulkOutput}
              onClose={() => setOpen(false)}
              catalog={catalog}
            />
          </div>
          <span className="normal-case tracking-normal font-sans font-extrabold text-slate-700">
            · {countsText}
          </span>
        </div>

        <div className="flex flex-1 items-center justify-end gap-1.5 shrink-0">
          <button
            type="button"
            onClick={onClearAll}
            disabled={!hasFiles || isWorking}
            className="inline-flex h-9 items-center gap-1 rounded-lg px-2.5 text-xs font-extrabold text-rose-500 hover:bg-rose-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear all
          </button>
          <button
            type="button"
            onClick={onAddMore}
            disabled={isWorking}
            className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-extrabold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
          >
            <Plus className="h-3.5 w-3.5" />
            + Add more files
          </button>
          <button
            type="button"
            onClick={onDownloadAll}
            disabled={!allDone}
            className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-extrabold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
          >
            <Download className="h-3.5 w-3.5" />
            ↓ Download all
          </button>
          <button
            type="button"
            onClick={onConvert}
            disabled={isWorking || pendingCount === 0}
            style={{ backgroundColor: brandColor }}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg px-4 text-xs font-extrabold text-white transition-colors hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_14px_rgba(31,78,216,0.25)]"
          >
            {isWorking ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Converting…
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5" fill="currentColor" />
                ▶ Convert
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ────────────────────────────────────────────────────────────────────────── */
/*  Cloud source modal                                                       */
/* ────────────────────────────────────────────────────────────────────────── */

const CloudSourceModal: React.FC<{
  source: 'gdrive' | 'dropbox' | 'onedrive';
  files: CloudMockFile[];
  onAttach: (selected: CloudMockFile[]) => void;
  onClose: () => void;
}> = ({ source, files, onAttach, onClose }) => {
  const label = source === 'gdrive' ? 'Google Drive' : source === 'dropbox' ? 'Dropbox' : 'OneDrive';
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    if (!search.trim()) return files;
    const q = search.toLowerCase();
    return files.filter(f => f.name.toLowerCase().includes(q));
  }, [files, search]);

  const toggle = (name: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={`Browse ${label}`}>
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <ProviderIcon provider={source} />
            <h2 className="text-base font-extrabold text-slate-900">Browse {label}</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-5 pt-4">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${label}…`}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <div className="max-h-80 overflow-y-auto px-5 py-3">
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">No files match "{search}"</p>
          ) : (
            <ul className="space-y-1">
              {filtered.map(f => (
                <li key={f.name}>
                  <label className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 outline-none hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={selected.has(f.name)}
                      onChange={() => toggle(f.name)}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="flex-1 truncate text-sm text-slate-800">{f.name}</span>
                    <span className="text-[11px] font-mono text-slate-500">{(f.size / 1024).toFixed(0)} KB</span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-5 py-3">
          <span className="text-xs text-slate-600">{selected.size} selected</span>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="rounded-lg px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-200">
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onAttach(files.filter(f => selected.has(f.name)))}
              disabled={selected.size === 0}
              className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Attach {selected.size > 0 && `(${selected.size})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ────────────────────────────────────────────────────────────────────────── */
/*  Transient error notice                                                   */
/* ────────────────────────────────────────────────────────────────────────── */

const UploadError: React.FC<{ message: string }> = ({ message }) => (
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

/* ────────────────────────────────────────────────────────────────────────── */
/*  The exported component                                                   */
/* ────────────────────────────────────────────────────────────────────────── */

export interface ChooseFileSectionProps {
  /** Display label for accepted input formats, e.g. "PDF CAD files" */
  inputLabel?: string;
  /** Display label for output formats, e.g. "DWG, DXF" */
  outputLabel?: string;
  /** Title shown above the picker button */
  title?: string;
  /** Subtitle shown under the title */
  subtitle?: string;
  /** Default bulk output format for newly-added files (e.g. "STEP") */
  defaultBulkOutput?: string;
  /** Brand color for the primary CTA. Defaults to #1f4ed8 */
  brandColor?: string;
  /** Hide the secondary sources (URL, GDrive, Dropbox, OneDrive) */
  primaryOnly?: boolean;
  /** Optional id passed to the wrapping container */
  id?: string;
  /** Initial file list (for hydration from localStorage, etc.) */
  initialFiles?: FileMeta[];

  /* ── callbacks ────────────────────────────────────────── */
  /** Fired when the user adds files from any source */
  onFilesAdd?: (files: FileMeta[]) => void;
  /** Fired when a row is removed */
  onFileRemove?: (id: string) => void;
  /** Fired when Clear all is clicked */
  onClearAll?: () => void;
  /** Fired when bulk target format changes */
  onBulkOutputChange?: (output: string) => void;
  /** Fired when a per-row target format changes */
  onPerFileOutputChange?: (id: string, output: string) => void;
  /** Fired when the user clicks "Convert" in the sticky bar */
  onConvertAll?: (files: FileMeta[]) => void;
  /** Fired when "Download all" is clicked (only when at least one row is 'done') */
  onDownloadAll?: (files: FileMeta[]) => void;
  /** Fired when a single row's Download is clicked */
  onDownloadFile?: (id: string) => void;
}

export interface ChooseFileSectionHandle {
  /** Imperative: start a per-row conversion (used by Phase 2 test harness) */
  convertFile: (id: string) => void;
  /** Imperative: start a bulk conversion */
  convertAll: () => void;
}

const OMNICONVERT_BRAND = '#1f4ed8';

const ChooseFileSection = forwardRef<ChooseFileSectionHandle, ChooseFileSectionProps>(({
  inputLabel = 'PDF, DOCX, XLSX, PPTX, PNG, JPG…',
  outputLabel = 'PDF, DOCX, DWG, DXF…',
  title = 'Pick Your Files',
  subtitle = 'Convert your files to any format — browser-based, no signup.',
  defaultBulkOutput = 'PDF',
  brandColor = OMNICONVERT_BRAND,
  primaryOnly = false,
  id,
  initialFiles,
  onFilesAdd,
  onFileRemove,
  onClearAll,
  onBulkOutputChange,
  onPerFileOutputChange,
  onConvertAll,
  onDownloadAll,
  onDownloadFile,
}, ref) => {
  /* ── refs ── */
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  /* ── state ── */
  const [files, setFiles] = useState<FileMeta[]>(initialFiles ?? []);
  const [dragActive, setDragActive] = useState(false);
  const [sourcePick, setSourcePick] = useState<UploadSourceId | null>(null);
  const [urlValue, setUrlValue] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [activeCloud, setActiveCloud] = useState<'gdrive' | 'dropbox' | 'onedrive' | null>(null);
  const [notice, setNotice] = useState('');
  const [bulkOutput, setBulkOutput] = useState<string>(defaultBulkOutput);
  const [isWorking, setIsWorking] = useState(false);

  // per-row conversion state — set when the user clicks Convert
  const conversionTimersRef = useRef<Map<string, number[]>>(new Map());

  /* ── derived ── */
  const visibleCatalog: ReadonlyArray<OutputOption> = useMemo(() => {
    // Phase 1: expose everything; could be narrowed per tool.
    return OUTPUT_CATALOG;
  }, []);

  /* ── handlers ── */

  const addFiles = useCallback((incoming: File[]) => {
    if (incoming.length === 0) return;
    const metas = incoming.map(f => makeFileMeta(f, suggestDefaultOutput(f.name)));
    setFiles(prev => {
      const existing = new Set(prev.map(f => `${f.name}::${f.size}`));
      const fresh = metas.filter(m => !existing.has(`${m.name}::${m.size}`));
      const next = [...prev, ...fresh];
      // If the bulk output is still the default and there are no rows,
      // adopt the freshly-added file's suggested output so the sticky
      // bar stays meaningful.
      if (prev.length === 0 && fresh.length > 0) {
        setBulkOutput(fresh[0].output);
      }
      return next;
    });
    onFilesAdd?.(metas);
  }, [onFilesAdd]);

  const removeFile = useCallback((id: string) => {
    // Cancel any pending timers for this row
    const timers = conversionTimersRef.current.get(id);
    if (timers) timers.forEach(t => window.clearTimeout(t));
    conversionTimersRef.current.delete(id);
    setFiles(prev => prev.filter(f => f.id !== id));
    onFileRemove?.(id);
  }, [onFileRemove]);

  const clearAll = useCallback(() => {
    // Cancel any pending timers
    conversionTimersRef.current.forEach(timers => timers.forEach(t => window.clearTimeout(t)));
    conversionTimersRef.current.clear();
    setFiles([]);
    setIsWorking(false);
    onClearAll?.();
  }, [onClearAll]);

  const changeBulkOutput = useCallback((v: string) => {
    setBulkOutput(v);
    // When bulk target changes, apply to all rows that haven't been
    // overridden (i.e. all rows, since Phase 1 has no per-row override UI yet
    // — the Target dropdown stays available but the bulk change takes
    // precedence for synced state).
    setFiles(prev => prev.map(f => ({ ...f, output: v })));
    onBulkOutputChange?.(v);
  }, [onBulkOutputChange]);

  const changePerFileOutput = useCallback((id: string, ext: string) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, output: ext } : f));
    onPerFileOutputChange?.(id, ext);
  }, [onPerFileOutputChange]);

  /* ── Phase 1: simulate a conversion cycle ── */

  const runSimulatedConversion = useCallback((id: string) => {
    const timers: number[] = [];

    // Stage 1: Analyzing (~400ms)
    timers.push(window.setTimeout(() => {
      setFiles(prev => prev.map(f => f.id === id ? { ...f, status: 'analyzing' as FileStatus, statusText: 'Analyzing', progress: 12 } : f));
    }, 200));

    // Stage 2: Loading libraries (~600ms more)
    timers.push(window.setTimeout(() => {
      setFiles(prev => prev.map(f => f.id === id ? { ...f, status: 'loading_libs' as FileStatus, statusText: 'Upload completed. Loading transcoding libraries…', progress: 36 } : f));
    }, 700));

    // Stage 3: Converting + progress ticks
    const ticks = [55, 70, 84, 92, 97];
    ticks.forEach((pct, i) => {
      timers.push(window.setTimeout(() => {
        setFiles(prev => prev.map(f => f.id === id ? { ...f, status: 'converting' as FileStatus, progress: pct } : f));
      }, 1100 + i * 220));
    });

    // Stage 4: Done (read bytes and create output blob)
    timers.push(window.setTimeout(async () => {
      setFiles(prev => prev.map(f => {
        if (f.id !== id) return f;
        try {
          const bytes = new Uint8Array(f.file.size === 0 ? new TextEncoder().encode('omni-' + f.name).buffer : f.file);
          // Phase 1: pass-through rename. A real converter would re-encode here.
          const blob = new Blob([bytes], { type: f.type || 'application/octet-stream' });
          const outName = replaceExt(f.name, f.output);
          return {
            ...f,
            status: 'done' as FileStatus,
            statusText: '100% Complete',
            progress: 100,
            outputName: outName,
            outputBlob: blob,
          };
        } catch (err) {
          return { ...f, status: 'failed' as FileStatus, statusText: 'Failed', progress: 0 };
        }
      }));
      // pop confetti at the row's location
      const row = document.getElementById('fr-' + id);
      if (row) popConfetti(row);
      // cleanup timers
      conversionTimersRef.current.delete(id);
      const isAnyRunning = conversionTimersRef.current.size > 0;
      if (!isAnyRunning) setIsWorking(false);
    }, 1100 + ticks.length * 220 + 350));

    conversionTimersRef.current.set(id, timers);
    setIsWorking(true);
  }, []);

  const convertOne = useCallback((id: string) => {
    const f = files.find(x => x.id === id);
    if (!f) return;
    runSimulatedConversion(id);
  }, [files, runSimulatedConversion]);

  const convertAll = useCallback(() => {
    const pending = files.filter(f => f.status === 'pending');
    if (pending.length === 0) return;
    pending.forEach(f => runSimulatedConversion(f.id));
    onConvertAll?.(files);
  }, [files, onConvertAll, runSimulatedConversion]);

  useImperativeHandle(ref, () => ({
    convertFile: (id: string) => convertOne(id),
    convertAll: () => convertAll(),
  }), [convertOne, convertAll]);

  /* ── download ── */

  const downloadOne = useCallback((id: string) => {
    const f = files.find(x => x.id === id);
    if (!f || f.status !== 'done' || !f.outputBlob) return;
    const url = URL.createObjectURL(f.outputBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = f.outputName || replaceExt(f.name, f.output);
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    onDownloadFile?.(id);
  }, [files, onDownloadFile]);

  const downloadAll = useCallback(() => {
    const done = files.filter(f => f.status === 'done');
    done.forEach(f => {
      if (!f.outputBlob) return;
      const url = URL.createObjectURL(f.outputBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = f.outputName || replaceExt(f.name, f.output);
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
    onDownloadAll?.(done);
  }, [files, onDownloadAll]);

  /* ── drag handlers ── */

  const onDragEnter = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(true);
  };
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
  };
  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
  };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    addFiles(Array.from(e.dataTransfer?.files ?? []));
  };

  /* ── file input ── */

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(Array.from(e.target.files ?? []));
    e.target.value = '';
  };

  /* ── URL source ── */

  const handleAttachUrl = () => {
    const raw = urlValue.trim();
    if (!raw) {
      setNotice('Paste a valid URL first');
      window.setTimeout(() => setNotice(''), 2400);
      return;
    }
    const filename = (() => {
      try {
        const u = new URL(raw);
        const last = u.pathname.split('/').filter(Boolean).pop();
        return last || 'remote-file';
      } catch {
        return raw.split('/').filter(Boolean).pop() || 'remote-file';
      }
    })();
    const virtual = new File([''], filename, { type: 'application/octet-stream' });
    addFiles([virtual]);
    setUrlValue('');
    setShowUrlInput(false);
    setSourcePick(null);
  };

  /* ── cloud sources ── */

  const openCloud = (src: 'gdrive' | 'dropbox' | 'onedrive') => {
    setActiveCloud(src);
  };
  const closeCloud = () => setActiveCloud(null);
  const attachCloud = (selected: CloudMockFile[]) => {
    const virtuals = selected.map(meta => {
      // Phase 1: empty bytes; size mirrors the mock size
      const blob = new Blob([new Uint8Array(Math.min(meta.size, 1024))], { type: 'application/octet-stream' });
      return new File([blob], meta.name, { type: 'application/octet-stream' });
    });
    addFiles(virtuals);
    closeCloud();
  };

  /* ── source picker ── */

  const onPickSource = (src: UploadSourceId) => {
    if (src === 'computer') {
      fileInputRef.current?.click();
      return;
    }
    if (src === 'url') {
      setShowUrlInput(true);
      setSourcePick('url');
      return;
    }
    if (src === 'gdrive')   { openCloud('gdrive');   return; }
    if (src === 'dropbox')  { openCloud('dropbox');  return; }
    if (src === 'onedrive') { openCloud('onedrive'); return; }
  };

  /* ── counts for the sticky bar ── */
  const convertedCount = files.filter(f => f.status === 'done').length;
  const pendingCount   = files.filter(f => f.status === 'pending').length;
  const inProgressCount = files.filter(f => f.status === 'analyzing' || f.status === 'loading_libs' || f.status === 'converting').length;

  /* ── render ── */

  const sourcesToShow = primaryOnly
    ? (['computer'] as UploadSourceId[])
    : (['computer', 'url', 'gdrive', 'dropbox', 'onedrive'] as UploadSourceId[]);

  return (
    <div ref={sectionRef} className="w-full flex flex-col" id={id}>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={onFileInputChange}
        className="hidden"
      />

      {files.length === 0 && (
        <CompactPicker
          inputLabel={inputLabel}
          outputLabel={outputLabel}
          title={title}
          subtitle={subtitle}
          brandColor={brandColor}
          onBrowse={() => fileInputRef.current?.click()}
          onPickSource={(s) => sourcesToShow.includes(s) && onPickSource(s)}
          dragActive={dragActive}
          dropHandlers={{ onDragEnter, onDragOver, onDragLeave, onDrop }}
          showUrlInput={showUrlInput}
          urlValue={urlValue}
          onUrlChange={setUrlValue}
          onUrlAttach={handleAttachUrl}
        />
      )}

      {notice && <div className="px-3 sm:px-4"><UploadError message={notice} /></div>}

      {files.length > 0 && (
        <div className="px-3 sm:px-4 pt-3 pb-2 flex flex-col gap-2">
          <AnimatePresence initial={false}>
            {files.map(f => (
              <motion.div
                key={f.id}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col gap-1.5"
              >
                <div id={`fr-${f.id}`}>
                  <FileInputRow
                    file={f}
                    catalog={visibleCatalog}
                    brandColor={brandColor}
                    isLocked={f.status !== 'pending'}
                    onChangeOutput={changePerFileOutput}
                    onRemove={removeFile}
                    onDownload={downloadOne}
                    onConvertOne={convertOne}
                  />
                </div>
                {(f.status === 'analyzing' || f.status === 'loading_libs' || f.status === 'converting') && (
                  <div className="h-1 overflow-hidden rounded-full bg-slate-100">
                    <motion.div
                      className="h-full bg-blue-500"
                      animate={{ width: `${f.progress}%` }}
                      transition={{ duration: 0.2 }}
                    />
                  </div>
                )}
                <AnimatePresence>
                  {f.status === 'done' && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.18 }}
                    >
                      <FileOutputRow file={f} onDownload={downloadOne} onRemove={removeFile} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {files.length > 0 && (
        <StickyActionBar
          fileCount={files.length}
          convertedCount={convertedCount}
          pendingCount={pendingCount}
          inProgressCount={inProgressCount}
          bulkOutput={bulkOutput}
          catalog={visibleCatalog}
          onChangeBulkOutput={changeBulkOutput}
          onConvert={convertAll}
          onClearAll={clearAll}
          onAddMore={() => fileInputRef.current?.click()}
          onDownloadAll={downloadAll}
          isWorking={isWorking}
          brandColor={brandColor}
        />
      )}

      {activeCloud === 'gdrive' && (
        <CloudSourceModal source="gdrive" files={GOOGLE_DRIVE_MOCK_FILES} onAttach={attachCloud} onClose={closeCloud} />
      )}
      {activeCloud === 'dropbox' && (
        <CloudSourceModal source="dropbox" files={DROPBOX_MOCK_FILES} onAttach={attachCloud} onClose={closeCloud} />
      )}
      {activeCloud === 'onedrive' && (
        <CloudSourceModal source="onedrive" files={ONEDRIVE_MOCK_FILES} onAttach={attachCloud} onClose={closeCloud} />
      )}
    </div>
  );
});

ChooseFileSection.displayName = 'ChooseFileSection';

export default ChooseFileSection;
export { ChooseFileSection as ChooseFileSectionNamed };
