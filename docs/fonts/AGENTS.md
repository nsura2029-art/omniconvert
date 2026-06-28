# Fonts Docs DOX

## Purpose
- Owns planning notes, source prompts, research, and implementation checklists for the future OmniConvert Fonts converter category.

## Ownership
- `widgetly_font_converter_master_prompt.md` is the imported source brief for the Fonts category MVP and should be treated as reference material, not as implemented behavior.

## Local Contracts
- Keep font-category docs clear about what is planned versus what exists in the current OmniConvert prototype.
- Translate Widgetly/Next.js-specific instructions into OmniConvert's Vite + React + Cloudflare Workers context before implementation.
- Do not add real API keys, private catalog dumps, or proprietary conversion matrices to this folder.

## Work Guidance
- Font converter work should start with format data, valid target mapping, browser-vs-server conversion decisions, and programmable SEO route planning.
- Same-category font conversions such as TTF, OTF, WOFF, WOFF2, and EOT should be evaluated for browser-side implementation before adding server APIs.
- Legacy bitmap/PostScript formats and cross-category exports should be documented as likely server-side work until proven otherwise.

## Verification
- Docs-only changes should be checked for clear filenames, current project naming, and no accidental claims that planned font conversion is already implemented.

## Child DOX Index
- No child DOX files yet.
