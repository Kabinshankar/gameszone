'use client';

import { useState } from 'react';
import { Heart, Lightbulb, X, Coins, Zap } from 'lucide-react';

interface AntifrustrationCardProps {
  gameSlug: string;
  onDismiss: () => void;
  onClaimCoins?: (amount: number) => void;
}

const TIPS: Record<string, string[]> = {
  'tic-tac-toe': [
    'Always take the center square if it\'s open!',
    'Corners are the most powerful positions.',
    'Block your opponent\'s two-in-a-row immediately.',
  ],
  memory: [
    'Focus on remembering the last 2–3 cards you flipped.',
    'Scan the whole board before clicking anything.',
    'Start from corners — they\'re easier to remember.',
  ],
  snake: [
    'Always leave yourself an escape route.',
    'Coil in open areas instead of hugging walls.',
    'The food is worth the risk — plan your path first.',
  ],
  '2048': [
    'Keep your highest tile in a corner at all times.',
    'Only swipe in 3 directions — avoid pushing your corner tile.',
    'Build chains of equal tiles toward your power corner.',
  ],
  ludo: [
    'Move tokens out of home early — don\'t wait for a 6.',
    'Spread your tokens to reduce the risk of getting sent home.',
    'Safe squares are your best friends late in the game.',
  ],
};

const ENCOURAGEMENTS = [
  "Every legend starts with a losing streak! 💪",
  "The best players learned by losing first. Keep going! 🔥",
  "One more try. You've got this! ⚡",
  "Losses build wisdom. Wisdom builds wins! 🧠",
  "Your comeback story starts NOW! 🚀",
];

const CONSOLATION_COINS = 15;

export default function AntifrustrationCard({
  gameSlug,
  onDismiss,
  onClaimCoins,
}: AntifrustrationCardProps) {
  const [claimed, setClaimed] = useState(false);
  const tips = TIPS[gameSlug] || TIPS['tic-tac-toe'];
  const tip = tips[Math.floor(Math.random() * tips.length)];
  const encouragement = ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)];

  const handleClaim = () => {
    if (claimed) return;
    setClaimed(true);
    onClaimCoins?.(CONSOLATION_COINS);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[1500] w-80 animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="relative overflow-hidden rounded-2xl border border-rose-500/20 bg-[#120a0a] shadow-2xl shadow-rose-900/20 p-5 flex flex-col gap-4">
        {/* Glow */}
        <div className="absolute -top-8 -right-8 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Dismiss */}
        <button
          onClick={onDismiss}
          className="absolute top-3 right-3 p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
            <Heart className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Tough round!</p>
            <p className="text-[10px] text-rose-400 font-semibold">3 losses detected</p>
          </div>
        </div>

        {/* Encouragement */}
        <p className="text-xs text-zinc-300 leading-relaxed font-medium">{encouragement}</p>

        {/* Tip */}
        <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/5 border border-amber-500/15">
          <Lightbulb className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
          <p className="text-[11px] text-amber-200/80 leading-relaxed">{tip}</p>
        </div>

        {/* Claim consolation coins */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleClaim}
            disabled={claimed}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${
              claimed
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-default'
                : 'bg-amber-500 hover:bg-amber-400 text-black hover:scale-105 active:scale-95 cursor-pointer'
            }`}
          >
            {claimed ? (
              <>✓ Claimed +{CONSOLATION_COINS} 🪙</>
            ) : (
              <><Coins className="w-3.5 h-3.5" /> Claim {CONSOLATION_COINS} consolation coins</>
            )}
          </button>
          <button
            onClick={onDismiss}
            className="px-3 py-2 rounded-xl text-xs font-bold text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors flex items-center gap-1"
          >
            <Zap className="w-3 h-3" /> Retry
          </button>
        </div>
      </div>
    </div>
  );
}

