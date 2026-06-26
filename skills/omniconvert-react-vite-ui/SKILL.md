---
name: omniconvert-react-vite-ui
description: Use when working on OmniConvert React/Vite application code, top-level app state, component composition, Vite config, TypeScript UI behavior, or local browser verification for this project.
---

# OmniConvert React/Vite UI

## Core workflow

1. Read `AGENTS.md`, `src/AGENTS.md`, and the nearest child `AGENTS.md` before editing.
2. Use existing React component boundaries before creating new ones.
3. Preserve app page names and prop contracts unless all call sites are updated.
4. Keep behavior client-safe; do not put real secrets or privileged server calls in React components.

## Project map

- `src/App.tsx`: app state, in-app page routing, localStorage persistence, shell composition.
- `src/main.tsx`: React mount only.
- `src/components/`: UI components and interaction surfaces.
- `src/data/tools.ts`: conversion tool catalog.
- `src/types/index.ts`: shared TypeScript types.
- `vite.config.ts`: Vite plugins, aliases, dev server settings.

## Implementation rules

- Prefer small edits over broad rewrites.
- Keep UI dense, product-like, and consistent with the current Format OS light aesthetic.
- Reuse `lucide-react`, `motion/react`, existing CSS utilities, and existing state conventions.
- Treat auth, billing, database, cloud storage, and conversion backends as simulated unless production wiring is explicitly requested.

## Verification

- Run `npm run build` after UI or config changes.
- Run `npm run lint` after TypeScript type/prop changes.
- Verify interactions in the local browser when changing controls, modals, upload flows, tabs, or navigation.
