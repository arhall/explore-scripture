/**
 * Explore Scripture Logging System
 * Comprehensive logging utility for debugging, analytics, and monitoring
 */

class BibleExplorerLogger {
  constructor() {
    // Log levels (must be defined first)
    this.levels = {
      ERROR: 0,
      WARN: 1,
      INFO: 2,
      DEBUG: 3,
      TRACE: 4,
    };

    this.logLevel = this.getLogLevel();
    this.sessionId = this.generateSessionId();
    this.startTime = performance.now();
    this.logs = [];
    this.maxStoredLogs = 1000;

    // Initialize logging
    this.info('Logger initialized', {
      sessionId: this.sessionId,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      url: window.location.href,
    });

    // Set up error handling
    this.setupGlobalErrorHandling();

    // Set up performance monitoring
    this.setupPerformanceMonitoring();
  }

  getLogLevel() {
    // Check for debug mode in localStorage or URL params
    const urlParams = new URLSearchParams(window.location.search);
    if (
      urlParams.get('debug') === 'true' ||
      localStorage.getItem('bibleExplorerDebug') === 'true'
    ) {
      return this.levels.DEBUG;
    }
    return window.location.hostname === 'localhost' ? this.levels.DEBUG : this.levels.INFO;
  }

  generateSessionId() {
    // Security: Generate cryptographically secure session ID
    if (window.crypto && window.crypto.getRandomValues) {
      const array = new Uint8Array(16);
      window.crypto.getRandomValues(array);
      return (
        'session_' +
        Date.now() +
        '_' +
        Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
      );
    }
    // Fallback for older browsers
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Security: Sanitize log data to prevent injection attacks
  sanitizeLogData(data) {
    if (typeof data === 'string') {
      // Remove potential script tags and dangerous characters
      return data
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '[SCRIPT_REMOVED]')
        .replace(/javascript:/gi, '[JS_REMOVED]:')
        .replace(/on\w+\s*=/gi, '[EVENT_REMOVED]=')
        .substring(0, 1000); // Limit string length
    }

    if (typeof data === 'object' && data !== null) {
      const sanitized = {};
      for (const [key, value] of Object.entries(data)) {
        // Sanitize key names
        const cleanKey = key.replace(/[<>"/]/g, '').substring(0, 100);
        sanitized[cleanKey] = this.sanitizeLogData(value);
      }
      return sanitized;
    }

    return data;
  }

  setupGlobalErrorHandling() {
    window.addEventListener('error', event => {
      this.error('Global error caught', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error?.stack,
      });
    });

    window.addEventListener('unhandledrejection', event => {
      this.error('Unhandled promise rejection', {
        reason: event.reason,
        promise: event.promise,
      });
    });
  }

  setupPerformanceMonitoring() {
    // Log page load performance
    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = performance.getEntriesByType('navigation')[0];
        this.info('Page load performance', {
          domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
          loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
          totalPageLoad: perfData.loadEventEnd - perfData.fetchStart,
          dnsLookup: perfData.domainLookupEnd - perfData.domainLookupStart,
          serverResponse: perfData.responseEnd - perfData.requestStart,
        });
      }, 100);
    });

    // Monitor long tasks
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver(list => {
          list.getEntries().forEach(entry => {
            if (entry.duration > 50) {
              // Tasks longer than 50ms
              this.warn('Long task detected', {
                name: entry.name,
                duration: entry.duration,
                startTime: entry.startTime,
              });
            }
          });
        });
        observer.observe({ entryTypes: ['longtask'] });
      } catch {
        this.debug('Long task monitoring not supported');
      }
    }
  }

  log(level, message, data = {}, category = 'general') {
    if (level > this.logLevel) return;

    const timestamp = new Date().toISOString();
    const sessionTime = performance.now() - this.startTime;

    const logEntry = {
      timestamp,
      sessionTime: Math.round(sessionTime),
      sessionId: this.sessionId,
      level: Object.keys(this.levels)[level],
      category,
      message,
      data: this.sanitizeData(data),
      url: window.location.href,
      userAgent: navigator.userAgent.substring(0, 100), // Truncate for storage
    };

    // Store in memory (limited)
    this.logs.push(logEntry);
    if (this.logs.length > this.maxStoredLogs) {
      this.logs.shift();
    }

    // Console output with styling
    this.outputToConsole(logEntry);

    // Store in localStorage for debugging
    this.storeLog(logEntry);

    // Send to external service if configured
    this.sendToExternal(logEntry);

    return logEntry;
  }

  sanitizeData(data) {
    // Remove sensitive information and circular references
    try {
      const sanitized = JSON.parse(
        JSON.stringify(data, (key, value) => {
          if (typeof value === 'function') return '[Function]';
          if (value instanceof Error) return value.toString();
          if (
            key.toLowerCase().includes('password') ||
            key.toLowerCase().includes('token') ||
            key.toLowerCase().includes('secret')
          ) {
            return '[REDACTED]';
          }
          return value;
        })
      );
      return sanitized;
    } catch {
      return { error: 'Failed to serialize data', original: String(data) };
    }
  }

  outputToConsole(logEntry) {
    const styles = {
      ERROR: 'color: #ff4444; font-weight: bold;',
      WARN: 'color: #ffaa00; font-weight: bold;',
      INFO: 'color: #0088cc;',
      DEBUG: 'color: #888888;',
      TRACE: 'color: #666666; font-style: italic;',
    };

    const style = styles[logEntry.level] || '';
    const prefix = `[${logEntry.timestamp}] [${logEntry.category.toUpperCase()}] [${logEntry.level}]`;

    console.log(`%c${prefix} ${logEntry.message}`, style, logEntry.data);
  }

  storeLog(logEntry) {
    try {
      // Check available localStorage space before storing
      const testKey = 'bibleExplorerLogsTest';
      const testValue = JSON.stringify(logEntry);

      // Test if we can store this entry
      localStorage.setItem(testKey, testValue);
      localStorage.removeItem(testKey);

      const stored = JSON.parse(localStorage.getItem('bibleExplorerLogs') || '[]');

      // Validate stored array structure
      if (!Array.isArray(stored)) {
        throw new Error('Invalid stored logs format');
      }

      // Security: Validate log entry size (max 10KB per entry)
      if (JSON.stringify(logEntry).length > 10240) {
        console.warn('[Logger] Log entry too large, truncating');
        logEntry = { ...logEntry, message: logEntry.message.substring(0, 1000) + '...[truncated]' };
      }

      stored.push(logEntry);

      // More aggressive size management for business logic protection
      if (stored.length > 50) {
        stored.splice(0, stored.length - 50);
      }

      localStorage.setItem('bibleExplorerLogs', JSON.stringify(stored));
    } catch (error) {
      // Clear corrupted logs and start fresh
      try {
        localStorage.removeItem('bibleExplorerLogs');
        console.warn('[Logger] Storage issue resolved by clearing logs:', error.message);
      } catch {
        // If even removal fails, localStorage is completely full
        console.error('[Logger] localStorage completely exhausted');
      }
    }
  }

  sendToExternal(_logEntry) {
    // Placeholder for external logging service integration
    // You could integrate with services like LogRocket, Sentry, etc.
    if (window.bibleExplorerConfig?.externalLogging) {
      // Implementation would depend on chosen service
    }
  }

  // Logging methods
  error(message, data, category = 'error') {
    return this.log(this.levels.ERROR, message, data, category);
  }

  warn(message, data, category = 'warning') {
    return this.log(this.levels.WARN, message, data, category);
  }

  info(message, data, category = 'info') {
    return this.log(this.levels.INFO, message, data, category);
  }

  debug(message, data, category = 'debug') {
    return this.log(this.levels.DEBUG, message, data, category);
  }

  trace(message, data, category = 'trace') {
    return this.log(this.levels.TRACE, message, data, category);
  }

  // Specialized logging methods
  userAction(action, data = {}) {
    return this.info(`User action: ${action}`, data, 'user-action');
  }

  performance(operation, duration, data = {}) {
    const level = duration > 1000 ? this.levels.WARN : this.levels.INFO;
    return this.log(
      level,
      `Performance: ${operation}`,
      {
        duration: Math.round(duration),
        ...data,
      },
      'performance'
    );
  }

  search(query, results, duration) {
    return this.info(
      'Search performed',
      {
        query: query.substring(0, 100), // Limit query length
        resultCount: results.length,
        duration: Math.round(duration),
        hasResults: results.length > 0,
      },
      'search'
    );
  }

  navigation(from, to, method = 'unknown') {
    return this.info(
      'Navigation',
      {
        from: from.substring(0, 200),
        to: to.substring(0, 200),
        method,
      },
      'navigation'
    );
  }

  videoInteraction(action, videoId, bookSlug, data = {}) {
    return this.info(
      `Video ${action}`,
      {
        videoId,
        bookSlug,
        ...data,
      },
      'video'
    );
  }

  // Utility methods
  startTimer(name) {
    const timer = {
      name,
      startTime: performance.now(),
      end: () => {
        const duration = performance.now() - timer.startTime;
        this.performance(name, duration);
        return duration;
      },
    };
    this.trace(`Timer started: ${name}`);
    return timer;
  }

  getLogs(category = null, level = null) {
    let filtered = this.logs;

    if (category) {
      filtered = filtered.filter(log => log.category === category);
    }

    if (level !== null) {
      filtered = filtered.filter(log => this.levels[log.level] <= level);
    }

    return filtered;
  }

  exportLogs() {
    const logs = {
      sessionId: this.sessionId,
      exportTime: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      logs: this.logs,
    };

    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bible-explorer-logs-${this.sessionId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    this.info('Logs exported', { logCount: this.logs.length });
  }

  clearLogs() {
    const count = this.logs.length;
    this.logs = [];
    localStorage.removeItem('bibleExplorerLogs');
    this.info('Logs cleared', { clearedCount: count });
  }

  getSessionSummary() {
    const summary = {
      sessionId: this.sessionId,
      sessionDuration: Math.round(performance.now() - this.startTime),
      totalLogs: this.logs.length,
      logsByLevel: {},
      logsByCategory: {},
      errors: this.logs.filter(log => log.level === 'ERROR').length,
      warnings: this.logs.filter(log => log.level === 'WARN').length,
    };

    // Count by level
    this.logs.forEach(log => {
      summary.logsByLevel[log.level] = (summary.logsByLevel[log.level] || 0) + 1;
      summary.logsByCategory[log.category] = (summary.logsByCategory[log.category] || 0) + 1;
    });

    return summary;
  }
}

// Create global logger instance
window.logger = new BibleExplorerLogger();

// Add convenience methods to window for easy access
window.logUserAction = (action, data) => window.logger.userAction(action, data);
window.logSearch = (query, results, duration) => window.logger.search(query, results, duration);
window.logNavigation = (from, to, method) => window.logger.navigation(from, to, method);
window.logVideo = (action, videoId, bookSlug, data) =>
  window.logger.videoInteraction(action, videoId, bookSlug, data);

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BibleExplorerLogger;
}
