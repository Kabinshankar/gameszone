'use client';

import { useState } from 'react';
import { RotateCcw, Trophy, Zap } from 'lucide-react';

type Choice = 'rock' | 'paper' | 'scissors';
type MatchMode = 'single' | 'bo3' | 'bo5';

const CHOICES: { id: Choice; name: string; emoji: string; beats: Choice }[] = [
  { id: 'rock', name: 'Rock', emoji: '🪨', beats: 'scissors' },
  { id: 'paper', name: 'Paper', emoji: '📄', beats: 'rock' },
  { id: 'scissors', name: 'Scissors', emoji: '✂️', beats: 'paper' },
];

export default function RockPaperScissors() {
  const [playerChoice, setPlayerChoice] = useState<Choice | null>(null);
  const [computerChoice, setComputerChoice] = useState<Choice | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [scores, setScores] = useState({ player: 0, computer: 0 });
  const [matchMode, setMatchMode] = useState<MatchMode>('single');
  const [matchWinner, setMatchWinner] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);

  const handlePlay = (choice: Choice) => {
    if (matchWinner || isThinking) return;

    setPlayerChoice(choice);
    setComputerChoice(null);
    setResult(null);
    setIsThinking(true);

    setTimeout(() => {
      const comp = CHOICES[Math.floor(Math.random() * CHOICES.length)].id;
      setComputerChoice(comp);
      setIsThinking(false);

      if (choice === comp) {
        setResult('draw');
      } else {
        const playerChoiceObj = CHOICES.find((c) => c.id === choice)!;
        if (playerChoiceObj.beats === comp) {
          setResult('win');
          const newPlayerScore = scores.player + 1;
          setScores((prev) => ({ ...prev, player: newPlayerScore }));
          checkMatchWinner(newPlayerScore, scores.computer);
        } else {
          setResult('lose');
          const newCompScore = scores.computer + 1;
          setScores((prev) => ({ ...prev, computer: newCompScore }));
          checkMatchWinner(scores.player, newCompScore);
        }
      }
    }, 600);
  };

  const checkMatchWinner = (pScore: number, cScore: number) => {
    const target = matchMode === 'bo3' ? 2 : matchMode === 'bo5' ? 3 : 0;
    if (target > 0) {
      if (pScore >= target) setMatchWinner('Player');
      else if (cScore >= target) setMatchWinner('Computer');
    }
  };

  const resetAll = () => {
    setPlayerChoice(null);
    setComputerChoice(null);
    setResult(null);
    setScores({ player: 0, computer: 0 });
    setMatchWinner(null);
  };

  return (
    <div className="w-full flex flex-col items-center select-none">
      
      {/* Mode Selector & Reset */}
      <div className="w-full max-w-[700px] flex items-center justify-between gap-3 bg-white/[0.04] border border-white/10 p-2 sm:p-2.5 rounded-2xl mb-6">
        <div className="flex bg-black/40 p-1 rounded-xl border border-white/10 gap-1">
          {(['single', 'bo3', 'bo5'] as MatchMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => { setMatchMode(mode); resetAll(); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase transition-all cursor-pointer ${
                matchMode === mode
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {mode === 'single' ? 'Quick Play' : mode.toUpperCase()}
            </button>
          ))}
        </div>

        <button
          onClick={resetAll}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 text-xs font-medium"
          title="Reset Game"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>

      {/* Scoreboard */}
      <div className="grid grid-cols-2 gap-4 w-full max-w-[700px] mb-6">
        <div className="bg-gradient-to-br from-indigo-950/60 to-purple-950/60 border border-indigo-500/30 p-4 sm:p-5 rounded-2xl flex flex-col items-center justify-center shadow-lg">
          <span className="text-xs text-indigo-300 font-bold uppercase tracking-wider mb-1">You</span>
          <span className="text-3xl sm:text-4xl font-black text-white">{scores.player}</span>
        </div>
        <div className="bg-gradient-to-br from-rose-950/60 to-pink-950/60 border border-rose-500/30 p-4 sm:p-5 rounded-2xl flex flex-col items-center justify-center shadow-lg">
          <span className="text-xs text-rose-300 font-bold uppercase tracking-wider mb-1">Computer</span>
          <span className="text-3xl sm:text-4xl font-black text-white">{scores.computer}</span>
        </div>
      </div>

      {/* Battle Arena Display */}
      <div className="relative w-full min-h-[260px] p-6 sm:p-8 bg-[#101017] border border-white/10 rounded-[24px] flex items-center justify-center gap-[clamp(24px,8vw,120px)] shadow-2xl overflow-hidden box-border">
        
        {/* Player Side */}
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-4xl sm:text-5xl shadow-inner">
            {playerChoice ? CHOICES.find((c) => c.id === playerChoice)?.emoji : '❓'}
          </div>
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Your Choice</span>
        </div>

        {/* VS / Outcome */}
        <div className="min-w-[120px] sm:min-w-[160px] flex flex-col items-center justify-center text-center gap-1.5 shrink-0">
          {isThinking ? (
            <div className="flex flex-col items-center gap-2">
              <Zap className="w-8 h-8 text-amber-400 animate-spin" />
              <span className="text-xs text-amber-400 font-bold uppercase tracking-wider animate-pulse">
                Thinking...
              </span>
            </div>
          ) : result ? (
            <div className="flex flex-col items-center gap-1">
              <span className={`text-xl sm:text-2xl font-black uppercase tracking-wider ${
                result === 'win' ? 'text-emerald-400' : result === 'lose' ? 'text-rose-400' : 'text-amber-400'
              }`}>
                {result === 'win' ? 'YOU WIN!' : result === 'lose' ? 'YOU LOSE!' : 'DRAW!'}
              </span>
              <span className="text-[11px] text-zinc-400 font-medium">
                {result === 'win' ? 'Point awarded!' : result === 'lose' ? 'Computer scored' : 'No points scored'}
              </span>
            </div>
          ) : (
            <span className="text-2xl sm:text-3xl font-black text-zinc-600 tracking-wider">VS</span>
          )}
        </div>

        {/* Computer Side */}
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-4xl sm:text-5xl shadow-inner">
            {isThinking ? '🎲' : computerChoice ? CHOICES.find((c) => c.id === computerChoice)?.emoji : '❓'}
          </div>
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Computer</span>
        </div>

        {/* Match Winner Overlay */}
        {matchWinner && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center gap-4 z-20 p-6 text-center animate-fade-in">
            <Trophy className="w-12 h-12 sm:w-14 sm:h-14 text-amber-400 animate-bounce" />
            <div>
              <h3 className="text-2xl sm:text-3xl font-black text-white">
                {matchWinner === 'Player' ? '🎉 You Won the Series!' : '💀 Computer Won the Series!'}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                Final Score: {scores.player} - {scores.computer} in {matchMode.toUpperCase()}
              </p>
            </div>
            <button
              onClick={resetAll}
              className="px-6 py-2.5 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg transition-all cursor-pointer text-sm"
            >
              Play New Series
            </button>
          </div>
        )}
      </div>

      {/* Choice Buttons */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 w-full max-w-[760px] mt-6">
        {CHOICES.map((choice) => (
          <button
            key={choice.id}
            onClick={() => handlePlay(choice.id)}
            disabled={!!matchWinner || isThinking}
            className="min-h-[72px] sm:min-h-[84px] p-3 sm:p-4 rounded-2xl bg-white/[0.04] hover:bg-indigo-600/20 border border-white/10 hover:border-indigo-500/40 active:scale-95 transition-all flex flex-col items-center justify-center gap-1.5 group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            <span className="text-3xl sm:text-4xl group-hover:scale-110 transition-transform">
              {choice.emoji}
            </span>
            <span className="text-xs sm:text-sm font-bold text-white tracking-wide">
              {choice.name}
            </span>
          </button>
        ))}
      </div>

    </div>
  );
}
