# Bible Tree Scraper Output Guide

This document explains how to reproduce the scraped tree data, interpret each artifact in `out/`, and differentiate between the site’s collapsed (initial) and expanded states.

## Running the Scraper

```bash
pnpm install
pnpm tsx scrape_bibletree_playwright.ts \
  --url https://onemessianicgentile.com/biblefamilytree/default.html \
  --timeout 45000
```

Optional flags:

- `--headful` – open a visible Chromium window for debugging.
- `--no-showall` – skip the site’s “Show All” confirmation (disabled by default; the scraper currently triggers the button automatically and answers **Yes**).
- `--max-nodes <n>` – limit tooltip harvesting to the first `n` circles (the graph itself is still fully scraped).

Outputs land under `out/`:

- `out/raw-latest/` – canonical dataset straight from the latest scrape (`bible_tree_extracted.json`, `nodes.csv`, `edges.csv`, `tree.children.json`).
- `out/clusters-latest/` – derived JSON slices produced by the Python clusterizer for the same scrape.
- `out/archive/<timestamp>/` – timestamped copies of the two most recent prior runs (each folder contains both `raw/` and `clusters/`).

> Tip: Delete the existing `out/` directory before a new run if you want a clean diff.

## What Happens During a Run

1. **Initial Snapshot** – After the page and “Show All” prompt load, we capture the DOM while the tree is still partially collapsed. Nodes visible at this stage are tagged `initiallyVisible: true` later on.
2. **Expansion Sweep** – Playwright repeatedly clicks any circle backed by hidden `_children` or `childrenHidden` arrays. Every node expanded in this phase is tagged `hadCollapsedChildren: true`.
3. **Final Harvest** – A second DOM scan captures the fully expanded structure, edges, and tooltips. Tooltips are parsed into structured fields before writing the outputs.

The console log spells out each phase along with timings, node counts, and summary statistics so you can diff runs or spot regressions quickly.

## File Breakdown

### `out/raw-latest/bible_tree_extracted.json`

Primary payload with two top-level arrays:

- `nodes`: Each object mirrors the scraped SVG circle. Important fields:
  - `id`, `name`, `messiahLine`, `levitical`, `judge` — original attributes or class-derived flags.
  - `x`, `y` — SVG coordinates (if present on the bound data).
  - `tooltipRaw` — verbatim tooltip text when one appeared.
  - `tooltipParsed` — structured result from `tooltip_parser.ts`, including `refs`, `age`, etc.
  - `initiallyVisible` — `true` if the node appeared during the first snapshot (before scripted expansion).
  - `hadCollapsedChildren` — `true` if the node owned hidden descendants when we first saw it, or was expanded during the sweep.
- `edges`: Directed relationships between nodes (`sourceId` → `targetId`). IDs correspond to the node list.

Use this JSON to rebuild both the default and the fully expanded tree in client code: start from nodes with `initiallyVisible` to emulate the first view, then progressively reveal nodes flagged `hadCollapsedChildren` for drilldown experiences.

### `out/raw-latest/nodes.csv`

Tabular equivalent of the node list. Columns (in order):

```
id,name,messiahLine,levitical,judge,initiallyVisible,hadCollapsedChildren,
age,yearsLived,born,died,tribe,spouse,refs,tooltipRaw
```

All values are quoted when they contain commas or newlines, so the CSV loads cleanly in spreadsheets. The visibility flags mirror the JSON booleans.

### `out/raw-latest/edges.csv`

Two-column CSV listing parent → child relationships. No duplicates are emitted; if you need undirected edges, symmetrize them post-processing.

### `out/raw-latest/tree.children.json`

Latest mirrors live in `out/raw-latest/` and `out/clusters-latest/`. These are refreshed every scrape, while the previous two generations are moved under `out/archive/<timestamp>/raw` and `.../clusters`.

### `out/clusters/*.json`

The build now invokes `clusterizer/clusterize.py` automatically after every scrape, emitting themed subsets (primeval, patriarchs, tribe clusters, etc.) into `out/clusters/` (and the mirrored `out/clusters-latest`). Each file contains the pruned tree, a slug, title, list of key roots, and node counts; `index.json` summarizes the catalogue. Re-run `pnpm tsx …` to refresh these whenever the raw dataset changes.

### Archiver Lifecycle

1. New data is written to temporary working directories during the scrape.
2. Once clustering finishes, the previous `*-latest` directories are relocated to `out/archive/<ISO timestamp>/` (keeping only the two most recent archives).
3. The fresh run is copied to `out/raw-latest/` and `out/clusters-latest/`; the temporary working directories are removed.

Hierarchical tree assembled from the nodes and edges. When multiple roots exist, they are wrapped under the synthetic `ROOT` node. This file already reflects the fully expanded structure; use the node metadata to collapse it for an initial-view render if needed.

## Rebuilding Views Programmatically

1. **Initial State**
   - Load `tree.children.json` or reconstruct adjacency from `edges.csv`.
   - Filter nodes where `initiallyVisible` is `true` to determine which branches to render at startup.
   - If a node is missing from that set but is a direct child of an initial node, treat it as collapsed content awaiting user interaction.

2. **Expanded State / Drilldown**
   - When the user expands a node, reveal its descendants whose parent has `hadCollapsedChildren: true`.
   - Because the scraper records every node that held hidden children *and* every node that was expanded, you can reproduce the exact order of expansions Playwright performed or define your own logic.

3. **Diffing Against the Site’s “Show All” Prompt**
   - To simulate the site’s default behavior without the automatic “Show All” confirmation, run the script with `--no-showall` for a control dataset.
   - Compare the resulting `initiallyVisible` counts or `out/` snapshots between the two runs to see how much the prompt expands for you versus what the scripted sweep uncovers.

## Troubleshooting

- **Missing Tooltips** – Some circles never show tooltips (or the tooltip container fails to render); those nodes keep `tooltipRaw` empty. Re-run headful to confirm the site behavior.
- **Residual Collapsed Branches** – If console logs report non-zero `expandable` counts but your target UI still hides branches, increase `maxPasses` in `expandAllNodes` or add targeted clicks where necessary.
- **Authentication or Rate Limits** – The upstream site occasionally shakes the layout on load. The scraper already waits between passes, but you can extend the `--timeout` flag if navigation fails.

Feel free to adapt `scanNodes`/`expandAllNodes` for additional metadata (e.g., depth information) if you need more granular control.
