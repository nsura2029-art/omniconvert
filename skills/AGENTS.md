# Skills DOX

## Purpose
- Owns project-local Codex skill folders for recurring OmniConvert workflows.

## Ownership
- Each child folder contains one `SKILL.md` tailored to a specific OmniConvert stack area.
- These skills are source documentation for agents; they are not npm packages or app runtime code.

## Local Contracts
- Keep every skill concise, operational, and current with actual project behavior.
- Do not include real secrets, credentials, or private deployment values.
- If a project contract changes, update the relevant skill and parent DOX docs in the same change.

## Work Guidance
- Create a new skill only when a recurring workflow has distinct rules that are useful beyond normal AGENTS.md guidance.
- Prefer one `SKILL.md` per skill folder unless a future skill needs scripts, references, or assets.
- Validate skills with the skill-creator validator after edits.

## Verification
- Run `python C:\Users\nages\.codex\skills\.system\skill-creator\scripts\quick_validate.py <skill-folder>` for each changed skill.

## Child DOX Index
- `omniconvert-auth-data/` - sandbox auth, localStorage data, and future production auth/database migration guidance.
- `omniconvert-cloudflare-deploy/` - Cloudflare Workers Static Assets and Wrangler deployment guidance.
- `omniconvert-conversion-workflow/` - upload sources, queue, conversion simulation, and picker behavior.
- `omniconvert-github-actions/` - GitHub Actions CI/CD and Wrangler action guidance.
- `omniconvert-react-vite-ui/` - React/Vite app structure and UI implementation guidance.
- `omniconvert-tailwind-theme/` - Tailwind v4, light/dark mode, and design-system palette guidance.
