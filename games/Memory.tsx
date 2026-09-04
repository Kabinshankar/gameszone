'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { RotateCcw, Trophy, Clock, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { formatTime } from '@/lib/utils';
import { getStats, saveStats } from '@/lib/storage';
import { sound } from '@/lib/audio';

const THEMES = {
  emojis: ['🍎', '🍌', '🍒', '🍕', '🚀', '🎸', '⚽', '🎮', '🦄', '💎', '🔥', '👑'],
  animals: ['🐶', '🐱', '🦊', '🐼', '🦁', '🐯', '🐵', '🐸', '🐙', '🦉', '🦋', '🐬'],
  gaming: ['👾', '🕹️', '⚔️', '🛡️', '👑', '💎', '🚀', '💣', '🎲', '🎯', '🏆', '🧩'],
};

type ThemeKey = keyof typeof THEMES;

interface Card {
  id: number;
  icon: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export default function Memory() {
  const [theme, setTheme] = useState<ThemeKey>('gaming');
  const [gridSize, setGridSize] = useState<number>(12); // 12, 16, 20
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [isLocked, setIsLocked] = useState(false); // Guard against rapid multi-clicking
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isWin, setIsWin] = useState(false);
  const [bestMoves, setBestMoves] = useState<number | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startNewGame = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    const iconList = THEMES[theme].slice(0, gridSize / 2);
    const duplicated = [...iconList, ...iconList];
    const shuffled = duplicated
      .sort(() => Math.random() - 0.5)
      .map((icon, idx) => ({
        id: idx,
        icon,
        isFlipped: false,
        isMatched: false,
      }));

    setCards(shuffled);
    setFlippedCards([]);
    setIsLocked(false);
    setMoves(0);
    setMatches(0);
    setTimer(0);
    setIsPlaying(false);
    setIsWin(false);
  }, [theme, gridSize]);

  useEffect(() => {
    const stats = getStats('memory');
    if (stats.highScore) setBestMoves(stats.highScore);
    startNewGame();
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [theme, gridSize, startNewGame]);

  // Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && !isWin) {
      interval = setInterval(() => setTimer((t) => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, isWin]);

  const handleCardClick = (id: number) => {
    if (isLocked) return;
    const clickedCard = cards.find((c) => c.id === id);
    if (!clickedCard || clickedCard.isFlipped || clickedCard.isMatched) return;

    if (!isPlaying) setIsPlaying(true);
    if (soundEnabled) sound.playPop();

    const newCards = cards.map((c) => (c.id === id ? { ...c, isFlipped: true } : c));
    setCards(newCards);

    const newFlipped = [...flippedCards, id];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setIsLocked(true);
      setMoves((m) => m + 1);
      const [firstId, secondId] = newFlipped;
      const firstCard = cards.find((c) => c.id === firstId);

      if (firstCard && firstCard.icon === clickedCard.icon) {
        // Match
        if (soundEnabled) sound.playScore();
        setCards((prev) =>
          prev.map((c) => (c.id === firstId || c.id === id ? { ...c, isMatched: true } : c))
        );
        setFlippedCards([]);
        setIsLocked(false);
        setMatches((m) => {
          const nextMatches = m + 1;
          if (nextMatches === gridSize / 2) {
            handleWin(moves + 1);
          }
          return nextMatches;
        });
      } else {
        // Mismatch
        timeoutRef.current = setTimeout(() => {
          if (soundEnabled) sound.playBounce();
          setCards((prev) =>
            prev.map((c) => (c.id === firstId || c.id === id ? { ...c, isFlipped: false } : c))
          );
          setFlippedCards([]);
          setIsLocked(false);
        }, 800);
      }
    }
  };

  const handleWin = (finalMoves: number) => {
    setIsWin(true);
    setIsPlaying(false);
    if (soundEnabled) sound.playWin();

    if (!bestMoves || finalMoves < bestMoves) {
      setBestMoves(finalMoves);
      saveStats('memory', { highScore: finalMoves });
    }
  };

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-lg mx-auto select-none">
      
      {/* Options Bar */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 bg-white/[0.04] border border-white/10 p-3 rounded-2xl backdrop-blur-sm shadow-md">
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value as ThemeKey)}
          className="bg-black/50 border border-white/10 text-xs font-semibold text-gray-200 rounded-xl px-3 py-2 focus:outline-none"
        >
          <option value="gaming">Gaming Theme</option>
          <option value="emojis">Food Theme</option>
          <option value="animals">Animals Theme</option>
        </select>

        <select
          value={gridSize}
          onChange={(e) => setGridSize(Number(e.target.value))}
          className="bg-black/50 border border-white/10 text-xs font-semibold text-gray-200 rounded-xl px-3 py-2 focus:outline-none"
        >
          <option value={12}>12 Cards (6 Pairs)</option>
          <option value={16}>16 Cards (8 Pairs)</option>
          <option value={20}>20 Cards (10 Pairs)</option>
        </select>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const next = !soundEnabled;
              setSoundEnabled(next);
              sound.setEnabled(next);
            }}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 transition-colors"
            title="Toggle Sound"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-gray-500" />}
          </button>

          <button
            onClick={startNewGame}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-colors"
            title="Restart Game"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-3 w-full">
        <div className="bg-white/[0.04] border border-white/10 p-3 rounded-2xl flex flex-col items-center">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Moves</span>
          <span className="text-xl font-black text-pink-400 font-mono">{moves}</span>
        </div>
        <div className="bg-white/[0.04] border border-white/10 p-3 rounded-2xl flex flex-col items-center">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3 h-3 text-cyan-400" /> Time
          </span>
          <span className="text-xl font-black text-white font-mono">{formatTime(timer)}</span>
        </div>
        <div className="bg-white/[0.04] border border-white/10 p-3 rounded-2xl flex flex-col items-center">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1">
            <Trophy className="w-3 h-3 text-amber-400" /> Best
          </span>
          <span className="text-xl font-black text-amber-400 font-mono">{bestMoves ? `${bestMoves} moves` : '-'}</span>
        </div>
      </div>

      {/* Card Grid */}
      <div className="relative w-full p-4 bg-[#111118] border border-white/10 rounded-3xl shadow-2xl">
        <div
          className={`grid gap-2.5 sm:gap-3 w-full ${
            gridSize === 12
              ? 'grid-cols-3 sm:grid-cols-4'
              : gridSize === 16
              ? 'grid-cols-4'
              : 'grid-cols-4 sm:grid-cols-5'
          }`}
        >
          {cards.map((card) => {
            const isFlipped = card.isFlipped || card.isMatched;
            return (
              <div
                key={card.id}
                className="aspect-square perspective-1000"
              >
                <button
                  onClick={() => handleCardClick(card.id)}
                  disabled={isFlipped || isLocked}
                  aria-label={`Card ${card.id + 1}`}
                  className={`relative w-full h-full rounded-2xl transition-transform duration-300 transform-style-3d cursor-pointer ${
                    isFlipped ? 'rotate-y-180' : 'hover:scale-[1.03] active:scale-95'
                  }`}
                >
                  {/* Card Back (Hidden state) */}
                  <div className="absolute inset-0 w-full h-full rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 flex items-center justify-center text-xl sm:text-2xl backface-hidden shadow-sm">
                    <span className="opacity-40">❓</span>
                  </div>

                  {/* Card Front (Revealed state) */}
                  <div
                    className={`absolute inset-0 w-full h-full rounded-2xl flex items-center justify-center text-3xl sm:text-4xl backface-hidden rotate-y-180 shadow-lg ${
                      card.isMatched
                        ? 'bg-emerald-950/60 border-2 border-emerald-500/50 text-emerald-300'
                        : 'bg-gradient-to-tr from-pink-600 to-purple-600 border-2 border-pink-400 text-white shadow-pink-500/30'
                    }`}
                  >
                    {card.icon}
                  </div>
                </button>
              </div>
            );
          })}
        </div>

        {/* Win Screen */}
        {isWin && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center gap-4 z-20 animate-in fade-in zoom-in-95 duration-200 p-6 text-center">
            <Sparkles className="w-12 h-12 text-pink-400 animate-bounce" />
            <h3 className="text-3xl font-black text-white">Grid Cleared!</h3>
            <p className="text-xs sm:text-sm text-gray-300">
              Completed in <span className="text-pink-400 font-bold">{moves} moves</span> and <span className="text-cyan-400 font-bold">{formatTime(timer)}</span>
            </p>
            <button
              onClick={startNewGame}
              className="px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg shadow-pink-500/30 hover:scale-105 active:scale-95 transition-all text-sm mt-1"
            >
              Play Again
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
