#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DATASET_DIR="${DATASET_DIR:-$ROOT_DIR/data/source-datasets}"
DATASET_TAG="${DATASET_RELEASE_TAG:-data-v2}"
DATASET_REPO="${DATASET_RELEASE_REPO:-}"
DATASET_TITLE="${DATASET_RELEASE_TITLE:-Dataset $DATASET_TAG}"
DATASET_NOTES="${DATASET_RELEASE_NOTES:-Automated dataset release.}"

FILES=(
  "Bible_combined_all_expanded.with_ids.v2.json"
  "Bible_id_redirect_map.v2.json"
)

if ! command -v gh >/dev/null 2>&1; then
  echo "ERROR GitHub CLI (gh) is required to publish datasets." >&2
  exit 1
fi

if [ -n "${GITHUB_TOKEN:-}" ] && [ -z "${GH_TOKEN:-}" ]; then
  export GH_TOKEN="$GITHUB_TOKEN"
fi

repo_flag=()
if [ -n "$DATASET_REPO" ]; then
  repo_flag=(--repo "$DATASET_REPO")
fi

missing_local=()
for file in "${FILES[@]}"; do
  if [ ! -f "$DATASET_DIR/$file" ]; then
    missing_local+=("$file")
  fi
done

if [ ${#missing_local[@]} -gt 0 ]; then
  echo "ERROR Missing local dataset files in $DATASET_DIR:" >&2
  printf ' - %s\n' "${missing_local[@]}" >&2
  exit 1
fi

if ! gh release view "$DATASET_TAG" "${repo_flag[@]}" >/dev/null 2>&1; then
  echo "INFO Creating release $DATASET_TAG"
  gh release create "$DATASET_TAG" --title "$DATASET_TITLE" --notes "$DATASET_NOTES" "${repo_flag[@]}"
else
  echo "INFO Using existing release $DATASET_TAG"
fi

clobber_flag=()
if [ "${DATASET_OVERWRITE:-false}" = "true" ]; then
  clobber_flag=(--clobber)
fi

for file in "${FILES[@]}"; do
  echo "INFO Uploading $file to release $DATASET_TAG"
  gh release upload "$DATASET_TAG" "$DATASET_DIR/$file" "${clobber_flag[@]}" "${repo_flag[@]}"
done
