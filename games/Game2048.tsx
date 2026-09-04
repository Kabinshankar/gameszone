'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { RotateCcw, Trophy, Sparkles, Undo2, Volume2, VolumeX } from 'lucide-react';
import { getStats, saveStats } from '@/lib/storage';
import { sound } from '@/lib/audio';

type Board2048 = number[][];

export default function Game2048() {
  const [board, setBoard] = useState<Board2048>(() => createEmptyBoard());
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [keepPlaying, setKeepPlaying] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Undo history state
  const [history, setHistory] = useState<{ board: Board2048; score: number } | null>(null);

  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  function createEmptyBoard(): Board2048 {
    return Array(4).fill(0).map(() => Array(4).fill(0));
  }

  const addRandomTile = useCallback((currentBoard: Board2048): Board2048 => {
    const emptyCells: { r: number; c: number }[] = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (currentBoard[r][c] === 0) emptyCells.push({ r, c });
      }
    }
    if (emptyCells.length === 0) return currentBoard;

    const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const newBoard = currentBoard.map((row) => [...row]);
    newBoard[randomCell.r][randomCell.c] = Math.random() < 0.9 ? 2 : 4;
    return newBoard;
  }, []);

  const initGame = useCallback(() => {
    let b = createEmptyBoard();
    b = addRandomTile(b);
    b = addRandomTile(b);
    setBoard(b);
    setScore(0);
    setGameOver(false);
    setWon(false);
    setKeepPlaying(false);
    setHistory(null);
  }, [addRandomTile]);

  useEffect(() => {
    const stats = getStats('2048');
    if (stats.highScore) setBestScore(stats.highScore);
    initGame();
  }, [initGame]);

  const slideRow = (row: number[]) => {
    let arr = row.filter((val) => val !== 0);
    let gainScore = 0;
    for (let i = 0; i < arr.length - 1; i++) {
      if (arr[i] === arr[i + 1]) {
        arr[i] *= 2;
        gainScore += arr[i];
        arr[i + 1] = 0;
      }
    }
    arr = arr.filter((val) => val !== 0);
    while (arr.length < 4) {
      arr.push(0);
    }
    return { row: arr, scoreGained: gainScore };
  };

  const moveLeft = (b: Board2048) => {
    const newBoard: Board2048 = [];
    let gained = 0;
    for (let r = 0; r < 4; r++) {
      const { row, scoreGained } = slideRow(b[r]);
      newBoard.push(row);
      gained += scoreGained;
    }
    return { newBoard, gained };
  };

  const rotateBoard = (b: Board2048) => {
    const newBoard = createEmptyBoard();
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        newBoard[c][3 - r] = b[r][c];
      }
    }
    return newBoard;
  };

  const checkGameOver = (b: Board2048) => {
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (b[r][c] === 0) return false;
        if (c < 3 && b[r][c] === b[r][c + 1]) return false;
        if (r < 3 && b[r][c] === b[r + 1][c]) return false;
      }
    }
    return true;
  };

  const move = useCallback((direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
    if (gameOver) return;

    let b = board;
    let rotations = 0;
    if (direction === 'UP') rotations = 3;
    if (direction === 'RIGHT') rotations = 2;
    if (direction === 'DOWN') rotations = 1;

    for (let i = 0; i < rotations; i++) {
      b = rotateBoard(b);
    }

    const { newBoard, gained } = moveLeft(b);
    let finalBoard = newBoard;

    for (let i = 0; i < (4 - rotations) % 4; i++) {
      finalBoard = rotateBoard(finalBoard);
    }

    // Check if board changed
    let boardChanged = false;
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (finalBoard[r][c] !== board[r][c]) boardChanged = true;
      }
    }

    if (boardChanged) {
      // Save for Undo
      setHistory({ board: board.map((row) => [...row]), score });

      const withNewTile = addRandomTile(finalBoard);
      setBoard(withNewTile);
      const nextScore = score + gained;
      setScore(nextScore);

      if (soundEnabled) {
        if (gained > 0) sound.playScore();
        else sound.playPlace();
      }

      if (nextScore > bestScore) {
        setBestScore(nextScore);
        saveStats('2048', { highScore: nextScore });
      }

      // Check win 2048
      if (!won && !keepPlaying) {
        for (let r = 0; r < 4; r++) {
          for (let c = 0; c < 4; c++) {
            if (withNewTile[r][c] === 2048) {
              setWon(true);
              if (soundEnabled) sound.playWin();
            }
          }
        }
      }

      // Check game over
      if (checkGameOver(withNewTile)) {
        setGameOver(true);
        if (soundEnabled) sound.playLose();
      }
    }
  }, [board, score, bestScore, gameOver, won, keepPlaying, addRandomTile, soundEnabled]);

  const handleUndo = () => {
    if (!history) return;
    setBoard(history.board);
    setScore(history.score);
    setGameOver(false);
    setHistory(null);
    if (soundEnabled) sound.playBounce();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'KeyW'].includes(e.code)) {
        e.preventDefault();
        move('UP');
      } else if (['ArrowDown', 'KeyS'].includes(e.code)) {
        e.preventDefault();
        move('DOWN');
      } else if (['ArrowLeft', 'KeyA'].includes(e.code)) {
        e.preventDefault();
        move('LEFT');
      } else if (['ArrowRight', 'KeyD'].includes(e.code)) {
        e.preventDefault();
        move('RIGHT');
      } else if (['KeyZ'].includes(e.code) && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleUndo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [move, history]);

  // Touch Swipe Handling
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    if (Math.abs(dx) > 30 || Math.abs(dy) > 30) {
      if (Math.abs(dx) > Math.abs(dy)) {
        move(dx > 0 ? 'RIGHT' : 'LEFT');
      } else {
        move(dy > 0 ? 'DOWN' : 'UP');
      }
    }
  };

  const getTileColor = (val: number) => {
    switch (val) {
      case 2: return 'bg-amber-100 text-slate-900 shadow-sm';
      case 4: return 'bg-amber-200 text-slate-900 shadow-sm';
      case 8: return 'bg-orange-400 text-white shadow-md shadow-orange-400/30';
      case 16: return 'bg-orange-500 text-white shadow-md shadow-orange-500/30';
      case 32: return 'bg-orange-600 text-white shadow-md shadow-orange-600/30';
      case 64: return 'bg-rose-500 text-white shadow-lg shadow-rose-500/40';
      case 128: return 'bg-yellow-400 text-slate-950 font-black shadow-lg shadow-yellow-400/50';
      case 256: return 'bg-yellow-500 text-slate-950 font-black shadow-lg shadow-yellow-500/50';
      case 512: return 'bg-cyan-400 text-slate-950 font-black shadow-lg shadow-cyan-400/50';
      case 1024: return 'bg-purple-500 text-white font-black shadow-lg shadow-purple-500/50';
      case 2048: return 'bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 text-slate-950 font-black shadow-xl shadow-amber-400/70 animate-pulse';
      default: return 'bg-purple-900 text-white';
    }
  };

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-md mx-auto select-none">
      
      {/* Score Header */}
      <div className="flex items-center justify-between w-full">
        <div className="flex gap-2.5">
          <div className="bg-white/[0.04] border border-white/10 px-3.5 py-2 rounded-2xl flex flex-col items-center min-w-[85px] shadow-sm">
            <span className="text-[10px] uppercase font-bold text-gray-400">Score</span>
            <span className="text-xl font-black text-amber-400 font-mono">{score}</span>
          </div>
          <div className="bg-white/[0.04] border border-white/10 px-3.5 py-2 rounded-2xl flex flex-col items-center min-w-[85px] shadow-sm">
            <span className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1">
              <Trophy className="w-3 h-3 text-amber-400" /> Best
            </span>
            <span className="text-xl font-black text-white font-mono">{bestScore}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Sound toggle */}
          <button
            onClick={() => {
              const next = !soundEnabled;
              setSoundEnabled(next);
              sound.setEnabled(next);
            }}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 transition-colors"
            title="Toggle Sound"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-gray-500" />}
          </button>

          {/* Undo */}
          <button
            onClick={handleUndo}
            disabled={!history}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Undo Last Move (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>

          {/* Reset */}
          <button
            onClick={initGame}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl font-bold bg-white/10 hover:bg-white/20 border border-white/10 text-white text-xs transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
        </div>
      </div>

      {/* 2048 Grid with touch swipe listener */}
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative w-full aspect-square bg-[#12121a] border-2 border-amber-500/40 rounded-3xl p-3 shadow-2xl touch-none"
      >
        <div className="grid grid-cols-4 grid-rows-4 gap-2.5 w-full h-full">
          {board.map((row, r) =>
            row.map((cell, c) => (
              <div
                key={`${r}-${c}`}
                className={`rounded-2xl font-black text-xl sm:text-2xl flex items-center justify-center transition-all duration-100 ${
                  cell === 0 ? 'bg-white/[0.03]' : `${getTileColor(cell)} transform scale-100 animate-in zoom-in-75 duration-100`
                }`}
              >
                {cell > 0 ? cell : ''}
              </div>
            ))
          )}
        </div>

        {/* Win / Over Overlay */}
        {(won && !keepPlaying) && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center gap-4 z-20 animate-in fade-in zoom-in-95 duration-200">
            <Sparkles className="w-12 h-12 text-amber-400 animate-bounce" />
            <h3 className="text-3xl font-black text-amber-400">You Reached 2048!</h3>
            <p className="text-xs text-gray-300">Incredible puzzle mastery.</p>
            <div className="flex gap-3 mt-1">
              <button
                onClick={() => setKeepPlaying(true)}
                className="px-5 py-2.5 rounded-xl font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 text-xs shadow-lg"
              >
                Keep Going
              </button>
              <button
                onClick={initGame}
                className="px-5 py-2.5 rounded-xl font-bold bg-white/10 text-white text-xs hover:bg-white/20"
              >
                New Game
              </button>
            </div>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center gap-4 z-20 animate-in fade-in zoom-in-95 duration-200">
            <span className="text-4xl">💀</span>
            <h3 className="text-2xl font-black text-white">Board Locked!</h3>
            <p className="text-xs text-gray-400">No matching adjacent tiles remain.</p>
            <div className="flex gap-2.5 mt-1">
              {history && (
                <button
                  onClick={handleUndo}
                  className="px-5 py-2.5 rounded-xl font-bold bg-white/10 text-white text-xs hover:bg-white/20 flex items-center gap-1.5"
                >
                  <Undo2 className="w-3.5 h-3.5" /> Undo Move
                </button>
              )}
              <button
                onClick={initGame}
                className="px-5 py-2.5 rounded-xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg text-xs"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500 text-center">
        Use <strong className="text-gray-400">Arrow Keys</strong> / <strong className="text-gray-400">WASD</strong> on desktop or <strong className="text-gray-400">Swipe</strong> on mobile
      </p>

    </div>
  );
}
