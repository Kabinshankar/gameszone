export interface AvatarItem {
  id: string;
  name: string;
  icon: string;
  price: number;
  description: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  color: string;
}

export interface BannerItem {
  id: string;
  name: string;
  gradient: string;
  price: number;
  description: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
}

export interface FrameItem {
  id: string;
  name: string;
  borderClass: string;
  glowClass: string;
  price: number;
  description: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
}

export interface TitleItem {
  id: string;
  name: string;
  price: number;
  description: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  color: string;
}

export interface UserProfile {
  id: string;
  username: string;
  isGuest: boolean;
  avatar: string;
  banner: string;
  frame: string;
  title: string;
  coins: number;
  xp: number;
  level: number;
  wins: number;
  totalGames: number;
  winStreak: number;
  bestStreak: number;
  inventory: string[];
  createdAt: string;
  lastDailyReward?: string;
  dailyStreak: number;
}

// ── CATALOG ITEMS ──────────────────────────────────────────────────

export const SHOP_AVATARS: AvatarItem[] = [
  { id: 'avatar_default', name: 'Rookie Gamer', icon: '🎮', price: 0, description: 'The starter badge of every champion.', rarity: 'Common', color: '#6366f1' },
  { id: 'avatar_ninja', name: 'Cyber Ninja', icon: '🥷', price: 150, description: 'Silent, stealthy, and strikes with lightning speed.', rarity: 'Rare', color: '#06b6d4' },
  { id: 'avatar_wizard', name: 'Neon Mage', icon: '🧙‍♂️', price: 250, description: 'Master of strategic arcane knowledge.', rarity: 'Rare', color: '#a855f7' },
  { id: 'avatar_robot', name: 'Cyber Mech', icon: '🤖', price: 350, description: 'Calculated precision with 0ms reaction latency.', rarity: 'Epic', color: '#10b981' },
  { id: 'avatar_dragon', name: 'Dragon Knight', icon: '🐲', price: 500, description: 'Unstoppable blazing fury from ancient realms.', rarity: 'Epic', color: '#ef4444' },
  { id: 'avatar_king', name: 'Arcade Monarch', icon: '👑', price: 750, description: 'Reserved strictly for the highest echelon of players.', rarity: 'Legendary', color: '#fbbf24' },
  { id: 'avatar_alien', name: 'Cosmic Pilot', icon: '👽', price: 200, description: 'Interstellar champion from a distant galaxy.', rarity: 'Rare', color: '#38bdf8' },
  { id: 'avatar_tiger', name: 'Cyber Tiger', icon: '🐯', price: 300, description: 'Fierce competitor with relentless focus.', rarity: 'Rare', color: '#f97316' },
  { id: 'avatar_phoenix', name: 'Immortal Phoenix', icon: '🦅', price: 600, description: 'Rises from defeat stronger than ever.', rarity: 'Legendary', color: '#f43f5e' },
  { id: 'avatar_ghost', name: 'Shadow Spectre', icon: '👻', price: 180, description: 'Haunting the leaderboards from the shadows.', rarity: 'Common', color: '#94a3b8' },
  { id: 'avatar_skull', name: 'Cyber Reaper', icon: '💀', price: 400, description: 'Feared in 1v1 online showdowns.', rarity: 'Epic', color: '#e11d48' },
  { id: 'avatar_star', name: 'Supernova', icon: '⭐', price: 1000, description: 'The brightest star in the GamesZone cosmos.', rarity: 'Legendary', color: '#eab308' },
];

export const SHOP_BANNERS: BannerItem[] = [
  { id: 'banner_default', name: 'Midnight Void', gradient: 'from-zinc-900 via-indigo-950 to-zinc-900', price: 0, description: 'Classic sleek dark gaming aesthetic.', rarity: 'Common' },
  { id: 'banner_cyber', name: 'Cyberpunk Neon', gradient: 'from-cyan-900 via-purple-900 to-rose-950', price: 200, description: 'Vibrant neon waves echoing synthwave vibes.', rarity: 'Rare' },
  { id: 'banner_emerald', name: 'Emerald Matrix', gradient: 'from-emerald-950 via-teal-900 to-zinc-900', price: 300, description: 'Digital phosphor streaming matrix.', rarity: 'Rare' },
  { id: 'banner_inferno', name: 'Solar Inferno', gradient: 'from-amber-950 via-red-900 to-rose-950', price: 450, description: 'Molten magma surging with raw energy.', rarity: 'Epic' },
  { id: 'banner_aurora', name: 'Cosmic Aurora', gradient: 'from-indigo-900 via-purple-900 to-pink-900', price: 600, description: 'Celestial northern lights dancing across stars.', rarity: 'Epic' },
  { id: 'banner_gold', name: 'Royal Gold Luxe', gradient: 'from-amber-800 via-yellow-600 to-amber-950', price: 900, description: 'Gilded prestige for ultimate tournament winners.', rarity: 'Legendary' },
];

export const SHOP_FRAMES: FrameItem[] = [
  { id: 'frame_default', name: 'Standard Border', borderClass: 'border-white/20', glowClass: '', price: 0, description: 'Minimalist clean border.', rarity: 'Common' },
  { id: 'frame_neon_cyan', name: 'Neon Pulse Cyan', borderClass: 'border-cyan-400', glowClass: 'shadow-[0_0_15px_rgba(6,182,212,0.6)]', price: 180, description: 'Electric cyan luminous ring.', rarity: 'Rare' },
  { id: 'frame_purple_flame', name: 'Amethyst Fire', borderClass: 'border-purple-500', glowClass: 'shadow-[0_0_18px_rgba(168,85,247,0.7)]', price: 320, description: 'Surging violet aura.', rarity: 'Rare' },
  { id: 'frame_emerald_shield', name: 'Hyper Matrix Glow', borderClass: 'border-emerald-400', glowClass: 'shadow-[0_0_20px_rgba(16,185,129,0.7)]', price: 420, description: 'High-tech emerald shield matrix.', rarity: 'Epic' },
  { id: 'frame_gold_crown', name: 'Crown of Glory', borderClass: 'border-amber-400', glowClass: 'shadow-[0_0_25px_rgba(251,191,36,0.8)] ring-2 ring-amber-300/50', price: 800, description: 'Pure gold radiant champion frame.', rarity: 'Legendary' },
];

export const SHOP_TITLES: TitleItem[] = [
  { id: 'title_rookie', name: 'Casual Gamer', price: 0, description: 'Starting journey on GamesZone.', rarity: 'Common', color: 'text-zinc-400' },
  { id: 'title_master', name: 'Arcade Prodigy', price: 150, description: 'Consistently topping the leaderboards.', rarity: 'Rare', color: 'text-cyan-400' },
  { id: 'title_ludoking', name: 'Ludo Emperor', price: 250, description: 'Undefeated master of the 4 colors.', rarity: 'Rare', color: 'text-amber-400' },
  { id: 'title_speed', name: 'Speed Demon', price: 350, description: 'Blazing reflex and typing records.', rarity: 'Epic', color: 'text-emerald-400' },
  { id: 'title_grandmaster', name: 'Grandmaster', price: 600, description: 'Tactical genius across all board and puzzle games.', rarity: 'Legendary', color: 'text-rose-400' },
  { id: 'title_legend', name: 'Living Legend', price: 1000, description: 'The absolute pinnacle of gaming prowess.', rarity: 'Legendary', color: 'text-yellow-400' },
];

// ── LOCAL STORAGE HELPERS ──────────────────────────────────────────

const USER_STORAGE_KEY = 'gameszone_user_profile_v1';
const USERS_DB_KEY = 'gameszone_users_accounts_v1';

export function getInitialGuestProfile(): UserProfile {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return {
    id: `guest_${Date.now()}_${randomNum}`,
    username: `Player_${randomNum}`,
    isGuest: true,
    avatar: 'avatar_default',
    banner: 'banner_default',
    frame: 'frame_default',
    title: 'title_rookie',
    coins: 100, // Starter Welcome Coins!
    xp: 0,
    level: 1,
    wins: 0,
    totalGames: 0,
    winStreak: 0,
    bestStreak: 0,
    inventory: ['avatar_default', 'banner_default', 'frame_default', 'title_rookie'],
    createdAt: new Date().toISOString(),
    dailyStreak: 1,
    lastDailyReward: new Date().toISOString(),
  };
}

export function getCurrentProfile(): UserProfile {
  if (typeof window === 'undefined') return getInitialGuestProfile();
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) {
      const guest = getInitialGuestProfile();
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(guest));
      return guest;
    }
    return JSON.parse(raw);
  } catch {
    return getInitialGuestProfile();
  }
}

export function saveProfile(profile: UserProfile): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(profile));
    // Dispatch a custom event so all open components / tabs update immediately
    window.dispatchEvent(new CustomEvent('gameszone_profile_updated', { detail: profile }));
  } catch (e) {
    console.error('Error saving profile:', e);
  }
}

// ── REWARD LOGIC ───────────────────────────────────────────────────

export function calculateLevel(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

export function awardMatchReward(isWin: boolean, isMultiplayer = false): {
  coinsEarned: number;
  xpEarned: number;
  leveledUp: boolean;
  newLevel: number;
  newCoins: number;
} {
  const profile = getCurrentProfile();
  const baseCoins = isWin ? (isMultiplayer ? 100 : 50) : (isMultiplayer ? 25 : 10);
  const baseXP = isWin ? (isMultiplayer ? 200 : 100) : (isMultiplayer ? 50 : 25);

  const prevLevel = profile.level;
  const newXP = profile.xp + baseXP;
  const newLevel = calculateLevel(newXP);
  const newCoins = profile.coins + baseCoins;

  const newWins = isWin ? profile.wins + 1 : profile.wins;
  const newStreak = isWin ? profile.winStreak + 1 : 0;
  const bestStreak = Math.max(profile.bestStreak, newStreak);

  // Bonus coins if leveled up!
  const levelUpBonus = newLevel > prevLevel ? (newLevel - prevLevel) * 100 : 0;

  const updated: UserProfile = {
    ...profile,
    coins: newCoins + levelUpBonus,
    xp: newXP,
    level: newLevel,
    wins: newWins,
    totalGames: profile.totalGames + 1,
    winStreak: newStreak,
    bestStreak,
  };

  saveProfile(updated);

  return {
    coinsEarned: baseCoins + levelUpBonus,
    xpEarned: baseXP,
    leveledUp: newLevel > prevLevel,
    newLevel,
    newCoins: updated.coins,
  };
}

// ── SHOP PURCHASE & EQUIP ──────────────────────────────────────────

export function buyShopItem(itemId: string, itemType: 'avatar' | 'banner' | 'frame' | 'title'): { success: boolean; message: string } {
  const profile = getCurrentProfile();
  if (profile.inventory.includes(itemId)) {
    return { success: false, message: 'Item already owned!' };
  }

  let price = 0;
  if (itemType === 'avatar') price = SHOP_AVATARS.find((a) => a.id === itemId)?.price ?? 0;
  else if (itemType === 'banner') price = SHOP_BANNERS.find((b) => b.id === itemId)?.price ?? 0;
  else if (itemType === 'frame') price = SHOP_FRAMES.find((f) => f.id === itemId)?.price ?? 0;
  else if (itemType === 'title') price = SHOP_TITLES.find((t) => t.id === itemId)?.price ?? 0;

  if (profile.coins < price) {
    return { success: false, message: `Not enough coins! You need ${price - profile.coins} more coins.` };
  }

  const updated: UserProfile = {
    ...profile,
    coins: profile.coins - price,
    inventory: [...profile.inventory, itemId],
    // Auto equip upon purchase
    ...(itemType === 'avatar' ? { avatar: itemId } : {}),
    ...(itemType === 'banner' ? { banner: itemId } : {}),
    ...(itemType === 'frame' ? { frame: itemId } : {}),
    ...(itemType === 'title' ? { title: itemId } : {}),
  };

  saveProfile(updated);
  return { success: true, message: 'Item unlocked and equipped!' };
}

export function equipItem(itemId: string, itemType: 'avatar' | 'banner' | 'frame' | 'title'): void {
  const profile = getCurrentProfile();
  if (!profile.inventory.includes(itemId)) return;

  const updated: UserProfile = {
    ...profile,
    ...(itemType === 'avatar' ? { avatar: itemId } : {}),
    ...(itemType === 'banner' ? { banner: itemId } : {}),
    ...(itemType === 'frame' ? { frame: itemId } : {}),
    ...(itemType === 'title' ? { title: itemId } : {}),
  };

  saveProfile(updated);
}

// ── AUTH ACCOUNTS REGISTER / LOGIN ─────────────────────────────────

export function registerAccount(username: string, passwordHash: string, avatarId = 'avatar_default'): { success: boolean; message: string } {
  if (typeof window === 'undefined') return { success: false, message: 'Client only' };

  try {
    const raw = localStorage.getItem(USERS_DB_KEY);
    const db: Record<string, { passwordHash: string; profile: UserProfile }> = raw ? JSON.parse(raw) : {};

    if (db[username.toLowerCase()]) {
      return { success: false, message: 'Username already taken. Please choose another.' };
    }

    const current = getCurrentProfile();
    const newProfile: UserProfile = {
      ...current,
      id: `usr_${Date.now()}`,
      username: username.trim(),
      isGuest: false,
      avatar: avatarId,
      coins: current.coins + 200, // +200 bonus coins for creating an account!
    };

    db[username.toLowerCase()] = { passwordHash, profile: newProfile };
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(db));
    saveProfile(newProfile);

    return { success: true, message: 'Account registered successfully! +200 Bonus Coins awarded.' };
  } catch {
    return { success: false, message: 'Registration failed.' };
  }
}

export function loginAccount(username: string, passwordHash: string): { success: boolean; message: string } {
  if (typeof window === 'undefined') return { success: false, message: 'Client only' };

  try {
    const raw = localStorage.getItem(USERS_DB_KEY);
    const db: Record<string, { passwordHash: string; profile: UserProfile }> = raw ? JSON.parse(raw) : {};

    const user = db[username.toLowerCase()];
    if (!user || user.passwordHash !== passwordHash) {
      return { success: false, message: 'Invalid username or password.' };
    }

    saveProfile(user.profile);
    return { success: true, message: `Welcome back, ${user.profile.username}!` };
  } catch {
    return { success: false, message: 'Login failed.' };
  }
}
