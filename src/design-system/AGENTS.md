# OmniConvert Design System

A single-source-of-truth design system inspired by **family.co**'s content-first design language: cream backgrounds, generous whitespace, restrained color, subtle elevation, one accent.

## Files

```
src/design-system/
├── tokens.css          # CSS variables — colors, type, spacing, radius, shadow, motion
├── tailwind-theme.css  # @theme block — bridges tokens into Tailwind v4 utilities
├── primitives.tsx      # React primitives — Eyebrow, Pill, Section, Surface, Stack, Button, HeadingDisplay
└── AGENTS.md           # ← you are here
```

## Token layers

Tokens resolve in 3 layers. Reach for the highest layer that fits:

1. **Primitives** — `--d-ink-500`, `--d-blue-600`, … raw values. Never reference in components.
2. **Semantic** — `--color-canvas`, `--color-fg-primary`, `--color-accent`, … what UI consumes.
3. **Component** — kept inline near the component (`--shadow-card-hover` lives in tokens.css because it's used by `.ds-card`).

Light / dark themes are mapped inside `:root` and `.dark`. Light is the format-OS default and what family.co lives in.

## Wiring to Tailwind v4

`tailwind-theme.css` declares an `@theme` block. Each `--color-*`, `--font-*`, `--text-*`, `--radius-*`, `--shadow-*`, `--duration-*`, `--ease-*` in `@theme` becomes a Tailwind utility (e.g. `--color-fg-primary` → `text-fg-primary`, `--color-canvas` → `bg-canvas`). Add new tokens by appending them to both `tokens.css` (semantic value) and `tailwind-theme.css` (`@theme` block).

## React primitives — what to use when

| Want | Use | Avoid |
|------|------|-------|
| Tracked uppercase eyebrow above a heading | `<Eyebrow />` | raw `<span className="text-2xs ...">` |
| Big hero heading with one phrase accented | `<HeadingDisplay accent="...">...</HeadingDisplay>` | raw `<h1 className="text-display">` |
| Inline chip / tag / status badge | `<Pill tone="accent \| success \| ..." />` | ad-hoc `<span>` with hard-coded colors |
| Card / panel surface | `<Surface interactive />` | raw `<div className="rounded-3xl glass border">` |
| Page-level vertical rhythm + mesh | `<Section spacing="page" mesh />` | raw section with arbitrary padding |
| Vertical / horizontal stack with token gaps | `<Stack direction="row \| col" gap={1..12} />` | `flex flex-col gap-3` |
| Button — primary / secondary / ghost | `<Button variant="primary" size="md" />` | raw `<button>` with manual classes |

## What NOT to do

- Don't use `bg-zinc-*`, `text-slate-*`, `border-emerald-*` etc. raw. They've been replaced by `bg-canvas`, `text-fg-primary`, `border-success`, etc. Tailwind still ships them, but the design system never uses them.
- Don't redefine colors. Token first, then utility.
- Don't bypass the primitive for a one-off. If the primitive doesn't fit, extend it (`Pill`'s `tone` map) — don't fork it.

## Adding a new token

1. Add the raw primitive to `:root` in `tokens.css` (under "PRIMITIVES — colors" or a new section).
2. Add the semantic reference under "SEMANTIC — colors" (or whatever layer).
3. Add the dark mapping in `.dark { ... }`.
4. Wire to Tailwind v4 by adding to `tailwind-theme.css` `@theme` block.
5. Use a primitive React class (or extend an existing one) so consumers reach for the new token transparently.

## Verification

```
npm run lint   # tsc --noEmit, must be 0
npm run build  # vite build, must succeed
```

Both guard against type drift in primitives (`forwardRef`, `as` polymorphism) and against Tailwind v4 picking up the new tokens.
