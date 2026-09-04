'use client';

import { useState, useEffect } from 'react';
import { games } from '@/lib/games';
import { getFavorites } from '@/lib/storage';
import GameGrid from '@/components/GameGrid';
import EmptyState from '@/components/EmptyState';

import Container from '@/components/Container';

export default function FavoritesPage() {
  const [favoriteSlugs, setFavoriteSlugs] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setFavoriteSlugs(getFavorites());
  }, []);

  const favoriteGames = games.filter((g) => favoriteSlugs.includes(g.slug));

  if (!mounted) {
    return (
      <Container className="py-20 text-center text-zinc-400">
        Loading favorites...
      </Container>
    );
  }

  return (
    <Container className="py-12 sm:py-16 flex flex-col gap-10">
      {/* Header */}
      <div className="flex flex-col gap-2 border-b border-white/10 pb-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
          Your Favorite Games
        </h1>
        <p className="text-sm text-zinc-400">
          Instant access to the titles you have saved in your browser.
        </p>
      </div>

      {/* Grid or EmptyState */}
      {favoriteGames.length > 0 ? (
        <GameGrid games={favoriteGames} />
      ) : (
        <EmptyState
          type="favorites"
          title="No favorite games yet"
          description="Click the heart icon on any game card to save your favorite titles here for quick access."
          actionText="Explore All Games"
          actionHref="/games"
        />
      )}
    </Container>
  );
}
