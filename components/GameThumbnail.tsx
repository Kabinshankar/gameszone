'use client';

import React from 'react';

interface GameThumbnailProps {
  slug: string;
  name: string;
  className?: string;
}

export default function GameThumbnail({ slug, className = '' }: GameThumbnailProps) {
  const getThumbnailContent = () => {
    switch (slug) {
      case 'tic-tac-toe':
        return (
          <svg className="w-full h-full" viewBox="0 0 200 120" fill="none">
            <rect width="200" height="120" fill="#0d0d16" />
            <path d="M70 15V105M130 15V105M25 45H175M25 75H175" stroke="#252538" strokeWidth="3" strokeLinecap="round" />
            {/* Neon X top-left */}
            <path d="M38 24L56 42M56 24L38 42" stroke="#6366f1" strokeWidth="4.5" strokeLinecap="round" />
            {/* Neon O center */}
            <circle cx="100" cy="60" r="11" stroke="#06b6d4" strokeWidth="4.5" />
            {/* Neon X bottom-right */}
            <path d="M144 78L162 96M162 78L144 96" stroke="#6366f1" strokeWidth="4.5" strokeLinecap="round" />
            {/* Neon O top-right */}
            <circle cx="153" cy="33" r="10" stroke="#06b6d4" strokeWidth="4" opacity="0.6" />
          </svg>
        );

      case 'snake':
        return (
          <svg className="w-full h-full" viewBox="0 0 200 120" fill="none">
            <rect width="200" height="120" fill="#08140c" />
            <defs>
              <pattern id="snake-grid-pat" width="16" height="16" patternUnits="userSpaceOnUse">
                <circle cx="8" cy="8" r="0.8" fill="#132a1b" />
              </pattern>
            </defs>
            <rect width="200" height="120" fill="url(#snake-grid-pat)" />
            {/* Snake Body Trail */}
            <path d="M32 64H112V88H144" stroke="#10b981" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M32 64H112V88H144" stroke="#34d399" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
            {/* Snake Head */}
            <circle cx="144" cy="88" r="8" fill="#34d399" />
            <circle cx="146" cy="85" r="1.8" fill="#042f18" />
            <circle cx="146" cy="91" r="1.8" fill="#042f18" />
            {/* Food Apple */}
            <circle cx="164" cy="40" r="7" fill="#f43f5e" />
            <circle cx="162" cy="38" r="2" fill="#fda4af" />
            <path d="M164 33C165 31 167 30 169 31" stroke="#84cc16" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        );

      case '2048':
        return (
          <svg className="w-full h-full" viewBox="0 0 200 120" fill="none">
            <rect width="200" height="120" fill="#141008" />
            <rect x="25" y="16" width="38" height="38" rx="6" fill="#2d2212" />
            <text x="44" y="40" fill="#8d7758" fontSize="13" fontWeight="bold" textAnchor="middle">64</text>
            <rect x="69" y="16" width="38" height="38" rx="6" fill="#f59e0b" />
            <text x="88" y="40" fill="#ffffff" fontSize="13" fontWeight="bold" textAnchor="middle">128</text>
            <rect x="113" y="16" width="38" height="38" rx="6" fill="#d97706" />
            <text x="132" y="40" fill="#ffffff" fontSize="13" fontWeight="bold" textAnchor="middle">512</text>
            <rect x="69" y="60" width="38" height="38" rx="6" fill="#ea580c" />
            <text x="88" y="84" fill="#ffffff" fontSize="12" fontWeight="bold" textAnchor="middle">1024</text>
            <rect x="113" y="60" width="58" height="38" rx="6" fill="#6366f1" />
            <text x="142" y="84" fill="#ffffff" fontSize="15" fontWeight="900" textAnchor="middle">2048</text>
          </svg>
        );

      case 'memory':
        return (
          <svg className="w-full h-full" viewBox="0 0 200 120" fill="none">
            <rect width="200" height="120" fill="#140a18" />
            <rect x="22" y="24" width="34" height="52" rx="6" fill="#271330" stroke="#482159" strokeWidth="1.5" />
            <circle cx="39" cy="50" r="6" fill="#6b3085" />
            {/* Matched Pair Cards */}
            <rect x="64" y="24" width="34" height="52" rx="6" fill="#6366f1" stroke="#818cf8" strokeWidth="1.5" />
            <path d="M81 40L88 56H74L81 40Z" fill="#ffffff" />
            <rect x="106" y="24" width="34" height="52" rx="6" fill="#6366f1" stroke="#818cf8" strokeWidth="1.5" />
            <path d="M123 40L130 56H116L123 40Z" fill="#ffffff" />
            <rect x="148" y="24" width="34" height="52" rx="6" fill="#271330" stroke="#482159" strokeWidth="1.5" />
            <circle cx="165" cy="50" r="6" fill="#6b3085" />
          </svg>
        );

      case 'minesweeper':
        return (
          <svg className="w-full h-full" viewBox="0 0 200 120" fill="none">
            <rect width="200" height="120" fill="#140808" />
            <rect x="36" y="22" width="34" height="34" rx="4" fill="#241212" stroke="#3b1d1d" />
            <text x="53" y="46" fill="#60a5fa" fontSize="20" fontWeight="900" textAnchor="middle">1</text>
            <rect x="76" y="22" width="34" height="34" rx="4" fill="#241212" stroke="#3b1d1d" />
            <text x="93" y="46" fill="#f87171" fontSize="20" fontWeight="900" textAnchor="middle">3</text>
            <rect x="116" y="22" width="34" height="34" rx="4" fill="#ef4444" />
            {/* Retro Mine */}
            <circle cx="133" cy="39" r="8" fill="#18181b" />
            <path d="M133 27V51M121 39H145M124 30L142 48M142 30L124 48" stroke="#18181b" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="131" cy="37" r="2.5" fill="#ffffff" />
            {/* Flag Cell */}
            <rect x="76" y="62" width="34" height="34" rx="4" fill="#241212" stroke="#3b1d1d" />
            <path d="M91 72V88M91 72L101 77L91 82Z" fill="#ef4444" stroke="#f87171" strokeWidth="1.5" />
          </svg>
        );

      case 'rock-paper-scissors':
        return (
          <svg className="w-full h-full" viewBox="0 0 200 120" fill="none">
            <rect width="200" height="120" fill="#0e0a1a" />
            <circle cx="55" cy="60" r="26" fill="#1e1533" stroke="#6366f1" strokeWidth="2.5" />
            <text x="55" y="68" fontSize="22" textAnchor="middle">🪨</text>
            <circle cx="145" cy="60" r="26" fill="#1e1533" stroke="#06b6d4" strokeWidth="2.5" />
            <text x="145" y="68" fontSize="22" textAnchor="middle">✂️</text>
            <circle cx="100" cy="60" r="14" fill="#312e81" />
            <text x="100" y="64" fill="#a5b4fc" fontSize="11" fontWeight="900" textAnchor="middle">VS</text>
          </svg>
        );

      case 'connect-four':
        return (
          <svg className="w-full h-full" viewBox="0 0 200 120" fill="none">
            <rect width="200" height="120" fill="#060c18" />
            <rect x="25" y="16" width="150" height="88" rx="10" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="2" />
            {/* Grid Holes & Colored Discs */}
            <circle cx="50" cy="38" r="10" fill="#0c1938" />
            <circle cx="80" cy="38" r="10" fill="#ef4444" />
            <circle cx="110" cy="38" r="10" fill="#0c1938" />
            <circle cx="140" cy="38" r="10" fill="#fbbf24" />
            <circle cx="50" cy="64" r="10" fill="#fbbf24" />
            <circle cx="80" cy="64" r="10" fill="#ef4444" />
            <circle cx="110" cy="64" r="10" fill="#ef4444" />
            <circle cx="140" cy="64" r="10" fill="#fbbf24" />
            <circle cx="50" cy="90" r="6" fill="#0c1938" />
            <circle cx="80" cy="90" r="6" fill="#ef4444" />
            <circle cx="110" cy="90" r="6" fill="#ef4444" />
            <circle cx="140" cy="90" r="6" fill="#fbbf24" />
          </svg>
        );

      case 'checkers':
        return (
          <svg className="w-full h-full" viewBox="0 0 200 120" fill="none">
            <rect width="200" height="120" fill="#140a04" />
            <rect x="35" y="15" width="130" height="90" rx="6" fill="#291406" stroke="#52290d" strokeWidth="2" />
            <rect x="60" y="15" width="25" height="30" fill="#5c2c0d" />
            <rect x="110" y="15" width="25" height="30" fill="#5c2c0d" />
            <rect x="35" y="45" width="25" height="30" fill="#5c2c0d" />
            <rect x="85" y="45" width="25" height="30" fill="#5c2c0d" />
            <rect x="135" y="45" width="25" height="30" fill="#5c2c0d" />
            <rect x="60" y="75" width="25" height="30" fill="#5c2c0d" />
            <rect x="110" y="75" width="25" height="30" fill="#5c2c0d" />
            {/* 3D Checkers Pieces */}
            <circle cx="72" cy="30" r="10" fill="#ef4444" stroke="#fca5a5" strokeWidth="2" />
            <circle cx="72" cy="30" r="5" fill="#b91c1c" />
            <circle cx="97" cy="60" r="10" fill="#18181b" stroke="#71717a" strokeWidth="2" />
            <circle cx="97" cy="60" r="5" fill="#09090b" />
          </svg>
        );

      case 'sudoku':
        return (
          <svg className="w-full h-full" viewBox="0 0 200 120" fill="none">
            <rect width="200" height="120" fill="#060e18" />
            <rect x="55" y="15" width="90" height="90" rx="6" fill="#0d1b2a" stroke="#38bdf8" strokeWidth="2" />
            <path d="M85 15V105M115 15V105M55 45H145M55 75H145" stroke="#1e3a5f" strokeWidth="1.5" />
            <text x="70" y="38" fill="#38bdf8" fontSize="16" fontWeight="900" textAnchor="middle">5</text>
            <text x="100" y="68" fill="#818cf8" fontSize="16" fontWeight="900" textAnchor="middle">9</text>
            <text x="130" y="98" fill="#38bdf8" fontSize="16" fontWeight="900" textAnchor="middle">3</text>
            <text x="130" y="38" fill="#94a3b8" fontSize="15" fontWeight="600" textAnchor="middle">1</text>
            <text x="70" y="98" fill="#94a3b8" fontSize="15" fontWeight="600" textAnchor="middle">8</text>
          </svg>
        );

      case 'flappy-rocket':
        return (
          <svg className="w-full h-full" viewBox="0 0 200 120" fill="none">
            <rect width="200" height="120" fill="#050814" />
            {/* Starfield */}
            <circle cx="30" cy="20" r="1" fill="#ffffff" opacity="0.6" />
            <circle cx="90" cy="30" r="1.5" fill="#ffffff" opacity="0.8" />
            <circle cx="160" cy="70" r="1" fill="#ffffff" opacity="0.5" />
            {/* Neon Pipes */}
            <rect x="130" y="0" width="26" height="42" fill="#312e81" stroke="#6366f1" strokeWidth="2" rx="3" />
            <rect x="130" y="82" width="26" height="38" fill="#312e81" stroke="#6366f1" strokeWidth="2" rx="3" />
            {/* Rocket */}
            <ellipse cx="68" cy="62" rx="14" ry="9" fill="#06b6d4" stroke="#67e8f9" strokeWidth="1.5" />
            <polygon points="50,62 42,56 42,68" fill="#f97316" />
            <circle cx="74" cy="61" r="3.5" fill="#ffffff" />
          </svg>
        );

      case 'breakout':
        return (
          <svg className="w-full h-full" viewBox="0 0 200 120" fill="none">
            <rect width="200" height="120" fill="#081006" />
            {/* Colorful Brick Rows */}
            <rect x="25" y="18" width="30" height="9" rx="2" fill="#ef4444" />
            <rect x="60" y="18" width="30" height="9" rx="2" fill="#ef4444" />
            <rect x="95" y="18" width="30" height="9" rx="2" fill="#ef4444" />
            <rect x="130" y="18" width="30" height="9" rx="2" fill="#ef4444" />
            <rect x="165" y="18" width="10" height="9" rx="2" fill="#ef4444" />

            <rect x="25" y="31" width="30" height="9" rx="2" fill="#f59e0b" />
            <rect x="60" y="31" width="30" height="9" rx="2" fill="#f59e0b" />
            <rect x="95" y="31" width="30" height="9" rx="2" fill="#f59e0b" />
            <rect x="130" y="31" width="30" height="9" rx="2" fill="#f59e0b" />

            <rect x="25" y="44" width="30" height="9" rx="2" fill="#10b981" />
            <rect x="60" y="44" width="30" height="9" rx="2" fill="#10b981" />
            <rect x="95" y="44" width="30" height="9" rx="2" fill="#10b981" />
            <rect x="130" y="44" width="30" height="9" rx="2" fill="#10b981" />

            {/* Paddle & Ball */}
            <rect x="75" y="96" width="50" height="7" rx="3.5" fill="#22c55e" stroke="#86efac" strokeWidth="1" />
            <circle cx="102" cy="74" r="4.5" fill="#ffffff" />
            <path d="M102 74L110 85" stroke="#ffffff" strokeWidth="1.5" opacity="0.3" strokeDasharray="2 2" />
          </svg>
        );

      case 'pong':
        return (
          <svg className="w-full h-full" viewBox="0 0 200 120" fill="none">
            <rect width="200" height="120" fill="#080c06" />
            <path d="M100 0V120" stroke="#1f2937" strokeWidth="2" strokeDasharray="6 6" />
            {/* Player 1 Paddle */}
            <rect x="18" y="32" width="6" height="46" rx="3" fill="#22c55e" />
            {/* Player 2 Paddle */}
            <rect x="176" y="48" width="6" height="46" rx="3" fill="#06b6d4" />
            {/* Ball & Glow Trail */}
            <circle cx="118" cy="58" r="4" fill="#ffffff" />
            <circle cx="108" cy="62" r="3" fill="#ffffff" opacity="0.3" />
            <circle cx="98" cy="66" r="2" fill="#ffffff" opacity="0.1" />
          </svg>
        );

      case 'whack-a-mole':
        return (
          <svg className="w-full h-full" viewBox="0 0 200 120" fill="none">
            <rect width="200" height="120" fill="#120816" />
            <ellipse cx="60" cy="84" rx="24" ry="9" fill="#281033" stroke="#481a5c" strokeWidth="1.5" />
            <ellipse cx="140" cy="84" rx="24" ry="9" fill="#281033" stroke="#481a5c" strokeWidth="1.5" />
            {/* Pop-up Cute Mole */}
            <circle cx="60" cy="62" r="16" fill="#a855f7" />
            <ellipse cx="60" cy="67" rx="9" ry="6" fill="#f472b6" />
            <circle cx="54" cy="58" r="2" fill="#ffffff" />
            <circle cx="66" cy="58" r="2" fill="#ffffff" />
            {/* Cartoon Stars */}
            <text x="140" y="68" fontSize="20" textAnchor="middle">⭐</text>
          </svg>
        );

      case 'reaction-test':
        return (
          <svg className="w-full h-full" viewBox="0 0 200 120" fill="none">
            <rect width="200" height="120" fill="#04140d" />
            <rect x="35" y="20" width="130" height="80" rx="14" fill="#059669" stroke="#34d399" strokeWidth="2" />
            {/* Lightning Zap & Milliseconds */}
            <path d="M102 34L88 62H102L96 86L116 56H102L110 34Z" fill="#ffffff" />
            <text x="100" y="96" fill="#a7f3d0" fontSize="10" fontWeight="900" textAnchor="middle" letterSpacing="1">LIGHTNING FAST</text>
          </svg>
        );

      case 'ludo':
        return (
          <svg className="w-full h-full" viewBox="0 0 200 120" fill="none">
            <rect width="200" height="120" fill="#0c0c14" />
            {/* Ludo 4-Quadrant Board */}
            <g transform="translate(45, 5)">
              <rect width="110" height="110" rx="8" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
              {/* Red Yard */}
              <rect x="0" y="0" width="44" height="44" fill="#ef4444" />
              <rect x="8" y="8" width="28" height="28" rx="4" fill="#ffffff" />
              <circle cx="16" cy="16" r="4" fill="#ef4444" />
              <circle cx="28" cy="28" r="4" fill="#ef4444" />
              {/* Green Yard */}
              <rect x="66" y="0" width="44" height="44" fill="#10b981" />
              <rect x="74" y="8" width="28" height="28" rx="4" fill="#ffffff" />
              <circle cx="82" cy="16" r="4" fill="#10b981" />
              <circle cx="94" cy="28" r="4" fill="#10b981" />
              {/* Yellow Yard */}
              <rect x="66" y="66" width="44" height="44" fill="#fbbf24" />
              <rect x="74" y="74" width="28" height="28" rx="4" fill="#ffffff" />
              <circle cx="82" cy="82" r="4" fill="#fbbf24" />
              <circle cx="94" cy="94" r="4" fill="#fbbf24" />
              {/* Blue Yard */}
              <rect x="0" y="66" width="44" height="44" fill="#3b82f6" />
              <rect x="8" y="74" width="28" height="28" rx="4" fill="#ffffff" />
              <circle cx="16" cy="82" r="4" fill="#3b82f6" />
              <circle cx="28" cy="94" r="4" fill="#3b82f6" />
              {/* Center 3D Dice */}
              <rect x="44" y="44" width="22" height="22" rx="4" fill="#0f172a" stroke="#ffffff" strokeWidth="1.5" />
              <circle cx="55" cy="55" r="2.5" fill="#f43f5e" />
            </g>
          </svg>
        );

      case 'tetris':
        return (
          <svg className="w-full h-full" viewBox="0 0 200 120" fill="none">
            <rect width="200" height="120" fill="#080816" />
            <defs>
              <pattern id="tetris-grid-pat" width="14" height="14" patternUnits="userSpaceOnUse">
                <rect width="14" height="14" fill="none" stroke="#16162e" strokeWidth="0.8" />
              </pattern>
            </defs>
            <rect width="200" height="120" fill="url(#tetris-grid-pat)" />
            {/* Cyan I piece falling */}
            <rect x="36" y="24" width="12" height="12" rx="2" fill="#06b6d4" stroke="#67e8f9" strokeWidth="1" />
            <rect x="48" y="24" width="12" height="12" rx="2" fill="#06b6d4" stroke="#67e8f9" strokeWidth="1" />
            <rect x="60" y="24" width="12" height="12" rx="2" fill="#06b6d4" stroke="#67e8f9" strokeWidth="1" />
            <rect x="72" y="24" width="12" height="12" rx="2" fill="#06b6d4" stroke="#67e8f9" strokeWidth="1" />
            {/* Purple T Piece */}
            <rect x="100" y="38" width="12" height="12" rx="2" fill="#a855f7" stroke="#d8b4fe" strokeWidth="1" />
            <rect x="112" y="38" width="12" height="12" rx="2" fill="#a855f7" stroke="#d8b4fe" strokeWidth="1" />
            <rect x="124" y="38" width="12" height="12" rx="2" fill="#a855f7" stroke="#d8b4fe" strokeWidth="1" />
            <rect x="112" y="50" width="12" height="12" rx="2" fill="#a855f7" stroke="#d8b4fe" strokeWidth="1" />
            {/* Yellow O Square */}
            <rect x="148" y="52" width="12" height="12" rx="2" fill="#facc15" stroke="#fef08a" strokeWidth="1" />
            <rect x="160" y="52" width="12" height="12" rx="2" fill="#facc15" stroke="#fef08a" strokeWidth="1" />
            <rect x="148" y="64" width="12" height="12" rx="2" fill="#facc15" stroke="#fef08a" strokeWidth="1" />
            <rect x="160" y="64" width="12" height="12" rx="2" fill="#facc15" stroke="#fef08a" strokeWidth="1" />
            {/* Red Z Stack on bottom */}
            <rect x="52" y="80" width="12" height="12" rx="2" fill="#ef4444" stroke="#fca5a5" strokeWidth="1" />
            <rect x="64" y="80" width="12" height="12" rx="2" fill="#ef4444" stroke="#fca5a5" strokeWidth="1" />
            <rect x="64" y="92" width="12" height="12" rx="2" fill="#ef4444" stroke="#fca5a5" strokeWidth="1" />
            <rect x="76" y="92" width="12" height="12" rx="2" fill="#ef4444" stroke="#fca5a5" strokeWidth="1" />
            {/* Green S Piece */}
            <rect x="100" y="92" width="12" height="12" rx="2" fill="#22c55e" stroke="#86efac" strokeWidth="1" />
            <rect x="112" y="92" width="12" height="12" rx="2" fill="#22c55e" stroke="#86efac" strokeWidth="1" />
            <rect x="88" y="92" width="12" height="12" rx="2" fill="#3b82f6" stroke="#93c5fd" strokeWidth="1" />
          </svg>
        );

      case 'word-search':
        return (
          <svg className="w-full h-full" viewBox="0 0 200 120" fill="none">
            <rect width="200" height="120" fill="#0c101c" />
            {/* Letter Grid Matrix */}
            <g fill="#94a3b8" fontSize="13" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
              <text x="45" y="35">W</text>
              <text x="75" y="35">O</text>
              <text x="105" y="35">R</text>
              <text x="135" y="35">D</text>
              <text x="165" y="35">S</text>

              <text x="45" y="65">G</text>
              <text x="75" y="65">A</text>
              <text x="105" y="65">M</text>
              <text x="135" y="65">E</text>
              <text x="165" y="65">Z</text>

              <text x="45" y="95">P</text>
              <text x="75" y="95">L</text>
              <text x="105" y="95">A</text>
              <text x="135" y="95">Y</text>
              <text x="165" y="95">X</text>
            </g>
            {/* Word Highlight Capsule over "WORDS" */}
            <rect x="33" y="21" width="144" height="18" rx="9" fill="#10b981" fillOpacity="0.3" stroke="#34d399" strokeWidth="1.8" />
            {/* Word Highlight over "PLAY" */}
            <rect x="33" y="81" width="114" height="18" rx="9" fill="#6366f1" fillOpacity="0.3" stroke="#818cf8" strokeWidth="1.8" />
          </svg>
        );

      case 'typing-test':
        return (
          <svg className="w-full h-full" viewBox="0 0 200 120" fill="none">
            <rect width="200" height="120" fill="#080e18" />
            {/* Mechanical Keycaps */}
            <rect x="25" y="24" width="24" height="24" rx="5" fill="#152238" stroke="#253856" strokeWidth="1.5" />
            <text x="37" y="40" fill="#38bdf8" fontSize="12" fontWeight="bold" textAnchor="middle">Q</text>
            <rect x="53" y="24" width="24" height="24" rx="5" fill="#152238" stroke="#253856" strokeWidth="1.5" />
            <text x="65" y="40" fill="#38bdf8" fontSize="12" fontWeight="bold" textAnchor="middle">W</text>
            <rect x="81" y="24" width="24" height="24" rx="5" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.5" />
            <text x="93" y="40" fill="#ffffff" fontSize="12" fontWeight="bold" textAnchor="middle">E</text>
            <rect x="109" y="24" width="24" height="24" rx="5" fill="#152238" stroke="#253856" strokeWidth="1.5" />
            <text x="121" y="40" fill="#38bdf8" fontSize="12" fontWeight="bold" textAnchor="middle">R</text>
            <rect x="137" y="24" width="24" height="24" rx="5" fill="#152238" stroke="#253856" strokeWidth="1.5" />
            <text x="149" y="40" fill="#38bdf8" fontSize="12" fontWeight="bold" textAnchor="middle">T</text>
            {/* Speed Badge */}
            <rect x="40" y="64" width="120" height="34" rx="8" fill="#0c4a6e" stroke="#0ea5e9" strokeWidth="1.5" />
            <text x="100" y="86" fill="#38bdf8" fontSize="15" fontWeight="900" textAnchor="middle">120 WPM ⚡</text>
          </svg>
        );

      case 'solitaire':
        return (
          <svg className="w-full h-full" viewBox="0 0 200 120" fill="none">
            <rect width="200" height="120" fill="#071b12" />
            {/* Cascading Playing Cards */}
            {/* Card 1 */}
            <rect x="35" y="20" width="36" height="52" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
            <text x="43" y="34" fill="#1e293b" fontSize="11" fontWeight="bold">A</text>
            <text x="53" y="52" fill="#1e293b" fontSize="16" textAnchor="middle">♠</text>
            {/* Card 2 (King of Hearts) */}
            <rect x="82" y="28" width="36" height="52" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
            <text x="90" y="42" fill="#ef4444" fontSize="11" fontWeight="bold">K</text>
            <text x="100" y="60" fill="#ef4444" fontSize="16" textAnchor="middle">♥</text>
            {/* Card 3 (Queen of Diamonds) */}
            <rect x="129" y="36" width="36" height="52" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
            <text x="137" y="50" fill="#ef4444" fontSize="11" fontWeight="bold">Q</text>
            <text x="147" y="68" fill="#ef4444" fontSize="16" textAnchor="middle">♦</text>
          </svg>
        );

      case 'color-match':
        return (
          <svg className="w-full h-full" viewBox="0 0 200 120" fill="none">
            <rect width="200" height="120" fill="#100814" />
            {/* 4 Chromatic Color Blocks */}
            <rect x="42" y="20" width="36" height="36" rx="8" fill="#f43f5e" stroke="#fda4af" strokeWidth="2" />
            <rect x="86" y="20" width="36" height="36" rx="8" fill="#06b6d4" stroke="#67e8f9" strokeWidth="2" />
            <rect x="42" y="64" width="36" height="36" rx="8" fill="#10b981" stroke="#6ee7b7" strokeWidth="2" />
            <rect x="86" y="64" width="36" height="36" rx="8" fill="#f59e0b" stroke="#fde68a" strokeWidth="2" />
            {/* Match Dial Indicator */}
            <circle cx="154" cy="60" r="26" fill="#1e102a" stroke="#c084fc" strokeWidth="2.5" />
            <text x="154" y="64" fill="#e9d5ff" fontSize="10" fontWeight="900" textAnchor="middle">MATCH</text>
          </svg>
        );

      default:
        return (
          <svg className="w-full h-full" viewBox="0 0 200 120" fill="none">
            <rect width="200" height="120" fill="#141418" />
            <circle cx="100" cy="60" r="25" fill="#27272a" />
          </svg>
        );
    }
  };

  return (
    <div className={`relative w-full aspect-[16/9] overflow-hidden bg-zinc-900 ${className}`}>
      {getThumbnailContent()}
    </div>
  );
}
