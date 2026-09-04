'use client';

import { useState, useEffect } from 'react';
import { Trophy, Lock, Star, ChevronRight } from 'lucide-react';
import {
  ACHIEVEMENTS,
  loadUnlockedAchievements,
  getAchievementProgress,
  RARITY_STYLES,
  type PlayerStats,
} from '@/lib/achievements';
import { getCurrentProfile } from '@/lib/profile';

export default function AchievementsPanel() {
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set());
  const [progress, setProgress] = useState({ total: 0, unlocked: 0, percentage: 0, byChapter: {} as any });
  const [activeChapter, setActiveChapter] = useState(1);

  useEffect(() => {
    const profile = getCurrentProfile();
    const stats: PlayerStats = {
      totalWins: profile.wins ?? 0,
      totalGames: profile.totalGames ?? 0,
      coins: profile.coins ?? 0,
      streak: profile.winStreak ?? 0,
      gamesPlayed: profile.inventory ?? [],
      dailyChallengesCompleted: profile.dailyStreak ?? 0,
      profileLevel: profile.level ?? 1,
      shopItemsBought: (profile.inventory?.length ?? 0),
    };

    const unlocked = loadUnlockedAchievements();
    setUnlockedIds(new Set(unlocked.map((u) => u.id)));
    setProgress(getAchievementProgress(stats));
  }, []);

  const chapters = [...new Set(ACHIEVEMENTS.map((a) => a.chapter))];
  const chapterAchievements = ACHIEVEMENTS.filter((a) => a.chapter === activeChapter);

  return (
    <div className="flex flex-col gap-5">
      {/* Overall Progress */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 to-indigo-600/5 border border-amber-500/20 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-bold text-white">Achievements</span>
          </div>
          <span className="text-xs font-bold text-amber-400">
            {progress.unlocked} / {progress.total}
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-700"
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
        <p className="text-[11px] text-zinc-500">{progress.percentage}% complete — {progress.total - progress.unlocked} remaining</p>
      </div>

      {/* Chapter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {chapters.map((ch) => {
          const chData = progress.byChapter?.[ch];
          const isComplete = chData && chData.unlocked === chData.total;
          return (
            <button
              key={ch}
              onClick={() => setActiveChapter(ch)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                activeChapter === ch
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {isComplete && <Star className="w-3 h-3 text-amber-400" />}
              Ch.{ch}: {progress.byChapter?.[ch]?.name ?? `Chapter ${ch}`}
            </button>
          );
        })}
      </div>

      {/* Achievement Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {chapterAchievements.map((achievement) => {
          const isUnlocked = unlockedIds.has(achievement.id);
          const rarity = RARITY_STYLES[achievement.rarity];

          return (
            <div
              key={achievement.id}
              className={`relative overflow-hidden p-4 rounded-xl border flex items-start gap-3 transition-all ${
                isUnlocked
                  ? `${rarity.bg} ${rarity.border}`
                  : 'bg-white/[0.02] border-white/5 opacity-60'
              }`}
            >
              {/* Icon */}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                isUnlocked ? `${rarity.bg} border ${rarity.border}` : 'bg-white/5 border border-white/10'
              }`}>
                {isUnlocked ? achievement.icon : <Lock className="w-4 h-4 text-zinc-600" />}
              </div>

              {/* Details */}
              <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className={`text-xs font-bold truncate ${isUnlocked ? 'text-white' : 'text-zinc-500'}`}>
                    {achievement.name}
                  </p>
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${rarity.bg} ${rarity.text} shrink-0`}>
                    {rarity.label}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-500 leading-relaxed line-clamp-2">
                  {achievement.description}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-[10px] text-amber-400 font-bold">🪙 +{achievement.reward}</span>
                  {isUnlocked && (
                    <span className="text-[9px] text-emerald-400 ml-auto flex items-center gap-0.5">
                      <ChevronRight className="w-3 h-3" /> Earned
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

