'use client';

import { useState, useEffect } from 'react';
import { Sparkles, User, Lock, ArrowRight, ShieldCheck, Check, Gift } from 'lucide-react';
import { getCurrentProfile, registerAccount, loginAccount, SHOP_AVATARS, saveProfile } from '@/lib/profile';
import { sound } from '@/lib/audio';

const FIRST_VISIT_KEY = 'gameszone_onboarding_completed_v1';

export default function WelcomeOnboardingModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState<'signup' | 'login'>('signup');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('avatar_default');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Check if user has seen first-time onboarding
    if (typeof window !== 'undefined') {
      const seen = localStorage.getItem(FIRST_VISIT_KEY);
      if (!seen) {
        // Small delay for smooth entrance after page load
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 800);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  if (!isOpen) return null;

  const handleDismiss = () => {
    localStorage.setItem(FIRST_VISIT_KEY, 'true');
    setIsOpen(false);
  };

  const handleGuestPlay = () => {
    const current = getCurrentProfile();
    saveProfile({ ...current, isGuest: true });
    handleDismiss();
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
      const res = await registerAccount(username, password, selectedAvatar);
      if (res.success) {
        sound.playWin();
        setSuccess(res.message);
        setTimeout(() => {
          handleDismiss();
        }, 1200);
      } else {
        sound.playLose();
        setError(res.message);
      }
    } else {
      const res = await loginAccount(username, password);
      if (res.success) {
        sound.playWin();
        setSuccess(res.message);
        setTimeout(() => {
          handleDismiss();
        }, 1200);
      } else {
        sound.playLose();
        setError(res.message);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-lg animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg bg-[#121218] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden flex flex-col items-center">
        {/* Ambient Top Glow */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-indigo-600/25 rounded-full blur-[90px] pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-amber-500/15 rounded-full blur-[90px] pointer-events-none" />

        {/* Welcome Bonus Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold mb-4 shadow-lg animate-pulse">
          <Gift className="w-4 h-4 text-amber-400" />
          <span>New Player Gift: +200 Free Reward Coins!</span>
        </div>

        {/* Brand Icon & Heading */}
        <div className="flex flex-col items-center text-center gap-1.5 mb-6 z-10">
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Welcome to Games<span className="text-indigo-400">Zone</span>
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-sm">
            Create your player profile to unlock 20+ instant browser games, earn reward coins, and play multiplayer with friends!
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 rounded-2xl bg-white/5 border border-white/10 w-full mb-6 z-10">
          <button
            onClick={() => { setTab('signup'); setError(''); setSuccess(''); }}
            className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              tab === 'signup'
                ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Create Account (+200 🪙)
          </button>
          <button
            onClick={() => { setTab('login'); setError(''); setSuccess(''); }}
            className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              tab === 'login'
                ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Log In
          </button>
        </div>

        {/* Error / Success Feedback */}
        {error && (
          <div className="w-full mb-4 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold text-center">
            {error}
          </div>
        )}
        {success && (
          <div className="w-full mb-4 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold text-center flex items-center justify-center gap-2">
            <Check className="w-4 h-4" /> {success}
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4 z-10">
          {tab === 'signup' && (
            <div>
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                Choose Your Avatar:
              </label>
              <div className="grid grid-cols-6 gap-2">
                {SHOP_AVATARS.slice(0, 6).map((av) => (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => setSelectedAvatar(av.id)}
                    className={`h-12 rounded-2xl border flex items-center justify-center text-2xl transition-all cursor-pointer ${
                      selectedAvatar === av.id
                        ? 'border-indigo-400 bg-indigo-500/25 scale-105 shadow-md shadow-indigo-500/30 ring-2 ring-indigo-400'
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
              Player Username
            </label>
            <div className="relative flex items-center">
              <User className="absolute left-3.5 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="e.g. PixelWarrior"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
              Password / Secret PIN
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
            className="w-full h-12 mt-2 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-white text-xs font-black tracking-wide shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-98"
          >
            {tab === 'signup' ? (
              <>
                <Sparkles className="w-4 h-4" /> Claim Profile & Start Playing (+200 🪙)
              </>
            ) : (
              <>
                Log In to Account <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Guest Play & Skip */}
        <div className="w-full mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-zinc-400 z-10">
          <span>Just want to play a quick game?</span>
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
