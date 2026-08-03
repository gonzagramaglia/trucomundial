# Truco Mundial Refactoring Roadmap

This document outlines the strategic plan to decompose massive "God Components" in the `trucomundial` repository. By breaking these down into smaller, focused modules and custom hooks, we will drastically improve maintainability, testing, and performance.

## 🚨 The Giants (Technical Debt)

The following components have grown beyond 1,000 lines and are the primary targets for decomposition, ordered by severity. Tournaments logic is deferred to the end:

1. **`LandingPage.tsx` (2414 lines)** - Orchestrates multiple sub-screens, modals, user authentication, matchmaking logic, and room codes. (In Progress)
2. **`DeckScreen.tsx` (1673 lines)** - Deck building, card selection, and filtering logic.
3. **`CreatorScreen.tsx` (1621 lines)** - Creator dashboard and tournament management.
4. **`AdminScreen.tsx` (1474 lines)** - Administrative overrides and global state management.
5. **`ProfileScreen.tsx` (1135 lines)** - User stats, matches history, and settings.
6. **`TournamentScreen.tsx` (1733 lines)** - Complex state for brackets, active matches, and leaderboards.
7. **`TournamentEventPage.tsx` (1216 lines)** - Specific event details and live updates.

---

## 🛠️ Upcoming PRs & Branches

### 1. `refactor/decompose-landing-page` (Next Target)

**Goal**: Slim down `LandingPage.tsx` from 2400+ lines to a clean orchestrator component (< 300 lines).

**Action Plan**:
- **Extract State Hooks**: Move all matchmaking, room code logic, user session management, and UI navigation state into custom hooks (e.g., `useMatchmaking`, `useRoomNavigation`, `useLandingUI`).
- **Extract Modals**: Move all inline modal definitions (Rules, Room Join, Waiting states) into standalone components inside `src/components/landing/modals/`.
- **Extract Sections**: Split the gigantic render method into smaller sub-components (e.g., `HeroSection`, `ActiveTournamentsBanner`, `GameModeOptions`).

> [!TIP]
> The `LandingPage` should only be responsible for composing these smaller sections and providing them with state from the custom hooks, effectively acting as a router/layout wrapper.

### 2. `refactor/decompose-tournament-screen`

**Goal**: Untangle tournament bracket logic from rendering.
- Separate data fetching and real-time Supabase listeners into `useTournamentLive`.
- Split brackets, leaderboards, and match popups into independent UI components.

### 3. `refactor/decompose-deck-screen`

**Goal**: Optimize deck building experience.
- Extract filtering and sorting algorithms into util functions.
- Move "selected deck" state into a dedicated provider or hook `useDeckBuilder`.
- Break down card grids and detail views.

---

## ❓ Open Questions para Gonza

1. **Prioridad Inmediata**: ¿Estás de acuerdo con atacar el monstruo de `LandingPage.tsx` como el próximo PR (`refactor/decompose-landing-page`) o preferís saltar a otro?
2. **Estructura de Carpetas**: Al extraer lógicas de `LandingPage.tsx`, ¿preferís que agrupe todo en subcarpetas dentro de `landing/` (ej. `landing/hooks/`, `landing/modals/`) o movemos los hooks globales a `src/hooks/`?
3. **Draft del PR**: ¿Querés que además de armar esta rama, cree inmediatamente el draft `docs/prs/pr-4-landing-page.md` para ir documentando paso a paso como indica nuestro `PR_STANDARDS.md`?

Revisá el plan y dale a "Proceed" o comentame qué ajustes le hacemos.
