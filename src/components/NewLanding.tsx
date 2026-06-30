// NewLanding — the single landing page. Holds:
//   1. SaaS hero (tool name + dynamic description + trust strip)
//   2. ChooseFiles card (drop zone + file list + file state)
//   3. Sticky action bar (Convert all + counter + Clear + Convert +
//      Add more + Download all) — pinned to the viewport bottom
//   4. ToolPicker (Category | From | To + Popular chips + dynamic
//      description + live URL preview)
//
// All on one page. No separate "tool page". When the user picks a
// tool, the parent (App.tsx) updates selectedTool + URL via
// pushState, and the hero + ChooseFiles re-render in place.

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  Upload, ArrowRight, ChevronRight, FileCheck2, Download,
  Sparkles, ShieldCheck, Zap, Lock, X,
} from 'lucide-react';
import { Tool, TOOLS } from '../data/tools';
import { User, FileConversion, CloudIntegration } from '../types';
import { getUser } from '../data/gamification';
import ToolPicker from './ToolPicker';
import { colorForFormat, iconLetter } from '../lib/format-colors';
import { getDescriptionForTool } from '../lib/tool-description';
import { toolSlug } from '../lib/tool-slug';

interface NewLandingProps {
  currentUser?: User | null;
  selectedTool: Tool;
  onSelectTool: (tool: Tool) => void;
  onConversionCompleted: (conversion: FileConversion) => void;
  onOpenAuth: () => void;
  integrations: CloudIntegration[];
}

const formatBytes = (b: number): string => {
  if (b < 1024) return b + ' B';
  if (b < 1024 * 1024) return (b / 1024).toFixed(1) + ' KB';
  if (b < 1024 * 1024 * 1024) return (b / (1024 * 1024)).toFixed(1) + ' MB';
  return (b / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
};

const matchToolForFile = (filename: string, recentToolIds: number[]): Tool => {
  const ext = filename.includes('.') ? filename.slice(filename.lastIndexOf('.') + 1).toLowerCase() : '';
  if (!ext) {
    const recent = TOOLS.find(t => recentToolIds.includes(t.id));
    return recent ?? TOOLS[0];
  }
  const recentPrimary = TOOLS.find(t =>
    recentToolIds.includes(t.id) &&
    t.input.toLowerCase().split(/[,\s]+/)[0] === ext
  );
  if (recentPrimary) return recentPrimary;
  const primary = TOOLS.find(t =>
    t.input.toLowerCase().split(/[,\s]+/)[0] === ext
  );
  if (primary) return primary;
  const anyInput = TOOLS.find(t =>
    t.input.toLowerCase().split(/[,\s]+/).includes(ext)
  );
  if (anyInput) return anyInput;
  const fuzzy = TOOLS.find(t =>
    t.input.toLowerCase().includes(ext) ||
    ext.includes(t.input.toLowerCase().split(/[,\s]+/)[0])
  );
  if (fuzzy) return fuzzy;
  const recent = TOOLS.find(t => recentToolIds.includes(t.id));
  return recent ?? TOOLS[0];
};

const FormatIcon: React.FC<{ fmt: string; size?: 'sm' | 'md' | 'lg' }> = ({ fmt, size = 'md' }) => {
  const c = colorForFormat(fmt);
  const letter = iconLetter(fmt);
  const sizeCls = size === 'lg' ? 'w-10 h-10 text-sm' : size === 'md' ? 'w-9 h-9 text-[10px]' : 'w-8 h-8 text-[10px]';
  return (
    <div className={`${sizeCls} ${c.bg} ${c.fg} rounded-lg grid place-items-center font-bold font-mono shrink-0`}>
      {letter}
    </div>
  );
};

const NewLanding: React.FC<NewLandingProps> = ({
  currentUser,
  selectedTool,
  onSelectTool,
  onConversionCompleted,
  onOpenAuth,
  integrations,
}) => {
  const gamUser = getUser(currentUser);

  // ── file state ──
  const [files, setFiles] = useState<File[]>([]);
  const [fileProgresses, setFileProgresses] = useState<Record<string, { status: 'pending' | 'analyzing' | 'ready' | 'converting' | 'done' | 'failed'; statusText: string }>>({});
  const [conversions, setConversions] = useState<FileConversion[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [pickedFile, setPickedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previousFileCountRef = useRef(0);

  // ── analyze on file add (just mark as 'ready' for the demo) ──
  useEffect(() => {
    if (files.length > previousFileCountRef.current) {
      const newFiles = files.slice(previousFileCountRef.current);
      const next: typeof fileProgresses = { ...fileProgresses };
      newFiles.forEach(f => {
        next[f.name] = { status: 'analyzing', statusText: 'Analyzing' };
      });
      setFileProgresses(next);
      // simulate analysis
      setTimeout(() => {
        setFileProgresses(prev => {
          const r = { ...prev };
          newFiles.forEach(f => { r[f.name] = { status: 'ready', statusText: 'Ready' }; });
          return r;
        });
      }, 700);
    }
    previousFileCountRef.current = files.length;
  }, [files]);

  // ── file pick handlers ──
  const onFiles = useCallback((filesList: FileList | null) => {
    if (!filesList || filesList.length === 0) return;
    const arr = Array.from(filesList);
    setFiles(prev => [...prev, ...arr]);
    const first = arr[0];
    setPickedFile(first);
    const recentIds: number[] = JSON.parse(localStorage.getItem('omni_recent_tools') || '[]');
    const tool = matchToolForFile(first.name, recentIds);
    onSelectTool(tool);
  }, [onSelectTool]);

  // ── sticky action bar handlers ──
  const handleClearAll = () => {
    setFiles([]);
    setFileProgresses({});
    setConversions([]);
    setPickedFile(null);
  };

  const handleAddMore = () => fileInputRef.current?.click();

  const handleConvert = () => {
    if (files.length === 0) return;
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    files.forEach(f => {
      setFileProgresses(prev => ({ ...prev, [f.name]: { status: 'converting', statusText: 'Converting' } }));
      setTimeout(() => {
        setFileProgresses(prev => ({ ...prev, [f.name]: { status: 'done', statusText: '100% Complete' } }));
        const conv: FileConversion = {
          id: 'conv-' + Date.now() + '-' + f.name,
          fileName: f.name,
          fileSize: f.size,
          toolId: selectedTool.id,
          toolName: selectedTool.name,
          category: selectedTool.category,
          status: 'completed',
          progress: 100,
          creditCost: selectedTool.creditCost,
          timestamp: new Date().toISOString(),
          logs: [`Converted via ${selectedTool.name}`],
        };
        setConversions(prev => [conv, ...prev]);
        onConversionCompleted(conv);
      }, 1200);
    });
  };

  type Prog = { status: 'pending' | 'analyzing' | 'ready' | 'converting' | 'done' | 'failed'; statusText: string };
  const completedCount = (Object.values(fileProgresses) as Prog[]).filter(p => p.status === 'done').length;
  const pendingCount   = (Object.values(fileProgresses) as Prog[]).filter(p => p.status === 'ready' || p.status === 'analyzing').length;
  const canConvert     = files.length > 0 && pendingCount > 0;
  const canDownload    = completedCount > 0;
  const isProcessing   = (Object.values(fileProgresses) as Prog[]).some(p => p.status === 'converting');

  // ── render helpers ──
  const heroFrom = selectedTool.input.split(',')[0].trim();
  const heroTo = selectedTool.output.split(',')[0].trim();
  const description = getDescriptionForTool(selectedTool);
  const currentUrl = selectedTool.category === 'CAD'
    ? `/cad/${toolSlug(selectedTool.input, selectedTool.output)}`
    : `/${selectedTool.category.toLowerCase()}/${toolSlug(selectedTool.input, selectedTool.output)}`;

  return (
    <div className="space-y-6 pb-32">
      {/* ─────────────── HERO ─────────────── */}
      <section className="rounded-3xl glass border border-zinc-200/70 dark:border-zinc-800/70 p-6 md:p-8">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold border border-blue-200 dark:border-blue-700/50 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300">
            <Sparkles className="w-3 h-3" />
            {selectedTool.category.toUpperCase()} CONVERTER
          </span>
          <span className="px-2.5 py-1 rounded-md text-[11px] font-bold border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300">
            {selectedTool.category}
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold border border-emerald-200 dark:border-emerald-700/50 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
            <ShieldCheck className="w-3 h-3" />
            BROWSER-SAFE · NO SIGNUP
          </span>
        </div>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              {heroFrom} to {heroTo} Online
            </h1>
            <p className="mt-2 text-sm md:text-base text-slate-600 dark:text-slate-400 max-w-3xl line-clamp-2">
              {description}
            </p>
          </div>
          <button className="inline-flex items-center gap-1.5 px-3 h-9 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-sm shrink-0">
            <FileCheck2 className="w-4 h-4" />
            0 Upvote
          </button>
        </div>
        <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-4 pt-5 border-t border-zinc-200 dark:border-zinc-800">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Source</div>
            <div className="mt-1 font-bold">{heroFrom}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Target</div>
            <div className="mt-1 font-bold">{heroTo}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Privacy</div>
            <div className="mt-1 font-bold">100% client-side</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Speed</div>
            <div className="mt-1 font-bold">Seconds</div>
          </div>
        </div>
      </section>

      {/* ─────────────── CHOOSEFILES CARD ─────────────── */}
      <section className="rounded-3xl glass border border-zinc-200/70 dark:border-zinc-800/70 p-5 md:p-7">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            <span className="text-blue-600 dark:text-blue-400">{heroFrom}</span> to <span className="text-blue-600 dark:text-blue-400">{heroTo}</span> Converter
          </h2>
          <button className="inline-flex items-center gap-1.5 px-3 h-9 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-sm">
            <FileCheck2 className="w-4 h-4" />
            0 Upvote
          </button>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Transform {heroFrom} files into {heroTo} online</p>

        {/* Drop zone (when empty) */}
        {files.length === 0 && (
          <label
            htmlFor="landing-file-input"
            className={`drop-zone flex flex-col items-center justify-center w-full min-h-[200px] border-2 border-dashed rounded-2xl cursor-pointer transition-colors ${
              dragActive
                ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-500/10'
                : 'border-zinc-300 dark:border-zinc-700 hover:border-blue-400 hover:bg-blue-50/30 dark:hover:bg-blue-500/5'
            }`}
            onDragEnter={e => { e.preventDefault(); setDragActive(true); }}
            onDragOver={e => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={e => { e.preventDefault(); setDragActive(false); onFiles(e.dataTransfer.files); }}
          >
            <div className="flex flex-col items-center gap-2 text-center px-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white grid place-items-center shadow">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold">Drop files here, or click to browse</p>
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-medium shadow">
                Choose Files <ArrowRight className="w-3.5 h-3.5" />
              </span>
              <p className="text-[11px] text-slate-400">We'll detect the format and update the converter.</p>
            </div>
            <input
              ref={fileInputRef}
              id="landing-file-input"
              type="file"
              multiple
              onChange={e => onFiles(e.target.files)}
              className="hidden"
            />
          </label>
        )}

        {/* File list (when files present) */}
        {files.length > 0 && (
          <div className="space-y-1.5 max-h-[50vh] overflow-y-auto">
            {files.map((f, i) => {
              const prog = fileProgresses[f.name] ?? { status: 'analyzing', statusText: 'Pending' };
              const outExt = heroTo;
              return (
                <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800/60">
                  <FormatIcon fmt={f.name.split('.').pop()?.toUpperCase() || '?'} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold truncate">{f.name}</p>
                      {prog.status === 'ready' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Ready
                        </span>
                      )}
                      {prog.status === 'analyzing' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300">
                          ⟳ Analyzing
                        </span>
                      )}
                      {prog.status === 'converting' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-700 dark:text-blue-300">
                          ⟳ Converting
                        </span>
                      )}
                      {prog.status === 'done' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                          ✓ 100% Complete
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{formatBytes(f.size)}</p>
                  </div>
                  {prog.status === 'done' ? (
                    <button className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-semibold hover:bg-emerald-600">
                      <Download className="w-3 h-3" /> Download
                    </button>
                  ) : (
                    <>
                      <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-500">
                        <span>TO</span>
                        <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-700 dark:text-blue-300">{outExt}</span>
                      </div>
                      <span className="text-xs text-slate-500 w-12 text-right">{formatBytes(f.size)}</span>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold bg-zinc-500/10 text-slate-600 dark:text-slate-300">
                        {prog.status === 'ready' ? 'Pending' : prog.statusText}
                      </span>
                    </>
                  )}
                  <button
                    onClick={() => setFiles(prev => prev.filter((_, idx) => idx !== i))}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ─────────────── TOOL PICKER (3-step + popular) ─────────────── */}
      <ToolPicker
        activeCategory={selectedTool.category}
        activeFrom={selectedTool.input}
        activeTo={selectedTool.output}
        onChange={onSelectTool}
      />

      {/* ─────────────── STICKY BOTTOM ACTION BAR ─────────────── */}
      <div className="fixed inset-x-0 bottom-0 z-40 glass border-t border-zinc-200/70 dark:border-zinc-800/70 shadow-[0_-8px_24px_rgba(0,0,0,0.06)]">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-20 flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="uppercase tracking-wider font-semibold">Convert all to</span>
            <button className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-blue-400 text-xs">
              <span className="font-mono font-bold text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-700 dark:text-blue-300">{heroTo}</span>
              <ChevronRight className="w-3 h-3 text-slate-400 -rotate-90" />
            </button>
          </div>
          <span className="text-xs text-slate-500 hidden sm:inline">
            {files.length > 0
              ? `${completedCount} of ${files.length} converted${isProcessing ? ' · in progress' : pendingCount > 0 ? ` · ${pendingCount} pending` : ''}`
              : '0 files'}
          </span>
          <div className="flex-1" />
          <button
            onClick={handleClearAll}
            disabled={files.length === 0 || isProcessing}
            className="inline-flex items-center gap-1.5 px-3 h-9 rounded-lg border border-red-200 dark:border-red-800/60 text-red-600 dark:text-red-300 text-xs font-medium hover:bg-red-50 dark:hover:bg-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-3.5 h-3.5" />
            Clear all
          </button>
          <button
            onClick={handleConvert}
            disabled={!canConvert || isProcessing}
            className={`inline-flex items-center gap-1.5 px-4 h-9 rounded-lg text-xs font-semibold shadow transition ${
              canConvert && !isProcessing
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
            }`}
          >
            {isProcessing ? '⟳ Converting...' : '▶ Convert'}
          </button>
          <button
            onClick={handleAddMore}
            className="inline-flex items-center gap-1.5 px-3 h-9 rounded-lg border border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 text-xs font-medium hover:bg-blue-50 dark:hover:bg-blue-500/10"
          >
            <Upload className="w-3.5 h-3.5" />
            Add more files
          </button>
          <button
            disabled={!canDownload}
            className={`inline-flex items-center gap-1.5 px-3 h-9 rounded-lg text-xs font-medium transition ${
              canDownload
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            Download all
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewLanding;
