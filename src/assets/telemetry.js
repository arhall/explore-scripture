/**
 * OpenTelemetry Configuration for Explore Scripture
 * OTEL-compliant observability and telemetry setup
 */

import { trace, metrics } from '@opentelemetry/api';
import { WebSDK } from '@opentelemetry/sdk-web';
import { getWebAutoInstrumentations } from '@opentelemetry/auto-instrumentations-web';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-web';
import { PeriodicExportingMetricReader, ConsoleMetricExporter } from '@opentelemetry/sdk-metrics';

class BibleExplorerTelemetry {
  constructor() {
    this.serviceName = 'bible-explorer-web';
    this.serviceVersion = '1.0.0';
    this.environment = this.getEnvironment();

    this.sdk = null;
    this.tracer = null;
    this.meter = null;
    this.logger = null;

    this.init();
  }

  getEnvironment() {
    if (window.location.hostname === 'localhost') return 'development';
    if (window.location.hostname.includes('staging')) return 'staging';
    return 'production';
  }

  init() {
    try {
      // Create resource with service information
      const resource = new Resource({
        [SemanticResourceAttributes.SERVICE_NAME]: this.serviceName,
        [SemanticResourceAttributes.SERVICE_VERSION]: this.serviceVersion,
        [SemanticResourceAttributes.SERVICE_NAMESPACE]: 'bible-study',
        [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: this.environment,
        [SemanticResourceAttributes.SERVICE_INSTANCE_ID]: this.generateInstanceId(),
        // Custom attributes
        'app.name': 'Explore Scripture',
        'app.type': 'static-web-app',
        'app.framework': 'eleventy',
      });

      // Configure SDK
      this.sdk = new WebSDK({
        resource,
        spanExporter: this.getSpanExporter(),
        metricReader: this.getMetricReader(),
        instrumentations: [
          getWebAutoInstrumentations({
            '@opentelemetry/instrumentation-xml-http-request': {
              enabled: true,
              propagateTraceHeaderCorsUrls: [/^https:\/\/api\./, /^https:\/\/.*\.bible-explorer\./],
            },
            '@opentelemetry/instrumentation-fetch': {
              enabled: true,
              propagateTraceHeaderCorsUrls: [/^https:\/\/api\./, /^https:\/\/.*\.bible-explorer\./],
            },
            '@opentelemetry/instrumentation-document-load': {
              enabled: true,
            },
            '@opentelemetry/instrumentation-user-interaction': {
              enabled: true,
              eventNames: ['click', 'submit', 'keydown'],
            },
          }),
        ],
      });

      // Start the SDK
      this.sdk.start();

      // Get telemetry instances
      this.tracer = trace.getTracer(this.serviceName, this.serviceVersion);
      this.meter = metrics.getMeter(this.serviceName, this.serviceVersion);

      // Create custom metrics
      this.setupCustomMetrics();

      // Create custom spans for app-specific operations
      this.setupCustomTracing();

      console.log('OpenTelemetry initialized successfully', {
        serviceName: this.serviceName,
        environment: this.environment,
      });
    } catch (error) {
      console.error('Failed to initialize OpenTelemetry:', error);
      // Fallback to basic logging if OTEL fails
      this.initFallbackTelemetry();
    }
  }

  getSpanExporter() {
    // In development, use console exporter
    if (this.environment === 'development') {
      return new ConsoleSpanExporter();
    }

    // In production, you would configure OTLP exporter
    // return new OTLPTraceExporter({
    //   url: 'https://your-otel-collector/v1/traces',
    //   headers: { 'Authorization': 'Bearer your-token' }
    // });

    return new ConsoleSpanExporter();
  }

  getMetricReader() {
    return new PeriodicExportingMetricReader({
      exporter: new ConsoleMetricExporter(),
      exportIntervalMillis: 30000, // Export every 30 seconds
    });
  }

  generateInstanceId() {
    // Security: Generate cryptographically secure instance ID
    if (window.crypto && window.crypto.getRandomValues) {
      const array = new Uint8Array(16);
      window.crypto.getRandomValues(array);
      return (
        'instance_' +
        Date.now() +
        '_' +
        Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
      );
    }
    // Fallback for older browsers
    return 'instance_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  setupCustomMetrics() {
    // Page view counter
    this.pageViewCounter = this.meter.createCounter('bible_explorer_page_views', {
      description: 'Number of page views',
      unit: '1',
    });

    // Search query counter
    this.searchCounter = this.meter.createCounter('bible_explorer_searches', {
      description: 'Number of search queries',
      unit: '1',
    });

    // Search duration histogram
    this.searchDurationHistogram = this.meter.createHistogram('bible_explorer_search_duration', {
      description: 'Search operation duration',
      unit: 'ms',
    });

    // Video interaction counter
    this.videoInteractionCounter = this.meter.createCounter('bible_explorer_video_interactions', {
      description: 'Video play/pause/seek interactions',
      unit: '1',
    });

    // Navigation counter
    this.navigationCounter = this.meter.createCounter('bible_explorer_navigation', {
      description: 'Page navigation events',
      unit: '1',
    });

    // Error counter
    this.errorCounter = this.meter.createCounter('bible_explorer_errors', {
      description: 'Application errors',
      unit: '1',
    });

    // User session duration
    this.sessionDurationHistogram = this.meter.createHistogram('bible_explorer_session_duration', {
      description: 'User session duration',
      unit: 'ms',
    });

    // Active users gauge (approximate)
    this.activeUsersGauge = this.meter.createUpDownCounter('bible_explorer_active_users', {
      description: 'Approximate number of active users',
      unit: '1',
    });
  }

  setupCustomTracing() {
    // Trace page loads
    this.tracePageLoad();

    // Trace user interactions
    this.traceUserInteractions();

    // Trace search operations
    this.traceSearchOperations();

    // Set up privacy-respecting data collection
    this.setupPrivacyControls();
  }

  setupPrivacyControls() {
    // Check for Do Not Track header
    this.respectsDoNotTrack =
      navigator.doNotTrack === '1' ||
      navigator.doNotTrack === 'yes' ||
      navigator.msDoNotTrack === '1';

    // Allow users to opt-out of telemetry
    if (
      localStorage.getItem('bibleExplorerTelemetryOptOut') === 'true' ||
      this.respectsDoNotTrack
    ) {
      console.log('Telemetry disabled by user preference');
      this.disabled = true;
    }
  }

  tracePageLoad() {
    const span = this.tracer.startSpan('page.load', {
      attributes: {
        'page.url': window.location.href,
        'page.title': document.title,
        'user.agent': navigator.userAgent,
      },
    });

    window.addEventListener('load', () => {
      const perfData = performance.getEntriesByType('navigation')[0];

      span.setAttributes({
        'page.load.dom_content_loaded':
          perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
        'page.load.complete': perfData.loadEventEnd - perfData.loadEventStart,
        'page.load.total': perfData.loadEventEnd - perfData.fetchStart,
        'page.load.dns_lookup': perfData.domainLookupEnd - perfData.domainLookupStart,
        'page.load.server_response': perfData.responseEnd - perfData.requestStart,
      });

      span.end();

      // Record metrics
      this.pageViewCounter.add(1, {
        'page.path': window.location.pathname,
        'page.title': document.title,
      });
    });
  }

  traceUserInteractions() {
    // Track navigation
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function (...args) {
      telemetry.recordNavigation('pushstate', args[2]);
      return originalPushState.apply(this, args);
    };

    history.replaceState = function (...args) {
      telemetry.recordNavigation('replacestate', args[2]);
      return originalReplaceState.apply(this, args);
    };

    window.addEventListener('popstate', _event => {
      this.recordNavigation('popstate', window.location.href);
    });
  }

  traceSearchOperations() {
    // This will be called from the search functionality
    // See updated search code below
  }

  // Public methods for application to use
  recordPageView(path, title, attributes = {}) {
    // Security: Respect privacy preferences
    if (this.disabled) return;

    const span = this.tracer.startSpan('page.view', {
      attributes: {
        'page.path': path,
        'page.title': title,
        ...this.sanitizeAttributes(attributes),
      },
    });

    this.pageViewCounter.add(1, {
      'page.path': path,
      'page.title': title,
    });

    span.end();
  }

  recordSearch(query, resultCount, duration, attributes = {}) {
    // Security: Respect privacy preferences
    if (this.disabled) return;

    // Security: Sanitize and limit search query for privacy
    const sanitizedQuery = this.sanitizeSearchQuery(query);

    const span = this.tracer.startSpan('search.query', {
      attributes: {
        'search.query': sanitizedQuery,
        'search.result_count': resultCount,
        'search.duration_ms': duration,
        'search.has_results': resultCount > 0,
        ...this.sanitizeAttributes(attributes),
      },
    });

    this.searchCounter.add(1, {
      'search.has_results': resultCount > 0 ? 'true' : 'false',
      'search.result_count_range': this.getResultCountRange(resultCount),
    });

    this.searchDurationHistogram.record(duration, {
      'search.has_results': resultCount > 0 ? 'true' : 'false',
    });

    span.end();
  }

  sanitizeSearchQuery(query) {
    if (typeof query !== 'string') return '[INVALID_QUERY]';

    // Remove potential sensitive information and limit length
    return query
      .replace(/[<>"/\\]/g, '')
      .replace(/\b(password|token|key|secret|auth)\b/gi, '[FILTERED]')
      .substring(0, 50); // Shorter limit for telemetry
  }

  sanitizeAttributes(attributes) {
    if (!attributes || typeof attributes !== 'object') return {};

    const sanitized = {};
    for (const [key, value] of Object.entries(attributes)) {
      // Skip sensitive keys
      if (/password|token|key|secret|auth|cookie|session/i.test(key)) {
        continue;
      }

      // Sanitize string values
      if (typeof value === 'string') {
        sanitized[key] = value.substring(0, 100);
      } else if (typeof value === 'number' || typeof value === 'boolean') {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }

  recordVideoInteraction(action, videoId, bookSlug, attributes = {}) {
    // Security: Respect privacy preferences
    if (this.disabled) return;

    const span = this.tracer.startSpan('video.interaction', {
      attributes: {
        'video.action': action,
        'video.id': videoId,
        'book.slug': bookSlug,
        ...this.sanitizeAttributes(attributes),
      },
    });

    this.videoInteractionCounter.add(1, {
      'video.action': action,
      'book.testament': attributes.testament || 'unknown',
    });

    span.end();
  }

  recordNavigation(method, url, attributes = {}) {
    // Security: Respect privacy preferences
    if (this.disabled) return;

    const span = this.tracer.startSpan('navigation', {
      attributes: {
        'navigation.method': method,
        'navigation.url': url,
        'navigation.from': document.referrer,
        ...this.sanitizeAttributes(attributes),
      },
    });

    this.navigationCounter.add(1, {
      'navigation.method': method,
      'navigation.type': this.getNavigationType(url),
    });

    span.end();
  }

  recordError(error, context = {}) {
    // Security: Always record errors for security monitoring, but sanitize data

    const sanitizedContext = this.sanitizeAttributes(context);
    const span = this.tracer.startSpan('error.occurrence', {
      attributes: {
        'error.type': error.name || 'unknown',
        'error.message': (error.message || 'unknown').substring(0, 200),
        'error.stack': (error.stack || '').substring(0, 500),
        'error.context': JSON.stringify(sanitizedContext),
        ...sanitizedContext,
      },
    });

    span.recordException(error);
    span.setStatus({ code: 2, message: error.message }); // ERROR status

    this.errorCounter.add(1, {
      'error.type': error.name || 'unknown',
      'error.context': context.component || 'unknown',
    });

    span.end();
  }

  recordUserSession(duration) {
    // Security: Respect privacy preferences
    if (this.disabled) return;

    this.sessionDurationHistogram.record(duration, {
      'session.type': duration > 300000 ? 'long' : 'short', // 5 minutes threshold
    });
  }

  getResultCountRange(count) {
    if (count === 0) return '0';
    if (count <= 5) return '1-5';
    if (count <= 10) return '6-10';
    if (count <= 20) return '11-20';
    return '20+';
  }

  getNavigationType(url) {
    if (url.includes('/books/')) return 'book';
    if (url.includes('/categories/')) return 'category';
    if (url === '/' || url.endsWith('/')) return 'home';
    return 'other';
  }

  initFallbackTelemetry() {
    // Minimal telemetry if OTEL fails
    this.tracer = {
      startSpan: () => ({
        setAttributes: () => {},
        end: () => {},
        recordException: () => {},
        setStatus: () => {},
      }),
    };

    this.meter = {
      createCounter: () => ({ add: () => {} }),
      createHistogram: () => ({ record: () => {} }),
      createUpDownCounter: () => ({ add: () => {} }),
    };

    console.warn('Using fallback telemetry - OTEL initialization failed');
  }

  // Cleanup method
  shutdown() {
    if (this.sdk) {
      return this.sdk.shutdown();
    }
  }
}

// Initialize telemetry
const telemetry = new BibleExplorerTelemetry();

// Export for global access
window.telemetry = telemetry;

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BibleExplorerTelemetry;
}

export default telemetry;
