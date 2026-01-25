#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REPORTS_DIR="$ROOT_DIR/tests/reports"
RUN_ID="$(date +%Y%m%d-%H%M%S)"
RUN_DIR="$REPORTS_DIR/selenium-$RUN_ID"

mkdir -p "$RUN_DIR/artifacts"

# Expose report directory for pytest hooks
export TEST_REPORT_DIR="$RUN_DIR"

# Activate test environment
source "$ROOT_DIR/test-env/bin/activate"

# Extend default timeouts to 4 minutes unless overridden
export TEST_TIMEOUT="${TEST_TIMEOUT:-240000}"
export PAGE_LOAD_TIMEOUT="${PAGE_LOAD_TIMEOUT:-240000}"

PYTEST_WORKERS="${PYTEST_WORKERS:-2}"
PYTEST_MARKERS="${PYTEST_MARKERS:-not ios and not mobile}"

CPU_COUNT="$(python - <<'PY'
import os
print(os.cpu_count() or 1)
PY
)"

if [ "$PYTEST_WORKERS" = "auto" ]; then
  echo "INFO Pytest workers: auto (cpu_count=${CPU_COUNT})"
else
  echo "INFO Pytest workers: ${PYTEST_WORKERS} (cpu_count=${CPU_COUNT})"
fi
echo "INFO Pytest markers: ${PYTEST_MARKERS}"

PYTEST_FLAGS=(
  "tests/"
  "-v"
  "--tb=short"
  "--durations=20"
  "--durations-min=1.0"
  "-m" "$PYTEST_MARKERS"
  "--strict-markers"
  "-n" "$PYTEST_WORKERS"
  "--dist=loadfile"
  "--html=${RUN_DIR}/report.html"
  "--self-contained-html"
  "--junitxml=${RUN_DIR}/junit.xml"
  "--log-file=${RUN_DIR}/pytest.log"
  "--log-file-level=INFO"
  "--capture=tee-sys"
)

START_TS="$(date +%s)"
python -m pytest "${PYTEST_FLAGS[@]}" 2>&1 | tee "${RUN_DIR}/pytest.out"
EXIT_CODE=${PIPESTATUS[0]}
END_TS="$(date +%s)"
ELAPSED=$((END_TS - START_TS))
echo "INFO Selenium test runtime: ${ELAPSED}s"
exit "$EXIT_CODE"
