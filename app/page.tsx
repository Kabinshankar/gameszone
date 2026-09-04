'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Flame, Sparkles, Clock, Gamepad2, ArrowRight, Play } from 'lucide-react';
import HeroSection from '@/components/HeroSection';
import FeaturedGameBanner from '@/components/FeaturedGameBanner';
import CategoryGrid from '@/components/CategoryGrid';
import GameGrid from '@/components/GameGrid';
import Container from '@/components/Container';
import SectionHeader from '@/components/SectionHeader';
import AdBanner from '@/components/AdBanner';
import GameThumbnail from '@/components/GameThumbnail';
import SeoContentSection from '@/components/SeoContentSection';
import DailyChallengeWidget from '@/components/DailyChallengeWidget';
import { games } from '@/lib/games';
import { getRecentlyPlayed, RecentGame } from '@/lib/storage';

export default function Home() {
  const [recentlyPlayed, setRecentlyPlayed] = useState<RecentGame[]>([]);

  useEffect(() => {
    setRecentlyPlayed(getRecentlyPlayed());
  }, []);

  const featuredGame = games.find((g) => g.featured) || games[0];
  const popularGames = games.filter((g) => g.popular);
  const recentGameObjs = games.filter((g) => recentlyPlayed.some((r) => r.slug === g.slug));

  return (
    <div className="w-full flex flex-col">
      {/* 1. Hero */}
      <HeroSection />

      <Container className="flex flex-col gap-20 sm:gap-24 my-16 sm:my-20">
        {/* 2. Continue Playing (Resume Oriented) */}
        {recentGameObjs.length > 0 && (
          <section>
            <SectionHeader
              icon={<Clock className="w-5 h-5 text-indigo-400" />}
              title="Continue Playing"
              subtitle="Jump right back into your recent games."
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {recentGameObjs.slice(0, 4).map((game) => (
                <Link
                  key={game.id}
                  href={`/games/${game.slug}`}
                  className="group relative flex items-center gap-3.5 p-3 rounded-2xl border border-white/10 bg-[#131319] hover:bg-[#181822] hover:border-indigo-500/40 transition-all duration-200 hover:-translate-y-0.5 shadow-md"
                >
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-zinc-900 shrink-0 border border-white/10 relative">
                    <GameThumbnail slug={game.slug} name={game.name} className="rounded-none border-0" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Play className="w-4 h-4 fill-white text-white" />
                    </div>
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
                      Resume
                    </span>
                    <h4 className="text-sm font-bold text-white truncate group-hover:text-indigo-400 transition-colors">
                      {game.name}
                    </h4>
                    <span className="text-[11px] text-zinc-500 flex items-center gap-1 mt-0.5">
                      {game.category[0]} • {game.difficulty}
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-indigo-600/10 group-hover:bg-indigo-600 text-indigo-400 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 3. Featured Game */}
        <section>
          <SectionHeader
            icon={<Sparkles className="w-5 h-5 text-indigo-400" />}
            title="Featured Game"
            subtitle="Hand-picked title recommended for you."
          />
          <FeaturedGameBanner game={featuredGame} />
        </section>

        {/* 4. Daily Challenge Widget */}
        <section>
          <SectionHeader
            icon={<Flame className="w-5 h-5 text-amber-400" />}
            title="Today's Challenge"
            subtitle="Complete the daily challenge to earn bonus coins."
          />
          <DailyChallengeWidget />
        </section>

        {/* 5. Top AdBanner */}
        <AdBanner slot="1000000001" className="my-2" />

        {/* 5. Popular Games */}
        <section id="popular">
          <SectionHeader
            icon={<Flame className="w-5 h-5 text-indigo-400" />}
            title="Popular Games"
            subtitle="Most played titles across our platform."
            linkText="View All Games"
            linkHref="/games"
          />
          <GameGrid games={popularGames.slice(0, 4)} />
        </section>

        {/* 6. Categories */}
        <section>
          <SectionHeader
            icon={<Gamepad2 className="w-5 h-5 text-indigo-400" />}
            title="Explore Categories"
            subtitle="Browse games by your preferred style of gameplay."
            linkText="All Categories"
            linkHref="/categories"
          />
          <CategoryGrid />
        </section>

        {/* 7. Bottom AdBanner */}
        <AdBanner slot="1000000002" className="my-2" />

        {/* 8. More Games Collection */}
        <section>
          <SectionHeader
            icon={<Gamepad2 className="w-5 h-5 text-indigo-400" />}
            title="All Games Collection"
            subtitle="Explore our full arcade library of instant browser games."
            linkText={`See All ${games.length} Games`}
            linkHref="/games"
          />
          <GameGrid games={games.slice(0, 8)} />
        </section>

        {/* 9. High-Authority SEO & FAQ Section */}
        <SeoContentSection />
      </Container>
    </div>
  );
}
