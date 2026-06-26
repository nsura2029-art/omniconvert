---
name: omniconvert-conversion-workflow
description: Use when changing OmniConvert upload source selection, drag-and-drop behavior, conversion simulation, file queue, progress states, cloud picker mock data, output downloads, or conversion logs.
---

# OmniConvert Conversion Workflow

## Core workflow

1. Read `AGENTS.md`, `src/AGENTS.md`, and `src/components/AGENTS.md` before editing.
2. Work primarily in `src/components/ConversionPanel.tsx` unless shared types or tool data must change.
3. Preserve existing simulated conversion behavior unless production backend work is explicitly requested.
4. Verify upload interactions in the browser after changes.

## Current behavior

- Drag/drop and file input add files to the queue.
- `Click to upload` opens an inline source dropdown.
- Local computer upload uses the hidden file input.
- URL, Google Drive, Dropbox, and OneDrive route into existing picker/modal subviews.
- Cloud files are mock data arrays in `ConversionPanel.tsx`.
- Conversion progress, worker logs, and output downloads are simulated client-side.

## Implementation rules

- Stop click propagation inside dropdowns/modals so the parent drop zone does not toggle unexpectedly.
- Keep upload source labels clear: `From my computer`, `By URL`, `From Google Drive`, `From Dropbox`, `From OneDrive`.
- Keep target format initialization aligned with `selectedTool.output`.
- If changing file compatibility rules, update `isCompatibleExtension` and test representative tool inputs.

## Verification

- Run `npm run build` after changes.
- Browser-check: click upload, choose at least one cloud source, confirm the picker appears, and confirm no first-click full-screen source menu opens.
