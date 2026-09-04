import React from 'react';
import Link from 'next/link';
import { Gamepad2, SearchX, Heart, AlertTriangle } from 'lucide-react';

interface EmptyStateProps {
  type?: 'search' | 'favorites' | 'error' | 'general';
  title?: string;
  description?: string;
  actionText?: string;
  actionHref?: string;
  onAction?: () => void;
}

export default function EmptyState({
  type = 'general',
  title,
  description,
  actionText = 'Browse Games',
  actionHref = '/games',
  onAction,
}: EmptyStateProps) {
  const icons = {
    search: <SearchX className="w-8 h-8 text-zinc-600" />,
    favorites: <Heart className="w-8 h-8 text-zinc-600" />,
    error: <AlertTriangle className="w-8 h-8 text-amber-500" />,
    general: <Gamepad2 className="w-8 h-8 text-zinc-600" />,
  };

  const titles = {
    search: 'No games found',
    favorites: 'Your favorites are empty',
    error: 'Something went wrong',
    general: 'Nothing here yet',
  };

  const descs = {
    search: 'Try another search query or browse our categories.',
    favorites: 'Save games you love by clicking the heart icon on any game.',
    error: 'We couldn\'t load this content. Please try again.',
    general: 'Explore our library of free browser games.',
  };

  return (
    <div className="w-full py-16 flex flex-col items-center text-center gap-4">
      {icons[type]}
      <div className="flex flex-col gap-1 max-w-sm">
        <h3 className="text-lg font-bold text-zinc-200">{title || titles[type]}</h3>
        <p className="text-[13px] text-zinc-500 leading-relaxed">{description || descs[type]}</p>
      </div>
      {(actionHref || onAction) && (
        actionHref ? (
          <Link
            href={actionHref}
            className="mt-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[13px] font-semibold transition-colors"
          >
            {actionText}
          </Link>
        ) : (
          <button
            onClick={onAction}
            className="mt-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[13px] font-semibold transition-colors"
          >
            {actionText}
          </button>
        )
      )}
    </div>
  );
}
