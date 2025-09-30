# Genealogies Research

This folder tracks the long-term effort to expand the genealogy coverage within Explore Scripture beyond the eight lines currently shipped in `src/assets/data/genealogies-complete.json` (Adam→Noah, Cain, Nations Table, Shem→Abraham, Twelve Sons of Israel, Perez→David, Matthew 1, Luke 3).

Goals:

- Catalog every unique biblical genealogy and family register across Old and New Testaments.
- Prioritize additions that unlock new learning value (e.g., tribal movements, priestly lines, royal successions).
- Establish data standards so future trees render cleanly in the genealogy explorer without overwhelming the UI.

Key artefacts in this directory:

- `PLAN.md` – multi-phase research and implementation roadmap.
- `missing-lines-overview.md` – checklist of genealogies not yet modeled, with scripture references and research notes.
- (future) normalized datasets, source summaries, and QA scripts that support new tree ingestion.

Contributors should update these files as research progresses and add new documents as needed (e.g., tribe-specific dossiers, data modeling proposals).

## Short-Term Fix Queue (Spring 2025)

- **Minimap scale verification**: Open `/genealogies/`, switch to “Whole Bible
  Genealogy”, trigger `Fit tree`, and observe the minimap overlay. Expected
  behavior is a scale around `0.45` with the viewport centered on the rendered
  tree. Capture logs from the browser console (look for
  `[Genealogy][Minimap] Viewport updated`) and drop summaries into
  `debug-files/` if discrepancies appear.
- **Automated guardrail**: Evaluate lightweight Jest/D3 snapshot coverage or a
  Playwright smoke test to lock the minimap viewport width/height regression.
- **Documentation updates**: When QA completes, update this section and the
  main `TODO.md` to mark the fix as complete.
