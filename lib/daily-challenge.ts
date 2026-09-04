/**
 * Nexvara — Daily Challenge System
 * Generates a unique daily challenge per game using a date-seeded RNG.
 * The same challenge persists all day regardless of page refresh.
 */

export interface DailyChallenge {
  id: string;
  date: string; // YYYY-MM-DD
  gameSlug: string;
  gameName: string;
  gameEmoji: string;
  title: string;
  description: string;
  reward: number; // bonus coins on completion
  difficulty: 'easy' | 'medium' | 'hard';
  target: number; // e.g. score to beat, pairs to match
  completed: boolean;
}

const STORAGE_KEY = 'nexvara_daily_challenge';

// Seeded deterministic RNG (Mulberry32)
function seededRng(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function dateToSeed(dateStr: string): number {
  return dateStr.split('-').reduce((acc, n) => acc * 100 + parseInt(n), 0);
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

const CHALLENGE_POOL = [
  {
    gameSlug: 'memory',
    gameName: 'Memory Match',
    gameEmoji: '🃏',
    templates: [
      { title: 'Speed Demon', description: 'Match all cards in under 60 seconds!', target: 60, difficulty: 'hard' as const, reward: 120 },
      { title: 'Perfect Memory', description: 'Complete a game with 3 or fewer mismatches.', target: 3, difficulty: 'medium' as const, reward: 80 },
      { title: 'First Timer', description: 'Complete any Memory game to earn bonus coins.', target: 1, difficulty: 'easy' as const, reward: 40 },
    ],
  },
  {
    gameSlug: 'snake',
    gameName: 'Snake',
    gameEmoji: '🐍',
    templates: [
      { title: 'Long Noodle', description: 'Reach a length of 20 in Snake!', target: 20, difficulty: 'hard' as const, reward: 150 },
      { title: 'Double Digits', description: 'Score 10 or more points in Snake.', target: 10, difficulty: 'medium' as const, reward: 70 },
      { title: 'Slither Start', description: 'Play a round of Snake without hitting a wall.', target: 5, difficulty: 'easy' as const, reward: 30 },
    ],
  },
  {
    gameSlug: '2048',
    gameName: '2048',
    gameEmoji: '🔢',
    templates: [
      { title: 'Power of 2', description: 'Reach the 512 tile in 2048!', target: 512, difficulty: 'hard' as const, reward: 140 },
      { title: 'Merge Master', description: 'Reach the 256 tile in 2048.', target: 256, difficulty: 'medium' as const, reward: 75 },
      { title: 'Getting Started', description: 'Reach the 64 tile in 2048.', target: 64, difficulty: 'easy' as const, reward: 35 },
    ],
  },
  {
    gameSlug: 'tic-tac-toe',
    gameName: 'Tic Tac Toe',
    gameEmoji: '❌',
    templates: [
      { title: 'Undefeated', description: 'Win 3 games of Tic Tac Toe without losing.', target: 3, difficulty: 'hard' as const, reward: 100 },
      { title: 'Winning Move', description: 'Win a game of Tic Tac Toe against the AI.', target: 1, difficulty: 'medium' as const, reward: 60 },
      { title: 'Play Ball', description: 'Complete any game of Tic Tac Toe.', target: 1, difficulty: 'easy' as const, reward: 25 },
    ],
  },
  {
    gameSlug: 'ludo',
    gameName: 'Ludo',
    gameEmoji: '🎲',
    templates: [
      { title: 'Home Run', description: 'Get all 4 tokens home in a Ludo game!', target: 4, difficulty: 'hard' as const, reward: 200 },
      { title: 'First Token Home', description: 'Get at least 1 token to the finish in Ludo.', target: 1, difficulty: 'easy' as const, reward: 50 },
    ],
  },
];

export function getDailyChallenge(): DailyChallenge {
  const today = todayStr();

  // Check if today's challenge is cached
  try {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached) as DailyChallenge;
      if (parsed.date === today) return parsed;
    }
  } catch {}

  // Generate today's challenge using seeded RNG
  const rng = seededRng(dateToSeed(today));
  const poolIdx = Math.floor(rng() * CHALLENGE_POOL.length);
  const pool = CHALLENGE_POOL[poolIdx];
  const templateIdx = Math.floor(rng() * pool.templates.length);
  const template = pool.templates[templateIdx];

  const challenge: DailyChallenge = {
    id: `daily_${today}`,
    date: today,
    gameSlug: pool.gameSlug,
    gameName: pool.gameName,
    gameEmoji: pool.gameEmoji,
    title: template.title,
    description: template.description,
    reward: template.reward,
    difficulty: template.difficulty,
    target: template.target,
    completed: false,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(challenge));
  return challenge;
}

export function completeDailyChallenge(): DailyChallenge | null {
  try {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (!cached) return null;
    const challenge = JSON.parse(cached) as DailyChallenge;
    if (challenge.date !== todayStr() || challenge.completed) return null;
    challenge.completed = true;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(challenge));
    return challenge;
  } catch {
    return null;
  }
}

export function isDailyChallengeCompleted(): boolean {
  try {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (!cached) return false;
    const challenge = JSON.parse(cached) as DailyChallenge;
    return challenge.date === todayStr() && challenge.completed;
  } catch {
    return false;
  }
}

