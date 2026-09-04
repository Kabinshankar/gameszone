import { hashPassword, encryptData, decryptData } from './crypto';

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
  role: 'admin' | 'user';
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
  encryptedEmail?: string;
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
  { id: 'avatar_star', name: 'Supernova', icon: '⭐', price: 1000, description: 'The brightest star in the Nexvara cosmos.', rarity: 'Legendary', color: '#eab308' },
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
  { id: 'title_rookie', name: 'Casual Gamer', price: 0, description: 'Starting journey on Nexvara.', rarity: 'Common', color: 'text-zinc-400' },
  { id: 'title_master', name: 'Arcade Prodigy', price: 150, description: 'Consistently topping the leaderboards.', rarity: 'Rare', color: 'text-cyan-400' },
  { id: 'title_ludoking', name: 'Ludo Emperor', price: 250, description: 'Undefeated master of the 4 colors.', rarity: 'Rare', color: 'text-amber-400' },
  { id: 'title_speed', name: 'Speed Demon', price: 350, description: 'Blazing reflex and typing records.', rarity: 'Epic', color: 'text-emerald-400' },
  { id: 'title_grandmaster', name: 'Grandmaster', price: 600, description: 'Tactical genius across all board and puzzle games.', rarity: 'Legendary', color: 'text-rose-400' },
  { id: 'title_legend', name: 'Living Legend', price: 1000, description: 'The absolute pinnacle of gaming prowess.', rarity: 'Legendary', color: 'text-yellow-400' },
];

const USER_STORAGE_KEY = 'nexvara_user_profile_v1';
const LEGACY_USER_STORAGE_KEY = 'gameszone_user_profile_v1';
const USERS_DB_KEY = 'nexvara_users_encrypted_db_v1';
const LEGACY_USERS_DB_KEY = 'gameszone_users_encrypted_db_v1';

export function getInitialGuestProfile(): UserProfile {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return {
    id: `guest_${Date.now()}_${randomNum}`,
    username: `Player_${randomNum}`,
    isGuest: true,
    role: 'user',
    avatar: 'avatar_default',
    banner: 'banner_default',
    frame: 'frame_default',
    title: 'title_rookie',
    coins: 100,
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
    const raw = localStorage.getItem(USER_STORAGE_KEY) || localStorage.getItem(LEGACY_USER_STORAGE_KEY);
    if (!raw) {
      const guest = getInitialGuestProfile();
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(guest));
      return guest;
    }
    const profile = JSON.parse(raw);
    return profile;
  } catch {
    return getInitialGuestProfile();
  }
}

// Asynchronously sync profile back to the encrypted database record
export async function syncProfileToEncryptedDb(profile: UserProfile): Promise<void> {
  if (typeof window === 'undefined' || profile.isGuest || !profile.username) return;
  try {
    const raw = localStorage.getItem(USERS_DB_KEY) || localStorage.getItem(LEGACY_USERS_DB_KEY);
    if (!raw) return;
    const db: Record<string, EncryptedUserRecord> = JSON.parse(raw);
    const key = profile.username.trim().toLowerCase();
    if (db[key]) {
      db[key].encryptedProfile = await encryptData(JSON.stringify(profile));
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(db));
    }
  } catch (e) {
    console.error('Error syncing profile to encrypted DB:', e);
  }
}

export function saveProfile(profile: UserProfile): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(profile));
    // Keep legacy key mirrored for backwards safety
    localStorage.setItem(LEGACY_USER_STORAGE_KEY, JSON.stringify(profile));
    
    // If user is a registered account or admin, persist in encrypted database
    if (!profile.isGuest && profile.username) {
      syncProfileToEncryptedDb(profile);
    }
    
    // Dispatch both events so all components update seamlessly
    window.dispatchEvent(new CustomEvent('nexvara_profile_updated', { detail: profile }));
    window.dispatchEvent(new CustomEvent('gameszone_profile_updated', { detail: profile }));
  } catch (e) {
    console.error('Error saving profile:', e);
  }
}

export function logoutAccount(): UserProfile {
  if (typeof window === 'undefined') return getInitialGuestProfile();
  const guest = getInitialGuestProfile();
  saveProfile(guest);
  return guest;
}

// ── DAILY LOGIN REWARDS ────────────────────────────────────────────

export const DAILY_REWARDS = [
  { day: 1, coins: 50, xp: 50, icon: '🪙', label: 'Day 1' },
  { day: 2, coins: 75, xp: 75, icon: '🪙', label: 'Day 2' },
  { day: 3, coins: 100, xp: 100, icon: '💎', label: 'Day 3' },
  { day: 4, coins: 150, xp: 150, icon: '⚡', label: 'Day 4' },
  { day: 5, coins: 200, xp: 200, icon: '🔥', label: 'Day 5' },
  { day: 6, coins: 300, xp: 300, icon: '🌟', label: 'Day 6' },
  { day: 7, coins: 500, xp: 500, icon: '👑', label: 'Day 7 VIP' },
];

export function canClaimDailyReward(lastDateIso?: string): boolean {
  if (!lastDateIso) return true;
  const last = new Date(lastDateIso);
  const now = new Date();
  return (
    now.getFullYear() !== last.getFullYear() ||
    now.getMonth() !== last.getMonth() ||
    now.getDate() !== last.getDate()
  );
}

export function claimDailyReward(): {
  success: boolean;
  message: string;
  coinsEarned?: number;
  xpEarned?: number;
  streak?: number;
} {
  const profile = getCurrentProfile();
  if (!canClaimDailyReward(profile.lastDailyReward)) {
    return { success: false, message: 'You have already claimed today\'s daily bonus! Come back tomorrow.' };
  }

  const last = profile.lastDailyReward ? new Date(profile.lastDailyReward) : null;
  const now = new Date();

  let newStreak = profile.dailyStreak || 0;
  if (last) {
    const diffHours = (now.getTime() - last.getTime()) / (1000 * 60 * 60);
    if (diffHours < 48) {
      newStreak = (newStreak % 7) + 1;
    } else {
      newStreak = 1;
    }
  } else {
    newStreak = 1;
  }

  const rewardIndex = (newStreak - 1) % DAILY_REWARDS.length;
  const reward = DAILY_REWARDS[rewardIndex];

  const newXP = profile.xp + reward.xp;
  const newLevel = calculateLevel(newXP);

  const updated: UserProfile = {
    ...profile,
    coins: profile.coins + reward.coins,
    xp: newXP,
    level: newLevel,
    dailyStreak: newStreak,
    lastDailyReward: now.toISOString(),
  };

  saveProfile(updated);

  return {
    success: true,
    message: `Claimed Day ${newStreak} Reward: +${reward.coins} Coins & +${reward.xp} XP!`,
    coinsEarned: reward.coins,
    xpEarned: reward.xp,
    streak: newStreak,
  };
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

// ── ENCRYPTED USER DATABASE & AUTH ─────────────────────────────────

export interface EncryptedUserRecord {
  username: string;
  passwordHash: string;
  encryptedProfile: string; // AES-GCM Encrypted JSON string of UserProfile
  role: 'admin' | 'user';
  createdAt: string;
}

// Seed the Master Admin Account automatically if database is fresh
export async function ensureAdminAccount(): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    const raw = localStorage.getItem(USERS_DB_KEY);
    const db: Record<string, EncryptedUserRecord> = raw ? JSON.parse(raw) : {};

    if (!db['admin']) {
      const adminPassHash = await hashPassword('admin123'); // Default master admin password

      const allItems = [
        ...SHOP_AVATARS.map((a) => a.id),
        ...SHOP_BANNERS.map((b) => b.id),
        ...SHOP_FRAMES.map((f) => f.id),
        ...SHOP_TITLES.map((t) => t.id),
      ];

      const adminProfile: UserProfile = {
        id: 'usr_admin_master',
        username: 'Admin',
        isGuest: false,
        role: 'admin',
        avatar: 'avatar_king',
        banner: 'banner_gold',
        frame: 'frame_gold_crown',
        title: 'title_legend',
        coins: 99999, // Max Coins for Admin
        xp: 15000,
        level: 50,
        wins: 100,
        totalGames: 105,
        winStreak: 25,
        bestStreak: 25,
        inventory: allItems,
        createdAt: new Date().toISOString(),
        dailyStreak: 30,
      };

      const encrypted = await encryptData(JSON.stringify(adminProfile));

      db['admin'] = {
        username: 'Admin',
        passwordHash: adminPassHash,
        encryptedProfile: encrypted,
        role: 'admin',
        createdAt: new Date().toISOString(),
      };

      localStorage.setItem(USERS_DB_KEY, JSON.stringify(db));
    }
  } catch (e) {
    console.error('Error seeding admin account:', e);
  }
}

export async function registerAccount(
  username: string,
  plainPassword: string,
  avatarId = 'avatar_default',
  email = ''
): Promise<{ success: boolean; message: string }> {
  if (typeof window === 'undefined') return { success: false, message: 'Client only' };

  try {
    await ensureAdminAccount();
    const raw = localStorage.getItem(USERS_DB_KEY);
    const db: Record<string, EncryptedUserRecord> = raw ? JSON.parse(raw) : {};

    const cleanUsername = username.trim();
    const key = cleanUsername.toLowerCase();

    if (db[key]) {
      return { success: false, message: 'Username is already taken. Please choose another.' };
    }

    const passwordHash = await hashPassword(plainPassword);
    const current = getCurrentProfile();

    const newProfile: UserProfile = {
      ...current,
      id: `usr_${Date.now()}`,
      username: cleanUsername,
      isGuest: false,
      role: 'user',
      avatar: avatarId,
      coins: current.coins + 200, // +200 bonus coins on registration!
      encryptedEmail: email ? await encryptData(email) : undefined,
      createdAt: new Date().toISOString(),
    };

    const encryptedProfile = await encryptData(JSON.stringify(newProfile));

    db[key] = {
      username: cleanUsername,
      passwordHash,
      encryptedProfile,
      role: 'user',
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(USERS_DB_KEY, JSON.stringify(db));
    saveProfile(newProfile);

    return { success: true, message: 'Account securely created! +200 Bonus Coins awarded.' };
  } catch (e) {
    console.error('Registration failed:', e);
    return { success: false, message: 'Registration failed due to a system error.' };
  }
}

export async function loginAccount(
  username: string,
  plainPassword: string
): Promise<{ success: boolean; message: string; profile?: UserProfile }> {
  if (typeof window === 'undefined') return { success: false, message: 'Client only' };

  try {
    await ensureAdminAccount();
    const raw = localStorage.getItem(USERS_DB_KEY);
    const db: Record<string, EncryptedUserRecord> = raw ? JSON.parse(raw) : {};

    const key = username.trim().toLowerCase();
    const record = db[key];

    if (!record) {
      return { success: false, message: 'Account not found with this username.' };
    }

    const passwordHash = await hashPassword(plainPassword);
    if (record.passwordHash !== passwordHash) {
      return { success: false, message: 'Incorrect password.' };
    }

    const decryptedRaw = await decryptData(record.encryptedProfile);
    const profile: UserProfile = JSON.parse(decryptedRaw);

    saveProfile(profile);
    return { success: true, message: `Welcome back, ${profile.username}!`, profile };
  } catch (e) {
    console.error('Login error:', e);
    return { success: false, message: 'Login failed.' };
  }
}

// ── ADMIN DATABASE MANAGEMENT ──────────────────────────────────────

export async function getAllUsersDecrypted(): Promise<UserProfile[]> {
  if (typeof window === 'undefined') return [];

  try {
    await ensureAdminAccount();
    const raw = localStorage.getItem(USERS_DB_KEY);
    if (!raw) return [];
    const db: Record<string, EncryptedUserRecord> = JSON.parse(raw);

    const users: UserProfile[] = [];
    for (const key of Object.keys(db)) {
      try {
        const decrypted = await decryptData(db[key].encryptedProfile);
        users.push(JSON.parse(decrypted));
      } catch (err) {
        console.error(`Error decrypting user ${key}:`, err);
      }
    }
    return users;
  } catch {
    return [];
  }
}

export async function adminGrantCoins(username: string, amount: number): Promise<boolean> {
  try {
    const raw = localStorage.getItem(USERS_DB_KEY);
    if (!raw) return false;
    const db: Record<string, EncryptedUserRecord> = JSON.parse(raw);
    const key = username.toLowerCase();

    if (!db[key]) return false;

    const decrypted = await decryptData(db[key].encryptedProfile);
    const profile: UserProfile = JSON.parse(decrypted);
    profile.coins += amount;

    db[key].encryptedProfile = await encryptData(JSON.stringify(profile));
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(db));

    // If currently active user, update live profile
    const current = getCurrentProfile();
    if (current.username.toLowerCase() === key) {
      saveProfile(profile);
    }
    return true;
  } catch {
    return false;
  }
}

export function adminDeleteUser(username: string): boolean {
  try {
    const raw = localStorage.getItem(USERS_DB_KEY);
    if (!raw) return false;
    const db: Record<string, EncryptedUserRecord> = JSON.parse(raw);
    const key = username.toLowerCase();

    if (key === 'admin') return false; // Prevent deleting master admin

    delete db[key];
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(db));
    return true;
  } catch {
    return false;
  }
}
