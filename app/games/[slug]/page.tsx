import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { games, getGameBySlug, getRelatedGames } from '@/lib/games';
import GamePageClient from '@/components/GamePageClient';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return games.map((game) => ({
    slug: game.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const game = getGameBySlug(slug);

  if (!game) {
    return {
      title: 'Game Not Found | Nexvara',
    };
  }

  const title = `Play ${game.name} Online Free - ${game.category.join(', ')} Game`;
  const description = `Play ${game.name} online for free directly in your browser. ${game.description} No download or install required. Supports mobile & desktop.`;
  const url = `https://gameszonebynatsu.vercel.app/games/${game.slug}`;

  return {
    title,
    description,
    keywords: [
      `${game.name.toLowerCase()} online`,
      `play ${game.name.toLowerCase()} free`,
      `${game.name.toLowerCase()} browser game`,
      `free ${game.name.toLowerCase()}`,
      `${game.name.toLowerCase()} unblocked`,
      `${game.category.join(' ')} games`,
      'free online games',
      'browser games',
    ],
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${game.name} - Play Free Online on Nexvara`,
      description,
      url,
      type: 'website',
      siteName: 'Nexvara',
    },
    twitter: {
      card: 'summary_large_image',
      title: `Play ${game.name} Online Free | Nexvara`,
      description,
    },
  };
}

export default async function IndividualGamePage({ params }: Props) {
  const { slug } = await params;
  const game = getGameBySlug(slug);

  if (!game) {
    notFound();
  }

  const relatedGames = getRelatedGames(game, 4);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'VideoGame',
        name: game.name,
        description: game.description,
        url: `https://gameszonebynatsu.vercel.app/games/${game.slug}`,
        genre: game.category,
        playMode: 'SinglePlayer',
        applicationCategory: 'Game',
        operatingSystem: 'Any (Web Browser)',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: (4.7 + ((Number(game.id) || 1) % 4) * 0.08).toFixed(1),
          ratingCount: 120 + (Number(game.id) || 1) * 35,
          bestRating: '5',
          worstRating: '1',
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://gameszonebynatsu.vercel.app',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Games',
            item: 'https://gameszonebynatsu.vercel.app/games',
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: game.name,
            item: `https://gameszonebynatsu.vercel.app/games/${game.slug}`,
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <GamePageClient game={game} relatedGames={relatedGames} />
    </>
  );
}
