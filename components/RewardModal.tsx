'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Trophy, Coins, Zap, ShoppingBag, ArrowRight } from 'lucide-react';
import { awardMatchReward, getCurrentProfile } from '@/lib/profile';
import { sound } from '@/lib/audio';

interface RewardModalProps {
  isOpen: boolean;
  isWin: boolean;
  isMultiplayer?: boolean;
  onClose: () => void;
}

export default function RewardModal({ isOpen, isWin, isMultiplayer = false, onClose }: RewardModalProps) {
  const [rewardData, setRewardData] = useState<{
    coinsEarned: number;
    xpEarned: number;
    leveledUp: boolean;
    newLevel: number;
    newCoins: number;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      const data = awardMatchReward(isWin, isMultiplayer);
      setRewardData(data);
      if (isWin) {
        sound.playWin();
      } else {
        sound.playScore();
      }

      // Try firing confetti if available
      try {
        if (typeof window !== 'undefined' && (window as any).confetti) {
          (window as any).confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        }
      } catch {}
    }
  }, [isOpen, isWin, isMultiplayer]);

  if (!isOpen || !rewardData) return null;

  const profile = getCurrentProfile();

  return (
    <div className="fixed inset-0 z-[2500] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-[#121218] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center overflow-hidden">
        {/* Glow */}
        <div className={`absolute -top-24 -left-24 w-60 h-60 rounded-full blur-[90px] pointer-events-none ${
          isWin ? 'bg-amber-500/20' : 'bg-indigo-500/20'
        }`} />

        {/* Icon */}
        <div className={`w-16 h-16 rounded-3xl flex items-center justify-center text-3xl shadow-xl mb-3 ${
          isWin
            ? 'bg-gradient-to-tr from-amber-500 to-yellow-400 text-white shadow-amber-500/30 animate-bounce'
            : 'bg-zinc-800 border border-white/10 text-zinc-300'
        }`}>
          {isWin ? '🏆' : '🎮'}
        </div>

        <h3 className="text-2xl font-black text-white tracking-tight">
          {isWin ? (isMultiplayer ? 'MULTIPLAYER VICTORY!' : 'VICTORY!') : 'MATCH COMPLETE!'}
        </h3>
        <p className="text-xs text-zinc-400 mt-1 mb-6">
          {isWin ? 'Awesome match! You earned reward coins.' : 'Good effort! Keep playing to level up.'}
        </p>

        {/* Rewards Box */}
        <div className="grid grid-cols-2 gap-3 w-full mb-6">
          {/* Coins */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col items-center gap-1">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
              <Coins className="w-4 h-4" /> Coins
            </div>
            <div className="text-xl font-black text-amber-300 font-mono">
              +{rewardData.coinsEarned} 🪙
            </div>
          </div>

          {/* XP */}
          <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex flex-col items-center gap-1">
            <div className="flex items-center gap-1.5 text-indigo-400 font-bold text-xs">
              <Zap className="w-4 h-4" /> EXP
            </div>
            <div className="text-xl font-black text-indigo-300 font-mono">
              +{rewardData.xpEarned} XP
            </div>
          </div>
        </div>

        {/* Level Up Notification */}
        {rewardData.leveledUp && (
          <div className="w-full mb-6 p-3 rounded-2xl bg-gradient-to-r from-purple-600/30 to-indigo-600/30 border border-purple-500/40 text-purple-200 text-xs font-bold flex items-center justify-center gap-2 animate-pulse">
            <Trophy className="w-4 h-4 text-yellow-300" /> LEVEL UP! You reached Level {rewardData.newLevel}!
          </div>
        )}

        {/* Balance Status */}
        <div className="text-xs text-zinc-400 mb-6">
          Total Coins: <strong className="text-amber-300 font-mono font-bold">{rewardData.newCoins} 🪙</strong> • Level {profile.level}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 w-full">
          <button
            onClick={onClose}
            className="w-full h-11 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white text-xs font-bold tracking-wide shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-98"
          >
            Collect & Continue <ArrowRight className="w-4 h-4" />
          </button>

          <Link
            href="/shop"
            onClick={onClose}
            className="w-full h-11 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 text-amber-400" /> Visit Avatar Shop
          </Link>
        </div>
      </div>
    </div>
  );
}
