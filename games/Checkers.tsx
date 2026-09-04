'use client';

import { useState, useEffect, useCallback } from 'react';
import { RotateCcw, Trophy, Crown, Bot, Users, Volume2, VolumeX } from 'lucide-react';
import { sound } from '@/lib/audio';
import { getStats, saveStats } from '@/lib/storage';

type PieceType = 'red' | 'red-king' | 'black' | 'black-king' | null;
type Board = PieceType[][];
type Position = { r: number; c: number };

export default function Checkers() {
  const [board, setBoard] = useState<Board>(() => createInitialBoard());
  const [turn, setTurn] = useState<'red' | 'black'>('red');
  const [mode, setMode] = useState<'ai' | 'pvp'>('ai');
  const [selectedCell, setSelectedCell] = useState<Position | null>(null);
  const [validMoves, setValidMoves] = useState<Position[]>([]);
  const [winner, setWinner] = useState<string | null>(null);
  const [scores, setScores] = useState({ red: 0, black: 0 });
  const [soundEnabled, setSoundEnabled] = useState(true);

  function createInitialBoard(): Board {
    const b: Board = Array(8).fill(null).map(() => Array(8).fill(null));
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if ((r + c) % 2 === 1) {
          if (r < 3) b[r][c] = 'black';
          if (r > 4) b[r][c] = 'red';
        }
      }
    }
    return b;
  }

  useEffect(() => {
    const stats = getStats('checkers');
    if (stats.wins !== undefined || stats.losses !== undefined) {
      setScores({
        red: stats.wins || 0,
        black: stats.losses || 0,
      });
    }
  }, []);

  const resetGame = () => {
    setBoard(createInitialBoard());
    setTurn('red');
    setSelectedCell(null);
    setValidMoves([]);
    setWinner(null);
  };

  const isOwnPiece = (piece: PieceType, currentTurn: 'red' | 'black') => {
    if (!piece) return false;
    if (currentTurn === 'red') return piece.startsWith('red');
    return piece.startsWith('black');
  };

  const getLegalMoves = useCallback((r: number, c: number, b: Board, currentTurn: 'red' | 'black'): Position[] => {
    const piece = b[r][c];
    if (!piece || !isOwnPiece(piece, currentTurn)) return [];

    const moves: Position[] = [];
    const isKing = piece.endsWith('king');
    const directions: number[][] = [];

    if (piece.startsWith('red') || isKing) directions.push([-1, -1], [-1, 1]); // Moving up
    if (piece.startsWith('black') || isKing) directions.push([1, -1], [1, 1]); // Moving down

    for (const [dr, dc] of directions) {
      const nr = r + dr;
      const nc = c + dc;

      // Regular step
      if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && b[nr][nc] === null) {
        moves.push({ r: nr, c: nc });
      }

      // Jump capture step
      const jnRow = r + dr * 2;
      const jnCol = c + dc * 2;
      if (
        jnRow >= 0 &&
        jnRow < 8 &&
        jnCol >= 0 &&
        jnCol < 8 &&
        b[nr][nc] !== null &&
        !isOwnPiece(b[nr][nc], currentTurn) &&
        b[jnRow][jnCol] === null
      ) {
        moves.push({ r: jnRow, c: jnCol });
      }
    }

    return moves;
  }, []);

  const hasAnyLegalMoves = useCallback((b: Board, player: 'red' | 'black'): boolean => {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (b[r][c] && isOwnPiece(b[r][c], player)) {
          const moves = getLegalMoves(r, c, b, player);
          if (moves.length > 0) return true;
        }
      }
    }
    return false;
  }, [getLegalMoves]);

  const executeMove = useCallback((from: Position, to: Position) => {
    const newBoard = board.map((row) => [...row]);
    let piece = newBoard[from.r][from.c]!;

    newBoard[from.r][from.c] = null;
    let wasCapture = false;

    // Check if capture move
    if (Math.abs(to.r - from.r) === 2) {
      const midR = (from.r + to.r) / 2;
      const midC = (from.c + to.c) / 2;
      newBoard[midR][midC] = null;
      wasCapture = true;
    }

    // King promotion
    let wasPromoted = false;
    if (to.r === 0 && piece === 'red') {
      piece = 'red-king';
      wasPromoted = true;
    }
    if (to.r === 7 && piece === 'black') {
      piece = 'black-king';
      wasPromoted = true;
    }

    newBoard[to.r][to.c] = piece;
    setBoard(newBoard);
    setSelectedCell(null);
    setValidMoves([]);

    if (soundEnabled) {
      if (wasPromoted) sound.playScore();
      else if (wasCapture) sound.playPop();
      else sound.playPlace();
    }

    // Check win condition for next player
    const nextTurn = turn === 'red' ? 'black' : 'red';
    const opponentHasMoves = hasAnyLegalMoves(newBoard, nextTurn);

    if (!opponentHasMoves) {
      setWinner(turn);
      if (soundEnabled) (turn === 'red' || mode === 'pvp' ? sound.playWin() : sound.playLose());
      setScores((prev) => {
        const next = { ...prev, [turn]: prev[turn] + 1 };
        saveStats('checkers', { wins: next.red, losses: next.black });
        return next;
      });
    } else {
      setTurn(nextTurn);
    }
  }, [board, turn, soundEnabled, hasAnyLegalMoves, mode]);

  // AI Turn Handling
  useEffect(() => {
    if (mode === 'ai' && turn === 'black' && !winner) {
      const timer = setTimeout(() => {
        // Collect all legal black moves
        const allMoves: { from: Position; to: Position; isCapture: boolean }[] = [];

        for (let r = 0; r < 8; r++) {
          for (let c = 0; c < 8; c++) {
            if (board[r][c] && isOwnPiece(board[r][c], 'black')) {
              const legal = getLegalMoves(r, c, board, 'black');
              for (const m of legal) {
                allMoves.push({
                  from: { r, c },
                  to: m,
                  isCapture: Math.abs(m.r - r) === 2,
                });
              }
            }
          }
        }

        if (allMoves.length === 0) {
          setWinner('red');
          return;
        }

        // AI prioritizes captures
        const captures = allMoves.filter((m) => m.isCapture);
        const chosen = captures.length > 0
          ? captures[Math.floor(Math.random() * captures.length)]
          : allMoves[Math.floor(Math.random() * allMoves.length)];

        executeMove(chosen.from, chosen.to);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [turn, mode, winner, board, getLegalMoves, executeMove]);

  const handleCellClick = (r: number, c: number) => {
    if (winner || (mode === 'ai' && turn === 'black')) return;

    const piece = board[r][c];

    // Select piece
    if (piece && isOwnPiece(piece, turn)) {
      setSelectedCell({ r, c });
      const moves = getLegalMoves(r, c, board, turn);
      setValidMoves(moves);
      return;
    }

    // Execute move if destination clicked
    if (selectedCell && validMoves.some((m) => m.r === r && m.c === c)) {
      executeMove(selectedCell, { r, c });
    }
  };

  // Count active pieces
  const redPieces = board.flat().filter((p) => p && p.startsWith('red')).length;
  const blackPieces = board.flat().filter((p) => p && p.startsWith('black')).length;

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-lg mx-auto select-none">
      
      {/* Controls Bar */}
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

      {/* Piece Counts & Turn Header */}
      <div className="grid grid-cols-2 gap-3 w-full">
        <div className={`p-3 rounded-2xl flex items-center justify-between border transition-all ${
          turn === 'red' && !winner ? 'bg-rose-950/70 border-rose-500/60 ring-1 ring-rose-500/40 shadow-lg' : 'bg-rose-950/30 border-rose-500/20'
        }`}>
          <div>
            <span className="text-[10px] text-rose-300 font-bold uppercase tracking-wider block">Red (P1)</span>
            <span className="text-xl font-black text-white">{redPieces} <span className="text-xs text-rose-400 font-normal">pieces</span></span>
          </div>
          <span className="text-xl font-bold text-rose-400">{scores.red} wins</span>
        </div>

        <div className={`p-3 rounded-2xl flex items-center justify-between border transition-all ${
          turn === 'black' && !winner ? 'bg-slate-900 border-gray-500/60 ring-1 ring-gray-400/40 shadow-lg' : 'bg-slate-900/40 border-white/10'
        }`}>
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">{mode === 'ai' ? 'Black (AI)' : 'Black (P2)'}</span>
            <span className="text-xl font-black text-white">{blackPieces} <span className="text-xs text-gray-400 font-normal">pieces</span></span>
          </div>
          <span className="text-xl font-bold text-gray-300">{scores.black} wins</span>
        </div>
      </div>

      {/* Turn indicator banner */}
      <div className="text-center font-bold text-sm min-h-[32px] flex items-center justify-center">
        {winner ? (
          <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-4 py-1 rounded-full capitalize">
            🎉 {winner} Player Wins Checkers!
          </span>
        ) : (
          <span className="text-gray-300 flex items-center gap-2">
            Active Turn:{' '}
            <span className={`px-3 py-0.5 rounded-full text-xs font-black ${
              turn === 'red' ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30' : 'bg-slate-700 text-white shadow-md shadow-black/50'
            }`}>
              {turn === 'red' ? 'Red Player' : mode === 'ai' ? 'AI Calculating...' : 'Black Player'}
            </span>
          </span>
        )}
      </div>

      {/* Board */}
      <div className="relative w-full aspect-square bg-[#0e0e16] border-4 border-amber-950/70 rounded-3xl p-3 shadow-2xl overflow-hidden">
        <div className="grid grid-cols-8 grid-rows-8 w-full h-full border border-white/10 rounded-2xl overflow-hidden shadow-inner">
          {board.map((row, r) =>
            row.map((cell, c) => {
              const isDark = (r + c) % 2 === 1;
              const isSelected = selectedCell?.r === r && selectedCell?.c === c;
              const isValidMove = validMoves.some((m) => m.r === r && m.c === c);

              return (
                <button
                  key={`${r}-${c}`}
                  onClick={() => handleCellClick(r, c)}
                  disabled={!isDark || (mode === 'ai' && turn === 'black')}
                  aria-label={`Square ${r},${c}`}
                  className={`relative flex items-center justify-center transition-all ${
                    isDark ? 'bg-amber-950/80 hover:bg-amber-900/90' : 'bg-amber-100/10'
                  } ${isSelected ? 'ring-4 ring-cyan-400 z-10' : ''}`}
                >
                  {/* Glowing non-distracting ring for legal moves */}
                  {isValidMove && (
                    <div className="w-5 h-5 rounded-full border-2 border-cyan-400 bg-cyan-400/40 shadow-md shadow-cyan-400/50 z-10" />
                  )}

                  {/* Piece Render */}
                  {cell && (
                    <div
                      className={`w-4/5 h-4/5 rounded-full shadow-lg flex items-center justify-center border-2 transition-transform transform active:scale-95 ${
                        cell.startsWith('red')
                          ? 'bg-gradient-to-tr from-rose-700 to-red-500 border-rose-300 shadow-rose-900/50'
                          : 'bg-gradient-to-tr from-slate-900 to-gray-700 border-gray-400 shadow-black/80'
                      }`}
                    >
                      {cell.endsWith('king') && (
                        <Crown className="w-4 h-4 text-amber-300 filter drop-shadow animate-pulse" />
                      )}
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Win Overlay */}
        {winner && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center gap-4 z-20 animate-in fade-in zoom-in-95 duration-200">
            <Trophy className="w-12 h-12 text-amber-400 animate-bounce" />
            <h3 className="text-3xl font-black text-white capitalize">{winner} Wins Checkers!</h3>
            <p className="text-xs text-gray-400">All opponent pieces captured or blocked</p>
            <button
              onClick={resetGame}
              className="px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-rose-600 to-amber-600 text-white shadow-lg hover:scale-105 active:scale-95 transition-all text-sm mt-2"
            >
              Play Again
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
