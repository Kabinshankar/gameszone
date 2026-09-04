'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { RotateCcw, Trophy, Play, Volume2, VolumeX } from 'lucide-react';
import { getStats, saveStats } from '@/lib/storage';
import { sound } from '@/lib/audio';

export default function FlappyBird() {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'over'>('start');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Physics state refs
  const rocketY = useRef(200);
  const velocity = useRef(0);
  const gravity = 0.45;
  const lift = -7.5;
  const pipes = useRef<{ x: number; top: number; bottom: number; passed: boolean }[]>([]);
  const particles = useRef<{ x: number; y: number; vx: number; vy: number; life: number; color: string }[]>([]);
  const stars = useRef<{ x: number; y: number; size: number; speed: number }[]>([]);
  const frameId = useRef<number | null>(null);

  useEffect(() => {
    const stats = getStats('flappy-rocket');
    if (stats.highScore) setHighScore(stats.highScore);

    // Generate background stars
    const s = [];
    for (let i = 0; i < 40; i++) {
      s.push({
        x: Math.random() * 400,
        y: Math.random() * 500,
        size: Math.random() * 2 + 1,
        speed: Math.random() * 0.8 + 0.3,
      });
    }
    stars.current = s;
  }, []);

  const startGame = () => {
    rocketY.current = 200;
    velocity.current = 0;
    pipes.current = [];
    particles.current = [];
    setScore(0);
    setGameState('playing');
  };

  const flap = useCallback(() => {
    if (gameState === 'start' || gameState === 'over') {
      startGame();
    } else {
      velocity.current = lift;
      if (soundEnabled) sound.playJump();

      // Emit rocket thruster particles
      for (let i = 0; i < 6; i++) {
        particles.current.push({
          x: 65,
          y: rocketY.current + (Math.random() - 0.5) * 8,
          vx: -(Math.random() * 3 + 2),
          vy: (Math.random() - 0.5) * 2,
          life: 1,
          color: Math.random() > 0.4 ? '#06b6d4' : '#f97316',
        });
      }
    }
  }, [gameState, soundEnabled]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['Space', 'ArrowUp', 'KeyW'].includes(e.code)) {
        e.preventDefault();
        flap();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [flap]);

  // Main Canvas Game Loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let pipeTimer = 0;

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Deep space backdrop gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bgGrad.addColorStop(0, '#06060c');
      bgGrad.addColorStop(1, '#0e0b1f');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw drifting stars
      ctx.fillStyle = '#ffffff';
      for (const st of stars.current) {
        st.x -= st.speed;
        if (st.x < 0) st.x = canvas.width;
        ctx.globalAlpha = Math.min(1, st.speed);
        ctx.beginPath();
        ctx.arc(st.x, st.y, st.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;

      // Rocket Physics
      velocity.current += gravity;
      rocketY.current += velocity.current;

      // Draw & Update Particles
      for (let i = particles.current.length - 1; i >= 0; i--) {
        const pt = particles.current[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.life -= 0.05;
        if (pt.life <= 0) {
          particles.current.splice(i, 1);
        } else {
          ctx.fillStyle = pt.color;
          ctx.globalAlpha = pt.life;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 3 * pt.life, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1.0;

      // Draw Futuristic Rocket Ship
      const rx = 80;
      const ry = rocketY.current;

      ctx.save();
      ctx.translate(rx, ry);
      // Tilt rocket based on velocity
      const angle = Math.max(-0.6, Math.min(0.8, velocity.current * 0.08));
      ctx.rotate(angle);

      // Thruster engine glow
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.moveTo(-16, -4);
      ctx.lineTo(-24 - Math.random() * 6, 0);
      ctx.lineTo(-16, 4);
      ctx.fill();

      // Rocket body
      const shipGrad = ctx.createLinearGradient(-15, 0, 18, 0);
      shipGrad.addColorStop(0, '#4338ca');
      shipGrad.addColorStop(0.5, '#06b6d4');
      shipGrad.addColorStop(1, '#a5f3fc');
      ctx.fillStyle = shipGrad;
      ctx.beginPath();
      ctx.ellipse(0, 0, 18, 9, 0, 0, Math.PI * 2);
      ctx.fill();

      // Cockpit dome window
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(4, -2, 5, 3, 0, 0, Math.PI * 2);
      ctx.fill();

      // Wings
      ctx.fillStyle = '#6366f1';
      ctx.beginPath();
      ctx.moveTo(-8, -9);
      ctx.lineTo(-14, -14);
      ctx.lineTo(-4, -9);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(-8, 9);
      ctx.lineTo(-14, 14);
      ctx.lineTo(-4, 9);
      ctx.fill();

      ctx.restore();

      // Spawn Obstacle Gates
      pipeTimer++;
      if (pipeTimer > 85) {
        pipeTimer = 0;
        const gap = 135;
        const minTop = 60;
        const maxTop = canvas.height - gap - 60;
        const topHeight = Math.floor(Math.random() * (maxTop - minTop)) + minTop;
        pipes.current.push({
          x: canvas.width,
          top: topHeight,
          bottom: canvas.height - topHeight - gap,
          passed: false,
        });
      }

      // Move & Draw Energy Pillars
      for (let i = pipes.current.length - 1; i >= 0; i--) {
        const p = pipes.current[i];
        p.x -= 2.6;

        // Top gate
        const topGrad = ctx.createLinearGradient(p.x, 0, p.x + 50, 0);
        topGrad.addColorStop(0, '#581c87');
        topGrad.addColorStop(0.5, '#9333ea');
        topGrad.addColorStop(1, '#c084fc');
        ctx.fillStyle = topGrad;
        ctx.fillRect(p.x, 0, 48, p.top);

        // Cap highlight
        ctx.fillStyle = '#f472b6';
        ctx.fillRect(p.x - 3, p.top - 12, 54, 12);

        // Bottom gate
        const btmY = canvas.height - p.bottom;
        ctx.fillStyle = topGrad;
        ctx.fillRect(p.x, btmY, 48, p.bottom);

        // Cap highlight
        ctx.fillStyle = '#f472b6';
        ctx.fillRect(p.x - 3, btmY, 54, 12);

        // Score Check
        if (!p.passed && p.x + 48 < 80) {
          p.passed = true;
          if (soundEnabled) sound.playScore();
          setScore((s) => {
            const next = s + 1;
            if (next > highScore) {
              setHighScore(next);
              saveStats('flappy-rocket', { highScore: next });
            }
            return next;
          });
        }

        // Collision Check
        const rocketRadius = 11;
        if (
          80 + rocketRadius > p.x &&
          80 - rocketRadius < p.x + 48 &&
          (rocketY.current - rocketRadius < p.top ||
            rocketY.current + rocketRadius > canvas.height - p.bottom)
        ) {
          handleCrash();
          return;
        }

        // Offscreen remove
        if (p.x < -60) pipes.current.splice(i, 1);
      }

      // Floor & Ceiling Collision
      if (rocketY.current > canvas.height - 14 || rocketY.current < 14) {
        handleCrash();
        return;
      }

      frameId.current = requestAnimationFrame(loop);
    };

    const handleCrash = () => {
      if (soundEnabled) sound.playLose();
      setGameState('over');
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
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Score:</span>
          <span className="text-xl font-black text-cyan-400 font-mono">{score}</span>
        </div>
        <div className="flex items-center gap-1.5 text-amber-400 font-semibold text-xs bg-amber-400/10 border border-amber-400/20 px-2.5 py-1 rounded-full">
          <Trophy className="w-3.5 h-3.5" /> Best: {highScore}
        </div>
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
      </div>

      {/* Game Canvas */}
      <div
        onClick={flap}
        onTouchStart={(e) => {
          e.preventDefault();
          flap();
        }}
        className="relative w-full aspect-[4/5] bg-slate-950 border-2 border-cyan-500/40 rounded-3xl overflow-hidden shadow-2xl cursor-pointer touch-none"
      >
        <canvas
          ref={canvasRef}
          width={400}
          height={500}
          className="w-full h-full object-cover"
        />

        {/* Start Overlay */}
        {gameState === 'start' && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4 p-6 text-center z-20 animate-in fade-in duration-200">
            <span className="text-5xl animate-bounce">🚀</span>
            <h3 className="text-3xl font-black text-white">Flappy Rocket</h3>
            <p className="text-xs sm:text-sm text-gray-300">Tap screen or press Spacebar to boost rocket engines</p>
            <button className="flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30 hover:scale-105 active:scale-95 transition-all mt-1">
              <Play className="w-4 h-4 fill-white" /> Launch Rocket
            </button>
          </div>
        )}

        {/* Game Over Overlay */}
        {gameState === 'over' && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center gap-4 p-6 text-center z-20 animate-in fade-in zoom-in-95 duration-200">
            <span className="text-4xl">💥</span>
            <h3 className="text-3xl font-black text-rose-500">Crash Landing!</h3>
            <p className="text-xs sm:text-sm text-gray-300">Final Score: <span className="text-cyan-400 font-bold text-base">{score}</span> gates cleared</p>
            <button
              onClick={startGame}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30 hover:scale-105 active:scale-95 transition-all text-sm mt-1"
            >
              <RotateCcw className="w-4 h-4" /> Try Again
            </button>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500 text-center">
        Tap or press <strong className="text-gray-400">Spacebar</strong> to thrust upwards
      </p>

    </div>
  );
}
