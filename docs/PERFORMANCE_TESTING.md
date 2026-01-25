# Performance Testing

## Overview

Performance tests run via the **Jest “performance” project** and cover:

- Build time and total site size checks
- Page load timing with Puppeteer
- Lighthouse performance/accessibility/SEO scores
- Build and data-processing benchmarks

These tests live in:

- `tests/performance.test.js`
- `tests/lighthouse.test.js`
- `tests/benchmark.test.js`

## Prerequisites

- Node + npm (`npm install`)
- A built site for Lighthouse tests (`_site/`)
- Chrome/Chromium installed for Lighthouse (used by the Lighthouse CLI)
- Optional: `CHROME_PATH` to point Lighthouse/Puppeteer at a specific Chrome binary

## Run the full performance suite

```bash
# Ensure _site exists for Lighthouse
npm run build

# Run all performance tests
npx jest --selectProjects performance
```

## Environment overrides

- `PERF_BASE_URL`: Use an existing server for Puppeteer performance tests instead of
  spinning up a local Express server. Example: `PERF_BASE_URL=http://127.0.0.1:8080`
- `LIGHTHOUSE_BASE_URL`: Use an existing server for Lighthouse CLI tests instead of
  starting a local server. Example: `LIGHTHOUSE_BASE_URL=https://explore-scripture.pages.dev`

## Run a single performance test file

```bash
# Build/time and page-load tests (runs build internally)
npx jest tests/performance.test.js --selectProjects performance

# Lighthouse audits (requires _site)
npx jest tests/lighthouse.test.js --selectProjects performance

# Benchmarks (runs clean + build internally and writes benchmark-results.json)
npx jest tests/benchmark.test.js --selectProjects performance
```

## Outputs and side effects

- `tests/benchmark.test.js` writes `benchmark-results.json` at repo root.
- Benchmarks and performance tests run `npm run clean` and/or `npm run build`,
  which regenerate `_site/`.

## Thresholds

Performance thresholds are defined in the test files themselves:

- `tests/performance.test.js` (PERFORMANCE_SLA)
- `tests/lighthouse.test.js` (LIGHTHOUSE_SLA + WEB_VITALS_SLA)

Adjust those constants if you need to change SLA targets.

## Lighthouse badges

To generate badges from Lighthouse scores, you can use
`lighthouse-badges` (via local install or `npx`). Example:

```bash
# Uses local install if present, otherwise falls back to npx
npm run lighthouse:badges
```

Environment variables for `npm run lighthouse:badges`:

- `LIGHTHOUSE_BADGE_URL` (default: production homepage)
- `LIGHTHOUSE_BADGE_OUTPUT` (default: `docs/badges`)
- `LIGHTHOUSE_BADGE_STYLE` (default: `flat`)
- `LIGHTHOUSE_BADGE_SINGLE=true` (optional)
- `LIGHTHOUSE_BADGE_SAVE_REPORT=true` (optional)

`lighthouse-badges` also supports a config file via
`LIGHTHOUSE_BADGES_CONFIGURATION_PATH` if you want multi-page badges.
