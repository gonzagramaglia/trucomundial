# Truco Mundial 🏆 (BETA)

**Truco Mundial** is the evolution of Argentine Truco. A game where the wit of Truco meets the passion of World Cup stickers. 
*Note: The project is currently in its Beta phase, undergoing continuous updates, new features, and polish.*

## 🚀 Concept
A fresh take on the classic card game featuring custom-designed stickers of football players (inspired by World Cup albums, but not using real/official stickers). Each player's power level is determined by the community through daily voting — naturally, Messi tends to reign as the Ace of Swords, but the hierarchy shifts every day based on who the community decides to buff.

The game includes the complete Truco experience, featuring **Truco**, **Retruco**, **Vale Cuatro**, and the full **Envido** system (Envido, Real Envido, Falta Envido). 
**Envido Mechanics:** Unlike traditional Truco (which uses suits and a +20 base bonus), Envido points in Truco Mundial are calculated by summing the envido values of two cards that share the same **Country** or **Club**. The standard +20 base bonus is omitted, making the calculations direct and unique to the players' stats!

## 🎮 Features
- **Custom Deck Building ([`/mazo`](https://trucomundial.com/mazo))**: Open packs, unlock 500+ player cards, and select 4 national teams to build your competitive deck.
- **Real-Time Multiplayer**: Play online with friends using a 4-letter private room code with seamless reconnection.
- **Local Play**: Play against the CPU in 1v1 or 2v2 mode. Choose between 15 or 30 point matches.
- **World Cup Prode ([`/prode`](https://trucomundial.com/prode))**: Predict match results, view the interactive knockout bracket with live progression, and earn reward codes for correct predictions. Real results buff card power levels.
- **Interactive Card Voting ([`/votar`](https://trucomundial.com/votar))**: Distribute up to 78 daily stars to rank cards. Community votes directly determine card strength in-game.
- **Twitch Integration**: Interactive chat overlay for streamers — viewers participate in deck selection and game interactions live.
- **Google Authentication**: Quick login via Supabase for multiplayer. Anonymous play also supported.
- **Bilingual (i18n)**: Full English and Spanish support throughout.

## 🛠️ Tech Stack
- **Frontend**: React 19 + Vite 8 (TypeScript)
- **Package Manager**: Yarn
- **Styling**: Vanilla CSS + Framer Motion
- **State Management**: Zustand
- **Backend/DB**: Supabase (Realtime, Postgres & Auth)
- **Testing**: Vitest + @testing-library/react
- **Code Quality**: Husky + Commitlint (Conventional Commits) + CodeRabbit

## 🧪 Testing & Code Quality

| Tool | Purpose |
|------|---------|
| [Vitest](vitest.config.ts) | Unit test runner (56 tests, all passing) |
| [CodeRabbit](.coderabbit.yaml) | Automated AI code review on PRs to main |
| Husky + Commitlint | Conventional Commits enforcement on every commit |
| TypeScript strict | Full type checking, build fails on errors |

```bash
yarn test              # Run all tests (single run)
yarn test:watch        # Watch mode
yarn test:coverage     # With V8 coverage report
yarn build             # Type check + production build
```

## 🎨 Look & Feel
- **Urban Freestyle** Aesthetics: Bold typography, high contrast, and vibrant colors.
- Inspired by the **2026 World Cup Album**.
- **Football stadium** style digital scoreboard.
- Optimized for both mobile and desktop screens with a premium interface.

## 📚 Documentation

| Document | Description |
|----------|-------------|
| **[docs/project-report.md](docs/project-report.md)** | Full project report (architecture, testing, stack) |
| **[context/architecture.md](context/architecture.md)** | Technical architecture & data flows |
| **[context/code-standards.md](context/code-standards.md)** | Engineering conventions & rules |
| **[context/game-logic.md](context/game-logic.md)** | Truco game rules & engine reference |
| **[context/ui-guide.md](context/ui-guide.md)** | Design tokens, colors, component patterns |
| **[AGENTS.md](AGENTS.md)** | AI agent instructions & available skills |
| **[PR_STANDARDS.md](PR_STANDARDS.md)** | Pull request format, branch naming & checklist |

## 🤝 Contribution and License
This project is developed openly (Open development — collaboration inquiries welcome).
The source code is available for review and learning, but **the concept, design, and brand of "Truco Mundial" are protected and reserved.** If you are interested in collaborating, have ideas for the game, or wish to use part of this code in other projects, please get in touch via GitHub.
