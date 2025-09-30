# Genealogy Expansion Plan

A staged roadmap for broadening the genealogy explorer to cover all scriptural family lines in a maintainable, research-backed way.

## Phase 0 – Baseline & Scope Confirmation
- Verify the eight genealogies currently implemented and document their data assumptions (linear vs. branching, metadata fields, rendering quirks).
- Define inclusion criteria (e.g., minimum number of named generations, canonical vs. apocryphal sources, treatment of duplicate/partial lists).
- Align with product goals: decide whether the explorer should surface every variant or only canonical through-lines that support the “scarlet thread” narrative.

## Phase 1 – Source Inventory & Gap Analysis
- Systematically read through Genesis, Exodus, Numbers, Ruth, 1–2 Samuel, Kings, Chronicles, Ezra, Nehemiah, Matthew, Luke, and supporting passages to extract every genealogy or family register.
- Track each line in `missing-lines-overview.md`, noting primary references, scope (tribe, clan, royal, priestly, post-exilic registry), and dependencies (e.g., overlaps with Chronicles).
- Flag ambiguous or conflicting records (e.g., Matthew vs. Luke divergence, Chronicles reconstructions) for theological/historical review.

## Phase 2 – Data Modeling & UX Design
- Extend the genealogy JSON schema to support branching trees, spouse/marriage modeling, legal/adoptive parents, and tribal groupings without degenerating into clutter.
- Prototype grouping/filters (e.g., tribe toggles, priestly vs. royal lenses) to keep the explorer usable once dozens of lines are loaded.
- Define naming conventions, unique IDs, and metadata (periods, covenants, roles) for new persons to avoid collisions with the existing entity system.

## Phase 3 – Data Acquisition & Validation
- Capture each genealogy into structured JSON, cross-checking names, spellings, and verse references against reliable translations (ESV, NIV) and secondary scholarship.
- Use diffable scripts to reconcile duplicates (e.g., Chronicles reiterations of Genesis tables) and resolve alternate spellings (Azariah vs. Uzziah).
- Build automated validators that ensure every person referenced exists in the entity system or create stubs queued for enrichment.

## Phase 4 – Integration & UI Enhancements
- Incrementally load new trees into the explorer, starting with high-impact lines (Ishmael, Esau/Edom, Levitical priests, royal house of Judah, post-exilic returns).
- Update the UI to handle large datasets (progressive loading, context filters, search within the tree, printable exports by tribe).
- Expand modal content to include tribe-specific insights, cross-links to entity pages, and scripture excerpts for quick verification.

## Phase 5 – QA, Documentation & Release
- Add Jest/D3 snapshot tests covering new tree layouts and selection panel behavior.
- Run Selenium smoke tests on desktop/mobile breakpoints to ensure the explorer remains responsive.
- Document the expanded dataset, research sources, and known limitations in `docs/genealogies-research` and the main project README.
- Prepare release notes and internal walkthroughs before exposing the feature publicly.

## Ongoing Tasks & Open Questions
- **Historical harmonization:** determine how to represent conflicting chronologies (e.g., Jeconiah curse vs. Luke’s lineage).
- **Source hierarchy:** establish whether Chronicles or Genesis is the canonical record when discrepancies arise.
- **Performance:** monitor bundle size and render time as additional genealogies increase SVG complexity.
- **Contributions:** create guidelines for theologians or subject-matter experts to submit vetted genealogical data.
