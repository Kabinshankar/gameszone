'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, Coins, Sparkles, Check, Lock, ArrowRight, User } from 'lucide-react';
import Container from '@/components/Container';
import {
  getCurrentProfile,
  SHOP_AVATARS,
  SHOP_BANNERS,
  SHOP_FRAMES,
  SHOP_TITLES,
  buyShopItem,
  equipItem,
  UserProfile,
} from '@/lib/profile';
import { sound } from '@/lib/audio';

export default function ShopPage() {
  const [profile, setProfile] = useState<UserProfile>(getCurrentProfile());
  const [activeTab, setActiveTab] = useState<'all' | 'avatars' | 'banners' | 'frames' | 'titles'>('all');
  const [feedback, setFeedback] = useState<{ msg: string; isError: boolean } | null>(null);

  useEffect(() => {
    const handleUpdate = (e: any) => setProfile(e.detail || getCurrentProfile());
    window.addEventListener('gameszone_profile_updated', handleUpdate);
    return () => window.removeEventListener('gameszone_profile_updated', handleUpdate);
  }, []);

  const handleBuy = (itemId: string, itemType: 'avatar' | 'banner' | 'frame' | 'title') => {
    const res = buyShopItem(itemId, itemType);
    if (res.success) {
      sound.playWin();
      setFeedback({ msg: res.message, isError: false });
    } else {
      sound.playLose();
      setFeedback({ msg: res.message, isError: true });
    }
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleEquip = (itemId: string, itemType: 'avatar' | 'banner' | 'frame' | 'title') => {
    equipItem(itemId, itemType);
    sound.playPop();
    setFeedback({ msg: 'Equipped to profile!', isError: false });
    setTimeout(() => setFeedback(null), 2500);
  };

  const currentAvatar = SHOP_AVATARS.find((a) => a.id === profile.avatar) || SHOP_AVATARS[0];
  const currentBanner = SHOP_BANNERS.find((b) => b.id === profile.banner) || SHOP_BANNERS[0];
  const currentFrame = SHOP_FRAMES.find((f) => f.id === profile.frame) || SHOP_FRAMES[0];
  const currentTitle = SHOP_TITLES.find((t) => t.id === profile.title) || SHOP_TITLES[0];

  return (
    <Container className="py-12 sm:py-16 flex flex-col gap-10">
      {/* Header with Coin Balance & Live Profile Preview */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 p-6 sm:p-8 rounded-3xl bg-[#121218] border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-amber-500/10 blur-[90px] pointer-events-none rounded-full" />

        <div className="flex flex-col gap-2 z-10">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Customization Shop
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl">
            Win games to earn reward coins and unlock exclusive animated avatars, glowing profile frames, and badges!
          </p>
        </div>

        {/* Live Profile Card & Coin Counter */}
        <div className="flex items-center gap-4 z-10 w-full lg:w-auto justify-between sm:justify-start">
          {/* Active Balance */}
          <div className="px-5 py-3 rounded-2xl bg-amber-500/15 border-2 border-amber-500/40 flex items-center gap-2.5 shadow-lg">
            <Coins className="w-6 h-6 text-amber-400 animate-pulse" />
            <div className="flex flex-col">
              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Your Balance</span>
              <span className="text-xl font-mono font-black text-amber-300">{profile.coins} 🪙</span>
            </div>
          </div>

          {/* Quick Profile Link */}
          <Link
            href="/profile"
            className="px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center gap-2 text-xs font-bold text-zinc-300 hover:text-white transition-colors"
          >
            <User className="w-4 h-4 text-indigo-400" /> My Profile
          </Link>
        </div>
      </div>

      {/* Live Preview Card */}
      <div className="p-6 rounded-3xl bg-[#14141c] border border-white/10 flex flex-col gap-3">
        <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
          Currently Equipped Preview:
        </span>
        <div className={`w-full p-4 sm:p-6 rounded-2xl bg-gradient-to-r ${currentBanner.gradient} border border-white/10 flex items-center justify-between shadow-xl`}>
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-2xl bg-zinc-900/80 border-2 ${currentFrame.borderClass} ${currentFrame.glowClass} flex items-center justify-center text-3xl shadow-xl`}>
              {currentAvatar.icon}
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black text-white">{profile.username}</span>
              <span className={`text-xs font-bold ${currentTitle.color}`}>{currentTitle.name} • Level {profile.level}</span>
            </div>
          </div>
          <Link href="/profile" className="text-xs font-bold text-white bg-black/40 hover:bg-black/60 px-4 py-2 rounded-xl border border-white/20 transition-colors">
            Customize
          </Link>
        </div>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div className={`p-4 rounded-2xl border text-xs font-bold text-center flex items-center justify-center gap-2 animate-in fade-in duration-150 ${
          feedback.isError ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
        }`}>
          {feedback.isError ? '⚠️' : <Check className="w-4 h-4" />} {feedback.msg}
        </div>
      )}

      {/* Tab Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/10">
        {[
          { id: 'all', label: 'All Items' },
          { id: 'avatars', label: 'Avatars' },
          { id: 'banners', label: 'Profile Banners' },
          { id: 'frames', label: 'Glow Frames' },
          { id: 'titles', label: 'Badges & Titles' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-extrabold'
                : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. AVATARS SECTION */}
      {(activeTab === 'all' || activeTab === 'avatars') && (
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Player Avatars</h2>
            <span className="text-xs text-zinc-500">{SHOP_AVATARS.length} items</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {SHOP_AVATARS.map((item) => {
              const isOwned = profile.inventory.includes(item.id);
              const isEquipped = profile.avatar === item.id;

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border flex flex-col items-center text-center gap-3 transition-all ${
                    isEquipped
                      ? 'bg-indigo-600/15 border-indigo-500 shadow-lg shadow-indigo-500/10'
                      : 'bg-[#14141c] border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl shadow-inner">
                    {item.icon}
                  </div>
                  <div className="flex flex-col items-center min-w-0">
                    <span className="text-xs font-bold text-white truncate max-w-[120px]">{item.name}</span>
                    <span className="text-[10px] text-zinc-500 line-clamp-1">{item.rarity}</span>
                  </div>

                  {isEquipped ? (
                    <span className="w-full py-1.5 rounded-lg bg-indigo-600 text-white text-[10px] font-bold">
                      Equipped
                    </span>
                  ) : isOwned ? (
                    <button
                      onClick={() => handleEquip(item.id, 'avatar')}
                      className="w-full py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-zinc-200 text-[10px] font-bold cursor-pointer transition-colors"
                    >
                      Equip
                    </button>
                  ) : (
                    <button
                      onClick={() => handleBuy(item.id, 'avatar')}
                      className="w-full py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                    >
                      <span>{item.price}</span> 🪙
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 2. PROFILE BANNERS SECTION */}
      {(activeTab === 'all' || activeTab === 'banners') && (
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Profile Banners</h2>
            <span className="text-xs text-zinc-500">{SHOP_BANNERS.length} items</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SHOP_BANNERS.map((item) => {
              const isOwned = profile.inventory.includes(item.id);
              const isEquipped = profile.banner === item.id;

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border flex flex-col gap-3 transition-all ${
                    isEquipped
                      ? 'bg-indigo-600/15 border-indigo-500 shadow-lg shadow-indigo-500/10'
                      : 'bg-[#14141c] border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className={`w-full h-16 rounded-xl bg-gradient-to-r ${item.gradient} border border-white/10 shadow-inner flex items-center justify-center`}>
                    <Sparkles className="w-4 h-4 text-white/40" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white">{item.name}</h4>
                      <p className="text-[10px] text-zinc-400">{item.description}</p>
                    </div>
                  </div>

                  {isEquipped ? (
                    <span className="w-full py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold text-center">
                      Equipped
                    </span>
                  ) : isOwned ? (
                    <button
                      onClick={() => handleEquip(item.id, 'banner')}
                      className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/20 text-zinc-200 text-xs font-bold cursor-pointer transition-colors"
                    >
                      Equip Banner
                    </button>
                  ) : (
                    <button
                      onClick={() => handleBuy(item.id, 'banner')}
                      className="w-full py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <span>Unlock for {item.price}</span> 🪙
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 3. GLOW FRAMES SECTION */}
      {(activeTab === 'all' || activeTab === 'frames') && (
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Avatar Glow Frames</h2>
            <span className="text-xs text-zinc-500">{SHOP_FRAMES.length} items</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SHOP_FRAMES.map((item) => {
              const isOwned = profile.inventory.includes(item.id);
              const isEquipped = profile.frame === item.id;

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border flex flex-col items-center text-center gap-3 transition-all ${
                    isEquipped
                      ? 'bg-indigo-600/15 border-indigo-500 shadow-lg'
                      : 'bg-[#14141c] border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className={`w-14 h-14 rounded-2xl bg-zinc-900 border-2 ${item.borderClass} ${item.glowClass} flex items-center justify-center text-2xl`}>
                    🎮
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{item.name}</h4>
                    <p className="text-[10px] text-zinc-400">{item.description}</p>
                  </div>

                  {isEquipped ? (
                    <span className="w-full py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold">
                      Equipped
                    </span>
                  ) : isOwned ? (
                    <button
                      onClick={() => handleEquip(item.id, 'frame')}
                      className="w-full py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-zinc-200 text-xs font-bold cursor-pointer transition-colors"
                    >
                      Equip Frame
                    </button>
                  ) : (
                    <button
                      onClick={() => handleBuy(item.id, 'frame')}
                      className="w-full py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                    >
                      <span>{item.price}</span> 🪙
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 4. BADGES & TITLES SECTION */}
      {(activeTab === 'all' || activeTab === 'titles') && (
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Player Badges & Titles</h2>
            <span className="text-xs text-zinc-500">{SHOP_TITLES.length} items</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SHOP_TITLES.map((item) => {
              const isOwned = profile.inventory.includes(item.id);
              const isEquipped = profile.title === item.id;

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border flex items-center justify-between gap-4 transition-all ${
                    isEquipped
                      ? 'bg-indigo-600/15 border-indigo-500 shadow-lg'
                      : 'bg-[#14141c] border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className={`text-sm font-extrabold ${item.color}`}>"{item.name}"</span>
                    <span className="text-[10px] text-zinc-400">{item.description}</span>
                  </div>

                  {isEquipped ? (
                    <span className="px-3 py-1 rounded-lg bg-indigo-600 text-white text-xs font-bold shrink-0">
                      Equipped
                    </span>
                  ) : isOwned ? (
                    <button
                      onClick={() => handleEquip(item.id, 'title')}
                      className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-zinc-200 text-xs font-bold shrink-0 cursor-pointer"
                    >
                      Equip
                    </button>
                  ) : (
                    <button
                      onClick={() => handleBuy(item.id, 'title')}
                      className="px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      <span>{item.price}</span> 🪙
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </Container>
  );
}
