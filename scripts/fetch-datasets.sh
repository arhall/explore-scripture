#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DATASET_DIR="${DATASET_DIR:-$ROOT_DIR/data/source-datasets}"
DATASET_TAG="${DATASET_RELEASE_TAG:-data-v2}"
DATASET_REPO="${DATASET_RELEASE_REPO:-}"

FILES=(
  "Bible_combined_all_expanded.with_ids.v2.json"
  "Bible_id_redirect_map.v2.json"
)

mkdir -p "$DATASET_DIR"

missing=()
for file in "${FILES[@]}"; do
  if [ ! -f "$DATASET_DIR/$file" ]; then
    missing+=("$file")
  fi
done

if [ ${#missing[@]} -eq 0 ]; then
  echo "INFO Dataset files already present."
  exit 0
fi

if ! command -v gh >/dev/null 2>&1; then
  echo "ERROR GitHub CLI (gh) is required to download datasets." >&2
  exit 1
fi

if [ -n "${GITHUB_TOKEN:-}" ] && [ -z "${GH_TOKEN:-}" ]; then
  export GH_TOKEN="$GITHUB_TOKEN"
fi

repo_flag=()
if [ -n "$DATASET_REPO" ]; then
  repo_flag=(--repo "$DATASET_REPO")
fi

for file in "${missing[@]}"; do
  echo "INFO Downloading $file from release $DATASET_TAG"
  gh release download "$DATASET_TAG" --dir "$DATASET_DIR" --pattern "$file" "${repo_flag[@]}"
  if [ ! -f "$DATASET_DIR/$file" ]; then
    echo "ERROR Failed to download $file from release $DATASET_TAG" >&2
    exit 1
  fi
done
