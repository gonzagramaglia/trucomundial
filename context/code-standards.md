# Code Standards

Rules and conventions for all code in this project. Follow these without exception.

## Engineering Principles

- **Read before writing** — understand the existing pattern before adding code
- **Match the project style** — don't introduce new patterns or libraries without discussion
- **Scope is sacred** — only build what is asked. Don't refactor unrelated code
- **Clean over clever** — readable code a junior can follow beats clever abstractions
- **One thing at a time** — complete a feature fully before moving to the next

## Git Workflow

- Never push directly to `main`
- Create a feature branch: `<type>/<short-kebab-description>`
- Commits follow Conventional Commits (enforced by Husky + Commitlint)
- Body lines must not exceed 100 characters
- Open a PR against `main` — CodeRabbit reviews automatically
- All tests must pass before committing (pre-commit hook runs `tsc -b && vite build`)

## TypeScript

- Avoid `any` — use `unknown` with narrowing, or proper types
- All exports should have JSDoc documentation
- Use `interface` for component props, `type` for everything else
- Async functions must have try/catch — never let promises float

## File Naming

- Components: PascalCase — `WorldCupBracket.tsx`
- Hooks: camelCase with `use` prefix — `useTrucoCore.ts`
- Utilities/lib: camelCase — `votesStore.ts`, `formatters.ts`
- Data files: camelCase — `fixtureMatches.json`
- Tests: mirror source path in `src/tests/` — `src/tests/lib/truco/engine.test.ts`

## Component Patterns

```typescript
// 1. External imports
import React from 'react';
import { useTranslation } from 'react-i18next';

// 2. Internal imports
import { supabase } from '../../lib/supabase';
import type { FixtureMatch } from '../../lib/fixtureData';

// 3. Types (if component-specific)
interface Props {
  matches: FixtureMatch[];
}

// 4. Component
export const ComponentName: React.FC<Props> = ({ matches }) => {
  // state → derived → handlers → return JSX
};
```

## Styling

- Inline styles are the established pattern (not CSS modules)
- Responsive: check `window.innerWidth < 768` for mobile vs desktop
- Color palette: `#00f2ff` (cyan accent), `#fbbf24` (gold), `rgba(255,255,255,0.X)` (text)
- Use Framer Motion for animations (`motion.div`, `AnimatePresence`)

## State Management

- **Zustand** for global stores (votesStore)
- **React state** (useState/useRef) for component and hook state
- Don't create new Zustand stores without good reason — most state is local

## Testing

- Test pure functions in `lib/` — don't test React components directly
- Use Vitest: `describe` blocks, `it()` with plain descriptions
- Mock external dependencies (Supabase, etc.)
- Run with `yarn test` (single run) or `yarn test:watch`

## Audio

- Use the `audioManager` singleton from `lib/audio.ts`
- Never create `new Audio()` directly — always go through AudioManager
- Sound keys are mapped in `soundMap`; use `play(key)` or the typed helpers

## Supabase

- Client initialized in `lib/supabase.ts` — import from there
- Always scope queries to user context (even with RLS as defense-in-depth)
- Realtime channels are managed in matchmaking hooks — don't create ad-hoc channels

## i18n

- Translations live in `src/locales/en.json` and `src/locales/es.json`
- Use `useTranslation()` hook in components: `const { t } = useTranslation()`
- Key naming: snake_case, grouped by feature (e.g. `prode_stage_tbd`)
- Add keys to BOTH locale files when creating new strings
