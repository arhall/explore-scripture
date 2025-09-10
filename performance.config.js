// Performance SLA Configuration
module.exports = {
  // Build Performance SLAs
  build: {
    // Maximum acceptable build times (milliseconds)
    cleanBuild: {
      excellent: 1000, // < 1 second = excellent
      good: 1500, // < 1.5 seconds = good
      target: 2000, // < 2 seconds = target SLA
      maximum: 5000, // > 5 seconds = failure
    },
    incrementalBuild: {
      excellent: 500, // < 0.5 seconds = excellent
      good: 1000, // < 1 second = good
      target: 1500, // < 1.5 seconds = target SLA
      maximum: 3000, // > 3 seconds = failure
    },
  },

  // Site Size SLAs (bytes and counts)
  size: {
    totalSite: {
      excellent: 40 * 1024 * 1024, // 40MB
      good: 50 * 1024 * 1024, // 50MB
      target: 60 * 1024 * 1024, // 60MB
      maximum: 100 * 1024 * 1024, // 100MB
    },
    fileCount: {
      minimum: 300, // At least 300 files
      target: 350, // Around 350 files
      maximum: 500, // No more than 500 files
    },
    averageFileSize: {
      minimum: 1024, // At least 1KB average
      target: 50 * 1024, // Around 50KB average
      maximum: 200 * 1024, // No more than 200KB average
    },
  },

  // Page Performance SLAs (milliseconds)
  pageLoad: {
    homepage: {
      excellent: 1000,
      good: 1500,
      target: 2000,
      maximum: 3000,
    },
    bookPage: {
      excellent: 1200,
      good: 1800,
      target: 2500,
      maximum: 4000,
    },
    categoryPage: {
      excellent: 1000,
      good: 1500,
      target: 2000,
      maximum: 3000,
    },
    characterPage: {
      excellent: 1500,
      good: 2000,
      target: 2500,
      maximum: 4000,
    },
  },

  // Lighthouse Performance SLAs (scores 0-100)
  lighthouse: {
    performance: {
      excellent: 95,
      good: 90,
      target: 85,
      minimum: 80,
    },
    accessibility: {
      excellent: 98,
      good: 95,
      target: 90,
      minimum: 85,
    },
    bestPractices: {
      excellent: 95,
      good: 90,
      target: 85,
      minimum: 80,
    },
    seo: {
      excellent: 98,
      good: 95,
      target: 90,
      minimum: 85,
    },
  },

  // Core Web Vitals SLAs
  webVitals: {
    lcp: {
      // Largest Contentful Paint (ms)
      excellent: 1500,
      good: 2500,
      target: 3000,
      maximum: 4000,
    },
    fcp: {
      // First Contentful Paint (ms)
      excellent: 1000,
      good: 1800,
      target: 2500,
      maximum: 3500,
    },
    cls: {
      // Cumulative Layout Shift (score)
      excellent: 0.05,
      good: 0.1,
      target: 0.15,
      maximum: 0.25,
    },
    tti: {
      // Time to Interactive (ms)
      excellent: 2000,
      good: 3500,
      target: 5000,
      maximum: 7000,
    },
    si: {
      // Speed Index (ms)
      excellent: 2000,
      good: 3000,
      target: 4000,
      maximum: 5500,
    },
  },

  // Memory Performance SLAs (bytes)
  memory: {
    buildProcess: {
      target: 200 * 1024 * 1024, // 200MB
      maximum: 500 * 1024 * 1024, // 500MB
    },
    browserRuntime: {
      target: 50 * 1024 * 1024, // 50MB
      maximum: 100 * 1024 * 1024, // 100MB
    },
  },

  // Data Processing SLAs
  dataProcessing: {
    characters: {
      processingTime: {
        excellent: 2000, // 2 seconds
        good: 5000, // 5 seconds
        target: 10000, // 10 seconds
        maximum: 30000, // 30 seconds
      },
      minCharacterCount: 1000, // Should find at least 1000 characters
      minProcessingRate: 100, // At least 100 characters/second
    },
    books: {
      processingTime: {
        excellent: 500, // 0.5 seconds
        good: 1000, // 1 second
        target: 2000, // 2 seconds
        maximum: 5000, // 5 seconds
      },
      expectedBookCount: 66, // Exactly 66 books
      minCompletionRate: 90, // At least 90% chapter summaries
    },
  },

  // Asset Performance SLAs
  assets: {
    css: {
      maxSize: 100 * 1024, // 100KB max CSS
      minSize: 5 * 1024, // 5KB min CSS (not empty)
    },
    html: {
      homepage: 100 * 1024, // 100KB max homepage
      bookPage: 150 * 1024, // 150KB max book page
      categoryPage: 120 * 1024, // 120KB max category page
      characterPage: 180 * 1024, // 180KB max character page
    },
    images: {
      maxIndividualSize: 500 * 1024, // 500KB max per image
      maxTotalSize: 10 * 1024 * 1024, // 10MB max total images
    },
  },

  // Performance Test Configuration
  testing: {
    // Number of iterations for benchmark tests
    buildIterations: 3,
    incrementalBuildIterations: 5,

    // Timeouts for various tests (milliseconds)
    timeouts: {
      buildTest: 15000, // 15 seconds
      lighthouseTest: 60000, // 60 seconds
      benchmarkTest: 30000, // 30 seconds
      pageLoadTest: 15000, // 15 seconds
    },

    // Test pages for comprehensive performance testing
    testPages: [
      { path: '/', name: 'Homepage', sla: 'homepage' },
      { path: '/books/genesis/', name: 'Genesis Book', sla: 'bookPage' },
      { path: '/books/psalms/', name: 'Psalms Book', sla: 'bookPage' },
      { path: '/categories/law-torah/', name: 'Law Category', sla: 'categoryPage' },
      { path: '/categories/gospels/', name: 'Gospels Category', sla: 'categoryPage' },
      { path: '/characters/', name: 'Characters Index', sla: 'characterPage' },
      { path: '/links/', name: 'Links Page', sla: 'categoryPage' },
    ],
  },

  // Alerting thresholds (when to warn vs fail)
  alerting: {
    // Fail tests if performance degrades beyond maximum thresholds
    failOnMaximum: true,

    // Warn if performance is below target but above minimum
    warnOnTarget: true,

    // Performance degradation tolerance (percentage)
    degradationTolerance: {
      buildTime: 10, // 10% slower is warning
      siteSize: 5, // 5% larger is warning
      pageLoad: 15, // 15% slower is warning
      lighthouse: 5, // 5 points lower is warning
    },
  },
};
