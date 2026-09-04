import Link from 'next/link';
import { categories, games } from '@/lib/games';

export default function CategoryGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
      {categories.map((cat) => {
        const count = games.filter((g) => g.category.includes(cat.name)).length;

        return (
          <Link
            key={cat.name}
            href={`/games?category=${cat.name}`}
            className="group relative h-[80px] px-5 rounded-[16px] border border-white/10 bg-[#14141a] hover:bg-[#181824] hover:border-indigo-500/40 flex items-center justify-between transition-all duration-200 hover:-translate-y-1 shadow-md hover:shadow-lg hover:shadow-indigo-500/10 overflow-hidden"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-xl group-hover:scale-110 group-hover:bg-indigo-600/10 transition-all">
                {cat.emoji}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-zinc-100 group-hover:text-indigo-400 transition-colors">
                  {cat.name}
                </span>
                <span className="text-[11px] font-medium text-zinc-500">
                  Explore {cat.name}
                </span>
              </div>
            </div>
            <span className="text-xs font-bold text-zinc-400 bg-white/5 group-hover:bg-indigo-600/20 group-hover:text-indigo-300 px-2.5 py-1 rounded-lg border border-white/5 group-hover:border-indigo-500/30 transition-colors">
              {count}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
