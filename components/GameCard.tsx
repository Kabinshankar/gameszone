'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Play, Heart } from 'lucide-react';
import { Game } from '@/lib/games';
import { isFavorite, toggleFavorite } from '@/lib/storage';
import GameThumbnail from './GameThumbnail';

interface GameCardProps {
  game: Game;
  priority?: boolean;
}

export default function GameCard({ game }: GameCardProps) {
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
    Easy: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    Medium: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    Hard: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    Variable: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  }[game.difficulty];

  return (
    <div
      className="group relative w-full h-full rounded-[16px] border border-white/10 bg-[#14141a] hover:bg-[#181822] overflow-hidden flex flex-col justify-between box-border transition-all duration-200 hover:-translate-y-1 hover:border-indigo-500/40 hover:shadow-xl hover:shadow-indigo-500/10 shadow-md"
    >
      {/* 16:9 Image container (occupies ~50% of card) */}
      <div className="relative w-full aspect-[16/9] overflow-hidden bg-zinc-900 shrink-0">
        <GameThumbnail
          slug={game.slug}
          name={game.name}
          className="rounded-none border-0 group-hover:scale-103 transition-transform duration-300"
        />

        {/* Favorite Button (floating upper-right on artwork) */}
        <button
          onClick={handleFav}
          aria-label={fav ? `Remove ${game.name} from favorites` : `Add ${game.name} from favorites`}
          className={`absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-lg flex items-center justify-center border transition-all duration-150 backdrop-blur-md cursor-pointer ${
            fav
              ? 'bg-rose-500/30 text-rose-400 border-rose-500/50 scale-105'
              : 'bg-black/50 text-zinc-300 hover:text-white border-white/15 hover:bg-black/70'
          }`}
        >
          <Heart className={`w-4 h-4 transition-transform active:scale-125 ${fav ? 'fill-current' : ''}`} />
        </button>

        {/* Hover play overlay */}
        <Link
          href={`/games/${game.slug}`}
          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-[5]"
        >
          <span className="h-9 px-4 rounded-xl bg-indigo-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg">
            <Play className="w-3.5 h-3.5 fill-white" /> Play Now
          </span>
        </Link>
      </div>

      {/* Content wrapper with uniform vertical spacing */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          {/* Title: 18px font-bold, line-clamp-1 */}
          <Link href={`/games/${game.slug}`} className="block">
            <h3 className="text-[17px] font-bold text-zinc-100 leading-snug mb-1.5 line-clamp-1 group-hover:text-indigo-400 transition-colors">
              {game.name}
            </h3>
          </Link>

          {/* Description: clamped 2 lines with fixed height for perfect alignment */}
          <p className="text-[13px] text-zinc-400 leading-relaxed mb-3.5 line-clamp-2 min-h-[38px]">
            {game.description}
          </p>
        </div>

        <div>
          {/* Metadata row */}
          <div className="flex items-center justify-between gap-2 mb-3.5">
            <span className="text-[11px] font-semibold text-zinc-400 bg-white/5 px-2.5 py-0.5 rounded-md border border-white/5 uppercase tracking-wider">
              {game.category[0]}
            </span>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${diffColor}`}>
              {game.difficulty}
            </span>
          </div>

          {/* Play Button: 42px height, full width */}
          <Link
            href={`/games/${game.slug}`}
            className="w-full h-[42px] px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-600/20 active:scale-98"
          >
            <Play className="w-3.5 h-3.5 fill-white" /> Play Game
          </Link>
        </div>
      </div>
    </div>
  );
}
