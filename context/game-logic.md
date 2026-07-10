# Game Logic Reference

Core rules and mechanics of Truco Mundial for AI agents working on the game engine.

## Card System

- 500+ cards, each representing a real football player
- Every card has: `id`, `name`, `env` (envido value), `country`, `club`, `image`
- Card **power** in-game = community votes (stars) + base stars from World Cup results
- Power is snapshotted at game start via `snapshotVotesForGame()`

## Envido Calculation

Unlike traditional Truco (+20 base for same-suit pairs), Truco Mundial:
- Pairs matching by **Country** OR **Club** sum their `env` values directly
- No +20 base bonus
- Best score = max(single card envido, best pair sum)
- Implementation: `src/lib/truco/engine.ts → calculateEnvido()`

## Card Value (Truco Hands)

- Higher votes = stronger card
- `getCardValue(card)` returns the vote count from `votesStore`
- `determineWinner(playedCards)` finds the card with the highest value
- Ties between different teams = draw; ties within same team = that team wins

## Game Modes

| Mode | Description |
|------|-------------|
| `1v1` | Player vs CPU (local) |
| `2v2` | Player+Partner vs CPU+CPU2 (local) |
| `multiplayer` | Player vs Player (online, Supabase Realtime) |

## Player Roles

- `player` — the local human player
- `cpu` — the AI opponent (or remote rival in multiplayer)
- `partner` — AI teammate in 2v2
- `opponent2` / `cpu2` — second AI opponent in 2v2

## Match Flow

1. `startGame()` → sets mode, generates round data (deal hands, pick starter)
2. Each round: 3 hands played, each hand has 1 card per player
3. Best-of-3 hands wins the round (score += truco level points)
4. First to reach `maxPoints` (15 or 30) wins the match

## Truco Calls

| Level | Call | Points if accepted |
|-------|------|-------------------|
| 1 | Truco | 2 |
| 2 | Retruco | 3 |
| 3 | Vale Cuatro | 4 |

- Caller proposes → opponent responds (Quiero/No Quiero)
- If declined: caller gets points from previous level (or 1 if Truco declined)
- "El envido está primero" — envido can be called in response to truco before resolving

## Envido Calls

| Level | Call | Points |
|-------|------|--------|
| 1 | Envido | 2 |
| 2 | Envido-Envido | 4 |
| 3 | Real Envido | 3 (standalone) |
| 4 | Falta Envido | remaining points to win |

- Can only be called in the first hand of a round
- After resolving, the truco round continues normally

## World Cup Integration

- Real match results stored in `fixture_results` (Supabase)
- Win = 2 base stars for winning country's cards
- Draw = 1 star each
- Penalties: `finished_penalties_A` or `finished_penalties_B` → winner gets 2 stars
- Stars accumulate across the tournament and buff all cards from that country

## Hook Architecture

```
useTrucoGame (facade)
├── useTrucoCore (orchestrator)
│   ├── useTrucoState (50+ state variables)
│   ├── useTrucoTurn (whose turn calculation)
│   ├── useTrucoLogic (round management, scoring)
│   ├── useTrucoHandlers (playCard, handleCall, handleResponse)
│   └── useTrucoEffects (side effects, round transitions)
├── useTrucoCPU (AI decision-making)
└── useMatchmaking (multiplayer sync)
    ├── useMatchmakingBroadcast
    ├── useMatchmakingHandlers
    ├── useMatchmakingNetwork
    └── useMatchmakingEffects
```
