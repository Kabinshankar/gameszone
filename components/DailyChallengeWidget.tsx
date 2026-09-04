'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trophy, Flame, CheckCircle2, Clock, Coins, ArrowRight } from 'lucide-react';
import { getDailyChallenge, isDailyChallengeCompleted, type DailyChallenge } from '@/lib/daily-challenge';

const DIFFICULTY_COLORS = {
  easy: { badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', dot: 'bg-emerald-400' },
  medium: { badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30', dot: 'bg-amber-400' },
  hard: { badge: 'bg-rose-500/15 text-rose-400 border-rose-500/30', dot: 'bg-rose-400' },
};

function getTimeUntilMidnight(): string {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const diff = midnight.getTime() - now.getTime();
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return `${h}h ${m}m`;
}

export default function DailyChallengeWidget() {
  const [challenge, setChallenge] = useState<DailyChallenge | null>(null);
  const [completed, setCompleted] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const c = getDailyChallenge();
    setChallenge(c);
    setCompleted(isDailyChallengeCompleted());
    setTimeLeft(getTimeUntilMidnight());

    const timer = setInterval(() => setTimeLeft(getTimeUntilMidnight()), 60000);
    return () => clearInterval(timer);
  }, []);

  if (!challenge) return null;

  const { badge, dot } = DIFFICULTY_COLORS[challenge.difficulty];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 via-[#111118] to-indigo-600/5 p-5 flex flex-col gap-4 group hover:border-amber-500/40 transition-all duration-300">
      {/* Glow */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Daily Challenge</p>
            <p className="text-[11px] text-zinc-500 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Resets in {timeLeft}
            </p>
          </div>
        </div>

        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-wide ${badge}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
          {challenge.difficulty}
        </div>
      </div>

      {/* Challenge Info */}
      <div className="flex items-start gap-3">
        <span className="text-3xl mt-0.5">{challenge.gameEmoji}</span>
        <div className="flex flex-col gap-1 min-w-0">
          <p className="text-sm font-bold text-white leading-tight">{challenge.title}</p>
          <p className="text-xs text-zinc-400 leading-relaxed">{challenge.description}</p>
          <p className="text-[11px] text-zinc-500">Game: <span className="text-zinc-300 font-medium">{challenge.gameName}</span></p>
        </div>
      </div>

      {/* Reward + CTA */}
      <div className="flex items-center justify-between pt-2 border-t border-white/5">
        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
          <Coins className="w-3.5 h-3.5" />
          +{challenge.reward} coins reward
        </div>

        {completed ? (
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
            <CheckCircle2 className="w-3.5 h-3.5" /> Completed!
          </div>
        ) : (
          <Link
            href={`/games/${challenge.gameSlug}`}
            className="flex items-center gap-1.5 text-xs font-bold text-white bg-amber-500 hover:bg-amber-400 px-3 py-1.5 rounded-lg transition-all hover:scale-105 active:scale-95"
          >
            <Trophy className="w-3.5 h-3.5" />
            Play Now
            <ArrowRight className="w-3 h-3" />
          </Link>
        )}
      </div>
    </div>
  );
}

