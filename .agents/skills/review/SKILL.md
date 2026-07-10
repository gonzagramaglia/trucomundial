# /review

Pre-PR quality check. Run this before opening a pull request.

## Steps

1. Run `npm run test` — all tests must pass
2. Run `npx tsc --noEmit --skipLibCheck` — no type errors
3. Check for unused imports or variables that would fail the build
4. Verify conventional commit messages in the branch
5. Confirm no `console.log` left in production code (except error handlers)
6. Ensure new exports have JSDoc documentation
7. If UI was changed, verify mobile (< 768px) is not broken

## Output

Report what passed, what failed, and what needs fixing before the PR.
