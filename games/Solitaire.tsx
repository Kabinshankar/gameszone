'use client';

import { useState, useCallback, useEffect } from 'react';
import { RotateCcw, Volume2, VolumeX, Trophy, Undo2, Zap } from 'lucide-react';
import { saveStats, getStats } from '@/lib/storage';
import { sound } from '@/lib/audio';

// ── Card Definitions ───────────────────────────────────────────────
type Suit = '♠' | '♥' | '♦' | '♣';
type Color = 'red' | 'black';

interface Card {
  suit: Suit;
  rank: number; // 1=Ace, 2-10, 11=J, 12=Q, 13=K
  faceUp: boolean;
  id: string;
}

const SUITS: Suit[] = ['♠', '♥', '♦', '♣'];
const RANK_NAMES: Record<number, string> = {
  1: 'A', 2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7',
  8: '8', 9: '9', 10: '10', 11: 'J', 12: 'Q', 13: 'K',
};

function suitColor(suit: Suit): Color {
  return suit === '♥' || suit === '♦' ? 'red' : 'black';
}

function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (let rank = 1; rank <= 13; rank++) {
      deck.push({ suit, rank, faceUp: false, id: `${suit}${rank}` });
    }
  }
  // Shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

interface GameState {
  tableau: Card[][]; // 7 columns
  foundation: Card[][]; // 4 piles (one per suit)
  stock: Card[];
  waste: Card[];
  moves: number;
  time: number;
}

interface DragSource {
  area: 'tableau' | 'waste' | 'foundation';
  colIndex?: number;
  cardIndex?: number;
}

function createInitialState(): GameState {
  const deck = createDeck();
  const tableau: Card[][] = [];
  let deckIdx = 0;

  for (let col = 0; col < 7; col++) {
    const pile: Card[] = [];
    for (let row = 0; row <= col; row++) {
      const card = { ...deck[deckIdx++] };
      card.faceUp = row === col;
      pile.push(card);
    }
    tableau.push(pile);
  }

  const stock = deck.slice(deckIdx).map((c) => ({ ...c, faceUp: false }));

  return {
    tableau,
    foundation: [[], [], [], []],
    stock,
    waste: [],
    moves: 0,
    time: 0,
  };
}

function deepCloneState(state: GameState): GameState {
  return {
    tableau: state.tableau.map((col) => col.map((c) => ({ ...c }))),
    foundation: state.foundation.map((pile) => pile.map((c) => ({ ...c }))),
    stock: state.stock.map((c) => ({ ...c })),
    waste: state.waste.map((c) => ({ ...c })),
    moves: state.moves,
    time: state.time,
  };
}

export default function Solitaire() {
  const [state, setState] = useState<GameState>(createInitialState);
  const [history, setHistory] = useState<GameState[]>([]);
  const [dragSource, setDragSource] = useState<DragSource | null>(null);
  const [dragCards, setDragCards] = useState<Card[]>([]);
  const [isWon, setIsWon] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [wins, setWins] = useState(0);
  const [bestMoves, setBestMoves] = useState<number | null>(null);
  const [selectedSource, setSelectedSource] = useState<DragSource | null>(null);

  useEffect(() => {
    const stats = getStats('solitaire');
    if (stats.wins) setWins(stats.wins);
    if (stats.highScore) setBestMoves(stats.highScore);
  }, []);

  // Timer
  useEffect(() => {
    if (!isRunning || isWon) return;
    const timer = setInterval(() => {
      setState((prev) => ({ ...prev, time: prev.time + 1 }));
    }, 1000);
    return () => clearInterval(timer);
  }, [isRunning, isWon]);

  // Win check
  useEffect(() => {
    const totalFoundation = state.foundation.reduce((sum, pile) => sum + pile.length, 0);
    if (totalFoundation === 52 && !isWon) {
      setIsWon(true);
      setIsRunning(false);
      const newWins = wins + 1;
      setWins(newWins);
      const best = bestMoves === null ? state.moves : Math.min(bestMoves, state.moves);
      setBestMoves(best);
      saveStats('solitaire', { wins: newWins, highScore: best });
      if (soundEnabled) sound.playWin();
    }
  }, [state.foundation, isWon, wins, bestMoves, state.moves, soundEnabled]);

  // ── Save history for undo ────────────────────────────────────────
  const pushHistory = useCallback(() => {
    setHistory((prev) => [...prev.slice(-20), deepCloneState(state)]);
  }, [state]);

  const undo = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setState(prev);
    if (soundEnabled) sound.playPop();
  };

  // ── Can place on foundation ──────────────────────────────────────
  const canPlaceOnFoundation = (card: Card, pileIndex: number): boolean => {
    const pile = state.foundation[pileIndex];
    if (pile.length === 0) return card.rank === 1;
    const top = pile[pile.length - 1];
    return top.suit === card.suit && card.rank === top.rank + 1;
  };

  // ── Can place on tableau ─────────────────────────────────────────
  const canPlaceOnTableau = (card: Card, colIndex: number): boolean => {
    const col = state.tableau[colIndex];
    if (col.length === 0) return card.rank === 13; // Only kings on empty columns
    const top = col[col.length - 1];
    return top.faceUp && suitColor(card.suit) !== suitColor(top.suit) && card.rank === top.rank - 1;
  };

  // ── Draw from stock ──────────────────────────────────────────────
  const drawStock = () => {
    if (!isRunning) setIsRunning(true);
    pushHistory();

    setState((prev) => {
      const newState = deepCloneState(prev);
      if (newState.stock.length === 0) {
        // Recycle waste back to stock
        newState.stock = newState.waste.reverse().map((c) => ({ ...c, faceUp: false }));
        newState.waste = [];
      } else {
        const card = newState.stock.pop()!;
        card.faceUp = true;
        newState.waste.push(card);
      }
      newState.moves++;
      return newState;
    });
    if (soundEnabled) sound.playPop();
  };

  // ── Move card(s) ─────────────────────────────────────────────────
  const performMove = useCallback((
    source: DragSource,
    targetArea: 'tableau' | 'foundation',
    targetIndex: number,
  ) => {
    if (!isRunning) setIsRunning(true);
    pushHistory();

    setState((prev) => {
      const newState = deepCloneState(prev);

      // Get source cards
      let movingCards: Card[] = [];

      if (source.area === 'waste') {
        if (newState.waste.length === 0) return prev;
        movingCards = [newState.waste.pop()!];
      } else if (source.area === 'tableau' && source.colIndex !== undefined && source.cardIndex !== undefined) {
        const col = newState.tableau[source.colIndex];
        movingCards = col.splice(source.cardIndex);
        // Flip top card if hidden
        if (col.length > 0 && !col[col.length - 1].faceUp) {
          col[col.length - 1].faceUp = true;
        }
      } else if (source.area === 'foundation' && source.colIndex !== undefined) {
        const pile = newState.foundation[source.colIndex];
        if (pile.length === 0) return prev;
        movingCards = [pile.pop()!];
      }

      if (movingCards.length === 0) return prev;

      // Place cards
      if (targetArea === 'foundation') {
        if (movingCards.length !== 1) return prev;
        if (!canPlaceOnFoundation(movingCards[0], targetIndex)) {
          // Put cards back
          if (source.area === 'waste') newState.waste.push(...movingCards);
          else if (source.area === 'tableau' && source.colIndex !== undefined) {
            newState.tableau[source.colIndex].push(...movingCards);
          } else if (source.area === 'foundation' && source.colIndex !== undefined) {
            newState.foundation[source.colIndex].push(...movingCards);
          }
          return prev;
        }
        newState.foundation[targetIndex].push(movingCards[0]);
      } else {
        if (!canPlaceOnTableau(movingCards[0], targetIndex)) {
          // Put cards back
          if (source.area === 'waste') newState.waste.push(...movingCards);
          else if (source.area === 'tableau' && source.colIndex !== undefined) {
            newState.tableau[source.colIndex].push(...movingCards);
          } else if (source.area === 'foundation' && source.colIndex !== undefined) {
            newState.foundation[source.colIndex].push(...movingCards);
          }
          return prev;
        }
        newState.tableau[targetIndex].push(...movingCards);
      }

      newState.moves++;
      return newState;
    });

    if (soundEnabled) sound.playPlace();
    setSelectedSource(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pushHistory, soundEnabled, isRunning]);

  // ── Auto-move to foundation ──────────────────────────────────────
  const tryAutoFoundation = useCallback((card: Card, source: DragSource) => {
    for (let i = 0; i < 4; i++) {
      if (canPlaceOnFoundation(card, i)) {
        performMove(source, 'foundation', i);
        return true;
      }
    }
    return false;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [performMove, state.foundation]);

  // ── Click-to-select-then-click-target ────────────────────────────
  const handleCardClick = (source: DragSource, card: Card) => {
    if (isWon) return;

    // Double-click: try to auto-move to foundation
    if (selectedSource && selectedSource.area === source.area &&
        selectedSource.colIndex === source.colIndex &&
        selectedSource.cardIndex === source.cardIndex) {
      tryAutoFoundation(card, source);
      setSelectedSource(null);
      return;
    }

    // If we have a selection, try to move to the clicked destination
    if (selectedSource) {
      // Determine where to place
      if (source.area === 'tableau' && source.colIndex !== undefined) {
        performMove(selectedSource, 'tableau', source.colIndex);
      } else if (source.area === 'foundation' && source.colIndex !== undefined) {
        performMove(selectedSource, 'foundation', source.colIndex);
      }
      setSelectedSource(null);
      return;
    }

    // Start selection
    setSelectedSource(source);
  };

  const handleEmptyTableauClick = (colIndex: number) => {
    if (selectedSource) {
      performMove(selectedSource, 'tableau', colIndex);
      setSelectedSource(null);
    }
  };

  const handleEmptyFoundationClick = (pileIndex: number) => {
    if (selectedSource) {
      performMove(selectedSource, 'foundation', pileIndex);
      setSelectedSource(null);
    }
  };

  // ── Reset ────────────────────────────────────────────────────────
  const newGame = () => {
    setState(createInitialState());
    setHistory([]);
    setIsWon(false);
    setIsRunning(false);
    setSelectedSource(null);
  };

  // ── Auto-complete ────────────────────────────────────────────────
  const canAutoComplete = () => {
    // All cards face up and stock/waste empty
    if (state.stock.length > 0 || state.waste.length > 0) return false;
    return state.tableau.every((col) => col.every((c) => c.faceUp));
  };

  const autoComplete = useCallback(() => {
    if (!canAutoComplete()) return;

    const interval = setInterval(() => {
      setState((prev) => {
        const newState = deepCloneState(prev);
        let moved = false;

        for (let col = 0; col < 7; col++) {
          const pile = newState.tableau[col];
          if (pile.length === 0) continue;
          const card = pile[pile.length - 1];

          for (let f = 0; f < 4; f++) {
            const fPile = newState.foundation[f];
            if (fPile.length === 0 && card.rank === 1) {
              fPile.push(pile.pop()!);
              moved = true;
              break;
            }
            if (fPile.length > 0 && fPile[fPile.length - 1].suit === card.suit && card.rank === fPile[fPile.length - 1].rank + 1) {
              fPile.push(pile.pop()!);
              moved = true;
              break;
            }
          }
          if (moved) break;
        }

        if (!moved) {
          clearInterval(interval);
        }

        return newState;
      });
    }, 100);

    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  // ── Format time ──────────────────────────────────────────────────
  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  // ── Render card ──────────────────────────────────────────────────
  const renderCard = (card: Card, source: DragSource, stacked = false, isTopOfSelection = false) => {
    const isSelected = selectedSource &&
      selectedSource.area === source.area &&
      selectedSource.colIndex === source.colIndex &&
      (source.area === 'waste' || source.area === 'foundation' ||
       (source.cardIndex !== undefined && selectedSource.cardIndex !== undefined && source.cardIndex >= selectedSource.cardIndex));

    if (!card.faceUp) {
      return (
        <div
          className={`w-[52px] h-[72px] sm:w-[60px] sm:h-[84px] rounded-lg border-2 border-zinc-600 cursor-default flex items-center justify-center ${stacked ? '' : ''}`}
          style={{
            background: 'linear-gradient(135deg, #1e3a5f, #2d5a87)',
            boxShadow: '0 2px 6px rgba(0,0,0,0.4), inset 0 1px 2px rgba(255,255,255,0.1)',
          }}
        >
          <div className="text-lg opacity-30">🂠</div>
        </div>
      );
    }

    const color = suitColor(card.suit);
    const textColor = color === 'red' ? 'text-red-500' : 'text-zinc-100';
    const rankStr = RANK_NAMES[card.rank];

    return (
      <div
        className={`w-[52px] h-[72px] sm:w-[60px] sm:h-[84px] rounded-lg border-2 cursor-pointer transition-all duration-100 ${
          isSelected
            ? 'border-cyan-400 shadow-lg shadow-cyan-500/40 -translate-y-1 scale-105'
            : 'border-zinc-500/50 hover:border-zinc-300/60 hover:-translate-y-0.5'
        }`}
        style={{
          background: isSelected
            ? 'linear-gradient(145deg, #fefefe, #e8e8e8)'
            : 'linear-gradient(145deg, #ffffff, #f0f0f0)',
          boxShadow: isSelected
            ? '0 4px 12px rgba(6,182,212,0.4), inset 0 1px 2px rgba(255,255,255,0.9)'
            : '0 2px 6px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.9)',
        }}
        onClick={() => handleCardClick(source, card)}
      >
        <div className="p-1 h-full flex flex-col justify-between">
          <div className={`text-[10px] sm:text-xs font-black leading-none ${textColor}`}>
            {rankStr}
            <br />
            <span className="text-xs sm:text-sm">{card.suit}</span>
          </div>
          <div className={`text-xs sm:text-sm text-right ${textColor}`}>
            {card.suit}
          </div>
        </div>
      </div>
    );
  };

  const FOUNDATION_SUITS: Suit[] = ['♠', '♥', '♦', '♣'];

  return (
    <div className="flex flex-col items-center gap-3 w-full select-none overflow-x-auto">
      {/* Controls */}
      <div className="flex items-center gap-2 flex-wrap justify-center">
        <button
          onClick={() => setSoundEnabled((p) => { sound.setEnabled(!p); return !p; })}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-white/10 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-all"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
        <button
          onClick={undo}
          disabled={history.length === 0}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-white/10 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-all disabled:opacity-30"
        >
          <Undo2 className="w-4 h-4" /> Undo
        </button>
        {canAutoComplete() && (
          <button
            onClick={autoComplete}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 transition-all animate-pulse"
          >
            <Zap className="w-4 h-4" /> Auto Complete
          </button>
        )}
        <button
          onClick={newGame}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 hover:text-cyan-200 transition-all"
        >
          <RotateCcw className="w-4 h-4" /> New Game
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 w-full max-w-md">
        {[
          { label: 'Moves', value: state.moves, icon: '♟️' },
          { label: 'Time', value: formatTime(state.time), icon: '⏱️' },
          { label: 'Wins', value: wins, icon: '🏆' },
          { label: 'Best', value: bestMoves !== null ? bestMoves : '--', icon: '⭐' },
        ].map((stat) => (
          <div key={stat.label} className="bg-zinc-800/60 border border-white/5 rounded-xl p-2 text-center">
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider">{stat.icon} {stat.label}</div>
            <div className="text-base sm:text-lg font-black text-white">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Top Row: Stock + Waste + Foundation */}
      <div className="flex gap-2 sm:gap-3 items-start w-full max-w-[520px] sm:max-w-[580px]">
        {/* Stock */}
        <div
          className="w-[52px] h-[72px] sm:w-[60px] sm:h-[84px] rounded-lg border-2 border-dashed border-zinc-700 flex items-center justify-center cursor-pointer shrink-0"
          onClick={drawStock}
          style={{
            background: state.stock.length > 0 ? 'linear-gradient(135deg, #1e3a5f, #2d5a87)' : 'rgba(255,255,255,0.03)',
          }}
        >
          {state.stock.length > 0 ? (
            <div className="text-lg opacity-40">🂠</div>
          ) : (
            <RotateCcw className="w-5 h-5 text-zinc-600" />
          )}
        </div>

        {/* Waste */}
        <div className="w-[52px] sm:w-[60px] shrink-0">
          {state.waste.length > 0 ? (
            renderCard(
              state.waste[state.waste.length - 1],
              { area: 'waste' },
            )
          ) : (
            <div className="w-[52px] h-[72px] sm:w-[60px] sm:h-[84px] rounded-lg border-2 border-dashed border-zinc-700/50" />
          )}
        </div>

        {/* Spacer */}
        <div className="w-[52px] sm:w-[60px] shrink-0" />

        {/* Foundation */}
        {state.foundation.map((pile, i) => (
          <div
            key={i}
            className="shrink-0"
            onClick={() => pile.length === 0 && handleEmptyFoundationClick(i)}
          >
            {pile.length > 0 ? (
              renderCard(
                pile[pile.length - 1],
                { area: 'foundation', colIndex: i },
              )
            ) : (
              <div className="w-[52px] h-[72px] sm:w-[60px] sm:h-[84px] rounded-lg border-2 border-dashed border-zinc-700/50 flex items-center justify-center cursor-pointer">
                <span className={`text-lg opacity-20 ${suitColor(FOUNDATION_SUITS[i]) === 'red' ? 'text-red-500' : 'text-zinc-400'}`}>
                  {FOUNDATION_SUITS[i]}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Tableau */}
      <div className="flex gap-1.5 sm:gap-2 items-start w-full max-w-[520px] sm:max-w-[580px] min-h-[300px]">
        {state.tableau.map((col, colIdx) => (
          <div
            key={colIdx}
            className="flex-1 min-w-[52px] sm:min-w-[60px]"
            onClick={() => col.length === 0 && handleEmptyTableauClick(colIdx)}
          >
            {col.length === 0 ? (
              <div className="w-full h-[72px] sm:h-[84px] rounded-lg border-2 border-dashed border-zinc-700/30 flex items-center justify-center cursor-pointer">
                <span className="text-zinc-700 text-xs">K</span>
              </div>
            ) : (
              <div className="relative" style={{ height: 72 + (col.length - 1) * (col.length > 8 ? 16 : 20) }}>
                {col.map((card, cardIdx) => (
                  <div
                    key={card.id}
                    className="absolute left-0 right-0"
                    style={{
                      top: cardIdx * (col.length > 8 ? 16 : 20),
                      zIndex: cardIdx,
                    }}
                  >
                    {renderCard(
                      card,
                      { area: 'tableau', colIndex: colIdx, cardIndex: cardIdx },
                      true,
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Win overlay */}
      {isWon && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-zinc-900 border border-white/10 rounded-2xl p-8 text-center max-w-sm mx-4 shadow-2xl">
            <div className="text-5xl mb-3">🎉</div>
            <div className="text-2xl font-black text-white mb-1">YOU WIN!</div>
            <div className="text-zinc-400 text-sm mb-4">
              Moves: <span className="text-white font-bold">{state.moves}</span> •
              Time: <span className="text-white font-bold">{formatTime(state.time)}</span>
            </div>
            {bestMoves !== null && state.moves <= bestMoves && (
              <div className="flex items-center justify-center gap-1.5 text-amber-400 text-xs font-bold mb-4">
                <Trophy className="w-4 h-4" /> New Best Score!
              </div>
            )}
            <button
              onClick={newGame}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-sm hover:scale-105 active:scale-95 transition-transform shadow-lg shadow-cyan-500/30"
            >
              New Game
            </button>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="text-[10px] text-zinc-500 text-center max-w-md">
        Click a card to select it, then click a valid destination. Double-click to auto-move to foundation. Build tableau in alternating colors descending. Build foundation by suit ascending from Ace.
      </div>
    </div>
  );
}
