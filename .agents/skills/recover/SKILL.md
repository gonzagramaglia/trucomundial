# /recover

Emergency recovery when something breaks after a failed fix attempt.

## When to use

- A fix was attempted but made things worse
- The build is broken and the error is unclear
- Tests started failing after an unrelated change

## Steps

1. Run `git diff --stat` to see what changed
2. Run `npx tsc --noEmit --skipLibCheck` to identify type errors
3. Run `npm run test` to see which tests fail
4. If the issue is in the last commit, consider `git stash` or reverting specific files
5. Identify the root cause — don't keep patching symptoms
6. If the same approach failed twice, try a fundamentally different solution
7. Document what went wrong and why the new approach is better

## Rules

- Never force-push or rewrite shared history
- Prefer reverting individual files over `git reset --hard`
- Always verify the fix compiles and tests pass before committing
