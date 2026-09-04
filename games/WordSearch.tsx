'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { RotateCcw, Volume2, VolumeX, Trophy, Sparkles, HelpCircle } from 'lucide-react';
import { saveStats, getStats } from '@/lib/storage';
import { sound } from '@/lib/audio';

// ── Word Categories ────────────────────────────────────────────────
const WORD_POOLS: Record<string, string[]> = {
  Animals: ['TIGER', 'EAGLE', 'SHARK', 'PANDA', 'HORSE', 'WHALE', 'SNAKE', 'MOUSE', 'ZEBRA', 'CAMEL', 'BISON', 'CRANE', 'OTTER', 'RAVEN', 'VIPER'],
  Countries: ['JAPAN', 'CHINA', 'INDIA', 'BRAZIL', 'SPAIN', 'FRANCE', 'ITALY', 'EGYPT', 'CHILE', 'NEPAL', 'KOREA', 'PERU', 'CUBA', 'QATAR', 'KENYA'],
  Sports: ['RUGBY', 'GOLF', 'CHESS', 'DIVE', 'SWIM', 'POLO', 'SURF', 'JUDO', 'RACE', 'BOWL', 'DART', 'FENCING', 'BOXING', 'ROWING', 'HOCKEY'],
  Food: ['BREAD', 'PASTA', 'STEAK', 'MANGO', 'PEACH', 'GRAPE', 'OLIVE', 'LEMON', 'MELON', 'BERRY', 'CREAM', 'TOAST', 'SALAD', 'CURRY', 'TACOS'],
  Science: ['ATOM', 'CELL', 'GENE', 'ORBIT', 'LASER', 'PRISM', 'QUARK', 'FORCE', 'WAVE', 'MASS', 'SOLID', 'VAPOR', 'LIGHT', 'SOLAR', 'LUNAR'],
};

type Difficulty = 'easy' | 'medium' | 'hard';

const DIFFICULTY_CONFIG: Record<Difficulty, { gridSize: number; wordCount: number }> = {
  easy: { gridSize: 8, wordCount: 6 },
  medium: { gridSize: 12, wordCount: 10 },
  hard: { gridSize: 14, wordCount: 12 },
};

const DIRECTIONS = [
  [0, 1],   // right
  [1, 0],   // down
  [0, -1],  // left
  [-1, 0],  // up
  [1, 1],   // down-right
  [1, -1],  // down-left
  [-1, 1],  // up-right
  [-1, -1], // up-left
];

const FOUND_COLORS = [
  'rgba(6,182,212,0.35)',   // cyan
  'rgba(168,85,247,0.35)',  // purple
  'rgba(34,197,94,0.35)',   // green
  'rgba(249,115,22,0.35)',  // orange
  'rgba(236,72,153,0.35)',  // pink
  'rgba(59,130,246,0.35)',  // blue
  'rgba(234,179,8,0.35)',   // yellow
  'rgba(239,68,68,0.35)',   // red
  'rgba(20,184,166,0.35)',  // teal
  'rgba(139,92,246,0.35)',  // violet
  'rgba(132,204,22,0.35)',  // lime
  'rgba(244,63,94,0.35)',   // rose
];

interface PlacedWord {
  word: string;
  cells: { r: number; c: number }[];
}

// ── Grid Generation ────────────────────────────────────────────────
function generateGrid(size: number, words: string[]): { grid: string[][]; placed: PlacedWord[] } {
  const grid: string[][] = Array.from({ length: size }, () => Array(size).fill(''));
  const placed: PlacedWord[] = [];

  // Sort words by length descending for better placement
  const sortedWords = [...words].sort((a, b) => b.length - a.length);

  for (const word of sortedWords) {
    let didPlace = false;
    const shuffledDirs = [...DIRECTIONS].sort(() => Math.random() - 0.5);

    for (let attempt = 0; attempt < 100; attempt++) {
      const dir = shuffledDirs[attempt % shuffledDirs.length];
      const startR = Math.floor(Math.random() * size);
      const startC = Math.floor(Math.random() * size);

      const cells: { r: number; c: number }[] = [];
      let canPlace = true;

      for (let i = 0; i < word.length; i++) {
        const r = startR + dir[0] * i;
        const c = startC + dir[1] * i;

        if (r < 0 || r >= size || c < 0 || c >= size) {
          canPlace = false;
          break;
        }
        if (grid[r][c] !== '' && grid[r][c] !== word[i]) {
          canPlace = false;
          break;
        }
        cells.push({ r, c });
      }

      if (canPlace) {
        cells.forEach((cell, i) => {
          grid[cell.r][cell.c] = word[i];
        });
        placed.push({ word, cells });
        didPlace = true;
        break;
      }
    }

    if (!didPlace) {
      // Skip word if can't place after 100 attempts
    }
  }

  // Fill empty cells with random letters
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === '') {
        grid[r][c] = letters[Math.floor(Math.random() * letters.length)];
      }
    }
  }

  return { grid, placed };
}

function selectWords(category: string, count: number): string[] {
  const pool = WORD_POOLS[category];
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export default function WordSearch() {
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [category, setCategory] = useState<string>('Animals');
  const [grid, setGrid] = useState<string[][]>([]);
  const [placedWords, setPlacedWords] = useState<PlacedWord[]>([]);
  const [foundWords, setFoundWords] = useState<Set<string>>(new Set());
  const [selectedCells, setSelectedCells] = useState<{ r: number; c: number }[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [bestTime, setBestTime] = useState<number | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [hintedCells, setHintedCells] = useState<Set<string>>(new Set());
  const [gamesWon, setGamesWon] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stats = getStats('word-search');
    if (stats.bestTime) setBestTime(stats.bestTime);
    if (stats.wins) setGamesWon(stats.wins);
  }, []);

  // ── Timer ────────────────────────────────────────────────────────
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  // ── New Game ─────────────────────────────────────────────────────
  const startNewGame = useCallback(() => {
    const config = DIFFICULTY_CONFIG[difficulty];
    const words = selectWords(category, config.wordCount);
    const { grid: newGrid, placed } = generateGrid(config.gridSize, words);

    setGrid(newGrid);
    setPlacedWords(placed);
    setFoundWords(new Set());
    setSelectedCells([]);
    setTimer(0);
    setIsRunning(true);
    setHintsUsed(0);
    setHintedCells(new Set());
  }, [difficulty, category]);

  useEffect(() => {
    startNewGame();
  }, [startNewGame]);

  // ── Win Check ────────────────────────────────────────────────────
  useEffect(() => {
    if (placedWords.length > 0 && foundWords.size === placedWords.length) {
      setIsRunning(false);
      const newWins = gamesWon + 1;
      setGamesWon(newWins);

      const stats = getStats('word-search');
      const best = bestTime === null ? timer : Math.min(bestTime, timer);
      setBestTime(best);
      saveStats('word-search', { bestTime: best, wins: newWins });
      if (soundEnabled) sound.playWin();
    }
  }, [foundWords, placedWords, timer, bestTime, gamesWon, soundEnabled]);

  // ── Cell Selection ───────────────────────────────────────────────
  const cellKey = (r: number, c: number) => `${r},${c}`;

  const getCellFromEvent = (e: React.TouchEvent | React.MouseEvent): { r: number; c: number } | null => {
    const gridEl = gridRef.current;
    if (!gridEl) return null;
    const rect = gridEl.getBoundingClientRect();

    let clientX: number, clientY: number;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const size = grid.length;
    const cellW = rect.width / size;
    const cellH = rect.height / size;
    const c = Math.floor((clientX - rect.left) / cellW);
    const r = Math.floor((clientY - rect.top) / cellH);

    if (r >= 0 && r < size && c >= 0 && c < size) return { r, c };
    return null;
  };

  const handlePointerDown = (r: number, c: number) => {
    if (!isRunning) return;
    setIsSelecting(true);
    setSelectedCells([{ r, c }]);
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isSelecting || !isRunning) return;
    e.preventDefault();
    const cell = getCellFromEvent(e);
    if (!cell) return;

    const start = selectedCells[0];
    if (!start) return;

    // Build line from start to current cell
    const dr = cell.r - start.r;
    const dc = cell.c - start.c;

    // Only allow straight lines (horizontal, vertical, diagonal)
    if (dr !== 0 && dc !== 0 && Math.abs(dr) !== Math.abs(dc)) return;

    const steps = Math.max(Math.abs(dr), Math.abs(dc));
    if (steps === 0) {
      setSelectedCells([start]);
      return;
    }

    const stepR = dr === 0 ? 0 : dr / Math.abs(dr);
    const stepC = dc === 0 ? 0 : dc / Math.abs(dc);

    const newSelection: { r: number; c: number }[] = [];
    for (let i = 0; i <= steps; i++) {
      newSelection.push({ r: start.r + stepR * i, c: start.c + stepC * i });
    }
    setSelectedCells(newSelection);
  };

  const handlePointerUp = () => {
    if (!isSelecting || !isRunning) return;
    setIsSelecting(false);

    // Check if selection matches a placed word
    const selectedStr = selectedCells.map((c) => grid[c.r][c.c]).join('');
    const reversedStr = [...selectedStr].reverse().join('');

    for (const pw of placedWords) {
      if (foundWords.has(pw.word)) continue;
      const wordStr = pw.cells.map((c) => grid[c.r][c.c]).join('');
      if (selectedStr === wordStr || reversedStr === wordStr) {
        // Verify cells match
        const cellsMatch = pw.cells.every((pc) =>
          selectedCells.some((sc) => sc.r === pc.r && sc.c === pc.c)
        ) || pw.cells.every((pc) =>
          [...selectedCells].reverse().some((sc, i) => sc.r === pw.cells[i]?.r && sc.c === pw.cells[i]?.c)
        );

        if (cellsMatch || selectedStr === pw.word || reversedStr === pw.word) {
          setFoundWords((prev) => new Set([...prev, pw.word]));
          if (soundEnabled) sound.playScore();
          setSelectedCells([]);
          return;
        }
      }
    }

    if (soundEnabled && selectedCells.length > 1) sound.playBounce();
    setSelectedCells([]);
  };

  // ── Hint ─────────────────────────────────────────────────────────
  const useHint = () => {
    const unfound = placedWords.filter((pw) => !foundWords.has(pw.word));
    if (unfound.length === 0) return;

    const word = unfound[Math.floor(Math.random() * unfound.length)];
    const firstCell = word.cells[0];
    const lastCell = word.cells[word.cells.length - 1];

    setHintedCells((prev) => {
      const next = new Set(prev);
      next.add(cellKey(firstCell.r, firstCell.c));
      next.add(cellKey(lastCell.r, lastCell.c));
      return next;
    });
    setHintsUsed((h) => h + 1);
    if (soundEnabled) sound.playPop();
  };

  // ── Formatting ───────────────────────────────────────────────────
  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  // ── Build cell highlight map ─────────────────────────────────────
  const foundCellColors = new Map<string, string>();
  placedWords.forEach((pw, idx) => {
    if (foundWords.has(pw.word)) {
      const color = FOUND_COLORS[idx % FOUND_COLORS.length];
      pw.cells.forEach((c) => {
        foundCellColors.set(cellKey(c.r, c.c), color);
      });
    }
  });

  const selectedCellSet = new Set(selectedCells.map((c) => cellKey(c.r, c.c)));
  const allFound = placedWords.length > 0 && foundWords.size === placedWords.length;
  const gridSize = grid.length;
  const cellSizeClass = gridSize <= 8 ? 'w-9 h-9 sm:w-10 sm:h-10 text-sm' : gridSize <= 12 ? 'w-7 h-7 sm:w-8 sm:h-8 text-xs' : 'w-6 h-6 sm:w-7 sm:h-7 text-[10px]';

  return (
    <div className="flex flex-col items-center gap-4 w-full select-none">
      {/* Controls */}
      <div className="flex items-center gap-2 flex-wrap justify-center">
        <button
          onClick={() => setSoundEnabled((p) => { sound.setEnabled(!p); return !p; })}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-white/10 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-all"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value as Difficulty)}
          className="px-3 py-2 rounded-xl text-xs font-bold border border-white/10 bg-zinc-800 text-white outline-none cursor-pointer"
        >
          <option value="easy">Easy (8×8)</option>
          <option value="medium">Medium (12×12)</option>
          <option value="hard">Hard (14×14)</option>
        </select>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-3 py-2 rounded-xl text-xs font-bold border border-white/10 bg-zinc-800 text-white outline-none cursor-pointer"
        >
          {Object.keys(WORD_POOLS).map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <button
          onClick={useHint}
          disabled={allFound}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 transition-all disabled:opacity-40"
        >
          <HelpCircle className="w-4 h-4" /> Hint
        </button>

        <button
          onClick={startNewGame}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 hover:text-cyan-200 transition-all"
        >
          <RotateCcw className="w-4 h-4" /> New Game
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 w-full max-w-md">
        {[
          { label: 'Found', value: `${foundWords.size}/${placedWords.length}`, icon: '🔍' },
          { label: 'Time', value: formatTime(timer), icon: '⏱️' },
          { label: 'Hints', value: hintsUsed, icon: '💡' },
          { label: 'Best', value: bestTime !== null ? formatTime(bestTime) : '--:--', icon: '🏆' },
        ].map((stat) => (
          <div key={stat.label} className="bg-zinc-800/60 border border-white/5 rounded-xl p-2 text-center">
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider">{stat.icon} {stat.label}</div>
            <div className="text-base sm:text-lg font-black text-white">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Category Label */}
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-purple-400" />
        <span className="text-sm font-bold text-purple-300">{category}</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 items-start justify-center w-full">
        {/* Grid */}
        <div
          ref={gridRef}
          className="relative rounded-xl border-2 border-zinc-700/60 overflow-hidden mx-auto touch-none"
          style={{
            background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
            boxShadow: '0 0 30px rgba(6,182,212,0.06)',
          }}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onMouseLeave={() => { if (isSelecting) handlePointerUp(); }}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
        >
          {grid.map((row, ri) => (
            <div key={ri} className="flex">
              {row.map((letter, ci) => {
                const key = cellKey(ri, ci);
                const isSelected = selectedCellSet.has(key);
                const foundColor = foundCellColors.get(key);
                const isHinted = hintedCells.has(key);

                return (
                  <div
                    key={ci}
                    className={`${cellSizeClass} flex items-center justify-center font-black cursor-pointer transition-all duration-100 ${
                      isSelected
                        ? 'bg-cyan-500/40 text-white scale-110'
                        : foundColor
                        ? 'text-white'
                        : isHinted
                        ? 'text-amber-300'
                        : 'text-zinc-300 hover:bg-white/5'
                    }`}
                    style={{
                      background: isSelected
                        ? 'rgba(6,182,212,0.4)'
                        : foundColor || (isHinted ? 'rgba(234,179,8,0.15)' : 'transparent'),
                      borderRadius: isSelected ? 4 : 0,
                    }}
                    onMouseDown={() => handlePointerDown(ri, ci)}
                    onTouchStart={() => handlePointerDown(ri, ci)}
                  >
                    {letter}
                  </div>
                );
              })}
            </div>
          ))}

          {/* Win Overlay */}
          {allFound && (
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center gap-3 z-10">
              <div className="text-4xl">🎉</div>
              <div className="text-white font-black text-xl">ALL FOUND!</div>
              <div className="text-zinc-400 text-sm">
                Time: <span className="text-white font-bold">{formatTime(timer)}</span>
                {hintsUsed > 0 && <> • Hints: <span className="text-amber-300 font-bold">{hintsUsed}</span></>}
              </div>
              {bestTime !== null && timer <= bestTime && (
                <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold">
                  <Trophy className="w-4 h-4" /> New Best Time!
                </div>
              )}
              <button
                onClick={startNewGame}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold text-sm hover:scale-105 active:scale-95 transition-transform shadow-lg shadow-cyan-500/30 mt-1"
              >
                Play Again
              </button>
            </div>
          )}
        </div>

        {/* Word List */}
        <div className="bg-zinc-800/40 border border-white/5 rounded-xl p-3 min-w-[160px]">
          <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-2">Words to Find</div>
          <div className="flex flex-col gap-1">
            {placedWords.map((pw, i) => {
              const isFound = foundWords.has(pw.word);
              return (
                <div
                  key={i}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    isFound
                      ? 'bg-emerald-500/15 text-emerald-400 line-through opacity-60'
                      : 'bg-white/5 text-zinc-300'
                  }`}
                >
                  {pw.word}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="text-[10px] text-zinc-500 text-center max-w-sm">
        Click and drag to select letters in a line. Words can be horizontal, vertical, or diagonal — forwards or backwards.
      </div>
    </div>
  );
}
