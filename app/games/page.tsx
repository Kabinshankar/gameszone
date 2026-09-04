import { Suspense } from 'react';
import type { Metadata } from 'next';
import Container from '@/components/Container';
import GamesLibraryClient from '@/components/GamesLibraryClient';

export const metadata: Metadata = {
  title: 'All Online Games — Play 20+ Free Browser Games',
  description: 'Browse our complete catalog of 20+ free online games. Play classic puzzle, arcade, card, board, and strategy games instantly on desktop and mobile.',
  alternates: {
    canonical: 'https://gameszonebynatsu.vercel.app/games',
  },
  openGraph: {
    title: 'All Free Online Games | GamesZone Arcade',
    description: 'Explore 20+ free browser games with instant play. No downloads required.',
    url: 'https://gameszonebynatsu.vercel.app/games',
  },
};

export default function GamesLibraryPage() {
  return (
    <Suspense
      fallback={
        <Container className="py-20 text-center text-zinc-400">
          Loading Games Library...
        </Container>
      }
    >
      <GamesLibraryClient />
    </Suspense>
  );
}
