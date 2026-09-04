/**
 * Nexvara — Achievement System
 * 20+ milestones organized into story-driven chapters.
 */

export interface Achievement {
  id: string;
  chapter: number;
  chapterName: string;
  name: string;
  description: string;
  icon: string;
  reward: number; // coins
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  condition: (stats: PlayerStats) => boolean;
  unlockedAt?: string; // ISO date string
}

export interface PlayerStats {
  totalWins: number;
  totalGames: number;
  coins: number;
  streak: number; // current win streak
  gamesPlayed: string[]; // game slugs played at least once
  dailyChallengesCompleted: number;
  profileLevel: number;
  shopItemsBought: number;
}

const STORAGE_KEY = 'nexvara_achievements';

export const ACHIEVEMENTS: Achievement[] = [
  // Chapter 1 — First Steps
  { id: 'first_game', chapter: 1, chapterName: 'First Steps', name: 'Into the Arena', description: 'Play your very first game on Nexvara.', icon: '🎮', reward: 25, rarity: 'common', condition: (s) => s.totalGames >= 1 },
  { id: 'first_win', chapter: 1, chapterName: 'First Steps', name: 'Taste of Victory', description: 'Win your first game.', icon: '🏆', reward: 50, rarity: 'common', condition: (s) => s.totalWins >= 1 },
  { id: 'five_games', chapter: 1, chapterName: 'First Steps', name: 'Warming Up', description: 'Play 5 games total.', icon: '🔥', reward: 30, rarity: 'common', condition: (s) => s.totalGames >= 5 },
  { id: 'coin_collector', chapter: 1, chapterName: 'First Steps', name: 'Coin Collector', description: 'Earn 100 coins in total.', icon: '🪙', reward: 20, rarity: 'common', condition: (s) => s.coins >= 100 },

  // Chapter 2 — The Grind
  { id: 'ten_wins', chapter: 2, chapterName: 'The Grind', name: 'On a Roll', description: 'Win 10 games.', icon: '⚡', reward: 75, rarity: 'common', condition: (s) => s.totalWins >= 10 },
  { id: 'hot_streak', chapter: 2, chapterName: 'The Grind', name: 'Hot Streak', description: 'Win 3 games in a row.', icon: '🔥', reward: 100, rarity: 'rare', condition: (s) => s.streak >= 3 },
  { id: 'explorer', chapter: 2, chapterName: 'The Grind', name: 'Explorer', description: 'Play 5 different games.', icon: '🗺️', reward: 80, rarity: 'rare', condition: (s) => s.gamesPlayed.length >= 5 },
  { id: 'daily_devotee', chapter: 2, chapterName: 'The Grind', name: 'Daily Devotee', description: 'Complete your first Daily Challenge.', icon: '📅', reward: 100, rarity: 'rare', condition: (s) => s.dailyChallengesCompleted >= 1 },

  // Chapter 3 — The Arena
  { id: 'fifty_wins', chapter: 3, chapterName: 'The Arena', name: 'Unstoppable', description: 'Win 50 games total.', icon: '💪', reward: 200, rarity: 'rare', condition: (s) => s.totalWins >= 50 },
  { id: 'inferno_streak', chapter: 3, chapterName: 'The Arena', name: 'Inferno Streak', description: 'Win 7 games in a row.', icon: '🌋', reward: 250, rarity: 'epic', condition: (s) => s.streak >= 7 },
  { id: 'polymath', chapter: 3, chapterName: 'The Arena', name: 'Polymath', description: 'Play every game on Nexvara at least once.', icon: '🎓', reward: 300, rarity: 'epic', condition: (s) => s.gamesPlayed.length >= 10 },
  { id: 'rich_gamer', chapter: 3, chapterName: 'The Arena', name: 'Loaded', description: 'Accumulate 1000 coins.', icon: '💰', reward: 150, rarity: 'rare', condition: (s) => s.coins >= 1000 },
  { id: 'shopper', chapter: 3, chapterName: 'The Arena', name: 'High Roller', description: 'Buy 3 items from the shop.', icon: '🛍️', reward: 75, rarity: 'rare', condition: (s) => s.shopItemsBought >= 3 },

  // Chapter 4 — Legends
  { id: 'hundred_wins', chapter: 4, chapterName: 'Legends', name: 'Century Club', description: 'Win 100 games.', icon: '🥇', reward: 500, rarity: 'epic', condition: (s) => s.totalWins >= 100 },
  { id: 'challenge_master', chapter: 4, chapterName: 'Legends', name: 'Challenge Master', description: 'Complete 7 daily challenges.', icon: '🌟', reward: 400, rarity: 'epic', condition: (s) => s.dailyChallengesCompleted >= 7 },
  { id: 'legendary_streak', chapter: 4, chapterName: 'Legends', name: 'Legendary Streak', description: 'Win 15 games in a row.', icon: '⚜️', reward: 750, rarity: 'legendary', condition: (s) => s.streak >= 15 },
  { id: 'treasure_vault', chapter: 4, chapterName: 'Legends', name: 'Treasure Vault', description: 'Accumulate 5000 coins.', icon: '🏛️', reward: 500, rarity: 'legendary', condition: (s) => s.coins >= 5000 },
  { id: 'grand_master', chapter: 4, chapterName: 'Legends', name: 'Grand Master', description: 'Win 500 games total.', icon: '👑', reward: 2000, rarity: 'legendary', condition: (s) => s.totalWins >= 500 },
];

export interface UnlockedAchievement {
  id: string;
  unlockedAt: string;
}

export function loadUnlockedAchievements(): UnlockedAchievement[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function checkAndUnlockAchievements(stats: PlayerStats): Achievement[] {
  if (typeof window === 'undefined') return [];
  const unlocked = loadUnlockedAchievements();
  const unlockedIds = new Set(unlocked.map((u) => u.id));
  const newlyUnlocked: Achievement[] = [];

  for (const achievement of ACHIEVEMENTS) {
    if (unlockedIds.has(achievement.id)) continue;
    if (achievement.condition(stats)) {
      newlyUnlocked.push(achievement);
      unlocked.push({ id: achievement.id, unlockedAt: new Date().toISOString() });
    }
  }

  if (newlyUnlocked.length > 0) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(unlocked));
  }
  return newlyUnlocked;
}

export function getAchievementProgress(stats: PlayerStats): {
  total: number;
  unlocked: number;
  percentage: number;
  byChapter: Record<number, { total: number; unlocked: number; name: string }>;
} {
  const unlockedIds = new Set(loadUnlockedAchievements().map((u) => u.id));
  const byChapter: Record<number, { total: number; unlocked: number; name: string }> = {};

  for (const a of ACHIEVEMENTS) {
    if (!byChapter[a.chapter]) {
      byChapter[a.chapter] = { total: 0, unlocked: 0, name: a.chapterName };
    }
    byChapter[a.chapter].total++;
    if (unlockedIds.has(a.id)) byChapter[a.chapter].unlocked++;
  }

  const total = ACHIEVEMENTS.length;
  const unlocked = unlockedIds.size;
  return { total, unlocked, percentage: Math.round((unlocked / total) * 100), byChapter };
}

export const RARITY_STYLES = {
  common: { bg: 'bg-zinc-500/10', border: 'border-zinc-500/20', text: 'text-zinc-400', label: 'Common' },
  rare: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400', label: 'Rare' },
  epic: { bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-400', label: 'Epic' },
  legendary: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', label: 'Legendary' },
};

