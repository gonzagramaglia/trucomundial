# Pull Request Standards

This document defines the standard PR format for every pull request in the Truco Mundial project.
Follow this template exactly so every PR is consistent, professional, and easy to review.

---

## Title Format

Follows Conventional Commits. Must be under 50 characters to avoid GitHub truncation.

```
<type>(<scope>): <short description>
```

| Type | When to use |
|------|-------------|
| `feat` | New feature or screen |
| `fix` | Bug fix |
| `chore` | Tooling, config, dependencies |
| `refactor` | Code restructure without behaviour change |
| `test` | Adding or updating tests |
| `docs` | Documentation only |
| `ci` | CI/CD pipeline changes |
| `perf` | Performance improvements |

**Examples:**
- `feat(bracket): add World Cup quarterfinals`
- `fix(prode): resolve score alignment in bracket`
- `refactor(data): extract i18n to JSON files`
- `test(engine): add envido calculation tests`
- `chore(deps): update vitest to v4`
- `ci(coverage): enforce 80% unit test threshold`

---

## Description Template

Copy and paste this into the GitHub PR description box every time.

```markdown
## 🚀 What is this PR?

[One paragraph. State what it accomplishes at a high level.]

## 🛠️ Key Changes

- **[Area]:** [What was built or changed and why it matters.]
- **[Area]:** [What was built or changed and why it matters.]
- **[Area]:** [What was built or changed and why it matters.]

## 📸 Screenshot / Output

[Drag and drop a screenshot of the UI here. For non-UI changes (testing, config, backend), paste the terminal output or test results instead.]

## ✅ Checklist

- [ ] Build passes (`yarn build`)
- [ ] Tests pass (`yarn test`)
- [ ] Conventional Commits applied
- [ ] CodeRabbit review addressed (if applicable)
```

---

## Extended Description (Merge Commit)

When GitHub asks for the Extended Description during the merge, use this bullet format:

```text
- [Area]: [What was done — one line.]
- [Area]: [What was done — one line.]
- [Area]: [What was done — one line.]
```

**Example:**
```text
- Data: Extracted i18n translations and fixture data to JSON files.
- State: Migrated votesStore from manual pub/sub to Zustand.
- Docs: Added JSDoc to all lib/ and hooks/ exports (80%+ coverage).
```

---

## Screenshot / Output Guidelines

- For **UI changes** (components, pages, layouts): screenshot of the actual screen running in the browser.
- For **game logic changes**: relevant test output showing the logic works.
- For **non-UI changes** (testing, config, refactor): paste the terminal output (e.g. test results, coverage report).
- Always drag the image directly into the GitHub description box — no external hosting needed.
- Delete the placeholder text `[Drag and drop...]` before submitting.

---

## Branch Naming

Branches follow the pattern:

```
<type>/<short-kebab-description>
```

**Examples:**
- `feat/quarterfinals`
- `fix/bracket-score-alignment`
- `refactor/cleanup`
- `test/unit-tests`
- `chore/update-dependencies`

---

## PR Draft Generation

Whenever a PR is prepared, the AI assistant must generate a local markdown file containing both the **Description Template** and the **Extended Description** for the user to review or copy.
- **Path:** `docs/prs/pr-[number]-[slug].md`
- **Note:** The `docs/prs/` directory is git-ignored, so these drafts won't be pushed.

---

## PR History Reference

| PR | Branch | Description | Status |
|----|--------|-------------|--------|
| #1 | `refactor/cleanup` | Extract data to JSON, Zustand migration, docstrings | ✅ Merged |
| #3 | `feat/unit-tests` | Vitest setup & 56 unit tests for core logic | ✅ Merged |
| #4 | `fix/prode-semifinals` | Update initial tab and semifinal dates in ProdeScreen | ✅ Merged |
| #6 | `refactor/ranking-screen` | Extract RankingScreen logic into components and hook | ✅ Merged |
| #7 | `refactor/decompose-landing-page` | Extract LandingPage logic into components and hooks | ✅ Merged |
| #8 | `refactor/decompose-deck-screen` | Extract DeckScreen logic into components and hooks | ✅ Merged |
| #9 | `feat/prode-finals` | Update Prode with finals bracket/scores, limit votes to 3 | ✅ Merged |
| #10 | `fix/landing-page-modal` | Restore modal overlay for point selection and deck composition | ✅ Merged |
| #11 | `refactor/decompose-admin-screen` | Extract AdminScreen logic into smaller hooks | ✅ Merged |

*(Update this table every time a PR is opened or merged.)*