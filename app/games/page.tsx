'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import SearchBar from '@/components/SearchBar';
import CategoryFilter from '@/components/CategoryFilter';
import GameGrid from '@/components/GameGrid';
import AdBanner from '@/components/AdBanner';
import Container from '@/components/Container';
import { games, searchGames } from '@/lib/games';
import { getRecentlyPlayed, RecentGame } from '@/lib/storage';
import { Filter, Clock } from 'lucide-react';

function GamesLibraryContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';
  const initialSearch = searchParams.get('search') || '';

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState<'popular' | 'alpha' | 'newest'>('popular');
  const [recentlyPlayed, setRecentlyPlayed] = useState<RecentGame[]>([]);

  useEffect(() => {
    setRecentlyPlayed(getRecentlyPlayed());
  }, []);

  const filteredGames = useMemo(() => {
    let result = searchQuery ? searchGames(searchQuery) : [...games];

    if (selectedCategory !== 'All') {
      result = result.filter((g) => g.category.includes(selectedCategory));
    }

    if (sortBy === 'alpha') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'newest') {
      result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
    } else {
      result.sort((a, b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0));
    }

    return result;
  }, [searchQuery, selectedCategory, sortBy]);

  const recentGameObjs = games.filter((g) => recentlyPlayed.some((r) => r.slug === g.slug));

  return (
    <Container className="py-12 sm:py-16 flex flex-col gap-8">
      {/* Title + Description */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
          Games Library
        </h1>
        <p className="text-sm text-zinc-400">
          Find something you'll love to play. Browse our complete collection of 15 free browser games.
        </p>
      </div>

      {/* Search & Sort Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <SearchBar value={searchQuery} onChange={setSearchQuery} />

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <span className="text-xs text-zinc-400 font-semibold uppercase flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-indigo-400" /> Sort:
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="h-11 px-3.5 bg-[#14141a] border border-white/10 text-xs font-semibold text-zinc-200 rounded-xl focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="popular">Popularity</option>
            <option value="alpha">Alphabetical (A-Z)</option>
            <option value="newest">New Releases</option>
          </select>
        </div>
      </div>

      {/* Category Pills Filter */}
      <div>
        <CategoryFilter selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />
      </div>

      {/* Results Count Bar */}
      <div className="flex items-center justify-between text-xs text-zinc-400 border-b border-white/10 pb-3">
        <span>
          Showing <span className="text-indigo-400 font-bold">{filteredGames.length}</span> of {games.length} games
          {selectedCategory !== 'All' && <span> in <span className="text-zinc-200 font-semibold">{selectedCategory}</span></span>}
        </span>

        {(selectedCategory !== 'All' || searchQuery) && (
          <button
            onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Game Grid */}
      <GameGrid games={filteredGames.slice(0, 8)} />

      {/* AdBanner */}
      {filteredGames.length > 8 && <AdBanner slot="2000000001" className="my-4" />}

      {/* Game Grid Second Half */}
      {filteredGames.length > 8 && <GameGrid games={filteredGames.slice(8)} />}
    </Container>
  );
}

export default function GamesLibraryPage() {
  return (
    <Suspense fallback={<Container className="py-20 text-center text-zinc-400">Loading Games Library...</Container>}>
      <GamesLibraryContent />
    </Suspense>
  );
}
