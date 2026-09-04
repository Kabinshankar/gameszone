'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Play, Users, Heart, Sparkles } from 'lucide-react';
import { Game } from '@/lib/games';
import { isFavorite, toggleFavorite } from '@/lib/storage';
import GameThumbnail from './GameThumbnail';

interface FeaturedGameBannerProps {
  game: Game;
}

export default function FeaturedGameBanner({ game }: FeaturedGameBannerProps) {
  const [fav, setFav] = useState(false);

  useEffect(() => {
    setFav(isFavorite(game.slug));
  }, [game.slug]);

  const handleFav = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFav(toggleFavorite(game.slug));
  };

  const diffColor = {
    Easy: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    Medium: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    Hard: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
    Variable: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
  }[game.difficulty];

  return (
    <div className="group relative w-full rounded-[20px] border border-white/10 bg-[#131319] hover:border-indigo-500/30 overflow-hidden grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] p-6 lg:p-8 gap-6 lg:gap-8 items-center shadow-2xl transition-all duration-200">
      {/* Ambient background glow */}
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-indigo-600/10 blur-[90px] pointer-events-none rounded-full" />

      {/* Thumbnail */}
      <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden bg-zinc-900 border border-white/10 shadow-lg">
        <GameThumbnail slug={game.slug} name={game.name} className="rounded-none border-0 group-hover:scale-103 transition-transform duration-300" />
        <Link
          href={`/games/${game.slug}`}
          className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10"
        >
          <span className="h-10 px-5 rounded-xl bg-indigo-600 text-white text-xs font-bold flex items-center gap-2 shadow-lg">
            <Play className="w-4 h-4 fill-white" /> Play Game
          </span>
        </Link>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-4 justify-center relative z-10">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-[11px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3 h-3" /> Featured Title
          </span>
          <span className={`px-2.5 py-1 rounded-full border text-[11px] font-bold ${diffColor}`}>
            {game.difficulty}
          </span>
        </div>

        <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">{game.name}</h3>

        <p className="text-sm text-zinc-300 leading-relaxed line-clamp-3">
          {game.longDescription || game.description}
        </p>

        <div className="flex items-center gap-6 text-xs text-zinc-400 font-medium pt-1">
          <span className="flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-400" /> {game.players} Player
          </span>
          <span className="text-zinc-500">•</span>
          <span>{game.controls}</span>
        </div>

        <div className="pt-2 flex items-center gap-3">
          <Link
            href={`/games/${game.slug}`}
            className="h-11 px-7 rounded-xl bg-gradient-to-b from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white text-xs font-bold tracking-wide inline-flex items-center gap-2.5 shadow-lg shadow-indigo-600/30 transition-all hover:-translate-y-0.5"
          >
            <Play className="w-4 h-4 fill-white" /> Play Now
          </Link>

          <button
            onClick={handleFav}
            aria-label={fav ? 'Remove from favorites' : 'Add to favorites'}
            className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-all cursor-pointer ${
              fav
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 shadow-sm'
                : 'bg-white/5 text-zinc-400 hover:text-white border-white/10 hover:bg-white/10'
            }`}
          >
            <Heart className={`w-4 h-4 ${fav ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
}
