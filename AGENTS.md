# Repository Guidelines

## Project Structure & Module Organization
- `src/`: CSS (`css/`), JavaScript bundles (`js/`, use `.bundle.js` suffix), Handlebars layouts/partials (`layouts/`, `partials/`), helpers (`helpers/`), and images (`img/`).
- `preview-src/`: sample docs used for the local preview; output lands in `public/` with built assets under `public/_/`.
- `build/`: created when bundling and holds `ui-bundle.zip` for Antora playbooks. Keep committed files to source only; build artifacts are disposable.

## Build, Test, and Development Commands
- Install deps: `npm ci` (Node 22 via `mise.toml`; run `mise install` if versions diverge).
- Lint all: `npx gulp lint` (ESLint + Stylelint).
- Format JS: `npx gulp format`.
- Stage assets: `npx gulp build` (writes to `public/_`).
- Publishable bundle: `npx gulp bundle` (clean → lint → build → zip to `build/ui-bundle.zip`; logs `--ui-bundle-url=...`).
- Preview site: `npx gulp preview` (builds preview pages then serves on `0.0.0.0:5252`; set `LIVERELOAD=true` for live reload).

## Coding Style & Naming Conventions
- `.editorconfig`: 2-space indent, LF, UTF-8, trim trailing whitespace, final newline.
- JS: JavaScript Standard Style with project rules (arrow params always wrapped, multiline trailing commas, 120-char lines, avoid `substr`). Use CommonJS requires; keep helpers small and reusable.
- CSS: Stylelint Standard with relaxed comment/descending-specificity checks; favor mobile-first selectors and keep shared variables centralized in `src/css`.
- Templates: prefer layouts/partials over duplicating markup; keep bundle entry files suffixed `.bundle.js`.

## Testing & QA
- No automated tests; baseline checks are `npx gulp lint` plus manual preview.
- For UI changes, run `npx gulp preview` and verify navigation, search box alignment, code blocks, and mobile behavior.

## Commit & Pull Request Guidelines
- Commits are short, present-tense statements (e.g., `fix search box alignment`); reference issues with `#123` when applicable.
- PRs should include a summary, test notes (lint/preview), related issues, and before/after screenshots for visible changes.
- Do not commit `build/ui-bundle.zip`; regenerate locally or in CI instead.

## Bundling & Integration Tips
- After `npx gulp bundle`, point your Antora playbook at the reported bundle path to test end-to-end.
- If you only need refreshed staged assets, prefer `npx gulp build` to avoid unnecessary zips.
