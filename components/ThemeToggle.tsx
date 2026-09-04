'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { getTheme, saveTheme } from '@/lib/storage';

export default function ThemeToggle() {
  const [theme, setThemeState] = useState<string>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = getTheme();
    setThemeState(saved);
    applyTheme(saved);
  }, []);

  const applyTheme = (t: string) => {
    const root = document.documentElement;
    if (t === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
    }
  };

  const handleToggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setThemeState(next);
    saveTheme(next);
    applyTheme(next);
  };

  if (!mounted) {
    return (
      <button aria-label="Toggle theme" className="p-2 rounded-lg text-zinc-500">
        <Moon className="w-[18px] h-[18px]" />
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
      title={`Current: ${theme}`}
    >
      {theme === 'dark' ? (
        <Sun className="w-[18px] h-[18px]" />
      ) : (
        <Moon className="w-[18px] h-[18px]" />
      )}
    </button>
  );
}
