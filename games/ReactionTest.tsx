'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { RotateCcw, Zap, Trophy, Clock, Volume2, VolumeX } from 'lucide-react';
import { getStats, saveStats } from '@/lib/storage';
import { sound } from '@/lib/audio';

type State = 'idle' | 'waiting' | 'ready' | 'result' | 'early';

export default function ReactionTest() {
  const [state, setState] = useState<State>('idle');
  const [startTime, setStartTime] = useState<number>(0);
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [bestTime, setBestTime] = useState<number | null>(null);
  const [history, setHistory] = useState<number[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const stats = getStats('reaction-test');
    if (stats.bestReaction) setBestTime(stats.bestReaction);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleClick = useCallback(() => {
    if (state === 'idle' || state === 'result' || state === 'early') {
      // Start waiting
      setState('waiting');
      if (soundEnabled) sound.playBounce();

      const delay = Math.floor(Math.random() * 2800) + 1800; // 1.8s - 4.6s
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setState('ready');
        setStartTime(Date.now());
        if (soundEnabled) sound.playPop();
      }, delay);
    } else if (state === 'waiting') {
      // Clicked too early!
      if (timerRef.current) clearTimeout(timerRef.current);
      if (soundEnabled) sound.playError();
      setState('early');
    } else if (state === 'ready') {
      // Valid reaction!
      const time = Date.now() - startTime;
      setReactionTime(time);
      setState('result');
      if (soundEnabled) sound.playScore();

      setHistory((prev) => [time, ...prev].slice(0, 5));

      if (!bestTime || time < bestTime) {
        setBestTime(time);
        saveStats('reaction-test', { bestReaction: time });
      }
    }
  }, [state, startTime, bestTime, soundEnabled]);

  // Spacebar keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleClick();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleClick]);

  const getAverageTime = () => {
    if (history.length === 0) return null;
    const sum = history.reduce((a, b) => a + b, 0);
    return Math.round(sum / history.length);
  };

  const getRankBadge = (ms: number) => {
    if (ms < 180) return { title: 'Godlike Reflexes ⚡', color: 'text-amber-300 border-amber-400 bg-amber-400/20' };
    if (ms < 230) return { title: 'Esports Pro 🏆', color: 'text-purple-300 border-purple-400 bg-purple-400/20' };
    if (ms < 280) return { title: 'Fast Gamer 🚀', color: 'text-cyan-300 border-cyan-400 bg-cyan-400/20' };
    if (ms < 350) return { title: 'Average Human 👍', color: 'text-emerald-300 border-emerald-400 bg-emerald-400/20' };
    return { title: 'A Bit Sluggish 🐢', color: 'text-rose-300 border-rose-400 bg-rose-400/20' };
  };

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-lg mx-auto select-none">
      
      {/* Header Bar */}
      <div className="flex items-center justify-between w-full">
        <div className="grid grid-cols-2 gap-3 flex-1 mr-3">
          <div className="bg-white/[0.04] border border-white/10 p-3 rounded-2xl flex flex-col items-center shadow-sm">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <Trophy className="w-3 h-3 text-amber-400" /> Best Time
            </span>
            <span className="text-xl font-black text-amber-400 font-mono">{bestTime ? `${bestTime} ms` : '-'}</span>
          </div>
          <div className="bg-white/[0.04] border border-white/10 p-3 rounded-2xl flex flex-col items-center shadow-sm">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <Clock className="w-3 h-3 text-cyan-400" /> Average
            </span>
            <span className="text-xl font-black text-white font-mono">{getAverageTime() ? `${getAverageTime()} ms` : '-'}</span>
          </div>
        </div>

        <button
          onClick={() => {
            const next = !soundEnabled;
            setSoundEnabled(next);
            sound.setEnabled(next);
          }}
          className="p-3 rounded-2xl bg-white/[0.04] hover:bg-white/10 border border-white/10 text-gray-300 transition-colors"
          title="Toggle Sound"
        >
          {soundEnabled ? <Volume2 className="w-5 h-5 text-cyan-400" /> : <VolumeX className="w-5 h-5 text-gray-500" />}
        </button>
      </div>

      {/* Main Interactive Arena */}
      <div
        onClick={handleClick}
        className={`w-full aspect-[4/3] rounded-3xl p-8 flex flex-col items-center justify-center gap-4 text-center cursor-pointer transition-all duration-150 border-2 shadow-2xl active:scale-[0.99] ${
          state === 'idle'
            ? 'bg-purple-950/40 border-purple-500/40 text-white hover:border-purple-400'
            : state === 'waiting'
            ? 'bg-rose-950/90 border-rose-500/60 text-rose-300'
            : state === 'ready'
            ? 'bg-emerald-500 border-emerald-300 text-slate-950 shadow-emerald-500/50'
            : state === 'early'
            ? 'bg-amber-950/90 border-amber-500/60 text-amber-300'
            : 'bg-indigo-950/70 border-indigo-500/40 text-white'
        }`}
      >
        {state === 'idle' && (
          <div className="flex flex-col items-center gap-3 animate-in fade-in duration-200">
            <Zap className="w-16 h-16 text-purple-400 animate-bounce" />
            <h3 className="text-2xl sm:text-3xl font-black">Click Anywhere to Start</h3>
            <p className="text-xs sm:text-sm text-gray-400 max-w-xs">When the red screen turns vibrant green, click as fast as possible!</p>
          </div>
        )}

        {state === 'waiting' && (
          <div className="flex flex-col items-center gap-3 animate-in fade-in duration-100">
            <div className="w-12 h-12 rounded-full border-4 border-rose-400 border-t-transparent animate-spin" />
            <h3 className="text-3xl font-black text-rose-400">Wait for Green...</h3>
            <p className="text-xs sm:text-sm text-rose-300/80">Hold steady! Don't click yet!</p>
          </div>
        )}

        {state === 'ready' && (
          <div className="flex flex-col items-center gap-2">
            <Zap className="w-16 h-16 text-slate-950 fill-slate-950 animate-bounce" />
            <h3 className="text-4xl sm:text-5xl font-black uppercase tracking-tight">CLICK NOW!</h3>
          </div>
        )}

        {state === 'early' && (
          <div className="flex flex-col items-center gap-3 animate-in fade-in duration-150">
            <span className="text-5xl">⚠️</span>
            <h3 className="text-3xl font-black text-amber-400">Too Early!</h3>
            <p className="text-xs sm:text-sm text-gray-300">You clicked before it turned green. Click anywhere to retry.</p>
          </div>
        )}

        {state === 'result' && reactionTime !== null && (
          <div className="flex flex-col items-center gap-3 animate-in fade-in zoom-in-95 duration-200">
            <span className="text-4xl">⚡</span>
            <h3 className="text-5xl font-black text-emerald-400 font-mono">{reactionTime} ms</h3>
            <span className={`text-xs font-black uppercase px-3 py-1 rounded-full border ${getRankBadge(reactionTime).color}`}>
              {getRankBadge(reactionTime).title}
            </span>
            <p className="text-xs text-gray-400 mt-1">Click or press Spacebar to test again!</p>
          </div>
        )}
      </div>

      {/* History Log */}
      {history.length > 0 && (
        <div className="w-full bg-white/[0.04] border border-white/10 p-4 rounded-2xl">
          <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">Recent Attempts</h4>
          <div className="flex flex-wrap gap-2">
            {history.map((t, idx) => (
              <span key={idx} className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-gray-300">
                #{idx + 1}: <span className="text-cyan-400 font-mono font-bold">{t} ms</span>
              </span>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-gray-500 text-center">
        💡 You can also press <strong className="text-gray-400">Spacebar</strong> to trigger reactions
      </p>

    </div>
  );
}
