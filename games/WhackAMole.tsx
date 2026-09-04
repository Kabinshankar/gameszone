'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { RotateCcw, Clock, Trophy, Play, Zap, Volume2, VolumeX } from 'lucide-react';
import { getStats, saveStats } from '@/lib/storage';
import { sound } from '@/lib/audio';

export default function WhackAMole() {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'over'>('start');
  const [activeMole, setActiveMole] = useState<number | null>(null);
  const [hitMole, setHitMole] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(1);
  const [timer, setTimer] = useState(30);
  const [highScore, setHighScore] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const moleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const stats = getStats('whack-a-mole');
    if (stats.highScore) setHighScore(stats.highScore);
    return () => {
      if (moleTimeoutRef.current) clearTimeout(moleTimeoutRef.current);
    };
  }, []);

  const spawnMole = useCallback((currentScore: number) => {
    if (moleTimeoutRef.current) clearTimeout(moleTimeoutRef.current);

    const randomHole = Math.floor(Math.random() * 9);
    setActiveMole(randomHole);

    // Speed increases as score grows
    const speed = Math.max(480, 950 - currentScore * 10);
    moleTimeoutRef.current = setTimeout(() => {
      setActiveMole(null);
      moleTimeoutRef.current = setTimeout(() => spawnMole(currentScore), 150);
    }, speed);
  }, []);

  const startGame = () => {
    setScore(0);
    setCombo(1);
    setTimer(30);
    setHitMole(null);
    setGameState('playing');
    spawnMole(0);
  };

  // Round Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameState === 'playing') {
      interval = setInterval(() => {
        setTimer((t) => {
          if (t <= 1) {
            if (moleTimeoutRef.current) clearTimeout(moleTimeoutRef.current);
            setGameState('over');
            if (soundEnabled) sound.playWin();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState, soundEnabled]);

  const handleWhack = useCallback((index: number) => {
    if (gameState !== 'playing') return;

    if (index === activeMole) {
      if (soundEnabled) sound.playScore();
      const addedPoints = 10 * combo;
      const nextScore = score + addedPoints;
      setScore(nextScore);
      setCombo((c) => Math.min(5, c + 1));
      setHitMole(index);
      setActiveMole(null);

      setTimeout(() => setHitMole(null), 300);

      if (nextScore > highScore) {
        setHighScore(nextScore);
        saveStats('whack-a-mole', { highScore: nextScore });
      }

      // Quick spawn next mole for fast-paced gameplay
      if (moleTimeoutRef.current) clearTimeout(moleTimeoutRef.current);
      moleTimeoutRef.current = setTimeout(() => spawnMole(nextScore), 180);
    } else {
      if (soundEnabled) sound.playBounce();
      setCombo(1); // Reset combo on miss
    }
  }, [gameState, activeMole, combo, score, highScore, soundEnabled, spawnMole]);

  // Keyboard navigation (Numpad 7-9, 4-6, 1-3 or QWE, ASD, ZXC)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const keyMap: Record<string, number> = {
        'Numpad7': 0, 'Numpad8': 1, 'Numpad9': 2,
        'Numpad4': 3, 'Numpad5': 4, 'Numpad6': 5,
        'Numpad1': 6, 'Numpad2': 7, 'Numpad3': 8,
        'KeyQ': 0, 'KeyW': 1, 'KeyE': 2,
        'KeyA': 3, 'KeyS': 4, 'KeyD': 5,
        'KeyZ': 6, 'KeyX': 7, 'KeyC': 8,
      };
      if (keyMap[e.code] !== undefined) {
        e.preventDefault();
        handleWhack(keyMap[e.code]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleWhack]);

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md mx-auto select-none">
      
      {/* Header Stats */}
      <div className="grid grid-cols-3 gap-2.5 w-full">
        <div className="bg-white/[0.04] border border-white/10 p-3 rounded-2xl flex flex-col items-center shadow-sm">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Score</span>
          <span className="text-xl font-black text-purple-400 font-mono">{score}</span>
        </div>
        <div className="bg-white/[0.04] border border-white/10 p-3 rounded-2xl flex flex-col items-center shadow-sm">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3 h-3 text-cyan-400" /> Time
          </span>
          <span className={`text-xl font-black font-mono ${timer <= 5 ? 'text-rose-400 animate-pulse' : 'text-white'}`}>
            {timer}s
          </span>
        </div>
        <div className="bg-white/[0.04] border border-white/10 p-3 rounded-2xl flex flex-col items-center shadow-sm">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-400" /> Combo
          </span>
          <span className="text-xl font-black text-amber-400 font-mono">{combo}x</span>
        </div>
      </div>

      {/* Grid Holes Arena */}
      <div className="relative w-full aspect-square bg-[#12121a] border-4 border-purple-900/60 rounded-3xl p-4 shadow-2xl overflow-hidden">
        <div className="grid grid-cols-3 grid-rows-3 gap-3.5 w-full h-full">
          {Array.from({ length: 9 }).map((_, idx) => {
            const isMoleUp = activeMole === idx;
            const wasHit = hitMole === idx;

            return (
              <button
                key={idx}
                onClick={() => handleWhack(idx)}
                aria-label={`Hole ${idx + 1}`}
                className={`relative rounded-2xl bg-gradient-to-b from-amber-950/60 to-stone-950/80 border-2 border-amber-900/50 shadow-inner flex items-center justify-center overflow-hidden cursor-pointer transition-transform active:scale-95 ${
                  wasHit ? 'ring-4 ring-amber-400/80' : ''
                }`}
              >
                {/* Hole bottom cavern */}
                <div className="absolute inset-x-3 bottom-2 h-4 bg-black/70 rounded-full blur-[1px]" />

                {/* Star burst when whacked */}
                {wasHit && (
                  <div className="absolute inset-0 flex items-center justify-center z-20 animate-out zoom-out fade-out duration-300">
                    <span className="text-2xl font-black text-amber-300 bg-black/60 px-2 py-0.5 rounded-lg border border-amber-400">
                      +{10 * combo}
                    </span>
                  </div>
                )}

                {/* Animated Mole */}
                <div
                  className={`text-5xl transform transition-all duration-150 select-none ${
                    isMoleUp ? 'translate-y-0 scale-110 opacity-100' : 'translate-y-16 opacity-0'
                  }`}
                >
                  🐹
                </div>
              </button>
            );
          })}
        </div>

        {/* Start Overlay */}
        {gameState === 'start' && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center gap-4 p-6 text-center z-20 animate-in fade-in duration-200">
            <span className="text-5xl animate-bounce">🔨</span>
            <h3 className="text-3xl font-black text-white">Whack-a-Mole</h3>
            <p className="text-xs sm:text-sm text-gray-300">Whack moles fast to build combo multiplier before the 30s timer runs out!</p>
            <button
              onClick={startGame}
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30 hover:scale-105 active:scale-95 transition-all text-sm mt-1"
            >
              <Play className="w-4 h-4 fill-white" /> Start Whacking
            </button>
          </div>
        )}

        {/* Over Overlay */}
        {gameState === 'over' && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center gap-4 p-6 text-center z-20 animate-in fade-in zoom-in-95 duration-200">
            <Trophy className="w-12 h-12 text-amber-400 animate-bounce" />
            <h3 className="text-3xl font-black text-white">Time's Up!</h3>
            <p className="text-xs sm:text-sm text-gray-300">Final Score: <span className="text-purple-400 font-bold text-base">{score}</span> points</p>
            <button
              onClick={startGame}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30 hover:scale-105 active:scale-95 transition-all text-sm mt-1"
            >
              <RotateCcw className="w-4 h-4" /> Play Again
            </button>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500 text-center">
        💡 Use keys <strong className="text-gray-400">QWE / ASD / ZXC</strong> or <strong className="text-gray-400">Numpad 1-9</strong> for rapid keyboard whacking
      </p>

    </div>
  );
}
