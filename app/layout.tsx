import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

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
  title: 'GamesZone — Play Free Browser Games Online',
  description: 'Play 15+ high quality classic, arcade, and puzzle games directly in your browser. No downloads needed. Tic Tac Toe, Snake, 2048, Ludo, Sudoku, and more!',
  keywords: ['games', 'browser games', 'free games', 'online games', 'tic tac toe', 'snake', '2048', 'ludo', 'sudoku', 'minesweeper'],
  openGraph: {
    title: 'GamesZone — Play Free Browser Games',
    description: 'Play 15+ free browser games instantly.',
    type: 'website',
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
      </head>
      <body className="w-full min-h-screen flex flex-col bg-[#06060c] text-gray-100 antialiased font-sans selection:bg-purple-500 selection:text-white tracking-normal leading-normal overflow-x-hidden m-0 p-0">
        <Navbar />
        <main className="w-full flex-1 box-border">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
