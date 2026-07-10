# AGENTS.md

## Read Before Anything Else

Read in this exact order before any implementation:

1. context/architecture.md
2. context/code-standards.md
3. context/game-logic.md
4. context/ui-guide.md

## Rules That Never Change

- Always use `yarn` as the package manager.
- Never push directly to `main` — always work on a feature branch.
- Run `yarn test` before committing. All tests must pass.
- Follow Conventional Commits (enforced by Husky + Commitlint).
- If the same problem persists after two attempts, stop and try a different approach.

## Available Skills

- `/review` — before opening a PR. Check for regressions and code quality.
- `/recover` — when something breaks after a failed fix attempt.
- `/remember save` — when a feature spans multiple sessions.
- `/remember restore` — when returning after a multi-session feature.
