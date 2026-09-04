'use client';

import { useState, useEffect, useCallback } from 'react';
import { RotateCcw, Volume2, VolumeX, Users, Bot, Trophy, Sparkles } from 'lucide-react';
import { saveStats, getStats } from '@/lib/storage';
import { sound } from '@/lib/audio';

type Board = (string | null)[];
type Mode = 'pvp' | 'ai';
type Difficulty = 'easy' | 'medium' | 'hard';

export default function TicTacToe() {
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [mode, setMode] = useState<Mode>('ai');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [soundEnabled, setSoundEnabled] = useState(true);

  const [scores, setScores] = useState({ x: 0, o: 0, draws: 0 });
  const [winner, setWinner] = useState<string | null>(null);
  const [winningLine, setWinningLine] = useState<number[] | null>(null);

  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6],           // Diagonals
  ];

  useEffect(() => {
    const stats = getStats('tic-tac-toe');
    if (stats.wins !== undefined || stats.losses !== undefined || stats.draws !== undefined) {
      setScores({
        x: stats.wins || 0,
        o: stats.losses || 0,
        draws: stats.draws || 0,
      });
    }
  }, []);

  const checkWinner = (b: Board) => {
    for (let i = 0; i < lines.length; i++) {
      const [a, c, d] = lines[i];
      if (b[a] && b[a] === b[c] && b[a] === b[d]) {
        return { winner: b[a], line: lines[i] };
      }
    }
    if (b.every((cell) => cell !== null)) {
      return { winner: 'draw', line: null };
    }
    return null;
  };

  const handleGameOver = useCallback((winResult: string | null, line: number[] | null) => {
    setWinner(winResult);
    setWinningLine(line);

    let newScores = { ...scores };
    if (winResult === 'X') {
      newScores.x += 1;
      if (soundEnabled) sound.playWin();
    } else if (winResult === 'O') {
      newScores.o += 1;
      if (soundEnabled) (mode === 'ai' ? sound.playLose() : sound.playWin());
    } else if (winResult === 'draw') {
      newScores.draws += 1;
      if (soundEnabled) sound.playBounce();
    }
    setScores(newScores);

    saveStats('tic-tac-toe', {
      wins: newScores.x,
      losses: newScores.o,
      draws: newScores.draws,
    });
  }, [scores, soundEnabled, mode]);

  const handleCellClick = (index: number) => {
    // Prevent clicking if cell occupied, game over, or AI is thinking
    if (board[index] || winner || (mode === 'ai' && !isXNext)) return;

    const newBoard = [...board];
    newBoard[index] = isXNext ? 'X' : 'O';
    setBoard(newBoard);
    if (soundEnabled) sound.playPlace();

    const result = checkWinner(newBoard);

    if (result) {
      handleGameOver(result.winner, result.line);
    } else {
      setIsXNext(!isXNext);
    }
  };

  const getAIMove = useCallback((b: Board, diff: Difficulty): number => {
    const emptyIndices = b
      .map((val, idx) => (val === null ? idx : null))
      .filter((val): val is number => val !== null);

    if (emptyIndices.length === 0) return -1;

    if (diff === 'easy') {
      return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    }

    // Check if AI can win immediately
    for (const idx of emptyIndices) {
      const temp = [...b];
      temp[idx] = 'O';
      if (checkWinner(temp)?.winner === 'O') return idx;
    }

    // Check if AI must block player's immediate win
    for (const idx of emptyIndices) {
      const temp = [...b];
      temp[idx] = 'X';
      if (checkWinner(temp)?.winner === 'X') return idx;
    }

    if (diff === 'medium') {
      // 50% tactical, 50% random
      if (Math.random() < 0.4) {
        return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
      }
    }

    // Hard (Strategic: Take center -> Take opposite corner -> Take corner -> Random)
    if (b[4] === null) return 4;

    const corners = [0, 2, 6, 8].filter((i) => b[i] === null);
    if (corners.length > 0) {
      return corners[Math.floor(Math.random() * corners.length)];
    }

    return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
  }, []);

  // AI turn effect with cleanup
  useEffect(() => {
    if (mode === 'ai' && !isXNext && !winner) {
      const timer = setTimeout(() => {
        const aiMoveIndex = getAIMove(board, difficulty);
        if (aiMoveIndex !== -1) {
          const newBoard = [...board];
          newBoard[aiMoveIndex] = 'O';
          setBoard(newBoard);
          if (soundEnabled) sound.playPlace();

          const result = checkWinner(newBoard);
          if (result) {
            handleGameOver(result.winner, result.line);
          } else {
            setIsXNext(true);
          }
        }
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [board, isXNext, mode, winner, difficulty, getAIMove, handleGameOver, soundEnabled]);

  // Keyboard navigation support (1-9 keypad or top row)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const keyMap: Record<string, number> = {
        'Digit1': 0, 'Digit2': 1, 'Digit3': 2,
        'Digit4': 3, 'Digit5': 4, 'Digit6': 5,
        'Digit7': 6, 'Digit8': 7, 'Digit9': 8,
        'Numpad7': 0, 'Numpad8': 1, 'Numpad9': 2,
        'Numpad4': 3, 'Numpad5': 4, 'Numpad6': 5,
        'Numpad1': 6, 'Numpad2': 7, 'Numpad3': 8,
      };
      if (keyMap[e.code] !== undefined) {
        handleCellClick(keyMap[e.code]);
      } else if (e.code === 'KeyR') {
        resetGame();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [board, winner, isXNext, mode]);

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
    setWinningLine(null);
  };

  const resetScores = () => {
    const emptyScores = { x: 0, o: 0, draws: 0 };
    setScores(emptyScores);
    saveStats('tic-tac-toe', { wins: 0, losses: 0, draws: 0 });
    resetGame();
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto select-none">
      
      {/* Controls & Options Bar */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 bg-white/[0.04] border border-white/10 p-3 rounded-2xl backdrop-blur-sm">
        
        {/* Mode Selector */}
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

        {/* AI Difficulty */}
        {mode === 'ai' && (
          <select
            value={difficulty}
            onChange={(e) => { setDifficulty(e.target.value as Difficulty); resetGame(); }}
            className="bg-black/50 border border-white/10 text-gray-200 text-xs font-semibold rounded-xl px-3 py-1.5 focus:outline-none focus:border-purple-500"
          >
            <option value="easy">Easy AI</option>
            <option value="medium">Medium AI</option>
            <option value="hard">Hard AI (Tactical)</option>
          </select>
        )}

        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <button
            onClick={() => {
              const next = !soundEnabled;
              setSoundEnabled(next);
              sound.setEnabled(next);
            }}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 transition-colors"
            title="Toggle Sound"
            aria-label="Toggle Sound"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-gray-500" />}
          </button>

          {/* Reset button */}
          <button
            onClick={resetGame}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 transition-colors"
            title="Reset Board (R)"
            aria-label="Reset Board"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Scoreboard */}
      <div className="grid grid-cols-3 gap-3 w-full">
        <div className={`p-3 rounded-2xl flex flex-col items-center border transition-all ${
          isXNext && !winner ? 'bg-indigo-950/70 border-indigo-500/50 shadow-lg shadow-indigo-500/20 ring-1 ring-indigo-500/40' : 'bg-indigo-950/30 border-indigo-500/20'
        }`}>
          <span className="text-xs text-indigo-300 font-bold uppercase tracking-wider">Player (X)</span>
          <span className="text-2xl font-black text-white">{scores.x}</span>
        </div>
        <div className="bg-slate-900/60 border border-white/10 p-3 rounded-2xl flex flex-col items-center">
          <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Draws</span>
          <span className="text-2xl font-black text-gray-300">{scores.draws}</span>
        </div>
        <div className={`p-3 rounded-2xl flex flex-col items-center border transition-all ${
          !isXNext && !winner ? 'bg-cyan-950/70 border-cyan-500/50 shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-500/40' : 'bg-cyan-950/30 border-cyan-500/20'
        }`}>
          <span className="text-xs text-cyan-300 font-bold uppercase tracking-wider">{mode === 'ai' ? 'AI (O)' : 'Player 2 (O)'}</span>
          <span className="text-2xl font-black text-white">{scores.o}</span>
        </div>
      </div>

      {/* Turn & Status Indicator */}
      <div className="text-center font-bold text-base min-h-[36px] flex items-center justify-center">
        {winner ? (
          winner === 'draw' ? (
            <span className="text-amber-400 flex items-center gap-2 bg-amber-400/10 border border-amber-400/30 px-4 py-1.5 rounded-full">
              🤝 Stalemate! It's a Draw
            </span>
          ) : (
            <span className="text-emerald-400 flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-4 py-1.5 rounded-full">
              <Trophy className="w-4 h-4" /> Winner: Player {winner}!
            </span>
          )
        ) : (
          <span className="text-gray-300 flex items-center gap-2">
            Active Turn:{' '}
            <span className={`px-3 py-1 rounded-full text-xs font-black transition-all ${
              isXNext ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
            }`}>
              {isXNext ? 'Player X' : mode === 'ai' ? 'AI Thinking...' : 'Player O'}
            </span>
          </span>
        )}
      </div>

      {/* Game Board */}
      <div className="relative w-full aspect-square bg-[#111118] border border-white/10 rounded-3xl p-4 shadow-2xl">
        <div className="grid grid-cols-3 gap-3 w-full h-full">
          {board.map((cell, index) => {
            const isWinningCell = winningLine?.includes(index);
            return (
              <button
                key={index}
                onClick={() => handleCellClick(index)}
                disabled={!!cell || !!winner || (mode === 'ai' && !isXNext)}
                aria-label={`Cell ${index + 1}: ${cell || 'empty'}`}
                className={`rounded-2xl font-black text-5xl sm:text-6xl flex items-center justify-center transition-all duration-200 aspect-square ${
                  isWinningCell
                    ? 'bg-gradient-to-tr from-emerald-600 to-teal-400 text-white shadow-xl shadow-emerald-500/50 scale-105 ring-2 ring-emerald-300 animate-pulse'
                    : cell === 'X'
                    ? 'bg-indigo-950/80 text-indigo-400 border border-indigo-500/40 shadow-inner'
                    : cell === 'O'
                    ? 'bg-cyan-950/80 text-cyan-400 border border-cyan-500/40 shadow-inner'
                    : 'bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/20 border border-white/5 active:scale-95 cursor-pointer disabled:cursor-not-allowed'
                }`}
              >
                <span className={cell ? 'transform transition-transform scale-100 animate-in fade-in zoom-in-75 duration-150' : ''}>
                  {cell}
                </span>
              </button>
            );
          })}
        </div>

        {/* End Game Modal Overlay */}
        {winner && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center gap-4 z-20 p-6 text-center animate-in fade-in zoom-in-95 duration-200">
            {winner === 'draw' ? (
              <div className="text-5xl animate-bounce">🤝</div>
            ) : (
              <div className="p-3 bg-emerald-500/20 rounded-2xl border border-emerald-500/40">
                <Sparkles className="w-10 h-10 text-emerald-400 animate-pulse" />
              </div>
            )}
            <div>
              <h3 className="text-2xl sm:text-3xl font-black text-white">
                {winner === 'draw' ? 'Match Drawn!' : `Player ${winner} Triumphs!`}
              </h3>
              <p className="text-xs sm:text-sm text-gray-400 mt-1">
                {winner === 'draw' ? 'A well fought battle of equal minds' : mode === 'ai' && winner === 'O' ? 'AI outplayed you this time!' : 'Flawless line combination!'}
              </p>
            </div>
            <div className="flex gap-3 mt-2">
              <button
                onClick={resetGame}
                className="px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30 hover:scale-105 active:scale-95 transition-all text-sm"
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer helper */}
      <div className="flex items-center justify-between w-full text-xs text-gray-500 px-2">
        <span>💡 Use keys <strong className="text-gray-400">1-9</strong> or numpad to place</span>
        <button
          onClick={resetScores}
          className="hover:text-rose-400 transition-colors underline"
        >
          Reset Scores
        </button>
      </div>

    </div>
  );
}
