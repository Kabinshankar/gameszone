import Link from 'next/link';
import { Gamepad2 } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="page-container py-24 flex flex-col items-center justify-center text-center gap-4">
      <span className="text-6xl font-black text-indigo-500 tracking-tight">404</span>

      <div className="flex flex-col gap-1 max-w-sm">
        <h1 className="text-2xl font-bold text-zinc-100">Game Not Found</h1>
        <p className="text-[13px] text-zinc-400">
          The game you're looking for doesn't exist or has moved.
        </p>
      </div>

      <Link
        href="/games"
        className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[13px] font-semibold transition-colors"
      >
        <Gamepad2 className="w-4 h-4" /> Browse Games
      </Link>
    </div>
  );
}
