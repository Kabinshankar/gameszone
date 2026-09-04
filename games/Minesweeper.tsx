'use client';

import { useState, useEffect } from 'react';
import { Flag, RotateCcw, Clock, Bomb, Trophy, Sparkles } from 'lucide-react';
import { formatTime } from '@/lib/utils';

type Difficulty = 'beginner' | 'intermediate' | 'expert';

interface Cell {
  r: number;
  c: number;
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborMines: number;
}

const CONFIGS = {
  beginner: { rows: 9, cols: 9, mines: 10 },
  intermediate: { rows: 12, cols: 12, mines: 25 },
  expert: { rows: 14, cols: 14, mines: 40 },
};

export default function Minesweeper() {
  const [difficulty, setDifficulty] = useState<Difficulty>('beginner');
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isWin, setIsWin] = useState(false);
  const [minesLeft, setMinesLeft] = useState(10);
  const [timer, setTimer] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFlagMode, setIsFlagMode] = useState(false);

  useEffect(() => {
    initBoard();
  }, [difficulty]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && !isGameOver && !isWin) {
      interval = setInterval(() => setTimer((t) => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, isGameOver, isWin]);

  const initBoard = () => {
    const { rows, cols, mines } = CONFIGS[difficulty];
    setMinesLeft(mines);
    setTimer(0);
    setIsPlaying(false);
    setIsGameOver(false);
    setIsWin(false);

    // Create empty cells
    let board: Cell[][] = Array(rows).fill(null).map((_, r) =>
      Array(cols).fill(null).map((_, c) => ({
        r,
        c,
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        neighborMines: 0,
      }))
    );

    // Place mines randomly
    let placedMines = 0;
    while (placedMines < mines) {
      const r = Math.floor(Math.random() * rows);
      const c = Math.floor(Math.random() * cols);
      if (!board[r][c].isMine) {
        board[r][c].isMine = true;
        placedMines++;
      }
    }

    // Calculate neighbors
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (!board[r][c].isMine) {
          let count = 0;
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const nr = r + dr;
              const nc = c + dc;
              if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
                if (board[nr][nc].isMine) count++;
              }
            }
          }
          board[r][c].neighborMines = count;
        }
      }
    }

    setGrid(board);
  };

  const handleCellClick = (r: number, c: number) => {
    if (isGameOver || isWin) return;
    const cell = grid[r][c];

    if (isFlagMode) {
      handleCellRightClick(r, c);
      return;
    }

    if (cell.isFlagged || cell.isRevealed) return;

    if (!isPlaying) setIsPlaying(true);

    if (cell.isMine) {
      // Game over! Reveal all mines
      const newGrid = grid.map((row) =>
        row.map((cell) => (cell.isMine ? { ...cell, isRevealed: true } : cell))
      );
      setGrid(newGrid);
      setIsGameOver(true);
      setIsPlaying(false);
      return;
    }

    // Flood fill reveal
    const newGrid = grid.map((row) => row.map((cell) => ({ ...cell })));
    revealCell(newGrid, r, c);
    setGrid(newGrid);

    checkWinCondition(newGrid);
  };

  const revealCell = (board: Cell[][], r: number, c: number) => {
    const { rows, cols } = CONFIGS[difficulty];
    if (r < 0 || r >= rows || c < 0 || c >= cols) return;
    const cell = board[r][c];
    if (cell.isRevealed || cell.isFlagged || cell.isMine) return;

    cell.isRevealed = true;

    if (cell.neighborMines === 0) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr !== 0 || dc !== 0) {
            revealCell(board, r + dr, c + dc);
          }
        }
      }
    }
  };

  const handleCellRightClick = (r: number, c: number, e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (isGameOver || isWin) return;
    const cell = grid[r][c];
    if (cell.isRevealed) return;

    if (!isPlaying) setIsPlaying(true);

    const newGrid = grid.map((row) => row.map((cell) => ({ ...cell })));
    const target = newGrid[r][c];

    target.isFlagged = !target.isFlagged;
    setMinesLeft((prev) => (target.isFlagged ? prev - 1 : prev + 1));
    setGrid(newGrid);
  };

  const checkWinCondition = (board: Cell[][]) => {
    const { rows, cols } = CONFIGS[difficulty];
    let unrevealedNonMines = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (!board[r][c].isMine && !board[r][c].isRevealed) unrevealedNonMines++;
      }
    }

    if (unrevealedNonMines === 0) {
      setIsWin(true);
      setIsPlaying(false);
    }
  };

  const getNumberColor = (num: number) => {
    switch (num) {
      case 1: return 'text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.3)]';
      case 2: return 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]';
      case 3: return 'text-rose-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.3)]';
      case 4: return 'text-purple-400 drop-shadow-[0_0_8px_rgba(192,132,252,0.3)]';
      case 5: return 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]';
      case 6: return 'text-cyan-400';
      case 7: return 'text-zinc-100';
      case 8: return 'text-pink-400';
      default: return 'text-cyan-400';
    }
  };

  const { cols } = CONFIGS[difficulty];

  const cellSizeClass =
    difficulty === 'beginner'
      ? 'w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 text-sm sm:text-base font-black'
      : difficulty === 'intermediate'
      ? 'w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 text-xs sm:text-sm font-black'
      : 'w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-xs sm:text-xs font-black';

  return (
    <div className="flex flex-col items-center gap-5 w-full select-none">
      
      {/* Controls Bar */}
      <div className="w-full max-w-[560px] flex items-center justify-between gap-2.5 bg-white/[0.04] border border-white/10 p-2 sm:p-2.5 rounded-2xl">
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value as Difficulty)}
          className="bg-black/50 border border-white/10 text-xs font-semibold text-zinc-200 rounded-xl px-3 py-2 cursor-pointer hover:border-white/20 transition-colors focus:outline-none"
        >
          <option value="beginner">Beginner (9×9)</option>
          <option value="intermediate">Intermediate (12×12)</option>
          <option value="expert">Expert (14×14)</option>
        </select>

        {/* Mobile / Touch Flag Mode Toggle */}
        <button
          onClick={() => setIsFlagMode(!isFlagMode)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
            isFlagMode
              ? 'bg-amber-500/20 border-amber-500/60 text-amber-400 shadow-sm'
              : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:bg-white/10'
          }`}
        >
          <Flag className={`w-3.5 h-3.5 ${isFlagMode ? 'fill-amber-400' : ''}`} />
          <span>{isFlagMode ? 'Flag Mode' : 'Dig Mode'}</span>
        </button>

        <button
          onClick={initBoard}
          className="p-2 sm:px-3 sm:py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 text-xs font-medium"
          title="Restart Game"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 gap-3 w-full max-w-[560px]">
        <div className="bg-gradient-to-br from-rose-950/40 to-pink-950/30 border border-rose-500/30 p-3 rounded-2xl flex items-center justify-between px-4 shadow-sm">
          <div className="flex items-center gap-2 text-rose-400">
            <Bomb className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Mines Left</span>
          </div>
          <span className="text-xl font-black text-white">{minesLeft}</span>
        </div>

        <div className="bg-gradient-to-br from-cyan-950/40 to-indigo-950/30 border border-cyan-500/30 p-3 rounded-2xl flex items-center justify-between px-4 shadow-sm">
          <div className="flex items-center gap-2 text-cyan-400">
            <Clock className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Time</span>
          </div>
          <span className="text-xl font-black text-white">{formatTime(timer)}</span>
        </div>
      </div>

      {/* Minesweeper Grid */}
      <div className="relative w-full max-w-full p-4 sm:p-6 bg-[#101017] border border-white/10 rounded-3xl shadow-2xl overflow-x-auto flex flex-col items-center box-border">
        <div
          className="grid gap-1.5 mx-auto w-fit select-none"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        >
          {grid.map((row, r) =>
            row.map((cell, c) => {
              // Calculate cell appearance class based on state
              let stateClasses = '';
              if (cell.isRevealed) {
                if (cell.isMine) {
                  stateClasses = 'bg-rose-950/90 border-rose-500/70 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.4)] cursor-default';
                } else {
                  // Revealed empty or numbered: sunken, darker recessed surface
                  stateClasses = 'bg-[#0b0b10] border-white/5 shadow-inner cursor-default';
                }
              } else if (cell.isFlagged) {
                // Flagged: raised amber accented tile
                stateClasses = 'bg-amber-500/15 border-amber-500/50 text-amber-400 shadow-[0_2px_4px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(245,158,11,0.2)] hover:bg-amber-500/25 hover:border-amber-400 cursor-pointer active:scale-95';
              } else {
                // Unrevealed: raised elevated tile with distinct surface and highlight border
                stateClasses = 'bg-[#23232c] hover:bg-[#2c2c38] border-white/15 hover:border-indigo-400/50 shadow-[0_2px_4px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.08)] cursor-pointer active:scale-95';
              }

              return (
                <button
                  key={`${r}-${c}`}
                  onClick={() => handleCellClick(r, c)}
                  onContextMenu={(e) => handleCellRightClick(r, c, e)}
                  className={`${cellSizeClass} aspect-square rounded-[8px] sm:rounded-[9px] border flex items-center justify-center transition-all ${stateClasses}`}
                >
                  {cell.isRevealed ? (
                    cell.isMine ? (
                      <span className="text-base sm:text-lg animate-bounce">💣</span>
                    ) : cell.neighborMines > 0 ? (
                      <span className={getNumberColor(cell.neighborMines)}>
                        {cell.neighborMines}
                      </span>
                    ) : (
                      ''
                    )
                  ) : cell.isFlagged ? (
                    <span className="text-xs sm:text-sm">🚩</span>
                  ) : (
                    ''
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Win / Loss Overlays */}
        {(isGameOver || isWin) && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center gap-3.5 z-20 animate-fade-in p-6 text-center">
            {isWin ? (
              <Trophy className="w-12 h-12 text-amber-400 animate-bounce" />
            ) : (
              <span className="text-4xl animate-pulse">💥</span>
            )}
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              {isWin ? 'Minefield Cleared!' : 'Game Over — Boom!'}
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400">
              {isWin
                ? `You cleared the ${difficulty} board in ${formatTime(timer)}!`
                : 'You triggered a hidden mine. Better luck next time!'}
            </p>
            <button
              onClick={initBoard}
              className="mt-2 px-6 py-2.5 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg transition-all cursor-pointer text-sm"
            >
              Play Again
            </button>
          </div>
        )}
      </div>

      {/* Board Explanation Legend */}
      <div className="w-full max-w-[560px] flex items-center justify-center gap-4 sm:gap-6 pt-3 border-t border-white/5 text-xs text-zinc-400 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-[6px] bg-[#23232c] border border-white/15 shadow-sm inline-block" />
          <span>Hidden</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-[6px] bg-[#0b0b10] border border-white/5 shadow-inner inline-block" />
          <span>Revealed</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-[6px] bg-amber-500/15 border border-amber-500/50 flex items-center justify-center text-[10px]">🚩</span>
          <span>Flagged</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-[6px] bg-[#0b0b10] border border-white/5 flex items-center justify-center font-black text-blue-400 text-xs">1</span>
          <span>Mine Count</span>
        </div>
      </div>

    </div>
  );
}

