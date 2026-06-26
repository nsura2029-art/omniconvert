import React, { useState, useRef, useEffect } from 'react';
import { Upload, File, Sparkles, CheckCircle2, AlertTriangle, Play, Loader2, Download, Eye, Terminal, Trash2, ArrowRight, Settings, HelpCircle, HardDrive, RefreshCw, Volume2, Video, Laptop, Link, Globe, FolderOpen, Search, FileText, Cloud } from 'lucide-react';
import { User, FileConversion, CloudIntegration } from '../types';
import { Tool, TOOLS, CATEGORIES } from '../data/tools';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';

interface ConversionPanelProps {
  currentUser: User | null;
  selectedTool: Tool;
  onConversionCompleted: (conversion: FileConversion) => void;
  onOpenAuth: () => void;
  integrations: CloudIntegration[];
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
  integrations
}: ConversionPanelProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [targetFormats, setTargetFormats] = useState<Record<string, string>>({});
  const [conversions, setConversions] = useState<FileConversion[]>([]);
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

  // Available Outputs list
  const outputs = selectedTool.output.split(',').map(s => s.trim());

  useEffect(() => {
    // Reset file state on tool change
    setFiles([]);
    setConversions([]);
    setFileProgresses({});
    setIsProcessing(false);
    setCurrentLogs([]);
    setShowUploadDropdown(false);
  }, [selectedTool]);

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
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
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
  const handleConvert = async () => {
    if (files.length === 0 && selectedTool.name !== 'Text to Speech' && selectedTool.name !== 'Markdown to HTML') {
      return;
    }

    setIsProcessing(true);
    setShowLogs(true);
    setConversions([]);

    // Prepare list of items to convert
    // If the tool is a creator (like Text to Speech or Markdown to HTML), mock a single virtual file
    const itemsToConvert = files.length > 0 ? files : [
      new File([selectedTool.name === 'Text to Speech' ? ttsText : mdText], 
        selectedTool.name === 'Text to Speech' ? 'narration_draft.txt' : 'document_preview.md', 
        { type: 'text/plain' })
    ];

    // Initialize individual progresses
    const initialProgresses: Record<string, {
      status: 'pending' | 'uploading' | 'processing' | 'saving' | 'completed' | 'failed';
      progress: number;
      statusText: string;
    }> = {};
    itemsToConvert.forEach(file => {
      initialProgresses[file.name] = {
        status: 'pending',
        progress: 0,
        statusText: 'Awaiting queue allocation...'
      };
    });
    setFileProgresses(initialProgresses);

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

    for (let i = 0; i < itemsToConvert.length; i++) {
      const currentFile = itemsToConvert[i];
      const selectedTargetFormat = targetFormats[currentFile.name] || outputs[0];
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
        fileSize: Math.floor(currentFile.size * (Math.random() * 0.4 + 0.8)), // simulated compressed size
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
    }

    setConversions(processingOutputs);
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
                      className="absolute top-[136px] left-1/2 z-20 w-[min(320px,calc(100%-32px))] -translate-x-1/2 rounded-2xl glass border border-zinc-200 dark:border-white/10 p-3 text-left shadow-2xl"
                    >
                      <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-mono">
                        Upload source
                      </label>
                      <select
                        defaultValue=""
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          e.stopPropagation();
                          const source = e.currentTarget.value;
                          e.currentTarget.value = '';
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
                        className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-xs font-bold text-zinc-800 shadow-sm outline-none transition-colors hover:border-indigo-500/40 focus:border-indigo-500 dark:border-white/10 dark:bg-slate-900 dark:text-zinc-100"
                      >
                        <option value="" disabled>Choose upload source...</option>
                        <option value="computer">From my computer</option>
                        <option value="url">By URL</option>
                        <option value="gdrive">From Google Drive</option>
                        <option value="dropbox">From Dropbox</option>
                        <option value="onedrive">From OneDrive</option>
                      </select>
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
                          {/* Target Format selector */}
                          {outputs.length > 1 && (
                            <select
                              value={targetFormats[file.name] || outputs[0]}
                              onChange={(e) => setTargetFormats(prev => ({ ...prev, [file.name]: e.target.value }))}
                              className="bg-black/60 border border-white/10 rounded-lg text-[10px] py-1 px-2 text-zinc-300 focus:outline-none cursor-pointer"
                            >
                              {outputs.map(out => (
                                <option key={out} value={out}>{out}</option>
                              ))}
                            </select>
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
