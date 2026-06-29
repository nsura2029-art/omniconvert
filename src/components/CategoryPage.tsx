import { ArrowRight, CheckCircle2, FileCode2, Library, Search, ShieldCheck, Sliders, Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';
import type { CadSeoPage } from '../data/cadSeoPages';
import type { Category, Tool } from '../data/tools';

interface CategoryPageProps {
  category: Category;
  tools: Tool[];
  selectedTool: Tool;
  onSelectTool: (tool: Tool) => void;
  onBackToAllTools: () => void;
  seoPages?: CadSeoPage[];
  onOpenSeoPage?: (slug: string) => void;
  converterSlot: ReactNode;
}

const splitFormats = (value: string) =>
  value
    .split(/[,/]/)
    .map(item => item.trim())
    .filter(Boolean)
    .filter(item => item.toLowerCase() !== 'same');

const uniqueFormats = (tools: Tool[], key: 'input' | 'output') =>
  Array.from(new Set(tools.flatMap(tool => splitFormats(tool[key])))).slice(0, 24);

const categoryNoun = (category: Category) => {
  if (category.id === 'CAD') return 'CAD drawing and 3D model';
  if (category.id === 'Archives') return 'archive';
  if (category.id === 'Ebooks') return 'ebook';
  return category.name.toLowerCase().replace(/s$/, '');
};

export default function CategoryPage({
  category,
  tools,
  selectedTool,
  onSelectTool,
  onBackToAllTools,
  seoPages = [],
  onOpenSeoPage,
  converterSlot
}: CategoryPageProps) {
  const sourceFormats = uniqueFormats(tools, 'input');
  const targetFormats = uniqueFormats(tools, 'output');
  const popularTools = tools.filter(tool => tool.popular);
  const featuredTools = category.id === 'CAD' || tools.length <= 12 ? tools : (popularTools.length ? popularTools : tools).slice(0, 12);
  const noun = categoryNoun(category);
  const seoPageByToolId = new Map(seoPages.map(page => [page.toolId, page]));
  const isCadCategory = category.id === 'CAD';

  const activateToolCard = (tool: Tool) => {
    onSelectTool(tool);
    document.getElementById('category-active-converter')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="space-y-10 animate-fade-in" id="category-page">
      <section className="space-y-6 max-w-4xl mx-auto pt-4">
        <nav className="sticky top-20 z-20 flex items-center justify-start gap-2 bg-slate-50/85 py-2 text-[10px] font-mono uppercase tracking-wider text-zinc-500 backdrop-blur dark:bg-slate-900/85 dark:text-zinc-400">
          <button type="button" onClick={onBackToAllTools} className="hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors">
            Home
          </button>
          <span>/</span>
          <span className="text-zinc-800 dark:text-zinc-200">{category.name} Converter</span>
        </nav>

        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-200/80 dark:border-sky-500/20 bg-sky-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-sky-700 dark:text-sky-300 font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            {tools.length} {category.name} tools
          </div>
        </div>

        <div className="space-y-4 text-center">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Online {category.name} Converter
          </h1>
          <p className="text-base text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Convert {noun} files with a focused workspace for {sourceFormats.slice(0, 4).join(', ')} inputs and {targetFormats.slice(0, 4).join(', ')} outputs.
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-[1fr_1.25fr] gap-5 items-stretch" id="category-converter-stage">
        <div className="glass-card rounded-2xl p-5 space-y-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-300 font-mono">Selected route</p>
            <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-white mt-1">{selectedTool.name}</h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">{selectedTool.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-zinc-100/80 dark:bg-white/5 border border-zinc-200 dark:border-white/10 p-3">
              <p className="text-[10px] uppercase tracking-wider font-black text-zinc-500 font-mono">From</p>
              <p className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100 mt-1">{selectedTool.input}</p>
            </div>
            <div className="rounded-xl bg-zinc-100/80 dark:bg-white/5 border border-zinc-200 dark:border-white/10 p-3">
              <p className="text-[10px] uppercase tracking-wider font-black text-zinc-500 font-mono">To</p>
              <p className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100 mt-1">{selectedTool.output}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[390px] overflow-y-auto pr-1">
            {featuredTools.map(tool => {
              const seoPage = seoPageByToolId.get(tool.id);

              return (
                <button
                  type="button"
                  key={tool.id}
                  onClick={() => onSelectTool(tool)}
                  className={`w-full rounded-xl border px-3 py-2 text-left transition-colors ${
                    selectedTool.id === tool.id
                      ? 'border-indigo-400/70 bg-indigo-500/10 text-indigo-700 dark:text-indigo-200'
                      : 'border-zinc-200 dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-white/5 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  <span className="flex items-center justify-between gap-3">
                    <span>
                      <span className="block text-xs font-extrabold">{tool.name}</span>
                      <span className="block text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5 font-mono">{tool.input} to {tool.output}</span>
                      {seoPage && onOpenSeoPage && (
                        <a
                          href={`/cad/${seoPage.slug}`}
                          onClick={event => {
                            event.preventDefault();
                            event.stopPropagation();
                            onOpenSeoPage(seoPage.slug);
                          }}
                          className="mt-1 inline-flex text-[10px] font-bold text-indigo-600 dark:text-indigo-300 hover:text-indigo-700 dark:hover:text-indigo-200"
                        >
                          SEO details
                        </a>
                      )}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="scroll-mt-24" id="category-active-converter">
          {converterSlot}
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4" id="category-bento-matcher">
        <div className="glass-card rounded-2xl p-5 md:col-span-1">
          <FileCode2 className="w-5 h-5 text-sky-600 dark:text-sky-300" />
          <h3 className="text-sm font-extrabold text-zinc-900 dark:text-white mt-3">Source formats</h3>
          <div className="flex flex-wrap gap-2 mt-4">
            {sourceFormats.map(format => (
              <span key={format} className="rounded-full bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-200/70 dark:border-sky-500/20 px-2.5 py-1 text-[10px] font-bold font-mono">
                {format}
              </span>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 md:col-span-1">
          <Search className="w-5 h-5 text-indigo-600 dark:text-indigo-300" />
          <h3 className="text-sm font-extrabold text-zinc-900 dark:text-white mt-3">Bento matcher</h3>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2">Pick a route above or scan every {category.name.toLowerCase()} converter below. Cards only show tools from this category.</p>
          <div className="mt-4 grid grid-cols-2 gap-2 text-center">
            <div className="rounded-xl bg-zinc-100/80 dark:bg-white/5 p-3">
              <p className="text-xl font-black text-zinc-900 dark:text-white">{sourceFormats.length}</p>
              <p className="text-[10px] text-zinc-500 font-mono">sources</p>
            </div>
            <div className="rounded-xl bg-zinc-100/80 dark:bg-white/5 p-3">
              <p className="text-xl font-black text-zinc-900 dark:text-white">{targetFormats.length}</p>
              <p className="text-[10px] text-zinc-500 font-mono">targets</p>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 md:col-span-1">
          <Library className="w-5 h-5 text-emerald-600 dark:text-emerald-300" />
          <h3 className="text-sm font-extrabold text-zinc-900 dark:text-white mt-3">Target formats</h3>
          <div className="flex flex-wrap gap-2 mt-4">
            {targetFormats.map(format => (
              <span key={format} className="rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-500/20 px-2.5 py-1 text-[10px] font-bold font-mono">
                {format}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {[
          ['Fast route picking', 'Choose a source-target route and keep the upload workspace close.'],
          ['Category-only tools', `No unrelated converters mixed into the ${category.name.toLowerCase()} page.`],
          ['Cloud upload ready', 'Computer, Google Drive, Dropbox, OneDrive, and URL flows stay available.'],
          ['Clear limits', 'Current conversions are simulated until production backends are wired.']
        ].map(([title, copy]) => (
          <div key={title} className="glass-card rounded-2xl p-4">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-300" />
            <h3 className="text-xs font-extrabold text-zinc-900 dark:text-white mt-3">{title}</h3>
            <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-1.5 leading-relaxed">{copy}</p>
          </div>
        ))}
      </section>

      <section className="space-y-4" id="category-tool-grid">
        <div className="flex items-center justify-between gap-4 border-b border-zinc-200 dark:border-white/5 pb-4">
          <div>
            <h2 className="text-lg font-extrabold text-zinc-900 dark:text-white">All {category.name} converters</h2>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">Only {category.name.toLowerCase()} source and target routes are shown here.</p>
          </div>
          <span className="text-xs font-mono text-zinc-500">{tools.length} tools</span>
        </div>

        <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${isCadCategory ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}`}>
          {tools.map(tool => {
            const seoPage = seoPageByToolId.get(tool.id);
            const inputBadge = splitFormats(tool.input)[0] ?? tool.input;

            return (
              <article
                key={tool.id}
                role="button"
                tabIndex={0}
                onClick={() => activateToolCard(tool)}
                onKeyDown={event => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    activateToolCard(tool);
                  }
                }}
                className={`group relative overflow-hidden text-left transition-all border cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 ${
                  isCadCategory
                    ? `min-h-[206px] rounded-lg p-4 bg-white/90 dark:bg-white/[0.04] shadow-[0_14px_30px_rgba(30,41,59,0.08)] hover:-translate-y-1 hover:bg-white dark:hover:bg-white/[0.07] hover:shadow-[0_24px_42px_rgba(30,41,59,0.13)] after:absolute after:inset-x-0 after:bottom-0 after:h-1 after:origin-left after:scale-x-0 after:bg-gradient-to-r after:from-sky-400 after:via-emerald-400 after:to-rose-400 after:transition-transform after:duration-200 hover:after:scale-x-100 ${
                        selectedTool.id === tool.id
                          ? 'border-indigo-300 ring-2 ring-indigo-500/20'
                          : 'border-zinc-200/80 dark:border-white/10'
                      }`
                    : `p-4 rounded-2xl glass-card glass-card-hover ${
                        selectedTool.id === tool.id ? 'border-indigo-400/70 ring-2 ring-indigo-500/30' : 'border-transparent'
                      }`
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    {isCadCategory && (
                      <span className="grid h-9 min-w-9 shrink-0 place-items-center rounded-xl bg-cyan-50 text-[10px] font-black text-cyan-700 ring-1 ring-cyan-100 dark:bg-cyan-400/10 dark:text-cyan-200 dark:ring-cyan-400/20">
                        {inputBadge.slice(0, 4)}
                      </span>
                    )}
                    <h3 className={`${isCadCategory ? 'text-sm' : 'text-xs'} font-extrabold text-zinc-900 dark:text-zinc-100`}>
                      {tool.name}
                    </h3>
                  </div>
                  {tool.popular && <span className="shrink-0 text-[8px] bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">Popular</span>}
                </div>
                <p className={`${isCadCategory ? 'text-[11px]' : 'text-[10px]'} text-zinc-600 dark:text-zinc-400 mt-2 line-clamp-1 leading-relaxed`}>{`Convert ${tool.input} to ${tool.output} online in your browser.`}</p>
                <div className="flex items-center justify-between border-t border-zinc-200 dark:border-white/5 pt-3 mt-4 text-[10px] font-mono text-zinc-500 dark:text-zinc-400">
                  <span>{tool.input} to {tool.output}</span>
                  {isCadCategory ? (
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-600 ring-1 ring-slate-200 transition-transform group-hover:translate-x-0.5 dark:bg-white/10 dark:text-slate-200 dark:ring-white/10">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  ) : (
                    <span className="font-black text-indigo-600 dark:text-indigo-300">{tool.creditCost} cr</span>
                  )}
                </div>
                {seoPage && onOpenSeoPage && (
                  <a
                    href={`/cad/${seoPage.slug}`}
                    onClick={event => {
                      event.preventDefault();
                      event.stopPropagation();
                      onOpenSeoPage(seoPage.slug);
                    }}
                    className={`mt-3 inline-flex items-center gap-1 text-[10px] font-bold hover:text-indigo-700 dark:hover:text-indigo-200 ${
                      isCadCategory ? 'text-sky-700 dark:text-sky-300' : 'text-indigo-600 dark:text-indigo-300'
                    }`}
                  >
                    Open SEO page
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-sky-50 text-sky-700 ring-1 ring-sky-100 dark:bg-sky-400/10 dark:text-sky-200 dark:ring-sky-400/20">
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </a>
                )}
              </article>
            );
          })}
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="glass-card rounded-2xl p-5 space-y-4">
          <h2 className="text-lg font-extrabold text-zinc-900 dark:text-white">How to convert {category.name.toLowerCase()} files online</h2>
          {[
            'Choose a converter route from the category matcher.',
            'Upload from your computer, cloud storage, or a direct URL.',
            'Confirm the target format and any available route options.',
            'Run the conversion and download the finished file when complete.'
          ].map((step, index) => (
            <div key={step} className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full btn-primary text-white text-xs font-black">{index + 1}</span>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 pt-1">{step}</p>
            </div>
          ))}
        </div>

        <div className="glass-card rounded-2xl p-5 space-y-4">
          <h2 className="text-lg font-extrabold text-zinc-900 dark:text-white">Frequently asked questions</h2>
          {[
            [`What ${category.name.toLowerCase()} formats are supported?`, `This page lists ${sourceFormats.slice(0, 8).join(', ')} sources and ${targetFormats.slice(0, 8).join(', ')} targets from the current OmniConvert catalog.`],
            ['Can I use cloud files?', 'Yes. The sandbox upload selector includes local files, Google Drive, Dropbox, OneDrive, and URL source flows.'],
            ['Is this production conversion?', 'Not yet. OmniConvert currently simulates conversion behavior while the production conversion backend is still future work.']
          ].map(([question, answer]) => (
            <div key={question} className="border-b border-zinc-200 dark:border-white/5 last:border-0 pb-3 last:pb-0">
              <h3 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100">{question}</h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1.5 leading-relaxed">{answer}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="glass-card rounded-2xl p-5 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-300 shrink-0 mt-0.5" />
          <div>
            <h2 className="text-sm font-extrabold text-zinc-900 dark:text-white">SEO-ready category foundation</h2>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">This page is data-driven now; static HTML generation, sitemap entries, and structured data are the next production SEO step.</p>
          </div>
        </div>
        <button type="button" onClick={onBackToAllTools} className="inline-flex items-center justify-center gap-2 rounded-xl glass px-4 py-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-500/10 dark:hover:bg-white/5">
          <Sliders className="w-4 h-4" />
          Browse all tools
        </button>
      </section>
    </div>
  );
}
