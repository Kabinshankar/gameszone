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

export function saveStats(slug: string, stats: Partial<GameStats>): void {
  const ls = safeLocalStorage();
  if (!ls) return;
  try {
    const all = JSON.parse(ls.getItem(HIGH_SCORES_KEY) || '{}');
    all[slug] = { ...(all[slug] || {}), ...stats };
    ls.setItem(HIGH_SCORES_KEY, JSON.stringify(all));
  } catch {}
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
