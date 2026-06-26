import React, { useState } from 'react';
import { Mail, Lock, User as UserIcon, X, Shield, Sparkles } from 'lucide-react';
import { User, PlanType } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: User) => void;
}

export default function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !password || (isSignUp && !name)) {
      setError('Please fill in all fields.');
      return;
    }

    if (password.length < 5) {
      setError('Password must be at least 5 characters.');
      return;
    }

    const savedUsersStr = localStorage.getItem('omni_users') || '[]';
    const usersList: User[] = JSON.parse(savedUsersStr);

    if (isSignUp) {
      // Sign Up Logic
      const userExists = usersList.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (userExists) {
        setError('A user with this email already exists.');
        return;
      }

      const pendingReferrer = localStorage.getItem('omni_pending_referrer') || '';
      const hasReferral = pendingReferrer && pendingReferrer !== '';

      const newUser: User = {
        id: 'user_' + Math.random().toString(36).substr(2, 9),
        email: email.toLowerCase(),
        name,
        plan: 'free',
        credits: hasReferral ? 30 : 15, // starts with 15 free credits + 15 bonus if referred!
        maxDailyConversions: hasReferral ? 30 : 15,
        dailyConversionsCount: 0,
        createdAt: new Date().toISOString(),
        referredBy: hasReferral ? pendingReferrer : undefined,
        referredRewarded: false
      };

      if (hasReferral) {
        localStorage.removeItem('omni_pending_referrer');
      }

      usersList.push(newUser);
      localStorage.setItem('omni_users', JSON.stringify(usersList));
      setSuccess(hasReferral 
        ? 'Account created successfully with referral! You got +15 bonus credits! Logging you in...' 
        : 'Account created successfully! Logging you in...'
      );
      
      setTimeout(() => {
        onAuthSuccess(newUser);
        onClose();
      }, 1200);

    } else {
      // Sign In Logic
      // Support pre-defined accounts or custom registered accounts
      const userLower = email.toLowerCase();
      
      let matchedUser: User | undefined;

      if (userLower === 'admin@omniconvert.com' && password === 'admin123') {
        matchedUser = {
          id: 'admin_omni',
          email: 'admin@omniconvert.com',
          name: 'Chief Admin',
          plan: 'enterprise',
          credits: 99999,
          maxDailyConversions: 99999,
          dailyConversionsCount: 0,
          createdAt: new Date().toISOString(),
        };
      } else if (userLower === 'user@omniconvert.com' && password === 'user123') {
        matchedUser = {
          id: 'user_omni',
          email: 'user@omniconvert.com',
          name: 'Premium Member',
          plan: 'pro',
          credits: 450,
          maxDailyConversions: 100,
          dailyConversionsCount: 4,
          createdAt: new Date().toISOString(),
        };
      } else {
        matchedUser = usersList.find((u) => u.email.toLowerCase() === userLower);
      }

      if (!matchedUser) {
        setError('Invalid credentials. (Hint: Use admin@omniconvert.com / admin123 or register!)');
        return;
      }

      if (matchedUser.isBanned) {
        setError('This account has been banned by an administrator.');
        return;
      }

      setSuccess(`Welcome back, ${matchedUser.name}!`);
      const userToLogin = matchedUser;
      
      setTimeout(() => {
        onAuthSuccess(userToLogin);
        onClose();
      }, 1000);
    }
  };

  const handleSocialLogin = (provider: string) => {
    setError('');
    setSuccess('');
    // Simulate social login with Google or GitHub
    const defaultUser: User = {
      id: 'google_' + Math.random().toString(36).substr(2, 9),
      email: `${provider.toLowerCase()}_user@gmail.com`,
      name: `${provider} Connected User`,
      plan: 'free',
      credits: 15,
      maxDailyConversions: 15,
      dailyConversionsCount: 0,
      createdAt: new Date().toISOString(),
    };

    setSuccess(`Successfully authenticated via ${provider}!`);
    setTimeout(() => {
      onAuthSuccess(defaultUser);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in" id="auth-modal-overlay">
      <div 
        className="relative w-full max-w-md glass rounded-2xl overflow-hidden shadow-2xl p-6 md:p-8 text-zinc-800 dark:text-slate-100"
        id="auth-modal-container"
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-500/10 dark:hover:bg-white/5 transition-colors cursor-pointer"
          id="auth-close-btn"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Logo Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl btn-primary text-white mb-3 shadow-lg shadow-indigo-500/10">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white" id="auth-title">
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            {isSignUp ? 'Get 15 free conversions every single day' : 'Access your dashboard, history & workflows'}
          </p>
        </div>

        {/* Success / Error Messages */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-start gap-2 animate-shake" id="auth-error-banner">
            <Shield className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-start gap-2" id="auth-success-banner">
            <Sparkles className="w-4 h-4 shrink-0 mt-0.5 animate-pulse" />
            <span>{success}</span>
          </div>
        )}

        {/* Quick Credentials Hint */}
        {!isSignUp && (
          <div className="mb-5 p-3 rounded-xl bg-zinc-100 dark:bg-black/40 border border-zinc-200 dark:border-white/5 text-xs text-zinc-600 dark:text-zinc-400" id="auth-quick-hint">
            <span className="font-bold text-zinc-800 dark:text-zinc-200">💡 Quick Sandbox Login:</span>
            <div className="grid grid-cols-2 gap-2 mt-1.5 font-mono text-[11px]">
              <div>
                <p className="text-indigo-600 dark:text-indigo-300 font-bold">Admin Acc:</p>
                <p className="text-zinc-800 dark:text-zinc-300">admin@omniconvert.com</p>
                <p className="text-zinc-500">pass: admin123</p>
              </div>
              <div>
                <p className="text-emerald-600 dark:text-emerald-400 font-bold">Regular Member:</p>
                <p className="text-zinc-800 dark:text-zinc-300">user@omniconvert.com</p>
                <p className="text-zinc-500">pass: user123</p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4" id="auth-form">
          {isSignUp && (
            <div>
              <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wider font-mono">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
                  <UserIcon className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 glass-input rounded-xl text-sm placeholder-zinc-500 focus:outline-none transition-all"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wider font-mono">Email address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 glass-input rounded-xl text-sm placeholder-zinc-500 focus:outline-none transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wider font-mono">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 glass-input rounded-xl text-sm placeholder-zinc-500 focus:outline-none transition-all"
                required
              />
            </div>
          </div>

          {isSignUp && localStorage.getItem('omni_pending_referrer') && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2.5 font-medium animate-pulse" id="auth-referral-badge">
              <Sparkles className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>Referral link active! You will get <strong>+15 bonus credits</strong> instantly on sign up! 🎁</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2.5 px-4 btn-primary text-white font-bold text-sm rounded-xl transition-all cursor-pointer"
            id="auth-submit-btn"
          >
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-5 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-200 dark:border-white/5"></div>
          </div>
          <span className="relative px-3 bg-white dark:bg-zinc-900 text-xs text-zinc-500 dark:text-zinc-450 rounded-full border border-zinc-200 dark:border-white/5 py-0.5">or continue with</span>
        </div>

        {/* Social Buttons */}
        <div className="grid grid-cols-2 gap-3" id="auth-socials">
          <button
            onClick={() => handleSocialLogin('Google')}
            className="flex items-center justify-center gap-2 py-2 px-4 glass hover:bg-zinc-500/10 dark:hover:bg-white/10 rounded-xl text-xs text-zinc-700 dark:text-zinc-300 font-bold transition-all cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            Google
          </button>
          <button
            onClick={() => handleSocialLogin('GitHub')}
            className="flex items-center justify-center gap-2 py-2 px-4 glass hover:bg-zinc-500/10 dark:hover:bg-white/10 rounded-xl text-xs text-zinc-700 dark:text-zinc-300 font-bold transition-all cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
            </svg>
            GitHub
          </button>
        </div>

        {/* Toggle Mode */}
        <p className="text-center text-xs text-zinc-500 mt-6" id="auth-toggle-tip">
          {isSignUp ? 'Already have an account? ' : "Don't have an account yet? "}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-extrabold focus:outline-none transition-colors"
          >
            {isSignUp ? 'Sign In' : 'Sign Up Free'}
          </button>
        </p>
      </div>
    </div>
  );
}
