/**
 * Nexvara — Adaptive AI Opponent Engine
 * Tracks player performance and dynamically adjusts AI difficulty.
 */

export type AIDifficulty = 'easy' | 'medium' | 'hard';

export interface AIStats {
  wins: number;
  losses: number;
  history: Array<'win' | 'loss'>; // last 10 results
  difficulty: AIDifficulty;
}

const AI_STORAGE_KEY = 'nexvara_ai_stats';

/** Load per-game AI stats from localStorage */
export function loadAIStats(gameId: string): AIStats {
  if (typeof window === 'undefined') return defaultStats();
  try {
    const raw = localStorage.getItem(`${AI_STORAGE_KEY}_${gameId}`);
    if (raw) return JSON.parse(raw) as AIStats;
  } catch {}
  return defaultStats();
}

function defaultStats(): AIStats {
  return { wins: 0, losses: 0, history: [], difficulty: 'easy' };
}

/** Save stats and recalculate difficulty based on recent win rate */
export function recordResult(gameId: string, result: 'win' | 'loss'): AIStats {
  if (typeof window === 'undefined') return defaultStats();
  const stats = loadAIStats(gameId);

  stats.history = [...stats.history, result].slice(-10);
  if (result === 'win') stats.wins++;
  else stats.losses++;

  const winRate =
    stats.history.filter((r) => r === 'win').length / Math.max(stats.history.length, 1);

  if (stats.history.length < 3) {
    stats.difficulty = 'easy';
  } else if (winRate >= 0.7) {
    stats.difficulty = 'hard';
  } else if (winRate >= 0.4) {
    stats.difficulty = 'medium';
  } else {
    stats.difficulty = 'easy';
  }

  localStorage.setItem(`${AI_STORAGE_KEY}_${gameId}`, JSON.stringify(stats));
  return stats;
}

export function getCurrentDifficulty(gameId: string): AIDifficulty {
  return loadAIStats(gameId).difficulty;
}

export function getDifficultyLabel(difficulty: AIDifficulty): string {
  return { easy: '🟢 Rookie', medium: '🟡 Veteran', hard: '🔴 Legend' }[difficulty];
}

// ─── Tic Tac Toe AI ────────────────────────────────────────────────────────

type TTTBoard = Array<string | null>;

export function getTicTacToeMove(
  board: TTTBoard,
  aiMark: string,
  difficulty: AIDifficulty
): number {
  const human = aiMark === 'X' ? 'O' : 'X';
  const empty = board.map((v, i) => (v === null ? i : -1)).filter((i) => i !== -1);
  if (empty.length === 0) return -1;

  if (difficulty === 'easy') {
    if (Math.random() < 0.3) {
      const smart = findWinOrBlock(board, aiMark) ?? findWinOrBlock(board, human);
      if (smart !== null) return smart;
    }
    return randomChoice(empty);
  }

  if (difficulty === 'medium') {
    const win = findWinOrBlock(board, aiMark);
    if (win !== null) return win;
    const block = findWinOrBlock(board, human);
    if (block !== null) return block;
    if (board[4] === null) return 4;
    const corners = [0, 2, 6, 8].filter((i) => board[i] === null);
    if (corners.length > 0) return randomChoice(corners);
    return randomChoice(empty);
  }

  let best = -Infinity;
  let bestMove = empty[0];
  for (const move of empty) {
    const nb = [...board];
    nb[move] = aiMark;
    const score = minimax(nb, false, aiMark, human);
    if (score > best) { best = score; bestMove = move; }
  }
  return bestMove;
}

function findWinOrBlock(board: TTTBoard, mark: string): number | null {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
  ];
  for (const [a, b, c] of lines) {
    const cells = [board[a], board[b], board[c]];
    const marks = cells.filter((v) => v === mark).length;
    const nulls = cells.filter((v) => v === null).length;
    if (marks === 2 && nulls === 1) return [a, b, c][cells.indexOf(null)];
  }
  return null;
}

function minimax(
  board: TTTBoard,
  isMax: boolean,
  aiMark: string,
  humanMark: string
): number {
  const winner = checkTTTWinner(board);
  if (winner === aiMark) return 10;
  if (winner === humanMark) return -10;
  if (board.every((c) => c !== null)) return 0;

  const empty = board.map((v, i) => (v === null ? i : -1)).filter((i) => i !== -1);
  if (isMax) {
    let best = -Infinity;
    for (const move of empty) {
      const nb = [...board]; nb[move] = aiMark;
      best = Math.max(best, minimax(nb, false, aiMark, humanMark));
    }
    return best;
  } else {
    let best = Infinity;
    for (const move of empty) {
      const nb = [...board]; nb[move] = humanMark;
      best = Math.min(best, minimax(nb, true, aiMark, humanMark));
    }
    return best;
  }
}

function checkTTTWinner(board: TTTBoard): string | null {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
  ];
  for (const [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a]!;
  }
  return null;
}

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ─── Memory Game AI ────────────────────────────────────────────────────────

/** Delay before AI flips its card: easy=1400ms, medium=700ms, hard=250ms */
export function getMemoryThinkDelay(difficulty: AIDifficulty): number {
  return { easy: 1400, medium: 700, hard: 250 }[difficulty];
}

/** How reliably the AI remembers previously-seen cards: easy=25%, medium=60%, hard=100% */
export function getMemoryRecallRate(difficulty: AIDifficulty): number {
  return { easy: 0.25, medium: 0.6, hard: 1.0 }[difficulty];
}

