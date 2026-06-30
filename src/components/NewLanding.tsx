import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Upload, Lock, ArrowRight, Sparkles, Zap, ShieldCheck, ChevronRight, FileCheck2 } from 'lucide-react';
import { Tool, TOOLS } from '../data/tools';
import { User } from '../types';
import { getUser } from '../data/gamification';
import UpvoteButton from './gamification/UpvoteButton';

interface NewLandingProps {
  currentUser?: User | null;
  onSelectTool: (tool: Tool) => void;
  onNavigateConverter: () => void;
}

/** Map a file extension to the best-matching Tool from the catalog.
 *  Falls back to the user's recent tools or the default first tool. */
const matchToolForFile = (filename: string, recentToolIds: number[]): Tool => {
  const ext = filename.includes('.') ? filename.slice(filename.lastIndexOf('.') + 1).toLowerCase() : '';
  if (!ext) {
    const recent = TOOLS.find(t => recentToolIds.includes(t.id));
    return recent ?? TOOLS[0];
  }
  // exact input match takes priority
  const exact = TOOLS.find(t => t.input.toLowerCase().split(/[,\s]+/).includes(ext));
  if (exact) return exact;
  // fallback: substring match against category typical inputs
  const fuzzy = TOOLS.find(t => t.input.toLowerCase().includes(ext) || ext.includes(t.input.toLowerCase().split(/[,\s]+/)[0]));
  if (fuzzy) return fuzzy;
  const recent = TOOLS.find(t => recentToolIds.includes(t.id));
  return recent ?? TOOLS[0];
};

const formatBytes = (b: number): string => {
  if (b < 1024) return b + ' B';
  if (b < 1024 * 1024) return (b / 1024).toFixed(1) + ' KB';
  if (b < 1024 * 1024 * 1024) return (b / (1024 * 1024)).toFixed(1) + ' MB';
  return (b / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
};

const NewLanding: React.FC<NewLandingProps> = ({ currentUser, onSelectTool, onNavigateConverter }) => {
  const [dragActive, setDragActive] = useState(false);
  const [pickedFile, setPickedFile] = useState<File | null>(null);
  const [matchedTool, setMatchedTool] = useState<Tool | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const gamUser = getUser(currentUser);

  const onFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    const first = files[0];
    const recentIds: number[] = JSON.parse(localStorage.getItem('omni_recent_tools') || '[]');
    const tool = matchToolForFile(first.name, recentIds);
    setPickedFile(first);
    setMatchedTool(tool);
    onSelectTool(tool);
  }, [onSelectTool]);

  // When a file is picked, redirect to the converter after a brief moment
  // so the user sees the matched tool confirmation flash.
  useEffect(() => {
    if (!pickedFile || !matchedTool) return;
    const t = setTimeout(() => {
      onNavigateConverter();
    }, 900);
    return () => clearTimeout(t);
  }, [pickedFile, matchedTool, onNavigateConverter]);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    onFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => setDragActive(false);

  const sourceFormat = matchedTool ? matchedTool.input.split(/[,\s]+/)[0].toUpperCase() : (pickedFile ? pickedFile.name.split('.').pop()?.toUpperCase() ?? 'FILE' : 'PDF');
  const targetFormat = matchedTool ? matchedTool.output.split(/[,\s]+/)[0].toUpperCase() : 'DOCX';

  return (
    <div className="space-y-10">
      {/* HERO */}
      <section className="text-center max-w-4xl mx-auto space-y-4 pt-4 pb-2">
        <motion.span
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 text-[10px] uppercase tracking-wider font-mono text-indigo-600 font-bold bg-indigo-500/10 px-3 py-1.5 rounded-full border border-indigo-500/20"
        >
          <Sparkles className="h-3 w-3" />
          🚀 Multi-Format Cloud Transcoder
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight"
        >
          Any Format.{' '}
          <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Zero Friction.
          </span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-base text-slate-600 max-w-2xl mx-auto leading-relaxed"
        >
          Drop a file. We pick the right converter, route it through the engine, hand it back. No signup. No friction.
        </motion.p>
      </section>

      {/* CHOOSE FILES — same reusable shape as ConversionPanel's UploadPlaceholder */}
      <section className="mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="relative"
        >
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`relative overflow-hidden rounded-3xl border bg-white p-10 text-center shadow-sm transition ${
              dragActive ? 'border-blue-400 ring-4 ring-blue-100' : 'border-slate-200'
            }`}
          >
            <div
              aria-hidden="true"
              className={`pointer-events-none absolute inset-0 transition-colors ${
                dragActive ? 'bg-blue-50/70' : 'bg-transparent'
              }`}
            />
            {/* Soft decorative blob */}
            <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-indigo-100/40 blur-3xl" aria-hidden="true" />

            <div className="relative space-y-5">
              {/* Trust strip */}
              <div className="flex flex-wrap items-center justify-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-700">
                  <ShieldCheck className="h-3 w-3" /> Browser-safe
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-blue-700">
                  <Zap className="h-3 w-3" /> Seconds
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-violet-700">
                  <Lock className="h-3 w-3" /> No signup
                </span>
              </div>

              {/* Big button */}
              <div className="flex items-center justify-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={e => onFiles(e.target.files)}
                  className="hidden"
                  aria-label="Choose a file to convert"
                  id="newlanding-file-input"
                />
                <motion.button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-4 text-base font-black text-white shadow-[0_18px_42px_rgba(37,99,235,0.28)] ring-1 ring-blue-700/20"
                >
                  <Upload className="h-5 w-5" />
                  Choose Files
                  <ChevronRight className="h-4 w-4" />
                </motion.button>
              </div>

              {/* Drop hint + capabilities */}
              <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs font-semibold text-slate-500">
                <span>{dragActive ? 'Release to upload' : 'Or drop a file anywhere here'}</span>
                <span className="hidden sm:inline">·</span>
                <span>1 GB max per file</span>
                <span className="hidden sm:inline">·</span>
                <span>PDF, DOCX, STL, OBJ, MP4, PNG, 180+ formats</span>
              </div>

              {/* Matched-tool confirmation (after file pick) */}
              <AnimateIfPicked pickedFile={pickedFile} matchedTool={matchedTool} />

              {/* Source → target flow */}
              <div className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-50 px-4 py-1.5 text-[11px] font-black text-slate-600 ring-1 ring-slate-200">
                Converting <span className="font-mono uppercase text-blue-700">{sourceFormat}</span>
                <ArrowRight className="h-3 w-3 text-slate-400" />
                <span className="font-mono uppercase text-blue-700">{targetFormat}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* FEATURE STRIP */}
      <section className="mx-auto max-w-5xl grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Feature
          icon={<Zap className="h-4 w-4 text-blue-600" />}
          title="Edge-fast"
          copy="Workers + WASM engines return conversions in seconds, not minutes."
        />
        <Feature
          icon={<ShieldCheck className="h-4 w-4 text-emerald-600" />}
          title="Private"
          copy="Your file never leaves the browser when a browser-side engine exists."
        />
        <Feature
          icon={<Sparkles className="h-4 w-4 text-violet-600" />}
          title="Earn credits"
          copy="Sign up for daily login, upvote your favorites, share to stack."
        />
      </section>
    </div>
  );
};

const Feature: React.FC<{ icon: React.ReactNode; title: string; copy: string }> = ({ icon, title, copy }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <div className="flex items-center gap-2">
      {icon}
      <p className="text-xs font-black uppercase tracking-wider text-slate-700">{title}</p>
    </div>
    <p className="mt-2 text-[11px] font-semibold text-slate-500">{copy}</p>
  </div>
);

const AnimateIfPicked: React.FC<{ pickedFile: File | null; matchedTool: Tool | null }> = ({ pickedFile, matchedTool }) => {
  if (!pickedFile || !matchedTool) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 280, damping: 22 }}
      className="mx-auto flex max-w-md items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-left"
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-emerald-100 text-emerald-700">
        <FileCheck2 className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[11px] font-black text-emerald-800">{pickedFile.name}</p>
        <p className="text-[10px] font-semibold text-emerald-700">
          {formatBytes(pickedFile.size)} · Routed to <span className="font-black">{matchedTool.name}</span>
        </p>
      </div>
      <UpvoteButton
        category={matchedTool.category ?? 'Documents'}
        source={matchedTool.input.split(/[,\s]+/)[0]}
        target={matchedTool.output.split(/[,\s]+/)[0]}
        currentUser={getUser()}
        size="sm"
      />
    </motion.div>
  );
};

export default NewLanding;