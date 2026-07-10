# Architecture

## Overview

Truco Mundial is a single-page application (React 19 + Vite 8) with Supabase as the backend. There is no custom server — all backend logic lives in Supabase (Postgres, Auth, Realtime, Storage).

## Stack

| Layer | Technology |
|-------|------------|
| UI Framework | React 19 (TypeScript) |
| Bundler | Vite 8 |
| State | Zustand (votesStore) + React useState/useRef |
| Styling | Vanilla CSS + Framer Motion |
| Backend | Supabase (PostgreSQL, RLS, Realtime, Storage) |
| Auth | Supabase Auth (Google OAuth + Anonymous) |
| i18n | i18next + react-i18next |
| Testing | Vitest + @testing-library/react |
| Streaming | tmi.js (Twitch chat) |

## Directory Structure

```
src/
├── App.tsx                  # Root: landing vs playing state
├── components/
│   ├── landing/             # All screens (LandingPage, ProdeScreen, DeckScreen, etc.)
│   ├── game/                # In-match UI (board, cards, modals, controls)
│   ├── admin/               # Admin panel
│   ├── shared/              # Reusable UI (Sticker, RulesModal, UtilityButtons)
│   ├── twitch/              # Twitch overlay app
│   └── ui/                  # Generic UI primitives
├── hooks/
│   ├── truco/               # Game state sub-hooks (State, Turn, Logic, Handlers, Effects)
│   ├── matchmaking/         # Multiplayer sub-hooks (Broadcast, Network, Handlers)
│   ├── useTrucoCore.ts      # Orchestrator hook
│   ├── useTrucoGame.ts      # Core + CPU + connection
│   └── useMatchmaking.ts    # Realtime multiplayer facade
├── lib/
│   ├── truco/               # Pure game logic (engine.ts, types.ts)
│   ├── votesStore.ts        # Zustand store (card votes, top cards)
│   ├── audio.ts             # AudioManager singleton
│   ├── fixtureData.ts       # World Cup fixture types + JSON import
│   ├── standingsData.ts     # Group standings types + JSON import
│   ├── supabase.ts          # Supabase client
│   ├── i18n.ts              # i18next config (imports from locales/)
│   ├── formatters.ts        # Date/prize formatting utilities
│   ├── matches.ts           # Tournament match persistence
│   └── schemas.ts           # Zod validation schemas
├── data/
│   ├── cards.ts             # 500+ card definitions (Card interface + CARDS array)
│   ├── fixtureMatches.json  # 100 World Cup matches
│   ├── groupStandings.json  # 12 group tables
│   └── thirdPlaceStandings.json
├── locales/
│   ├── en.json              # English translations (563 keys)
│   └── es.json              # Spanish translations (563 keys)
├── styles/                  # CSS files (base, components, game, variables)
└── tests/                   # Vitest unit tests
```

## Data Flow

```
Community votes → Supabase game_sync → votesStore → Card power values
World Cup results → Supabase fixture_results → Base stars → Card buffs
Multiplayer move → Supabase Realtime broadcast → Opponent state sync
```

## Routing

No router library. LandingPage.tsx manages screens via boolean state flags + window.history.pushState.

**Active routes:** `/`, `/mazo`, `/votar`, `/prode`, `/perfil`, `/admin`, `/creador`

**Disabled routes (code exists but hidden from UI):** `/torneos`, `/ruta`

## Multiplayer Architecture

- Host generates round data (hands, starter) and broadcasts via Supabase Realtime
- Guest receives sync and applies state
- Moves are broadcast as typed messages: `playCard`, `call`, `response`, `mazo`, `sync`
- Reconnection supported via `reconnect_request` messages

## Card Value System

Card strength = community votes + base stars (from World Cup results). Values are snapshotted at game start so they don't change mid-match. Tournament matches can use a frozen snapshot.
