#!/usr/bin/env python3
"""Generate hierarchical Bible family tree data from raw scraped CSVs.

Reads node and edge CSV exports in ``data/bible-tree-data/raw-latest`` and
produces a cleaned JSON dataset at ``src/assets/data/bible-tree.json`` with:

* a master "sky view" tree rooted at Adam (id 420)
* individual cluster trees defined in ``clusters-latest/index.json``
  enriched with descriptive blurbs/tooltips.

Only numeric node IDs are treated as genealogy entities; legend items that the
original site includes in the CSV export are ignored.
"""

from __future__ import annotations

import csv
import json
from pathlib import Path
from typing import Dict, Iterable, List, Optional

DATA_DIR = Path("data/bible-tree-data")
RAW_DIR = DATA_DIR / "raw-latest"
CLUSTER_DIR = DATA_DIR / "clusters-latest"
OUTPUT_PATH = Path("src/assets/data/bible-tree.json")


def parse_nodes() -> Dict[str, Dict[str, str]]:
    nodes_path = RAW_DIR / "nodes.csv"
    with nodes_path.open(newline="", encoding="utf-8") as fh:
        reader = csv.DictReader(fh)
        return {row["id"]: row for row in reader}


def parse_edges(valid_ids: Iterable[str]) -> Dict[str, List[str]]:
    valid = set(valid_ids)
    edges_path = RAW_DIR / "edges.csv"
    children: Dict[str, List[str]] = {node_id: [] for node_id in valid}

    with edges_path.open(newline="", encoding="utf-8") as fh:
        reader = csv.DictReader(fh)
        for row in reader:
            source = row["sourceId"]
            target = row["targetId"]
            if source in valid and target in valid:
                children[source].append(target)

    return children


def parse_bool(value: Optional[str]) -> Optional[bool]:
    if value is None:
        return None
    normalized = value.strip().lower()
    if normalized in ("true", "1", "yes"):
        return True
    if normalized in ("false", "0", "no"):
        return False
    return None


def build_tree(
    node_id: str,
    nodes: Dict[str, Dict[str, str]],
    children_map: Dict[str, List[str]],
) -> Dict:
    row = nodes[node_id]

    node: Dict[str, object] = {"id": node_id, "name": row.get("name") or node_id}

    for key in ("messiahLine", "levitical", "judge"):
        bool_value = parse_bool(row.get(key))
        if bool_value:
            node[key] = True

    for key in ("initiallyVisible", "hadCollapsedChildren"):
        bool_value = parse_bool(row.get(key))
        if bool_value is not None:
            node[key] = bool_value

    tooltip_raw = (row.get("tooltipRaw") or "").strip()
    if tooltip_raw:
        # Preserve the raw tooltip with newlines for proper formatting
        node["tooltipRaw"] = tooltip_raw
        # Also create a cleaned single-line version for backwards compatibility
        cleaned = " ".join(tooltip_raw.split())
        node["tooltip"] = cleaned

    spouse = (row.get("spouse") or "").strip()
    if spouse:
        node["spouse"] = spouse

    refs = (row.get("refs") or "").strip()
    if refs:
        node["refs"] = [ref.strip() for ref in refs.split(";") if ref.strip()]

    child_ids = children_map.get(node_id, [])
    if child_ids:
        node["children"] = [build_tree(child_id, nodes, children_map) for child_id in child_ids]

    return node


def build_master_tree(nodes: Dict[str, Dict[str, str]], children_map: Dict[str, List[str]]) -> Dict:
    master_root = "420"  # Adam
    if master_root not in nodes:
        raise RuntimeError("Expected node id 420 (Adam) to exist in nodes.csv")
    return build_tree(master_root, nodes, children_map)


def build_cluster_tree(
    cluster_entry: Dict,
    nodes: Dict[str, Dict[str, str]],
    children_map: Dict[str, List[str]],
) -> Dict:
    root_children = []
    for root_id in cluster_entry.get("roots", []):
        if root_id in nodes:
            root_children.append(build_tree(root_id, nodes, children_map))

    title = cluster_entry.get("title") or cluster_entry.get("slug") or "Cluster"
    cluster_root = {
        "id": f"cluster:{cluster_entry.get('slug', 'cluster')}",
        "name": title,
        "children": root_children,
    }
    return cluster_root


def load_cluster_metadata() -> Dict[str, Dict[str, object]]:
    blurbs_path = DATA_DIR / "genealogy_cluster_blurbs.json"
    if blurbs_path.exists():
        return json.loads(blurbs_path.read_text(encoding="utf-8"))
    return {}


def main() -> None:
    nodes_raw = parse_nodes()
    numeric_ids = [node_id for node_id in nodes_raw if node_id.isdigit()]
    children_map = parse_edges(numeric_ids)

    # Filter nodes to numeric IDs only
    nodes = {node_id: nodes_raw[node_id] for node_id in numeric_ids}

    master_tree = build_master_tree(nodes, children_map)

    cluster_index_path = CLUSTER_DIR / "index.json"
    cluster_index = json.loads(cluster_index_path.read_text(encoding="utf-8"))
    blurbs = load_cluster_metadata()

    clusters_output = []
    for entry in cluster_index:
        slug = entry.get("slug")
        tree = build_cluster_tree(entry, nodes, children_map)
        meta = blurbs.get(slug, {})
        clusters_output.append(
            {
                "type": "cluster",
                "slug": slug,
                "title": meta.get("title") or entry.get("title"),
                "tooltip": meta.get("tooltip"),
                "blurb": meta.get("blurb"),
                "scripture": meta.get("scripture", []),
                "tree": tree,
            }
        )

    output = {
        "generatedAt": "raw-latest",
        "master": {
            "type": "master",
            "slug": "master",
            "title": "Whole Bible Genealogy",
            "tree": master_tree,
        },
        "clusters": clusters_output,
    }

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(json.dumps(output, indent=2), encoding="utf-8")
    print(f"Wrote {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
