'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { RotateCcw, Heart, Trophy, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { getStats, saveStats } from '@/lib/storage';
import { sound } from '@/lib/audio';

export default function Breakout() {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'paused' | 'over' | 'win'>('start');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [highScore, setHighScore] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Physics state refs
  const paddleX = useRef(160);
  const ballX = useRef(200);
  const ballY = useRef(330);
  const ballDX = useRef(3.5);
  const ballDY = useRef(-3.5);
  const bricks = useRef<{ x: number; y: number; width: number; height: number; status: number; color: string; points: number }[]>([]);
  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const frameId = useRef<number | null>(null);

  useEffect(() => {
    const stats = getStats('breakout');
    if (stats.highScore) setHighScore(stats.highScore);
  }, []);

  const initBricks = () => {
    const rows = 4;
    const cols = 7;
    const brickWidth = 50;
    const brickHeight = 16;
    const padding = 6;
    const offsetLeft = 12;
    const offsetTop = 40;

    const colors = ['#f43f5e', '#f97316', '#f59e0b', '#22c55e'];
    const pointValues = [40, 30, 20, 10];
    const b = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        b.push({
          x: c * (brickWidth + padding) + offsetLeft,
          y: r * (brickHeight + padding) + offsetTop,
          width: brickWidth,
          height: brickHeight,
          status: 1,
          color: colors[r],
          points: pointValues[r],
        });
      }
    }
    bricks.current = b;
  };

  const startGame = () => {
    paddleX.current = 160;
    ballX.current = 200;
    ballY.current = 330;
    ballDX.current = Math.random() > 0.5 ? 3.5 : -3.5;
    ballDY.current = -3.5;
    setLives(3);
    setScore(0);
    initBricks();
    setGameState('playing');
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = true;
      if (e.code === 'Space') {
        e.preventDefault();
        setGameState((prev) => {
          if (prev === 'playing') return 'paused';
          if (prev === 'paused') return 'playing';
          return prev;
        });
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Mouse / Touch Move Control
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (gameState !== 'playing') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const relativeX = e.clientX - rect.left;
    const scaledX = (relativeX / rect.width) * 400 - 40;
    paddleX.current = Math.max(0, Math.min(320, scaledX));
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (gameState !== 'playing') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const relativeX = e.touches[0].clientX - rect.left;
    const scaledX = (relativeX / rect.width) * 400 - 40;
    paddleX.current = Math.max(0, Math.min(320, scaledX));
  };

  // Main Canvas Game Loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const paddleWidth = 80;
    const paddleHeight = 12;
    const paddleY = canvas.height - 25;

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Keyboard paddle steering
      if (keysPressed.current['ArrowLeft'] || keysPressed.current['KeyA']) {
        paddleX.current = Math.max(0, paddleX.current - 6.5);
      }
      if (keysPressed.current['ArrowRight'] || keysPressed.current['KeyD']) {
        paddleX.current = Math.min(canvas.width - paddleWidth, paddleX.current + 6.5);
      }

      // Draw Bricks
      let activeBricks = 0;
      for (const b of bricks.current) {
        if (b.status === 1) {
          activeBricks++;
          ctx.fillStyle = b.color;
          ctx.beginPath();
          ctx.roundRect(b.x, b.y, b.width, b.height, 4);
          ctx.fill();

          // Brick collision check
          if (
            ballX.current + 6 > b.x &&
            ballX.current - 6 < b.x + b.width &&
            ballY.current + 6 > b.y &&
            ballY.current - 6 < b.y + b.height
          ) {
            ballDY.current = -ballDY.current;
            b.status = 0;
            if (soundEnabled) sound.playScore();

            setScore((s) => {
              const next = s + b.points;
              if (next > highScore) {
                setHighScore(next);
                saveStats('breakout', { highScore: next });
              }
              return next;
            });
          }
        }
      }

      if (activeBricks === 0) {
        if (soundEnabled) sound.playWin();
        setGameState('win');
        return;
      }

      // Move Ball
      ballX.current += ballDX.current;
      ballY.current += ballDY.current;

      // Ball Wall Collisions
      if (ballX.current + 6 > canvas.width) {
        ballX.current = canvas.width - 6;
        ballDX.current = -Math.abs(ballDX.current);
        if (soundEnabled) sound.playBounce();
      } else if (ballX.current - 6 < 0) {
        ballX.current = 6;
        ballDX.current = Math.abs(ballDX.current);
        if (soundEnabled) sound.playBounce();
      }

      if (ballY.current - 6 < 0) {
        ballY.current = 6;
        ballDY.current = Math.abs(ballDY.current);
        if (soundEnabled) sound.playBounce();
      }

      // Ball Paddle Collision with Dynamic Angle Deflection
      if (
        ballY.current + 6 >= paddleY &&
        ballY.current - 6 <= paddleY + paddleHeight &&
        ballX.current >= paddleX.current &&
        ballX.current <= paddleX.current + paddleWidth
      ) {
        // Calculate hit offset (-1 = left edge, 0 = center, +1 = right edge)
        const hitOffset = (ballX.current - (paddleX.current + paddleWidth / 2)) / (paddleWidth / 2);
        ballDX.current = hitOffset * 5.5; // Steer ball angle
        ballDY.current = -Math.max(3, Math.sqrt(30 - Math.pow(ballDX.current, 2))); // Preserve velocity magnitude
        if (soundEnabled) sound.playBounce();
      }

      // Ball Out of Bottom
      if (ballY.current + 6 > canvas.height) {
        if (soundEnabled) sound.playError();
        setLives((l) => {
          const next = l - 1;
          if (next <= 0) {
            if (soundEnabled) sound.playLose();
            setGameState('over');
          } else {
            // Reset ball to center
            ballX.current = 200;
            ballY.current = 330;
            ballDX.current = Math.random() > 0.5 ? 3.5 : -3.5;
            ballDY.current = -3.5;
          }
          return next;
        });
      }

      // Draw Neon Paddle
      const paddleGrad = ctx.createLinearGradient(paddleX.current, 0, paddleX.current + paddleWidth, 0);
      paddleGrad.addColorStop(0, '#84cc16');
      paddleGrad.addColorStop(1, '#10b981');
      ctx.fillStyle = paddleGrad;
      ctx.beginPath();
      ctx.roundRect(paddleX.current, paddleY, paddleWidth, paddleHeight, 6);
      ctx.fill();

      // Draw Glowing Ball
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#84cc16';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(ballX.current, ballY.current, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      frameId.current = requestAnimationFrame(loop);
    };

    frameId.current = requestAnimationFrame(loop);

    return () => {
      if (frameId.current) cancelAnimationFrame(frameId.current);
    };
  }, [gameState, highScore, soundEnabled]);

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md mx-auto select-none">
      
      {/* Header */}
      <div className="flex items-center justify-between w-full bg-white/[0.04] border border-white/10 px-4 py-3 rounded-2xl backdrop-blur-sm shadow-md">
        <div className="flex items-center gap-1 text-rose-400">
          {Array.from({ length: 3 }).map((_, i) => (
            <Heart key={i} className={`w-4 h-4 ${i < lives ? 'fill-rose-500 text-rose-500' : 'text-gray-700'}`} />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Score:</span>
          <span className="text-xl font-black text-lime-400 font-mono">{score}</span>
        </div>
        <div className="flex items-center gap-1.5 text-amber-400 font-semibold text-xs bg-amber-400/10 border border-amber-400/20 px-2.5 py-1 rounded-full">
          <Trophy className="w-3.5 h-3.5" /> High: {highScore}
        </div>
        <div className="flex items-center gap-1">
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
            onClick={() => {
              if (gameState === 'playing') setGameState('paused');
              else if (gameState === 'paused') setGameState('playing');
            }}
            disabled={gameState !== 'playing' && gameState !== 'paused'}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 transition-colors disabled:opacity-30"
            title="Pause (Space)"
          >
            {gameState === 'paused' ? <Play className="w-4 h-4 text-lime-400" /> : <Pause className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Game Canvas container */}
      <div
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        className="relative w-full aspect-[4/5] bg-slate-950 border-2 border-lime-500/40 rounded-3xl overflow-hidden shadow-2xl cursor-none touch-none"
      >
        <canvas
          ref={canvasRef}
          width={400}
          height={500}
          className="w-full h-full object-cover"
        />

        {/* Start Overlay */}
        {gameState === 'start' && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4 p-6 text-center z-20 cursor-auto animate-in fade-in duration-200">
            <span className="text-5xl animate-bounce">🧱</span>
            <h3 className="text-3xl font-black text-white">Breakout Arcade</h3>
            <p className="text-xs sm:text-sm text-gray-300">Move mouse, touch screen, or use Arrow/AD keys to steer paddle</p>
            <button
              onClick={startGame}
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold bg-gradient-to-r from-lime-500 to-emerald-600 text-slate-950 shadow-lg shadow-lime-500/30 hover:scale-105 active:scale-95 transition-all mt-1"
            >
              <Play className="w-4 h-4 fill-slate-950" /> Start Game
            </button>
          </div>
        )}

        {/* Paused Overlay */}
        {gameState === 'paused' && (
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center gap-3 p-6 text-center z-20 cursor-auto">
            <span className="text-4xl">⏸️</span>
            <h3 className="text-2xl font-black text-white">Paused</h3>
            <button
              onClick={() => setGameState('playing')}
              className="px-6 py-2.5 rounded-xl font-bold bg-lime-500 text-slate-950 shadow-lg hover:scale-105 transition-all text-sm mt-2"
            >
              Resume Game
            </button>
          </div>
        )}

        {/* Game Over */}
        {gameState === 'over' && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center gap-4 p-6 text-center z-20 cursor-auto animate-in fade-in zoom-in-95 duration-200">
            <span className="text-4xl">💀</span>
            <h3 className="text-3xl font-black text-rose-500">Out of Lives!</h3>
            <p className="text-xs sm:text-sm text-gray-300">Final Score: <span className="text-lime-400 font-bold text-base">{score}</span></p>
            <button
              onClick={startGame}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-lime-500 to-emerald-600 text-slate-950 shadow-lg hover:scale-105 active:scale-95 transition-all text-sm mt-1"
            >
              <RotateCcw className="w-4 h-4" /> Try Again
            </button>
          </div>
        )}

        {/* Win */}
        {gameState === 'win' && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center gap-4 p-6 text-center z-20 cursor-auto animate-in fade-in zoom-in-95 duration-200">
            <Trophy className="w-12 h-12 text-amber-400 animate-bounce" />
            <h3 className="text-3xl font-black text-white">All Bricks Destroyed!</h3>
            <p className="text-xs sm:text-sm text-gray-300">Victory! Score: <span className="text-lime-400 font-bold">{score}</span></p>
            <button
              onClick={startGame}
              className="px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-lime-500 to-emerald-600 text-slate-950 shadow-lg hover:scale-105 active:scale-95 transition-all text-sm mt-1"
            >
              Play Again
            </button>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500 text-center">
        💡 Move with <strong className="text-gray-400">Mouse</strong>, <strong className="text-gray-400">Touch</strong>, or <strong className="text-gray-400">Left/Right Arrow Keys</strong>
      </p>

    </div>
  );
}
