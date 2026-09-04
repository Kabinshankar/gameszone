import Link from 'next/link';
import { Gamepad2, Flame, Zap, ShieldCheck, ArrowRight } from 'lucide-react';
import Container from './Container';

export default function HeroSection() {
  return (
    <section className="relative pt-[40px] pb-[48px] md:pt-[56px] md:pb-[56px] lg:pt-[72px] lg:pb-[72px] border-b border-[rgba(255,255,255,0.06)] bg-gradient-to-b from-[#09090b] via-[#111113] to-[#09090b]">
      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-indigo-600/10 blur-[100px] pointer-events-none rounded-full" />

      <Container className="relative z-10 flex flex-col items-center text-center">
        {/* Eyebrow badge */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-[11px] font-bold tracking-[0.2em] uppercase text-zinc-400 shadow-sm mb-6">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
          BROWSE • PLAY • HAVE FUN
        </div>

        {/* Heading: 64-72px desktop */}
        <h1 className="text-[36px] sm:text-[48px] md:text-[58px] lg:text-[68px] font-extrabold tracking-tight leading-[1.1] max-w-[900px] text-white">
          Play. Compete.{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-300">
            Have Fun.
          </span>
        </h1>

        {/* Description */}
        <p className="mt-5 text-sm sm:text-base md:text-lg text-zinc-400 leading-relaxed max-w-[680px]">
          15 free browser games — arcade classics, puzzles, and board challenges. No downloads, no sign-ups. Just play.
        </p>

        {/* Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-5">
          <Link
            href="/games"
            className="h-12 px-8 rounded-xl bg-gradient-to-b from-indigo-500 via-indigo-600 to-indigo-700 hover:from-indigo-400 hover:to-indigo-600 text-white text-sm font-bold tracking-wide shadow-xl shadow-indigo-600/35 border-t border-indigo-300/40 inline-flex items-center gap-2.5 hover:-translate-y-0.5 active:scale-95 transition-all"
          >
            <Gamepad2 className="w-4.5 h-4.5" /> Explore Games <ArrowRight className="w-4 h-4 ml-0.5" />
          </Link>
          <Link
            href="/#popular"
            className="h-12 px-8 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-200 hover:text-white text-sm font-bold tracking-wide shadow-md border border-white/10 hover:border-white/20 inline-flex items-center gap-2.5 hover:-translate-y-0.5 active:scale-95 transition-all"
          >
            <Flame className="w-4.5 h-4.5 text-indigo-400" /> Popular Games
          </Link>
        </div>

        {/* Trust indicators */}
        <div className="mt-10 pt-6 flex flex-wrap items-center justify-center gap-8 sm:gap-12 text-xs text-zinc-400 font-medium tracking-wide border-t border-white/[0.06] w-full max-w-xl">
          <span className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-indigo-400" /> Instant Play
          </span>
          <span className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Free to Play
          </span>
          <span className="flex items-center gap-2">
            <Gamepad2 className="w-4 h-4 text-cyan-400" /> Saves Locally
          </span>
        </div>
      </Container>
    </section>
  );
}
