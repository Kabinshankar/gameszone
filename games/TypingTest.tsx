'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { RotateCcw, Volume2, VolumeX, Trophy, Timer, Keyboard, Zap } from 'lucide-react';
import { saveStats, getStats } from '@/lib/storage';
import { sound } from '@/lib/audio';

// ── Text Passages ──────────────────────────────────────────────────
const PASSAGES = [
  "The quick brown fox jumps over the lazy dog near the riverbank while the sun sets behind the mountains casting golden rays across the peaceful valley below.",
  "Technology continues to advance at an incredible pace transforming how we live work and communicate with each other across vast distances in mere seconds.",
  "A journey of a thousand miles begins with a single step and every great achievement starts with the decision to try something new and push beyond your limits.",
  "The ocean stretches endlessly before us waves crashing against the shore carrying secrets from distant lands and memories of ancient voyages across the deep blue.",
  "Music has the power to transport us to different places and times evoking emotions we thought were forgotten and creating bonds between people of all cultures.",
  "In the heart of the forest sunlight filters through the canopy creating patterns of light and shadow on the mossy ground where tiny creatures go about their day.",
  "Books are windows to other worlds offering us the chance to live countless lives experience impossible adventures and understand perspectives different from our own.",
  "The night sky sparkles with billions of stars each one a sun in its own right possibly surrounded by planets where life might exist in forms we cannot imagine.",
  "Cooking is both an art and a science requiring creativity patience and an understanding of how flavors combine to create dishes that delight the senses.",
  "The city never sleeps its streets alive with energy from the morning rush through the afternoon bustle to the vibrant nightlife that keeps the metropolis buzzing.",
  "Rain taps gently on the window creating a soothing rhythm that invites reflection and calm as the world outside transforms into a watercolor painting of gray and green.",
  "Innovation is not about having the best ideas but about executing them well learning from failures and continuously improving until something remarkable emerges from the process.",
  "Mountains stand as timeless sentinels their peaks touching the clouds while rivers carve through valleys below telling stories written in stone over millions of years.",
  "The art of communication lies not just in speaking clearly but in listening actively understanding context and responding with empathy and genuine interest in others.",
  "Every sunset is unique painting the sky with colors that will never appear in quite the same way again reminding us to appreciate the fleeting beauty of each moment.",
  "Space exploration represents humanitys greatest adventure pushing the boundaries of knowledge and technology while inspiring generations to dream of possibilities beyond our planet.",
  "Gardens are living art galleries where nature collaborates with human creativity to produce displays of color form and fragrance that change with every passing season.",
  "Learning a new language opens doors to understanding different cultures and ways of thinking enriching our lives with perspectives we never knew existed before.",
  "The rhythm of the waves the warmth of the sand and the salt in the air create a perfect symphony that draws millions to the coast every summer season.",
  "Architecture shapes our daily experience more than we realize influencing our mood productivity and interactions through the careful design of the spaces where we live and work.",
];

type TestDuration = 15 | 30 | 60;

interface TestResult {
  wpm: number;
  accuracy: number;
  correct: number;
  incorrect: number;
  total: number;
  time: number;
}

export default function TypingTest() {
  const [duration, setDuration] = useState<TestDuration>(30);
  const [text, setText] = useState('');
  const [typed, setTyped] = useState('');
  const [timeLeft, setTimeLeft] = useState(30);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);
  const [bestWpm, setBestWpm] = useState(0);
  const [totalTests, setTotalTests] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [currentWpm, setCurrentWpm] = useState(0);
  const [currentAccuracy, setCurrentAccuracy] = useState(100);

  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const textContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stats = getStats('typing-test');
    if (stats.highScore) setBestWpm(stats.highScore);
    if (stats.gamesPlayed) setTotalTests(stats.gamesPlayed);
  }, []);

  const generateText = useCallback(() => {
    // Pick 2-3 random passages and concatenate
    const shuffled = [...PASSAGES].sort(() => Math.random() - 0.5);
    const count = duration <= 15 ? 1 : duration <= 30 ? 2 : 3;
    return shuffled.slice(0, count).join(' ');
  }, [duration]);

  const startTest = useCallback(() => {
    const newText = generateText();
    setText(newText);
    setTyped('');
    setTimeLeft(duration);
    setIsRunning(false);
    setIsFinished(false);
    setResult(null);
    setCurrentWpm(0);
    setCurrentAccuracy(100);

    if (timerRef.current) clearInterval(timerRef.current);

    setTimeout(() => inputRef.current?.focus(), 100);
  }, [duration, generateText]);

  useEffect(() => {
    startTest();
  }, [startTest]);

  // ── Timer ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isRunning) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          finishTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning]);

  // ── Calculate Live Stats ─────────────────────────────────────────
  const calculateStats = useCallback((typedStr: string) => {
    if (typedStr.length === 0) return;

    let correct = 0;
    let incorrect = 0;
    for (let i = 0; i < typedStr.length; i++) {
      if (i < text.length && typedStr[i] === text[i]) {
        correct++;
      } else {
        incorrect++;
      }
    }

    const elapsed = (Date.now() - startTimeRef.current) / 1000 / 60; // minutes
    const wordsTyped = correct / 5; // Standard: 5 chars = 1 word
    const wpm = elapsed > 0 ? Math.round(wordsTyped / elapsed) : 0;
    const accuracy = typedStr.length > 0 ? Math.round((correct / typedStr.length) * 100) : 100;

    setCurrentWpm(wpm);
    setCurrentAccuracy(accuracy);
  }, [text]);

  // ── Finish Test ──────────────────────────────────────────────────
  const finishTest = useCallback(() => {
    setIsRunning(false);
    setIsFinished(true);
    if (timerRef.current) clearInterval(timerRef.current);

    const typedStr = typed || '';
    let correct = 0;
    let incorrect = 0;
    for (let i = 0; i < typedStr.length; i++) {
      if (i < text.length && typedStr[i] === text[i]) {
        correct++;
      } else {
        incorrect++;
      }
    }

    const elapsed = (Date.now() - startTimeRef.current) / 1000 / 60;
    const wordsTyped = correct / 5;
    const wpm = elapsed > 0 ? Math.round(wordsTyped / elapsed) : 0;
    const accuracy = typedStr.length > 0 ? Math.round((correct / typedStr.length) * 100) : 100;

    const testResult: TestResult = {
      wpm,
      accuracy,
      correct,
      incorrect,
      total: typedStr.length,
      time: duration - timeLeft,
    };
    setResult(testResult);

    const newTests = totalTests + 1;
    setTotalTests(newTests);
    const newBest = Math.max(bestWpm, wpm);
    setBestWpm(newBest);
    saveStats('typing-test', { highScore: newBest, gamesPlayed: newTests });

    if (soundEnabled) {
      if (wpm >= bestWpm && wpm > 0) sound.playWin();
      else sound.playScore();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typed, text, duration, timeLeft, totalTests, bestWpm, soundEnabled]);

  // ── Handle Input ─────────────────────────────────────────────────
  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isFinished) return;
    const val = e.target.value;

    if (!isRunning && val.length > 0) {
      setIsRunning(true);
      startTimeRef.current = Date.now();
    }

    setTyped(val);
    calculateStats(val);

    // Play sound for correct/incorrect
    if (soundEnabled && val.length > typed.length) {
      const lastIdx = val.length - 1;
      if (lastIdx < text.length && val[lastIdx] === text[lastIdx]) {
        sound.playBounce();
      } else {
        sound.playError();
      }
    }

    // Auto-scroll text display
    if (textContainerRef.current) {
      const charEls = textContainerRef.current.querySelectorAll('span[data-idx]');
      const currentEl = charEls[val.length];
      if (currentEl) {
        currentEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    // Check if user typed all text
    if (val.length >= text.length) {
      finishTest();
    }
  };

  // ── WPM Rating ───────────────────────────────────────────────────
  const getWpmRating = (wpm: number) => {
    if (wpm >= 100) return { label: 'Lightning ⚡', color: 'text-amber-400' };
    if (wpm >= 80) return { label: 'Expert 🔥', color: 'text-orange-400' };
    if (wpm >= 60) return { label: 'Fast 🚀', color: 'text-cyan-400' };
    if (wpm >= 40) return { label: 'Average ✅', color: 'text-emerald-400' };
    if (wpm >= 20) return { label: 'Beginner 🌱', color: 'text-green-400' };
    return { label: 'Starting 🐢', color: 'text-zinc-400' };
  };

  // ── Timer Color ──────────────────────────────────────────────────
  const timerColor = timeLeft <= 5 ? 'text-red-400' : timeLeft <= 10 ? 'text-amber-400' : 'text-white';

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

        {[15, 30, 60].map((d) => (
          <button
            key={d}
            onClick={() => setDuration(d as TestDuration)}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
              duration === d
                ? 'border-cyan-500/50 bg-cyan-500/20 text-cyan-300'
                : 'border-white/10 bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
            }`}
          >
            {d}s
          </button>
        ))}

        <button
          onClick={startTest}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 hover:text-cyan-200 transition-all"
        >
          <RotateCcw className="w-4 h-4" /> Restart
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-3 w-full max-w-lg">
        {[
          { label: 'WPM', value: isRunning ? currentWpm : (result?.wpm ?? 0), icon: '⌨️' },
          { label: 'Accuracy', value: `${isRunning ? currentAccuracy : (result?.accuracy ?? 100)}%`, icon: '🎯' },
          { label: 'Time', value: `${timeLeft}s`, icon: '⏱️', colorClass: timerColor },
          { label: 'Best WPM', value: bestWpm, icon: '🏆' },
        ].map((stat) => (
          <div key={stat.label} className="bg-zinc-800/60 border border-white/5 rounded-xl p-2 text-center">
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider">{stat.icon} {stat.label}</div>
            <div className={`text-base sm:text-lg font-black ${stat.colorClass || 'text-white'}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Live WPM Indicator */}
      {isRunning && (
        <div className="flex items-center gap-3">
          <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
          <div className="h-2 w-48 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(100, (currentWpm / 120) * 100)}%`,
                background: currentWpm >= 80 ? 'linear-gradient(90deg, #f59e0b, #ef4444)' : currentWpm >= 50 ? 'linear-gradient(90deg, #06b6d4, #3b82f6)' : 'linear-gradient(90deg, #22c55e, #06b6d4)',
              }}
            />
          </div>
          <span className="text-xs text-zinc-400 font-bold min-w-[60px]">{currentWpm} WPM</span>
        </div>
      )}

      {/* Text Display */}
      <div
        ref={textContainerRef}
        className="relative w-full max-w-2xl bg-zinc-800/40 border border-white/5 rounded-2xl p-4 sm:p-6 max-h-[200px] overflow-y-auto"
        style={{ lineHeight: 1.8 }}
        onClick={() => inputRef.current?.focus()}
      >
        <div className="text-base sm:text-lg font-mono leading-relaxed">
          {text.split('').map((char, i) => {
            let className = 'text-zinc-500'; // Not yet typed
            if (i < typed.length) {
              className = typed[i] === char ? 'text-emerald-400' : 'text-red-400 bg-red-500/20 rounded-sm';
            } else if (i === typed.length) {
              className = 'text-white border-l-2 border-cyan-400 animate-pulse';
            }
            return (
              <span key={i} data-idx={i} className={className}>
                {char}
              </span>
            );
          })}
        </div>

        {!isRunning && !isFinished && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] rounded-2xl">
            <div className="text-center">
              <Keyboard className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
              <div className="text-zinc-300 font-bold text-sm">Start typing to begin</div>
              <div className="text-zinc-500 text-xs mt-1">Click here and type</div>
            </div>
          </div>
        )}
      </div>

      {/* Hidden Input */}
      <input
        ref={inputRef}
        type="text"
        value={typed}
        onChange={handleInput}
        disabled={isFinished}
        className="sr-only"
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
      />

      {/* Focus Button (mobile) */}
      {!isFinished && (
        <button
          onClick={() => inputRef.current?.focus()}
          className="sm:hidden px-6 py-3 rounded-xl bg-zinc-800 border border-white/10 text-zinc-300 font-bold text-sm active:bg-zinc-700 transition-colors"
        >
          <Keyboard className="w-4 h-4 inline mr-2" />
          Tap to focus keyboard
        </button>
      )}

      {/* Results */}
      {isFinished && result && (
        <div className="w-full max-w-md bg-zinc-800/60 border border-white/10 rounded-2xl p-5 sm:p-6">
          <div className="text-center mb-4">
            <div className="text-3xl mb-1">
              {result.wpm >= 80 ? '🔥' : result.wpm >= 50 ? '🚀' : '⌨️'}
            </div>
            <div className="text-3xl font-black text-white">{result.wpm} WPM</div>
            <div className={`text-sm font-bold mt-1 ${getWpmRating(result.wpm).color}`}>
              {getWpmRating(result.wpm).label}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-zinc-900/60 rounded-xl p-3 text-center">
              <div className="text-[10px] text-zinc-500 uppercase">Accuracy</div>
              <div className={`text-lg font-black ${result.accuracy >= 95 ? 'text-emerald-400' : result.accuracy >= 85 ? 'text-amber-400' : 'text-red-400'}`}>
                {result.accuracy}%
              </div>
            </div>
            <div className="bg-zinc-900/60 rounded-xl p-3 text-center">
              <div className="text-[10px] text-zinc-500 uppercase">Characters</div>
              <div className="text-lg font-black text-white">
                <span className="text-emerald-400">{result.correct}</span>
                <span className="text-zinc-600">/</span>
                <span className="text-red-400">{result.incorrect}</span>
              </div>
            </div>
          </div>

          {result.wpm >= bestWpm && result.wpm > 0 && (
            <div className="flex items-center justify-center gap-1.5 text-amber-400 text-xs font-bold mt-3">
              <Trophy className="w-4 h-4" /> New Personal Best!
            </div>
          )}

          <button
            onClick={startTest}
            className="w-full mt-4 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-sm hover:scale-[1.02] active:scale-95 transition-transform shadow-lg shadow-cyan-500/30"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Instructions */}
      <div className="text-[10px] text-zinc-500 text-center">
        Type the displayed text as fast and accurately as you can • WPM = Words Per Minute (1 word = 5 characters)
      </div>
    </div>
  );
}
