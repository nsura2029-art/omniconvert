import React from 'react';
import type { ReactNode } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, FileCode2, HelpCircle, Layers3, ShieldCheck, ThumbsUp, Share2, Activity, Link as LinkIcon } from 'lucide-react';
import UpvoteButton from './gamification/UpvoteButton';
import ShareGrid from './gamification/ShareGrid';
import ActivityFeed from './gamification/ActivityFeed';
import { getUser, TIER_TABLE } from '../data/gamification';
import { User } from '../types';
import type { CadSeoPage as CadSeoPageData } from '../data/cadSeoPages';
import type { Category, Tool } from '../data/tools';

interface CadSeoPageProps {
  page: CadSeoPageData;
  relatedPages: CadSeoPageData[];
  popularCategorySections: Array<{
    category: Category;
    tools: Tool[];
  }>;
  converterSlot: ReactNode;
  currentUser?: User | null;
  onBackToHub: () => void;
  onOpenCadSeoPage: (slug: string) => void;
  onOpenPopularTool: (tool: Tool) => void;
}

interface CadSeoConverterShellProps {
  page: CadSeoPageData;
  converterSlot: ReactNode;
  currentUser?: User | null;
  onBackToHub: () => void;
}

function CadSeoConverterShell({ page, converterSlot, currentUser, onBackToHub }: CadSeoConverterShellProps) {
  const gamUser = getUser(currentUser);
  return (
    <section className="space-y-6 pt-2" id="cad-seo-converter-shell">
      {/* Tool header — visible title, description, category chip, upvote
          and trust strip. Fills the gap the breadcrumb left and gives the
          page a professional SaaS hero block. */}
      <header className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-white to-blue-50/60 px-6 py-8 shadow-sm">
        <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-blue-100/50 blur-3xl" aria-hidden="true" />
        <div className="relative space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-blue-700">
              <FileCode2 className="h-3 w-3" /> CAD converter
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-600">
              {page.tool.category}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-700">
              <ShieldCheck className="h-3 w-3" /> Browser-safe · No signup
            </span>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">{page.h1}</h1>
              <p className="mt-2 max-w-2xl text-sm font-semibold text-slate-600">{page.metaDescription}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <UpvoteButton
                category={page.tool.category ?? 'CAD'}
                source={page.tool.input}
                target={page.tool.output}
                currentUser={gamUser}
                showLabel
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 border-t border-slate-200 pt-4 sm:grid-cols-4">
            <Trust label="Source"   value={page.tool.input} />
            <Trust label="Target"   value={page.tool.output} />
            <Trust label="Privacy"  value="100% client-side" />
            <Trust label="Speed"    value="Seconds" />
          </div>
        </div>
      </header>

      <div className="scroll-mt-24" id="cad-seo-converter-stage">
        {converterSlot}
      </div>
    </section>
  );
}

const Trust: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">{label}</p>
    <p className="mt-0.5 text-sm font-black text-slate-900">{value}</p>
  </div>
);

export default function CadSeoPage({
  page,
  relatedPages,
  popularCategorySections,
  converterSlot,
  currentUser,
  onBackToHub,
  onOpenCadSeoPage,
  onOpenPopularTool
}: CadSeoPageProps) {
  const gamUser = getUser(currentUser);
  const gamCfg = TIER_TABLE[gamUser.tier];
  return (
    <div className="space-y-10 animate-fade-in" id="cad-seo-detail-page">
      <CadSeoConverterShell page={page} converterSlot={converterSlot} currentUser={currentUser} onBackToHub={onBackToHub} />

      {/* Gamification row: upvote count + share + activity feed in a clean
          SaaS dashboard layout. Sits directly below the converter so the
          user sees earning actions in context. */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Share2 className="h-4 w-4 text-blue-600" /> Share & earn credits
              </h3>
              <p className="mt-1 text-[11px] font-semibold text-slate-500">One share per platform per day · 24h cooldown.</p>
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">All platforms</span>
          </div>
          <div className="mt-3">
            <ShareGrid user={gamUser} cfg={gamCfg} conversionPair={page.slug} />
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <Activity className="h-4 w-4 text-blue-600" /> Your activity
          </h3>
          <p className="mt-1 text-[11px] font-semibold text-slate-500">Latest credits, upvotes, shares.</p>
          <div className="mt-3 max-h-72 overflow-y-auto pr-1">
            <ActivityFeed userId={gamUser.id} currentUser={currentUser} filter="all" />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-5">
          <FileCode2 className="w-5 h-5 text-sky-600 dark:text-sky-300" />
          <h2 className="text-sm font-extrabold text-zinc-900 dark:text-white mt-3">Supported formats</h2>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2 leading-relaxed">
            This route is listed for {page.tool.input} input files and {page.tool.output} outputs in the OmniConvert CAD catalog.
          </p>
        </div>
        <div className="glass-card rounded-2xl p-5">
          <Layers3 className="w-5 h-5 text-indigo-600 dark:text-indigo-300" />
          <h2 className="text-sm font-extrabold text-zinc-900 dark:text-white mt-3">Search intent</h2>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2 leading-relaxed">
            Best for users who need to {page.searchIntent} without leaving the CAD conversion flow.
          </p>
        </div>
        <div className="glass-card rounded-2xl p-5">
          <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-300" />
          <h2 className="text-sm font-extrabold text-zinc-900 dark:text-white mt-3">Current status</h2>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2 leading-relaxed">
            CAD conversion behavior is clearly marked as sandbox simulation until production engines are connected.
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="glass-card rounded-2xl p-5 space-y-4">
          <h2 className="text-lg font-extrabold text-zinc-900 dark:text-white">How to use this converter</h2>
          {page.steps.map((step, index) => (
            <div key={step} className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full btn-primary text-white text-xs font-black">
                {index + 1}
              </span>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 pt-1">{step}</p>
            </div>
          ))}
        </div>

        <div className="glass-card rounded-2xl p-5 space-y-4">
          <h2 className="text-lg font-extrabold text-zinc-900 dark:text-white">Best use cases</h2>
          {page.useCases.map(useCase => (
            <div key={useCase} className="flex gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-300 shrink-0 mt-0.5" />
              <p className="text-sm text-zinc-600 dark:text-zinc-400">{useCase}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-5">
        <div className="glass-card rounded-2xl p-5 space-y-4">
          <h2 className="text-lg font-extrabold text-zinc-900 dark:text-white">Known limitations</h2>
          {page.limitations.map(limit => (
            <p key={limit} className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed border-b border-zinc-200 dark:border-white/5 last:border-0 pb-3 last:pb-0">
              {limit}
            </p>
          ))}
        </div>

        <div className="glass-card rounded-2xl p-5 space-y-4">
          <h2 className="text-lg font-extrabold text-zinc-900 dark:text-white">Frequently asked questions</h2>
          {page.faqs.map(faq => (
            <div key={faq.question} className="border-b border-zinc-200 dark:border-white/5 last:border-0 pb-3 last:pb-0">
              <h3 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100 flex items-start gap-2">
                <HelpCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-300 shrink-0 mt-0.5" />
                {faq.question}
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1.5 leading-relaxed pl-6">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-5" id="cad-seo-popular-tools">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 border-b border-zinc-200 dark:border-white/5 pb-4">
          <div>
            <h2 className="text-lg font-extrabold text-zinc-900 dark:text-white">Popular tools by category</h2>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">Three popular tool rows from different categories for users who want to keep exploring.</p>
          </div>
        </div>

        <div className="space-y-4">
          {popularCategorySections.map(section => (
            <div key={section.category.id} className="glass-card rounded-2xl p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-300 font-mono">{section.category.name}</p>
                  <h3 className="text-sm font-extrabold text-zinc-900 dark:text-white mt-1">Popular {section.category.name.toLowerCase()} tools</h3>
                </div>
                <a
                  href={`/${section.category.id.toLowerCase()}-converter/`}
                  onClick={event => {
                    event.preventDefault();
                    if (section.tools[0]) {
                      onOpenPopularTool(section.tools[0]);
                    }
                  }}
                  className="inline-flex items-center gap-2 text-[10px] font-bold text-indigo-600 dark:text-indigo-300"
                >
                  Browse category
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {section.tools.map(tool => (
                  <a
                    key={tool.id}
                    href={`/${tool.category.toLowerCase()}-converter/`}
                    onClick={event => {
                      event.preventDefault();
                      onOpenPopularTool(tool);
                    }}
                    className="group rounded-lg border border-zinc-200/80 bg-white/75 p-3 transition-all hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_16px_30px_rgba(30,41,59,0.1)] dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-white/[0.07]"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-extrabold text-zinc-900 dark:text-zinc-100">{tool.name}</h4>
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-600 ring-1 ring-slate-200 transition-transform group-hover:translate-x-0.5 dark:bg-white/10 dark:text-slate-200 dark:ring-white/10">
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                    <p className="mt-2 text-[10px] leading-relaxed text-zinc-600 dark:text-zinc-400 line-clamp-2">{tool.description}</p>
                    <p className="mt-3 text-[10px] font-mono text-zinc-500 dark:text-zinc-400">{tool.input} to {tool.output}</p>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Related CAD converters — moved to the bottom of the page so it
          sits below the visible area. The card grid still renders for SEO
          + cross-link purposes, but it requires scrolling to reach. */}
      <section className="space-y-4 scroll-mt-32 pt-8" id="cad-seo-related-links">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 border-b border-zinc-200 dark:border-white/5 pb-4">
          <div>
            <h2 className="text-lg font-extrabold text-zinc-900 dark:text-white">Related CAD converters</h2>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">Top related CAD routes for this workflow.</p>
          </div>
          <button type="button" onClick={onBackToHub} className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-2 text-xs font-bold text-sky-700 ring-1 ring-sky-100 hover:bg-sky-100 dark:bg-sky-400/10 dark:text-sky-200 dark:ring-sky-400/20">
            Browse all CAD tools
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {relatedPages.map(related => {
            // Generic dynamic 1-liner: derived purely from input/output so it
            // stays consistent across the catalog without hand-curated copy.
            const inFmt = related.tool.input.split(/[,\s]+/)[0];
            const outFmt = related.tool.output.split(/[,\s]+/)[0];
            const oneLiner = `Convert ${inFmt} to ${outFmt} online in your browser.`;
            return (
              <a
                key={related.slug}
                href={`/cad/${related.slug}`}
                onClick={event => {
                  event.preventDefault();
                  onOpenCadSeoPage(related.slug);
                }}
                className="group block min-h-[124px] rounded-lg border border-zinc-200/80 bg-white/90 p-4 text-left shadow-[0_14px_30px_rgba(30,41,59,0.08)] transition-all hover:-translate-y-1 hover:bg-white hover:shadow-[0_24px_42px_rgba(30,41,59,0.13)] dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-white/[0.07]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-wider font-black text-sky-600 dark:text-sky-300 font-mono">{related.primaryKeyword}</p>
                    <h3 className="text-sm font-extrabold text-zinc-900 dark:text-white mt-1.5">{related.tool.name}</h3>
                  </div>
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-600 ring-1 ring-slate-200 transition-transform group-hover:translate-x-0.5 dark:bg-white/10 dark:text-slate-200 dark:ring-white/10">
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-2 line-clamp-1">{oneLiner}</p>
                <p className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 mt-2">{related.tool.input} to {related.tool.output}</p>
              </a>
            );
          })}
        </div>
      </section>
    </div>
  );
}
