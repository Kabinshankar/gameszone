'use client';

import { categories } from '@/lib/games';

interface CategoryFilterProps {
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
}

export default function CategoryFilter({ selectedCategory, onSelectCategory }: CategoryFilterProps) {
  return (
    <div className="w-full overflow-x-auto pb-2 scrollbar-none">
      <div className="flex items-center gap-3 min-w-max">
        <button
          onClick={() => onSelectCategory('All')}
          className={`px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all cursor-pointer select-none ${
            selectedCategory === 'All'
              ? 'bg-gradient-to-b from-indigo-500 to-indigo-700 text-white shadow-md shadow-indigo-600/30 border-t border-indigo-300/40'
              : 'bg-gradient-to-b from-zinc-800 to-zinc-900 hover:from-zinc-700 hover:to-zinc-800 text-zinc-300 hover:text-white border-t border-zinc-600/40 border-b border-zinc-950 shadow-sm hover:-translate-y-0.5 active:scale-95'
          }`}
        >
          All Games
        </button>
        {categories.map((cat) => (
          <button
            key={cat.name}
            onClick={() => onSelectCategory(cat.name)}
            className={`px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all cursor-pointer select-none flex items-center gap-2 ${
              selectedCategory === cat.name
                ? 'bg-gradient-to-b from-indigo-500 to-indigo-700 text-white shadow-md shadow-indigo-600/30 border-t border-indigo-300/40'
                : 'bg-gradient-to-b from-zinc-800 to-zinc-900 hover:from-zinc-700 hover:to-zinc-800 text-zinc-300 hover:text-white border-t border-zinc-600/40 border-b border-zinc-950 shadow-sm hover:-translate-y-0.5 active:scale-95'
            }`}
          >
            <span>{cat.emoji}</span>
            <span>{cat.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
