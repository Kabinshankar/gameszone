'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { RotateCcw, Volume2, VolumeX, Trophy, Pause, Play, ArrowDown, ArrowLeft, ArrowRight, RotateCw } from 'lucide-react';
import { saveStats, getStats } from '@/lib/storage';
import { sound } from '@/lib/audio';

// ── Tetromino Definitions ──────────────────────────────────────────
type TetrominoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

interface Tetromino {
  shape: number[][];
  color: string;
  shadow: string;
}

const TETROMINOES: Record<TetrominoType, Tetromino> = {
  I: { shape: [[1, 1, 1, 1]], color: '#06b6d4', shadow: '#0891b2' },
  O: { shape: [[1, 1], [1, 1]], color: '#eab308', shadow: '#ca8a04' },
  T: { shape: [[0, 1, 0], [1, 1, 1]], color: '#a855f7', shadow: '#9333ea' },
  S: { shape: [[0, 1, 1], [1, 1, 0]], color: '#22c55e', shadow: '#16a34a' },
  Z: { shape: [[1, 1, 0], [0, 1, 1]], color: '#ef4444', shadow: '#dc2626' },
  J: { shape: [[1, 0, 0], [1, 1, 1]], color: '#3b82f6', shadow: '#2563eb' },
  L: { shape: [[0, 0, 1], [1, 1, 1]], color: '#f97316', shadow: '#ea580c' },
};

const TETROMINO_TYPES: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

const COLS = 10;
const ROWS = 20;
const POINTS = [0, 100, 300, 500, 800]; // 0, single, double, triple, tetris

// ── Helpers ────────────────────────────────────────────────────────
function createEmptyBoard(): (string | null)[][] {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

function rotateMatrix(matrix: number[][]): number[][] {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const rotated: number[][] = Array.from({ length: cols }, () => Array(rows).fill(0));
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      rotated[c][rows - 1 - r] = matrix[r][c];
    }
  }
  return rotated;
}

function randomBag(): TetrominoType[] {
  const bag = [...TETROMINO_TYPES];
  for (let i = bag.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [bag[i], bag[j]] = [bag[j], bag[i]];
  }
  return bag;
}

interface ActivePiece {
  type: TetrominoType;
  shape: number[][];
  row: number;
  col: number;
}

export default function Tetris() {
  const [board, setBoard] = useState<(string | null)[][]>(createEmptyBoard);
  const [activePiece, setActivePiece] = useState<ActivePiece | null>(null);
  const [nextQueue, setNextQueue] = useState<TetrominoType[]>([]);
  const [holdPiece, setHoldPiece] = useState<TetrominoType | null>(null);
  const [canHold, setCanHold] = useState(true);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lines, setLines] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [clearingRows, setClearingRows] = useState<number[]>([]);

  const boardRef = useRef(board);
  boardRef.current = board;
  const activeRef = useRef(activePiece);
  activeRef.current = activePiece;
  const pausedRef = useRef(isPaused);
  pausedRef.current = isPaused;
  const gameOverRef = useRef(gameOver);
  gameOverRef.current = gameOver;
  const scoreRef = useRef(score);
  scoreRef.current = score;
  const levelRef = useRef(level);
  levelRef.current = level;
  const linesRef = useRef(lines);
  linesRef.current = lines;
  const nextQueueRef = useRef(nextQueue);
  nextQueueRef.current = nextQueue;
  const canHoldRef = useRef(canHold);
  canHoldRef.current = canHold;
  const holdRef = useRef(holdPiece);
  holdRef.current = holdPiece;
  const dropTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  useEffect(() => {
    const stats = getStats('tetris');
    if (stats.highScore) setHighScore(stats.highScore);
  }, []);

  // ── Collision Detection ──────────────────────────────────────────
  const isValidPosition = useCallback((shape: number[][], row: number, col: number, b: (string | null)[][] = boardRef.current): boolean => {
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c]) {
          const newR = row + r;
          const newC = col + c;
          if (newR < 0 || newR >= ROWS || newC < 0 || newC >= COLS) return false;
          if (b[newR][newC] !== null) return false;
        }
      }
    }
    return true;
  }, []);

  // ── Ghost Piece Position ─────────────────────────────────────────
  const getGhostRow = useCallback((piece: ActivePiece): number => {
    let ghostRow = piece.row;
    while (isValidPosition(piece.shape, ghostRow + 1, piece.col)) {
      ghostRow++;
    }
    return ghostRow;
  }, [isValidPosition]);

  // ── Spawn Next Piece ─────────────────────────────────────────────
  const spawnPiece = useCallback((typeOverride?: TetrominoType) => {
    let queue = [...nextQueueRef.current];
    let type: TetrominoType;

    if (typeOverride) {
      type = typeOverride;
    } else {
      if (queue.length < 4) {
        queue = [...queue, ...randomBag()];
      }
      type = queue.shift()!;
      setNextQueue(queue);
      nextQueueRef.current = queue;
    }

    const tetro = TETROMINOES[type];
    const startCol = Math.floor((COLS - tetro.shape[0].length) / 2);
    const startRow = 0;

    if (!isValidPosition(tetro.shape, startRow, startCol, boardRef.current)) {
      setGameOver(true);
      gameOverRef.current = true;
      const finalScore = scoreRef.current;
      if (finalScore > 0) {
        const stats = getStats('tetris');
        const best = Math.max(finalScore, stats.highScore || 0);
        saveStats('tetris', { highScore: best, gamesPlayed: (stats.gamesPlayed || 0) + 1 });
        setHighScore(best);
      }
      if (soundEnabled) sound.playLose();
      return;
    }

    const newPiece: ActivePiece = { type, shape: tetro.shape, row: startRow, col: startCol };
    setActivePiece(newPiece);
    activeRef.current = newPiece;
    setCanHold(true);
    canHoldRef.current = true;
  }, [isValidPosition, soundEnabled]);

  // ── Lock Piece & Clear Lines ─────────────────────────────────────
  const lockPiece = useCallback(() => {
    const piece = activeRef.current;
    if (!piece) return;

    const newBoard = boardRef.current.map((row) => [...row]);
    const color = TETROMINOES[piece.type].color;

    for (let r = 0; r < piece.shape.length; r++) {
      for (let c = 0; c < piece.shape[r].length; c++) {
        if (piece.shape[r][c]) {
          const boardR = piece.row + r;
          const boardC = piece.col + c;
          if (boardR >= 0 && boardR < ROWS && boardC >= 0 && boardC < COLS) {
            newBoard[boardR][boardC] = color;
          }
        }
      }
    }

    // Find completed lines
    const fullRows: number[] = [];
    for (let r = 0; r < ROWS; r++) {
      if (newBoard[r].every((cell) => cell !== null)) {
        fullRows.push(r);
      }
    }

    if (fullRows.length > 0) {
      setClearingRows(fullRows);
      if (soundEnabled) sound.playScore();

      // Delay to show animation
      setTimeout(() => {
        const clearedBoard = newBoard.filter((_, idx) => !fullRows.includes(idx));
        while (clearedBoard.length < ROWS) {
          clearedBoard.unshift(Array(COLS).fill(null));
        }

        setBoard(clearedBoard);
        boardRef.current = clearedBoard;
        setClearingRows([]);

        const newLines = linesRef.current + fullRows.length;
        setLines(newLines);
        linesRef.current = newLines;

        const newLevel = Math.floor(newLines / 10) + 1;
        setLevel(newLevel);
        levelRef.current = newLevel;

        const pointsEarned = POINTS[fullRows.length] * newLevel;
        const newScore = scoreRef.current + pointsEarned;
        setScore(newScore);
        scoreRef.current = newScore;

        setActivePiece(null);
        activeRef.current = null;
        spawnPiece();
      }, 250);
    } else {
      setBoard(newBoard);
      boardRef.current = newBoard;
      if (soundEnabled) sound.playPlace();

      setActivePiece(null);
      activeRef.current = null;
      spawnPiece();
    }
  }, [spawnPiece, soundEnabled]);

  // ── Movement Actions ─────────────────────────────────────────────
  const moveLeft = useCallback(() => {
    const piece = activeRef.current;
    if (!piece || pausedRef.current || gameOverRef.current) return;
    if (isValidPosition(piece.shape, piece.row, piece.col - 1)) {
      const updated = { ...piece, col: piece.col - 1 };
      setActivePiece(updated);
      activeRef.current = updated;
    }
  }, [isValidPosition]);

  const moveRight = useCallback(() => {
    const piece = activeRef.current;
    if (!piece || pausedRef.current || gameOverRef.current) return;
    if (isValidPosition(piece.shape, piece.row, piece.col + 1)) {
      const updated = { ...piece, col: piece.col + 1 };
      setActivePiece(updated);
      activeRef.current = updated;
    }
  }, [isValidPosition]);

  const moveDown = useCallback((): boolean => {
    const piece = activeRef.current;
    if (!piece || pausedRef.current || gameOverRef.current) return false;
    if (isValidPosition(piece.shape, piece.row + 1, piece.col)) {
      const updated = { ...piece, row: piece.row + 1 };
      setActivePiece(updated);
      activeRef.current = updated;
      return true;
    }
    lockPiece();
    return false;
  }, [isValidPosition, lockPiece]);

  const hardDrop = useCallback(() => {
    const piece = activeRef.current;
    if (!piece || pausedRef.current || gameOverRef.current) return;
    const ghostRow = getGhostRow(piece);
    const dropDist = ghostRow - piece.row;
    const updated = { ...piece, row: ghostRow };
    setActivePiece(updated);
    activeRef.current = updated;

    const newScore = scoreRef.current + dropDist * 2;
    setScore(newScore);
    scoreRef.current = newScore;

    if (soundEnabled) sound.playBounce();
    lockPiece();
  }, [getGhostRow, lockPiece, soundEnabled]);

  const rotate = useCallback(() => {
    const piece = activeRef.current;
    if (!piece || pausedRef.current || gameOverRef.current) return;
    const rotated = rotateMatrix(piece.shape);

    // Try normal position, then wall kicks
    const kicks = [0, -1, 1, -2, 2];
    for (const kick of kicks) {
      if (isValidPosition(rotated, piece.row, piece.col + kick)) {
        const updated = { ...piece, shape: rotated, col: piece.col + kick };
        setActivePiece(updated);
        activeRef.current = updated;
        if (soundEnabled) sound.playPop();
        return;
      }
    }
  }, [isValidPosition, soundEnabled]);

  const doHold = useCallback(() => {
    const piece = activeRef.current;
    if (!piece || !canHoldRef.current || pausedRef.current || gameOverRef.current) return;

    setCanHold(false);
    canHoldRef.current = false;

    const currentHold = holdRef.current;
    setHoldPiece(piece.type);
    holdRef.current = piece.type;

    setActivePiece(null);
    activeRef.current = null;

    if (currentHold) {
      spawnPiece(currentHold);
    } else {
      spawnPiece();
    }
    if (soundEnabled) sound.playPop();
  }, [spawnPiece, soundEnabled]);

  // ── Game Drop Timer ──────────────────────────────────────────────
  useEffect(() => {
    if (!isStarted || gameOver || isPaused) {
      if (dropTimerRef.current) {
        clearInterval(dropTimerRef.current);
        dropTimerRef.current = null;
      }
      return;
    }

    const speed = Math.max(80, 800 - (level - 1) * 70);
    dropTimerRef.current = setInterval(() => {
      if (!pausedRef.current && !gameOverRef.current && activeRef.current) {
        moveDown();
      }
    }, speed);

    return () => {
      if (dropTimerRef.current) {
        clearInterval(dropTimerRef.current);
        dropTimerRef.current = null;
      }
    };
  }, [isStarted, gameOver, isPaused, level, moveDown]);

  // ── Keyboard Controls ────────────────────────────────────────────
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (gameOverRef.current || !isStarted) return;

      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          moveLeft();
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          moveRight();
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          moveDown();
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          rotate();
          break;
        case ' ':
          e.preventDefault();
          hardDrop();
          break;
        case 'c':
        case 'C':
        case 'Shift':
          e.preventDefault();
          doHold();
          break;
        case 'p':
        case 'P':
        case 'Escape':
          e.preventDefault();
          setIsPaused((p) => {
            pausedRef.current = !p;
            return !p;
          });
          break;
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isStarted, moveLeft, moveRight, moveDown, rotate, hardDrop, doHold]);

  // ── Touch Controls ───────────────────────────────────────────────
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || !isStarted || gameOver || isPaused) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    const dt = Date.now() - touchStartRef.current.time;
    touchStartRef.current = null;

    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (absDx < 10 && absDy < 10 && dt < 200) {
      rotate();
      return;
    }

    if (absDy > absDx && dy > 40) {
      hardDrop();
    } else if (absDx > absDy) {
      if (dx > 30) moveRight();
      else if (dx < -30) moveLeft();
    }
  };

  // ── Start / Reset ────────────────────────────────────────────────
  const startGame = () => {
    const newBoard = createEmptyBoard();
    setBoard(newBoard);
    boardRef.current = newBoard;
    setScore(0);
    scoreRef.current = 0;
    setLevel(1);
    levelRef.current = 1;
    setLines(0);
    linesRef.current = 0;
    setGameOver(false);
    gameOverRef.current = false;
    setIsPaused(false);
    pausedRef.current = false;
    setHoldPiece(null);
    holdRef.current = null;
    setCanHold(true);
    canHoldRef.current = true;
    setClearingRows([]);

    const bag = [...randomBag(), ...randomBag()];
    setNextQueue(bag);
    nextQueueRef.current = bag;
    setIsStarted(true);

    const type = bag.shift()!;
    setNextQueue(bag);
    nextQueueRef.current = bag;

    const tetro = TETROMINOES[type];
    const startCol = Math.floor((COLS - tetro.shape[0].length) / 2);
    const piece: ActivePiece = { type, shape: tetro.shape, row: 0, col: startCol };
    setActivePiece(piece);
    activeRef.current = piece;
  };

  // ── Render Mini Piece (for Next/Hold) ────────────────────────────
  const renderMiniPiece = (type: TetrominoType | null) => {
    if (!type) {
      return (
        <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
          <span className="text-zinc-600 text-xs">Empty</span>
        </div>
      );
    }
    const tetro = TETROMINOES[type];
    const shape = tetro.shape;
    const cellSize = shape[0].length > 3 ? 12 : 14;

    return (
      <div className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20">
        <div>
          {shape.map((row, ri) => (
            <div key={ri} className="flex">
              {row.map((cell, ci) => (
                <div
                  key={ci}
                  style={{
                    width: cellSize,
                    height: cellSize,
                    background: cell ? tetro.color : 'transparent',
                    borderRadius: cell ? 3 : 0,
                    boxShadow: cell ? `inset 0 1px 2px rgba(255,255,255,0.3), inset 0 -1px 2px rgba(0,0,0,0.3)` : 'none',
                    margin: 0.5,
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ── Build Display Board ──────────────────────────────────────────
  const displayBoard = board.map((row) => [...row]);
  const ghostRowVal = activePiece ? getGhostRow(activePiece) : -1;

  // Paint ghost piece
  if (activePiece && !gameOver) {
    for (let r = 0; r < activePiece.shape.length; r++) {
      for (let c = 0; c < activePiece.shape[r].length; c++) {
        if (activePiece.shape[r][c]) {
          const gr = ghostRowVal + r;
          const gc = activePiece.col + c;
          if (gr >= 0 && gr < ROWS && gc >= 0 && gc < COLS && !displayBoard[gr][gc]) {
            displayBoard[gr][gc] = 'ghost';
          }
        }
      }
    }
  }

  // Paint active piece (overwrites ghost if overlapping)
  if (activePiece && !gameOver) {
    const color = TETROMINOES[activePiece.type].color;
    for (let r = 0; r < activePiece.shape.length; r++) {
      for (let c = 0; c < activePiece.shape[r].length; c++) {
        if (activePiece.shape[r][c]) {
          const br = activePiece.row + r;
          const bc = activePiece.col + c;
          if (br >= 0 && br < ROWS && bc >= 0 && bc < COLS) {
            displayBoard[br][bc] = color;
          }
        }
      }
    }
  }

  return (
    <div className="flex flex-col items-center gap-4 w-full select-none">
      {/* Header Controls */}
      <div className="flex items-center gap-3 flex-wrap justify-center">
        <button
          onClick={() => setSoundEnabled((p) => { sound.setEnabled(!p); return !p; })}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-white/10 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-all"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
        {isStarted && !gameOver && (
          <button
            onClick={() => setIsPaused((p) => { pausedRef.current = !p; return !p; })}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border border-white/10 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-all"
          >
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            {isPaused ? 'Resume' : 'Pause'}
          </button>
        )}
        <button
          onClick={startGame}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 hover:text-cyan-200 transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          {isStarted ? 'Restart' : 'Start Game'}
        </button>
      </div>

      {/* Score Bar */}
      <div className="grid grid-cols-4 gap-3 w-full max-w-md">
        {[
          { label: 'Score', value: score, icon: '🎯' },
          { label: 'Level', value: level, icon: '⚡' },
          { label: 'Lines', value: lines, icon: '📏' },
          { label: 'Best', value: highScore, icon: '🏆' },
        ].map((stat) => (
          <div key={stat.label} className="bg-zinc-800/60 border border-white/5 rounded-xl p-2 text-center">
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider">{stat.icon} {stat.label}</div>
            <div className="text-base sm:text-lg font-black text-white">{stat.value.toLocaleString()}</div>
          </div>
        ))}
      </div>

      {/* Game Area */}
      <div className="flex gap-3 sm:gap-4 items-start justify-center">
        {/* Hold Piece */}
        <div className="flex flex-col items-center gap-2">
          <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Hold</div>
          <div className="bg-zinc-800/60 border border-white/10 rounded-xl p-1.5">
            {renderMiniPiece(holdPiece)}
          </div>
          <div className="text-[9px] text-zinc-600 mt-1 hidden sm:block">C / Shift</div>
        </div>

        {/* Board */}
        <div
          className="relative border-2 border-zinc-600/50 rounded-lg overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, #0f0f23 0%, #1a1a2e 100%)',
            boxShadow: '0 0 30px rgba(6,182,212,0.08), inset 0 0 60px rgba(0,0,0,0.5)',
          }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Grid lines */}
          <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.06 }}>
            {Array.from({ length: ROWS }).map((_, r) => (
              <div key={r} className="flex">
                {Array.from({ length: COLS }).map((_, c) => (
                  <div
                    key={c}
                    className="w-7 h-7 sm:w-[30px] sm:h-[30px]"
                    style={{ border: '0.5px solid rgba(255,255,255,0.2)' }}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Cells */}
          <div className="relative">
            {displayBoard.map((row, ri) => (
              <div key={ri} className="flex">
                {row.map((cell, ci) => {
                  const isClearing = clearingRows.includes(ri);
                  return (
                    <div
                      key={ci}
                      className="w-7 h-7 sm:w-[30px] sm:h-[30px] transition-all duration-75"
                      style={{
                        background: isClearing
                          ? '#ffffff'
                          : cell === 'ghost'
                          ? 'rgba(255,255,255,0.08)'
                          : cell
                          ? cell
                          : 'transparent',
                        borderRadius: cell && cell !== 'ghost' ? 3 : cell === 'ghost' ? 2 : 0,
                        border: cell === 'ghost'
                          ? '1px dashed rgba(255,255,255,0.2)'
                          : cell
                          ? '1px solid rgba(255,255,255,0.15)'
                          : 'none',
                        boxShadow: cell && cell !== 'ghost'
                          ? `inset 0 2px 3px rgba(255,255,255,0.25), inset 0 -2px 3px rgba(0,0,0,0.35), 0 0 6px ${cell}44`
                          : isClearing
                          ? '0 0 20px rgba(255,255,255,0.8)'
                          : 'none',
                        opacity: isClearing ? 0.9 : 1,
                      }}
                    />
                  );
                })}
              </div>
            ))}
          </div>

          {/* Overlays */}
          {!isStarted && (
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center gap-4 z-10">
              <div className="text-4xl">🧩</div>
              <div className="text-white font-black text-xl">TETRIS</div>
              <button
                onClick={startGame}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-sm hover:scale-105 active:scale-95 transition-transform shadow-lg shadow-cyan-500/30"
              >
                Start Game
              </button>
              <div className="text-[10px] text-zinc-400 text-center max-w-[200px]">
                Arrow keys to move • Space to drop • Up to rotate • C to hold
              </div>
            </div>
          )}

          {isPaused && (
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center gap-3 z-10">
              <Pause className="w-10 h-10 text-zinc-300" />
              <div className="text-white font-black text-lg">PAUSED</div>
              <button
                onClick={() => { setIsPaused(false); pausedRef.current = false; }}
                className="px-5 py-2 rounded-xl bg-white/10 border border-white/20 text-white font-bold text-sm hover:bg-white/20 transition-all"
              >
                Resume
              </button>
            </div>
          )}

          {gameOver && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3 z-10">
              <div className="text-4xl">💀</div>
              <div className="text-white font-black text-xl">GAME OVER</div>
              <div className="text-zinc-400 text-sm">Score: <span className="text-white font-bold">{score.toLocaleString()}</span></div>
              <div className="text-zinc-400 text-sm">Lines: <span className="text-white font-bold">{lines}</span> • Level: <span className="text-white font-bold">{level}</span></div>
              {score >= highScore && score > 0 && (
                <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold">
                  <Trophy className="w-4 h-4" /> New High Score!
                </div>
              )}
              <button
                onClick={startGame}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-sm hover:scale-105 active:scale-95 transition-transform shadow-lg shadow-cyan-500/30 mt-1"
              >
                Play Again
              </button>
            </div>
          )}
        </div>

        {/* Next Queue */}
        <div className="flex flex-col items-center gap-2">
          <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Next</div>
          <div className="bg-zinc-800/60 border border-white/10 rounded-xl p-1.5 flex flex-col gap-1">
            {nextQueue.slice(0, 3).map((type, i) => (
              <div key={i} className={i > 0 ? 'opacity-50 scale-90' : ''}>
                {renderMiniPiece(type)}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Controls */}
      <div className="flex gap-2 sm:hidden mt-2">
        <button onPointerDown={moveLeft} className="w-12 h-12 rounded-xl bg-zinc-800 border border-white/10 flex items-center justify-center active:bg-zinc-700 transition-colors">
          <ArrowLeft className="w-5 h-5 text-zinc-300" />
        </button>
        <button onPointerDown={rotate} className="w-12 h-12 rounded-xl bg-zinc-800 border border-white/10 flex items-center justify-center active:bg-zinc-700 transition-colors">
          <RotateCw className="w-5 h-5 text-zinc-300" />
        </button>
        <button onPointerDown={moveDown} className="w-12 h-12 rounded-xl bg-zinc-800 border border-white/10 flex items-center justify-center active:bg-zinc-700 transition-colors">
          <ArrowDown className="w-5 h-5 text-zinc-300" />
        </button>
        <button onPointerDown={moveRight} className="w-12 h-12 rounded-xl bg-zinc-800 border border-white/10 flex items-center justify-center active:bg-zinc-700 transition-colors">
          <ArrowRight className="w-5 h-5 text-zinc-300" />
        </button>
        <button onPointerDown={hardDrop} className="w-12 h-12 rounded-xl bg-cyan-800/60 border border-cyan-500/30 flex items-center justify-center active:bg-cyan-700/60 transition-colors text-[10px] font-bold text-cyan-300">
          DROP
        </button>
        <button onPointerDown={doHold} className="w-12 h-12 rounded-xl bg-zinc-800 border border-white/10 flex items-center justify-center active:bg-zinc-700 transition-colors text-[10px] font-bold text-zinc-400">
          HOLD
        </button>
      </div>

      {/* Controls Guide */}
      <div className="hidden sm:flex flex-wrap justify-center gap-x-4 gap-y-1 text-[10px] text-zinc-500 mt-1">
        <span>← → Move</span>
        <span>↑ Rotate</span>
        <span>↓ Soft Drop</span>
        <span>Space Hard Drop</span>
        <span>C Hold</span>
        <span>P Pause</span>
      </div>
    </div>
  );
}
