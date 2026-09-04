import Link from 'next/link';
import { Gamepad2 } from 'lucide-react';
import Container from './Container';

export default function Footer() {
  return (
    <footer className="w-full mt-24 sm:mt-32 pt-16 pb-10 border-t border-white/[0.08] bg-[#09090b] relative z-10">
      <Container>
        {/* Columns Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-[2fr_1fr_1fr] lg:grid-cols-[2fr_1fr_1fr_1fr] gap-10 lg:gap-12">
          {/* Brand Column */}
          <div className="max-w-[320px] flex flex-col gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-indigo-600/20 group-hover:scale-105 transition-transform">
                <Gamepad2 className="w-4 h-4" />
              </div>
              <span className="text-[17px] font-bold text-white tracking-tight">
                Games<span className="text-indigo-400">Zone</span>
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Play. Compete. Have Fun. Free instant browser gaming platform with no downloads or installs. 20+ curated games.
            </p>
          </div>

          {/* Games Column */}
          <div className="flex flex-col gap-2.5 text-xs sm:text-sm">
            <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-200 mb-1">Games</h4>
            <Link href="/games" className="text-zinc-400 hover:text-white transition-colors">All Games</Link>
            <Link href="/games/ludo" className="text-zinc-400 hover:text-white transition-colors">Ludo Master</Link>
            <Link href="/games/tetris" className="text-zinc-400 hover:text-white transition-colors">Tetris Classic</Link>
            <Link href="/games/solitaire" className="text-zinc-400 hover:text-white transition-colors">Solitaire</Link>
            <Link href="/games/snake" className="text-zinc-400 hover:text-white transition-colors">Snake Retro</Link>
            <Link href="/games/2048" className="text-zinc-400 hover:text-white transition-colors">2048 Puzzle</Link>
          </div>

          {/* Company Column */}
          <div className="flex flex-col gap-2.5 text-xs sm:text-sm">
            <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-200 mb-1">Company</h4>
            <Link href="/categories" className="text-zinc-400 hover:text-white transition-colors">Categories</Link>
            <Link href="/favorites" className="text-zinc-400 hover:text-white transition-colors">Favorites</Link>
            <Link href="/contact" className="text-zinc-400 hover:text-white transition-colors">Contact</Link>
          </div>

          {/* Legal Column */}
          <div className="flex flex-col gap-2.5 text-xs sm:text-sm">
            <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-200 mb-1">Legal</h4>
            <Link href="/privacy-policy" className="text-zinc-400 hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-zinc-400 hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-zinc-500 font-medium">
          <p>© 2026 GamesZone. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/admin" className="hover:text-zinc-400 transition-colors">Admin Portal</Link>
            <span>•</span>
            <p>Built for instant browser play.</p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
