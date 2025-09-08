/**
 * Bible Explorer Security Configuration
 * Centralized security settings and utilities
 */

class SecurityConfig {
  constructor() {
    this.config = {
      // Rate limiting configuration
      rateLimits: {
        api: { maxRequests: 10, timeWindow: 60000 }, // 10 requests per minute
        search: { maxRequests: 30, timeWindow: 60000 }, // 30 searches per minute
        logging: { maxEvents: 100, timeWindow: 60000 } // 100 log events per minute
      },

      // Content Security Policy configuration
      csp: {
        allowedDomains: [
          'self',
          'https://www.biblegateway.com',
          'https://api.esv.org',
          'https://bible-api.com',
          'https://fonts.googleapis.com',
          'https://fonts.gstatic.com',
          'https://unpkg.com'
        ],
        blockedPatterns: [
          /javascript:/gi,
          /<script/gi,
          /on\w+\s*=/gi,
          /eval\(/gi,
          /Function\(/gi
        ]
      },

      // Input validation patterns
      validation: {
        bibleReference: /^[a-zA-Z0-9\s]+\s*\d+(\s*:\s*\d+(-\d+)?)?$/,
        translation: /^[a-zA-Z]+$/,
        searchQuery: /^[a-zA-Z0-9\s\-'".,:;!?()]+$/,
        slug: /^[a-z0-9-]+$/,
        sessionId: /^session_\d+_[a-f0-9]+$/
      },

      // Security headers
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'SAMEORIGIN',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin'
      },

      // Sensitive data patterns to filter from logs
      sensitivePatterns: [
        /password/gi,
        /token/gi,
        /key/gi,
        /secret/gi,
        /auth/gi,
        /cookie/gi,
        /session/gi
      ]
    };

    this.rateLimiters = new Map();
    this.init();
  }

  init() {
    // Initialize rate limiters
    Object.keys(this.config.rateLimits).forEach(service => {
      this.rateLimiters.set(service, {
        requests: [],
        config: this.config.rateLimits[service]
      });
    });

    // Set up security monitoring
    this.setupSecurityMonitoring();
  }

  // Input sanitization and validation
  sanitizeInput(input, type = 'general') {
    if (typeof input !== 'string') return '';

    // Remove null bytes and control characters
    // eslint-disable-next-line no-control-regex
    let sanitized = input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

    // Apply type-specific sanitization
    switch (type) {
      case 'html':
        sanitized = this.escapeHtml(sanitized);
        break;
      case 'search':
        sanitized = sanitized.replace(/[<>"/\\]/g, '').substring(0, 100);
        break;
      case 'reference':
        sanitized = sanitized.replace(/[^a-zA-Z0-9\s:-]/g, '').substring(0, 50);
        break;
      case 'translation':
        sanitized = sanitized.replace(/[^a-zA-Z]/g, '').toLowerCase().substring(0, 10);
        break;
      default:
        sanitized = sanitized.substring(0, 1000);
    }

    // Check for blocked patterns
    for (const pattern of this.config.csp.blockedPatterns) {
      if (pattern.test(sanitized)) {
        console.warn('Security: Blocked potentially dangerous input pattern');
        return '[BLOCKED_CONTENT]';
      }
    }

    return sanitized;
  }

  // HTML escaping
  escapeHtml(unsafe) {
    if (typeof unsafe !== 'string') return '';
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
  }

  // Validate input against patterns
  validateInput(input, type) {
    const pattern = this.config.validation[type];
    if (!pattern) return false;
    return pattern.test(input);
  }

  // Rate limiting check
  checkRateLimit(service, identifier = 'default') {
    const limiter = this.rateLimiters.get(service);
    if (!limiter) return true; // Allow if no rate limiter configured

    const now = Date.now();
    const key = `${service}_${identifier}`;
    
    // Get or create request history for this identifier
    if (!limiter[key]) {
      limiter[key] = [];
    }

    // Remove old requests outside time window
    limiter[key] = limiter[key].filter(time => 
      now - time < limiter.config.timeWindow
    );

    // Check if limit exceeded
    if (limiter[key].length >= limiter.config.maxRequests) {
      console.warn(`Security: Rate limit exceeded for ${service}:${identifier}`);
      return false;
    }

    // Record this request
    limiter[key].push(now);
    return true;
  }

  // Filter sensitive data from objects
  filterSensitiveData(obj) {
    if (typeof obj !== 'object' || obj === null) return obj;

    const filtered = {};
    for (const [key, value] of Object.entries(obj)) {
      // Check if key matches sensitive patterns
      const isSensitive = this.config.sensitivePatterns.some(pattern => 
        pattern.test(key)
      );

      if (isSensitive) {
        filtered[key] = '[FILTERED]';
      } else if (typeof value === 'object') {
        filtered[key] = this.filterSensitiveData(value);
      } else {
        filtered[key] = value;
      }
    }

    return filtered;
  }

  // Generate secure random ID
  generateSecureId(prefix = 'id') {
    if (window.crypto && window.crypto.getRandomValues) {
      const array = new Uint8Array(16);
      window.crypto.getRandomValues(array);
      return prefix + '_' + Array.from(array, byte => 
        byte.toString(16).padStart(2, '0')
      ).join('');
    }
    
    // Fallback for older browsers
    return prefix + '_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // URL validation and sanitization
  validateUrl(url, allowedDomains = null) {
    try {
      const parsedUrl = new URL(url);
      
      // Check protocol
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        return false;
      }

      // Check against allowed domains if provided
      if (allowedDomains) {
        const allowed = Array.isArray(allowedDomains) ? allowedDomains : this.config.csp.allowedDomains;
        const isAllowed = allowed.some(domain => {
          if (domain === 'self') return parsedUrl.origin === window.location.origin;
          return parsedUrl.origin === domain || parsedUrl.hostname.endsWith(domain.replace('https://', ''));
        });
        
        if (!isAllowed) {
          console.warn(`Security: Blocked request to unauthorized domain: ${parsedUrl.hostname}`);
          return false;
        }
      }

      return true;
    } catch {
      console.warn('Security: Invalid URL format');
      return false;
    }
  }

  // Content Security Policy validation
  validateContent(content) {
    if (typeof content !== 'string') return true;

    for (const pattern of this.config.csp.blockedPatterns) {
      if (pattern.test(content)) {
        console.warn('Security: Content blocked by CSP policy');
        return false;
      }
    }

    return true;
  }

  // Setup security event monitoring
  setupSecurityMonitoring() {
    // Monitor for potential XSS attempts
    if (typeof Element !== 'undefined') {
      // eslint-disable-next-line no-undef
      const originalSetAttribute = Element.prototype.setAttribute;
      // eslint-disable-next-line no-undef
      Element.prototype.setAttribute = function(name, value) {
      if (typeof value === 'string' && !window.securityConfig.validateContent(value)) {
        console.error('Security: Blocked potentially malicious setAttribute');
        return;
      }
        return originalSetAttribute.call(this, name, value);
      };
    }

    // Monitor for suspicious DOM manipulation
    if (typeof MutationObserver !== 'undefined') {
      // eslint-disable-next-line no-undef
      const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            // eslint-disable-next-line no-undef
            if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'SCRIPT') {
              const src = node.getAttribute('src');
              if (src && !this.validateUrl(src)) {
                console.error('Security: Blocked unauthorized script injection');
                node.remove();
              }
            }
          });
        }
      });
    });

      // Start observing the document with the configured parameters
      observer.observe(document, { childList: true, subtree: true });
    }

    // Monitor for localStorage tampering
    if (typeof Storage !== 'undefined') {
      // eslint-disable-next-line no-undef
      const originalSetItem = Storage.prototype.setItem;
      // eslint-disable-next-line no-undef
      Storage.prototype.setItem = function(key, value) {
        if (typeof value === 'string' && !window.securityConfig.validateContent(value)) {
          console.warn('Security: Blocked potentially malicious localStorage operation');
          return;
        }
        return originalSetItem.call(this, key, value);
      };
    }
  }

  // Security audit function
  performSecurityAudit() {
    const audit = {
      timestamp: new Date().toISOString(),
      checks: {
        cspHeaders: this.checkCSPHeaders(),
        httpsUsage: window.location.protocol === 'https:',
        secureScripts: this.auditScripts(),
        rateLimiters: this.auditRateLimiters(),
        contentValidation: true // Implemented above
      },
      recommendations: []
    };

    // Add recommendations based on audit results
    if (!audit.checks.httpsUsage && window.location.hostname !== 'localhost') {
      audit.recommendations.push('Enable HTTPS for production deployment');
    }

    if (!audit.checks.cspHeaders) {
      audit.recommendations.push('Implement Content Security Policy headers');
    }

    console.log('Security Audit Complete:', audit);
    return audit;
  }

  checkCSPHeaders() {
    // Check if CSP meta tag is present
    const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    return !!cspMeta;
  }

  auditScripts() {
    const scripts = document.querySelectorAll('script[src]');
    let secureCount = 0;
    
    scripts.forEach(script => {
      const src = script.getAttribute('src');
      if (this.validateUrl(src)) {
        secureCount++;
      }
    });

    return {
      total: scripts.length,
      secure: secureCount,
      ratio: scripts.length ? secureCount / scripts.length : 1
    };
  }

  auditRateLimiters() {
    const status = {};
    this.rateLimiters.forEach((limiter, service) => {
      const activeConnections = Object.keys(limiter).filter(key => 
        key !== 'config' && limiter[key].length > 0
      ).length;
      
      status[service] = {
        configured: true,
        activeConnections,
        maxRequests: limiter.config.maxRequests,
        timeWindow: limiter.config.timeWindow
      };
    });
    return status;
  }
}

// Initialize security configuration
window.securityConfig = new SecurityConfig();

// Perform initial security audit in debug mode
if (window.location.hostname === 'localhost' || 
    localStorage.getItem('bibleExplorerDebug') === 'true') {
  setTimeout(() => {
    window.securityConfig.performSecurityAudit();
  }, 2000);
}

// Export for use in other modules
window.SecurityConfig = SecurityConfig;