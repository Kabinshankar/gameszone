'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { User, Trophy, Flame, Coins, Zap, ShieldCheck, ShoppingBag, Edit3, Check, LogIn } from 'lucide-react';
import Container from '@/components/Container';
import AuthModal from '@/components/AuthModal';
import {
  getCurrentProfile,
  saveProfile,
  SHOP_AVATARS,
  SHOP_BANNERS,
  SHOP_FRAMES,
  SHOP_TITLES,
  equipItem,
  UserProfile,
  DAILY_REWARDS,
  canClaimDailyReward,
  claimDailyReward,
} from '@/lib/profile';
import { sound } from '@/lib/audio';

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile>(getCurrentProfile());
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    const handleUpdate = (e: any) => setProfile(e.detail || getCurrentProfile());
    window.addEventListener('gameszone_profile_updated', handleUpdate);
    return () => window.removeEventListener('gameszone_profile_updated', handleUpdate);
  }, []);

  const handleSaveName = () => {
    if (newName.trim()) {
      const updated = { ...profile, username: newName.trim() };
      saveProfile(updated);
      setIsEditingName(false);
    }
  };

  const currentAvatar = SHOP_AVATARS.find((a) => a.id === profile.avatar) || SHOP_AVATARS[0];
  const currentBanner = SHOP_BANNERS.find((b) => b.id === profile.banner) || SHOP_BANNERS[0];
  const currentFrame = SHOP_FRAMES.find((f) => f.id === profile.frame) || SHOP_FRAMES[0];
  const currentTitle = SHOP_TITLES.find((t) => t.id === profile.title) || SHOP_TITLES[0];

  const winRate = profile.totalGames > 0 ? Math.round((profile.wins / profile.totalGames) * 100) : 0;
  const nextLevelXP = Math.pow(profile.level, 2) * 100;
  const currentLevelBaseXP = Math.pow(profile.level - 1, 2) * 100;
  const xpInCurrentLevel = Math.max(0, profile.xp - currentLevelBaseXP);
  const xpNeededForLevel = Math.max(100, nextLevelXP - currentLevelBaseXP);
  const xpPercent = Math.min(100, Math.round((xpInCurrentLevel / xpNeededForLevel) * 100));

  return (
    <Container className="py-12 sm:py-16 flex flex-col gap-8">
      {/* Auth Modal Trigger */}
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />

      {/* Main Profile Header Card with Equipped Banner */}
      <div className="relative w-full rounded-3xl border border-white/10 bg-[#121218] overflow-hidden shadow-2xl">
        {/* Banner Artwork */}
        <div className={`w-full h-36 sm:h-48 bg-gradient-to-r ${currentBanner.gradient} relative border-b border-white/10 flex items-center justify-center`}>
          <span className="text-xs font-bold text-white/40 tracking-widest uppercase">
            {currentBanner.name}
          </span>
        </div>

        {/* Profile Details Container */}
        <div className="px-6 sm:px-8 pb-8 pt-4 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 -mt-16 sm:-mt-20">
          {/* Avatar with Glow Frame */}
          <div className="flex items-end gap-5 z-10">
            <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-zinc-950 border-3 ${currentFrame.borderClass} ${currentFrame.glowClass} flex items-center justify-center text-5xl shadow-2xl shrink-0`}>
              {currentAvatar.icon}
            </div>

            <div className="flex flex-col mb-1">
              {/* Username + Title */}
              <div className="flex items-center gap-2">
                {isEditingName ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder={profile.username}
                      className="px-3 py-1 bg-zinc-800 border border-indigo-500 rounded-xl text-white text-base font-bold focus:outline-none"
                    />
                    <button
                      onClick={handleSaveName}
                      className="p-2 rounded-xl bg-indigo-600 text-white cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
                    {profile.username}
                    <button
                      onClick={() => { setNewName(profile.username); setIsEditingName(true); }}
                      className="text-zinc-500 hover:text-zinc-300 p-1 transition-colors cursor-pointer"
                      title="Edit Username"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </h1>
                )}
              </div>

              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs font-bold ${currentTitle.color}`}>
                  "{currentTitle.name}"
                </span>
                <span className="text-[10px] bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 px-2 py-0.5 rounded-full font-bold">
                  Level {profile.level}
                </span>
                {profile.isGuest && (
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                    Guest Account
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {profile.isGuest ? (
              <button
                onClick={() => setAuthOpen(true)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 cursor-pointer"
              >
                <LogIn className="w-4 h-4" /> Save Account / Sign Up
              </button>
            ) : (
              <button
                onClick={() => setAuthOpen(true)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <User className="w-4 h-4 text-indigo-400" /> Switch Account
              </button>
            )}

            <Link
              href="/shop"
              className="px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" /> Shop
            </Link>
          </div>
        </div>

        {/* Level XP Progress Bar */}
        <div className="px-6 sm:px-8 pb-6 border-t border-white/5 pt-4">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
            <span className="font-bold flex items-center gap-1.5 text-indigo-400">
              <Zap className="w-4 h-4" /> Level {profile.level} Progression
            </span>
            <span className="font-mono text-zinc-300">
              {profile.xp} XP ({xpPercent}% to Level {profile.level + 1})
            </span>
          </div>
          <div className="w-full h-3 bg-zinc-900 rounded-full overflow-hidden border border-white/5">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${xpPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#121218] border border-white/10 flex flex-col gap-1 shadow-md">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
            <Coins className="w-4 h-4" /> Reward Coins
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-300 font-mono">
            {profile.coins} 🪙
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#121218] border border-white/10 flex flex-col gap-1 shadow-md">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
            <Trophy className="w-4 h-4" /> Total Wins
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">
            {profile.wins}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#121218] border border-white/10 flex flex-col gap-1 shadow-md">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold">
            <Flame className="w-4 h-4" /> Current Streak
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">
            {profile.winStreak} 🔥
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#121218] border border-white/10 flex flex-col gap-1 shadow-md">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold">
            <ShieldCheck className="w-4 h-4" /> Win Rate
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">
            {winRate}%
          </div>
        </div>
      </div>

      {/* Daily Login Rewards Calendar Section */}
      <section className="p-6 sm:p-8 rounded-3xl bg-[#121218] border border-white/10 flex flex-col gap-5 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-xl text-amber-400 shadow-md">
              🎁
            </div>
            <div>
              <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                Daily Login Rewards
                <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  {profile.dailyStreak} Day Streak 🔥
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Log in every day to claim bonus reward coins and XP. Reach Day 7 for the VIP 500 🪙 drop!
              </p>
            </div>
          </div>

          {canClaimDailyReward(profile.lastDailyReward) ? (
            <button
              onClick={() => {
                const res = claimDailyReward();
                if (res.success) {
                  sound.playWin();
                }
              }}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black text-xs font-black tracking-wide shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer animate-bounce shrink-0"
            >
              <Coins className="w-4 h-4" /> Claim Daily Gift Now!
            </button>
          ) : (
            <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-zinc-400 text-xs font-bold flex items-center gap-2 shrink-0">
              <Check className="w-4 h-4 text-emerald-400" /> Claimed Today (Returns Tomorrow)
            </div>
          )}
        </div>

        {/* 7-Day Rewards Track */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 pt-2">
          {DAILY_REWARDS.map((r) => {
            const isCompleted = profile.dailyStreak >= r.day;
            const isCurrent = profile.dailyStreak === r.day;
            return (
              <div
                key={r.day}
                className={`p-3.5 rounded-2xl border flex flex-col items-center gap-1.5 transition-all relative ${
                  isCurrent
                    ? 'bg-amber-500/15 border-amber-400 shadow-md shadow-amber-500/20 scale-102 ring-1 ring-amber-400'
                    : isCompleted
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : 'bg-white/5 border-white/10 opacity-70'
                }`}
              >
                <span className="text-2xl">{r.icon}</span>
                <span className="text-xs font-extrabold text-white">{r.label}</span>
                <span className="text-[11px] font-mono font-bold text-amber-300">+{r.coins} 🪙</span>
                <span className="text-[9px] text-zinc-400 font-semibold">+{r.xp} XP</span>
                {isCompleted && (
                  <span className="absolute top-2 right-2 text-[10px] text-emerald-400 font-bold">
                    ✓
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Owned Inventory & Customizer */}
      <section className="p-6 sm:p-8 rounded-3xl bg-[#121218] border border-white/10 flex flex-col gap-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-white tracking-tight">
            My Inventory & Closet
          </h2>
          <Link
            href="/shop"
            className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
          >
            <ShoppingBag className="w-3.5 h-3.5" /> Buy More Items
          </Link>
        </div>

        {/* Owned Avatars */}
        <div className="flex flex-col gap-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Owned Avatars
          </h3>
          <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-8 gap-3">
            {SHOP_AVATARS.filter((a) => profile.inventory.includes(a.id)).map((av) => (
              <button
                key={av.id}
                onClick={() => { equipItem(av.id, 'avatar'); sound.playPop(); }}
                className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  profile.avatar === av.id
                    ? 'bg-indigo-600/30 border-indigo-500 shadow-lg'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <span className="text-3xl">{av.icon}</span>
                <span className="text-[10px] font-bold text-zinc-300 truncate max-w-[70px]">{av.name}</span>
                {profile.avatar === av.id && (
                  <span className="text-[8px] bg-indigo-500 text-white px-1.5 py-0.5 rounded-full font-bold">
                    Active
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Owned Banners */}
        <div className="flex flex-col gap-3 pt-4 border-t border-white/5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Owned Profile Banners
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {SHOP_BANNERS.filter((b) => profile.inventory.includes(b.id)).map((bn) => (
              <button
                key={bn.id}
                onClick={() => { equipItem(bn.id, 'banner'); sound.playPop(); }}
                className={`h-20 rounded-2xl bg-gradient-to-r ${bn.gradient} border flex items-center justify-between px-4 transition-all cursor-pointer ${
                  profile.banner === bn.id
                    ? 'border-indigo-400 shadow-lg shadow-indigo-500/20 ring-2 ring-indigo-400'
                    : 'border-white/10 hover:border-white/30'
                }`}
              >
                <span className="text-xs font-black text-white drop-shadow-md">{bn.name}</span>
                {profile.banner === bn.id ? (
                  <span className="text-[9px] bg-indigo-600 text-white font-bold px-2 py-1 rounded-lg">
                    Equipped
                  </span>
                ) : (
                  <span className="text-[9px] bg-black/40 text-zinc-300 font-bold px-2 py-1 rounded-lg">
                    Equip
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>
    </Container>
  );
}
