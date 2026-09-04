'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Trophy, Volume2, VolumeX } from 'lucide-react';
import { getStats, saveStats } from '@/lib/storage';
import { sound } from '@/lib/audio';

type Position = { x: number; y: number };
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

const GRID_SIZE = 20;

export default function Snake() {
  const [snake, setSnake] = useState<Position[]>([
    { x: 10, y: 10 },
    { x: 10, y: 11 },
    { x: 10, y: 12 },
  ]);
  const [food, setFood] = useState<Position>({ x: 5, y: 5 });
  const [direction, setDirection] = useState<Direction>('UP');
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [speed, setSpeed] = useState(120);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Direction queue ref to prevent rapid double-tap self-collision bug
  const currentDirectionRef = useRef<Direction>('UP');
  const nextDirectionRef = useRef<Direction>('UP');
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const generateFoodPosition = (currentSnake: Position[]): Position => {
    const emptyCells: Position[] = [];
    for (let x = 0; x < GRID_SIZE; x++) {
      for (let y = 0; y < GRID_SIZE; y++) {
        if (!currentSnake.some((s) => s.x === x && s.y === y)) {
          emptyCells.push({ x, y });
        }
      }
    }
    if (emptyCells.length === 0) return { x: 0, y: 0 };
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
  };

  useEffect(() => {
    const stats = getStats('snake');
    if (stats.highScore) setHighScore(stats.highScore);
    setFood(generateFoodPosition(snake));
  }, []);

  const changeDirection = useCallback((newDir: Direction) => {
    const current = currentDirectionRef.current;
    if (
      (newDir === 'UP' && current !== 'DOWN') ||
      (newDir === 'DOWN' && current !== 'UP') ||
      (newDir === 'LEFT' && current !== 'RIGHT') ||
      (newDir === 'RIGHT' && current !== 'LEFT')
    ) {
      nextDirectionRef.current = newDir;
    }
  }, []);

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'KeyW'].includes(e.code)) {
        e.preventDefault();
        changeDirection('UP');
      } else if (['ArrowDown', 'KeyS'].includes(e.code)) {
        e.preventDefault();
        changeDirection('DOWN');
      } else if (['ArrowLeft', 'KeyA'].includes(e.code)) {
        e.preventDefault();
        changeDirection('LEFT');
      } else if (['ArrowRight', 'KeyD'].includes(e.code)) {
        e.preventDefault();
        changeDirection('RIGHT');
      } else if (e.code === 'Space') {
        e.preventDefault();
        setIsPaused((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [changeDirection]);

  // Touch Swipe Handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    if (Math.abs(dx) > 30 || Math.abs(dy) > 30) {
      if (Math.abs(dx) > Math.abs(dy)) {
        changeDirection(dx > 0 ? 'RIGHT' : 'LEFT');
      } else {
        changeDirection(dy > 0 ? 'DOWN' : 'UP');
      }
    }
  };

  // Main Loop
  useEffect(() => {
    if (isGameOver || isPaused) return;

    const interval = setInterval(() => {
      setSnake((prevSnake) => {
        // Apply queued direction
        const dir = nextDirectionRef.current;
        currentDirectionRef.current = dir;
        setDirection(dir);

        const head = { ...prevSnake[0] };

        switch (dir) {
          case 'UP': head.y -= 1; break;
          case 'DOWN': head.y += 1; break;
          case 'LEFT': head.x -= 1; break;
          case 'RIGHT': head.x += 1; break;
        }

        // Wall collision
        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
          handleGameOver();
          return prevSnake;
        }

        // Self collision
        if (prevSnake.some((segment) => segment.x === head.x && segment.y === head.y)) {
          handleGameOver();
          return prevSnake;
        }

        const newSnake = [head, ...prevSnake];

        // Eat food check
        if (head.x === food.x && head.y === food.y) {
          if (soundEnabled) sound.playScore();
          setScore((s) => {
            const next = s + 10;
            if (next > highScore) {
              setHighScore(next);
              saveStats('snake', { highScore: next });
            }
            return next;
          });
          if (speed > 55) setSpeed((sp) => sp - 2);
          setFood(generateFoodPosition(newSnake));
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    }, speed);

    return () => clearInterval(interval);
  }, [food, isGameOver, isPaused, speed, highScore, soundEnabled]);

  const handleGameOver = () => {
    if (soundEnabled) sound.playLose();
    setIsGameOver(true);
  };

  const restartGame = () => {
    const initialSnake = [
      { x: 10, y: 10 },
      { x: 10, y: 11 },
      { x: 10, y: 12 },
    ];
    setSnake(initialSnake);
    currentDirectionRef.current = 'UP';
    nextDirectionRef.current = 'UP';
    setDirection('UP');
    setIsGameOver(false);
    setIsPaused(false);
    setScore(0);
    setSpeed(120);
    setFood(generateFoodPosition(initialSnake));
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md mx-auto select-none">
      
      {/* Header & Stats */}
      <div className="flex items-center justify-between w-full bg-white/[0.04] border border-white/10 px-4 py-3 rounded-2xl backdrop-blur-sm shadow-md">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Score:</span>
          <span className="text-xl font-black text-emerald-400 font-mono">{score}</span>
        </div>
        <div className="flex items-center gap-1.5 text-amber-400 font-semibold text-xs bg-amber-400/10 border border-amber-400/20 px-2.5 py-1 rounded-full">
          <Trophy className="w-3.5 h-3.5" /> High: {highScore}
        </div>
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
            onClick={() => setIsPaused(!isPaused)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 transition-colors"
            title={isPaused ? 'Resume (Space)' : 'Pause (Space)'}
          >
            {isPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4" />}
          </button>
          <button
            onClick={restartGame}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 transition-colors"
            title="Restart"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Snake Canvas Grid with touch swipe listener */}
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative w-full aspect-square bg-[#0c0c14] border-2 border-emerald-500/40 rounded-3xl p-2.5 overflow-hidden shadow-2xl touch-none"
      >
        <div className="grid grid-cols-20 grid-rows-20 w-full h-full gap-[1px] bg-slate-950/60 rounded-2xl overflow-hidden border border-white/5">
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, idx) => {
            const x = idx % GRID_SIZE;
            const y = Math.floor(idx / GRID_SIZE);

            const isHead = snake[0].x === x && snake[0].y === y;
            const isBody = snake.slice(1).some((s) => s.x === x && s.y === y);
            const isFood = food.x === x && food.y === y;

            return (
              <div
                key={idx}
                className={`rounded-[2px] transition-all duration-75 ${
                  isHead
                    ? 'bg-emerald-400 shadow-lg shadow-emerald-400/80 scale-110 z-10 ring-1 ring-white'
                    : isBody
                    ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 rounded-[3px]'
                    : isFood
                    ? 'bg-rose-500 rounded-full shadow-lg shadow-rose-500/80 scale-90 animate-pulse'
                    : 'bg-white/[0.015]'
                }`}
              />
            );
          })}
        </div>

        {/* Overlay Screen (Game Over or Pause) */}
        {(isGameOver || isPaused) && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center gap-4 z-20 animate-in fade-in zoom-in-95 duration-200">
            <span className="text-4xl">{isGameOver ? '💥' : '⏸️'}</span>
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              {isGameOver ? 'Snake Crashed!' : 'Game Paused'}
            </h3>
            {isGameOver && (
              <p className="text-xs sm:text-sm text-gray-400">
                Final Score: <span className="text-emerald-400 font-bold text-base">{score}</span>
              </p>
            )}
            <button
              onClick={isGameOver ? restartGame : () => setIsPaused(false)}
              className="px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all text-sm mt-1"
            >
              {isGameOver ? 'Play Again' : 'Resume'}
            </button>
          </div>
        )}
      </div>

      {/* Mobile Touch / Onscreen D-pad */}
      <div className="flex flex-col items-center gap-1.5 pt-1 md:hidden">
        <button
          onClick={() => changeDirection('UP')}
          aria-label="Up"
          className="p-3 bg-white/10 active:bg-emerald-600 rounded-xl text-white font-bold"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
        <div className="flex gap-4">
          <button
            onClick={() => changeDirection('LEFT')}
            aria-label="Left"
            className="p-3 bg-white/10 active:bg-emerald-600 rounded-xl text-white font-bold"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => changeDirection('DOWN')}
            aria-label="Down"
            className="p-3 bg-white/10 active:bg-emerald-600 rounded-xl text-white font-bold"
          >
            <ArrowDown className="w-5 h-5" />
          </button>
          <button
            onClick={() => changeDirection('RIGHT')}
            aria-label="Right"
            className="p-3 bg-white/10 active:bg-emerald-600 rounded-xl text-white font-bold"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <p className="text-[11px] text-gray-500 text-center hidden md:block">
        Use <strong className="text-gray-400">Arrow Keys</strong> or <strong className="text-gray-400">WASD</strong> to navigate • <strong className="text-gray-400">Space</strong> to pause
      </p>

    </div>
  );
}
