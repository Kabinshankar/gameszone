'use client';

import { useState, useEffect } from 'react';
import { Palette, Check, Lock, Coins } from 'lucide-react';
import { GAME_THEMES, getActiveTheme, setActiveTheme, isThemeOwned } from '@/lib/themes';
import { getCurrentProfile } from '@/lib/profile';

export default function ThemeSelector() {
  const [active, setActive] = useState('default');
  const [ownedThemes, setOwnedThemes] = useState<string[]>([]);

  useEffect(() => {
    const profile = getCurrentProfile();
    setActive(getActiveTheme().id);
    // Owned themes stored as purchased item IDs with prefix 'theme_'
    const owned = (profile.inventory ?? [])
      .filter((id: string) => id.startsWith('theme_'))
      .map((id: string) => id.replace('theme_', ''));
    setOwnedThemes(owned);
  }, []);

  const handleSelect = (themeId: string) => {
    const owned = isThemeOwned(themeId, ownedThemes);
    if (!owned) return;
    setActive(themeId);
    setActiveTheme(themeId);
    // Dispatch event so GameShell picks up the new theme
    window.dispatchEvent(new CustomEvent('nexvara_theme_changed', { detail: themeId }));
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Palette className="w-4 h-4 text-indigo-400" />
        <span className="text-sm font-bold text-white">Game Themes</span>
        <span className="text-[10px] text-zinc-500 ml-auto">Changes game board appearance</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {GAME_THEMES.map((theme) => {
          const owned = isThemeOwned(theme.id, ownedThemes);
          const isActive = active === theme.id;

          return (
            <button
              key={theme.id}
              onClick={() => handleSelect(theme.id)}
              disabled={!owned}
              className={`relative p-4 rounded-xl border text-left transition-all group ${
                isActive
                  ? 'border-indigo-500/60 ring-1 ring-indigo-500/30'
                  : owned
                  ? 'border-white/10 hover:border-white/20 hover:bg-white/5'
                  : 'border-white/5 opacity-50 cursor-not-allowed'
              }`}
              style={{
                background: isActive
                  ? `linear-gradient(135deg, ${theme.primaryColor}15, ${theme.bgColor})`
                  : undefined,
              }}
            >
              {/* Color preview strip */}
              <div
                className="w-full h-1.5 rounded-full mb-3"
                style={{
                  background: `linear-gradient(90deg, ${theme.primaryColor}, ${theme.accentColor})`,
                  boxShadow: isActive ? `0 0 8px ${theme.glowColor}` : undefined,
                }}
              />

              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{theme.emoji}</span>
                  <div>
                    <p className="text-xs font-bold text-white">{theme.name}</p>
                    <p className="text-[10px] text-zinc-500 mt-0.5">{theme.description}</p>
                  </div>
                </div>

                {/* Status indicator */}
                {isActive ? (
                  <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                ) : !owned ? (
                  <div className="flex items-center gap-1 text-[10px] text-amber-400 font-bold shrink-0">
                    <Lock className="w-3 h-3" />
                    <Coins className="w-3 h-3" />
                    {theme.price}
                  </div>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>

      <p className="text-[10px] text-zinc-600">
        Locked themes can be purchased from the{' '}
        <a href="/shop" className="text-indigo-400 hover:text-indigo-300 underline">Shop</a>{' '}
        using your earned coins.
      </p>
    </div>
  );
}

