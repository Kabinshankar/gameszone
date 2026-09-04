import React from 'react';
import { ShieldCheck, Zap, Smartphone, Sparkles, HelpCircle } from 'lucide-react';

const FAQS = [
  {
    question: 'Are all games on Nexvara completely free to play?',
    answer:
      'Yes! Every single game on Nexvara is 100% free to play. There are no paywalls, subscriptions, or hidden charges. You can enjoy unlimited gameplay directly in your browser.',
  },
  {
    question: 'Do I need to download or install any files to play?',
    answer:
      'No downloads or installations are required. All games run instantly in your web browser using modern HTML5 and WebAssembly technology across desktop, laptop, tablet, and mobile devices.',
  },
  {
    question: 'What types of online games can I find on Nexvara?',
    answer:
      'Nexvara features a diverse catalog of 20+ top-rated casual titles including classic board games (Ludo, Checkers, Tic Tac Toe), brain puzzles (Sudoku, 2048, Minesweeper, Word Search), arcade favorites (Snake, Breakout, Pong, Flappy Rocket, Whack-A-Mole, Tetris), card games (Solitaire), and reflex skill testers (Typing Test, Reaction Test, Color Match).',
  },
  {
    question: 'Are Nexvara games playable on mobile phones and tablets?',
    answer:
      'Yes! Nexvara is fully optimized with responsive touch controls for iOS (iPhone/iPad) and Android smartphones and tablets.',
  },
  {
    question: 'Does Nexvara save my game progress and high scores?',
    answer:
      'Yes, your high scores, win streaks, and recent game history are automatically saved safely in your browser local storage so you can always continue where you left off.',
  },
];

export default function SeoContentSection() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <section className="w-full flex flex-col gap-12 mt-12 pt-12 border-t border-white/10">
      {/* FAQ Schema for Google Rich Snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-[#131319] border border-white/10 flex flex-col gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Instant Browser Play</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            No downloads, no installations, no waiting. Click any game to start playing immediately in your browser on PC, Mac, or Chromebook.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#131319] border border-white/10 flex flex-col gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Smartphone className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Mobile & Touch Friendly</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Fully responsive game designs with intuitive touch controls tailored for seamless gaming on iPhones, iPads, and Android devices.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#131319] border border-white/10 flex flex-col gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">100% Free & Safe</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Completely safe, family-friendly gaming platform without bloatware or invasive popups. Pure casual fun anytime, anywhere.
          </p>
        </div>
      </div>

      {/* Editorial Content Guide for Search Engines */}
      <div className="p-8 rounded-3xl bg-[#0f0f15] border border-white/10 flex flex-col gap-6 text-zinc-300">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> About Nexvara
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Play The Best Free Online Games Without Downloading
          </h2>
        </div>

        <div className="text-sm leading-relaxed text-zinc-400 space-y-4">
          <p>
            Welcome to <strong className="text-white">Nexvara</strong>, your premier destination for free online browser games. Whether you are looking for classic brain teasers, nostalgic arcade favorites, fast-paced reflex challenges, or card and board games to play with friends, Nexvara delivers high-performance web gaming with zero friction.
          </p>
          <p>
            Our library includes player-favorite titles like <strong className="text-zinc-200">Classic Ludo</strong>, <strong className="text-zinc-200">Tetris</strong>, <strong className="text-zinc-200">Solitaire (Klondike)</strong>, <strong className="text-zinc-200">Snake</strong>, <strong className="text-zinc-200">2048 Puzzle</strong>, <strong className="text-zinc-200">Sudoku Master</strong>, <strong className="text-zinc-200">Minesweeper</strong>, and <strong className="text-zinc-200">Word Search</strong>. Every game is built with lightweight, cutting-edge HTML5 technologies ensuring rapid load times and fluid 60 FPS performance even on low-bandwidth connections.
          </p>
        </div>

        {/* FAQ Accordion Section */}
        <div className="flex flex-col gap-4 pt-6 border-t border-white/10">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-indigo-400" /> Frequently Asked Questions (FAQ)
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {FAQS.map((faq, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-white/[0.03] border border-white/5 flex flex-col gap-2"
              >
                <h4 className="text-sm font-semibold text-zinc-100">
                  {faq.question}
                </h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
