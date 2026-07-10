# Project Report

**Project Name:** Truco Mundial
**URL:** [trucomundial.com](https://trucomundial.com)

---

## 1. Executive Summary

Truco Mundial is a real-time multiplayer card game that fuses Argentine Truco with World Cup football stickers. Players build custom decks from 500+ player cards across 48 national teams, compete in online and local matches, and shape the metagame through community voting — all powered by a dynamic card value system where votes and real World Cup results determine each card's strength.

---

## 2. Project Overview

### 2a. Why we're building this

Traditional digital Truco games are static — card values are fixed, the meta never changes, and there's no community engagement beyond the match itself. Truco Mundial solves this by introducing a living metagame where card power is determined by community votes and real World Cup results, making every day's meta different from the last.

### 2b. How it relates to the 2026 World Cup

The game is built around the FIFA World Cup 2026 calendar. Match results from the real tournament directly buff card values — if Argentina wins, all Argentine player cards gain stars. The integrated fixture tracker, prode (prediction game), and bracket visualization keep players engaged with both the game and the tournament simultaneously.

### 2c. Target Audience

Football fans and Truco enthusiasts (primarily Argentine/LATAM) who enjoy competitive card games, sticker collecting, and following the World Cup. Ages 16-35, comfortable with mobile gaming and social features.

---

## 3. Key Features

- **Custom Deck Building (`/mazo`)** — Open packs, unlock 500+ player cards, select 4 national teams to build your competitive deck
- **Real-Time Multiplayer** — Private room codes, host/guest architecture with seamless reconnection
- **Community Card Voting (`/votar`)** — 78 daily stars to distribute; votes directly determine card strength in-game
- **World Cup Integration (`/prode`)** — Live bracket, fixture results, predictions with reward codes
- **Twitch Integration** — Chat overlay, viewer participation in deck selection during streams
- **Full Truco Engine** — Truco, Retruco, Vale Cuatro, Envido, Real Envido, Falta Envido
- **CPU AI** — Intelligent CPU opponent for local play
- **Bilingual (i18n)** — Full English and Spanish support
- **Dynamic SPA Routing** — Zero-dependency URL mapping with SEO metadata

> **Note:** Tournaments (`/torneos`) and Roadmap (`/ruta`) features exist in the codebase but are currently disabled in the UI.

---

## 4. Technology Stack

| Layer | Technology |
|-------|------------|
| Framework | React 19 + Vite 8 (TypeScript) |
| Styling | Vanilla CSS + Framer Motion |
| State Management | Zustand |
| Auth + DB + Realtime | Supabase (PostgreSQL, RLS, Realtime) |
| Internationalization | i18next + react-i18next |
| Streaming | tmi.js (Twitch chat) |
| Forms & Validation | react-hook-form + Zod |
| Icons | lucide-react |
| Testing | Vitest + @testing-library/react |
| Code Quality | Husky + Commitlint (Conventional Commits) |
| AI Code Review | CodeRabbit |
| Development Environment | Kiro |

---

## 5. Technical Architecture

```
┌─────────────────────────────────────────────────────┐
│              Frontend (Vercel / Static)               │
│  React 19 + Vite → SPA                              │
│  Supabase Client (Auth, DB, Realtime)                │
│  Zustand (votesStore, game state)                    │
└──────────────────┬──────────────────────────────────┘
                   │
                   │ Supabase SDK (REST + WebSocket)
                   ▼
┌─────────────────────────────────────────────────────┐
│              Supabase (Backend)                       │
│  ├── PostgreSQL (users, decks, votes, fixtures)      │
│  ├── Auth (Google OAuth + Anonymous)                 │
│  ├── Realtime (multiplayer sync, live results)       │
│  └── Row Level Security (user-scoped access)         │
└─────────────────────────────────────────────────────┘

Data Flow:
  Vote → Update game_sync → votesStore recalculates → Card values change live
  Match result → fixture_results → Base stars recalculated → Cards buffed
  Multiplayer → Realtime broadcast → Opponent receives move → State synced
```

---

## 6. Testing Matrix

| Feature / Flow | Tests | Status |
|----------------|-------|--------|
| Truco Engine — calculateEnvido | 8 cases (empty, single, pairs, best pair) | ✅ |
| Truco Engine — getCardValue | 2 cases (known, unknown card) | ✅ |
| Truco Engine — determineWinner | 4 cases (single, highest wins, tie, same-team) | ✅ |
| Formatters — normalizeTournamentPrizes | 7 cases (null, string, JSON, nested, arrays) | ✅ |
| Formatters — formatTournamentPrizes | 3 cases (empty, single, multiple) | ✅ |
| Formatters — formatTournamentDate | 3 cases (empty, invalid, valid ISO) | ✅ |
| Votes Store — registry operations | 9 cases (CRUD, suffixes, snapshots, tournament) | ✅ |
| Votes Store — isTopCard | 1 case (top vs non-top identification) | ✅ |
| Fixture Data — JSON integrity | 6 cases (loading, fields, status, IDs, scores) | ✅ |
| Standings Data — structure & math | 11 cases (groups, teams, pts formula, GD) | ✅ |

**Total: 56 unit tests, all passing.**

---

## 7. Code Quality

- **Conventional Commits** — Enforced via Husky + Commitlint on every commit
- **CodeRabbit** — Automated assertive AI review on all PRs to main
- **TypeScript strict mode** — Full type coverage, no implicit any in production code
- **JSDoc documentation** — 80%+ coverage on all lib/ and hooks/ exports
- **Data extraction** — All static data (translations, fixtures, standings) in JSON, not code

---

## 8. Future Improvements

- Push notifications for tournament matches and World Cup results
- Ranked matchmaking with ELO system
- Seasonal card packs tied to knockout stage progression
- Replay system for tournament matches
- Mobile app (React Native with shared game logic)
- Spectator mode for Twitch integration
- Trade system between players

---

## 9. Tools Used

| Tool | Purpose |
|------|---------|
| Kiro | Primary development environment |
| CodeRabbit | Automated AI code review on every PR |
| Supabase | Managed PostgreSQL + Auth + Realtime |
| Vercel | Frontend hosting |
| Twitch (tmi.js) | Streaming chat integration |

---

## 10. Learnings & Takeaways

- **Zustand** proved ideal for the votes store — simple API, selector subscriptions, and zero boilerplate compared to the manual pub/sub pattern it replaced.
- **Community-driven card values** create emergent gameplay — the meta shifts daily without any developer intervention, driven entirely by player votes and real World Cup results.
- **Real-time multiplayer with Supabase Realtime** works well for turn-based games but requires careful state reconciliation and reconnection logic.
- **Inline styles vs CSS modules** — the codebase uses extensive inline styles which helped with rapid iteration but created large component files. A future refactor to CSS modules would improve maintainability.
- **Kiro's steering files** provided persistent context across sessions, preventing architectural drift during long development sprints.
- **i18n as JSON** (extracted from inline objects) dramatically improved translation workflow and reduced TypeScript file sizes by ~1200 lines each.

---

## 11. Acknowledgments

- **Kiro** — AI development environment
- **CodeRabbit** — AI code review
- **Supabase** — Backend infrastructure
- **Vercel** — Frontend hosting
- **The Truco Mundial community** — Streamers, players, and voters who shape the metagame daily
