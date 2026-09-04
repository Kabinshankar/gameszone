'use client';

import { useState, useEffect, useCallback } from 'react';
import { RotateCcw, Bot, Users, Trophy, Volume2, VolumeX } from 'lucide-react';
import { sound } from '@/lib/audio';
import { getStats, saveStats } from '@/lib/storage';

const ROWS = 6;
const COLS = 7;
type Player = 1 | 2; // 1: Red (Player), 2: Yellow (AI or P2)
type Board = (Player | null)[][];

export default function ConnectFour() {
  const [board, setBoard] = useState<Board>(() =>
    Array(ROWS).fill(null).map(() => Array(COLS).fill(null))
  );
  const [currentPlayer, setCurrentPlayer] = useState<Player>(1);
  const [mode, setMode] = useState<'ai' | 'pvp'>('ai');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [hoveredCol, setHoveredCol] = useState<number | null>(null);
  const [winner, setWinner] = useState<Player | 'draw' | null>(null);
  const [scores, setScores] = useState({ p1: 0, p2: 0 });
  const [winningCells, setWinningCells] = useState<{ r: number; c: number }[] | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    const stats = getStats('connect-four');
    if (stats.wins !== undefined || stats.losses !== undefined) {
      setScores({
        p1: stats.wins || 0,
        p2: stats.losses || 0,
      });
    }
  }, []);

  const resetGame = () => {
    setBoard(Array(ROWS).fill(null).map(() => Array(COLS).fill(null)));
    setCurrentPlayer(1);
    setWinner(null);
    setWinningCells(null);
    setHoveredCol(null);
  };

  const getLowestRow = (b: Board, c: number) => {
    for (let r = ROWS - 1; r >= 0; r--) {
      if (!b[r][c]) return r;
    }
    return -1;
  };

  const checkWin = (b: Board, r: number, c: number, p: Player) => {
    const directions = [
      [[0, 1], [0, -1]], // Horizontal
      [[1, 0], [-1, 0]], // Vertical
      [[1, 1], [-1, -1]], // Diagonal /
      [[1, -1], [-1, 1]], // Diagonal \
    ];

    for (const dirPair of directions) {
      const cells = [{ r, c }];

      for (const [dr, dc] of dirPair) {
        let nr = r + dr;
        let nc = c + dc;
        while (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && b[nr][nc] === p) {
          cells.push({ r: nr, c: nc });
          nr += dr;
          nc += dc;
        }
      }

      if (cells.length >= 4) return cells;
    }
    return null;
  };

  const handleColumnClick = useCallback((colIndex: number) => {
    // Prevent moves if game won or it's currently AI's turn
    if (winner || (mode === 'ai' && currentPlayer === 2)) return;

    const targetRow = getLowestRow(board, colIndex);
    if (targetRow === -1) {
      if (soundEnabled) sound.playError();
      return; // Column full
    }

    const newBoard = board.map((row) => [...row]);
    newBoard[targetRow][colIndex] = currentPlayer;
    setBoard(newBoard);
    if (soundEnabled) sound.playBounce();

    const winResult = checkWin(newBoard, targetRow, colIndex, currentPlayer);
    if (winResult) {
      setWinner(currentPlayer);
      setWinningCells(winResult);
      if (soundEnabled) (currentPlayer === 1 || mode === 'pvp' ? sound.playWin() : sound.playLose());
      setScores((prev) => {
        const next = {
          ...prev,
          [currentPlayer === 1 ? 'p1' : 'p2']: prev[currentPlayer === 1 ? 'p1' : 'p2'] + 1,
        };
        saveStats('connect-four', { wins: next.p1, losses: next.p2 });
        return next;
      });
    } else if (newBoard.every((row) => row.every((cell) => cell !== null))) {
      setWinner('draw');
      if (soundEnabled) sound.playBounce();
    } else {
      setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
    }
  }, [board, currentPlayer, mode, winner, soundEnabled]);

  // AI Move Engine
  useEffect(() => {
    if (mode === 'ai' && currentPlayer === 2 && !winner) {
      const timer = setTimeout(() => {
        const validCols: number[] = [];
        for (let c = 0; c < COLS; c++) {
          if (!board[0][c]) validCols.push(c);
        }
        if (validCols.length === 0) return;

        let chosenCol = -1;

        if (difficulty !== 'easy') {
          // Check if AI can win
          for (const c of validCols) {
            const r = getLowestRow(board, c);
            if (r !== -1) {
              const temp = board.map((row) => [...row]);
              temp[r][c] = 2;
              if (checkWin(temp, r, c, 2)) {
                chosenCol = c;
                break;
              }
            }
          }

          // Check if AI needs to block player win
          if (chosenCol === -1) {
            for (const c of validCols) {
              const r = getLowestRow(board, c);
              if (r !== -1) {
                const temp = board.map((row) => [...row]);
                temp[r][c] = 1;
                if (checkWin(temp, r, c, 1)) {
                  chosenCol = c;
                  break;
                }
              }
            }
          }
        }

        // Hard AI favors center column (c = 3)
        if (chosenCol === -1 && difficulty === 'hard') {
          if (validCols.includes(3)) chosenCol = 3;
          else if (validCols.includes(2) || validCols.includes(4)) {
            const pref = [2, 4].filter((c) => validCols.includes(c));
            chosenCol = pref[Math.floor(Math.random() * pref.length)];
          }
        }

        if (chosenCol === -1) {
          chosenCol = validCols[Math.floor(Math.random() * validCols.length)];
        }

        // Execute AI drop
        const targetRow = getLowestRow(board, chosenCol);
        if (targetRow !== -1) {
          const newBoard = board.map((row) => [...row]);
          newBoard[targetRow][chosenCol] = 2;
          setBoard(newBoard);
          if (soundEnabled) sound.playBounce();

          const winResult = checkWin(newBoard, targetRow, chosenCol, 2);
          if (winResult) {
            setWinner(2);
            setWinningCells(winResult);
            if (soundEnabled) sound.playLose();
            setScores((prev) => {
              const next = { ...prev, p2: prev.p2 + 1 };
              saveStats('connect-four', { wins: next.p1, losses: next.p2 });
              return next;
            });
          } else if (newBoard.every((row) => row.every((cell) => cell !== null))) {
            setWinner('draw');
          } else {
            setCurrentPlayer(1);
          }
        }
      }, 450);

      return () => clearTimeout(timer);
    }
  }, [currentPlayer, mode, winner, board, difficulty, soundEnabled]);

  // Keyboard 1-7 columns
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const colMap: Record<string, number> = {
        'Digit1': 0, 'Digit2': 1, 'Digit3': 2, 'Digit4': 3,
        'Digit5': 4, 'Digit6': 5, 'Digit7': 6,
      };
      if (colMap[e.code] !== undefined) {
        handleColumnClick(colMap[e.code]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleColumnClick]);

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-lg mx-auto select-none">
      
      {/* Mode & Options Bar */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 bg-white/[0.04] border border-white/10 p-3 rounded-2xl backdrop-blur-sm">
        <div className="flex bg-black/40 p-1 rounded-xl border border-white/10">
          <button
            onClick={() => { setMode('ai'); resetGame(); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === 'ai' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Bot className="w-3.5 h-3.5" /> vs AI
          </button>
          <button
            onClick={() => { setMode('pvp'); resetGame(); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === 'pvp' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> 2 Player
          </button>
        </div>

        {mode === 'ai' && (
          <select
            value={difficulty}
            onChange={(e) => { setDifficulty(e.target.value as any); resetGame(); }}
            className="bg-black/50 border border-white/10 text-gray-200 text-xs font-semibold rounded-xl px-3 py-1.5 focus:outline-none"
          >
            <option value="easy">Easy AI</option>
            <option value="medium">Medium AI</option>
            <option value="hard">Tactical AI</option>
          </select>
        )}

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
            onClick={resetGame}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-colors"
            title="Reset Game"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Scoreboard */}
      <div className="grid grid-cols-2 gap-4 w-full">
        <div className={`p-3 rounded-2xl flex flex-col items-center border transition-all ${
          currentPlayer === 1 && !winner ? 'bg-rose-950/70 border-rose-500/60 ring-1 ring-rose-500/40 shadow-lg shadow-rose-950/50' : 'bg-rose-950/30 border-rose-500/20'
        }`}>
          <span className="text-xs text-rose-300 font-bold uppercase tracking-wider">Red Discs (P1)</span>
          <span className="text-2xl font-black text-white">{scores.p1}</span>
        </div>
        <div className={`p-3 rounded-2xl flex flex-col items-center border transition-all ${
          currentPlayer === 2 && !winner ? 'bg-amber-950/70 border-amber-500/60 ring-1 ring-amber-500/40 shadow-lg shadow-amber-950/50' : 'bg-amber-950/30 border-amber-500/20'
        }`}>
          <span className="text-xs text-amber-300 font-bold uppercase tracking-wider">{mode === 'ai' ? 'Yellow Discs (AI)' : 'Yellow Discs (P2)'}</span>
          <span className="text-2xl font-black text-white">{scores.p2}</span>
        </div>
      </div>

      {/* Turn indicator */}
      <div className="text-center font-bold text-sm min-h-[32px] flex items-center justify-center">
        {winner ? (
          winner === 'draw' ? (
            <span className="text-amber-400 bg-amber-400/10 border border-amber-400/30 px-4 py-1 rounded-full">
              Full Board! It's a Tie
            </span>
          ) : (
            <span className={`px-4 py-1 rounded-full border ${winner === 1 ? 'text-rose-400 bg-rose-500/10 border-rose-500/30' : 'text-amber-400 bg-amber-500/10 border-amber-500/30'}`}>
              🎉 {winner === 1 ? 'Red Player' : mode === 'ai' ? 'AI Opponent' : 'Yellow Player'} Won!
            </span>
          )
        ) : (
          <span className="text-gray-300 flex items-center gap-2">
            Active Turn:{' '}
            <span className={`px-3 py-0.5 rounded-full text-xs font-black ${
              currentPlayer === 1 ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30' : 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
            }`}>
              {currentPlayer === 1 ? 'Red Player' : mode === 'ai' ? 'AI Calculating...' : 'Yellow Player'}
            </span>
          </span>
        )}
      </div>

      {/* Connect Four Physical Board */}
      <div className="relative w-full p-4 bg-gradient-to-b from-blue-900 to-indigo-950 border-4 border-blue-700/60 rounded-3xl shadow-2xl">
        
        {/* Top Drop preview row */}
        <div className="grid grid-cols-7 gap-2 mb-2 px-1">
          {Array.from({ length: COLS }).map((_, c) => {
            const isHovered = hoveredCol === c && !winner && (mode === 'pvp' || currentPlayer === 1);
            return (
              <div key={c} className="w-full aspect-square flex items-center justify-center">
                {isHovered && (
                  <div className={`w-3/4 h-3/4 rounded-full animate-bounce shadow-lg ${
                    currentPlayer === 1 ? 'bg-rose-500 shadow-rose-500/50' : 'bg-amber-400 shadow-amber-400/50'
                  }`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Board grid */}
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: COLS }).map((_, colIdx) => (
            <button
              key={colIdx}
              onClick={() => handleColumnClick(colIdx)}
              onMouseEnter={() => setHoveredCol(colIdx)}
              onMouseLeave={() => setHoveredCol(null)}
              disabled={!!winner || !!board[0][colIdx] || (mode === 'ai' && currentPlayer === 2)}
              aria-label={`Column ${colIdx + 1}`}
              className="flex flex-col gap-2 group/col cursor-pointer disabled:cursor-not-allowed"
            >
              {Array.from({ length: ROWS }).map((_, rowIdx) => {
                const val = board[rowIdx][colIdx];
                const isWinning = winningCells?.some((cell) => cell.r === rowIdx && cell.c === colIdx);

                return (
                  <div
                    key={rowIdx}
                    className={`w-full aspect-square rounded-full flex items-center justify-center transition-all duration-300 ${
                      isWinning
                        ? 'ring-4 ring-white animate-bounce z-10'
                        : val === 1
                        ? 'bg-rose-500 shadow-inner border-2 border-rose-400 shadow-rose-900/60'
                        : val === 2
                        ? 'bg-amber-400 shadow-inner border-2 border-amber-300 shadow-amber-900/60'
                        : 'bg-black/70 group-hover/col:bg-black/50 border border-white/10 shadow-inner'
                    }`}
                  />
                );
              })}
            </button>
          ))}
        </div>

        {/* Win overlay */}
        {winner && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center gap-4 z-20 animate-in fade-in zoom-in-95 duration-200">
            <Trophy className="w-12 h-12 text-amber-400 animate-bounce" />
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              {winner === 'draw' ? 'Draw Game!' : `${winner === 1 ? 'Red' : 'Yellow'} Connects Four!`}
            </h3>
            <p className="text-xs text-gray-400">
              {winner === 'draw' ? 'All columns were filled' : `${winner === 1 ? 'Player 1' : mode === 'ai' ? 'The AI' : 'Player 2'} aligned four discs`}
            </p>
            <button
              onClick={resetGame}
              className="px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:scale-105 active:scale-95 transition-all text-sm mt-2"
            >
              Play Again
            </button>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500 text-center">
        💡 Hover to preview drop or use number keys <strong className="text-gray-400">1 to 7</strong>
      </p>

    </div>
  );
}
