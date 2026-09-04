'use client';

import { use } from 'react';
import { notFound } from 'next/navigation';
import { getGameBySlug, getRelatedGames } from '@/lib/games';
import GameShell from '@/components/GameShell';
import GameGrid from '@/components/GameGrid';

// Game component imports
import TicTacToe from '@/games/TicTacToe';
import Snake from '@/games/Snake';
import Game2048 from '@/games/Game2048';
import Memory from '@/games/Memory';
import Minesweeper from '@/games/Minesweeper';
import RockPaperScissors from '@/games/RockPaperScissors';
import ConnectFour from '@/games/ConnectFour';
import Checkers from '@/games/Checkers';
import Sudoku from '@/games/Sudoku';
import FlappyBird from '@/games/FlappyBird';
import Breakout from '@/games/Breakout';
import Pong from '@/games/Pong';
import WhackAMole from '@/games/WhackAMole';
import ReactionTest from '@/games/ReactionTest';
import Ludo from '@/games/Ludo';
import Tetris from '@/games/Tetris';
import WordSearch from '@/games/WordSearch';
import TypingTest from '@/games/TypingTest';
import Solitaire from '@/games/Solitaire';
import ColorMatch from '@/games/ColorMatch';

const GAME_COMPONENTS: Record<string, React.ComponentType> = {
  'tic-tac-toe': TicTacToe,
  'snake': Snake,
  '2048': Game2048,
  'memory': Memory,
  'minesweeper': Minesweeper,
  'rock-paper-scissors': RockPaperScissors,
  'connect-four': ConnectFour,
  'checkers': Checkers,
  'sudoku': Sudoku,
  'flappy-rocket': FlappyBird,
  'breakout': Breakout,
  'pong': Pong,
  'whack-a-mole': WhackAMole,
  'reaction-test': ReactionTest,
  'ludo': Ludo,
  'tetris': Tetris,
  'word-search': WordSearch,
  'typing-test': TypingTest,
  'solitaire': Solitaire,
  'color-match': ColorMatch,
};

export default function IndividualGamePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const game = getGameBySlug(slug);

  if (!game) {
    notFound();
  }

  const GameComponent = GAME_COMPONENTS[game.slug];
  const relatedGames = getRelatedGames(game, 4);

  return (
    <GameShell game={game} relatedGames={relatedGames}>
      {GameComponent ? (
        <GameComponent />
      ) : (
        <div className="text-zinc-400 py-12 text-center text-sm">
          Loading game component...
        </div>
      )}
    </GameShell>
  );
}
