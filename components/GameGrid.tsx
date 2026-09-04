import GameCard from './GameCard';
import EmptyState from './EmptyState';
import { Game } from '@/lib/games';

interface GameGridProps {
  games: Game[];
  emptyMessage?: string;
}

export default function GameGrid({ games, emptyMessage }: GameGridProps) {
  if (games.length === 0) {
    return <EmptyState type="search" description={emptyMessage} />;
  }

  return (
    <div className="grid grid-cols-1 min-[480px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 lg:gap-6 w-full min-w-0">
      {games.map((game) => (
        <GameCard key={game.id} game={game} />
      ))}
    </div>
  );
}
