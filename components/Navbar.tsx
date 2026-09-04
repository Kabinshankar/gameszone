'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Gamepad2, Search, Heart, LayoutGrid, Home, Menu, X, ShoppingBag, User, Coins } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import SoundToggle from './SoundToggle';
import { getCurrentProfile, SHOP_AVATARS, SHOP_FRAMES, UserProfile } from '@/lib/profile';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfile>(getCurrentProfile());
  const pathname = usePathname();

  useEffect(() => {
    const handleUpdate = (e: any) => setProfile(e.detail || getCurrentProfile());
    window.addEventListener('gameszone_profile_updated', handleUpdate);
    return () => window.removeEventListener('gameszone_profile_updated', handleUpdate);
  }, []);

  const links = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Games', href: '/games', icon: Gamepad2 },
    { name: 'Categories', href: '/categories', icon: LayoutGrid },
    { name: 'Shop', href: '/shop', icon: ShoppingBag, badge: 'NEW' },
    { name: 'Favorites', href: '/favorites', icon: Heart },
  ];

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  const currentAvatar = SHOP_AVATARS.find((a) => a.id === profile.avatar) || SHOP_AVATARS[0];
  const currentFrame = SHOP_FRAMES.find((f) => f.id === profile.frame) || SHOP_FRAMES[0];

  return (
    <header className="sticky top-0 z-[1000] w-full border-b border-white/[0.08] bg-[#09090b]/95 backdrop-blur-md">
      <nav className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 h-[64px] md:h-[70px] flex items-center justify-between box-border min-w-0">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-indigo-600/20 group-hover:scale-105 transition-transform">
            <Gamepad2 className="w-5 h-5" />
          </div>
          <span className="text-[17px] font-bold tracking-tight text-white">
            Games<span className="text-indigo-400">Zone</span>
          </span>
        </Link>

        {/* Desktop Nav Items */}
        <div className="hidden md:flex items-center gap-1.5 bg-white/[0.03] border border-white/[0.06] p-1 rounded-xl">
          {links.map((l) => {
            const Icon = l.icon;
            const active = isActive(l.href);
            return (
              <Link
                key={l.name}
                href={l.href}
                className={`h-[36px] px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all relative ${
                  active
                    ? 'text-white bg-indigo-600 shadow-sm shadow-indigo-600/30 font-bold'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.06]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {l.name}
                {l.badge && (
                  <span className="text-[9px] bg-amber-500 text-black font-black px-1.5 py-0.2 rounded-full">
                    {l.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Desktop Right Actions: Coin Balance & Profile Avatar */}
        <div className="hidden md:flex items-center gap-3">
          {/* Coin Balance Pill */}
          <Link
            href="/shop"
            className="h-[38px] px-3.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 flex items-center gap-2 text-xs font-mono font-bold transition-all shadow-sm shadow-amber-500/10"
            title="Reward Coins - Click to visit Shop"
          >
            <Coins className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>{profile.coins}</span>
          </Link>

          {/* Search Icon */}
          <Link
            href="/games"
            className="w-9 h-9 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.06] border border-transparent hover:border-white/10 flex items-center justify-center transition-all"
            aria-label="Search games"
          >
            <Search className="w-4 h-4" />
          </Link>

          <SoundToggle />
          <ThemeToggle />

          {/* Profile Button with Avatar & Level */}
          <Link
            href="/profile"
            className="h-[38px] pl-2 pr-3.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 flex items-center gap-2.5 transition-all"
          >
            <div className={`w-7 h-7 rounded-lg bg-zinc-900 border ${currentFrame.borderClass} flex items-center justify-center text-sm shadow-sm`}>
              {currentAvatar.icon}
            </div>
            <div className="flex flex-col text-left leading-tight">
              <span className="text-xs font-bold text-white max-w-[80px] truncate">{profile.username}</span>
              <span className="text-[9px] text-indigo-400 font-semibold">Lvl {profile.level}</span>
            </div>
          </Link>
        </div>

        {/* Mobile menu button & Coin pill */}
        <div className="flex items-center gap-2 md:hidden">
          <Link
            href="/shop"
            className="h-9 px-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-center gap-1.5 text-xs font-mono font-bold"
          >
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span>{profile.coins}</span>
          </Link>

          <Link
            href="/profile"
            className="w-9 h-9 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center text-lg"
          >
            {currentAvatar.icon}
          </Link>

          <SoundToggle />
          <ThemeToggle />

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-xl text-zinc-300 hover:text-white bg-white/5 border border-white/10 cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </nav>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-zinc-800 bg-[#0c0c12]/98 backdrop-blur-xl px-4 pt-3 pb-6 shadow-2xl">
          <div className="flex flex-col gap-1.5">
            {links.map((l) => {
              const Icon = l.icon;
              const active = isActive(l.href);
              return (
                <Link
                  key={l.name}
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className={`h-11 px-3.5 rounded-xl text-sm font-semibold flex items-center justify-between transition-colors ${
                    active ? 'bg-indigo-600 text-white font-bold shadow-md' : 'text-zinc-300 hover:bg-zinc-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    {l.name}
                  </div>
                  {l.badge && (
                    <span className="text-[10px] bg-amber-500 text-black font-black px-2 py-0.5 rounded-full">
                      {l.badge}
                    </span>
                  )}
                </Link>
              );
            })}

            <Link
              href="/profile"
              onClick={() => setMobileOpen(false)}
              className="h-11 px-3.5 rounded-xl text-sm font-semibold flex items-center gap-3 text-zinc-300 hover:bg-zinc-900"
            >
              <User className="w-4 h-4 text-indigo-400" />
              My Profile & Inventory
            </Link>

            <Link
              href="/shop"
              onClick={() => setMobileOpen(false)}
              className="mt-2 h-11 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
            >
              <ShoppingBag className="w-4 h-4" />
              Customization Shop (🪙 {profile.coins})
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
