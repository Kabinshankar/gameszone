'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { RotateCcw, Volume2, VolumeX, Trophy, Flame, Timer } from 'lucide-react';
import { saveStats, getStats } from '@/lib/storage';
import { sound } from '@/lib/audio';

// ── Color Definitions ──────────────────────────────────────────────
interface ColorDef {
  name: string;
  hex: string;
}

const COLORS: ColorDef[] = [
  { name: 'RED',    hex: '#ef4444' },
  { name: 'BLUE',   hex: '#3b82f6' },
  { name: 'GREEN',  hex: '#22c55e' },
  { name: 'YELLOW', hex: '#eab308' },
  { name: 'PURPLE', hex: '#a855f7' },
  { name: 'ORANGE', hex: '#f97316' },
  { name: 'PINK',   hex: '#ec4899' },
  { name: 'CYAN',   hex: '#06b6d4' },
];

type GameMode = 'classic' | 'speed' | 'zen';

interface Question {
  word: ColorDef;       // The text label shown
  inkColor: ColorDef;   // The color the text is written in
  match: boolean;       // Does word === ink?
}

function generateQuestion(): Question {
  const word = COLORS[Math.floor(Math.random() * COLORS.length)];
  const match = Math.random() < 0.5;
  let inkColor: ColorDef;

  if (match) {
    inkColor = word;
  } else {
    const others = COLORS.filter((c) => c.name !== word.name);
    inkColor = others[Math.floor(Math.random() * others.length)];
  }

  return { word, inkColor, match };
}

const MODE_CONFIG: Record<GameMode, { label: string; duration: number; description: string }> = {
  classic: { label: '⭐ Classic', duration: 30, description: 'Does the text color match the ink color? 30s' },
  speed:   { label: '⚡ Speed',   duration: 20, description: 'Faster pace, shorter time. 20s' },
  zen:     { label: '🧘 Zen',     duration: 0,  description: 'No timer — pure focus practice' },
};

export default function ColorMatch() {
  const [mode, setMode] = useState<GameMode>('classic');
  const [question, setQuestion] = useState<Question>(generateQuestion);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [totalGames, setTotalGames] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [animKey, setAnimKey] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const feedbackRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scoreRef = useRef(score);
  scoreRef.current = score;
  const streakRef = useRef(streak);
  streakRef.current = streak;

  useEffect(() => {
    const stats = getStats('color-match');
    if (stats.highScore) setHighScore(stats.highScore);
    if (stats.gamesPlayed) setTotalGames(stats.gamesPlayed);
  }, []);

  // ── Timer ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isRunning || mode === 'zen') return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          finishGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, mode]);

  // ── Finish Game ──────────────────────────────────────────────────
  const finishGame = useCallback(() => {
    setIsRunning(false);
    setIsFinished(true);
    if (timerRef.current) clearInterval(timerRef.current);

    const finalScore = scoreRef.current;
    const finalStreak = streakRef.current;
    const newTotal = totalGames + 1;
    setTotalGames(newTotal);

    const newBest = Math.max(highScore, finalScore);
    const newBestStreak = Math.max(bestStreak, finalStreak);
    setHighScore(newBest);
    setBestStreak(newBestStreak);

    saveStats('color-match', {
      highScore: newBest,
      gamesPlayed: newTotal,
    });

    if (soundEnabled) {
      if (finalScore > highScore) sound.playWin();
      else sound.playScore();
    }
  }, [totalGames, highScore, bestStreak, soundEnabled]);

  // ── Start / Restart ──────────────────────────────────────────────
  const startGame = () => {
    setQuestion(generateQuestion());
    setScore(0);
    setStreak(0);
    setCorrectCount(0);
    setWrongCount(0);
    setFeedback(null);
    setIsFinished(false);
    const duration = MODE_CONFIG[mode].duration;
    setTimeLeft(duration);
    setIsRunning(true);
    setAnimKey((k) => k + 1);
  };

  // ── Answer ───────────────────────────────────────────────────────
  const handleAnswer = (playerSaysMatch: boolean) => {
    if (!isRunning || isFinished || feedback) return;

    const isCorrect = playerSaysMatch === question.match;

    if (isCorrect) {
      const multiplier = Math.floor(streakRef.current / 3) + 1;
      const points = 10 * multiplier;
      const newScore = scoreRef.current + points;
      const newStreak = streakRef.current + 1;
      setScore(newScore);
      scoreRef.current = newScore;
      setStreak(newStreak);
      streakRef.current = newStreak;
      setCorrectCount((c) => c + 1);
      setFeedback('correct');
      if (soundEnabled) sound.playScore();
    } else {
      setStreak(0);
      streakRef.current = 0;
      setWrongCount((w) => w + 1);
      setFeedback('wrong');
      if (soundEnabled) sound.playError();
    }

    // Speed: reduce time on wrong
    if (mode === 'speed' && !isCorrect) {
      setTimeLeft((t) => Math.max(0, t - 3));
    }

    // Zen: finish after 20 answers
    if (mode === 'zen' && correctCount + wrongCount + 1 >= 20) {
      setTimeout(finishGame, 400);
      return;
    }

    // Next question after brief feedback
    feedbackRef.current = setTimeout(() => {
      setFeedback(null);
      setQuestion(generateQuestion());
      setAnimKey((k) => k + 1);
    }, 350);
  };

  // ── Timer bar color ──────────────────────────────────────────────
  const duration = MODE_CONFIG[mode].duration;
  const timerPercent = duration > 0 ? (timeLeft / duration) * 100 : 100;
  const timerColor = timerPercent > 50 ? '#22c55e' : timerPercent > 25 ? '#eab308' : '#ef4444';

  // ── Streak flames ────────────────────────────────────────────────
  const flameCount = Math.floor(streak / 3);

  return (
    <div className="flex flex-col items-center gap-4 w-full select-none">
      {/* Controls */}
      <div className="flex items-center gap-2 flex-wrap justify-center">
        <button
          onClick={() => setSoundEnabled((p) => { sound.setEnabled(!p); return !p; })}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-white/10 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-all"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {(['classic', 'speed', 'zen'] as GameMode[]).map((m) => (
          <button
            key={m}
            onClick={() => { setMode(m); setIsRunning(false); setIsFinished(false); }}
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
              mode === m
                ? 'border-purple-500/50 bg-purple-500/20 text-purple-300'
                : 'border-white/10 bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
            }`}
          >
            {MODE_CONFIG[m].label}
          </button>
        ))}

        <button
          onClick={startGame}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 hover:text-cyan-200 transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          {isRunning ? 'Restart' : 'Start'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 w-full max-w-md">
        {[
          { label: 'Score', value: score, icon: '🎯' },
          { label: 'Streak', value: streak, icon: '🔥' },
          { label: 'Correct', value: correctCount, icon: '✅' },
          { label: 'Best', value: highScore, icon: '🏆' },
        ].map((stat) => (
          <div key={stat.label} className="bg-zinc-800/60 border border-white/5 rounded-xl p-2 text-center">
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider">{stat.icon} {stat.label}</div>
            <div className="text-base sm:text-lg font-black text-white">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Timer Bar */}
      {mode !== 'zen' && (
        <div className="w-full max-w-md">
          <div className="flex justify-between text-xs text-zinc-500 mb-1">
            <span className="flex items-center gap-1"><Timer className="w-3 h-3" /> {timeLeft}s</span>
            <span>Mode: {MODE_CONFIG[mode].label}</span>
          </div>
          <div className="h-2.5 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-linear"
              style={{ width: `${timerPercent}%`, background: timerColor, boxShadow: `0 0 8px ${timerColor}88` }}
            />
          </div>
        </div>
      )}

      {/* Streak Flames */}
      {flameCount > 0 && isRunning && (
        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(flameCount, 5) }).map((_, i) => (
            <Flame key={i} className="w-5 h-5 text-orange-400 animate-pulse" />
          ))}
          <span className="text-orange-300 text-xs font-bold ml-1">x{Math.floor(streak / 3) + 1} Combo!</span>
        </div>
      )}

      {/* Game Area */}
      <div className="w-full max-w-md">
        {!isRunning && !isFinished ? (
          /* Start Screen */
          <div className="bg-zinc-800/40 border border-white/5 rounded-2xl p-8 text-center">
            <div className="text-5xl mb-4">🎨</div>
            <h2 className="text-white font-black text-xl mb-2">Color Match</h2>
            <p className="text-zinc-400 text-sm mb-2">{MODE_CONFIG[mode].description}</p>
            <p className="text-zinc-500 text-xs mb-6">
              Does the <strong className="text-white">word meaning</strong> match the <strong className="text-white">ink color</strong>?
            </p>
            {/* Demo */}
            <div className="mb-6">
              <div className="text-3xl font-black" style={{ color: '#3b82f6' }}>RED</div>
              <div className="text-xs text-zinc-500 mt-1">Word says "RED" but ink is blue → No Match ❌</div>
            </div>
            <button
              onClick={startGame}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold hover:scale-105 active:scale-95 transition-transform shadow-lg shadow-purple-500/30"
            >
              Start Game
            </button>
          </div>
        ) : isFinished ? (
          /* Results Screen */
          <div className="bg-zinc-800/40 border border-white/10 rounded-2xl p-6 text-center">
            <div className="text-4xl mb-2">
              {score > highScore && score > 0 ? '🏆' : score > 50 ? '🔥' : '🎨'}
            </div>
            <div className="text-2xl font-black text-white mb-1">Game Over!</div>
            <div className="text-3xl font-black text-purple-400 mb-4">{score} pts</div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-zinc-900/60 rounded-xl p-3">
                <div className="text-[10px] text-zinc-500 uppercase">Correct</div>
                <div className="text-lg font-black text-emerald-400">{correctCount}</div>
              </div>
              <div className="bg-zinc-900/60 rounded-xl p-3">
                <div className="text-[10px] text-zinc-500 uppercase">Wrong</div>
                <div className="text-lg font-black text-red-400">{wrongCount}</div>
              </div>
              <div className="bg-zinc-900/60 rounded-xl p-3">
                <div className="text-[10px] text-zinc-500 uppercase">Accuracy</div>
                <div className="text-lg font-black text-white">
                  {correctCount + wrongCount > 0
                    ? Math.round((correctCount / (correctCount + wrongCount)) * 100)
                    : 0}%
                </div>
              </div>
            </div>

            {score >= highScore && score > 0 && (
              <div className="flex items-center justify-center gap-1.5 text-amber-400 text-xs font-bold mb-3">
                <Trophy className="w-4 h-4" /> New High Score!
              </div>
            )}

            <button
              onClick={startGame}
              className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold hover:scale-[1.02] active:scale-95 transition-transform shadow-lg shadow-purple-500/30"
            >
              Play Again
            </button>
          </div>
        ) : (
          /* Active Game */
          <div
            className={`relative bg-zinc-800/40 border-2 rounded-2xl p-8 text-center transition-all duration-150 ${
              feedback === 'correct'
                ? 'border-emerald-500/60 bg-emerald-500/5'
                : feedback === 'wrong'
                ? 'border-red-500/60 bg-red-500/5'
                : 'border-white/5'
            }`}
          >
            {/* Question */}
            <div className="mb-2 text-zinc-500 text-xs uppercase tracking-widest font-bold">
              Does the word match the ink color?
            </div>

            <div
              key={animKey}
              className="text-5xl sm:text-6xl font-black mb-8 transition-all duration-200"
              style={{
                color: question.inkColor.hex,
                textShadow: `0 0 20px ${question.inkColor.hex}66`,
                animation: 'fadeInScale 0.2s ease-out',
              }}
            >
              {question.word.name}
            </div>

            {/* Feedback indicator */}
            {feedback && (
              <div className={`absolute top-4 right-4 text-2xl ${feedback === 'correct' ? 'text-emerald-400' : 'text-red-400'}`}>
                {feedback === 'correct' ? '✓' : '✗'}
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 sm:gap-4 justify-center">
              <button
                id="btn-match"
                onClick={() => handleAnswer(true)}
                disabled={!!feedback}
                className="flex-1 max-w-[140px] py-4 rounded-2xl font-black text-base sm:text-lg border-2 border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/25 hover:scale-105 active:scale-95 transition-all disabled:opacity-40"
                style={{ boxShadow: '0 0 15px rgba(34,197,94,0.15)' }}
              >
                ✓ MATCH
              </button>
              <button
                id="btn-no-match"
                onClick={() => handleAnswer(false)}
                disabled={!!feedback}
                className="flex-1 max-w-[140px] py-4 rounded-2xl font-black text-base sm:text-lg border-2 border-red-500/40 bg-red-500/10 text-red-300 hover:bg-red-500/25 hover:scale-105 active:scale-95 transition-all disabled:opacity-40"
                style={{ boxShadow: '0 0 15px rgba(239,68,68,0.15)' }}
              >
                ✗ NO MATCH
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="text-[10px] text-zinc-500 text-center max-w-sm">
        The Stroop Effect: your brain reads words faster than it processes colors. Does the word's meaning match the ink color?
        Higher streaks multiply your score!
      </div>

      <style jsx>{`
        @keyframes fadeInScale {
          from { opacity: 0.4; transform: scale(0.92); }
          to   { opacity: 1;   transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
