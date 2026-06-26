import React, { useState } from 'react';
import { CreditCard, Check, Sparkles, Shield, Receipt, Download, AlertCircle, Award, Gift, Users, Copy, CheckCircle } from 'lucide-react';
import { User, PlanType } from '../types';
import confetti from 'canvas-confetti';

interface BillingProps {
  currentUser: User | null;
  onUpgradePlan: (plan: PlanType, creditsToAdd: number) => void;
  onOpenAuth: () => void;
}

export default function Billing({ currentUser, onUpgradePlan, onOpenAuth }: BillingProps) {
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [isPaying, setIsPaying] = useState(false);
  const [billingInvoices, setBillingInvoices] = useState<{ id: string; date: string; plan: string; amount: string; status: string }[]>([
    { id: 'INV-40291', date: 'May 12, 2026', plan: 'Professional Plan', amount: '$15.00', status: 'Paid' },
    { id: 'INV-39182', date: 'Apr 12, 2026', plan: 'Professional Plan', amount: '$15.00', status: 'Paid' }
  ]);

  // Customizable Credit Bundle State
  const [customCredits, setCustomCredits] = useState(150);
  const [checkoutCredits, setCheckoutCredits] = useState(150);
  const [checkoutPrice, setCheckoutPrice] = useState('9.99');
  const [copiedReferralLink, setCopiedReferralLink] = useState(false);

  // Volumetric Pricing engine for customization
  const getCustomCreditsPrice = (credits: number) => {
    if (credits === 150) return '9.99';
    if (credits < 150) {
      return (credits * 0.07).toFixed(2);
    } else if (credits < 500) {
      return (credits * 0.0666).toFixed(2);
    } else {
      return (credits * 0.05).toFixed(2);
    }
  };

  const plans = [
    {
      id: 'anonymous' as PlanType,
      name: 'Anonymous Guest',
      price: '$0',
      period: 'forever',
      description: 'Convert files instantly in your local browser sandbox.',
      credits: 5,
      conversions: '5 free daily credits',
      features: [
        '5 conversions per day reset at midnight',
        'Single and parallel file uploads',
        'Standard edge routing speed',
        '24-hour cache lifespan for processed files',
        'No signup or email verification required'
      ],
      color: 'border-white/5 bg-white/2 backdrop-blur-md text-zinc-300'
    },
    {
      id: 'free' as PlanType,
      name: 'Registered User',
      price: '$0',
      period: 'requires account',
      description: 'Activate cloud integrations, save full ledger logs, and custom workflows.',
      credits: 15,
      conversions: '15 free daily credits',
      features: [
        '15 conversions per day reset at midnight',
        'High-priority Cloudflare Worker queue nodes',
        'Access to Custom Automation Workflows',
        'Full 30-day chronological conversion history ledger',
        'Cloud storage integrations (S3, Dropbox, GCS, Azure)',
        'Referral reward bonus eligibility (+15 Cr per friend)'
      ],
      color: 'border-indigo-500/50 bg-white/5 text-indigo-100 ring-1 ring-indigo-500/20 shadow-indigo-500/5 shadow-lg',
      popular: true
    },
    {
      id: 'pro' as PlanType,
      name: 'Standard Credit Bundle',
      price: `$${getCustomCreditsPrice(customCredits)}`,
      period: `${customCredits} credits`,
      description: 'High-speed cloud processing queue with interactive sliders to scale.',
      credits: customCredits,
      conversions: `${customCredits} permanent credits`,
      features: [
        `${customCredits} premium cloud processing credits`,
        'Drag-to-customize dynamic credit volumes',
        'Bypass daily limit constraints completely',
        'High-priority parallel worker processing',
        'Full 30-day historical conversion logs',
        'No monthly recurring charges (pay once)'
      ],
      color: 'border-purple-500 bg-purple-500/5 text-purple-100 ring-1 ring-purple-500/30 shadow-purple-500/10 shadow-lg',
      customizable: true
    },
    {
      id: 'enterprise' as PlanType,
      name: 'Enterprise Plan',
      price: '$49.00',
      period: 'month',
      description: 'Unlimited volume processing, advanced custom workflows and direct API access.',
      credits: 99999,
      conversions: 'Unlimited daily conversions',
      features: [
        'Unlimited parallel batch conversions',
        'Fastest dedicated multi-core cloud runner queues',
        'Full custom workflow triggers and automation logs',
        'Secure multi-account collaborative dashboard',
        'Custom webhooks and API routing endpoints',
        '24/7 technical dedicated enterprise support'
      ],
      color: 'border-pink-500/50 bg-pink-500/5 text-pink-100 ring-1 ring-pink-500/20 shadow-pink-500/5 shadow-lg',
      enterprise: true
    }
  ];

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth();
      return;
    }

    setIsPaying(true);

    setTimeout(() => {
      setIsPaying(false);
      setShowCheckout(false);

      const creditsToSet = selectedPlan === 'pro' ? checkoutCredits : 99999;
      onUpgradePlan(selectedPlan!, creditsToSet);

      // Create fake invoice
      const newInvoice = {
        id: 'INV-' + Math.floor(Math.random() * 90000 + 10000),
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
        plan: selectedPlan === 'pro' ? `${checkoutCredits} Credits Package` : 'Enterprise Plan',
        amount: `$${checkoutPrice}`,
        status: 'Paid'
      };

      setBillingInvoices(prev => [newInvoice, ...prev]);

      // Celebration
      confetti({
        particleCount: 150,
        spread: 80,
        colors: ['#6366f1', '#a855f7', '#ec4899']
      });

      // Reset card inputs
      setCardNumber('');
      setCardName('');
      setCardExpiry('');
      setCardCvv('');
    }, 1500);
  };

  const downloadFakeInvoice = (invId: string) => {
    const isPro = selectedPlan === 'pro';
    const finalAmount = isPro ? checkoutPrice : '49.00';
    const finalDescription = isPro ? `${checkoutCredits} Premium Credits` : 'Unlimited Enterprise Plan';

    const dummyBlob = new Blob([
      `OMNICONVERT SAAS BILLING INVOICE\n`,
      `==============================\n`,
      `Invoice Number: ${invId}\n`,
      `Date: ${new Date().toLocaleDateString()}\n`,
      `Billed To: ${currentUser?.name || 'Valued Sandbox Member'}\n`,
      `Email: ${currentUser?.email || 'member@omniconvert.com'}\n\n`,
      `ITEM DESCRIPTION                         AMOUNT\n`,
      `-----------------------------------------------\n`,
      `OmniConvert - ${finalDescription.padEnd(25)} $${finalAmount}\n`,
      `-----------------------------------------------\n`,
      `TOTAL PAID:                              $${finalAmount}\n\n`,
      `Thank you for your business!`
    ], { type: 'text/plain' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(dummyBlob);
    link.download = `OmniConvert_${invId}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openCheckout = (plan: PlanType) => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    setSelectedPlan(plan);
    if (plan === 'pro') {
      setCheckoutCredits(customCredits);
      setCheckoutPrice(getCustomCreditsPrice(customCredits));
    } else if (plan === 'enterprise') {
      setCheckoutCredits(99999);
      setCheckoutPrice('49.00');
    }
    setShowCheckout(true);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8" id="billing-workspace">
      
      {/* Header Title */}
      <div className="text-center max-w-3xl mx-auto space-y-2">
        <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-white" id="billing-heading">
          Flexible Plans for Modern Teams
        </h1>
        <p className="text-sm md:text-base text-zinc-400">
          Unlock high-speed batch conversions, complete cloud storage pipelines, and advanced visual automation custom workflows.
        </p>
      </div>

      {/* Referral Gamification Highlight Banner */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-indigo-500/10 to-purple-500/10 border border-indigo-500/20 shadow-xl relative overflow-hidden text-left" id="billing-referral-banner">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1.5 max-w-2xl">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-bold uppercase tracking-wider text-emerald-400 font-mono">
              <Gift className="w-3.5 h-3.5" /> Active Referral Gamification Loop
            </span>
            {currentUser?.referredBy ? (
              <div>
                <h3 className="text-sm md:text-base font-bold text-white flex items-center gap-1.5">
                  Referred Account Detected! <Sparkles className="w-4.5 h-4.5 text-yellow-400 animate-pulse" />
                </h3>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  You signed up via a friend's referral link! Purchasing the standard credit bundle or any premium package above will instantly credit <span className="text-emerald-400 font-bold font-mono">+100 bonus credits</span> to your balance, and <span className="text-indigo-400 font-bold font-mono">+100 bonus credits</span> to your referrer!
                </p>
              </div>
            ) : (
              <div>
                <h3 className="text-sm md:text-base font-bold text-white flex items-center gap-1.5">
                  Want Free Premium Credits? Refer Your Friends! <Award className="w-4.5 h-4.5 text-indigo-400" />
                </h3>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Earn unlimited credits! Share your custom referral link. For each colleague who registers, they get <span className="text-emerald-400 font-bold font-mono">+15 bonus credits</span>. When they subscribe, both of you get <span className="text-indigo-400 font-bold font-mono">+100 bonus credits</span> instantly added to your balances!
                </p>
              </div>
            )}
          </div>

          {currentUser ? (
            <div className="shrink-0 w-full md:w-auto space-y-2">
              <span className="block text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-wider">Your Unique Referral Link</span>
              <div className="flex items-center gap-1.5 p-1 bg-black/40 border border-white/5 rounded-xl max-w-xs">
                <span className="text-[10px] font-mono text-zinc-300 truncate pl-2 max-w-[140px]">
                  {window.location.origin}/?ref={currentUser.id}
                </span>
                <button
                  onClick={() => {
                    const url = `${window.location.origin}/?ref=${currentUser.id}`;
                    navigator.clipboard.writeText(url);
                    setCopiedReferralLink(true);
                    setTimeout(() => setCopiedReferralLink(false), 2000);
                  }}
                  className={`px-3 py-1 rounded-lg text-[10px] font-black font-mono transition-all text-center cursor-pointer select-none ${
                    copiedReferralLink ? 'bg-emerald-600 text-white' : 'btn-primary text-white'
                  }`}
                >
                  {copiedReferralLink ? 'Copied!' : 'Copy'}
                </button>
              </div>
              
              {/* Social sharing icons for popular platforms */}
              <div className="flex items-center justify-start gap-1.5 mt-2">
                <span className="text-[8px] uppercase tracking-wider font-mono text-zinc-500 font-black">Share Link To:</span>
                {(() => {
                  const sUrl = `${window.location.origin}/?ref=${currentUser.id}`;
                  const sText = `Convert files instantly with OmniConvert! Join using my link for +15 credits, and we both get +100 credits when you subscribe! 🚀`;
                  return (
                    <div className="flex gap-1">
                      <a 
                        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(sText)}&url=${encodeURIComponent(sUrl)}`}
                        target="_blank" 
                        rel="noreferrer"
                        className="p-1 px-2 rounded bg-white/5 hover:bg-zinc-800 text-[9px] font-mono text-zinc-400 hover:text-white"
                        title="Twitter/X"
                      >
                        X
                      </a>
                      <a 
                        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(sUrl)}`}
                        target="_blank" 
                        rel="noreferrer"
                        className="p-1 px-2 rounded bg-white/5 hover:bg-indigo-600/20 text-[9px] font-mono text-zinc-400 hover:text-indigo-400"
                        title="LinkedIn"
                      >
                        In
                      </a>
                      <a 
                        href={`https://api.whatsapp.com/send?text=${encodeURIComponent(sText + ' ' + sUrl)}`}
                        target="_blank" 
                        rel="noreferrer"
                        className="p-1 px-2 rounded bg-white/5 hover:bg-emerald-600/20 text-[9px] font-mono text-zinc-400 hover:text-emerald-400"
                        title="WhatsApp"
                      >
                        WA
                      </a>
                    </div>
                  );
                })()}
              </div>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-xs rounded-xl hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer shrink-0 w-full md:w-auto"
            >
              Sign In to Start Referring
            </button>
          )}
        </div>
      </div>

      {/* Subscription Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto animate-fade-in" id="billing-plans-grid">
        {plans.map((p) => {
          const isCurrentPlan = currentUser ? (currentUser.plan === p.id || (p.id === 'free' && currentUser.plan === 'free')) : (p.id === 'anonymous');
          return (
            <div 
              key={p.id}
              className={`relative rounded-3xl border p-6 md:p-8 flex flex-col justify-between overflow-hidden transition-all duration-300 glass-card ${p.color}`}
            >
              {p.popular && (
                <span className="absolute top-4 right-4 bg-indigo-600/80 text-[10px] font-bold text-white px-2.5 py-1 rounded-full uppercase tracking-wider font-mono animate-pulse">
                  Best Value
                </span>
              )}

              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-lg font-bold text-white">{p.name}</h3>
                    {p.customizable && <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />}
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">{p.description}</p>
                </div>

                <div className="flex items-baseline gap-1.5 border-b border-white/5 pb-4">
                  <span className="text-3xl font-black text-white">{p.price}</span>
                  <span className="text-zinc-500 text-xs">/ {p.period}</span>
                </div>

                {/* Customizable Slider Widget for Standard Credit Bundle */}
                {p.customizable && (
                  <div className="p-3.5 rounded-2xl bg-black/40 border border-purple-500/20 space-y-2 mt-2" id="credit-customizer-widget">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-zinc-400">Credits To Purchase:</span>
                      <span className="text-purple-400 font-black">{customCredits} Credits</span>
                    </div>
                    <input 
                      type="range"
                      min="50"
                      max="1500"
                      step="50"
                      value={customCredits}
                      onChange={(e) => setCustomCredits(Number(e.target.value))}
                      className="w-full accent-purple-500 cursor-pointer h-1 bg-zinc-800 rounded-lg appearance-none"
                    />
                    <div className="flex items-center justify-between text-[9px] text-zinc-500 font-mono">
                      <span>50 Cr ($3.50)</span>
                      <span>1,500 Cr ($75.00)</span>
                    </div>
                    <div className="bg-purple-500/10 rounded-xl p-2.5 border border-purple-500/20 text-center text-[10px] text-zinc-300">
                      <p className="font-semibold text-purple-300">💡 Custom volume selection activated!</p>
                      <p className="text-[9px] text-zinc-400 mt-0.5">Need a specific amount? Drag the slider to customize credits dynamically.</p>
                    </div>
                  </div>
                )}

                <ul className="space-y-3 pt-2 text-xs text-zinc-400">
                  {p.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="text-zinc-300">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6">
                {p.id === 'anonymous' ? (
                  !currentUser ? (
                    <button 
                      disabled 
                      className="w-full py-2.5 bg-zinc-800 text-zinc-400 text-xs font-bold rounded-xl cursor-not-allowed text-center border border-white/5"
                    >
                      Active Session (Guest)
                    </button>
                  ) : (
                    <button 
                      disabled 
                      className="w-full py-2.5 bg-white/5 text-zinc-600 text-xs font-bold rounded-xl cursor-not-allowed text-center border border-white/5"
                    >
                      Included
                    </button>
                  )
                ) : p.id === 'free' ? (
                  currentUser ? (
                    <button 
                      disabled 
                      className="w-full py-2.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold rounded-xl cursor-not-allowed text-center"
                    >
                      Active Plan
                    </button>
                  ) : (
                    <button 
                      onClick={onOpenAuth}
                      className="w-full py-2.5 btn-primary text-white text-xs font-bold rounded-xl shadow-lg transition-all text-center cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
                    >
                      Register Free Account
                    </button>
                  )
                ) : (
                  // Premium paid bundles
                  currentUser ? (
                    <button 
                      onClick={() => openCheckout(p.id)}
                      className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-lg transition-all text-center cursor-pointer"
                    >
                      {p.id === 'pro' ? `Purchase ${customCredits} Credits` : 'Purchase Enterprise Plan'}
                    </button>
                  ) : (
                    <button 
                      onClick={onOpenAuth}
                      className="w-full py-2.5 btn-primary text-white text-xs font-bold rounded-xl shadow-lg transition-all text-center cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
                    >
                      Sign In to Buy
                    </button>
                  )
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Invoice Receipts Table */}
      {currentUser && (
        <div className="p-6 rounded-2xl glass-card border border-white/5 space-y-4" id="billing-invoices-panel">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <Receipt className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-zinc-100">Billed Invoices Receipt Ledger</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/5 text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-mono">
                  <th className="p-3">Invoice Number</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Plan Package</th>
                  <th className="p-3">Billing Amount</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Invoice Download</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {billingInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-white/2 transition-colors">
                    <td className="p-3 font-mono font-bold text-zinc-300">{inv.id}</td>
                    <td className="p-3 text-zinc-400">{inv.date}</td>
                    <td className="p-3 text-zinc-300 font-semibold">{inv.plan}</td>
                    <td className="p-3 text-zinc-300 font-mono font-bold">{inv.amount}</td>
                    <td className="p-3">
                      <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">
                        {inv.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button 
                        onClick={() => downloadFakeInvoice(inv.id)}
                        className="p-1 text-zinc-500 hover:text-indigo-400 inline-flex items-center gap-1 text-[11px] font-bold cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PAYMENT MODAL CHECKOUT */}
      {showCheckout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" id="checkout-modal-overlay">
          <div className="relative w-full max-w-lg glass rounded-2xl overflow-hidden shadow-2xl p-6 md:p-8 text-zinc-100" id="checkout-modal-container">
            
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl btn-primary text-white mb-2">
                <CreditCard className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-white">Upgrade Subscription Checkout</h2>
              <p className="text-xs text-zinc-400 mt-1">Configure your secure payment method for automated billing</p>
            </div>

            {/* Simulated Animated Credit Card mockup */}
            <div className="mb-6 p-5 rounded-2xl bg-gradient-to-br from-indigo-700 via-purple-700 to-pink-700 shadow-xl text-white relative overflow-hidden" id="card-mockup">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10" />
              
              <div className="flex justify-between items-start">
                <span className="text-xs font-mono font-bold tracking-wider">OMNICONVERT SAAS</span>
                <span className="text-xs font-bold uppercase italic">VISA</span>
              </div>

              <div className="mt-8 font-mono text-lg tracking-widest text-center" id="card-mockup-number">
                {cardNumber || '•••• •••• •••• ••••'}
              </div>

              <div className="flex justify-between items-end mt-8">
                <div>
                  <span className="text-[9px] uppercase text-white/60 block">Cardholder</span>
                  <span className="text-xs font-medium uppercase font-mono truncate max-w-[150px] block">{cardName || 'YOUR NAME'}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase text-white/60 block">Expires</span>
                  <span className="text-xs font-mono font-bold block">{cardExpiry || 'MM/YY'}</span>
                </div>
              </div>
            </div>

            {/* Dynamic Checkout Details Box */}
            <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 mb-4 flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <p className="text-zinc-400">Package Volume:</p>
                <p className="font-black text-white">{selectedPlan === 'pro' ? `${checkoutCredits} Credits Bundle` : 'Enterprise Unlimited'}</p>
              </div>
              <div className="text-right space-y-0.5">
                <p className="text-zinc-400">Amount Due:</p>
                <p className="text-emerald-400 font-black font-mono text-sm">${checkoutPrice}</p>
              </div>
            </div>

            {/* Payment Fields */}
            <form onSubmit={handleCheckoutSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">Cardholder Name</label>
                <input 
                  type="text" 
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="w-full glass-input rounded-xl px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">Credit Card Number</label>
                <input 
                  type="text" 
                  value={cardNumber}
                  onChange={(e) => {
                    const formatted = e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim();
                    setCardNumber(formatted.substring(0, 19));
                  }}
                  className="w-full glass-input rounded-xl px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none font-mono"
                  placeholder="4111 2222 3333 4444"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">Expiration Date</label>
                  <input 
                    type="text" 
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="w-full glass-input rounded-xl px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none font-mono"
                    placeholder="MM/YY"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">Security Code (CVV)</label>
                  <input 
                    type="password" 
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value.substring(0, 3))}
                    className="w-full glass-input rounded-xl px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none font-mono"
                    placeholder="•••"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="submit"
                  disabled={isPaying}
                  className="flex-1 py-2.5 px-4 btn-primary active:scale-95 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {isPaying ? 'Synchronizing payment nodes...' : `Pay $${checkoutPrice} & Upgrade`}
                </button>
                <button
                  onClick={() => setShowCheckout(false)}
                  className="py-2.5 px-4 glass text-zinc-300 hover:text-zinc-100 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
