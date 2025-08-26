const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');
const path = require('path');
const http = require('http');
const express = require('express');

// Lighthouse SLAs
const LIGHTHOUSE_SLA = {
  performance: 90,
  accessibility: 95,
  bestPractices: 90,
  seo: 95,
  pwa: 50, // Not focused on PWA for this site
};

// Core Web Vitals SLAs (in milliseconds)
const WEB_VITALS_SLA = {
  lcp: 2500, // Largest Contentful Paint
  fid: 100,  // First Input Delay
  cls: 0.1,  // Cumulative Layout Shift (score, not time)
  fcp: 1800, // First Contentful Paint
  si: 3000,  // Speed Index
  tti: 3500, // Time to Interactive
};

describe('Lighthouse Performance Tests', () => {
  let server;
  let chrome;
  let baseUrl;
  const siteDir = path.join(__dirname, '..', '_site');

  beforeAll(async () => {
    // Start local server for lighthouse testing
    const app = express();
    app.use(express.static(siteDir));
    
    server = app.listen(0, 'localhost');
    const port = server.address().port;
    baseUrl = `http://localhost:${port}`;

    console.log(`Test server running at ${baseUrl}`);

    // Launch Chrome for Lighthouse
    chrome = await chromeLauncher.launch({
      chromeFlags: ['--headless', '--no-sandbox', '--disable-dev-shm-usage']
    });
  }, 30000);

  afterAll(async () => {
    if (server) {
      server.close();
    }
    if (chrome) {
      await chrome.kill();
    }
  });

  async function runLighthouse(url, testName) {
    const options = {
      logLevel: 'error',
      output: 'json',
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      port: chrome.port,
      settings: {
        emulatedFormFactor: 'desktop',
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1,
        },
      },
    };

    const runnerResult = await lighthouse(url, options);
    const report = runnerResult.lhr;

    console.log(`\\n📊 Lighthouse Results for ${testName}:`);
    console.log(`Performance: ${Math.round(report.categories.performance.score * 100)}/100`);
    console.log(`Accessibility: ${Math.round(report.categories.accessibility.score * 100)}/100`);
    console.log(`Best Practices: ${Math.round(report.categories['best-practices'].score * 100)}/100`);
    console.log(`SEO: ${Math.round(report.categories.seo.score * 100)}/100`);

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

      console.log(`\\n🚀 Core Web Vitals:`);
      console.log(`LCP (Largest Contentful Paint): ${Math.round(lcp)}ms (SLA: ${WEB_VITALS_SLA.lcp}ms)`);
      console.log(`FCP (First Contentful Paint): ${Math.round(fcp)}ms (SLA: ${WEB_VITALS_SLA.fcp}ms)`);
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
      { path: '/characters/', name: 'Characters Index' },
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
            console.log(`✅ ${category}: ${score}/100 (exceeds SLA: ${sla})`);
          } else {
            console.log(`⚠️ ${category}: ${score}/100 (below SLA: ${sla})`);
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
      console.log(`\\n♿ Accessibility Score: ${accessibilityScore}/100`);

      // Check specific accessibility audits
      const criticalAudits = [
        'color-contrast',
        'heading-order',
        'html-has-lang',
        'image-alt',
        'link-name',
        'meta-viewport',
      ];

      console.log('\\n🔍 Accessibility Audit Details:');
      criticalAudits.forEach(auditId => {
        if (report.audits[auditId]) {
          const audit = report.audits[auditId];
          const status = audit.score === 1 ? '✅' : audit.score === null ? '⚠️' : '❌';
          console.log(`${status} ${audit.title}: ${audit.score === 1 ? 'PASS' : 'NEEDS ATTENTION'}`);
        }
      });

      expect(accessibilityScore).toBeGreaterThanOrEqual(LIGHTHOUSE_SLA.accessibility);
    }, 60000);
  });

  describe('SEO Performance', () => {
    test('should have excellent SEO optimization', async () => {
      const report = await runLighthouse(baseUrl, 'SEO Check');
      
      const seoScore = Math.round(report.categories.seo.score * 100);
      console.log(`\\n🔍 SEO Score: ${seoScore}/100`);

      // Check specific SEO audits
      const seoAudits = [
        'document-title',
        'meta-description',
        'html-has-lang',
        'robots-txt',
        'structured-data',
        'viewport',
      ];

      console.log('\\n📈 SEO Audit Details:');
      seoAudits.forEach(auditId => {
        if (report.audits[auditId]) {
          const audit = report.audits[auditId];
          const status = audit.score === 1 ? '✅' : audit.score === null ? '⚠️' : '❌';
          console.log(`${status} ${audit.title}: ${audit.score === 1 ? 'PASS' : 'NEEDS ATTENTION'}`);
        }
      });

      expect(seoScore).toBeGreaterThanOrEqual(LIGHTHOUSE_SLA.seo);
    }, 60000);
  });

  describe('Performance Opportunities', () => {
    test('should identify and validate performance optimizations', async () => {
      const report = await runLighthouse(baseUrl, 'Performance Opportunities');

      console.log('\\n⚡ Performance Opportunities:');
      
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
          if (savings > 100) { // Only show if > 100ms potential savings
            console.log(`📊 ${audit.title}: ${Math.round(savings)}ms potential savings`);
            totalSavings += savings;
          }
        }
      });

      console.log(`\\n💰 Total Potential Savings: ${Math.round(totalSavings)}ms`);
      
      // Performance should already be well optimized
      expect(totalSavings).toBeLessThan(1000); // Less than 1 second total potential savings
    }, 60000);
  });

  describe('Mobile Performance', () => {
    test('should perform well on mobile devices', async () => {
      const options = {
        logLevel: 'error',
        output: 'json',
        onlyCategories: ['performance'],
        port: chrome.port,
        settings: {
          emulatedFormFactor: 'mobile',
          throttling: {
            rttMs: 150,
            throughputKbps: 1600,
            cpuSlowdownMultiplier: 4,
          },
        },
      };

      const runnerResult = await lighthouse(baseUrl, options);
      const report = runnerResult.lhr;

      const mobilePerformance = Math.round(report.categories.performance.score * 100);
      console.log(`\\n📱 Mobile Performance Score: ${mobilePerformance}/100`);

      // Mobile performance should be at least 85 (slightly lower than desktop)
      expect(mobilePerformance).toBeGreaterThanOrEqual(85);

      // Check mobile-specific metrics
      const lcp = report.audits['largest-contentful-paint'].numericValue;
      const fcp = report.audits['first-contentful-paint'].numericValue;

      console.log(`📱 Mobile LCP: ${Math.round(lcp)}ms`);
      console.log(`📱 Mobile FCP: ${Math.round(fcp)}ms`);

      // Mobile should still meet reasonable thresholds
      expect(lcp).toBeLessThan(4000); // 4s for mobile LCP
      expect(fcp).toBeLessThan(3000); // 3s for mobile FCP
    }, 60000);
  });
});