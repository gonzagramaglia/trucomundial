Files to update:
1. `src/App.tsx`
- Change `r.status === 'finished'` to `r.status?.startsWith('finished')`

2. `src/components/landing/WorldCupBracket.tsx`
- Change `=== 'finished'` to `.startsWith('finished')`
- Modify `getWinner`:
  ```typescript
  if (res && res.status?.startsWith('finished')) {
    if (res.status === 'finished_penalties_A') return { team: teamA, flag: flagA, isPenalties: true };
    if (res.status === 'finished_penalties_B') return { team: teamB, flag: flagB, isPenalties: true };
    if (res.scoreA > res.scoreB) return { team: teamA, flag: flagA };
    if (res.scoreB > res.scoreA) return { team: teamB, flag: flagB };
    return { team: `${teamA}/${teamB}`, flag: "🏁" };
  }
  ```
  And render `(P)` if it was a penalty win if we want, or just the winner.

3. `src/components/landing/ProdeScreen.tsx`
- Change `=== 'finished'` to `.startsWith('finished')`
- Update `!== 'finished'` to `!match.status?.startsWith('finished')`

4. `src/components/admin/UserProdeModal.tsx`
- Change `=== 'finished'` to `.startsWith('finished')`

5. `src/hooks/useBaseStars.ts`
- Change `=== 'finished'` to `.startsWith('finished')`

6. `src/components/admin/tabs/FixtureTab.tsx`
- Add a penalty winner selector if `scoreA === scoreB` and `match.group` doesn't include `Group`.
- If a penalty winner is selected, status is `finished_penalties_A` or `finished_penalties_B`, otherwise `finished`.
