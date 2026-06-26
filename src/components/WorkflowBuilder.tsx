import { useState } from 'react';
import { Route, Play, Plus, Trash2, ArrowRight, Sparkles, Sliders, CheckCircle, Database, HelpCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { Workflow, WorkflowNode } from '../types';
import confetti from 'canvas-confetti';

interface WorkflowBuilderProps {
  onAddConversionFromWorkflow: (fileName: string, toolName: string, category: string, creditCost: number) => void;
}

export default function WorkflowBuilder({ onAddConversionFromWorkflow }: WorkflowBuilderProps) {
  const [workflows, setWorkflows] = useState<Workflow[]>([
    {
      id: 'flow_1',
      name: 'Auto-Rasterize & Backup to S3',
      active: true,
      nodes: [
        { id: 'n1', type: 'trigger', title: 'Input PDF Document', description: 'Triggers on manual batch upload', config: {} },
        { id: 'n2', type: 'convert', title: 'Extract Vector Artwork', description: 'Compiles pages to SVG vector format', config: { tool: 'PDF to SVG' } },
        { id: 'n3', type: 'optimize', title: 'Optimize SVGs', description: 'Removes unnecessary metadata bounds', config: { level: 'High' } },
        { id: 'n4', type: 'storage', title: 'Upload to S3 Bucket', description: 'Streams straight to Amazon Web Services', config: { target: 'Amazon S3' } },
      ],
      lastRun: 'Never'
    },
    {
      id: 'flow_2',
      name: 'Ebook Converter & Compressor',
      active: false,
      nodes: [
        { id: 'n5', type: 'trigger', title: 'Input EPUB Ebook', description: 'Awaits EPUB files drop', config: {} },
        { id: 'n6', type: 'convert', title: 'Convert to Kindle MOBI', description: 'Translates to Kindle layout', config: { tool: 'EPUB to MOBI' } },
        { id: 'n7', type: 'storage', title: 'Dropbox Sync', description: 'Backs up to connected Dropbox account', config: { target: 'Dropbox' } },
      ],
      lastRun: 'Never'
    }
  ]);

  const [selectedFlowId, setSelectedFlowId] = useState<string>('flow_1');
  const [isRunning, setIsRunning] = useState(false);
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const selectedFlow = workflows.find(w => w.id === selectedFlowId) || workflows[0];

  const handleRunWorkflow = async () => {
    setIsRunning(true);
    setLogs([]);
    
    const addLog = (msg: string) => {
      setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
    };

    addLog(`Initializing Workflow Automation Engine: "${selectedFlow.name}"`);

    for (let i = 0; i < selectedFlow.nodes.length; i++) {
      const node = selectedFlow.nodes[i];
      setActiveNodeId(node.id);
      addLog(`[NODE-RUN] Executing: ${node.title}...`);
      
      // Node specific actions simulation
      if (node.type === 'trigger') {
        addLog(`[TRIGGER] Input detected. Scanning data stream...`);
      } else if (node.type === 'convert') {
        addLog(`[COMPILER] Spawning Cloudflare Workers sandbox...`);
        addLog(`[COMPILER] Initiating format compiler: "${node.config.tool || 'Default'}"`);
      } else if (node.type === 'optimize') {
        addLog(`[OPTIMIZER] Compressing redundant container coordinates...`);
      } else if (node.type === 'storage') {
        addLog(`[STORAGE] Uploading secure buffers to: ${node.config.target || 'Cloud Cache'}`);
      }

      await new Promise(resolve => setTimeout(resolve, 850));
    }

    // Workflow finished
    setActiveNodeId(null);
    setIsRunning(false);
    addLog(`[SUCCESS] Workflow Pipeline Executed flawlessly!`);

    // Add record to recent conversions
    onAddConversionFromWorkflow(
      `workflow_out_${Math.floor(Math.random() * 900 + 100)}.svg`,
      'PDF to SVG',
      'Vectors',
      5
    );

    // Update workflow last run
    setWorkflows(prev => prev.map(w => {
      if (w.id === selectedFlow.id) {
        return { ...w, lastRun: new Date().toLocaleTimeString() };
      }
      return w;
    }));

    confetti({
      particleCount: 80,
      angle: 60,
      spread: 55,
      origin: { x: 0 }
    });
    confetti({
      particleCount: 80,
      angle: 120,
      spread: 55,
      origin: { x: 1 }
    });
  };

  const handleCreateWorkflow = () => {
    const flowId = 'flow_' + Math.random().toString(36).substr(2, 9);
    const newFlow: Workflow = {
      id: flowId,
      name: `Custom Workflow #${workflows.length + 1}`,
      active: true,
      nodes: [
        { id: 'n_' + Math.random(), type: 'trigger', title: 'Custom Input Trigger', description: 'Starts pipeline processing', config: {} },
        { id: 'n_' + Math.random(), type: 'convert', title: 'JPG to PNG Convert', description: 'Slices lossy JPGs to PNG alpha', config: { tool: 'JPG to PNG' } },
        { id: 'n_' + Math.random(), type: 'storage', title: 'Backup to S3', description: 'Stream straight to S3 storage', config: { target: 'Amazon S3' } },
      ],
      lastRun: 'Never'
    };

    setWorkflows(prev => [...prev, newFlow]);
    setSelectedFlowId(flowId);
  };

  const handleDeleteWorkflow = (id: string) => {
    if (workflows.length <= 1) return;
    setWorkflows(prev => prev.filter(w => w.id !== id));
    setSelectedFlowId(workflows[0].id);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6" id="workflow-builder-workspace">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white" id="workflow-heading">
            Custom Automation Workflows
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Build serverless automation pipelines. Chained file conversions, optimizing triggers, and autonomous storage backups.
          </p>
        </div>
        
        <button
          onClick={handleCreateWorkflow}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/10 cursor-pointer transition-all"
          id="create-workflow-btn"
        >
          <Plus className="w-4 h-4" />
          Create New Pipeline
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left selector sidebar */}
        <div className="space-y-4">
          <div className="rounded-2xl glass-card border border-white/5 p-4 space-y-3 bg-white/2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 font-mono">My Pipelines</span>
            <div className="space-y-2">
              {workflows.map((flow) => (
                <div
                  key={flow.id}
                  onClick={() => setSelectedFlowId(flow.id)}
                  className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                    selectedFlowId === flow.id
                      ? 'glass border-indigo-500/50 shadow-md shadow-indigo-500/5 bg-white/5'
                      : 'bg-black/10 border-white/5 hover:border-white/10'
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-zinc-100 truncate">{flow.name}</p>
                    <p className="text-[10px] text-zinc-400 font-mono mt-0.5">Last run: {flow.lastRun}</p>
                  </div>
                  <button
                    disabled={workflows.length <= 1}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteWorkflow(flow.id);
                    }}
                    className="p-1 text-zinc-500 hover:text-rose-400 disabled:opacity-30 disabled:hover:text-zinc-500 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-950/10 border border-indigo-500/20 text-xs text-indigo-300 flex gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p>
              Workflows run completely headless on Cloudflare edge serverless workers, allowing lightning fast parallel batch processing.
            </p>
          </div>
        </div>

        {/* Builder View & Visual Canvas */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Node Chaining layout */}
          <div className="p-6 rounded-2xl glass-card border border-white/5 space-y-6 bg-white/2" id="workflow-canvas">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <Route className="w-4.5 h-4.5 text-indigo-400" />
                <span className="text-xs font-bold text-zinc-100 uppercase tracking-wider font-mono">Automation Pipeline: {selectedFlow.name}</span>
              </div>
              <button
                onClick={handleRunWorkflow}
                disabled={isRunning}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-bold rounded-lg cursor-pointer transition-all shadow-md"
              >
                {isRunning ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Running Pipeline...
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Run Workflow Pipeline
                  </>
                )}
              </button>
            </div>

            {/* Pipeline Visual Node Chaining List */}
            <div className="flex flex-col gap-4 relative pl-3 border-l-2 border-white/10" id="pipeline-nodes-flow">
              {selectedFlow.nodes.map((node, index) => {
                const isActive = activeNodeId === node.id;
                return (
                  <div key={node.id} className="relative">
                    {/* Node Dot marker */}
                    <div className={`absolute -left-[19px] top-4 w-3.5 h-3.5 rounded-full border-2 transition-all ${
                      isActive 
                        ? 'bg-emerald-400 border-emerald-400 scale-125 animate-ping' 
                        : 'bg-zinc-950 border-white/10'
                    }`} />
                    <div className={`absolute -left-[19px] top-4 w-3.5 h-3.5 rounded-full border-2 transition-all ${
                      isActive 
                        ? 'bg-emerald-400 border-emerald-400 scale-125' 
                        : 'bg-zinc-950 border-white/10'
                    }`} />

                    <div className={`p-4 rounded-xl border transition-all ${
                      isActive 
                        ? 'bg-emerald-500/5 border-emerald-500/40 shadow-lg shadow-emerald-500/5' 
                        : 'bg-black/10 border-white/5'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[9px] font-bold font-mono uppercase bg-black/40 text-indigo-300 px-2 py-0.5 rounded border border-white/5">
                            Step {index + 1}: {node.type}
                          </span>
                          <h4 className="text-xs font-bold text-zinc-100 mt-2">{node.title}</h4>
                          <p className="text-[10px] text-zinc-400 mt-0.5">{node.description}</p>
                        </div>
                        
                        {/* Interactive Parameters info */}
                        {node.config && Object.keys(node.config).length > 0 && (
                          <div className="text-[10px] bg-black/40 px-2.5 py-1.5 rounded-lg border border-white/5 font-mono text-zinc-300">
                            {Object.entries(node.config).map(([k, v]) => (
                              <p key={k}><span className="text-zinc-500">{k}:</span> {v}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Workflow Console Log */}
          {logs.length > 0 && (
            <div className="rounded-2xl glass border border-white/5 overflow-hidden flex flex-col animate-fade-in" id="workflow-console">
              <div className="flex items-center gap-2 bg-black/30 border-b border-white/5 px-4 py-3 text-[10px] uppercase font-bold tracking-wider text-zinc-400 font-mono">
                <Sliders className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                Pipeline Execution Logs Console
              </div>
              <div className="p-4 max-h-[140px] overflow-y-auto font-mono text-[10px] text-zinc-400 space-y-1.5 leading-relaxed">
                {logs.map((log, idx) => (
                  <p key={idx} className={log.includes('[SUCCESS]') ? 'text-emerald-400' : 'text-zinc-400'}>{log}</p>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
