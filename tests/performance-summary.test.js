const fs = require('fs');
const path = require('path');
const {
  listSummaryFiles,
  mergeSummaries,
  readSummary,
  summaryDir,
  writeSummary,
} = require('./utils/perf-summary');

const desktopConfig = require('./utils/lighthouse.config.cjs');
const mobileConfig = require('./utils/lighthouse.mobile.config.cjs');

const formatMs = value => {
  if (value === undefined || value === null || Number.isNaN(value)) return 'n/a';
  const rounded = Math.round(value);
  if (rounded >= 1000) {
    return `${(rounded / 1000).toFixed(2)}s (${rounded}ms)`;
  }
  return `${rounded}ms`;
};

const formatBytes = value => {
  if (value === undefined || value === null || Number.isNaN(value)) return 'n/a';
  const bytes = Number(value);
  if (bytes >= 1024 * 1024) {
    return `${(bytes / 1024 / 1024).toFixed(2)}MB`;
  }
  if (bytes >= 1024) {
    return `${(bytes / 1024).toFixed(2)}KB`;
  }
  return `${bytes}B`;
};

const formatScore = value => {
  if (value === undefined || value === null || Number.isNaN(value)) return 'n/a';
  return `${Math.round(value)}/100`;
};

const getThrottleSummary = config => {
  const settings = (config && config.settings) || {};
  const throttling = settings.throttling || {};
  const rtt = throttling.rttMs;
  const throughput = throttling.throughputKbps;
  const cpu = throttling.cpuSlowdownMultiplier;
  const formFactor = settings.emulatedFormFactor || 'unknown';
  return {
    formFactor,
    rtt,
    throughput,
    cpu,
  };
};

const formatThrottle = throttle => {
  if (!throttle) return 'unknown throttling';
  const rtt = throttle.rtt !== undefined ? `${throttle.rtt}ms` : 'n/a';
  const throughput = throttle.throughput !== undefined ? `${throttle.throughput}Kbps` : 'n/a';
  const cpu = throttle.cpu !== undefined ? `CPU x${throttle.cpu}` : 'CPU n/a';
  return `${throttle.formFactor}, rtt ${rtt}, ${throughput}, ${cpu}`;
};

const parseLargestFiles = lines => {
  if (!Array.isArray(lines)) return [];
  return lines
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      const parts = line.split(/\s+/);
      const filePath = parts[parts.length - 1];
      return filePath;
    });
};

const latestSummaryFiles = () => {
  const cutoff = Date.now() - 1000 * 60 * 60 * 2; // last 2 hours
  return listSummaryFiles().filter(file => {
    try {
      const stats = fs.statSync(file);
      return stats.mtimeMs >= cutoff;
    } catch (error) {
      return false;
    }
  });
};

describe('Performance Suite Summary', () => {
  test('should output a natural language summary of the run', () => {
    const summaryFiles = latestSummaryFiles();
    if (summaryFiles.length === 0) {
      console.log('\nPerformance Summary: No summary data files found for this run.');
      expect(true).toBe(true);
      return;
    }

    const summaries = summaryFiles.map(readSummary);
    const merged = mergeSummaries(summaries);
    merged.completedAt = new Date().toISOString();

    const mergedPath = path.join(summaryDir, 'summary-latest.json');
    writeSummary(merged, mergedPath);

    const environment = merged.environment || {};
    const loadProfile = merged.loadProfile || {};
    const build = merged.build || {};
    const pageLoad = merged.pageLoad || {};
    const memory = merged.memory || {};
    const assets = merged.assets || {};
    const lighthouse = merged.lighthouse || {};
    const benchmark = merged.benchmark || {};

    const desktopThrottle = getThrottleSummary(desktopConfig);
    const mobileThrottle = getThrottleSummary(mobileConfig);

    const baseUrl = loadProfile.baseUrl || loadProfile.lighthouseBaseUrl || environment.perfBaseUrlOverride;
    const serverType = loadProfile.server || 'unknown';
    const browserInfo = loadProfile.browser || {};

    const slowestPage = (pageLoad.pages || []).reduce((slowest, entry) => {
      if (!entry || typeof entry.loadMs !== 'number') return slowest;
      if (!slowest || entry.loadMs > slowest.loadMs) return entry;
      return slowest;
    }, null);

    const lighthouseRuns = lighthouse.runs || {};
    const lighthouseRunNames = Object.keys(lighthouseRuns);
    const slowestLighthouse = lighthouseRunNames.reduce((slowest, name) => {
      const score = lighthouseRuns[name]?.scores?.performance;
      if (typeof score !== 'number') return slowest;
      if (!slowest || score < slowest.score) return { name, score };
      return slowest;
    }, null);

    const lines = [];
    lines.push('\nPerformance Suite Summary');
    lines.push(
      `Run at ${merged.completedAt}. Node ${environment.nodeVersion || 'unknown'} on ${
        environment.platform || 'unknown'
      }/${environment.arch || 'unknown'}${environment.ci ? ' (CI)' : ''}.`
    );
    if (baseUrl) {
      lines.push(`Tested against ${baseUrl} (${serverType} server).`);
    } else {
      lines.push('Tested against an unspecified base URL.');
    }
    lines.push(
      `Load profile: Puppeteer headless (${browserInfo.headless || 'default'}) with cache disabled; Lighthouse CLI desktop (${formatThrottle(
        desktopThrottle
      )}) and mobile (${formatThrottle(mobileThrottle)}).`
    );
    if (browserInfo.chromeForTestingVersion) {
      lines.push(
        `Chrome for Testing: ${browserInfo.chromeForTestingVersion} (${browserInfo.chromeForTestingPlatform || 'unknown'}) at ${browserInfo.executablePath || 'n/a'}.`
      );
    }

    if (build.initialBuildMs || build.lastBuildMs) {
      lines.push(
        `Build performance: initial build ${formatMs(build.initialBuildMs)}, latest build ${formatMs(
          build.lastBuildMs
        )} (SLA ${formatMs(build.slaMs)}).`
      );
    }

    if (benchmark.build || benchmark.incrementalBuild) {
      lines.push(
        `Benchmarks: clean build avg ${formatMs(benchmark.build?.average)} over ${
          benchmark.build?.iterations || 0
        } runs; incremental avg ${formatMs(benchmark.incrementalBuild?.average)} over ${
          benchmark.incrementalBuild?.iterations || 0
        } runs.`
      );
    }

    if (pageLoad.pages && pageLoad.pages.length) {
      const pageSummaries = pageLoad.pages
        .map(entry => {
          const pathLabel = entry.path ? ` ${entry.path}` : '';
          return `${entry.name}${pathLabel} ${formatMs(entry.loadMs)} (SLA ${formatMs(
            entry.slaMs
          )})`;
        })
        .join(', ');
      lines.push(`Major pages: ${pageSummaries}.`);
    }

    if (pageLoad.renderMs || pageLoad.searchMs) {
      lines.push(
        `Feature timings: content render ${formatMs(pageLoad.renderMs)}, search ${formatMs(
          pageLoad.searchMs
        )}.`
      );
    }

    if (memory.buildHeapIncreaseBytes || memory.pageHeapIncreaseBytes) {
      lines.push(
        `Memory: build heap delta ${formatBytes(memory.buildHeapIncreaseBytes)}, peak heap ${formatBytes(
          memory.buildPeakHeapBytes
        )}; page heap delta ${formatBytes(memory.pageHeapIncreaseBytes)}.`
      );
    }

    const totalBytes = assets.totalBytes || benchmark.sizeMetrics?.totalSize;
    const totalFiles = assets.totalFiles || benchmark.sizeMetrics?.fileCount;
    if (totalBytes || totalFiles) {
      lines.push(
        `Assets: total site size ${formatBytes(totalBytes)} across ${
          totalFiles ? totalFiles.toLocaleString() : 'n/a'
        } files; CSS ${formatBytes(assets.cssBytes)}.`
      );
    }

    const largestFiles = parseLargestFiles(benchmark.largestFiles || assets.largeFiles || []);
    if (largestFiles.length) {
      const list = largestFiles.slice(0, 3).map(file => path.basename(file)).join(', ');
      lines.push(`Largest assets: ${list}.`);
    }

    if (lighthouse.coreWebVitals) {
      const vitals = lighthouse.coreWebVitals;
      lines.push(
        `Core Web Vitals (homepage): LCP ${formatMs(vitals.lcp)}, FCP ${formatMs(
          vitals.fcp
        )}, SI ${formatMs(vitals.si)}, TTI ${formatMs(vitals.tti)}, CLS ${
          vitals.cls !== undefined ? vitals.cls.toFixed(3) : 'n/a'
        }.`
      );
    }

    if (lighthouseRunNames.length) {
      const scoreLines = lighthouseRunNames.map(name => {
        const run = lighthouseRuns[name];
        return `${name}: perf ${formatScore(run.scores?.performance)}, a11y ${formatScore(
          run.scores?.accessibility
        )}, bp ${formatScore(run.scores?.bestPractices)}, seo ${formatScore(run.scores?.seo)}`;
      });
      lines.push(`Lighthouse scores: ${scoreLines.join('; ')}.`);
    }

    if (lighthouse.mobile) {
      lines.push(
        `Mobile Lighthouse: perf ${formatScore(lighthouse.mobile.performanceScore)}, LCP ${formatMs(
          lighthouse.mobile.lcp
        )}, FCP ${formatMs(lighthouse.mobile.fcp)}.`
      );
    }

    if (slowestPage) {
      lines.push(
        `Slowest page load observed: ${slowestPage.name}${slowestPage.path ? ` ${slowestPage.path}` : ''} at ${formatMs(
          slowestPage.loadMs
        )}.`
      );
    }

    const slowBookPage = (pageLoad.pages || [])
      .filter(entry => entry.path && entry.path.startsWith('/books/'))
      .reduce((slowest, entry) => {
        if (!entry || typeof entry.loadMs !== 'number') return slowest;
        if (!slowest || entry.loadMs > slowest.loadMs) return entry;
        return slowest;
      }, null);

    if (slowBookPage) {
      const bookSlug = slowBookPage.path.split('/').filter(Boolean)[1];
      lines.push(
        `Slowest book page: ${bookSlug || slowBookPage.name} (${slowBookPage.path}) at ${formatMs(
          slowBookPage.loadMs
        )}.`
      );
    }

    if (slowestLighthouse) {
      lines.push(
        `Lowest Lighthouse performance score: ${slowestLighthouse.name} at ${formatScore(
          slowestLighthouse.score
        )}.`
      );
    }

    if (lighthouse.opportunities?.totalSavingsMs !== undefined) {
      lines.push(
        `Potential Lighthouse savings identified: ${formatMs(
          lighthouse.opportunities.totalSavingsMs
        )}.`
      );
    }

    console.log(lines.join('\n'));
    expect(true).toBe(true);
  });
});
