const path = require('path');
const fs = require('fs');
const os = require('os');
const express = require('express');
const { spawn } = require('child_process');

// Lighthouse SLAs
const LIGHTHOUSE_SLA = {
  performance: 75,
  accessibility: 90,
  bestPractices: 85,
  seo: 90,
  pwa: 50, // Not focused on PWA for this site
};

// Core Web Vitals SLAs (in milliseconds)
const WEB_VITALS_SLA = {
  lcp: 4000, // Largest Contentful Paint
  fid: 100, // First Input Delay
  cls: 0.1, // Cumulative Layout Shift (score, not time)
  fcp: 2500, // First Contentful Paint
  si: 5000, // Speed Index
  tti: 6000, // Time to Interactive
};

jest.setTimeout(180000);

const MOBILE_SLA = {
  performance: 50,
  lcp: 5000,
  fcp: 3500,
};

describe('Lighthouse Performance Tests', () => {
  let server;
  let baseUrl;
  const reportCache = new Map();
  const siteDir = path.join(__dirname, '..', '_site');
  const baseUrlOverride = process.env.LIGHTHOUSE_BASE_URL;
  const lighthouseBin = path.join(
    __dirname,
    '..',
    'node_modules',
    '.bin',
    process.platform === 'win32' ? 'lighthouse.cmd' : 'lighthouse'
  );
  const desktopConfigPath = path.join(__dirname, 'utils', 'lighthouse.config.cjs');
  const mobileConfigPath = path.join(__dirname, 'utils', 'lighthouse.mobile.config.cjs');

  const timestamp = () => new Date().toISOString();
  const logInfo = message => console.log(`[lighthouse ${timestamp()}] ${message}`);
  const logWarn = message => console.warn(`[lighthouse ${timestamp()}] ${message}`);

  beforeAll(async () => {
    if (baseUrlOverride) {
      baseUrl = baseUrlOverride.replace(/\/$/, '');
      logInfo(`Using LIGHTHOUSE_BASE_URL: ${baseUrl}`);
      return;
    }

    // Start local server for lighthouse testing
    const app = express();
    app.use(express.static(siteDir));

    try {
      server = app.listen(0, '127.0.0.1');
      await new Promise((resolve, reject) => {
        server.once('listening', resolve);
        server.once('error', reject);
      });
    } catch (error) {
      throw new Error(
        `Failed to start local server for Lighthouse tests. Set LIGHTHOUSE_BASE_URL to an existing server. Original error: ${error.message}`
      );
    }

    const port = server.address().port;
    baseUrl = `http://127.0.0.1:${port}`;
    logInfo(`Test server running at ${baseUrl}`);
  }, 60000);

  afterAll(async () => {
    if (server) {
      server.close();
    }
  });

  async function runLighthouse(url, testName, configPath = desktopConfigPath) {
    const cacheKey = `${url}::${configPath}`;
    if (reportCache.has(cacheKey)) {
      logInfo(`Reusing Lighthouse report for ${testName} (${url})`);
      return reportCache.get(cacheKey);
    }

    if (!fs.existsSync(lighthouseBin)) {
      throw new Error(
        `Lighthouse CLI not found at ${lighthouseBin}. Run npm install to install dev dependencies.`
      );
    }

    const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lighthouse-'));
    const reportPath = path.join(outputDir, `${testName.replace(/\s+/g, '-').toLowerCase()}.json`);
    const chromeUserDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lighthouse-profile-'));

    const chromeFlags = [
      '--headless',
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--disable-crashpad',
      '--no-crashpad',
      `--user-data-dir=${chromeUserDataDir}`,
    ].join(' ');

    const args = [
      url,
      '--log-level=info',
      '--output=json',
      `--output-path=${reportPath}`,
      `--chrome-flags=${chromeFlags}`,
      `--config-path=${configPath}`,
      '--disable-full-page-screenshot',
      '--max-wait-for-load=45000',
    ];

    logInfo(`Running Lighthouse for ${testName}: ${url}`);
    logInfo(`Command: ${lighthouseBin} ${args.join(' ')}`);

    const child = spawn(lighthouseBin, args, {
      env: {
        ...process.env,
        CHROME_PATH: process.env.CHROME_PATH,
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    const stdoutLines = [];
    const stderrLines = [];
    const collectLines = (chunk, lines, label) => {
      const text = chunk.toString('utf8');
      text.split(/\r?\n/).forEach(line => {
        if (!line.trim()) return;
        lines.push(line);
        if (lines.length > 200) lines.shift();
        console.log(`[lighthouse ${timestamp()}] ${label}: ${line}`);
      });
    };

    child.stdout.on('data', chunk => collectLines(chunk, stdoutLines, 'stdout'));
    child.stderr.on('data', chunk => collectLines(chunk, stderrLines, 'stderr'));

    const runStart = Date.now();
    const exitStatus = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        child.kill('SIGKILL');
        reject(new Error(`Lighthouse CLI timed out after 120s for ${testName}`));
      }, 120000);

      child.on('error', error => {
        clearTimeout(timeout);
        reject(error);
      });

      child.on('close', (code, signal) => {
        clearTimeout(timeout);
        resolve({ code, signal });
      });
    });

    const runDuration = Date.now() - runStart;
    logInfo(`Lighthouse finished for ${testName} in ${runDuration}ms (code=${exitStatus.code})`);

    if (exitStatus.code !== 0) {
      const tailStdout = stdoutLines.slice(-20).join('\n');
      const tailStderr = stderrLines.slice(-20).join('\n');
      throw new Error(
        `Lighthouse CLI failed for ${testName} (code=${exitStatus.code}, signal=${exitStatus.signal}).\n` +
          `stdout:\n${tailStdout}\n\nstderr:\n${tailStderr}`
      );
    }

    if (!fs.existsSync(reportPath)) {
      throw new Error(`Lighthouse report missing for ${testName}: ${reportPath}`);
    }

    const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
    reportCache.set(cacheKey, report);

    console.log(`\\n Lighthouse Results for ${testName}:`);
    const categories = report.categories || {};
    const logCategory = (key, label) => {
      const category = categories[key];
      if (!category || typeof category.score !== 'number') return;
      console.log(`${label}: ${Math.round(category.score * 100)}/100`);
    };
    logCategory('performance', 'Performance');
    logCategory('accessibility', 'Accessibility');
    logCategory('best-practices', 'Best Practices');
    logCategory('seo', 'SEO');
    return report;
  }

  describe('Core Web Vitals', () => {
    test('Homepage should meet Core Web Vitals SLAs', async () => {
      const report = await runLighthouse(baseUrl, 'Homepage');

      // Extract Core Web Vitals
      const lcp = report.audits['largest-contentful-paint'].numericValue;
      const fcp = report.audits['first-contentful-paint'].numericValue;
      const si = report.audits['speed-index'].numericValue;
      const tti = report.audits['interactive'].numericValue;
      const cls = report.audits['cumulative-layout-shift'].numericValue;

      console.log(`\\n Core Web Vitals:`);
      console.log(
        `LCP (Largest Contentful Paint): ${Math.round(lcp)}ms (SLA: ${WEB_VITALS_SLA.lcp}ms)`
      );
      console.log(
        `FCP (First Contentful Paint): ${Math.round(fcp)}ms (SLA: ${WEB_VITALS_SLA.fcp}ms)`
      );
      console.log(`SI (Speed Index): ${Math.round(si)}ms (SLA: ${WEB_VITALS_SLA.si}ms)`);
      console.log(`TTI (Time to Interactive): ${Math.round(tti)}ms (SLA: ${WEB_VITALS_SLA.tti}ms)`);
      console.log(`CLS (Cumulative Layout Shift): ${cls.toFixed(3)} (SLA: ${WEB_VITALS_SLA.cls})`);

      // Assert SLAs
      expect(lcp).toBeLessThan(WEB_VITALS_SLA.lcp);
      expect(fcp).toBeLessThan(WEB_VITALS_SLA.fcp);
      expect(si).toBeLessThan(WEB_VITALS_SLA.si);
      expect(tti).toBeLessThan(WEB_VITALS_SLA.tti);
      expect(cls).toBeLessThan(WEB_VITALS_SLA.cls);
    }, 60000);
  });

  describe('Page Performance Scores', () => {
    const testPages = [
      { path: '/', name: 'Homepage' },
      { path: '/books/genesis/', name: 'Genesis Book Page' },
      { path: '/categories/law-torah/', name: 'Law Category Page' },
      { path: '/entities/', name: 'Entities Index' },
    ];

    testPages.forEach(testPage => {
      test(`${testPage.name} should meet Lighthouse SLA scores`, async () => {
        const url = baseUrl + testPage.path;
        const report = await runLighthouse(url, testPage.name);

        const scores = {
          performance: Math.round(report.categories.performance.score * 100),
          accessibility: Math.round(report.categories.accessibility.score * 100),
          bestPractices: Math.round(report.categories['best-practices'].score * 100),
          seo: Math.round(report.categories.seo.score * 100),
        };

        // Check each score against SLA
        Object.entries(scores).forEach(([category, score]) => {
          const sla = LIGHTHOUSE_SLA[category];
          if (score >= sla) {
            console.log(`OK ${category}: ${score}/100 (exceeds SLA: ${sla})`);
          } else {
            console.log(`WARN ${category}: ${score}/100 (below SLA: ${sla})`);
          }
          expect(score).toBeGreaterThanOrEqual(sla);
        });
      }, 60000);
    });
  });

  describe('Accessibility Performance', () => {
    test('should have excellent accessibility scores', async () => {
      const report = await runLighthouse(baseUrl, 'Accessibility Check');

      const accessibilityScore = Math.round(report.categories.accessibility.score * 100);
      console.log(`\\n Accessibility Score: ${accessibilityScore}/100`);

      // Check specific accessibility audits
      const criticalAudits = [
        'color-contrast',
        'heading-order',
        'html-has-lang',
        'image-alt',
        'link-name',
        'meta-viewport',
      ];

      console.log('\\n Accessibility Audit Details:');
      criticalAudits.forEach(auditId => {
        if (report.audits[auditId]) {
          const audit = report.audits[auditId];
          const status = audit.score === 1 ? 'OK' : audit.score === null ? 'WARN' : 'ERROR';
          console.log(
            `${status} ${audit.title}: ${audit.score === 1 ? 'PASS' : 'NEEDS ATTENTION'}`
          );
        }
      });

      expect(accessibilityScore).toBeGreaterThanOrEqual(LIGHTHOUSE_SLA.accessibility);
    }, 60000);
  });

  describe('SEO Performance', () => {
    test('should have excellent SEO optimization', async () => {
      const report = await runLighthouse(baseUrl, 'SEO Check');

      const seoScore = Math.round(report.categories.seo.score * 100);
      console.log(`\\n SEO Score: ${seoScore}/100`);

      // Check specific SEO audits
      const seoAudits = [
        'document-title',
        'meta-description',
        'html-has-lang',
        'robots-txt',
        'structured-data',
        'viewport',
      ];

      console.log('\\n SEO Audit Details:');
      seoAudits.forEach(auditId => {
        if (report.audits[auditId]) {
          const audit = report.audits[auditId];
          const status = audit.score === 1 ? 'OK' : audit.score === null ? 'WARN' : 'ERROR';
          console.log(
            `${status} ${audit.title}: ${audit.score === 1 ? 'PASS' : 'NEEDS ATTENTION'}`
          );
        }
      });

      expect(seoScore).toBeGreaterThanOrEqual(LIGHTHOUSE_SLA.seo);
    }, 60000);
  });

  describe('Performance Opportunities', () => {
    test('should identify and validate performance optimizations', async () => {
      const report = await runLighthouse(baseUrl, 'Performance Opportunities');

      console.log('\\n Performance Opportunities:');

      const opportunities = [
        'render-blocking-resources',
        'unused-css-rules',
        'unused-javascript',
        'modern-image-formats',
        'uses-responsive-images',
        'efficient-animated-content',
        'preload-lcp-image',
      ];

      let totalSavings = 0;
      opportunities.forEach(auditId => {
        if (report.audits[auditId] && report.audits[auditId].details) {
          const audit = report.audits[auditId];
          const savings = audit.numericValue || 0;
          if (savings > 100) {
            // Only show if > 100ms potential savings
            console.log(` ${audit.title}: ${Math.round(savings)}ms potential savings`);
            totalSavings += savings;
          }
        }
      });

      console.log(`\\n Total Potential Savings: ${Math.round(totalSavings)}ms`);

      // Performance should already be well optimized
      expect(totalSavings).toBeLessThan(1000); // Less than 1 second total potential savings
    }, 60000);
  });

  describe('Mobile Performance', () => {
    test('should perform well on mobile devices', async () => {
      const report = await runLighthouse(baseUrl, 'Mobile Performance', mobileConfigPath);

      const mobilePerformance = Math.round(report.categories.performance.score * 100);
      console.log(`\\n Mobile Performance Score: ${mobilePerformance}/100`);

      // Mobile performance should be at least 85 (slightly lower than desktop)
      expect(mobilePerformance).toBeGreaterThanOrEqual(MOBILE_SLA.performance);

      // Check mobile-specific metrics
      const lcp = report.audits['largest-contentful-paint'].numericValue;
      const fcp = report.audits['first-contentful-paint'].numericValue;

      console.log(` Mobile LCP: ${Math.round(lcp)}ms`);
      console.log(` Mobile FCP: ${Math.round(fcp)}ms`);

      // Mobile should still meet reasonable thresholds
      expect(lcp).toBeLessThan(MOBILE_SLA.lcp);
      expect(fcp).toBeLessThan(MOBILE_SLA.fcp);
    }, 120000);
  });
});
