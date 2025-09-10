/**
 * Advanced Real-Time Performance Monitor
 *
 * Comprehensive performance monitoring system with:
 * - Real-time metrics collection and analysis
 * - Core Web Vitals tracking with historical trends
 * - Resource loading performance monitoring
 * - User experience analytics
 * - Automated performance alerts and recommendations
 * - Integration with external monitoring services
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      coreWebVitals: {
        lcp: [], // Largest Contentful Paint
        fid: [], // First Input Delay
        cls: [], // Cumulative Layout Shift
        fcp: [], // First Contentful Paint
        ttfb: [], // Time to First Byte
      },
      customMetrics: {
        moduleLoadTimes: new Map(),
        searchPerformance: [],
        cacheEfficiency: [],
        bundlePerformance: [],
        apiResponseTimes: new Map(),
      },
      userExperience: {
        interactions: [],
        errors: [],
        navigationTiming: [],
        resourceTiming: [],
      },
      system: {
        memoryUsage: [],
        connectionType: null,
        deviceInfo: {},
        batteryStatus: null,
      },
    };

    this.thresholds = {
      lcp: { good: 2500, needsImprovement: 4000 },
      fid: { good: 100, needsImprovement: 300 },
      cls: { good: 0.1, needsImprovement: 0.25 },
      fcp: { good: 1800, needsImprovement: 3000 },
      ttfb: { good: 800, needsImprovement: 1800 },
    };

    this.observers = new Map();
    this.isMonitoring = false;
    this.reportingEndpoint = '/api/performance'; // Configure as needed
    this.reportingInterval = 30000; // 30 seconds
    this.maxMetricsHistory = 100;

    this.init();
  }

  async init() {
    console.log('[PerformanceMonitor] Initializing real-time monitoring...');

    try {
      // Initialize monitoring systems
      await this.setupCoreWebVitalsMonitoring();
      await this.setupResourceMonitoring();
      await this.setupUserExperienceMonitoring();
      await this.setupSystemMonitoring();

      // Start periodic reporting
      this.startPeriodicReporting();

      this.isMonitoring = true;
      console.log('[PerformanceMonitor] Real-time monitoring active');

      // Report initial page load metrics
      setTimeout(() => this.collectInitialMetrics(), 1000);
    } catch (error) {
      console.error('[PerformanceMonitor] Failed to initialize:', error);
    }
  }

  // Core Web Vitals monitoring with advanced analysis
  async setupCoreWebVitalsMonitoring() {
    if (!('PerformanceObserver' in window)) {
      console.warn('[PerformanceMonitor] PerformanceObserver not supported');
      return;
    }

    // Largest Contentful Paint (LCP)
    try {
      const lcpObserver = new PerformanceObserver(entryList => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];

        const lcpMetric = {
          value: lastEntry.renderTime || lastEntry.loadTime,
          timestamp: Date.now(),
          element: lastEntry.element ? this.getElementSelector(lastEntry.element) : null,
          url: lastEntry.url || null,
          rating: this.getRating('lcp', lastEntry.renderTime || lastEntry.loadTime),
        };

        this.recordMetric('coreWebVitals', 'lcp', lcpMetric);
        this.analyzePerformanceTrend('lcp', lcpMetric.value);
      });

      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.set('lcp', lcpObserver);
    } catch (error) {
      console.warn('[PerformanceMonitor] LCP monitoring failed:', error);
    }

    // First Input Delay (FID)
    try {
      const fidObserver = new PerformanceObserver(entryList => {
        entryList.getEntries().forEach(entry => {
          const fidMetric = {
            value: entry.processingStart - entry.startTime,
            timestamp: Date.now(),
            inputType: entry.name,
            target: entry.target ? this.getElementSelector(entry.target) : null,
            rating: this.getRating('fid', entry.processingStart - entry.startTime),
          };

          this.recordMetric('coreWebVitals', 'fid', fidMetric);
          this.analyzeInteractionPerformance(fidMetric);
        });
      });

      fidObserver.observe({ entryTypes: ['first-input'] });
      this.observers.set('fid', fidObserver);
    } catch (error) {
      console.warn('[PerformanceMonitor] FID monitoring failed:', error);
    }

    // Cumulative Layout Shift (CLS)
    try {
      let clsValue = 0;
      const clsEntries = [];

      const clsObserver = new PerformanceObserver(entryList => {
        entryList.getEntries().forEach(entry => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            clsEntries.push(entry);
          }
        });

        const clsMetric = {
          value: clsValue,
          timestamp: Date.now(),
          shifts: clsEntries.length,
          sources: clsEntries.map(entry => ({
            element: entry.sources?.[0] ? this.getElementSelector(entry.sources[0].node) : null,
            value: entry.value,
          })),
          rating: this.getRating('cls', clsValue),
        };

        this.recordMetric('coreWebVitals', 'cls', clsMetric);
        this.analyzeLayoutShifts(clsEntries);
      });

      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.set('cls', clsObserver);
    } catch (error) {
      console.warn('[PerformanceMonitor] CLS monitoring failed:', error);
    }

    // First Contentful Paint (FCP)
    try {
      const fcpObserver = new PerformanceObserver(entryList => {
        entryList.getEntries().forEach(entry => {
          if (entry.name === 'first-contentful-paint') {
            const fcpMetric = {
              value: entry.startTime,
              timestamp: Date.now(),
              rating: this.getRating('fcp', entry.startTime),
            };

            this.recordMetric('coreWebVitals', 'fcp', fcpMetric);
          }
        });
      });

      fcpObserver.observe({ entryTypes: ['paint'] });
      this.observers.set('fcp', fcpObserver);
    } catch (error) {
      console.warn('[PerformanceMonitor] FCP monitoring failed:', error);
    }
  }

  // Advanced resource monitoring
  async setupResourceMonitoring() {
    if (!('PerformanceObserver' in window)) return;

    try {
      const resourceObserver = new PerformanceObserver(entryList => {
        entryList.getEntries().forEach(entry => {
          const resourceMetric = {
            name: entry.name,
            type: entry.initiatorType,
            duration: entry.duration,
            transferSize: entry.transferSize || 0,
            encodedBodySize: entry.encodedBodySize || 0,
            decodedBodySize: entry.decodedBodySize || 0,
            compressionRatio: this.calculateCompressionRatio(entry),
            cacheStatus: this.determineCacheStatus(entry),
            timestamp: Date.now(),
            timing: {
              dns: entry.domainLookupEnd - entry.domainLookupStart,
              connect: entry.connectEnd - entry.connectStart,
              tls:
                entry.secureConnectionStart > 0
                  ? entry.connectEnd - entry.secureConnectionStart
                  : 0,
              request: entry.responseStart - entry.requestStart,
              response: entry.responseEnd - entry.responseStart,
              total: entry.responseEnd - entry.fetchStart,
            },
          };

          this.recordMetric('userExperience', 'resourceTiming', resourceMetric);
          this.analyzeResourcePerformance(resourceMetric);
        });
      });

      resourceObserver.observe({ entryTypes: ['resource'] });
      this.observers.set('resource', resourceObserver);
    } catch (error) {
      console.warn('[PerformanceMonitor] Resource monitoring failed:', error);
    }
  }

  // User experience monitoring
  async setupUserExperienceMonitoring() {
    // Navigation timing
    if ('navigation' in performance) {
      const navTiming = performance.getEntriesByType('navigation')[0];
      if (navTiming) {
        const navigationMetric = {
          type: navTiming.type,
          redirectCount: navTiming.redirectCount,
          timing: {
            redirect: navTiming.redirectEnd - navTiming.redirectStart,
            dns: navTiming.domainLookupEnd - navTiming.domainLookupStart,
            connect: navTiming.connectEnd - navTiming.connectStart,
            request: navTiming.responseStart - navTiming.requestStart,
            response: navTiming.responseEnd - navTiming.responseStart,
            domParsing: navTiming.domInteractive - navTiming.responseEnd,
            domComplete: navTiming.domComplete - navTiming.domInteractive,
            loadComplete: navTiming.loadEventEnd - navTiming.loadEventStart,
          },
          ttfb: navTiming.responseStart - navTiming.requestStart,
          timestamp: Date.now(),
        };

        this.recordMetric('userExperience', 'navigationTiming', navigationMetric);
        this.recordMetric('coreWebVitals', 'ttfb', {
          value: navigationMetric.ttfb,
          timestamp: Date.now(),
          rating: this.getRating('ttfb', navigationMetric.ttfb),
        });
      }
    }

    // User interaction monitoring
    ['click', 'scroll', 'keydown', 'touchstart'].forEach(eventType => {
      document.addEventListener(eventType, this.trackInteraction.bind(this), { passive: true });
    });

    // Error monitoring
    window.addEventListener('error', this.trackError.bind(this));
    window.addEventListener('unhandledrejection', this.trackPromiseRejection.bind(this));
  }

  // System monitoring
  async setupSystemMonitoring() {
    try {
      // Connection information
      if ('connection' in navigator) {
        this.metrics.system.connectionType = {
          effectiveType: navigator.connection.effectiveType,
          downlink: navigator.connection.downlink,
          rtt: navigator.connection.rtt,
          saveData: navigator.connection.saveData,
        };

        // Monitor connection changes
        navigator.connection.addEventListener('change', () => {
          this.metrics.system.connectionType = {
            effectiveType: navigator.connection.effectiveType,
            downlink: navigator.connection.downlink,
            rtt: navigator.connection.rtt,
            saveData: navigator.connection.saveData,
            timestamp: Date.now(),
          };
        });
      }

      // Device information
      this.metrics.system.deviceInfo = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        hardwareConcurrency: navigator.hardwareConcurrency,
        deviceMemory: navigator.deviceMemory || 'unknown',
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine,
        language: navigator.language,
        languages: navigator.languages,
      };

      // Battery status (if available)
      if ('getBattery' in navigator) {
        navigator.getBattery().then(battery => {
          this.metrics.system.batteryStatus = {
            charging: battery.charging,
            level: battery.level,
            chargingTime: battery.chargingTime,
            dischargingTime: battery.dischargingTime,
          };

          // Monitor battery changes
          battery.addEventListener('chargingchange', () => {
            this.metrics.system.batteryStatus.charging = battery.charging;
          });

          battery.addEventListener('levelchange', () => {
            this.metrics.system.batteryStatus.level = battery.level;
          });
        });
      }

      // Memory monitoring
      if ('memory' in performance) {
        this.memoryMonitoringId = setInterval(() => {
          if (!this.isMonitoring) return;

          const memoryMetric = {
            used: performance.memory.usedJSHeapSize,
            total: performance.memory.totalJSHeapSize,
            limit: performance.memory.jsHeapSizeLimit,
            timestamp: Date.now(),
          };

          this.recordMetric('system', 'memoryUsage', memoryMetric);

          // Alert if memory usage is high
          if (memoryMetric.used / memoryMetric.limit > 0.85) {
            this.triggerAlert('high_memory_usage', memoryMetric);
          }
        }, 5000); // Check every 5 seconds
      }
    } catch (error) {
      console.warn('[PerformanceMonitor] System monitoring failed:', error);
    }
  }

  // Module performance tracking
  trackModuleLoad(moduleName, startTime, endTime, size) {
    const loadTime = endTime - startTime;
    const moduleMetric = {
      name: moduleName,
      loadTime,
      size,
      timestamp: endTime,
      bandwidth: size / (loadTime / 1000), // bytes per second
      rating: loadTime < 100 ? 'good' : loadTime < 300 ? 'needs-improvement' : 'poor',
    };

    this.recordCustomMetric('moduleLoadTimes', moduleName, moduleMetric);

    // Alert if module load time is excessive
    if (loadTime > 1000) {
      this.triggerAlert('slow_module_load', moduleMetric);
    }
  }

  // Search performance tracking
  trackSearchPerformance(query, startTime, endTime, resultCount, cacheHit = false) {
    const searchTime = endTime - startTime;
    const searchMetric = {
      query: query.length, // Store query length, not actual query for privacy
      searchTime,
      resultCount,
      cacheHit,
      timestamp: endTime,
      rating: searchTime < 100 ? 'excellent' : searchTime < 300 ? 'good' : 'slow',
    };

    this.recordCustomMetric('searchPerformance', null, searchMetric);

    // Analyze search patterns
    this.analyzeSearchPerformance(searchMetric);
  }

  // API performance tracking
  trackAPICall(endpoint, startTime, endTime, success, errorType = null) {
    const responseTime = endTime - startTime;
    const apiMetric = {
      endpoint: this.sanitizeEndpoint(endpoint),
      responseTime,
      success,
      errorType,
      timestamp: endTime,
      rating: responseTime < 200 ? 'excellent' : responseTime < 500 ? 'good' : 'slow',
    };

    this.recordCustomMetric('apiResponseTimes', endpoint, apiMetric);

    // Track API reliability
    this.updateAPIReliabilityStats(endpoint, success, responseTime);
  }

  // Cache efficiency tracking
  trackCacheEfficiency(resource, cacheStatus, loadTime) {
    const cacheMetric = {
      resource: this.sanitizeResourceName(resource),
      status: cacheStatus, // 'hit', 'miss', 'stale'
      loadTime,
      timestamp: Date.now(),
      savings: cacheStatus === 'hit' ? this.estimateTimeSavings(resource) : 0,
    };

    this.recordCustomMetric('cacheEfficiency', null, cacheMetric);
  }

  // Analysis methods
  analyzePerformanceTrend(metric, value) {
    const history = this.metrics.coreWebVitals[metric] || [];

    if (history.length > 5) {
      const recent = history.slice(-5);
      const average = recent.reduce((sum, item) => sum + item.value, 0) / recent.length;
      const trend =
        value > average * 1.2 ? 'degrading' : value < average * 0.8 ? 'improving' : 'stable';

      if (trend === 'degrading') {
        this.triggerAlert('performance_degradation', {
          metric,
          current: value,
          average,
          trend,
        });
      }
    }
  }

  analyzeInteractionPerformance(fidMetric) {
    if (fidMetric.value > 300) {
      this.triggerAlert('slow_interaction', fidMetric);
    }

    // Track interaction patterns
    this.recordMetric('userExperience', 'interactions', {
      type: fidMetric.inputType,
      delay: fidMetric.value,
      target: fidMetric.target,
      timestamp: fidMetric.timestamp,
    });
  }

  analyzeLayoutShifts(shifts) {
    const significantShifts = shifts.filter(shift => shift.value > 0.05);

    if (significantShifts.length > 0) {
      this.triggerAlert('layout_instability', {
        count: significantShifts.length,
        totalShift: significantShifts.reduce((sum, shift) => sum + shift.value, 0),
        sources: significantShifts.map(shift => ({
          element: shift.sources?.[0] ? this.getElementSelector(shift.sources[0].node) : null,
          value: shift.value,
        })),
      });
    }
  }

  analyzeResourcePerformance(resourceMetric) {
    // Detect slow resources
    if (resourceMetric.duration > 3000) {
      this.triggerAlert('slow_resource', resourceMetric);
    }

    // Detect large uncompressed resources
    if (resourceMetric.compressionRatio < 0.3 && resourceMetric.decodedBodySize > 100000) {
      this.triggerAlert('unoptimized_resource', resourceMetric);
    }

    // Detect cache misses on static resources
    if (resourceMetric.type === 'script' || resourceMetric.type === 'stylesheet') {
      if (resourceMetric.cacheStatus === 'miss') {
        this.triggerAlert('cache_miss', resourceMetric);
      }
    }
  }

  analyzeSearchPerformance(searchMetric) {
    // Detect consistently slow searches
    const recentSearches = this.metrics.customMetrics.searchPerformance.slice(-10);
    const averageSearchTime =
      recentSearches.reduce((sum, s) => sum + s.searchTime, 0) / recentSearches.length;

    if (averageSearchTime > 500) {
      this.triggerAlert('slow_search_performance', {
        averageTime: averageSearchTime,
        recentSearches: recentSearches.length,
      });
    }
  }

  // Event handlers
  trackInteraction(event) {
    const interactionMetric = {
      type: event.type,
      target: this.getElementSelector(event.target),
      timestamp: Date.now(),
      coordinates: event.type === 'click' ? { x: event.clientX, y: event.clientY } : null,
    };

    this.recordMetric('userExperience', 'interactions', interactionMetric);
  }

  trackError(error) {
    const errorMetric = {
      message: error.message,
      filename: error.filename,
      line: error.lineno,
      column: error.colno,
      stack: error.error ? error.error.stack : null,
      timestamp: Date.now(),
      url: window.location.href,
    };

    this.recordMetric('userExperience', 'errors', errorMetric);
    this.triggerAlert('javascript_error', errorMetric);
  }

  trackPromiseRejection(event) {
    const rejectionMetric = {
      reason: event.reason ? event.reason.toString() : 'Unknown',
      timestamp: Date.now(),
      url: window.location.href,
    };

    this.recordMetric('userExperience', 'errors', rejectionMetric);
    this.triggerAlert('promise_rejection', rejectionMetric);
  }

  // Utility methods
  recordMetric(category, subcategory, metric) {
    if (!this.metrics[category]) {
      this.metrics[category] = {};
    }

    if (!this.metrics[category][subcategory]) {
      this.metrics[category][subcategory] = [];
    }

    this.metrics[category][subcategory].push(metric);

    // Maintain history limits
    if (this.metrics[category][subcategory].length > this.maxMetricsHistory) {
      this.metrics[category][subcategory] = this.metrics[category][subcategory].slice(
        -this.maxMetricsHistory
      );
    }
  }

  recordCustomMetric(category, key, metric) {
    if (!this.metrics.customMetrics[category]) {
      this.metrics.customMetrics[category] = key ? new Map() : [];
    }

    if (key) {
      if (!this.metrics.customMetrics[category].has(key)) {
        this.metrics.customMetrics[category].set(key, []);
      }
      this.metrics.customMetrics[category].get(key).push(metric);

      // Maintain history limits
      const history = this.metrics.customMetrics[category].get(key);
      if (history.length > this.maxMetricsHistory) {
        this.metrics.customMetrics[category].set(key, history.slice(-this.maxMetricsHistory));
      }
    } else {
      this.metrics.customMetrics[category].push(metric);

      // Maintain history limits
      if (this.metrics.customMetrics[category].length > this.maxMetricsHistory) {
        this.metrics.customMetrics[category] = this.metrics.customMetrics[category].slice(
          -this.maxMetricsHistory
        );
      }
    }
  }

  getRating(metric, value) {
    const thresholds = this.thresholds[metric];
    if (!thresholds) return 'unknown';

    if (value <= thresholds.good) return 'good';
    if (value <= thresholds.needsImprovement) return 'needs-improvement';
    return 'poor';
  }

  getElementSelector(element) {
    if (!element) return null;

    try {
      // Generate a useful selector
      let selector = element.tagName.toLowerCase();

      if (element.id) {
        selector += `#${element.id}`;
      } else if (element.className) {
        const classes = element.className
          .split(' ')
          .filter(c => c)
          .slice(0, 2);
        if (classes.length > 0) {
          selector += `.${classes.join('.')}`;
        }
      }

      return selector;
    } catch (error) {
      return element.tagName ? element.tagName.toLowerCase() : 'unknown';
    }
  }

  calculateCompressionRatio(entry) {
    if (!entry.encodedBodySize || !entry.decodedBodySize) return 0;
    return 1 - entry.encodedBodySize / entry.decodedBodySize;
  }

  determineCacheStatus(entry) {
    if (entry.transferSize === 0 && entry.decodedBodySize > 0) return 'hit';
    if (entry.transferSize > 0 && entry.transferSize < entry.decodedBodySize) return 'revalidated';
    return 'miss';
  }

  sanitizeEndpoint(endpoint) {
    // Remove sensitive data from endpoint URLs
    return endpoint.replace(
      /\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi,
      '/{id}'
    );
  }

  sanitizeResourceName(resource) {
    try {
      const url = new URL(resource);
      return url.pathname;
    } catch {
      return resource;
    }
  }

  estimateTimeSavings(resource) {
    // Estimate time savings from cache hit (simplified)
    return 200; // ms average network request time saved
  }

  updateAPIReliabilityStats(endpoint, success, responseTime) {
    // Track API reliability metrics
    const sanitizedEndpoint = this.sanitizeEndpoint(endpoint);
    // Implementation would track success rates and response times per endpoint
  }

  triggerAlert(type, data) {
    console.warn(`[PerformanceAlert] ${type}:`, data);

    // Emit custom event for external monitoring systems
    window.dispatchEvent(
      new CustomEvent('performance-alert', {
        detail: { type, data, timestamp: Date.now() },
      })
    );

    // Could integrate with external alerting systems here
  }

  // Reporting methods
  async collectInitialMetrics() {
    const initialReport = {
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      metrics: this.getMetricsSummary(),
    };

    console.log('[PerformanceMonitor] Initial metrics collected:', initialReport);
    return initialReport;
  }

  startPeriodicReporting() {
    // Clear any existing interval
    if (this.reportingIntervalId) {
      clearInterval(this.reportingIntervalId);
    }

    this.reportingIntervalId = setInterval(async () => {
      if (this.isMonitoring) {
        const report = this.generatePerformanceReport();
        await this.sendReport(report);
      }
    }, this.reportingInterval);
  }

  stopPeriodicReporting() {
    if (this.reportingIntervalId) {
      clearInterval(this.reportingIntervalId);
      this.reportingIntervalId = null;
    }

    if (this.memoryMonitoringId) {
      clearInterval(this.memoryMonitoringId);
      this.memoryMonitoringId = null;
    }
  }

  generatePerformanceReport() {
    return {
      timestamp: Date.now(),
      url: window.location.href,
      sessionDuration: Date.now() - (this.sessionStartTime || Date.now()),
      metrics: this.getMetricsSummary(),
      alerts: this.getRecentAlerts(),
      system: this.metrics.system,
      recommendations: this.generateRecommendations(),
    };
  }

  getMetricsSummary() {
    const summary = {};

    // Core Web Vitals summary
    Object.entries(this.metrics.coreWebVitals).forEach(([metric, values]) => {
      if (values.length > 0) {
        const latest = values[values.length - 1];
        summary[metric] = {
          current: latest.value,
          rating: latest.rating,
          count: values.length,
        };
      }
    });

    // Custom metrics summary
    summary.modules = this.metrics.customMetrics.moduleLoadTimes.size;
    summary.searchPerformance = {
      count: this.metrics.customMetrics.searchPerformance.length,
      averageTime:
        this.metrics.customMetrics.searchPerformance.length > 0
          ? this.metrics.customMetrics.searchPerformance.reduce((sum, s) => sum + s.searchTime, 0) /
            this.metrics.customMetrics.searchPerformance.length
          : 0,
    };

    return summary;
  }

  getRecentAlerts() {
    // Return recent alerts (would be implemented with alert storage)
    return [];
  }

  generateRecommendations() {
    const recommendations = [];

    // Analyze current metrics and generate recommendations
    const lcpValues = this.metrics.coreWebVitals.lcp;
    if (lcpValues.length > 0) {
      const latestLCP = lcpValues[lcpValues.length - 1];
      if (latestLCP.rating === 'poor') {
        recommendations.push({
          type: 'lcp',
          priority: 'high',
          message:
            'Largest Contentful Paint is slow. Consider optimizing images and critical rendering path.',
          value: latestLCP.value,
        });
      }
    }

    // Add more recommendations based on other metrics
    return recommendations;
  }

  async sendReport(report) {
    try {
      // Send report to monitoring service
      if (this.reportingEndpoint) {
        await fetch(this.reportingEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(report),
        });
      }

      // Also log locally for debugging
      console.log('[PerformanceMonitor] Report generated:', report.metrics);
    } catch (error) {
      console.warn('[PerformanceMonitor] Failed to send report:', error);
    }
  }

  // Public API methods
  getPerformanceSnapshot() {
    return {
      coreWebVitals: this.getLatestCoreWebVitals(),
      customMetrics: this.getCustomMetricsSummary(),
      system: this.metrics.system,
      isMonitoring: this.isMonitoring,
    };
  }

  getLatestCoreWebVitals() {
    const latest = {};
    Object.entries(this.metrics.coreWebVitals).forEach(([metric, values]) => {
      if (values.length > 0) {
        latest[metric] = values[values.length - 1];
      }
    });
    return latest;
  }

  getCustomMetricsSummary() {
    return {
      moduleLoadTimes: Array.from(this.metrics.customMetrics.moduleLoadTimes.entries()),
      searchPerformance: this.metrics.customMetrics.searchPerformance.slice(-10),
      cacheEfficiency: this.metrics.customMetrics.cacheEfficiency.slice(-20),
      apiResponseTimes: Array.from(this.metrics.customMetrics.apiResponseTimes.entries()),
    };
  }

  stop() {
    this.isMonitoring = false;

    // Clear memory monitoring interval
    if (this.memoryMonitoringId) {
      clearInterval(this.memoryMonitoringId);
      this.memoryMonitoringId = null;
    }

    // Clear periodic reporting interval
    if (this.reportingIntervalId) {
      clearInterval(this.reportingIntervalId);
      this.reportingIntervalId = null;
    }

    // Disconnect all observers
    this.observers.forEach(observer => {
      try {
        observer.disconnect();
      } catch (error) {
        console.warn('[PerformanceMonitor] Error disconnecting observer:', error);
      }
    });

    this.observers.clear();
    console.log('[PerformanceMonitor] Monitoring stopped');
  }
}

// Initialize global performance monitor
const performanceMonitor = new PerformanceMonitor();

// Make available globally
window.performanceMonitor = performanceMonitor;

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PerformanceMonitor };
}
