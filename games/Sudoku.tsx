'use client';

import { useState, useEffect, useCallback } from 'react';
import { RotateCcw, Lightbulb, Clock, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { formatTime } from '@/lib/utils';
import { sound } from '@/lib/audio';
import { getStats, saveStats } from '@/lib/storage';

type Difficulty = 'easy' | 'medium' | 'hard';
type Board = number[][];

const SAMPLE_PUZZLES: Record<Difficulty, { initial: Board; solution: Board }> = {
  easy: {
    initial: [
      [5, 3, 0, 0, 7, 0, 0, 0, 0],
      [6, 0, 0, 1, 9, 5, 0, 0, 0],
      [0, 9, 8, 0, 0, 0, 0, 6, 0],
      [8, 0, 0, 0, 6, 0, 0, 0, 3],
      [4, 0, 0, 8, 0, 3, 0, 0, 1],
      [7, 0, 0, 0, 2, 0, 0, 0, 6],
      [0, 6, 0, 0, 0, 0, 2, 8, 0],
      [0, 0, 0, 4, 1, 9, 0, 0, 5],
      [0, 0, 0, 0, 8, 0, 0, 7, 9],
    ],
    solution: [
      [5, 3, 4, 6, 7, 8, 9, 1, 2],
      [6, 7, 2, 1, 9, 5, 3, 4, 8],
      [1, 9, 8, 3, 4, 2, 5, 6, 7],
      [8, 5, 9, 7, 6, 1, 4, 2, 3],
      [4, 2, 6, 8, 5, 3, 7, 9, 1],
      [7, 1, 3, 9, 2, 4, 8, 5, 6],
      [9, 6, 1, 5, 3, 7, 2, 8, 4],
      [2, 8, 7, 4, 1, 9, 6, 3, 5],
      [3, 4, 5, 2, 8, 6, 1, 7, 9],
    ],
  },
  medium: {
    initial: [
      [0, 0, 0, 2, 6, 0, 7, 0, 1],
      [6, 8, 0, 0, 7, 0, 0, 9, 0],
      [1, 9, 0, 0, 0, 4, 5, 0, 0],
      [8, 2, 0, 1, 0, 0, 0, 4, 0],
      [0, 0, 4, 6, 0, 2, 9, 0, 0],
      [0, 5, 0, 0, 0, 3, 0, 2, 8],
      [0, 0, 9, 3, 0, 0, 0, 7, 4],
      [0, 4, 0, 0, 5, 0, 0, 3, 6],
      [7, 0, 3, 0, 1, 8, 0, 0, 0],
    ],
    solution: [
      [4, 3, 5, 2, 6, 9, 7, 8, 1],
      [6, 8, 2, 5, 7, 1, 4, 9, 3],
      [1, 9, 7, 8, 3, 4, 5, 6, 2],
      [8, 2, 6, 1, 9, 5, 3, 4, 7],
      [3, 7, 4, 6, 8, 2, 9, 1, 5],
      [9, 5, 1, 7, 4, 3, 6, 2, 8],
      [5, 1, 9, 3, 2, 6, 8, 7, 4],
      [2, 4, 8, 9, 5, 7, 1, 3, 6],
      [7, 6, 3, 4, 1, 8, 2, 5, 9],
    ],
  },
  hard: {
    initial: [
      [0, 2, 0, 6, 0, 8, 0, 0, 0],
      [5, 8, 0, 0, 0, 9, 7, 0, 0],
      [0, 0, 0, 0, 4, 0, 0, 0, 0],
      [3, 7, 0, 0, 0, 0, 5, 0, 0],
      [6, 0, 0, 0, 0, 0, 0, 0, 4],
      [0, 0, 8, 0, 0, 0, 0, 1, 3],
      [0, 0, 0, 0, 2, 0, 0, 0, 0],
      [0, 0, 9, 8, 0, 0, 0, 3, 6],
      [0, 0, 0, 3, 0, 6, 0, 9, 0],
    ],
    solution: [
      [1, 2, 3, 6, 7, 8, 4, 5, 9],
      [5, 8, 4, 2, 3, 9, 7, 6, 1],
      [9, 6, 7, 1, 4, 5, 3, 2, 8],
      [3, 7, 2, 4, 6, 1, 5, 8, 9],
      [6, 9, 1, 5, 8, 3, 2, 7, 4],
      [4, 5, 8, 9, 2, 7, 6, 1, 3],
      [8, 3, 6, 7, 2, 4, 9, 1, 5],
      [2, 1, 9, 8, 5, 7, 2, 3, 6],
      [7, 4, 5, 3, 1, 6, 8, 9, 2],
    ],
  },
};

export default function Sudoku() {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [board, setBoard] = useState<Board>([]);
  const [initialBoard, setInitialBoard] = useState<Board>([]);
  const [selectedCell, setSelectedCell] = useState<{ r: number; c: number } | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isWin, setIsWin] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const initPuzzle = useCallback(() => {
    const puzzle = SAMPLE_PUZZLES[difficulty];
    setBoard(puzzle.initial.map((row) => [...row]));
    setInitialBoard(puzzle.initial.map((row) => [...row]));
    setSelectedCell({ r: 0, c: 0 });
    setMistakes(0);
    setTimer(0);
    setIsWin(false);
  }, [difficulty]);

  useEffect(() => {
    initPuzzle();
  }, [initPuzzle]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (!isWin) {
      interval = setInterval(() => setTimer((t) => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isWin]);

  const handleNumberInput = useCallback((num: number) => {
    if (!selectedCell || isWin) return;
    const { r, c } = selectedCell;
    if (initialBoard[r]?.[c] !== 0) return; // Read-only clue

    const solution = SAMPLE_PUZZLES[difficulty].solution;
    const newBoard = board.map((row) => [...row]);
    newBoard[r][c] = num;
    setBoard(newBoard);

    if (num !== 0) {
      if (num !== solution[r][c]) {
        if (soundEnabled) sound.playError();
        setMistakes((m) => m + 1);
      } else {
        if (soundEnabled) sound.playPlace();
      }
    } else {
      if (soundEnabled) sound.playBounce();
    }

    // Check win
    let solved = true;
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (newBoard[i][j] !== solution[i][j]) solved = false;
      }
    }
    if (solved) {
      setIsWin(true);
      if (soundEnabled) sound.playWin();
      saveStats('sudoku', { bestTime: timer });
    }
  }, [selectedCell, isWin, initialBoard, difficulty, board, soundEnabled, timer]);

  // Keyboard navigation & number input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isWin) return;

      // Number keys 1-9
      const digitMatch = e.code.match(/Digit([1-9])/) || e.code.match(/Numpad([1-9])/);
      if (digitMatch) {
        e.preventDefault();
        handleNumberInput(parseInt(digitMatch[1], 10));
        return;
      }

      // Erase
      if (e.code === 'Backspace' || e.code === 'Delete' || e.code === 'Digit0' || e.code === 'Numpad0') {
        e.preventDefault();
        handleNumberInput(0);
        return;
      }

      // Arrow navigation
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
        setSelectedCell((prev) => {
          if (!prev) return { r: 0, c: 0 };
          let { r, c } = prev;
          if (e.code === 'ArrowUp') r = Math.max(0, r - 1);
          if (e.code === 'ArrowDown') r = Math.min(8, r + 1);
          if (e.code === 'ArrowLeft') c = Math.max(0, c - 1);
          if (e.code === 'ArrowRight') c = Math.min(8, c + 1);
          return { r, c };
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNumberInput, isWin]);

  const handleHint = () => {
    if (!selectedCell || isWin) return;
    const { r, c } = selectedCell;
    const solution = SAMPLE_PUZZLES[difficulty].solution;
    handleNumberInput(solution[r][c]);
  };

  const selectedValue = selectedCell && board[selectedCell.r] ? board[selectedCell.r][selectedCell.c] : null;

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-lg mx-auto select-none">
      
      {/* Controls */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 bg-white/[0.04] border border-white/10 p-3 rounded-2xl backdrop-blur-sm shadow-md">
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value as Difficulty)}
          className="bg-black/50 border border-white/10 text-xs font-semibold text-gray-200 rounded-xl px-3 py-2 focus:outline-none"
        >
          <option value="easy">Easy Puzzle</option>
          <option value="medium">Medium Puzzle</option>
          <option value="hard">Hard Puzzle</option>
        </select>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const next = !soundEnabled;
              setSoundEnabled(next);
              sound.setEnabled(next);
            }}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 transition-colors"
            title="Toggle Sound"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-gray-500" />}
          </button>

          <button
            onClick={handleHint}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 transition-colors"
            title="Reveal Cell Solution"
          >
            <Lightbulb className="w-4 h-4" /> Hint
          </button>
          <button
            onClick={initPuzzle}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white transition-colors"
            title="Reset Board"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 w-full">
        <div className="bg-white/[0.04] border border-white/10 p-3 rounded-2xl flex items-center justify-between px-4">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Mistakes</span>
          <span className="text-xl font-black text-rose-400 font-mono">{mistakes}</span>
        </div>
        <div className="bg-white/[0.04] border border-white/10 p-3 rounded-2xl flex items-center justify-between px-4">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3 h-3 text-cyan-400" /> Time
          </span>
          <span className="text-xl font-black text-white font-mono">{formatTime(timer)}</span>
        </div>
      </div>

      {/* Sudoku Board with Row/Col/Number Highlight */}
      <div className="relative w-full aspect-square bg-[#111118] border-4 border-purple-900/60 rounded-3xl p-2 shadow-2xl overflow-hidden">
        <div className="grid grid-cols-9 grid-rows-9 w-full h-full border border-white/20 rounded-2xl overflow-hidden shadow-inner">
          {board.map((row, r) =>
            row.map((val, c) => {
              const isInitial = initialBoard[r]?.[c] !== 0;
              const isSelected = selectedCell?.r === r && selectedCell?.c === c;
              const isSameRowCol = selectedCell && (selectedCell.r === r || selectedCell.c === c);
              const isSameSubgrid = selectedCell && Math.floor(selectedCell.r / 3) === Math.floor(r / 3) && Math.floor(selectedCell.c / 3) === Math.floor(c / 3);
              const isSameNumber = selectedValue !== null && selectedValue > 0 && val === selectedValue;
              const isSubgridRight = (c + 1) % 3 === 0 && c < 8;
              const isSubgridBottom = (r + 1) % 3 === 0 && r < 8;
              const solution = SAMPLE_PUZZLES[difficulty].solution;
              const isWrong = val !== 0 && val !== solution[r][c];

              return (
                <button
                  key={`${r}-${c}`}
                  onClick={() => setSelectedCell({ r, c })}
                  aria-label={`Row ${r + 1} Col ${c + 1} ${val || 'empty'}`}
                  className={`flex items-center justify-center font-black text-base sm:text-xl transition-colors ${
                    isSelected
                      ? 'bg-purple-600 text-white z-10 shadow-md ring-2 ring-purple-300'
                      : isWrong
                      ? 'bg-rose-950/80 text-rose-400 font-bold'
                      : isSameNumber
                      ? 'bg-purple-950/70 text-purple-300 font-black'
                      : isSameRowCol || isSameSubgrid
                      ? 'bg-white/[0.06] text-gray-200'
                      : isInitial
                      ? 'bg-white/[0.03] text-white font-bold'
                      : val !== 0
                      ? 'bg-indigo-950/40 text-cyan-300'
                      : 'bg-transparent hover:bg-white/10 text-transparent'
                  } ${isSubgridRight ? 'border-r-2 border-r-purple-500/50' : 'border-r border-r-white/5'} ${
                    isSubgridBottom ? 'border-b-2 border-b-purple-500/50' : 'border-b border-b-white/5'
                  }`}
                >
                  {val > 0 ? val : ''}
                </button>
              );
            })
          )}
        </div>

        {/* Win Overlay */}
        {isWin && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center gap-4 z-20 animate-in fade-in zoom-in-95 duration-200 p-6 text-center">
            <Sparkles className="w-12 h-12 text-cyan-400 animate-bounce" />
            <h3 className="text-3xl font-black text-white">Sudoku Solved!</h3>
            <p className="text-xs sm:text-sm text-gray-300">
              Completed in <span className="text-cyan-400 font-bold">{formatTime(timer)}</span> with <span className="text-rose-400 font-bold">{mistakes} mistakes</span>.
            </p>
            <button
              onClick={initPuzzle}
              className="px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-lg hover:scale-105 active:scale-95 transition-all text-sm mt-1"
            >
              Play Again
            </button>
          </div>
        )}
      </div>

      {/* Number Pad with Keyboard Indicator */}
      <div className="grid grid-cols-5 gap-2 w-full">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            onClick={() => handleNumberInput(num)}
            className="py-3 rounded-xl font-black text-lg bg-white/5 hover:bg-purple-600/30 active:bg-purple-600 border border-white/10 text-white active:scale-95 transition-all shadow-sm"
          >
            {num}
          </button>
        ))}
        <button
          onClick={() => handleNumberInput(0)}
          className="py-3 rounded-xl font-bold text-xs bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-400 active:scale-95 transition-all flex items-center justify-center"
        >
          Erase (Del)
        </button>
      </div>

      <p className="text-xs text-gray-500 text-center">
        💡 Use <strong className="text-gray-400">Arrow Keys</strong> to move • <strong className="text-gray-400">1-9</strong> to fill • <strong className="text-gray-400">Backspace</strong> to erase
      </p>

    </div>
  );
}
