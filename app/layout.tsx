import type { Metadata, Viewport } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WelcomeOnboardingModal from '@/components/WelcomeOnboardingModal';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#06060c' },
    { media: '(prefers-color-scheme: light)', color: '#f8fafc' },
  ],
};

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://gameszonebynatsu.vercel.app'),
  title: {
    default: 'GamesZone — Play Free Online Browser Games (No Download)',
    template: '%s | GamesZone',
  },
  description: 'Play 20+ free online games in your browser with zero downloads. Enjoy classic arcade, puzzle, card, board, and action games including Ludo, Tetris, Solitaire, Snake, 2048, Sudoku, Word Search, and Tic Tac Toe on mobile or PC.',
  keywords: [
    'online game',
    'free online games',
    'play online games',
    'browser games',
    'free browser games',
    'games online free',
    'unblocked games',
    'play games without downloading',
    'poki alternative',
    'tetris online',
    'ludo online',
    'solitaire free',
    'snake game online',
    '2048 game',
    'word search puzzle',
    'typing speed test',
    'arcade games',
    'puzzle games',
    'board games online',
    'card games online',
    'html5 games',
    'casual games'
  ],
  authors: [{ name: 'GamesZone Team' }],
  creator: 'GamesZone',
  publisher: 'GamesZone',
  applicationName: 'GamesZone',
  alternates: {
    canonical: 'https://gameszonebynatsu.vercel.app',
  },
  openGraph: {
    title: 'GamesZone — Play Free Online Games (No Downloads)',
    description: 'Instant play 20+ high quality online arcade, puzzle, card, and action games in your browser.',
    url: 'https://gameszonebynatsu.vercel.app',
    siteName: 'GamesZone',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GamesZone — Play Free Online Browser Games',
    description: 'Instant play 20+ free online arcade, puzzle, and card games in your browser. No downloads needed!',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  category: 'games',
  verification: {
    google: 'google9dd3675bf0b7cdcf',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const adsenseClientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || 'ca-pub-6489796960675310';

  return (
    <html lang="en" className={`dark ${inter.variable} ${plusJakarta.variable}`}>
      <head>
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClientId}`}
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': 'WebSite',
                  '@id': 'https://gameszonebynatsu.vercel.app/#website',
                  url: 'https://gameszonebynatsu.vercel.app',
                  name: 'GamesZone',
                  description: 'Play 20+ free online browser games instantly with zero downloads required.',
                  potentialAction: {
                    '@type': 'SearchAction',
                    target: 'https://gameszonebynatsu.vercel.app/games?search={search_term_string}',
                    'query-input': 'required name=search_term_string',
                  },
                },
                {
                  '@type': 'Organization',
                  '@id': 'https://gameszonebynatsu.vercel.app/#organization',
                  name: 'GamesZone',
                  url: 'https://gameszonebynatsu.vercel.app',
                  logo: 'https://gameszonebynatsu.vercel.app/favicon.ico',
                },
              ],
            }),
          }}
        />
      </head>
      <body className="w-full min-h-screen flex flex-col bg-[#06060c] text-gray-100 antialiased font-sans selection:bg-purple-500 selection:text-white tracking-normal leading-normal overflow-x-hidden m-0 p-0">
        <Navbar />
        <main className="w-full flex-1 box-border">{children}</main>
        <Footer />
        <WelcomeOnboardingModal />
      </body>
    </html>
  );
}
