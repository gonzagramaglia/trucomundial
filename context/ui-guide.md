# UI Guide

Design tokens, patterns, and rules for all UI work in Truco Mundial.

## Design Language

**Urban Freestyle** — Bold, high-contrast, football-stadium energy. Inspired by the 2026 World Cup album aesthetic with a digital scoreboard feel.

## Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--color-bg` | `#0a0a0c` | Page background (near-black) |
| `--color-surface` | `#1a1a1f` | Cards, panels, modals |
| `--color-primary` | `#00f2ff` | Cyan accent (buttons, links, highlights) |
| `--color-secondary` | `#ff0055` | Red accent (alerts, danger) |
| `--color-accent` | `#ffdf00` | Gold (champion, rewards, premium) |
| `--color-text` | `#ffffff` | Primary text |
| `--color-text-muted` | `#a0a0ab` | Secondary/dimmed text |

### Commonly used inline colors

- `#fbbf24` — Gold (finals, trophies, winner highlights)
- `rgba(0, 242, 255, 0.15)` — Cyan glow borders
- `rgba(255, 255, 255, 0.05–0.1)` — Subtle surface dividers
- `rgba(14, 10, 24, 0.4)` — Dark translucent panels

## Typography

| Token | Value | Usage |
|-------|-------|-------|
| `--font-main` | Poppins | Body text, UI elements |
| `--font-display` | Oswald | Titles, headers (`.text-display`) |
| `--font-digital` | Rubik Mono One | Scoreboard, countdown numbers |

### Font sizes

- `--fs-title`: 7.5rem desktop → 4.5rem mobile
- `--fs-subtitle`: 1.8rem desktop → 1.1rem mobile
- Inline: `0.75rem`–`1.6rem` for component text

## Spacing & Borders

| Token | Value |
|-------|-------|
| `--border-radius-sm` | 4px |
| `--border-radius-md` | 8px |
| `--border-radius-lg` | 16px |
| `--shadow-urban` | 4px 4px 0px #000 |

Most components use `borderRadius: "1rem"` to `"1.5rem"` inline.

## Responsive Breakpoints

| Breakpoint | Target |
|------------|--------|
| `< 768px` | Mobile |
| `< 1024px` | Tablet |
| `≥ 1024px` | Desktop |

Detection: `window.innerWidth < 768` (inline checks in components).

## Styling Approach

- **Inline styles** are the established pattern — don't introduce CSS modules
- Use `style={{}}` objects with conditional responsive values
- Framer Motion for animations (`motion.div`, `AnimatePresence`, `initial/animate/exit`)
- CSS files in `src/styles/` for base resets, global utilities, and game-specific styles

## Component Patterns

### Panels / Cards
```typescript
style={{
  background: "rgba(14, 10, 24, 0.4)",
  border: "1px solid rgba(0, 242, 255, 0.15)",
  borderRadius: "1.5rem",
  padding: "2rem",
  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)"
}}
```

### Buttons (primary)
```typescript
style={{
  background: "#00f2ff",
  color: "#000",
  fontWeight: 800,
  padding: "0.75rem 1.5rem",
  borderRadius: "2rem",
  border: "none",
  cursor: "pointer"
}}
```

### Tabs (active/inactive)
```typescript
style={{
  background: isActive ? 'rgba(0, 242, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)',
  border: isActive ? '1px solid #00f2ff' : '1px solid rgba(255, 255, 255, 0.1)',
  color: isActive ? '#00f2ff' : '#fff',
  borderRadius: '2rem',
  fontWeight: 800
}}
```

### Glow effects
```typescript
textShadow: "0 0 10px rgba(0, 242, 255, 0.3)"
boxShadow: "0 0 20px rgba(251, 191, 36, 0.2)"  // gold glow
```

## Icons

Use `lucide-react` exclusively. Import individual icons:
```typescript
import { Trophy, Search, Calendar, ExternalLink } from 'lucide-react';
```
Standard sizes: `14`–`20` for inline, `28`–`48` for decorative.

## Animations

- Page transitions: `AnimatePresence mode="wait"` with fade + slide
- Element entry: `initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}`
- Staggered lists: `transition={{ delay: index * 0.05 }}`
- Hover: CSS `transition: "all 0.2s ease"` + opacity/scale changes

## Mobile Rules

- Touch targets minimum 44px
- Reduce padding from `2rem` to `1rem`
- Stack horizontal layouts vertically
- Hide non-essential decorative elements
- Scrollbars: `scrollbarWidth: "thin"` on mobile, hidden on desktop unless needed
