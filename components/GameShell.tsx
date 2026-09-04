'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Maximize2, Minimize2, Heart, HelpCircle, Info, Wifi, Coins } from 'lucide-react';
import { Game } from '@/lib/games';
import { isFavorite, toggleFavorite } from '@/lib/storage';
import AdBanner from './AdBanner';
import GameCard from './GameCard';
import MultiplayerModal from './MultiplayerModal';
import RewardModal from './RewardModal';
import { MultiplayerRoom } from '@/lib/multiplayer';

interface GameShellProps {
  game: Game;
  children: React.ReactNode;
  relatedGames?: Game[];
}

const MULTIPLAYER_GAMES = ['tic-tac-toe', 'connect-four', 'rock-paper-scissors', 'checkers', 'pong', 'ludo'];

export default function GameShell({ game, children, relatedGames }: GameShellProps) {
  const [fav, setFav] = useState(false);
  const [isFs, setIsFs] = useState(false);
  const [multiplayerOpen, setMultiplayerOpen] = useState(false);
  const [rewardOpen, setRewardOpen] = useState(false);
  const [, setActiveRoom] = useState<MultiplayerRoom | null>(null);

  useEffect(() => {
    setFav(isFavorite(game.slug));

    // Listen for custom trigger to award match rewards
    const handleTriggerReward = (e: any) => {
      setRewardOpen(true);
    };
    window.addEventListener('gameszone_trigger_reward', handleTriggerReward);
    return () => window.removeEventListener('gameszone_trigger_reward', handleTriggerReward);
  }, [game.slug]);

  const handleFav = () => setFav(toggleFavorite(game.slug));

  const toggleFullscreen = () => {
    const el = document.getElementById('game-arena');
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen().catch(() => {});
      setIsFs(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFs(false);
    }
  };

  const isMultiplayerSupported = MULTIPLAYER_GAMES.includes(game.slug) || game.players.includes('2');

  const diffColor = {
    Easy: 'text-emerald-400',
    Medium: 'text-amber-400',
    Hard: 'text-rose-400',
    Variable: 'text-indigo-400',
  }[game.difficulty];

  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-16 sm:pb-24 box-border flex flex-col gap-8">
      {/* Multiplayer Connection Modal */}
      <MultiplayerModal
        isOpen={multiplayerOpen}
        gameSlug={game.slug}
        gameName={game.name}
        onClose={() => setMultiplayerOpen(false)}
        onConnected={(room) => {
          setActiveRoom(room);
          window.dispatchEvent(new CustomEvent('gameszone_multiplayer_connected', { detail: room }));
        }}
      />

      {/* Match Reward Victory Modal */}
      <RewardModal
        isOpen={rewardOpen}
        isWin={true}
        onClose={() => setRewardOpen(false)}
      />

      {/* Game Header */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-[1fr_auto] items-center gap-4">
        <div>
          <Link
            href="/games"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Games
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            {game.name}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl">
            {game.description}
          </p>
        </div>

        <div className="flex items-center gap-2 sm:self-center flex-wrap">
          {/* Online Multiplayer Button */}
          {isMultiplayerSupported && (
            <button
              onClick={() => setMultiplayerOpen(true)}
              className="h-10 px-4 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-cyan-500/10 active:scale-95"
            >
              <Wifi className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span>Play Online (2P)</span>
            </button>
          )}

          {/* Claim Coins Demo Button */}
          <button
            onClick={() => setRewardOpen(true)}
            className="h-10 px-3.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            title="Claim Match Reward Coins"
          >
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span>Claim Rewards</span>
          </button>

          {/* Favorite */}
          <button
            onClick={handleFav}
            className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all cursor-pointer ${
              fav
                ? 'text-rose-400 border-rose-500/30 bg-rose-500/10'
                : 'text-zinc-400 hover:text-white border-white/10 bg-white/5 hover:bg-white/10'
            }`}
            aria-label={fav ? 'Remove favorite' : 'Add favorite'}
          >
            <Heart className={`w-4 h-4 ${fav ? 'fill-current' : ''}`} />
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="w-10 h-10 rounded-xl text-zinc-400 hover:text-white border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all cursor-pointer"
            aria-label="Fullscreen"
          >
            {isFs ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Game Section / Arena */}
      <section className="w-full grid grid-cols-1">
        <div
          id="game-arena"
          className="w-full rounded-[20px] border border-white/10 bg-[#16161a] p-4 sm:p-6 lg:p-8 box-border min-h-auto shadow-2xl relative flex items-center justify-center overflow-visible"
        >
          {children}
        </div>
      </section>

      {/* Recommendations Section */}
      {relatedGames && relatedGames.length > 0 && (
        <section className="w-full pt-6 border-t border-white/10">
          <h2 className="text-xl font-bold text-white tracking-tight mb-4">
            You May Also Like
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
            {relatedGames.map((relatedGame) => (
              <GameCard key={relatedGame.id} game={relatedGame} />
            ))}
          </div>
        </section>
      )}

      {/* Centered Advertisement Banner */}
      <div className="w-full max-w-[900px] mx-auto my-2">
        <AdBanner slot="3000000001" className="w-full" />
      </div>

      {/* Information Sections */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        <div className="p-5 sm:p-6 rounded-[16px] border border-white/10 bg-[#16161a] flex flex-col">
          <h3 className="text-sm sm:text-base font-bold text-white mb-2.5 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-indigo-400 shrink-0" /> How to Play
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
            {game.longDescription}
          </p>
        </div>

        <div className="p-5 sm:p-6 rounded-[16px] border border-white/10 bg-[#16161a] flex flex-col">
          <h3 className="text-sm sm:text-base font-bold text-white mb-2.5 flex items-center gap-2">
            <Info className="w-4 h-4 text-cyan-400 shrink-0" /> Game Info
          </h3>
          <ul className="text-xs sm:text-sm text-zinc-400 space-y-2">
            <li className="flex items-center justify-between">
              <span className="text-zinc-500">Controls:</span>
              <span className="text-zinc-200 font-semibold">{game.controls}</span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-zinc-500">Difficulty:</span>
              <span className={`font-semibold ${diffColor}`}>{game.difficulty}</span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-zinc-500">Players:</span>
              <span className="text-zinc-200 font-semibold">{game.players}</span>
            </li>
            <li className="text-zinc-500 text-xs pt-1 border-t border-white/5">
              Wins award <strong className="text-amber-300">50-100 Coins</strong> to spend in the Shop!
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
