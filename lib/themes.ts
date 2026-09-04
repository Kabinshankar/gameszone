/**
 * Nexvara — Game Themes System
 * Visual skins that change color palettes and aesthetics per-game.
 */

export interface GameTheme {
  id: string;
  name: string;
  emoji: string;
  description: string;
  primaryColor: string;
  accentColor: string;
  bgColor: string;
  cardColor: string;
  textColor: string;
  borderColor: string;
  glowColor: string;
  price: number; // 0 = free, >0 = shop cost in coins
}

export const GAME_THEMES: GameTheme[] = [
  {
    id: 'default',
    name: 'Classic Dark',
    emoji: '🎮',
    description: 'The original Nexvara experience.',
    primaryColor: '#6366f1',
    accentColor: '#818cf8',
    bgColor: '#0d0d14',
    cardColor: '#131318',
    textColor: '#f1f5f9',
    borderColor: 'rgba(255,255,255,0.08)',
    glowColor: 'rgba(99,102,241,0.2)',
    price: 0,
  },
  {
    id: 'space',
    name: 'Space Explorer',
    emoji: '🚀',
    description: 'Journey through the cosmos.',
    primaryColor: '#06b6d4',
    accentColor: '#67e8f9',
    bgColor: '#020617',
    cardColor: '#0c1a2e',
    textColor: '#e0f2fe',
    borderColor: 'rgba(6,182,212,0.15)',
    glowColor: 'rgba(6,182,212,0.25)',
    price: 300,
  },
  {
    id: 'egypt',
    name: 'Ancient Egypt',
    emoji: '🏺',
    description: 'Mysteries of the pharaohs.',
    primaryColor: '#d97706',
    accentColor: '#fbbf24',
    bgColor: '#1a0f00',
    cardColor: '#261500',
    textColor: '#fef3c7',
    borderColor: 'rgba(217,119,6,0.2)',
    glowColor: 'rgba(251,191,36,0.2)',
    price: 300,
  },
  {
    id: 'neon',
    name: 'Neon City',
    emoji: '🌆',
    description: 'Cyberpunk skylines at midnight.',
    primaryColor: '#ec4899',
    accentColor: '#f472b6',
    bgColor: '#0a0015',
    cardColor: '#150025',
    textColor: '#fdf4ff',
    borderColor: 'rgba(236,72,153,0.15)',
    glowColor: 'rgba(236,72,153,0.25)',
    price: 400,
  },
  {
    id: 'forest',
    name: 'Enchanted Forest',
    emoji: '🌲',
    description: 'Serene woodland magic.',
    primaryColor: '#16a34a',
    accentColor: '#4ade80',
    bgColor: '#020f05',
    cardColor: '#071a09',
    textColor: '#dcfce7',
    borderColor: 'rgba(22,163,74,0.15)',
    glowColor: 'rgba(74,222,128,0.2)',
    price: 250,
  },
];

const THEME_STORAGE_KEY = 'nexvara_game_theme';

export function getActiveTheme(): GameTheme {
  if (typeof window === 'undefined') return GAME_THEMES[0];
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored) {
      const found = GAME_THEMES.find((t) => t.id === stored);
      if (found) return found;
    }
  } catch {}
  return GAME_THEMES[0];
}

export function setActiveTheme(themeId: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(THEME_STORAGE_KEY, themeId);
}

export function isThemeOwned(themeId: string, ownedThemes: string[]): boolean {
  const theme = GAME_THEMES.find((t) => t.id === themeId);
  if (!theme) return false;
  if (theme.price === 0) return true;
  return ownedThemes.includes(themeId);
}

