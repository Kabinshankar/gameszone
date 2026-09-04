'use client';

import { useState } from 'react';
import { X, Sparkles, User, Lock, ArrowRight, ShieldCheck, Check } from 'lucide-react';
import { getCurrentProfile, registerAccount, loginAccount, SHOP_AVATARS, saveProfile } from '@/lib/profile';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [tab, setTab] = useState<'login' | 'signup'>('signup');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('avatar_default');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    if (tab === 'signup') {
      if (username.length < 3) {
        setError('Username must be at least 3 characters.');
        return;
      }
      const res = registerAccount(username, password, selectedAvatar);
      if (res.success) {
        setSuccess(res.message);
        setTimeout(() => onClose(), 1200);
      } else {
        setError(res.message);
      }
    } else {
      const res = loginAccount(username, password);
      if (res.success) {
        setSuccess(res.message);
        setTimeout(() => onClose(), 1200);
      } else {
        setError(res.message);
      }
    }
  };

  const handleGuestPlay = () => {
    const current = getCurrentProfile();
    if (!current.isGuest) {
      saveProfile({ ...current, isGuest: true });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#121218] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-indigo-600/20 rounded-full blur-[80px] pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex flex-col items-center text-center gap-1.5 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 mb-2">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-extrabold text-white tracking-tight">
            {tab === 'signup' ? 'Create GamesZone Profile' : 'Welcome Back Gamer'}
          </h3>
          <p className="text-xs text-zinc-400 max-w-xs">
            {tab === 'signup'
              ? 'Save your win streaks, earn coins, and unlock custom avatars!'
              : 'Login to access your coins, inventory, and leaderboard stats.'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 rounded-xl bg-white/5 border border-white/5 mb-6">
          <button
            onClick={() => { setTab('signup'); setError(''); setSuccess(''); }}
            className={`py-2 rounded-lg text-xs font-bold transition-all ${
              tab === 'signup' ? 'bg-indigo-600 text-white shadow-md' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Sign Up (+200 🪙 Bonus)
          </button>
          <button
            onClick={() => { setTab('login'); setError(''); setSuccess(''); }}
            className={`py-2 rounded-lg text-xs font-bold transition-all ${
              tab === 'login' ? 'bg-indigo-600 text-white shadow-md' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Log In
          </button>
        </div>

        {/* Feedback Messages */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold text-center">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold text-center flex items-center justify-center gap-1.5">
            <Check className="w-4 h-4" /> {success}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {tab === 'signup' && (
            <div>
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                Choose Starter Avatar:
              </label>
              <div className="grid grid-cols-6 gap-2">
                {SHOP_AVATARS.slice(0, 6).map((av) => (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => setSelectedAvatar(av.id)}
                    className={`h-11 rounded-xl border flex items-center justify-center text-xl transition-all ${
                      selectedAvatar === av.id
                        ? 'border-indigo-500 bg-indigo-500/20 scale-105 shadow-md shadow-indigo-500/30'
                        : 'border-white/10 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    {av.icon}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
              Player Name
            </label>
            <div className="relative flex items-center">
              <User className="absolute left-3.5 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="e.g. ShadowRider"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
              Password / PIN
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 w-4 h-4 text-zinc-500" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full h-12 mt-2 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white text-xs font-bold tracking-wide shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            {tab === 'signup' ? 'Create Account' : 'Log In to Profile'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Guest fallback */}
        <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-zinc-400">
          <span>Want to play casually?</span>
          <button
            onClick={handleGuestPlay}
            className="font-bold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5" /> Continue as Guest
          </button>
        </div>
      </div>
    </div>
  );
}
