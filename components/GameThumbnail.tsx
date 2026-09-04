'use client';

interface GameThumbnailProps {
  slug: string;
  name: string;
  className?: string;
}

export default function GameThumbnail({ slug, name, className = '' }: GameThumbnailProps) {
  const getThumbnailContent = () => {
    switch (slug) {
      case 'tic-tac-toe':
        return (
          <svg className="w-full h-full" viewBox="0 0 200 120" fill="none">
            <rect width="200" height="120" fill="#0d0d14" />
            <path d="M70 20V100M130 20V100M30 50H170M30 80H170" stroke="#27272a" strokeWidth="3" strokeLinecap="round" />
            {/* X */}
            <path d="M40 26L58 44M58 26L40 44" stroke="#6366f1" strokeWidth="4" strokeLinecap="round" />
            {/* O */}
            <circle cx="100" cy="65" r="10" stroke="#06b6d4" strokeWidth="4" />
            {/* X */}
            <path d="M142 56L160 74M160 56L142 74" stroke="#6366f1" strokeWidth="4" strokeLinecap="round" />
          </svg>
        );

      case 'snake':
        return (
          <svg className="w-full h-full" viewBox="0 0 200 120" fill="none">
            <rect width="200" height="120" fill="#0b130e" />
            {/* Grid Dots */}
            <pattern id="snake-grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="1" fill="#1b2e21" />
            </pattern>
            <rect width="200" height="120" fill="url(#snake-grid)" />
            {/* Snake Segment */}
            <path d="M40 60H120V90H140" stroke="#10b981" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="140" cy="90" r="8" fill="#34d399" />
            {/* Food */}
            <circle cx="160" cy="40" r="7" fill="#f43f5e" />
          </svg>
        );

      case '2048':
        return (
          <svg className="w-full h-full" viewBox="0 0 200 120" fill="none">
            <rect width="200" height="120" fill="#14110b" />
            <rect x="35" y="15" width="42" height="42" rx="6" fill="#272218" />
            <rect x="83" y="15" width="42" height="42" rx="6" fill="#f59e0b" />
            <text x="104" y="42" fill="#ffffff" fontSize="16" fontWeight="bold" textAnchor="middle">128</text>
            <rect x="131" y="15" width="42" height="42" rx="6" fill="#d97706" />
            <text x="152" y="42" fill="#ffffff" fontSize="16" fontWeight="bold" textAnchor="middle">256</text>
            <rect x="83" y="63" width="42" height="42" rx="6" fill="#6366f1" />
            <text x="104" y="90" fill="#ffffff" fontSize="14" fontWeight="bold" textAnchor="middle">2048</text>
          </svg>
        );

      case 'memory':
        return (
          <svg className="w-full h-full" viewBox="0 0 200 120" fill="none">
            <rect width="200" height="120" fill="#140c14" />
            <rect x="30" y="25" width="38" height="55" rx="5" fill="#271827" stroke="#3f233f" />
            <rect x="80" y="25" width="38" height="55" rx="5" fill="#6366f1" />
            <path d="M99 45L106 58H92L99 45Z" fill="#ffffff" />
            <rect x="130" y="25" width="38" height="55" rx="5" fill="#6366f1" />
            <path d="M149 45L156 58H142L149 45Z" fill="#ffffff" />
          </svg>
        );

      case 'minesweeper':
        return (
          <svg className="w-full h-full" viewBox="0 0 200 120" fill="none">
            <rect width="200" height="120" fill="#140a0a" />
            <rect x="40" y="20" width="36" height="36" rx="4" fill="#241414" />
            <text x="58" y="44" fill="#60a5fa" fontSize="20" fontWeight="bold" textAnchor="middle">1</text>
            <rect x="82" y="20" width="36" height="36" rx="4" fill="#241414" />
            <text x="100" y="44" fill="#f87171" fontSize="20" fontWeight="bold" textAnchor="middle">3</text>
            <rect x="124" y="20" width="36" height="36" rx="4" fill="#ef4444" />
            <circle cx="142" cy="38" r="8" fill="#ffffff" />
          </svg>
        );

      case 'rock-paper-scissors':
        return (
          <svg className="w-full h-full" viewBox="0 0 200 120" fill="none">
            <rect width="200" height="120" fill="#0f0c18" />
            <circle cx="60" cy="60" r="28" fill="#1f1a30" stroke="#6366f1" strokeWidth="2" />
            <text x="60" y="67" fontSize="24" textAnchor="middle">🪨</text>
            <circle cx="140" cy="60" r="28" fill="#1f1a30" stroke="#06b6d4" strokeWidth="2" />
            <text x="140" y="67" fontSize="24" textAnchor="middle">✂️</text>
            <text x="100" y="65" fill="#a1a1aa" fontSize="14" fontWeight="bold" textAnchor="middle">VS</text>
          </svg>
        );

      case 'connect-four':
        return (
          <svg className="w-full h-full" viewBox="0 0 200 120" fill="none">
            <rect width="200" height="120" fill="#08101e" />
            <rect x="25" y="15" width="150" height="90" rx="8" fill="#1e293b" />
            <circle cx="50" cy="40" r="10" fill="#0f172a" />
            <circle cx="85" cy="40" r="10" fill="#ef4444" />
            <circle cx="120" cy="40" r="10" fill="#0f172a" />
            <circle cx="155" cy="40" r="10" fill="#fbbf24" />
            <circle cx="85" cy="70" r="10" fill="#ef4444" />
            <circle cx="120" cy="70" r="10" fill="#ef4444" />
          </svg>
        );

      case 'checkers':
        return (
          <svg className="w-full h-full" viewBox="0 0 200 120" fill="none">
            <rect width="200" height="120" fill="#120c06" />
            <rect x="40" y="20" width="120" height="80" fill="#2d1b0d" stroke="#452914" />
            <rect x="70" y="20" width="30" height="40" fill="#78350f" />
            <rect x="130" y="20" width="30" height="40" fill="#78350f" />
            <circle cx="85" cy="40" r="11" fill="#ef4444" stroke="#fca5a5" strokeWidth="2" />
            <circle cx="115" cy="80" r="11" fill="#18181b" stroke="#71717a" strokeWidth="2" />
          </svg>
        );

      case 'sudoku':
        return (
          <svg className="w-full h-full" viewBox="0 0 200 120" fill="none">
            <rect width="200" height="120" fill="#091018" />
            <rect x="55" y="15" width="90" height="90" fill="#0f172a" stroke="#334155" strokeWidth="2" />
            <path d="M85 15V105M115 15V105M55 45H145M55 75H145" stroke="#1e293b" strokeWidth="1" />
            <text x="70" y="37" fill="#38bdf8" fontSize="16" fontWeight="bold" textAnchor="middle">5</text>
            <text x="100" y="67" fill="#6366f1" fontSize="16" fontWeight="bold" textAnchor="middle">9</text>
            <text x="130" y="97" fill="#38bdf8" fontSize="16" fontWeight="bold" textAnchor="middle">3</text>
          </svg>
        );

      case 'flappy-rocket':
        return (
          <svg className="w-full h-full" viewBox="0 0 200 120" fill="none">
            <rect width="200" height="120" fill="#060c14" />
            {/* Obstacle Pipes */}
            <rect x="130" y="0" width="28" height="40" fill="#4338ca" />
            <rect x="130" y="80" width="28" height="40" fill="#4338ca" />
            {/* Rocket */}
            <circle cx="70" cy="58" r="10" fill="#06b6d4" />
            <path d="M54 58L62 53V63L54 58Z" fill="#f97316" />
          </svg>
        );

      case 'breakout':
        return (
          <svg className="w-full h-full" viewBox="0 0 200 120" fill="none">
            <rect width="200" height="120" fill="#0b1308" />
            {/* Bricks */}
            <rect x="30" y="20" width="30" height="10" rx="2" fill="#ef4444" />
            <rect x="65" y="20" width="30" height="10" rx="2" fill="#f97316" />
            <rect x="100" y="20" width="30" height="10" rx="2" fill="#eab308" />
            <rect x="135" y="20" width="30" height="10" rx="2" fill="#10b981" />
            {/* Paddle */}
            <rect x="75" y="95" width="50" height="8" rx="4" fill="#84cc16" />
            {/* Ball */}
            <circle cx="100" cy="75" r="5" fill="#ffffff" />
          </svg>
        );

      case 'pong':
        return (
          <svg className="w-full h-full" viewBox="0 0 200 120" fill="none">
            <rect width="200" height="120" fill="#090d07" />
            <path d="M100 0V120" stroke="#1e293b" strokeDasharray="4 4" />
            <rect x="20" y="35" width="6" height="45" rx="3" fill="#a3e635" />
            <rect x="174" y="45" width="6" height="45" rx="3" fill="#06b6d4" />
            <circle cx="110" cy="55" r="4" fill="#ffffff" />
          </svg>
        );

      case 'whack-a-mole':
        return (
          <svg className="w-full h-full" viewBox="0 0 200 120" fill="none">
            <rect width="200" height="120" fill="#120914" />
            <ellipse cx="60" cy="80" rx="22" ry="8" fill="#2e1435" />
            <ellipse cx="140" cy="80" rx="22" ry="8" fill="#2e1435" />
            <circle cx="60" cy="60" r="14" fill="#a855f7" />
            <circle cx="55" cy="56" r="2" fill="#ffffff" />
            <circle cx="65" cy="56" r="2" fill="#ffffff" />
          </svg>
        );

      case 'reaction-test':
        return (
          <svg className="w-full h-full" viewBox="0 0 200 120" fill="none">
            <rect width="200" height="120" fill="#051410" />
            <rect x="40" y="25" width="120" height="70" rx="10" fill="#059669" />
            <path d="M92 45L112 60L92 75V45Z" fill="#ffffff" />
          </svg>
        );

      case 'ludo':
        return (
          <svg className="w-full h-full" viewBox="0 0 200 120" fill="none">
            <rect width="200" height="120" fill="#14080a" />
            <rect x="35" y="15" width="42" height="42" rx="6" fill="#9f1239" />
            <circle cx="56" cy="36" r="8" fill="#f43f5e" />
            <rect x="123" y="15" width="42" height="42" rx="6" fill="#065f46" />
            <circle cx="144" cy="36" r="8" fill="#10b981" />
            <rect x="35" y="63" width="42" height="42" rx="6" fill="#1e40af" />
            <rect x="123" y="63" width="42" height="42" rx="6" fill="#854d0e" />
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
