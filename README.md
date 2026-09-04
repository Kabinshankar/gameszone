# 🚀 Nexvara — The Ultimate Cyber-Arcade Gaming Platform

**Nexvara** is a high-performance, modern HTML5 web arcade featuring 20+ responsive games, local/online 2-player multiplayer, deterministic daily challenges, chapter-based achievement milestones, cosmetic shop inventory, and encrypted client-side account progression.

🌐 **Live URL:** [https://nexvara.vercel.app](https://nexvara.vercel.app)

---

## 🎮 Features & Architecture

### 🕹️ 20+ Interactive HTML5 Games
- **Strategy & Classic:** Tic Tac Toe (Minimax AI + DDA), Ludo (4-color corner dice stations), Connect Four, Checkers, Solitaire, Sudoku, Minesweeper.
- **Arcade & Reflex:** Snake, 2048, Tetris, Breakout, Pong, Flappy Rocket, Whack-a-Mole, Reaction Test.
- **Puzzle & Word:** Memory Match, Word Search, Color Match, Typing Test, Rock Paper Scissors.

### 🧠 AI Opponents & Dynamic Difficulty Adjustment (DDA)
- **Minimax AI** for Tic Tac Toe and smart heuristics for Memory and Connect Four.
- **DDA Engine** (`lib/ai-opponent.ts`): Tracks recent win rates and dynamically scales AI difficulty between Easy, Medium, and Hard to keep players in their ideal psychological flow state.
- **Anti-Frustration Safeguards** (`components/AntifrustrationCard.tsx`): Automatic consolation coins and game tips after 3 consecutive losses.

### 📅 Deterministic Daily Challenge Engine
- **Mulberry32 Date-Seeded RNG** (`lib/daily-challenge.ts`): Ensures every player worldwide gets the exact same daily mission with coin/XP bounties.

### 🏆 18-Tier Achievement System & 5 Board Themes
- Story-driven chapters (*First Steps*, *The Grind*, *The Arena*, *Legends*) in `lib/achievements.ts`.
- 5 custom board aesthetics (*Classic Dark*, *Space Explorer*, *Ancient Egypt*, *Neon City*, *Enchanted Forest*).

### 🔒 Encrypted Client-Side Account System
- AES-GCM + PBKDF2 cryptography (`lib/crypto.ts`) for secure password hashing and profile encryption in `localStorage`.
- Real-time profile state syncing across tabs with dual event dispatching.
- Guest-to-registered account migration without progress loss.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript 5 (Strict mode, zero errors)
- **Styling:** Tailwind CSS + Vanilla CSS Hardware-Accelerated Animations
- **Icons:** Lucide React
- **Sound:** Web Audio API synth sound engine
- **SEO & PWA:** Automated sitemaps, JSON-LD Schema, robots.txt, and Web Manifest

---

## 🚀 Getting Started

```bash
# Clone repository
git clone https://github.com/Kabinshankar/gameszone.git

# Install dependencies
npm install

# Start local development server
npm run dev

# Build for production
npm run build
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📜 License
MIT License. Created with ❤️ by Kabin Shankar.
