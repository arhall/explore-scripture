# CODEX.md

Guidance for GPT-based coding agents working inside the Explore Scripture repository. Focus on keeping the working set compact while still understanding the system well enough to ship confident changes quickly.

## Quick Context Snapshot

- Static Eleventy (11ty) site deployed to Cloudflare Pages; data-heavy Bible study experience with 5,500+ entities, chapter summaries, and interactive tooling.
- Source lives under `src/` (templates, data, assets). Build emits to `_site/`. Scripts + utilities in `scripts/`. Automated tests live in `tests/`.
- Large generated data under `src/assets/data/` and `data/source-datasets/`; avoid dumping these into the context window.
- Package scripts orchestrate builds, data processing, testing, and workers integration (see `package.json`).

## Essential Commands

- `npm run dev` – Safe default for local iteration (runs Eleventy through build safeguards).
- `npm run build` – Full static build (runs entity processing + search generation first).
- `npm run build:production` – Production-grade build with optimizations; slower.
- `npm run entities:process` / `npm run search:generate` – Rebuild data artifacts without a full site build.
- `npm run test` – Wraps repository smoke checks; prefer for broad validation.
- `npm run lint`, `npm run lint:fix`, `npm run format` – JS/CSS linting and formatting helpers.
- `npm run optimize` – Post-build CSS + HTML minification when matching production behavior is required.

## Key Directories & Files

- `src/_data/` – Core JSON/JS data feeds (`books.json`, `categories.js`, `bibleProjectVideos.json`, cross references, gospel threads).
- `src/_includes/layouts/` – Main Nunjucks layouts (`base.njk`, `book.njk`, `category.njk`).
- `src/assets/` – Front-end behavior (chapter reader, commentary system, search, theme manager, genealogy explorer, etc.).
- `scripts/` – Node utilities for entity processing, search generation, workers prep, build safeguards.
- `tests/` – Selenium + pytest suites; requires `test-env` virtualenv (see `npm run test:setup`).
- `docs/` – Deep dives on subsystems (chapter reader, entities, performance, test suite, docker, etc.).
- `CLAUDE.md` – Expanded architecture brief; reference when you need deeper subsystem detail.

## Current Focus Areas (from TODO.md)

- Genealogy tree visualization **(recently completed)**:
  - Multi-line tooltips with Scripture references from `tooltipRaw` field
  - Messianic line highlighting (red circles and links for 134 individuals across Matthew and Luke genealogies)
  - Circle fill behavior: filled when node has unexpanded children, hollow when fully expanded or leaf nodes
  - Judges cluster populated with 17 judges from Book of Judges and 1 Samuel
- Content expansion: finish chapter summaries, enrich character profiles, extend theological themes, validate cross references, add study questions.
- Advanced UX features queued: bookmarking, print optimisation, sharing, offline reading. Prioritize content work unless instructed otherwise.
- SEO/performance improvements outstanding (structured data, meta tags, CWV tuning, image optimisation).
- UX enhancements (reading plans, full-text search improvements, user preferences, accessibility audit, performance monitoring) remain future-facing.

### Live Issue Snapshot (Mar 2025)

- **Genealogy minimap** – The main tree now pushes node/link sets into shared state to keep the minimap in sync, but QA is pending. Reproduce by opening `/genealogies/`, selecting “Whole Bible Genealogy”, and triggering “Fit tree”. Inspect debug logs under `debug-files/` for `[Genealogy][Minimap]` scale output; expected scale should stay >0.4 with offsets centred.
- **Work in progress docs** – See `docs/genealogies-research/README.md` for current reproduction notes and owners.

## Workflow Playbook for Codex

1. **Clarify scope** – Restate the request, list suspected touch points, and note any architectural constraints. Capture unknowns as questions.
2. **Targeted discovery** – Use `rg`/`rg --files` and doc references to build a mental model. Avoid opening more than 1–2 large files at once.
3. **Plan tiny** – Outline 2–4 concrete steps before editing; update the plan every time you finish a task.
4. **Design the solution** – Call out data flow changes, edge cases, and failure behaviour before you touch code.
5. **Edit surgically** – Modify only the minimal set of files; prefer focused diffs to stay within the context window.
6. **Validate thoroughly** – Run the narrowest meaningful command (lint, unit, integration, targeted build). Record exact commands and outcomes.
7. **Document in PR voice** – Summarize changes, reference touched files with line numbers, and note follow-up steps or testing instructions.

## Enterprise Quality Loop

- **Pre-change checklist**: confirm tests to run, confirm data implications, identify rollback strategy if change fails.
- **While coding**: keep diffs reviewable (<200 LOC when possible), add terse intent comments only where behaviour is non-obvious, and maintain existing patterns.
- **Testing cadence**: run linting before every commit-level change; add or update automated tests when behaviour shifts; for UI/data changes, run targeted Eleventy build and spot-check rendered output.
- **Result reporting**: every response should include commands executed, their status, and any skipped checks with justification. Treat each answer like a mini change request review.
- **Post-change audit**: scan `git status`/`git diff` to confirm only intentional files changed; ensure no large generated assets are staged unintentionally.
- **Escalation protocol**: flag blocking issues, missing tests, or ambiguous requirements immediately instead of guessing.

## Context Window Tips

- Avoid pasting large JSON datasets or generated files; describe structure instead and sample only what you need.
- When inspecting big templates/scripts, capture relevant excerpts (≤80 lines). Mention file anchors (line numbers, major functions) to help future lookups.
- Prefer diff-based inspection (`git diff --stat`, `git diff <file>`) to review changes without flooding tokens.
- If you must reference build logs or test output, summarize key failures/successes rather than dumping entire logs.

## Testing & Validation Guidance

- JS/CSS changes: `npm run lint` (or `npm run lint:fix`) plus `npm run test` if behavior might regress UI logic.
- Critical JS modules (`src/assets/*.js`): add or update Jest coverage where practical before running the suite.
- Data/schema updates: `npm run entities:validate`, `npm run entities:test`, and rerun `npm run entities:process`/`npm run search:generate` when relevant.
- Template/layout changes: `npm run build` or `npm run dev` to ensure Eleventy renders; spot-check generated HTML under `_site/` when feasible.
- Worker/Cloudflare adjustments: `npm run build:workers` then `npm run workers:dev` (requires wrangler tooling; check `DEPLOYMENT.md`).
- Selenium flows: use `npm run test:selenium` when modifying UI flows, modals, or navigation logic; fall back to targeted tests if suite cost is prohibitive and document the deferment.

## High-Risk Areas

- Entity processing scripts touch thousands of records—double-check assumptions before reprocessing to avoid regressions.
- Chapter reader & commentary modules coordinate multiple APIs; changes can break translations or commentary loading silently.
- Security headers and CSP rules in `base.njk`/`nginx.conf` are finely tuned; review carefully before adjusting.
- Watch for large git diffs under `src/assets/data/` and `_site/`; regenerate only when necessary and keep them out of commits unless explicitly required.

## Additional References

- Deep architecture + feature descriptions: `CLAUDE.md`.
- Task backlog and current status: `TODO.md`.
- Full developer onboarding, docker, performance, testing guides: see `docs/` folder.
- API credentials/environment setup: `API_CONFIG.md`, `DEPLOYMENT.md`, `WORKERS-MIGRATION.md` as needed.

Use this file as the lightweight system prompt for Codex sessions—skim it at the start, then dive into deeper docs only when you need more context.
