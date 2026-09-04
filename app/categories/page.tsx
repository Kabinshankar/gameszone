import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Container from '@/components/Container';
import { categories, games } from '@/lib/games';

export const metadata = {
  title: 'Categories — GamesZone',
  description: 'Explore web browser games by category: Arcade, Puzzle, Board, Classic, Strategy, Multiplayer, and more.',
};

export default function CategoriesPage() {
  return (
    <Container className="py-12 sm:py-16 flex flex-col gap-10">
      {/* Header */}
      <div className="flex flex-col gap-2 border-b border-white/10 pb-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
          Game Categories
        </h1>
        <p className="text-sm text-zinc-400">
          Find browser games by genre and play instantly for free with no downloads.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {categories.map((cat) => {
          const catGames = games.filter((g) => g.category.includes(cat.name));

          return (
            <Link
              key={cat.name}
              href={`/games?category=${cat.name}`}
              className="group p-6 rounded-2xl border border-white/10 bg-[#14141a] hover:bg-[#181824] hover:border-indigo-500/40 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 shadow-md hover:shadow-xl hover:shadow-indigo-500/10 min-h-[160px]"
            >
              <div className="flex items-center justify-between">
                <span className="text-3xl p-2 rounded-xl bg-white/[0.04] border border-white/5">{cat.emoji}</span>
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg text-zinc-400 bg-white/5 border border-white/5">
                  {catGames.length} games
                </span>
              </div>

              <div className="flex flex-col gap-1 pt-4">
                <h3 className="text-lg font-bold text-zinc-100 group-hover:text-indigo-400 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-zinc-500 line-clamp-1">
                  {catGames.map((g) => g.name).join(', ')}
                </p>
              </div>

              <div className="pt-3.5 border-t border-white/5 flex items-center justify-end text-xs font-bold text-indigo-400 group-hover:text-indigo-300">
                Browse Category <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </Link>
          );
        })}
      </div>
    </Container>
  );
}
