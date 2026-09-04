'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { RotateCcw, Bot, Users, Trophy, Play, Volume2, VolumeX } from 'lucide-react';
import { sound } from '@/lib/audio';

type MatchMode = 'ai' | 'pvp';
type TargetScore = 5 | 10;

export default function Pong() {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'over'>('start');
  const [mode, setMode] = useState<MatchMode>('ai');
  const [targetScore, setTargetScore] = useState<TargetScore>(5);
  const [scores, setScores] = useState({ p1: 0, p2: 0 });
  const [winner, setWinner] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Physics state refs
  const p1Y = useRef(115);
  const p2Y = useRef(115);
  const ballX = useRef(200);
  const ballY = useRef(150);
  const ballDX = useRef(4.5);
  const ballDY = useRef(2.5);
  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const frameId = useRef<number | null>(null);

  const resetBall = (direction: 'left' | 'right' = Math.random() < 0.5 ? 'left' : 'right') => {
    ballX.current = 200;
    ballY.current = 150;
    ballDX.current = direction === 'left' ? -4.5 : 4.5;
    ballDY.current = (Math.random() - 0.5) * 4;
  };

  const startGame = () => {
    p1Y.current = 115;
    p2Y.current = 115;
    resetBall();
    setScores({ p1: 0, p2: 0 });
    setWinner(null);
    setGameState('playing');
  };

  // Keyboard listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = true;
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

  // Touch Move handler for mobile
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (gameState !== 'playing') return;
    const rect = e.currentTarget.getBoundingClientRect();
    for (let i = 0; i < e.touches.length; i++) {
      const touch = e.touches[i];
      const relY = ((touch.clientY - rect.top) / rect.height) * 300 - 35;
      const relX = touch.clientX - rect.left;

      if (relX < rect.width / 2) {
        // Left side touch -> P1
        p1Y.current = Math.max(10, Math.min(220, relY));
      } else if (mode === 'pvp') {
        // Right side touch -> P2 in PVP
        p2Y.current = Math.max(10, Math.min(220, relY));
      }
    }
  };

  // Main Game Loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const paddleHeight = 70;
    const paddleWidth = 10;

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Center Court Net
      ctx.setLineDash([6, 6]);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, 0);
      ctx.lineTo(canvas.width / 2, canvas.height);
      ctx.stroke();
      ctx.setLineDash([]);

      // P1 Keyboard Controls (W / S)
      if (keysPressed.current['KeyW'] && p1Y.current > 10) p1Y.current -= 6.5;
      if (keysPressed.current['KeyS'] && p1Y.current < canvas.height - paddleHeight - 10) p1Y.current += 6.5;

      // P2 Controls
      if (mode === 'pvp') {
        if (keysPressed.current['ArrowUp'] && p2Y.current > 10) p2Y.current -= 6.5;
        if (keysPressed.current['ArrowDown'] && p2Y.current < canvas.height - paddleHeight - 10) p2Y.current += 6.5;
      } else {
        // AI Tracking with gentle lag for natural gameplay
        const target = ballY.current - paddleHeight / 2;
        const diff = target - p2Y.current;
        p2Y.current += Math.min(4.8, Math.max(-4.8, diff * 0.15));
        p2Y.current = Math.max(10, Math.min(canvas.height - paddleHeight - 10, p2Y.current));
      }

      // Ball Physics
      ballX.current += ballDX.current;
      ballY.current += ballDY.current;

      // Top / Bottom Bounces
      if (ballY.current - 6 < 0) {
        ballY.current = 6;
        ballDY.current = Math.abs(ballDY.current);
        if (soundEnabled) sound.playBounce();
      } else if (ballY.current + 6 > canvas.height) {
        ballY.current = canvas.height - 6;
        ballDY.current = -Math.abs(ballDY.current);
        if (soundEnabled) sound.playBounce();
      }

      // P1 Paddle Collision (Left)
      if (
        ballX.current - 6 <= 20 &&
        ballX.current + 6 >= 10 &&
        ballY.current >= p1Y.current &&
        ballY.current <= p1Y.current + paddleHeight
      ) {
        // Calculate offset angle
        const offset = (ballY.current - (p1Y.current + paddleHeight / 2)) / (paddleHeight / 2);
        ballDX.current = Math.min(8, Math.abs(ballDX.current) + 0.25);
        ballDY.current = offset * 4.5;
        if (soundEnabled) sound.playBounce();
      }

      // P2 Paddle Collision (Right)
      if (
        ballX.current + 6 >= canvas.width - 20 &&
        ballX.current - 6 <= canvas.width - 10 &&
        ballY.current >= p2Y.current &&
        ballY.current <= p2Y.current + paddleHeight
      ) {
        const offset = (ballY.current - (p2Y.current + paddleHeight / 2)) / (paddleHeight / 2);
        ballDX.current = -Math.min(8, Math.abs(ballDX.current) + 0.25);
        ballDY.current = offset * 4.5;
        if (soundEnabled) sound.playBounce();
      }

      // Scoring
      if (ballX.current < 0) {
        // P2 Scores
        if (soundEnabled) (mode === 'ai' ? sound.playError() : sound.playScore());
        setScores((prev) => {
          const next = prev.p2 + 1;
          if (next >= targetScore) {
            setWinner(mode === 'ai' ? 'AI' : 'Player 2');
            setGameState('over');
            if (soundEnabled) (mode === 'ai' ? sound.playLose() : sound.playWin());
          } else {
            resetBall('left');
          }
          return { ...prev, p2: next };
        });
      } else if (ballX.current > canvas.width) {
        // P1 Scores
        if (soundEnabled) sound.playScore();
        setScores((prev) => {
          const next = prev.p1 + 1;
          if (next >= targetScore) {
            setWinner('Player 1');
            setGameState('over');
            if (soundEnabled) sound.playWin();
          } else {
            resetBall('right');
          }
          return { ...prev, p1: next };
        });
      }

      // Draw P1 Paddle (Neon Lime)
      ctx.fillStyle = '#a3e635';
      ctx.shadowColor = '#a3e635';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.roundRect(10, p1Y.current, paddleWidth, paddleHeight, 5);
      ctx.fill();

      // Draw P2 Paddle (Neon Cyan)
      ctx.fillStyle = '#06b6d4';
      ctx.shadowColor = '#06b6d4';
      ctx.beginPath();
      ctx.roundRect(canvas.width - 20, p2Y.current, paddleWidth, paddleHeight, 5);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Draw Ball
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(ballX.current, ballY.current, 7, 0, Math.PI * 2);
      ctx.fill();

      frameId.current = requestAnimationFrame(loop);
    };

    frameId.current = requestAnimationFrame(loop);

    return () => {
      if (frameId.current) cancelAnimationFrame(frameId.current);
    };
  }, [gameState, mode, targetScore, soundEnabled]);

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md mx-auto select-none">
      
      {/* Options Bar */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 bg-white/[0.04] border border-white/10 p-3 rounded-2xl backdrop-blur-sm shadow-md">
        <div className="flex bg-black/40 p-1 rounded-xl border border-white/10">
          <button
            onClick={() => { setMode('ai'); setGameState('start'); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === 'ai' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Bot className="w-3.5 h-3.5" /> vs AI
          </button>
          <button
            onClick={() => { setMode('pvp'); setGameState('start'); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === 'pvp' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> 2 Player
          </button>
        </div>

        <select
          value={targetScore}
          onChange={(e) => { setTargetScore(Number(e.target.value) as TargetScore); setGameState('start'); }}
          className="bg-black/50 border border-white/10 text-xs font-semibold text-gray-200 rounded-xl px-3 py-1.5 focus:outline-none"
        >
          <option value={5}>First to 5</option>
          <option value={10}>First to 10</option>
        </select>

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

      {/* Score Header */}
      <div className="grid grid-cols-2 gap-3 w-full">
        <div className="bg-lime-950/40 border border-lime-500/30 p-3 rounded-2xl flex flex-col items-center">
          <span className="text-[10px] text-lime-300 font-bold uppercase tracking-wider">Player 1 (W/S)</span>
          <span className="text-2xl font-black text-white font-mono">{scores.p1}</span>
        </div>
        <div className="bg-cyan-950/40 border border-cyan-500/30 p-3 rounded-2xl flex flex-col items-center">
          <span className="text-[10px] text-cyan-300 font-bold uppercase tracking-wider">{mode === 'ai' ? 'AI Paddle' : 'Player 2 (Up/Down)'}</span>
          <span className="text-2xl font-black text-white font-mono">{scores.p2}</span>
        </div>
      </div>

      {/* Canvas Area with Touch Listener */}
      <div
        onTouchMove={handleTouchMove}
        className="relative w-full aspect-[4/3] bg-slate-950 border-2 border-lime-500/40 rounded-3xl overflow-hidden shadow-2xl touch-none"
      >
        <canvas
          ref={canvasRef}
          width={400}
          height={300}
          className="w-full h-full object-cover"
        />

        {/* Start Overlay */}
        {gameState === 'start' && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4 p-6 text-center z-20 animate-in fade-in duration-200">
            <span className="text-5xl animate-bounce">🏓</span>
            <h3 className="text-3xl font-black text-white">Classic Pong</h3>
            <p className="text-xs sm:text-sm text-gray-300">Desktop: W/S vs Up/Down • Mobile: Drag touch left or right sides</p>
            <button
              onClick={startGame}
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold bg-gradient-to-r from-lime-500 to-emerald-600 text-slate-950 shadow-lg hover:scale-105 active:scale-95 transition-all text-sm mt-1"
            >
              <Play className="w-4 h-4 fill-slate-950" /> Start Match
            </button>
          </div>
        )}

        {/* Game Over */}
        {gameState === 'over' && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center gap-4 p-6 text-center z-20 animate-in fade-in zoom-in-95 duration-200">
            <Trophy className="w-12 h-12 text-amber-400 animate-bounce" />
            <h3 className="text-3xl font-black text-white">{winner} Wins Match!</h3>
            <p className="text-xs text-gray-400">Score reached {targetScore} points</p>
            <button
              onClick={startGame}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-lime-500 to-emerald-600 text-slate-950 shadow-lg hover:scale-105 active:scale-95 transition-all text-sm mt-2"
            >
              <RotateCcw className="w-4 h-4" /> Rematch
            </button>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500 text-center">
        P1: <strong className="text-gray-400">W / S</strong> • P2: <strong className="text-gray-400">Up / Down Arrows</strong> • Or touch and drag vertically
      </p>

    </div>
  );
}
