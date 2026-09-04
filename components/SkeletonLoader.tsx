import React from 'react';

export default function SkeletonLoader({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="rounded-2xl bg-zinc-900/60 border border-zinc-800/80 p-4 flex flex-col gap-4 animate-pulse h-[380px]"
        >
          <div className="w-full aspect-[16/9] rounded-xl bg-zinc-800/60" />
          <div className="flex flex-col gap-2 pt-2">
            <div className="w-1/3 h-3 rounded bg-zinc-800/80" />
            <div className="w-2/3 h-5 rounded bg-zinc-800/80" />
            <div className="w-full h-3 rounded bg-zinc-800/40" />
            <div className="w-4/5 h-3 rounded bg-zinc-800/40" />
          </div>
          <div className="mt-auto pt-4 border-t border-zinc-800/50 flex justify-between items-center">
            <div className="w-1/4 h-3 rounded bg-zinc-800/40" />
            <div className="w-1/3 h-8 rounded-lg bg-zinc-800/80" />
          </div>
        </div>
      ))}
    </div>
  );
}
