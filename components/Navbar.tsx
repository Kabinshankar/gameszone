'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Gamepad2, Search, Heart, LayoutGrid, Home, Menu, X } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const links = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Games', href: '/games', icon: Gamepad2 },
    { name: 'Categories', href: '/categories', icon: LayoutGrid },
    { name: 'Favorites', href: '/favorites', icon: Heart },
  ];

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

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
                className={`h-[36px] px-3.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
                  active
                    ? 'text-white bg-indigo-600 shadow-sm shadow-indigo-600/30 font-bold'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.06]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {l.name}
              </Link>
            );
          })}
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/games"
            className="w-10 h-10 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.06] border border-transparent hover:border-white/10 flex items-center justify-center transition-all"
            aria-label="Search games"
          >
            <Search className="w-4 h-4" />
          </Link>
          <ThemeToggle />
          <Link
            href="/games"
            className="h-10 px-5 rounded-xl bg-gradient-to-b from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white text-xs font-bold tracking-wide shadow-md shadow-indigo-600/30 flex items-center justify-center transition-all hover:-translate-y-0.5"
          >
            Explore Games
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-xl text-zinc-300 hover:text-white bg-white/5 border border-white/10"
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
                  className={`h-11 px-3.5 rounded-xl text-sm font-semibold flex items-center gap-3 transition-colors ${
                    active ? 'bg-indigo-600 text-white font-bold shadow-md' : 'text-zinc-300 hover:bg-zinc-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {l.name}
                </Link>
              );
            })}
            <Link
              href="/games"
              onClick={() => setMobileOpen(false)}
              className="mt-3 h-11 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 text-white text-sm font-bold flex items-center justify-center shadow-lg shadow-indigo-600/30"
            >
              Explore Games
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
