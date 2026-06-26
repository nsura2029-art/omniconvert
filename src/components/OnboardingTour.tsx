import { useState, useEffect } from 'react';
import { Sparkles, HelpCircle, ArrowRight, ArrowLeft, Check, Library, Route, Users, ShieldCheck, X } from 'lucide-react';
import confetti from 'canvas-confetti';

interface OnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAuth: () => void;
  onNavigatePage: (page: string) => void;
}

export default function OnboardingTour({ isOpen, onClose, onOpenAuth, onNavigatePage }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Completed onboarding
      localStorage.setItem('omni_onboarded', 'true');
      confetti({ particleCount: 60, spread: 60 });
      onClose();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('omni_onboarded', 'true');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in" id="onboarding-modal-overlay">
      <div 
        className="relative w-full max-w-2xl glass rounded-3xl overflow-hidden shadow-2xl p-6 md:p-8 text-slate-100 flex flex-col justify-between min-h-[480px]"
        id="onboarding-modal-container"
      >
        {/* Skip & Close Button */}
        <button 
          onClick={handleSkip}
          className="absolute top-4 right-4 p-1.5 text-zinc-400 hover:text-zinc-200 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
          id="onboarding-close-btn"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Step Indicators */}
        <div className="flex items-center gap-1.5 mb-6" id="onboarding-steps">
          {Array.from({ length: totalSteps }).map((_, idx) => (
            <div 
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx + 1 === currentStep 
                  ? 'w-8 bg-indigo-500' 
                  : idx + 1 < currentStep 
                    ? 'w-3 bg-emerald-500' 
                    : 'w-3 bg-white/10'
              }`}
            />
          ))}
          <span className="text-[10px] text-zinc-500 font-mono font-bold ml-2 uppercase">Step {currentStep} of {totalSteps}</span>
        </div>

        {/* Content Box with dynamic switches */}
        <div className="flex-1 flex flex-col justify-center py-2" id="onboarding-body">
          {currentStep === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-2">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
                Welcome to OmniConvert!
              </h2>
              <p className="text-sm text-zinc-300 leading-relaxed max-w-lg">
                We're a high-speed, edge-optimized file conversion sandbox designed to run conversions with zero friction. Before we start, let's go over our daily sandbox usage limits:
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-white/2 border border-white/5 relative overflow-hidden group hover:border-amber-500/20 transition-all">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rounded-full blur-xl" />
                  <span className="text-[10px] font-mono uppercase font-bold text-amber-500">Guest Tier</span>
                  <p className="text-lg font-black text-white mt-1">5 / day</p>
                  <p className="text-xs text-zinc-400 mt-1">Anonymous guest limits. No sign-up required, but records are cached for 24h only.</p>
                </div>

                <div className="p-4 rounded-2xl bg-white/2 border border-white/5 relative overflow-hidden group hover:border-emerald-500/20 transition-all">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl" />
                  <span className="text-[10px] font-mono uppercase font-bold text-emerald-400">Registered Free Tier</span>
                  <p className="text-lg font-black text-white mt-1">15 / day</p>
                  <p className="text-xs text-zinc-400 mt-1">
                    Sign up for a free account to instantly upgrade to 15 free daily conversions!
                  </p>
                </div>
              </div>

              <p className="text-xs text-zinc-500 italic mt-2">
                Unlock higher daily limits and robust cloud backups by registering an account.
              </p>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 mb-2">
                <Library className="w-6 h-6" />
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
                150+ Powerful Conversion Tools
              </h2>
              <p className="text-sm text-zinc-300 leading-relaxed">
                OmniConvert features an extensive, fuzzy-searchable directory of conversion engines across various categories:
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 font-mono">
                <div className="p-3 rounded-xl bg-white/2 border border-white/5 text-center">
                  <span className="text-xs font-bold text-zinc-200">Documents</span>
                  <span className="block text-[10px] text-zinc-500 mt-1">PDF, DOCX, XLSX</span>
                </div>
                <div className="p-3 rounded-xl bg-white/2 border border-white/5 text-center">
                  <span className="text-xs font-bold text-zinc-200">Images</span>
                  <span className="block text-[10px] text-zinc-500 mt-1">PNG, JPG, WEBP, SVG</span>
                </div>
                <div className="p-3 rounded-xl bg-white/2 border border-white/5 text-center">
                  <span className="text-xs font-bold text-zinc-200">Audio & Video</span>
                  <span className="block text-[10px] text-zinc-500 mt-1">MP3, WAV, MP4</span>
                </div>
                <div className="p-3 rounded-xl bg-white/2 border border-white/5 text-center">
                  <span className="text-xs font-bold text-zinc-200">CAD & Vector</span>
                  <span className="block text-[10px] text-zinc-500 mt-1">DWG, DXF, EPS</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 text-xs text-zinc-300 space-y-2">
                <p className="font-bold text-zinc-200">How to get started:</p>
                <ol className="list-decimal list-inside space-y-1 text-zinc-400">
                  <li>Select any tool from the searchable directory.</li>
                  <li>Drag & drop your files into the transcode sandbox.</li>
                  <li>Configure output parameters and click <span className="text-white font-bold">Compile Conversion</span>!</li>
                </ol>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4 animate-fade-in">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
                <Route className="w-6 h-6" />
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
                Automated Custom Workflows
              </h2>
              <p className="text-sm text-zinc-300 leading-relaxed">
                Take automation to the next level. Build multi-step execution pipelines running completely headless on serverless edge nodes:
              </p>

              <div className="flex flex-col gap-3 pt-1">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/2 border border-white/5">
                  <div className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-xs font-bold font-mono">1</div>
                  <div className="text-xs">
                    <p className="font-bold text-zinc-200">Add Pipeline Trigger</p>
                    <p className="text-zinc-500">Trigger on file drop or secure API webhook receipt.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/2 border border-white/5">
                  <div className="w-6 h-6 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center text-xs font-bold font-mono">2</div>
                  <div className="text-xs">
                    <p className="font-bold text-zinc-200">Chain Multiple Processors</p>
                    <p className="text-zinc-500">Transcode to PDF, compress size, and inject watermarks sequentially.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/2 border border-white/5">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xs font-bold font-mono">3</div>
                  <div className="text-xs">
                    <p className="font-bold text-zinc-200">Direct Cloud Push</p>
                    <p className="text-zinc-500">Stream outputs directly to your AWS S3 bucket, Azure Blob or Dropbox account.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-4 animate-fade-in">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-2">
                <Users className="w-6 h-6" />
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
                Earn Free Bonus Credits!
              </h2>
              <p className="text-sm text-zinc-300 leading-relaxed">
                We've introduced a **Referral Program** to help you earn premium credits! Once you create a free account, you'll get a unique link to share with your colleagues or community:
              </p>

              <div className="p-5 rounded-2xl bg-gradient-to-tr from-indigo-500/10 to-purple-500/5 border border-indigo-500/20 space-y-3">
                <div className="flex items-start gap-2.5">
                  <Check className="w-4.5 h-4.5 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-zinc-200">
                    <span className="font-bold text-white">Instant Friend Bonus:</span> Friends who sign up through your link receive <span className="text-emerald-400 font-bold">+15 bonus credits</span> instantly.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4.5 h-4.5 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-zinc-200">
                    <span className="font-bold text-white">Subscription Reward:</span> When your referred friend upgrades to Pro/Enterprise, <span className="text-indigo-400 font-bold">both of you receive +100 bonus credits</span>!
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button 
                  onClick={() => {
                    onClose();
                    onOpenAuth();
                  }}
                  className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs rounded-xl transition-all text-center cursor-pointer shadow-lg shadow-emerald-600/10"
                >
                  Create Free Account (Get +10/Day)
                </button>
                <button 
                  onClick={() => {
                    onClose();
                    onNavigatePage('billing');
                  }}
                  className="flex-1 py-2.5 px-4 glass border-white/5 hover:bg-white/5 active:scale-95 text-zinc-300 font-bold text-xs rounded-xl transition-all text-center cursor-pointer"
                >
                  View Subscription Pricing
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Buttons */}
        <div className="flex items-center justify-between border-t border-white/5 pt-5 mt-6" id="onboarding-footer">
          <button 
            onClick={handleBack}
            disabled={currentStep === 1}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-white/5 transition-all disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="hidden sm:flex items-center gap-1">
            {Array.from({ length: totalSteps }).map((_, idx) => (
              <button 
                key={idx}
                onClick={() => setCurrentStep(idx + 1)}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx + 1 === currentStep ? 'bg-indigo-500 scale-125' : 'bg-white/15 hover:bg-white/30'
                }`}
              />
            ))}
          </div>

          <button 
            onClick={handleNext}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/15 cursor-pointer"
          >
            {currentStep === totalSteps ? 'Finish & Start' : 'Next Step'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
