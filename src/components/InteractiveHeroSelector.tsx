import { useState, useEffect, useRef } from 'react';
import { Tool, TOOLS, CATEGORIES } from '../data/tools';
import { 
  FileText, Image as ImageIcon, Music, Video as VideoIcon, 
  Archive, BookOpen, Type, Cpu, Compass, Table,
  ArrowRight, Sparkles, Check, HelpCircle, Layers,
  Activity, Play, RotateCw, RefreshCw, Zap
} from 'lucide-react';

interface InteractiveHeroSelectorProps {
  selectedTool: Tool;
  onSelectTool: (tool: Tool) => void;
  activePreset?: 'cyber' | 'bento';
  onPresetChange?: (preset: 'cyber' | 'bento') => void;
}

export default function InteractiveHeroSelector({ 
  selectedTool, 
  onSelectTool,
  activePreset = 'bento',
  onPresetChange
}: InteractiveHeroSelectorProps) {
  // Conversion state selections
  const [selectedInputExt, setSelectedInputExt] = useState<string>('PDF');
  const [selectedOutputExt, setSelectedOutputExt] = useState<string>('DOCX');
  
  // Category filter for the Cyber format navigator
  const [cyberCategory, setCyberCategory] = useState<string>('Documents');

  // Trigger transcode animation state
  const [isTranscoding, setIsTranscoding] = useState(false);
  const [conversionProgress, setConversionProgress] = useState(0);
  const [transcodeSpeed, setTranscodeSpeed] = useState(1.5);
  const [cubesProcessed, setCubesProcessed] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | null>(null);

  // Parse all unique input extensions from TOOLS database
  const uniqueInputExts = (() => {
    const inputSet = new Set<string>();
    TOOLS.forEach(t => {
      t.input.split(',').forEach(ext => {
        inputSet.add(ext.trim().toUpperCase());
      });
    });
    return Array.from(inputSet).sort();
  })();

  // Filter input extensions based on category
  const getInputExtsForCategory = (catName: string) => {
    const inputSet = new Set<string>();
    TOOLS.filter(t => t.category === catName).forEach(t => {
      t.input.split(',').forEach(ext => {
        inputSet.add(ext.trim().toUpperCase());
      });
    });
    return Array.from(inputSet).sort();
  };

  // Find all available output extensions for a selected input extension
  const getOutputsForInput = (inputExt: string) => {
    const outputSet = new Set<string>();
    TOOLS.forEach(t => {
      const inputs = t.input.split(',').map(s => s.trim().toUpperCase());
      if (inputs.includes(inputExt.toUpperCase())) {
        t.output.split(',').forEach(out => {
          outputSet.add(out.trim().toUpperCase());
        });
      }
    });
    return Array.from(outputSet).sort();
  };

  // Get matching category icon
  const getCategoryIcon = (categoryName: string, className = "w-4 h-4") => {
    switch (categoryName) {
      case 'Documents': return <FileText className={className} />;
      case 'Spreadsheets': return <Table className={className} />;
      case 'Presentations': return <Layers className={className} />;
      case 'Images': return <ImageIcon className={className} />;
      case 'Audio': return <Music className={className} />;
      case 'Video': return <VideoIcon className={className} />;
      case 'Archives': return <Archive className={className} />;
      case 'Ebooks': return <BookOpen className={className} />;
      case 'Fonts': return <Type className={className} />;
      case 'Vectors': return <Cpu className={className} />;
      case 'CAD': return <Compass className={className} />;
      default: return <FileText className={className} />;
    }
  };

  // Handle Input Extension Change
  const handleInputExtChange = (inputExt: string) => {
    setSelectedInputExt(inputExt);
    const availableOutputs = getOutputsForInput(inputExt);
    if (availableOutputs.length > 0) {
      // Find matching output, prefer current selectedOutputExt if available
      if (availableOutputs.includes(selectedOutputExt)) {
        triggerSync(inputExt, selectedOutputExt);
      } else {
        triggerSync(inputExt, availableOutputs[0]);
      }
    }
  };

  // Handle Output Extension Change
  const handleOutputExtChange = (outputExt: string) => {
    setSelectedOutputExt(outputExt);
    triggerSync(selectedInputExt, outputExt);
  };

  // Trigger state sync and flash visual transcode triggers
  const triggerSync = (inputVal: string, outputVal: string) => {
    // Find matching tool
    const matchingTool = TOOLS.find(t => {
      const inputs = t.input.split(',').map(s => s.trim().toUpperCase());
      const outputs = t.output.split(',').map(s => s.trim().toUpperCase());
      return inputs.includes(inputVal.toUpperCase()) && outputs.includes(outputVal.toUpperCase());
    });

    if (matchingTool) {
      onSelectTool(matchingTool);
      // Trigger live stream particle pulse
      triggerTranscodeAnimation();
    }
  };

  // Transcode Animation Trigger
  const triggerTranscodeAnimation = () => {
    setIsTranscoding(true);
    setConversionProgress(0);
    setTranscodeSpeed(parseFloat((1.2 + Math.random() * 1.6).toFixed(2)));
    
    // Progress counter
    let current = 0;
    const interval = setInterval(() => {
      current += Math.ceil(Math.random() * 8 + 2);
      if (current >= 100) {
        current = 100;
        clearInterval(interval);
        setTimeout(() => setIsTranscoding(false), 800);
      }
      setConversionProgress(current);
      setCubesProcessed(Math.round((current / 100) * 32000));
    }, 80);
  };

  // Canvas particle stream effect (Inspired by user image)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Responsive Canvas dimensions
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = 180;
      }
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particle Object class
    interface Particle {
      x: number;
      y: number;
      size: number;
      speed: number;
      angle: number;
      waveAmplitude: number;
      waveFrequency: number;
      color: string;
      alpha: number;
      cubeRotation: number;
    }

    let particles: Particle[] = [];
    const maxParticles = 60;

    // Helper to generate new particle
    const createParticle = (forceStart = false): Particle => {
      const colors = [
        '#818cf8', // Indigo
        '#c084fc', // Purple
        '#38bdf8', // Sky Blue
        '#2dd4bf', // Teal
        '#f472b6', // Pink
      ];

      // Left start boundary
      const startX = 60 + Math.random() * 20;
      const startY = canvas.height / 2 + (Math.random() * 24 - 12);

      return {
        x: forceStart ? startX + Math.random() * (canvas.width - 120) : startX,
        y: startY,
        size: Math.random() * 4 + 3,
        speed: (isTranscoding ? 3.5 : 1.5) + Math.random() * 2,
        angle: Math.random() * Math.PI * 2,
        waveAmplitude: 12 + Math.random() * 22,
        waveFrequency: 0.005 + Math.random() * 0.008,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 0.1 + Math.random() * 0.8,
        cubeRotation: Math.random() * 360
      };
    };

    // Populate initial particles
    for (let i = 0; i < maxParticles; i++) {
      particles.push(createParticle(true));
    }

    // Animation Render Loop
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Draw glowing wave pipeline path
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.04)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      for (let x = 60; x <= canvas.width - 60; x++) {
        // Curve waveform matching bezier
        const percent = (x - 60) / (canvas.width - 120);
        const y = canvas.height / 2 + Math.sin(percent * Math.PI * 2) * 15;
        if (x === 60) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // 2. Render particles flowing
      particles.forEach((p, idx) => {
        // Update particle
        p.x += p.speed;
        
        // Sine-wave curvature track
        const progressFraction = (p.x - 60) / (canvas.width - 120);
        p.y = (canvas.height / 2) + Math.sin(progressFraction * Math.PI * 2) * p.waveAmplitude;
        p.cubeRotation += 2;

        // Draw cube particle (with glow)
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.cubeRotation * Math.PI) / 180);
        ctx.shadowBlur = isTranscoding ? 12 : 6;
        ctx.shadowColor = p.color;
        
        // Solid square to represent a 3D flying cube particle
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        
        // Draw inner highlight core
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = p.alpha * 0.8;
        ctx.fillRect(-p.size / 4, -p.size / 4, p.size / 2, p.size / 2);
        
        ctx.restore();

        // If particle goes off right side limit, recycle it to the left emitter
        if (p.x > canvas.width - 60) {
          particles[idx] = createParticle();
        }
      });

      // 3. Render Source and Target file container hubs with subtle pulse rings
      const pulseFactor = isTranscoding ? Math.sin(Date.now() / 80) * 4 + 4 : Math.sin(Date.now() / 400) * 2 + 2;

      // Draw Emitter Left Hub
      ctx.save();
      ctx.shadowBlur = 15 + pulseFactor;
      ctx.shadowColor = 'rgba(99, 102, 241, 0.4)';
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.3)';
      ctx.lineWidth = 1.5;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
      ctx.beginPath();
      ctx.arc(60, canvas.height / 2, 24, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Inner Hub text or category letter
      ctx.fillStyle = '#818cf8';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(selectedInputExt.slice(0, 4), 60, canvas.height / 2);

      // Draw Collector Right Hub
      ctx.save();
      ctx.shadowBlur = 15 + pulseFactor;
      ctx.shadowColor = 'rgba(168, 85, 247, 0.4)';
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.3)';
      ctx.lineWidth = 1.5;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
      ctx.beginPath();
      ctx.arc(canvas.width - 60, canvas.height / 2, 24, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = '#c084fc';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(selectedOutputExt.slice(0, 4), canvas.width - 60, canvas.height / 2);

      // Continuously request animation frames
      animationFrameId.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isTranscoding, selectedInputExt, selectedOutputExt]);

  // Handle sync updates when external selectedTool changes
  useEffect(() => {
    if (selectedTool) {
      const inputs = selectedTool.input.split(',').map(s => s.trim().toUpperCase());
      const outputs = selectedTool.output.split(',').map(s => s.trim().toUpperCase());
      
      if (!inputs.includes(selectedInputExt.toUpperCase()) || !outputs.includes(selectedOutputExt.toUpperCase())) {
        setSelectedInputExt(inputs[0]);
        setSelectedOutputExt(outputs[0]);
        setCyberCategory(selectedTool.category);
      }
    }
  }, [selectedTool]);

  const activeCategoryObject = CATEGORIES.find(c => c.id === cyberCategory) || CATEGORIES[0];

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6" id="interactive-selector-stage">
      
      {/* RENDER PRESET DESIGN 2: THE CYBER PARTICLES PANEL */}
      {activePreset === 'cyber' && (
        <div className="p-6 rounded-3xl border border-zinc-200/80 dark:border-white/5 bg-slate-50/90 dark:bg-[#0a0f1d]/90 relative overflow-hidden space-y-6 animate-fade-in shadow-xl dark:shadow-2xl" id="cyber-design-layout">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Title Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-white/5 pb-4 relative z-10">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[9px] text-cyan-600 dark:text-cyan-300 font-bold uppercase tracking-wider font-mono">
                <Activity className="w-3.5 h-3.5" /> Cybernetic Grid Terminal
              </div>
              <h3 className="text-base font-extrabold text-zinc-800 dark:text-white mt-1">Live Transcode Stream Sandbox</h3>
            </div>
            
            {/* Quick stats panel */}
            <div className="flex items-center gap-4 text-[10px] font-mono font-semibold text-zinc-500 dark:text-zinc-400">
              <div>
                SPEED: <span className="text-cyan-600 dark:text-cyan-400">{transcodeSpeed} GB/s</span>
              </div>
              <div className="hidden sm:block">
                CUBES: <span className="text-indigo-600 dark:text-indigo-400">{cubesProcessed.toLocaleString()}/32,000</span>
              </div>
              <div>
                STATUS: <span className={isTranscoding ? 'text-emerald-500 dark:text-emerald-400 animate-pulse' : 'text-zinc-400'}>
                  {isTranscoding ? 'PROCESSING' : 'STANDBY'}
                </span>
              </div>
            </div>
          </div>

          {/* Real-time interactive canvas visualization widget */}
          <div className="relative rounded-2xl bg-zinc-950/95 dark:bg-black/50 border border-zinc-200 dark:border-white/5 overflow-hidden">
            {/* Live canvas layer */}
            <canvas ref={canvasRef} className="w-full block" />

            {/* Float HUD Information Overlays */}
            <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[10px] font-mono text-zinc-400 bg-black/75 px-3 py-1.5 rounded-xl border border-white/10 pointer-events-none">
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-indigo-450" /> SOURCE: {selectedInputExt}</span>
              <span className="text-indigo-300 font-bold">DISINTEGRATION PATHWAY: {conversionProgress}%</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-purple-450" /> TARGET: {selectedOutputExt}</span>
            </div>
          </div>

          {/* Interactive Categories & Selector Columns below the canvas */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 relative z-10">
            
            {/* Left Col (4/12): Choose Category */}
            <div className="md:col-span-4 space-y-2">
              <span className="block text-[10px] font-mono font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">1. Select Format Class</span>
              <div className="grid grid-cols-2 gap-1.5 max-h-[140px] overflow-y-auto pr-1">
                {CATEGORIES.map(cat => {
                  const isSelected = cyberCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setCyberCategory(cat.id);
                        const exts = getInputExtsForCategory(cat.id);
                        if (exts.length > 0) {
                          handleInputExtChange(exts[0]);
                        }
                      }}
                      className={`p-2 rounded-xl text-left text-[11px] font-semibold transition-all flex items-center gap-1.5 cursor-pointer border ${
                        isSelected 
                          ? 'bg-indigo-50 dark:bg-indigo-600/10 border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-300 font-bold' 
                          : 'bg-zinc-100 dark:bg-black/30 border-zinc-200 dark:border-white/5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-white/5'
                      }`}
                    >
                      {getCategoryIcon(cat.id, "w-3.5 h-3.5 shrink-0")}
                      <span className="truncate">{cat.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Middle Col (4/12): Choose Source Ext */}
            <div className="md:col-span-4 space-y-2">
              <span className="block text-[10px] font-mono font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">2. Source Extension</span>
              <div className="grid grid-cols-3 gap-1.5 max-h-[140px] overflow-y-auto pr-1">
                {getInputExtsForCategory(cyberCategory).map(ext => {
                  const isSelected = selectedInputExt === ext;
                  return (
                    <button
                      key={ext}
                      onClick={() => handleInputExtChange(ext)}
                      className={`p-2 rounded-xl text-center text-xs font-mono transition-all cursor-pointer border ${
                        isSelected 
                          ? 'bg-cyan-50 dark:bg-cyan-500/20 border-cyan-200 dark:border-cyan-500/40 text-cyan-700 dark:text-cyan-300 font-bold scale-[1.03]' 
                          : 'bg-zinc-100 dark:bg-black/30 border-zinc-200 dark:border-white/5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                      }`}
                    >
                      {ext}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Col (4/12): Choose Output Target Ext */}
            <div className="md:col-span-4 space-y-2">
              <span className="block text-[10px] font-mono font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">3. Target Output</span>
              <div className="grid grid-cols-2 gap-1.5 max-h-[140px] overflow-y-auto pr-1">
                {getOutputsForInput(selectedInputExt).map(ext => {
                  const isSelected = selectedOutputExt === ext;
                  return (
                    <button
                      key={ext}
                      onClick={() => handleOutputExtChange(ext)}
                      className={`p-2 rounded-xl text-center text-xs font-mono transition-all cursor-pointer border ${
                        isSelected 
                          ? 'bg-purple-50 dark:bg-purple-500/20 border-purple-200 dark:border-purple-500/40 text-purple-700 dark:text-purple-300 font-bold scale-[1.03]' 
                          : 'bg-zinc-100 dark:bg-black/30 border-zinc-200 dark:border-white/5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                      }`}
                    >
                      {ext}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Action button bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-zinc-200 dark:border-white/5 pt-4">
            <div className="text-xs text-zinc-600 dark:text-zinc-400">
              Active Transcoder: <span className="font-mono text-zinc-800 dark:text-white font-bold">{selectedTool.name}</span>
            </div>
            <button
              onClick={() => {
                document.getElementById('tool-active-stage')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 text-white text-xs font-bold font-mono transition-all hover:scale-105 shadow-md shadow-indigo-600/10 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Zap className="w-4 h-4 animate-pulse" /> START MULTI-FILE CONVERSION BELOW
            </button>
          </div>
        </div>
      )}


      {/* RENDER PRESET DESIGN 3: BENTO GRID MATRIX */}
      {activePreset === 'bento' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in" id="bento-design-layout">
          
          {/* Bento Block 1: Input Extension Details */}
          <div className="p-5 rounded-3xl glass-card border border-zinc-300 dark:border-white/10 bg-white dark:bg-[#0f172a]/30 shadow-md shadow-zinc-100 dark:shadow-none space-y-4 flex flex-col justify-between">
            <div className="space-y-1">
              <span className="text-[9px] font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">SOURCE MATRICES</span>
              <h3 className="text-base font-black text-zinc-800 dark:text-white">Choose Source Format</h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-normal">Select your asset category and exact raw source format.</p>
            </div>

            {/* Category selection dropdown */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider block">1. Category Class</label>
              <div className="relative">
                <select
                  value={cyberCategory}
                  onChange={(e) => {
                    const catId = e.target.value;
                    setCyberCategory(catId);
                    const exts = getInputExtsForCategory(catId);
                    if (exts.length > 0) {
                      handleInputExtChange(exts[0]);
                    }
                  }}
                  className="w-full appearance-none bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-white/10 px-4 py-2.5 rounded-xl text-zinc-800 dark:text-zinc-200 font-semibold focus:outline-none focus:border-indigo-500 font-mono text-xs cursor-pointer pr-10"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.id} className="bg-white dark:bg-zinc-950 text-zinc-800 dark:text-white font-mono">
                      {cat.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-zinc-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>

            {/* Source Formats dropdown */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider block">2. Source Ext</label>
              <div className="relative">
                <select
                  value={selectedInputExt}
                  onChange={(e) => handleInputExtChange(e.target.value)}
                  className="w-full appearance-none bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-white/10 px-4 py-2.5 rounded-xl text-zinc-800 dark:text-zinc-200 font-semibold focus:outline-none focus:border-cyan-500 font-mono text-xs cursor-pointer pr-10"
                >
                  {getInputExtsForCategory(cyberCategory).map(ext => (
                    <option key={ext} value={ext} className="bg-white dark:bg-zinc-950 text-zinc-800 dark:text-white font-mono">
                      {ext}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-zinc-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-indigo-50/50 dark:bg-black/30 border border-indigo-100/80 dark:border-white/5 text-[9px] text-zinc-500 font-mono space-y-0.5">
              <div>CLASS: <span className="text-zinc-700 dark:text-zinc-300 font-bold">{selectedTool.category}</span></div>
              <div>MAX SIZE: <span className="text-zinc-700 dark:text-zinc-300 font-bold">2.0 GB</span></div>
              <div>METADATA PARSER: <span className="text-emerald-600 dark:text-emerald-400 font-bold">READY</span></div>
            </div>
          </div>

          {/* Bento Block 2: Morphing Wireframe / Matcher */}
          <div className="p-5 rounded-3xl glass-card border border-zinc-300 dark:border-white/10 bg-gradient-to-br from-indigo-50/80 to-purple-50/80 dark:bg-gradient-to-br dark:from-indigo-500/5 dark:to-purple-500/5 shadow-md shadow-zinc-100 dark:shadow-none flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="space-y-1">
              <span className="text-[9px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 uppercase">Matcher Matrix</span>
              <h3 className="text-sm font-extrabold text-zinc-800 dark:text-white">Pipeline Link</h3>
            </div>

            {/* Interactive Morphing Connector Visual */}
            <div className="flex items-center justify-center py-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white dark:bg-indigo-500/10 border border-zinc-300 dark:border-indigo-500/20 flex items-center justify-center text-sm font-bold font-mono text-indigo-600 dark:text-indigo-300 shadow-lg shadow-indigo-500/5">
                  {selectedInputExt}
                </div>
                <div className="flex flex-col items-center gap-1 font-mono text-[9px] text-zinc-500 dark:text-zinc-400">
                  <span className="animate-pulse text-indigo-600 dark:text-indigo-400">⚡ COMPILING</span>
                  <div className="w-16 h-1 bg-zinc-250 dark:bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 w-2/3 animate-ping" />
                  </div>
                  <span>{selectedTool.creditCost} Credits</span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-white dark:bg-purple-500/10 border border-zinc-300 dark:border-purple-500/20 flex items-center justify-center text-sm font-bold font-mono text-purple-600 dark:text-purple-300 shadow-lg shadow-purple-500/5">
                  {selectedOutputExt}
                </div>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={() => {
                  document.getElementById('tool-active-stage')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full py-2 rounded-xl btn-primary text-white text-xs font-bold transition-all hover:scale-[1.02] cursor-pointer"
              >
                Load Transcoder Workspace
              </button>
            </div>
          </div>

          {/* Bento Block 3: Target Output Specifications */}
          <div className="p-5 rounded-3xl glass-card border border-zinc-300 dark:border-white/10 bg-white dark:bg-[#0f172a]/30 shadow-md shadow-zinc-100 dark:shadow-none space-y-4 flex flex-col justify-between">
            <div className="space-y-1">
              <span className="text-[9px] font-mono font-bold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">TARGET FORMAT</span>
              <h3 className="text-base font-black text-zinc-800 dark:text-white">Choose Target Output</h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-normal">Select the compiled target format to output your completed assets.</p>
            </div>

            {/* Target Output dropdown */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider block">3. Available Outputs for {selectedInputExt}</label>
              <div className="relative">
                <select
                  value={selectedOutputExt}
                  onChange={(e) => handleOutputExtChange(e.target.value)}
                  className="w-full appearance-none bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-white/10 px-4 py-2.5 rounded-xl text-zinc-800 dark:text-zinc-200 font-semibold focus:outline-none focus:border-purple-500 font-mono text-xs cursor-pointer pr-10"
                >
                  {getOutputsForInput(selectedInputExt).map(ext => (
                    <option key={ext} value={ext} className="bg-white dark:bg-zinc-950 text-zinc-850 dark:text-white font-mono">
                      {ext}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-zinc-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-purple-50/50 dark:bg-black/30 border border-purple-100/80 dark:border-white/5 text-[9px] text-zinc-500 font-mono space-y-0.5">
              <div>COMPRESS TYPE: <span className="text-zinc-700 dark:text-zinc-300 font-bold">Multi-Stream LZMA</span></div>
              <div>SPEED FACTOR: <span className="text-purple-600 dark:text-purple-400 font-bold">10x Speed Booster</span></div>
              <div>CLOUD DISPATCH: <span className="text-emerald-600 dark:text-emerald-400 font-bold">ENABLED</span></div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
