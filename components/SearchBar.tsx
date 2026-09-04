'use client';

import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export default function SearchBar({
  value,
  onChange,
  placeholder = 'Search games by title, category, or tag...',
}: SearchBarProps) {
  return (
    <div className="relative w-full max-w-[520px]">
      <div className="absolute inset-y-0 left-0 pl-[14px] flex items-center pointer-events-none text-zinc-500">
        <Search className="w-4 h-4" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-[46px] pl-[40px] pr-[40px] rounded-[10px] border border-[rgba(255,255,255,0.08)] bg-[#09090b] text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute inset-y-0 right-0 pr-[14px] flex items-center text-zinc-500 hover:text-zinc-300"
          aria-label="Clear search"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
