'use client';

const FAVORITES_KEY = 'gz_favorites';
const RECENTLY_PLAYED_KEY = 'gz_recently_played';
const HIGH_SCORES_KEY = 'gz_high_scores';
const THEME_KEY = 'gz_theme';

function safeLocalStorage() {
  try {
    return typeof window !== 'undefined' ? localStorage : null;
  } catch {
    return null;
  }
}

// Favorites
export function getFavorites(): string[] {
  const ls = safeLocalStorage();
  if (!ls) return [];
  try {
    return JSON.parse(ls.getItem(FAVORITES_KEY) || '[]');
  } catch {
    return [];
  }
}

export function toggleFavorite(slug: string): boolean {
  const ls = safeLocalStorage();
  if (!ls) return false;
  const favorites = getFavorites();
  const idx = favorites.indexOf(slug);
  if (idx > -1) {
    favorites.splice(idx, 1);
  } else {
    favorites.push(slug);
  }
  ls.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  return idx === -1; // returns true if added
}

export function isFavorite(slug: string): boolean {
  return getFavorites().includes(slug);
}

// Recently Played
export interface RecentGame {
  slug: string;
  name: string;
  playedAt: number;
}

export function getRecentlyPlayed(): RecentGame[] {
  const ls = safeLocalStorage();
  if (!ls) return [];
  try {
    return JSON.parse(ls.getItem(RECENTLY_PLAYED_KEY) || '[]');
  } catch {
    return [];
  }
}

export function addToRecentlyPlayed(slug: string, name: string): void {
  const ls = safeLocalStorage();
  if (!ls) return;
  const recent = getRecentlyPlayed().filter((g) => g.slug !== slug);
  recent.unshift({ slug, name, playedAt: Date.now() });
  ls.setItem(RECENTLY_PLAYED_KEY, JSON.stringify(recent.slice(0, 10)));
}

import { getCurrentProfile, saveProfile, calculateLevel, UserProfile } from './profile';
import { checkAndUnlockAchievements, PlayerStats } from './achievements';
import { getDailyChallenge, completeDailyChallenge } from './daily-challenge';

// High Scores / Stats
export interface GameStats {
  highScore?: number;
  bestTime?: number;
  wins?: number;
  losses?: number;
  draws?: number;
  gamesPlayed?: number;
  bestReaction?: number;
  averageReaction?: number;
  reactionCount?: number;
  reactionSum?: number;
}

export interface GameProgressReward {
  coinsEarned: number;
  xpEarned: number;
  isWin: boolean;
  leveledUp: boolean;
  newLevel: number;
  newCoins: number;
  dailyChallengeCompleted?: boolean;
  unlockedAchievements?: string[];
}

export function getStats(slug: string): GameStats {
  const ls = safeLocalStorage();
  if (!ls) return {};
  try {
    const all = JSON.parse(ls.getItem(HIGH_SCORES_KEY) || '{}');
    return all[slug] || {};
  } catch {
    return {};
  }
}

/**
 * Automatically persists game results, updates player profile stats,
 * awards coins/XP, evaluates daily challenges & achievements, and syncs account.
 */
export function recordGameProgress(
  slug: string,
  params: {
    isWin?: boolean;
    isMultiplayer?: boolean;
    score?: number;
    statsUpdate?: Partial<GameStats>;
  }
): GameProgressReward {
  const isWin = !!params.isWin;
  const isMultiplayer = !!params.isMultiplayer;
  const score = params.score ?? 0;

  // 1. Update GameStats in localStorage
  if (params.statsUpdate) {
    const ls = safeLocalStorage();
    if (ls) {
      try {
        const all = JSON.parse(ls.getItem(HIGH_SCORES_KEY) || '{}');
        all[slug] = { ...(all[slug] || {}), ...params.statsUpdate };
        ls.setItem(HIGH_SCORES_KEY, JSON.stringify(all));
      } catch {}
    }
  }

  // 2. Fetch current profile
  const profile = getCurrentProfile();
  const prevLevel = profile.level;

  let baseCoins = isWin ? (isMultiplayer ? 100 : 50) : (score > 100 ? 25 : 10);
  let baseXP = isWin ? (isMultiplayer ? 200 : 100) : (score > 100 ? 50 : 25);

  let dailyChallengeDone = false;
  // 3. Check Daily Challenge
  try {
    const challenge = getDailyChallenge();
    if (challenge.gameSlug === slug && !challenge.completed) {
      const meetsTarget = isWin || (score > 0 && score >= challenge.target);
      if (meetsTarget) {
        const completed = completeDailyChallenge();
        if (completed) {
          dailyChallengeDone = true;
          baseCoins += challenge.reward;
          baseXP += challenge.reward;
        }
      }
    }
  } catch (e) {
    console.error('Error evaluating daily challenge:', e);
  }

  const newWins = isWin ? profile.wins + 1 : profile.wins;
  const newStreak = isWin ? profile.winStreak + 1 : 0;
  const bestStreak = Math.max(profile.bestStreak, newStreak);
  const totalGames = profile.totalGames + 1;

  const newXP = profile.xp + baseXP;
  const newLevel = calculateLevel(newXP);
  const levelUpBonus = newLevel > prevLevel ? (newLevel - prevLevel) * 100 : 0;
  const newCoins = profile.coins + baseCoins + levelUpBonus;

  // 4. Update Profile Object
  const updatedProfile: UserProfile = {
    ...profile,
    coins: newCoins,
    xp: newXP,
    level: newLevel,
    wins: newWins,
    totalGames,
    winStreak: newStreak,
    bestStreak,
  };

  // 5. Check Achievements
  const playerStats: PlayerStats = {
    totalWins: newWins,
    totalGames,
    coins: newCoins,
    streak: newStreak,
    gamesPlayed: [slug],
    dailyChallengesCompleted: profile.dailyStreak,
    profileLevel: newLevel,
    shopItemsBought: profile.inventory.length,
  };

  let unlockedNames: string[] = [];
  try {
    const newlyUnlocked = checkAndUnlockAchievements(playerStats);
    if (newlyUnlocked.length > 0) {
      unlockedNames = newlyUnlocked.map((a) => a.name);
      const achievementBonus = newlyUnlocked.reduce((acc, a) => acc + a.reward, 0);
      updatedProfile.coins += achievementBonus;
    }
  } catch (e) {
    console.error('Error checking achievements:', e);
  }

  // 6. Save Profile (Persists to local and encrypted database)
  saveProfile(updatedProfile);

  const rewardResult: GameProgressReward = {
    coinsEarned: baseCoins + levelUpBonus,
    xpEarned: baseXP,
    isWin,
    leveledUp: newLevel > prevLevel,
    newLevel,
    newCoins: updatedProfile.coins,
    dailyChallengeCompleted: dailyChallengeDone,
    unlockedAchievements: unlockedNames,
  };

  // 7. Dispatch Game Reward Event
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('nexvara_game_reward', { detail: rewardResult }));
    window.dispatchEvent(new CustomEvent('gameszone_trigger_reward', { detail: rewardResult }));
  }

  return rewardResult;
}

export function saveStats(slug: string, stats: Partial<GameStats>): void {
  const ls = safeLocalStorage();
  if (ls) {
    try {
      const all = JSON.parse(ls.getItem(HIGH_SCORES_KEY) || '{}');
      all[slug] = { ...(all[slug] || {}), ...stats };
      ls.setItem(HIGH_SCORES_KEY, JSON.stringify(all));
    } catch {}
  }

  // Determine if this stat update indicates a win or game played
  const isWin = (stats.wins !== undefined && stats.wins > 0);
  const score = stats.highScore || stats.bestTime || 0;

  // Auto record progress and update account
  recordGameProgress(slug, {
    isWin,
    score,
    statsUpdate: stats,
  });
}

// Theme
export function getTheme(): string {
  const ls = safeLocalStorage();
  if (!ls) return 'dark';
  return ls.getItem(THEME_KEY) || 'dark';
}

export function saveTheme(theme: string): void {
  const ls = safeLocalStorage();
  if (!ls) return;
  ls.setItem(THEME_KEY, theme);
}

