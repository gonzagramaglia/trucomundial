# /remember

Session persistence for multi-session features.

## /remember save

Use at the end of a session when work will continue later.

Save to a scratch note:
- What was accomplished this session
- Current branch and last commit
- What's left to do (next steps)
- Any gotchas or context that would be lost

## /remember restore

Use at the start of a session to pick up where you left off.

1. Read the last saved note
2. Check `git log --oneline -5` for recent history
3. Run `git status` to see current state
4. Run `npm run test` to confirm baseline
5. Resume from the documented next steps
