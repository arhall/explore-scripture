# Usability remediation plan

Status: ready for implementation

Audit date: 2026-10-10

Scope: genealogies, map, categories, books and their chapter/commentary readers,
Links, display preferences, bookmarks, and recent items.

## Evidence and scope

The live deployment was inspected with `playwright-cli` at desktop and 390 px
mobile widths. Interactions were checked on `/genealogies/`, `/map/`,
`/categories/`, `/categories/law-torah/`, `/books/genesis/`, `/books/jude/`, and
`/links/`. Genesis and Jude sample the shared book template; implementation must
verify that the resulting behavior works across all generated routes. Findings
below distinguish observed defects from enhancements. No source files were
changed during the audit.

## Phase 1 — Book navigation and page identity

1. Replace or responsively transform the chapter-summary table in
   `src/_includes/layouts/book.njk` and `src/styles.css`. At 390 px, the 600 px
   table places **Read Chapter** beyond the visible edge. Keep the chapter
   number, summary, and both reading actions visible without horizontal
   scrolling. Preserve a usable table at wider widths if appropriate.
2. Set a unique document title and description for every generated book and
   category page. Use the book/category name plus site name; verify titles in
   the browser and search metadata. Review `src/books.njk`,
   `src/categories-dynamic.njk`, and `src/_includes/layouts/base.njk`.
3. Make recent-item titles and subtitles use page data or the page heading. The
   current generic title makes book and category entries appear as **Home**.
   Keep the correct URL and avoid duplicate or overwritten entries when a
   page-specific recent item and the base layout both add one.
4. Fix count grammar everywhere it appears, including “1 book” and “1 chapter”
   on the homepage and generated pages.
5. Add an obvious chapter jump or search control for long books; keep chapter
   anchors and browser history useful.

**Acceptance:** At 390 px, Genesis 1 and Jude 1 show both reading actions
without sideways scrolling. Long-book chapter navigation is practical. Browser
titles and Quick Access name the actual category or book. Singular counts are
correct.

## Phase 2 — Readers and bookmarks

1. Make chapter and commentary overlays accessible dialogs in
   `src/assets/chapter-reader.js` and `src/assets/commentary-reader.js`:
   accessible name, `aria-modal`, initial focus, focus containment, Escape
   close, background interaction prevention, and focus return to the initiating
   control. Verify keyboard behavior after changing chapter, translation, or
   source.
2. Clarify where the reading content comes from. The chapter reader currently
   embeds the entire Bible Gateway site, including its navigation and unrelated
   controls. Provide a focused in-app text presentation only for translations
   the project may lawfully display; otherwise clearly label the external
   reading option. Do not silently copy or rehost third-party text.
3. Make commentary source changes predictable. Identify whether a source is
   rendered in the app or loaded from an external site, show useful loading and
   failure states, and provide an explicit external link for each source. Check
   that theme, text size, and high contrast remain usable where the app controls
   the content.
4. Fix the book bookmark button in `src/_includes/layouts/book.njk` and the
   shared updater in `src/_includes/layouts/base.njk`. Its saved state must
   update immediately in icon, visible wording, title, and `aria-pressed`; it
   must match Quick Access and persist after reload.
5. Add shareable book/chapter URLs that reopen the selected chapter and, when
   applicable, commentary source without losing the underlying page context.
6. Add bookmark export/import with validation and duplicate handling so
   local-only bookmarks can move between browsers. Keep the existing local
   workflow simple.

**Acceptance:** Both overlays work by keyboard and screen reader. A failed
external embed has a clear recovery path. Bookmark controls and Quick Access
always agree. Copied chapter links restore the intended view; exported bookmarks
import without duplicates.

## Phase 3 — Map and genealogies

1. Rework map stop markup in `src/assets/js/map/index.js` and `src/map.njk`. The
   current `listbox` contains stop buttons that contain Read, Focus, and
   Bookmark buttons. Use a semantic list of cards with independent controls, or
   implement the full listbox pattern without nested interactive elements.
2. Label map **Read** actions with their destination. The observed action opens
   Bible Gateway in a new tab; use wording such as **Read on Bible Gateway**, or
   connect it to the site's reader if the passage can be presented there.
3. Make the selected map stop visually and programmatically clear. Add a compact
   stop picker/filter for the 15-stop journey and verify map, list, URL,
   playback, and bookmark state stay synchronized. Preserve keyboard access to
   layers and search.
4. Add standard Left/Right arrow navigation and focus management to the tabs in
   `src/genealogies.njk`.
5. Improve person search with a match count, navigation among duplicate-name
   results, and a clear selected-person announcement. Preserve the working David
   search and detail behavior.
6. Give the large poster view an overview or landmark shortcuts for major
   lineages, especially on mobile. Expand the two-link Study Articles view into
   guided entry points related to the available tree views.

**Acceptance:** Every map stop action and genealogy tab can be reached and
operated by keyboard without ambiguous nested controls. Search results and
selected map/person states are clear. Mobile users can reach a named lineage
without manually scanning the full poster.

## Phase 4 — Preferences, categories, and Links

1. Add `aria-expanded` and control relationships to the text-size and Quick
   Access toggles; add `aria-pressed` or equivalent selected-state semantics to
   high contrast and theme options. Verify controls announce the current state
   after reload. Review `src/_includes/layouts/base.njk` and
   `src/assets/theme-manager.js`.
2. Test combinations of theme, high contrast, large/custom text,
   dyslexia-friendly font, and line spacing on every audited page and in
   app-controlled readers. Fix clipping, overlap, and insufficient contrast
   found in those combinations.
3. On `/categories/`, show book counts and clearer Old/New Testament grouping.
   On individual category pages, link key themes and figures to useful existing
   content where a matching destination exists; avoid dead-end labels.
4. On `/links/`, add lightweight search or filters, resource-type labels, and
   concise source-perspective descriptions. Make external destinations clear
   before navigation and review the listed URLs for validity.

**Acceptance:** Settings persist and are communicated to assistive technology.
Primary actions remain visible at 390 px with extra-large text and high
contrast. Categories and Links help readers locate a specific book or resource.

## Phase 5 — Verification and release readiness

1. Verify the shared templates against all 66 generated book routes and all
   category routes. Interactively sample at least a long book, a short book, and
   a one-chapter book, including chapter and commentary behavior.
2. Exercise every genealogy tab, representative person searches, all map
   journeys, playback, layers, place search, bookmarks, recent items, Links, and
   display preferences at mobile and desktop widths.
3. Check keyboard-only operation, focus order, accessible names/states, overlay
   behavior, and external-link announcements. Use automated accessibility checks
   as a supplement to manual interaction.
4. Run relevant repository tests, lint, and build checks after each
   implementation change. Follow `AGENTS.md` supply-chain gates: run
   `npm audit`, any existing static security checks or security suites, and
   `git diff --check`; record exact commands and any unavailable or
   network-blocked result as unverified. For dependency changes, use npm with
   `package-lock.json` and run the installed supply-chain-risk-auditor collector
   outside the repository.
5. Preserve unrelated working-tree changes. At audit time, `AGENTS.md` and
   `package.json` were modified and `renovate.json` was untracked; recheck
   status before editing because this may change.

**Acceptance:** The audited flows pass at mobile and desktop sizes, no critical
keyboard or labeling defects remain, and the validation results and remaining
limitations are documented in the implementation summary.

## Implementation notes

- Complete and verify each phase before proceeding; keep changes reviewable, but
  carry the full plan through to completion.
- Prefer the project's vanilla JS, Nunjucks, CSS custom properties, and existing
  data model.
- Do not add third-party Scripture or commentary content to the repository
  without confirming usage rights.
- If a proposed enhancement lacks underlying data, build the smallest accurate
  version supported by existing content and record the remaining data need.
