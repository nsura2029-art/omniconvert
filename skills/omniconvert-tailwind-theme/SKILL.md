---
name: omniconvert-tailwind-theme
description: Use when changing OmniConvert colors, light/dark mode, Tailwind v4 theme behavior, glass utilities, global CSS tokens, or visual system consistency.
---

# OmniConvert Tailwind Theme

## Core workflow

1. Read `AGENTS.md`, `src/AGENTS.md`, and `src/index.css` before theme edits.
2. Keep Tailwind v4 class-driven dark mode intact: `@custom-variant dark (&:where(.dark, .dark *));`.
3. Make palette changes through tokens and shared utilities before touching component JSX.
4. Preserve layout and functionality when the request is color-only.

## Current visual system

- Primary direction: Format OS light palette.
- Light background: warm white `#fbfaf7`.
- Primary accent: blue `#2563eb`.
- Secondary accent: mint `#14b8a6`.
- Warning accent: amber `#f59e0b`.
- Main UI utilities: `glass`, `glass-nav`, `glass-card`, `glass-input`, `btn-primary`, `progress-bar`, `progress-fill`.

## Implementation rules

- Avoid returning to a purple-heavy dominant palette.
- Keep cards and panels readable in both light and dark mode.
- Update palette bridge selectors when generated Tailwind classes need to map into the design system.
- Do not introduce decorative orbs or one-note color systems.

## Verification

- Run `npm run build` after CSS changes.
- In browser, check at least the tools page, conversion panel, navbar, and one modal/dropdown.
- Toggle light/dark mode when dark-mode-related classes or tokens change.
