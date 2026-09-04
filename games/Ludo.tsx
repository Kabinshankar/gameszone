'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { RotateCcw, Volume2, VolumeX, Bot, Users, Trophy, Sparkles, Star } from 'lucide-react';
import { sound } from '@/lib/audio';
import { saveStats } from '@/lib/storage';

export type PlayerColor = 'red' | 'green' | 'yellow' | 'blue';

export interface Token {
  id: number;
  color: PlayerColor;
  step: number; // -1: Yard, 0-50: Main Circuit, 51-55: Home Lane, 56: Home
}

type GameMode = 'vs-bot' | '2-player' | '4-player';

const PLAYER_ORDER: PlayerColor[] = ['red', 'green', 'yellow', 'blue'];

const PLAYER_COLORS: Record<PlayerColor, {
  name: string;
  primary: string;
  light: string;
  dark: string;
  border: string;
  bgYard: string;
}> = {
  red: {
    name: 'Red',
    primary: '#EF3340',
    light: '#FF6B75',
    dark: '#B91C2A',
    border: 'border-rose-500',
    bgYard: 'bg-[#EF3340]',
  },
  green: {
    name: 'Green',
    primary: '#10B981',
    light: '#34D399',
    dark: '#047857',
    border: 'border-emerald-500',
    bgYard: 'bg-[#10B981]',
  },
  yellow: {
    name: 'Yellow',
    primary: '#FBBF24',
    light: '#FCD34D',
    dark: '#D97706',
    border: 'border-amber-400',
    bgYard: 'bg-[#FBBF24]',
  },
  blue: {
    name: 'Blue',
    primary: '#3B82F6',
    light: '#60A5FA',
    dark: '#1D4ED8',
    border: 'border-blue-500',
    bgYard: 'bg-[#3B82F6]',
  },
};

// 52-cell Outer Circuit Path (Clockwise around 15x15 cross)
// Starting from Red Start Cell (row 6, col 1)
const CIRCUIT_PATH: { r: number; c: number }[] = [
  /* 0 - Red Start */  { r: 6, c: 1 },
  /* 1 */              { r: 6, c: 2 },
  /* 2 */              { r: 6, c: 3 },
  /* 3 */              { r: 6, c: 4 },
  /* 4 */              { r: 6, c: 5 },
  /* 5 */              { r: 5, c: 6 },
  /* 6 */              { r: 4, c: 6 },
  /* 7 */              { r: 3, c: 6 },
  /* 8 - Safe Star */  { r: 2, c: 6 },
  /* 9 */              { r: 1, c: 6 },
  /* 10 */             { r: 0, c: 6 },
  /* 11 */             { r: 0, c: 7 },
  /* 12 */             { r: 0, c: 8 },
  /* 13 - Green Start*/{ r: 1, c: 8 },
  /* 14 */             { r: 2, c: 8 },
  /* 15 */             { r: 3, c: 8 },
  /* 16 */             { r: 4, c: 8 },
  /* 17 */             { r: 5, c: 8 },
  /* 18 */             { r: 6, c: 9 },
  /* 19 */             { r: 6, c: 10 },
  /* 20 */             { r: 6, c: 11 },
  /* 21 - Safe Star */ { r: 6, c: 12 },
  /* 22 */             { r: 6, c: 13 },
  /* 23 */             { r: 6, c: 14 },
  /* 24 */             { r: 7, c: 14 },
  /* 25 */             { r: 8, c: 14 },
  /* 26 - Yellow Start*/{ r: 8, c: 13 },
  /* 27 */             { r: 8, c: 12 },
  /* 28 */             { r: 8, c: 11 },
  /* 29 */             { r: 8, c: 10 },
  /* 30 */             { r: 8, c: 9 },
  /* 31 */             { r: 9, c: 8 },
  /* 32 */             { r: 10, c: 8 },
  /* 33 */             { r: 11, c: 8 },
  /* 34 - Safe Star */ { r: 12, c: 8 },
  /* 35 */             { r: 13, c: 8 },
  /* 36 */             { r: 14, c: 8 },
  /* 37 */             { r: 14, c: 7 },
  /* 38 */             { r: 14, c: 6 },
  /* 39 - Blue Start */{ r: 13, c: 6 },
  /* 40 */             { r: 12, c: 6 },
  /* 41 */             { r: 11, c: 6 },
  /* 42 */             { r: 10, c: 6 },
  /* 43 */             { r: 9, c: 6 },
  /* 44 */             { r: 8, c: 5 },
  /* 45 */             { r: 8, c: 4 },
  /* 46 */             { r: 8, c: 3 },
  /* 47 - Safe Star */ { r: 8, c: 2 },
  /* 48 */             { r: 8, c: 1 },
  /* 49 */             { r: 8, c: 0 },
  /* 50 */             { r: 7, c: 0 },
  /* 51 */             { r: 6, c: 0 },
];

// Start offsets in CIRCUIT_PATH
const START_OFFSETS: Record<PlayerColor, number> = {
  red: 0,
  green: 13,
  yellow: 26,
  blue: 39,
};

// 5 Colored Home Lane steps (steps 51-55) + Center destination (step 56)
const HOME_LANES: Record<PlayerColor, { r: number; c: number }[]> = {
  red: [
    { r: 7, c: 1 }, { r: 7, c: 2 }, { r: 7, c: 3 }, { r: 7, c: 4 }, { r: 7, c: 5 },
    { r: 7, c: 6 }, // Center Left Apex
  ],
  green: [
    { r: 1, c: 7 }, { r: 2, c: 7 }, { r: 3, c: 7 }, { r: 4, c: 7 }, { r: 5, c: 7 },
    { r: 6, c: 7 }, // Center Top Apex
  ],
  yellow: [
    { r: 7, c: 13 }, { r: 7, c: 12 }, { r: 7, c: 11 }, { r: 7, c: 10 }, { r: 7, c: 9 },
    { r: 7, c: 8 }, // Center Right Apex
  ],
  blue: [
    { r: 13, c: 7 }, { r: 12, c: 7 }, { r: 11, c: 7 }, { r: 10, c: 7 }, { r: 9, c: 7 },
    { r: 8, c: 7 }, // Center Bottom Apex
  ],
};

// 4 Pocket Coordinates inside each 6x6 Yard
const YARD_POCKETS: Record<PlayerColor, { r: number; c: number }[]> = {
  red: [
    { r: 1.5, c: 1.5 }, { r: 1.5, c: 3.5 },
    { r: 3.5, c: 1.5 }, { r: 3.5, c: 3.5 },
  ],
  green: [
    { r: 1.5, c: 10.5 }, { r: 1.5, c: 12.5 },
    { r: 3.5, c: 10.5 }, { r: 3.5, c: 12.5 },
  ],
  yellow: [
    { r: 10.5, c: 10.5 }, { r: 10.5, c: 12.5 },
    { r: 12.5, c: 10.5 }, { r: 12.5, c: 12.5 },
  ],
  blue: [
    { r: 10.5, c: 1.5 }, { r: 10.5, c: 3.5 },
    { r: 12.5, c: 1.5 }, { r: 12.5, c: 3.5 },
  ],
};

// Safe Star Coordinates (cannot be captured here)
const SAFE_STARS = new Set<string>([
  '6,1', '2,6', '1,8', '6,12', '8,13', '12,8', '13,6', '8,2',
]);

export default function Ludo() {
  const [mode, setMode] = useState<GameMode>('vs-bot');
  const [currentTurn, setCurrentTurn] = useState<number>(0); // Index in activePlayers
  const [diceValue, setDiceValue] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [hasRolled, setHasRolled] = useState(false);
  const [movingTokenId, setMovingTokenId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('Red player rolls first!');
  const [winner, setWinner] = useState<PlayerColor | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Initialize 4 tokens per player
  const [tokens, setTokens] = useState<Token[]>(() => {
    const list: Token[] = [];
    PLAYER_ORDER.forEach((color) => {
      for (let i = 0; i < 4; i++) {
        list.push({ id: i, color, step: -1 });
      }
    });
    return list;
  });

  const activePlayers: PlayerColor[] =
    mode === '2-player' ? ['red', 'yellow'] : PLAYER_ORDER;

  const currentColor = activePlayers[currentTurn] || 'red';

  // Keep latest state in refs to guarantee asynchronous callbacks never use stale closures
  const tokensRef = useRef(tokens);
  tokensRef.current = tokens;

  const currentTurnRef = useRef(currentTurn);
  currentTurnRef.current = currentTurn;

  const hasRolledRef = useRef(hasRolled);
  hasRolledRef.current = hasRolled;

  const isRollingRef = useRef(isRolling);
  isRollingRef.current = isRolling;

  const movingRef = useRef<string | null>(null);

  const isSafeSquare = (r: number, c: number) => SAFE_STARS.has(`${r},${c}`);

  // Calculate board coordinate for a token
  const getTokenPosition = (token: Token) => {
    if (token.step === -1) {
      return YARD_POCKETS[token.color][token.id];
    }
    if (token.step <= 50) {
      const idx = (START_OFFSETS[token.color] + token.step) % 52;
      return CIRCUIT_PATH[idx];
    }
    const homeIdx = Math.min(5, token.step - 51);
    return HOME_LANES[token.color][homeIdx];
  };

  // Determine if a token can make a legal move with given roll
  const canTokenMove = useCallback((token: Token, roll: number): boolean => {
    if (token.step === 56) return false; // Already home
    if (token.step === -1) return roll === 6; // Requires 6 to enter start
    return token.step + roll <= 56; // Cannot overshoot home
  }, []);

  // Bulletproof turn transition using refs
  const passTurn = useCallback((bonusRoll: boolean = false) => {
    setHasRolled(false);
    hasRolledRef.current = false;
    setDiceValue(null);
    setMovingTokenId(null);
    movingRef.current = null;

    if (bonusRoll) {
      const player = activePlayers[currentTurnRef.current];
      setStatusMessage(`${PLAYER_COLORS[player].name} gets another roll!`);
    } else {
      const nextTurn = (currentTurnRef.current + 1) % activePlayers.length;
      setCurrentTurn(nextTurn);
      currentTurnRef.current = nextTurn;
      const nextPlayer = activePlayers[nextTurn];
      setStatusMessage(`${PLAYER_COLORS[nextPlayer].name}'s turn. Roll the dice!`);
    }
  }, [activePlayers]);

  // Handle move completion, captures, home entry, and bonuses
  const finalizeMove = useCallback((
    color: PlayerColor,
    tokenId: number,
    finalStep: number,
    roll: number
  ) => {
    let capturedOpponent = false;
    let updatedTokens = tokensRef.current.map((t) =>
      t.id === tokenId && t.color === color ? { ...t, step: finalStep } : t
    );

    // Capture Check on Circuit Path (step <= 50)
    if (finalStep <= 50) {
      const finalIdx = (START_OFFSETS[color] + finalStep) % 52;
      const cell = CIRCUIT_PATH[finalIdx];

      if (!isSafeSquare(cell.r, cell.c)) {
        updatedTokens = updatedTokens.map((t) => {
          if (t.color !== color && t.step >= 0 && t.step <= 50) {
            const oppIdx = (START_OFFSETS[t.color] + t.step) % 52;
            if (oppIdx === finalIdx) {
              capturedOpponent = true;
              if (soundEnabled) sound.playError();
              return { ...t, step: -1 }; // Send back to Yard
            }
          }
          return t;
        });
      }
    }

    // Update tokens state immediately
    setTokens(updatedTokens);
    tokensRef.current = updatedTokens;

    // Check Home Entry
    const reachedHome = finalStep === 56;
    if (reachedHome && soundEnabled) sound.playScore();

    // Check Win Condition: all 4 tokens at step 56
    const pTokens = updatedTokens.filter((t) => t.color === color);
    const allHome = pTokens.every((t) => t.step === 56);

    if (allHome) {
      setWinner(color);
      if (soundEnabled) (color === 'red' ? sound.playWin() : sound.playLose());
      saveStats('ludo', { wins: 1 });
      setStatusMessage(`🎉 ${PLAYER_COLORS[color].name} Player Wins Ludo!`);
      return;
    }

    // Determine bonus roll (roll 6, capture opponent, or reach home)
    const getsBonus = roll === 6 || capturedOpponent || reachedHome;

    if (getsBonus) {
      if (capturedOpponent) {
        setStatusMessage(`💥 Captured opponent! ${PLAYER_COLORS[color].name} rolls again!`);
      } else if (reachedHome) {
        setStatusMessage(`🏁 Reached Home! ${PLAYER_COLORS[color].name} rolls again!`);
      } else {
        setStatusMessage(`🎉 Rolled a 6! ${PLAYER_COLORS[color].name} rolls again!`);
      }

      setTimeout(() => {
        setHasRolled(false);
        hasRolledRef.current = false;
        setDiceValue(null);
        setMovingTokenId(null);
        movingRef.current = null;
      }, 400);
    } else {
      setTimeout(() => {
        passTurn(false);
      }, 400);
    }
  }, [soundEnabled, passTurn]);

  // Execute Token Step-by-Step Movement
  const executeTokenMove = useCallback((token: Token, roll: number) => {
    if (movingRef.current) return;
    const tokenKey = `${token.color}-${token.id}`;
    movingRef.current = tokenKey;
    setMovingTokenId(tokenKey);

    if (soundEnabled) sound.playPlace();

    const startStep = token.step;
    const targetStep = startStep === -1 ? 0 : startStep + roll;

    let cur = startStep === -1 ? -1 : startStep;
    const stepInterval = setInterval(() => {
      cur += 1;
      setTokens((prev) =>
        prev.map((t) =>
          t.id === token.id && t.color === token.color ? { ...t, step: cur } : t
        )
      );
      if (soundEnabled) sound.playBounce();

      if (cur >= targetStep) {
        clearInterval(stepInterval);
        movingRef.current = null;
        setMovingTokenId(null);
        finalizeMove(token.color, token.id, targetStep, roll);
      }
    }, 80);
  }, [soundEnabled, finalizeMove]);

  // Tactical Bot Decision
  const chooseBotMove = useCallback((color: PlayerColor, legal: Token[], roll: number) => {
    // 1. Capture priority
    for (const t of legal) {
      const targetStep = t.step === -1 ? 0 : t.step + roll;
      if (targetStep <= 50) {
        const targetIdx = (START_OFFSETS[t.color] + targetStep) % 52;
        const targetCell = CIRCUIT_PATH[targetIdx];
        if (!isSafeSquare(targetCell.r, targetCell.c)) {
          const wouldCapture = tokensRef.current.some(
            (o) =>
              o.color !== t.color &&
              o.step >= 0 &&
              o.step <= 50 &&
              (START_OFFSETS[o.color] + o.step) % 52 === targetIdx
          );
          if (wouldCapture) {
            executeTokenMove(t, roll);
            return;
          }
        }
      }
    }

    // 2. Reaching Home priority
    const homeMove = legal.find((t) => t.step + roll === 56);
    if (homeMove) {
      executeTokenMove(homeMove, roll);
      return;
    }

    // 3. Exit Yard on 6
    if (roll === 6) {
      const yardToken = legal.find((t) => t.step === -1);
      if (yardToken) {
        executeTokenMove(yardToken, roll);
        return;
      }
    }

    // 4. Advance closest token to home
    const sorted = [...legal].sort((a, b) => b.step - a.step);
    executeTokenMove(sorted[0], roll);
  }, [executeTokenMove]);

  // Roll Dice Action
  const rollDice = useCallback(() => {
    if (hasRolledRef.current || isRollingRef.current || movingRef.current || winner) return;

    setIsRolling(true);
    isRollingRef.current = true;
    if (soundEnabled) sound.playPop();

    setTimeout(() => {
      const val = Math.floor(Math.random() * 6) + 1;
      setDiceValue(val);
      setIsRolling(false);
      isRollingRef.current = false;
      setHasRolled(true);
      hasRolledRef.current = true;

      const activeColor = activePlayers[currentTurnRef.current];
      const isBot = mode === 'vs-bot' && activeColor !== 'red';

      // Check legal moves using latest tokensRef
      const pTokens = tokensRef.current.filter((t) => t.color === activeColor);
      const legalTokens = pTokens.filter((t) => canTokenMove(t, val));

      if (legalTokens.length === 0) {
        setStatusMessage(`${PLAYER_COLORS[activeColor].name} rolled ${val}. No legal moves.`);
        setTimeout(() => passTurn(false), isBot ? 500 : 800);
      } else if (isBot) {
        setStatusMessage(`${PLAYER_COLORS[activeColor].name} Bot rolled ${val}...`);
        setTimeout(() => {
          chooseBotMove(activeColor, legalTokens, val);
        }, 500);
      } else {
        setStatusMessage(`Rolled ${val}! Select a token to move.`);
        // Auto-move if only 1 legal token for snappy UX
        if (legalTokens.length === 1) {
          setTimeout(() => {
            executeTokenMove(legalTokens[0], val);
          }, 400);
        }
      }
    }, 450);
  }, [activePlayers, mode, winner, soundEnabled, canTokenMove, passTurn, chooseBotMove, executeTokenMove]);

  // Automatic Bot Roll Trigger
  useEffect(() => {
    if (winner) return;

    const activeColor = activePlayers[currentTurn];
    const isBot = mode === 'vs-bot' && activeColor !== 'red';

    if (isBot && !hasRolled && !isRolling && !movingTokenId) {
      const botTimer = setTimeout(() => {
        if (!hasRolledRef.current && !isRollingRef.current && !movingRef.current) {
          rollDice();
        }
      }, 600);
      return () => clearTimeout(botTimer);
    }
  }, [currentTurn, mode, hasRolled, isRolling, movingTokenId, winner, activePlayers, rollDice]);

  // Human Token Click
  const handleTokenClick = (token: Token) => {
    if (!hasRolled || !diceValue || isRolling || movingTokenId || winner) return;
    const activeColor = activePlayers[currentTurn];
    const isBot = mode === 'vs-bot' && activeColor !== 'red';
    if (token.color !== activeColor || isBot) return;
    if (!canTokenMove(token, diceValue)) return;

    executeTokenMove(token, diceValue);
  };

  const resetGame = () => {
    setTokens(
      PLAYER_ORDER.flatMap((color) =>
        Array.from({ length: 4 }).map((_, i) => ({ id: i, color, step: -1 }))
      )
    );
    setCurrentTurn(0);
    currentTurnRef.current = 0;
    setDiceValue(null);
    setHasRolled(false);
    hasRolledRef.current = false;
    setIsRolling(false);
    isRollingRef.current = false;
    setMovingTokenId(null);
    movingRef.current = null;
    setWinner(null);
    setStatusMessage('New Game started. Red player rolls first!');
  };

  // Render authentic 3D Dice with pips
  const renderDiceFace = (value: number | null, customClass?: string) => {
    const val = value || 1;
    const canRoll = !hasRolled && !isRolling && !movingTokenId && !winner;

    return (
      <div
        className={`rounded-2xl bg-white border-2 border-slate-300 shadow-2xl flex items-center justify-center p-1.5 sm:p-2 transition-all duration-300 ${
          customClass || 'w-12 h-12 sm:w-14 sm:h-14'
        } ${
          isRolling
            ? 'rotate-[720deg] scale-110 animate-spin'
            : canRoll
            ? 'hover:scale-110 active:scale-95 animate-pulse'
            : ''
        }`}
        style={{
          boxShadow: '0 8px 16px rgba(0,0,0,0.35), inset 0 2px 4px rgba(255,255,255,0.9), inset 0 -3px 6px rgba(0,0,0,0.15)',
        }}
      >
        <div className="grid grid-cols-3 grid-rows-3 w-full h-full gap-0.5 sm:gap-1 items-center justify-items-center">
          {/* Pip 1 (top-left) */}
          {[2, 3, 4, 5, 6].includes(val) ? <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-slate-900" /> : <span />}
          {/* Pip 2 (top-center) */}
          <span />
          {/* Pip 3 (top-right) */}
          {[4, 5, 6].includes(val) ? <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-slate-900" /> : <span />}
          {/* Pip 4 (mid-left) */}
          {[6].includes(val) ? <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-slate-900" /> : <span />}
          {/* Center pip */}
          {[1, 3, 5].includes(val) ? (
            <span className={`rounded-full ${val === 1 ? 'w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 bg-[#EF3340]' : 'w-1.5 h-1.5 sm:w-2 sm:h-2 bg-slate-900'}`} />
          ) : (
            <span />
          )}
          {/* Pip 6 (mid-right) */}
          {[6].includes(val) ? <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-slate-900" /> : <span />}
          {/* Pip 7 (bottom-left) */}
          {[4, 5, 6].includes(val) ? <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-slate-900" /> : <span />}
          {/* Pip 8 (bottom-center) */}
          <span />
          {/* Pip 9 (bottom-right) */}
          {[2, 3, 4, 5, 6].includes(val) ? <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-slate-900" /> : <span />}
        </div>
      </div>
    );
  };

  const isCurrentBot = mode === 'vs-bot' && currentColor !== 'red';
  const canRollNow = !hasRolled && !isRolling && !movingTokenId && !winner && !isCurrentBot;

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-2xl mx-auto select-none px-2">
      
      {/* Top Controls Bar */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 bg-white/[0.04] border border-white/10 p-3 rounded-2xl backdrop-blur-sm shadow-md">
        
        {/* Mode Selector */}
        <div className="flex bg-black/40 p-1 rounded-xl border border-white/10 text-xs">
          <button
            onClick={() => { setMode('vs-bot'); resetGame(); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              mode === 'vs-bot' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Bot className="w-3.5 h-3.5" /> vs Bots
          </button>
          <button
            onClick={() => { setMode('2-player'); resetGame(); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              mode === '2-player' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> 2P
          </button>
          <button
            onClick={() => { setMode('4-player'); resetGame(); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              mode === '4-player' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> 4P
          </button>
        </div>

        {/* Sound & Reset */}
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

      {/* Turn Status & Dice Console */}
      <div className="w-full bg-white/[0.04] border border-white/10 p-3 sm:p-4 rounded-2xl flex items-center justify-between shadow-lg">
        {/* Active Player Badge */}
        <div className="flex items-center gap-3">
          <div
            className="w-5 h-5 rounded-full shadow-lg ring-2 ring-white/80 animate-pulse"
            style={{ backgroundColor: PLAYER_COLORS[currentColor].primary }}
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-black text-white capitalize">
                {PLAYER_COLORS[currentColor].name} Turn
              </span>
              {isCurrentBot && (
                <span className="text-[10px] bg-white/10 text-cyan-300 font-bold px-1.5 py-0.5 rounded">
                  BOT
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 truncate max-w-[180px] sm:max-w-xs">{statusMessage}</p>
          </div>
        </div>

        {/* Header Roll / Status Button */}
        <button
          onClick={rollDice}
          disabled={!canRollNow}
          aria-label="Roll Dice"
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all ${
            canRollNow
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 border-purple-400/40 text-white shadow-lg shadow-purple-500/25 hover:scale-105 active:scale-95 cursor-pointer animate-pulse'
              : 'bg-white/5 border-white/10 text-gray-300 cursor-default'
          }`}
        >
          <span className="text-sm">🎲</span>
          <span className="uppercase tracking-wider">
            {isRolling ? 'Rolling...' : hasRolled ? `Rolled ${diceValue}` : isCurrentBot ? 'Bot Rolling...' : 'Roll Dice'}
          </span>
        </button>
      </div>

      {/* 15x15 Authentic Ludo Board Container */}
      <div className="relative w-full aspect-square max-w-[580px] bg-[#F3F4F6] border-4 border-slate-800 rounded-3xl p-1 sm:p-2 shadow-2xl overflow-hidden">
        
        {/* CSS Grid for 15x15 board cells */}
        <div className="grid grid-cols-[repeat(15,minmax(0,1fr))] grid-rows-[repeat(15,minmax(0,1fr))] w-full h-full border-2 border-slate-900 bg-white">
          
          {/* Top-Left: Red Yard (6x6) */}
          <div className="col-span-6 row-span-6 bg-[#EF3340] border-2 border-slate-900 p-2 sm:p-3 flex items-center justify-center">
            <div className="w-full h-full bg-white rounded-2xl border-2 border-slate-900 grid grid-cols-2 grid-rows-2 p-2 gap-2 shadow-inner">
              {YARD_POCKETS.red.map((pocket, idx) => (
                <div
                  key={idx}
                  className="rounded-full bg-rose-100 border-2 border-[#EF3340] flex items-center justify-center shadow-inner"
                />
              ))}
            </div>
          </div>

          {/* Top-Center Arm: Rows 0-5, Cols 6-8 (Green Home Column) */}
          <div className="col-span-3 row-span-6 grid grid-cols-3 grid-rows-6 border-r-2 border-slate-900">
            {Array.from({ length: 18 }).map((_, i) => {
              const r = Math.floor(i / 3);
              const c = (i % 3) + 6;
              const isGreenHomeLane = c === 7 && r >= 1 && r <= 5;
              const isGreenStart = r === 1 && c === 8;
              const isSafe = isSafeSquare(r, c);

              return (
                <div
                  key={`top-${r}-${c}`}
                  className={`border border-slate-300 flex items-center justify-center relative ${
                    isGreenHomeLane
                      ? 'bg-[#10B981]'
                      : isGreenStart
                      ? 'bg-emerald-100'
                      : 'bg-white'
                  }`}
                >
                  {isSafe && <Star className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-600 fill-emerald-500" />}
                </div>
              );
            })}
          </div>

          {/* Top-Right: Green Yard (6x6) */}
          <div className="col-span-6 row-span-6 bg-[#10B981] border-2 border-slate-900 p-2 sm:p-3 flex items-center justify-center">
            <div className="w-full h-full bg-white rounded-2xl border-2 border-slate-900 grid grid-cols-2 grid-rows-2 p-2 gap-2 shadow-inner">
              {YARD_POCKETS.green.map((pocket, idx) => (
                <div
                  key={idx}
                  className="rounded-full bg-emerald-100 border-2 border-[#10B981] flex items-center justify-center shadow-inner"
                />
              ))}
            </div>
          </div>

          {/* Left Arm: Rows 6-8, Cols 0-5 (Red Home Row) */}
          <div className="col-span-6 row-span-3 grid grid-cols-6 grid-rows-3 border-b-2 border-slate-900">
            {Array.from({ length: 18 }).map((_, i) => {
              const r = Math.floor(i / 6) + 6;
              const c = i % 6;
              const isRedHomeLane = r === 7 && c >= 1 && c <= 5;
              const isRedStart = r === 6 && c === 1;
              const isSafe = isSafeSquare(r, c);

              return (
                <div
                  key={`left-${r}-${c}`}
                  className={`border border-slate-300 flex items-center justify-center relative ${
                    isRedHomeLane
                      ? 'bg-[#EF3340]'
                      : isRedStart
                      ? 'bg-rose-100'
                      : 'bg-white'
                  }`}
                >
                  {isSafe && <Star className="w-3 h-3 sm:w-4 sm:h-4 text-rose-600 fill-rose-500" />}
                </div>
              );
            })}
          </div>

          {/* Center 3x3 Home Triangle Section with Center Dice */}
          <div className="col-span-3 row-span-3 relative border-2 border-slate-900 bg-slate-950 overflow-hidden flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full absolute inset-0">
              {/* Left Triangle (Red) */}
              <polygon points="0,0 50,50 0,100" fill="#EF3340" />
              {/* Top Triangle (Green) */}
              <polygon points="0,0 50,50 100,0" fill="#10B981" />
              {/* Right Triangle (Yellow) */}
              <polygon points="100,0 50,50 100,100" fill="#FBBF24" />
              {/* Bottom Triangle (Blue) */}
              <polygon points="0,100 50,50 100,100" fill="#3B82F6" />
              {/* Center Circular Ring */}
              <circle cx="50" cy="50" r="28" fill="#09090B" stroke="#FFFFFF" strokeWidth="2.5" opacity="0.95" />
            </svg>

            {/* Interactive 3D Dice in Middle of Board */}
            <button
              onClick={rollDice}
              disabled={!canRollNow}
              aria-label="Roll Dice in Center"
              className={`relative z-20 flex flex-col items-center justify-center transition-all ${
                canRollNow ? 'cursor-pointer hover:scale-105 active:scale-95' : 'cursor-default'
              }`}
            >
              {renderDiceFace(diceValue, 'w-10 h-10 sm:w-14 sm:h-14')}

              {/* Dynamic Turn Badge Below Dice */}
              {!hasRolled && !isRolling && !movingTokenId && !winner && (
                <span
                  className="absolute -bottom-3 sm:-bottom-4 text-[7px] sm:text-[9px] font-black uppercase tracking-wider text-white px-1.5 py-0.5 rounded-full shadow-lg whitespace-nowrap animate-bounce border border-white/60"
                  style={{ backgroundColor: PLAYER_COLORS[currentColor].primary }}
                >
                  {isCurrentBot ? 'BOT...' : 'ROLL'}
                </span>
              )}
            </button>
          </div>

          {/* Right Arm: Rows 6-8, Cols 9-14 (Yellow Home Row) */}
          <div className="col-span-6 row-span-3 grid grid-cols-6 grid-rows-3 border-b-2 border-slate-900">
            {Array.from({ length: 18 }).map((_, i) => {
              const r = Math.floor(i / 6) + 6;
              const c = (i % 6) + 9;
              const isYellowHomeLane = r === 7 && c >= 9 && c <= 13;
              const isYellowStart = r === 8 && c === 13;
              const isSafe = isSafeSquare(r, c);

              return (
                <div
                  key={`right-${r}-${c}`}
                  className={`border border-slate-300 flex items-center justify-center relative ${
                    isYellowHomeLane
                      ? 'bg-[#FBBF24]'
                      : isYellowStart
                      ? 'bg-amber-100'
                      : 'bg-white'
                  }`}
                >
                  {isSafe && <Star className="w-3 h-3 sm:w-4 sm:h-4 text-amber-600 fill-amber-500" />}
                </div>
              );
            })}
          </div>

          {/* Bottom-Left: Blue Yard (6x6) */}
          <div className="col-span-6 row-span-6 bg-[#3B82F6] border-2 border-slate-900 p-2 sm:p-3 flex items-center justify-center">
            <div className="w-full h-full bg-white rounded-2xl border-2 border-slate-900 grid grid-cols-2 grid-rows-2 p-2 gap-2 shadow-inner">
              {YARD_POCKETS.blue.map((pocket, idx) => (
                <div
                  key={idx}
                  className="rounded-full bg-blue-100 border-2 border-[#3B82F6] flex items-center justify-center shadow-inner"
                />
              ))}
            </div>
          </div>

          {/* Bottom-Center Arm: Rows 9-14, Cols 6-8 (Blue Home Column) */}
          <div className="col-span-3 row-span-6 grid grid-cols-3 grid-rows-6 border-r-2 border-slate-900">
            {Array.from({ length: 18 }).map((_, i) => {
              const r = Math.floor(i / 3) + 9;
              const c = (i % 3) + 6;
              const isBlueHomeLane = c === 7 && r >= 9 && r <= 13;
              const isBlueStart = r === 13 && c === 6;
              const isSafe = isSafeSquare(r, c);

              return (
                <div
                  key={`bottom-${r}-${c}`}
                  className={`border border-slate-300 flex items-center justify-center relative ${
                    isBlueHomeLane
                      ? 'bg-[#3B82F6]'
                      : isBlueStart
                      ? 'bg-blue-100'
                      : 'bg-white'
                  }`}
                >
                  {isSafe && <Star className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 fill-blue-500" />}
                </div>
              );
            })}
          </div>

          {/* Bottom-Right: Yellow Yard (6x6) */}
          <div className="col-span-6 row-span-6 bg-[#FBBF24] border-2 border-slate-900 p-2 sm:p-3 flex items-center justify-center">
            <div className="w-full h-full bg-white rounded-2xl border-2 border-slate-900 grid grid-cols-2 grid-rows-2 p-2 gap-2 shadow-inner">
              {YARD_POCKETS.yellow.map((pocket, idx) => (
                <div
                  key={idx}
                  className="rounded-full bg-amber-100 border-2 border-[#FBBF24] flex items-center justify-center shadow-inner"
                />
              ))}
            </div>
          </div>

        </div>

        {/* Overlay Tokens with Absolute Positioning */}
        {tokens.map((token) => {
          if (!activePlayers.includes(token.color)) return null;

          const pos = getTokenPosition(token);
          const isPlayable =
            hasRolled &&
            diceValue !== null &&
            token.color === currentColor &&
            canTokenMove(token, diceValue) &&
            !movingTokenId &&
            !winner &&
            !isCurrentBot;

          // Find overlapping tokens on the same cell
          const overlapping = tokens.filter(
            (o) =>
              activePlayers.includes(o.color) &&
              o.step >= 0 &&
              o.step === token.step &&
              o.color === token.color
          );
          const offsetIdx = overlapping.findIndex((o) => o.id === token.id);
          const microOffsetX = overlapping.length > 1 ? (offsetIdx % 2 === 0 ? -4 : 4) : 0;
          const microOffsetY = overlapping.length > 1 ? (offsetIdx >= 2 ? 4 : -4) : 0;

          // Compute absolute percentage coordinates for 15x15 board
          const leftPercent = ((pos.c + 0.5) / 15) * 100;
          const topPercent = ((pos.r + 0.5) / 15) * 100;

          return (
            <button
              key={`${token.color}-${token.id}`}
              onClick={() => handleTokenClick(token)}
              disabled={!isPlayable}
              aria-label={`${token.color} token ${token.id + 1}`}
              style={{
                left: `calc(${leftPercent}% + ${microOffsetX}px)`,
                top: `calc(${topPercent}% + ${microOffsetY}px)`,
                transform: 'translate(-50%, -50%)',
              }}
              className={`absolute w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-white shadow-xl flex items-center justify-center transition-all duration-100 z-10 ${
                isPlayable
                  ? 'ring-4 ring-white shadow-2xl scale-125 animate-bounce cursor-pointer z-30'
                  : 'cursor-default'
              }`}
            >
              {/* 3D Glossy Pawn Face */}
              <div
                className="w-full h-full rounded-full shadow-inner flex items-center justify-center text-[10px] font-black text-white"
                style={{
                  background: `radial-gradient(circle at 35% 35%, ${PLAYER_COLORS[token.color].light}, ${PLAYER_COLORS[token.color].primary} 60%, ${PLAYER_COLORS[token.color].dark})`,
                }}
              >
                {token.step === 56 ? '★' : token.id + 1}
              </div>
            </button>
          );
        })}

        {/* Win Celebration Modal Overlay */}
        {winner && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center gap-4 z-40 animate-in fade-in zoom-in-95 duration-200 p-6 text-center">
            <Trophy className="w-16 h-16 text-amber-400 animate-bounce" />
            <div>
              <h3 className="text-3xl sm:text-4xl font-black text-white capitalize">
                {PLAYER_COLORS[winner].name} Player Wins!
              </h3>
              <p className="text-xs sm:text-sm text-gray-300 mt-1">
                All 4 tokens successfully completed the circuit and reached Home!
              </p>
            </div>
            <button
              onClick={resetGame}
              className="px-8 py-3.5 rounded-xl font-bold bg-gradient-to-r from-rose-600 via-amber-500 to-emerald-600 text-white shadow-xl hover:scale-105 active:scale-95 transition-all text-sm mt-2"
            >
              Play Again
            </button>
          </div>
        )}
      </div>

      {/* Instructions helper */}
      <p className="text-xs text-gray-500 text-center">
        💡 Tap the <strong className="text-gray-300">dice in the center</strong> to roll • Roll a <strong className="text-gray-300">6</strong> to exit home yard • Safe on stars ⭐
      </p>

    </div>
  );
}
