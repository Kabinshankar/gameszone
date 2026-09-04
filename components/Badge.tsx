import React from 'react';

interface BadgeProps {
  children?: React.ReactNode;
  variant?: 'difficulty' | 'category' | 'status' | 'neutral';
  difficulty?: 'Easy' | 'Medium' | 'Hard' | 'Variable';
  className?: string;
}

export default function Badge({
  children,
  variant = 'neutral',
  difficulty,
  className = '',
}: BadgeProps) {
  if (difficulty) {
    let diffStyles = 'bg-indigo-950/60 text-indigo-300 border-indigo-800/40';
    if (difficulty === 'Easy') diffStyles = 'bg-emerald-950/60 text-emerald-300 border-emerald-800/40';
    if (difficulty === 'Medium') diffStyles = 'bg-amber-950/60 text-amber-300 border-amber-800/40';
    if (difficulty === 'Hard') diffStyles = 'bg-rose-950/60 text-rose-300 border-rose-800/40';

    return (
      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${diffStyles} ${className}`}>
        {children || difficulty}
      </span>
    );
  }

  const variantStyles = {
    category: 'bg-zinc-800/80 text-zinc-300 border-zinc-700/60',
    status: 'bg-indigo-950/80 text-indigo-300 border-indigo-700/60',
    neutral: 'bg-zinc-900 text-zinc-400 border-zinc-800',
    difficulty: 'bg-zinc-800 text-zinc-300 border-zinc-700',
  };

  return (
    <span className={`inline-flex items-center text-[11px] font-medium px-2.5 py-0.5 rounded-md border ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
}
