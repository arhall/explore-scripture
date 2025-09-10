/**
 * Advanced Memory Management and Cleanup System
 * Implements intelligent memory monitoring, leak detection, and automated cleanup
 * to ensure optimal performance across all device types and usage patterns.
 */

const fs = require('fs');
const path = require('path');

class MemoryManager {
  constructor() {
    this.config = {
      // Memory thresholds and limits
      memoryLimits: {
        // Total memory limits by device type
        desktop: {
          total: 100 * 1024 * 1024, // 100MB
          cache: 50 * 1024 * 1024, // 50MB
          dom: 30 * 1024 * 1024, // 30MB
          variables: 20 * 1024 * 1024, // 20MB
        },
        tablet: {
          total: 60 * 1024 * 1024, // 60MB
          cache: 30 * 1024 * 1024, // 30MB
          dom: 20 * 1024 * 1024, // 20MB
          variables: 10 * 1024 * 1024, // 10MB
        },
        mobile: {
          total: 40 * 1024 * 1024, // 40MB
          cache: 20 * 1024 * 1024, // 20MB
          dom: 15 * 1024 * 1024, // 15MB
          variables: 5 * 1024 * 1024, // 5MB
        },
        'low-end': {
          total: 20 * 1024 * 1024, // 20MB
          cache: 10 * 1024 * 1024, // 10MB
          dom: 7 * 1024 * 1024, // 7MB
          variables: 3 * 1024 * 1024, // 3MB
        },
      },

      // Warning and critical thresholds (percentage of limits)
      thresholds: {
        warning: 0.75, // 75% of limit
        critical: 0.9, // 90% of limit
        emergency: 0.95, // 95% of limit
      },

      // Cleanup strategies
      cleanupStrategies: {
        // Cache cleanup
        cache: {
          lru: true, // Least Recently Used eviction
          ttl: true, // Time To Live expiration
          sizeLimit: true, // Size-based eviction
          priority: 'high',
        },

        // DOM cleanup
        dom: {
          observers: true, // Clean up observers
          eventListeners: true, // Remove event listeners
          timers: true, // Clear timers and intervals
          priority: 'critical',
        },

        // Variable cleanup
        variables: {
          weakMaps: true, // Use WeakMap for references
          nullifyReferences: true, // Nullify large objects
          garbageCollect: true, // Force garbage collection
          priority: 'medium',
        },

        // Module cleanup
        modules: {
          unloadUnused: true, // Unload unused modules
          resetState: true, // Reset module state
          clearClosures: true, // Clear closure references
          priority: 'low',
        },
      },

      // Memory monitoring configuration
      monitoring: {
        interval: 5000, // Check every 5 seconds
        detailedInterval: 30000, // Detailed analysis every 30 seconds
        reportingInterval: 300000, // Report every 5 minutes
        leakDetectionThreshold: 5, // MB increase per minute
        maxHistorySize: 100, // Keep last 100 measurements
      },

      // Leak detection patterns
      leakPatterns: {
        domNodes: {
          threshold: 1000, // Alert if DOM grows by 1000+ nodes
          checkInterval: 10000, // Check every 10 seconds
        },
        eventListeners: {
          threshold: 100, // Alert if 100+ listeners added without cleanup
          trackTypes: ['click', 'scroll', 'resize', 'keydown'],
        },
        timers: {
          threshold: 50, // Alert if 50+ timers active
          maxAge: 300000, // Alert if timer runs for 5+ minutes
        },
        closures: {
          threshold: 1000, // Alert if 1000+ closure references
          maxRetainedSize: 10 * 1024 * 1024, // 10MB in closures
        },
      },
    };

    this.state = {
      currentUsage: {
        total: 0,
        cache: 0,
        dom: 0,
        variables: 0,
      },
      history: [],
      leaks: new Set(),
      cleanupQueue: [],
      isMonitoring: false,
      deviceType: 'mobile', // Default to most constrained
    };

    // Tracking collections
    this.trackedObjects = new WeakMap();
    this.trackedTimers = new Map();
    this.trackedListeners = new Map();
    this.trackedObservers = new Set();
  }

  /**
   * Generate memory management system
   */
  async generateMemoryManagementSystem() {
    // Generate client-side memory manager
    const clientScript = await this.generateClientScript();

    // Generate memory profiler
    const profilerScript = this.generateMemoryProfiler();

    // Generate cleanup utilities
    const cleanupUtils = this.generateCleanupUtilities();

    // Generate monitoring dashboard
    const dashboardScript = this.generateMonitoringDashboard();

    // Write files
    const outputDir = path.join(__dirname, '..', 'src', 'assets');

    await this.writeScript(clientScript, path.join(outputDir, 'memory-manager.js'));
    await this.writeScript(profilerScript, path.join(outputDir, 'memory-profiler.js'));
    await this.writeScript(cleanupUtils, path.join(outputDir, 'cleanup-utils.js'));
    await this.writeScript(dashboardScript, path.join(outputDir, 'memory-dashboard.js'));

    console.log('✅ Advanced memory management system generated');

    return {
      clientScript,
      profilerScript,
      cleanupUtils,
      dashboardScript,
    };
  }

  /**
   * Generate client-side memory manager
   */
  async generateClientScript() {
    return `/**
 * Advanced Memory Manager - Client Implementation
 * Auto-generated by memory-manager.js
 */

class MemoryManager {
    constructor() {
        this.config = ${JSON.stringify(this.config, null, 2)};
        this.state = {
            currentUsage: { total: 0, cache: 0, dom: 0, variables: 0 },
            history: [],
            leaks: new Set(),
            cleanupQueue: [],
            isMonitoring: false,
            deviceType: this.detectDeviceType()
        };
        
        // Tracking collections
        this.trackedObjects = new WeakMap();
        this.trackedTimers = new Map();
        this.trackedListeners = new Map();
        this.trackedObservers = new Set();
        this.trackedPromises = new Set();
        this.trackedModules = new Map();
        
        // Performance API availability
        this.hasMemoryAPI = 'memory' in performance;
        this.hasObserverAPI = 'PerformanceObserver' in window;
        
        console.log('🧠 Memory Manager initialized');
        console.log('📱 Device type:', this.state.deviceType);
        console.log('🔧 Memory API available:', this.hasMemoryAPI);
    }
    
    /**
     * Initialize memory management
     */
    init() {
        // Set up memory monitoring
        this.startMemoryMonitoring();
        
        // Set up leak detection
        this.setupLeakDetection();
        
        // Hook into common APIs for tracking
        this.instrumentAPIs();
        
        // Set up automatic cleanup
        this.setupAutomaticCleanup();
        
        // Set up page lifecycle handlers
        this.setupPageLifecycleHandlers();
        
        // Export public API
        window.MemoryManager = {
            getUsage: this.getCurrentUsage.bind(this),
            requestCleanup: this.requestCleanup.bind(this),
            trackObject: this.trackObject.bind(this),
            untrackObject: this.untrackObject.bind(this),
            getReport: this.getMemoryReport.bind(this),
            enableMonitoring: this.enableDetailedMonitoring.bind(this),
            forceCleanup: this.forceCleanup.bind(this)
        };
        
        console.log('✅ Memory Manager ready');
    }
    
    /**
     * Detect device type for memory limits
     */
    detectDeviceType() {
        const memory = navigator.deviceMemory || 4;
        const width = window.innerWidth;
        const cores = navigator.hardwareConcurrency || 4;
        
        if (memory < 2 || cores < 4) return 'low-end';
        if (width < 768) return 'mobile';
        if (width < 1024) return 'tablet';
        return 'desktop';
    }
    
    /**
     * Start memory monitoring
     */
    startMemoryMonitoring() {
        if (this.state.isMonitoring) return;
        
        this.state.isMonitoring = true;
        
        // Basic monitoring
        setInterval(() => {
            this.collectMemoryMetrics();
        }, this.config.monitoring.interval);
        
        // Detailed analysis
        setInterval(() => {
            this.performDetailedAnalysis();
        }, this.config.monitoring.detailedInterval);
        
        // Periodic reporting
        setInterval(() => {
            this.generateMemoryReport();
        }, this.config.monitoring.reportingInterval);
        
        console.log('📊 Memory monitoring started');
    }
    
    /**
     * Collect memory metrics
     */
    collectMemoryMetrics() {
        const metrics = {
            timestamp: Date.now(),
            memory: this.getMemoryUsage(),
            dom: this.getDOMUsage(),
            cache: this.getCacheUsage(),
            timers: this.trackedTimers.size,
            listeners: this.trackedListeners.size,
            observers: this.trackedObservers.size
        };
        
        // Add to history
        this.state.history.push(metrics);
        
        // Trim history
        if (this.state.history.length > this.config.monitoring.maxHistorySize) {
            this.state.history.shift();
        }
        
        // Update current usage
        this.state.currentUsage = {
            total: metrics.memory.usedJSHeapSize || 0,
            cache: metrics.cache,
            dom: metrics.dom,
            variables: metrics.memory.usedJSHeapSize - metrics.cache - metrics.dom || 0
        };
        
        // Check thresholds
        this.checkMemoryThresholds(metrics);
        
        return metrics;
    }
    
    /**
     * Get memory usage from Performance API
     */
    getMemoryUsage() {
        if (this.hasMemoryAPI && performance.memory) {
            return {
                usedJSHeapSize: performance.memory.usedJSHeapSize,
                totalJSHeapSize: performance.memory.totalJSHeapSize,
                jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
            };
        }
        
        // Fallback estimation
        return this.estimateMemoryUsage();
    }
    
    /**
     * Estimate memory usage when API is not available
     */
    estimateMemoryUsage() {
        let estimated = 0;
        
        // Estimate DOM size
        estimated += this.getDOMUsage();
        
        // Estimate cache size
        estimated += this.getCacheUsage();
        
        // Estimate tracked objects
        estimated += this.getTrackedObjectsSize();
        
        return {
            usedJSHeapSize: estimated,
            totalJSHeapSize: estimated * 1.5,
            jsHeapSizeLimit: this.getMemoryLimit()
        };
    }
    
    /**
     * Get DOM usage estimate
     */
    getDOMUsage() {
        const elements = document.querySelectorAll('*').length;
        const textNodes = this.countTextNodes();
        
        // Rough estimate: 200 bytes per element, 50 bytes per text node
        return (elements * 200) + (textNodes * 50);
    }
    
    /**
     * Count text nodes in DOM
     */
    countTextNodes() {
        let count = 0;
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );
        
        while (walker.nextNode()) {
            count++;
        }
        
        return count;
    }
    
    /**
     * Get cache usage estimate
     */
    getCacheUsage() {
        let size = 0;
        
        // Check localStorage
        try {
            const localStorageSize = new Blob(Object.values(localStorage)).size;
            size += localStorageSize;
        } catch (e) {
            // Fallback estimation
            size += Object.keys(localStorage).length * 1000;
        }
        
        // Check sessionStorage
        try {
            const sessionStorageSize = new Blob(Object.values(sessionStorage)).size;
            size += sessionStorageSize;
        } catch (e) {
            size += Object.keys(sessionStorage).length * 1000;
        }
        
        // Estimate other caches (Maps, Sets, etc.)
        size += this.estimateInMemoryCaches();
        
        return size;
    }
    
    /**
     * Estimate in-memory cache sizes
     */
    estimateInMemoryCaches() {
        let size = 0;
        
        // Check for common cache objects
        if (window.searchCache) {
            size += this.estimateObjectSize(window.searchCache);
        }
        
        if (window.chapterCache) {
            size += this.estimateObjectSize(window.chapterCache);
        }
        
        if (window.entityCache) {
            size += this.estimateObjectSize(window.entityCache);
        }
        
        return size;
    }
    
    /**
     * Estimate object size
     */
    estimateObjectSize(obj) {
        try {
            return new Blob([JSON.stringify(obj)]).size;
        } catch (e) {
            // Fallback: rough estimation
            const keys = Object.keys(obj).length;
            return keys * 1000; // Assume 1KB per key on average
        }
    }
    
    /**
     * Get tracked objects size
     */
    getTrackedObjectsSize() {
        // This is an estimation since WeakMap doesn't provide size
        return this.trackedTimers.size * 100 + 
               this.trackedListeners.size * 200 +
               this.trackedObservers.size * 500;
    }
    
    /**
     * Get memory limit for current device
     */
    getMemoryLimit() {
        return this.config.memoryLimits[this.state.deviceType].total;
    }
    
    /**
     * Check memory thresholds and trigger actions
     */
    checkMemoryThresholds(metrics) {
        const limit = this.getMemoryLimit();
        const usage = this.state.currentUsage.total;
        const percentage = usage / limit;
        
        if (percentage >= this.config.thresholds.emergency) {
            this.handleEmergencyMemory();
        } else if (percentage >= this.config.thresholds.critical) {
            this.handleCriticalMemory();
        } else if (percentage >= this.config.thresholds.warning) {
            this.handleWarningMemory();
        }
    }
    
    /**
     * Handle emergency memory situation
     */
    handleEmergencyMemory() {
        console.warn('🚨 EMERGENCY: Memory usage critical! Performing aggressive cleanup...');
        
        // Perform aggressive cleanup
        this.forceCleanup('emergency');
        
        // Disable non-essential features
        this.disableNonEssentialFeatures();
        
        // Emit warning to user
        this.emitMemoryWarning('emergency');
    }
    
    /**
     * Handle critical memory situation
     */
    handleCriticalMemory() {
        console.warn('⚠️  CRITICAL: Memory usage high! Performing cleanup...');
        
        // Perform cleanup
        this.forceCleanup('critical');
        
        // Reduce cache sizes
        this.reduceCacheSizes();
        
        // Emit warning
        this.emitMemoryWarning('critical');
    }
    
    /**
     * Handle warning memory situation
     */
    handleWarningMemory() {
        console.log('⚡ WARNING: Memory usage elevated. Optimizing...');
        
        // Perform gentle cleanup
        this.requestCleanup('warning');
        
        // Optimize caches
        this.optimizeCaches();
    }
    
    /**
     * Set up leak detection
     */
    setupLeakDetection() {
        // DOM node leak detection
        setInterval(() => {
            this.detectDOMLeaks();
        }, this.config.leakPatterns.domNodes.checkInterval);
        
        // Event listener leak detection
        setInterval(() => {
            this.detectListenerLeaks();
        }, 15000); // Check every 15 seconds
        
        // Timer leak detection
        setInterval(() => {
            this.detectTimerLeaks();
        }, 20000); // Check every 20 seconds
        
        // Memory trend analysis for general leaks
        setInterval(() => {
            this.detectMemoryLeaks();
        }, 60000); // Check every minute
    }
    
    /**
     * Detect DOM node leaks
     */
    detectDOMLeaks() {
        const currentNodeCount = document.querySelectorAll('*').length;
        const lastCheck = this.getLastMetric('domNodes');
        
        if (lastCheck && currentNodeCount - lastCheck > this.config.leakPatterns.domNodes.threshold) {
            console.warn(\`🔍 Potential DOM leak detected: \${currentNodeCount - lastCheck} nodes added\`);
            this.reportLeak('dom-nodes', {
                increase: currentNodeCount - lastCheck,
                current: currentNodeCount,
                previous: lastCheck
            });
        }
    }
    
    /**
     * Detect event listener leaks
     */
    detectListenerLeaks() {
        const currentListeners = this.trackedListeners.size;
        const threshold = this.config.leakPatterns.eventListeners.threshold;
        
        if (currentListeners > threshold) {
            console.warn(\`🔍 Potential listener leak: \${currentListeners} active listeners\`);
            
            // Analyze listener types
            const listenersByType = new Map();
            this.trackedListeners.forEach((info, element) => {
                info.types.forEach(type => {
                    listenersByType.set(type, (listenersByType.get(type) || 0) + 1);
                });
            });
            
            this.reportLeak('event-listeners', {
                total: currentListeners,
                byType: Object.fromEntries(listenersByType)
            });
        }
    }
    
    /**
     * Detect timer leaks
     */
    detectTimerLeaks() {
        const now = Date.now();
        const threshold = this.config.leakPatterns.timers;
        let longRunning = 0;
        
        this.trackedTimers.forEach((info, id) => {
            const age = now - info.created;
            if (age > threshold.maxAge) {
                longRunning++;
            }
        });
        
        if (this.trackedTimers.size > threshold.threshold || longRunning > 10) {
            console.warn(\`🔍 Potential timer leak: \${this.trackedTimers.size} active timers, \${longRunning} long-running\`);
            this.reportLeak('timers', {
                total: this.trackedTimers.size,
                longRunning: longRunning
            });
        }
    }
    
    /**
     * Detect general memory leaks through trend analysis
     */
    detectMemoryLeaks() {
        if (this.state.history.length < 10) return;
        
        const recent = this.state.history.slice(-10);
        const older = this.state.history.slice(-20, -10);
        
        if (older.length === 0) return;
        
        const recentAvg = recent.reduce((sum, m) => sum + m.memory.usedJSHeapSize, 0) / recent.length;
        const olderAvg = older.reduce((sum, m) => sum + m.memory.usedJSHeapSize, 0) / older.length;
        
        const increase = recentAvg - olderAvg;
        const increaseRate = increase / (this.config.monitoring.interval * 10 / 60000); // MB per minute
        
        if (increaseRate > this.config.monitoring.leakDetectionThreshold) {
            console.warn(\`🔍 Potential memory leak: \${increaseRate.toFixed(2)} MB/min increase\`);
            this.reportLeak('memory-trend', {
                increaseRate: increaseRate,
                recentAvg: recentAvg,
                olderAvg: olderAvg
            });
        }
    }
    
    /**
     * Instrument APIs for tracking
     */
    instrumentAPIs() {
        this.instrumentTimers();
        this.instrumentEventListeners();
        this.instrumentObservers();
        this.instrumentPromises();
    }
    
    /**
     * Instrument timer functions
     */
    instrumentTimers() {
        const originalSetTimeout = window.setTimeout;
        const originalSetInterval = window.setInterval;
        const originalClearTimeout = window.clearTimeout;
        const originalClearInterval = window.clearInterval;
        
        window.setTimeout = (callback, delay, ...args) => {
            const id = originalSetTimeout(callback, delay, ...args);
            this.trackedTimers.set(id, {
                type: 'timeout',
                created: Date.now(),
                delay: delay,
                stack: new Error().stack
            });
            return id;
        };
        
        window.setInterval = (callback, delay, ...args) => {
            const id = originalSetInterval(callback, delay, ...args);
            this.trackedTimers.set(id, {
                type: 'interval',
                created: Date.now(),
                delay: delay,
                stack: new Error().stack
            });
            return id;
        };
        
        window.clearTimeout = (id) => {
            this.trackedTimers.delete(id);
            return originalClearTimeout(id);
        };
        
        window.clearInterval = (id) => {
            this.trackedTimers.delete(id);
            return originalClearInterval(id);
        };
    }
    
    /**
     * Instrument event listeners
     */
    instrumentEventListeners() {
        const originalAddEventListener = Element.prototype.addEventListener;
        const originalRemoveEventListener = Element.prototype.removeEventListener;
        
        Element.prototype.addEventListener = function(type, listener, options) {
            // Track the listener
            if (!this._memoryManagerListeners) {
                this._memoryManagerListeners = new Set();
            }
            
            const listenerInfo = { type, listener, options, added: Date.now() };
            this._memoryManagerListeners.add(listenerInfo);
            
            // Update global tracking
            const element = this;
            if (!window.memoryManager.trackedListeners.has(element)) {
                window.memoryManager.trackedListeners.set(element, {
                    types: new Set(),
                    count: 0
                });
            }
            
            const info = window.memoryManager.trackedListeners.get(element);
            info.types.add(type);
            info.count++;
            
            return originalAddEventListener.call(this, type, listener, options);
        };
        
        Element.prototype.removeEventListener = function(type, listener, options) {
            // Untrack the listener
            if (this._memoryManagerListeners) {
                for (const listenerInfo of this._memoryManagerListeners) {
                    if (listenerInfo.type === type && listenerInfo.listener === listener) {
                        this._memoryManagerListeners.delete(listenerInfo);
                        break;
                    }
                }
            }
            
            // Update global tracking
            const info = window.memoryManager.trackedListeners.get(this);
            if (info) {
                info.count--;
                if (info.count <= 0) {
                    window.memoryManager.trackedListeners.delete(this);
                }
            }
            
            return originalRemoveEventListener.call(this, type, listener, options);
        };
    }
    
    /**
     * Instrument observers
     */
    instrumentObservers() {
        if ('IntersectionObserver' in window) {
            const OriginalIntersectionObserver = window.IntersectionObserver;
            window.IntersectionObserver = class extends OriginalIntersectionObserver {
                constructor(...args) {
                    super(...args);
                    window.memoryManager.trackedObservers.add(this);
                }
                
                disconnect() {
                    window.memoryManager.trackedObservers.delete(this);
                    return super.disconnect();
                }
            };
        }
        
        if ('MutationObserver' in window) {
            const OriginalMutationObserver = window.MutationObserver;
            window.MutationObserver = class extends OriginalMutationObserver {
                constructor(...args) {
                    super(...args);
                    window.memoryManager.trackedObservers.add(this);
                }
                
                disconnect() {
                    window.memoryManager.trackedObservers.delete(this);
                    return super.disconnect();
                }
            };
        }
    }
    
    /**
     * Instrument promises
     */
    instrumentPromises() {
        const originalPromise = window.Promise;
        const manager = this;
        
        window.Promise = class extends originalPromise {
            constructor(executor) {
                super(executor);
                manager.trackedPromises.add(this);
                
                // Auto-cleanup when promise settles
                this.finally(() => {
                    setTimeout(() => manager.trackedPromises.delete(this), 1000);
                });
            }
        };
        
        // Preserve static methods
        Object.setPrototypeOf(window.Promise, originalPromise);
        Object.assign(window.Promise, originalPromise);
    }
    
    /**
     * Set up automatic cleanup
     */
    setupAutomaticCleanup() {
        // Regular cleanup cycles
        setInterval(() => {
            this.performAutomaticCleanup();
        }, 30000); // Every 30 seconds
        
        // Cleanup on visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.performAutomaticCleanup();
            }
        });
        
        // Cleanup on memory pressure
        if ('memory' in performance) {
            setInterval(() => {
                const memory = performance.memory;
                const usage = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
                
                if (usage > 0.8) {
                    this.performAutomaticCleanup();
                }
            }, 10000);
        }
    }
    
    /**
     * Perform automatic cleanup
     */
    performAutomaticCleanup() {
        console.log('🧹 Performing automatic cleanup...');
        
        // Clean expired cache entries
        this.cleanExpiredCache();
        
        // Clean orphaned DOM references
        this.cleanOrphanedReferences();
        
        // Clean old history entries
        this.cleanOldHistory();
        
        // Force garbage collection hint
        if (window.gc && Math.random() < 0.1) { // 10% chance
            window.gc();
        }
    }
    
    /**
     * Clean expired cache entries
     */
    cleanExpiredCache() {
        const now = Date.now();
        
        // Clean search cache
        if (window.searchCache && typeof window.searchCache.clear === 'function') {
            const cacheSize = this.estimateObjectSize(window.searchCache);
            if (cacheSize > this.config.memoryLimits[this.state.deviceType].cache * 0.5) {
                window.searchCache.clear();
                console.log('🧹 Cleared search cache');
            }
        }
        
        // Clean chapter cache with TTL
        if (window.chapterCache && window.chapterCache instanceof Map) {
            for (const [key, entry] of window.chapterCache.entries()) {
                if (entry.expires && now > entry.expires) {
                    window.chapterCache.delete(key);
                }
            }
        }
    }
    
    /**
     * Clean orphaned DOM references
     */
    cleanOrphanedReferences() {
        // Clean up listeners on removed elements
        for (const [element, info] of this.trackedListeners.entries()) {
            if (!document.contains(element)) {
                this.trackedListeners.delete(element);
            }
        }
    }
    
    /**
     * Clean old history entries
     */
    cleanOldHistory() {
        const maxAge = 30 * 60 * 1000; // 30 minutes
        const now = Date.now();
        
        this.state.history = this.state.history.filter(entry => 
            now - entry.timestamp < maxAge
        );
    }
    
    /**
     * Set up page lifecycle handlers
     */
    setupPageLifecycleHandlers() {
        // Cleanup on page unload
        window.addEventListener('beforeunload', () => {
            this.performFullCleanup();
        });
        
        // Cleanup on navigation
        window.addEventListener('pagehide', () => {
            this.performFullCleanup();
        });
        
        // Reduce activity when page is hidden
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.reduceMemoryUsage();
            }
        });
    }
    
    /**
     * Public API methods
     */
    getCurrentUsage() {
        return {
            ...this.state.currentUsage,
            percentage: this.state.currentUsage.total / this.getMemoryLimit(),
            limit: this.getMemoryLimit(),
            deviceType: this.state.deviceType
        };
    }
    
    requestCleanup(priority = 'normal') {
        this.cleanupQueue.push({
            priority: priority,
            timestamp: Date.now(),
            type: 'requested'
        });
        
        this.processCleanupQueue();
    }
    
    forceCleanup(level = 'normal') {
        console.log(\`🧹 Force cleanup: \${level}\`);
        
        switch (level) {
            case 'emergency':
                this.performEmergencyCleanup();
                break;
            case 'critical':
                this.performCriticalCleanup();
                break;
            default:
                this.performNormalCleanup();
        }
    }
    
    trackObject(obj, metadata = {}) {
        this.trackedObjects.set(obj, {
            ...metadata,
            tracked: Date.now(),
            size: this.estimateObjectSize(obj)
        });
    }
    
    untrackObject(obj) {
        this.trackedObjects.delete(obj);
    }
    
    getMemoryReport() {
        return {
            current: this.getCurrentUsage(),
            history: this.state.history.slice(-20), // Last 20 measurements
            leaks: Array.from(this.state.leaks),
            tracking: {
                timers: this.trackedTimers.size,
                listeners: this.trackedListeners.size,
                observers: this.trackedObservers.size,
                promises: this.trackedPromises.size
            },
            recommendations: this.getOptimizationRecommendations()
        };
    }
    
    enableDetailedMonitoring(enabled = true) {
        if (enabled) {
            console.log('📊 Detailed memory monitoring enabled');
            // Increase monitoring frequency
            this.config.monitoring.interval = 1000;
            this.config.monitoring.detailedInterval = 5000;
        } else {
            // Restore normal frequency
            this.config.monitoring.interval = 5000;
            this.config.monitoring.detailedInterval = 30000;
        }
    }
    
    // Utility methods
    getLastMetric(type) {
        const last = this.state.history[this.state.history.length - 1];
        return last ? last[type] : null;
    }
    
    reportLeak(type, details) {
        const leak = {
            type: type,
            details: details,
            timestamp: Date.now(),
            stack: new Error().stack
        };
        
        this.state.leaks.add(leak);
        
        // Emit event for monitoring systems
        if (window.bibleExplorerDebug) {
            console.warn('🔍 Memory leak detected:', leak);
        }
        
        // Trigger cleanup for leak type
        this.cleanupLeakType(type);
    }
    
    cleanupLeakType(type) {
        switch (type) {
            case 'dom-nodes':
                this.cleanupDOMNodes();
                break;
            case 'event-listeners':
                this.cleanupEventListeners();
                break;
            case 'timers':
                this.cleanupTimers();
                break;
        }
    }
    
    cleanupDOMNodes() {
        // Remove hidden or detached nodes
        const elements = document.querySelectorAll('[style*="display: none"], [hidden]');
        elements.forEach(el => {
            if (!el.dataset.keepAlive) {
                el.remove();
            }
        });
    }
    
    cleanupEventListeners() {
        // Clean up listeners on elements that might be leaking
        this.trackedListeners.forEach((info, element) => {
            if (info.count > 10) { // Arbitrary threshold
                console.log(\`🧹 Cleaning up \${info.count} listeners on element\`);
                // This is aggressive - in practice, you'd be more selective
                element.removeEventListener = Element.prototype.removeEventListener;
            }
        });
    }
    
    cleanupTimers() {
        // Clear long-running timers
        const now = Date.now();
        this.trackedTimers.forEach((info, id) => {
            if (now - info.created > 300000) { // 5 minutes
                if (info.type === 'timeout') {
                    clearTimeout(id);
                } else {
                    clearInterval(id);
                }
                this.trackedTimers.delete(id);
            }
        });
    }
    
    getOptimizationRecommendations() {
        const recommendations = [];
        const usage = this.getCurrentUsage();
        
        if (usage.percentage > 0.8) {
            recommendations.push('Consider reducing cache sizes or clearing unused data');
        }
        
        if (this.trackedTimers.size > 50) {
            recommendations.push('High number of active timers detected - review for potential leaks');
        }
        
        if (this.trackedListeners.size > 100) {
            recommendations.push('High number of event listeners - ensure proper cleanup');
        }
        
        return recommendations;
    }
    
    // Cleanup implementations
    performEmergencyCleanup() {
        console.log('🚨 Emergency cleanup initiated');
        
        // Clear all caches
        if (window.caches) {
            caches.keys().then(names => {
                names.forEach(name => caches.delete(name));
            });
        }
        
        // Clear storage
        try {
            localStorage.clear();
            sessionStorage.clear();
        } catch (e) {
            console.warn('Could not clear storage:', e);
        }
        
        // Force garbage collection
        if (window.gc) window.gc();
        
        // Reload page as last resort
        setTimeout(() => {
            if (this.getCurrentUsage().percentage > 0.95) {
                window.location.reload();
            }
        }, 5000);
    }
    
    performCriticalCleanup() {
        console.log('⚠️ Critical cleanup initiated');
        
        // Reduce cache sizes by 50%
        this.reduceCacheSizes(0.5);
        
        // Clear old timers
        this.cleanupTimers();
        
        // Clean DOM
        this.cleanupDOMNodes();
        
        // Force GC hint
        if (window.gc) window.gc();
    }
    
    performNormalCleanup() {
        console.log('🧹 Normal cleanup initiated');
        
        // Standard cleanup procedures
        this.cleanExpiredCache();
        this.cleanOrphanedReferences();
        this.cleanOldHistory();
    }
    
    performFullCleanup() {
        console.log('🗑️ Full cleanup on page unload');
        
        // Clear all tracked items
        this.trackedTimers.clear();
        this.trackedListeners.clear();
        this.trackedObservers.clear();
        this.trackedPromises.clear();
        
        // Clear state
        this.state.history = [];
        this.state.leaks.clear();
        this.state.cleanupQueue = [];
    }
    
    reduceCacheSizes(factor = 0.7) {
        // Reduce various caches by the given factor
        if (window.searchCache && window.searchCache.clear) {
            const currentSize = this.estimateObjectSize(window.searchCache);
            if (currentSize > this.config.memoryLimits[this.state.deviceType].cache * factor) {
                window.searchCache.clear();
            }
        }
    }
    
    reduceMemoryUsage() {
        // Reduce memory usage when page is not visible
        this.performAutomaticCleanup();
        
        // Pause non-essential operations
        if (window.performanceMonitor) {
            window.performanceMonitor.pause();
        }
    }
    
    disableNonEssentialFeatures() {
        // Disable features that consume memory
        console.log('🔇 Disabling non-essential features to preserve memory');
        
        // Disable analytics
        if (window.analytics) {
            window.analytics.disable();
        }
        
        // Disable debug features
        if (window.debugDashboard) {
            window.debugDashboard.destroy();
        }
        
        // Reduce animation and visual effects
        document.documentElement.style.setProperty('--animation-duration', '0s');
    }
    
    emitMemoryWarning(level) {
        // Emit warning event for UI to display
        window.dispatchEvent(new CustomEvent('memory-warning', {
            detail: {
                level: level,
                usage: this.getCurrentUsage(),
                timestamp: Date.now()
            }
        }));
    }
    
    processCleanupQueue() {
        // Process queued cleanup requests
        this.cleanupQueue.sort((a, b) => {
            const priorities = { emergency: 4, critical: 3, high: 2, normal: 1 };
            return priorities[b.priority] - priorities[a.priority];
        });
        
        while (this.cleanupQueue.length > 0) {
            const cleanup = this.cleanupQueue.shift();
            this.forceCleanup(cleanup.priority);
        }
    }
    
    performDetailedAnalysis() {
        // Detailed memory analysis - only run periodically
        const report = this.getMemoryReport();
        
        if (window.bibleExplorerDebug) {
            console.group('📊 Detailed Memory Analysis');
            console.log('Current Usage:', report.current);
            console.log('Tracking Stats:', report.tracking);
            console.log('Recommendations:', report.recommendations);
            console.groupEnd();
        }
        
        // Store analysis results
        this.lastDetailedAnalysis = {
            timestamp: Date.now(),
            report: report
        };
    }
    
    generateMemoryReport() {
        // Generate comprehensive memory report
        const report = this.getMemoryReport();
        
        // Log summary
        console.log(\`🧠 Memory Report - Usage: \${(report.current.percentage * 100).toFixed(1)}% (\${Math.round(report.current.total / 1024 / 1024)}MB)\`);
        
        // Store report for external access
        this.lastReport = report;
        
        return report;
    }
}

// Initialize when DOM is ready
if (typeof window !== 'undefined') {
    window.MemoryManager = MemoryManager;
    
    document.addEventListener('DOMContentLoaded', () => {
        window.memoryManager = new MemoryManager();
        window.memoryManager.init();
    });
}

export default MemoryManager;
`;
  }

  /**
   * Generate memory profiler
   */
  generateMemoryProfiler() {
    return `/**
 * Memory Profiler - Advanced Memory Analysis Tool
 */

class MemoryProfiler {
    constructor() {
        this.sessions = [];
        this.currentSession = null;
        this.isRecording = false;
    }
    
    startProfiling(sessionName = 'default') {
        this.currentSession = {
            name: sessionName,
            startTime: Date.now(),
            snapshots: [],
            events: []
        };
        this.isRecording = true;
        
        this.takeSnapshot('start');
        console.log(\`📊 Memory profiling started: \${sessionName}\`);
    }
    
    stopProfiling() {
        if (!this.isRecording) return null;
        
        this.takeSnapshot('end');
        this.currentSession.endTime = Date.now();
        this.currentSession.duration = this.currentSession.endTime - this.currentSession.startTime;
        
        this.sessions.push(this.currentSession);
        this.isRecording = false;
        
        const report = this.analyzeSession(this.currentSession);
        console.log(\`📊 Memory profiling completed: \${this.currentSession.name}\`);
        
        return report;
    }
    
    takeSnapshot(label = 'snapshot') {
        if (!this.isRecording) return;
        
        const snapshot = {
            label: label,
            timestamp: Date.now(),
            memory: window.memoryManager ? window.memoryManager.getCurrentUsage() : null,
            dom: this.getDOMSnapshot(),
            heap: this.getHeapSnapshot()
        };
        
        this.currentSession.snapshots.push(snapshot);
        return snapshot;
    }
    
    recordEvent(type, data) {
        if (!this.isRecording) return;
        
        this.currentSession.events.push({
            type: type,
            data: data,
            timestamp: Date.now()
        });
    }
    
    getDOMSnapshot() {
        return {
            elements: document.querySelectorAll('*').length,
            textNodes: this.countNodes(NodeFilter.SHOW_TEXT),
            commentNodes: this.countNodes(NodeFilter.SHOW_COMMENT)
        };
    }
    
    getHeapSnapshot() {
        if (performance.memory) {
            return {
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize,
                limit: performance.memory.jsHeapSizeLimit
            };
        }
        return null;
    }
    
    countNodes(type) {
        let count = 0;
        const walker = document.createTreeWalker(document, type);
        while (walker.nextNode()) count++;
        return count;
    }
    
    analyzeSession(session) {
        const start = session.snapshots[0];
        const end = session.snapshots[session.snapshots.length - 1];
        
        return {
            session: session.name,
            duration: session.duration,
            memoryDelta: end.memory ? end.memory.total - start.memory.total : null,
            domGrowth: end.dom.elements - start.dom.elements,
            peakUsage: Math.max(...session.snapshots.map(s => s.memory ? s.memory.total : 0)),
            recommendations: this.generateRecommendations(session)
        };
    }
    
    generateRecommendations(session) {
        const recommendations = [];
        
        // Analyze memory growth
        const growth = this.analyzeGrowth(session);
        if (growth.rate > 1024 * 1024) { // 1MB per second
            recommendations.push('High memory growth rate detected - check for leaks');
        }
        
        return recommendations;
    }
    
    analyzeGrowth(session) {
        const snapshots = session.snapshots.filter(s => s.memory);
        if (snapshots.length < 2) return { rate: 0 };
        
        const first = snapshots[0];
        const last = snapshots[snapshots.length - 1];
        const timeDiff = (last.timestamp - first.timestamp) / 1000; // seconds
        const memoryDiff = last.memory.total - first.memory.total;
        
        return {
            rate: memoryDiff / timeDiff,
            total: memoryDiff,
            duration: timeDiff
        };
    }
}

export default MemoryProfiler;
`;
  }

  /**
   * Generate cleanup utilities
   */
  generateCleanupUtilities() {
    return `/**
 * Cleanup Utilities - Helper functions for memory management
 */

class CleanupUtils {
    static createCleanupManager() {
        return new CleanupManager();
    }
    
    static cleanupEventListeners(element) {
        if (element._memoryManagerListeners) {
            element._memoryManagerListeners.forEach(listener => {
                element.removeEventListener(listener.type, listener.listener, listener.options);
            });
            element._memoryManagerListeners.clear();
        }
    }
    
    static cleanupTimers(timers) {
        if (Array.isArray(timers)) {
            timers.forEach(id => {
                clearTimeout(id);
                clearInterval(id);
            });
        }
    }
    
    static cleanupObservers(observers) {
        if (Array.isArray(observers)) {
            observers.forEach(observer => {
                if (observer && observer.disconnect) {
                    observer.disconnect();
                }
            });
        }
    }
    
    static nullifyReferences(obj) {
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                obj[key] = null;
            }
        }
    }
    
    static createWeakCache(maxSize = 100) {
        return new WeakLRUCache(maxSize);
    }
}

class CleanupManager {
    constructor() {
        this.cleanupTasks = [];
        this.isDestroyed = false;
    }
    
    addCleanupTask(task) {
        if (this.isDestroyed) return;
        this.cleanupTasks.push(task);
    }
    
    cleanup() {
        this.cleanupTasks.forEach(task => {
            try {
                if (typeof task === 'function') {
                    task();
                }
            } catch (error) {
                console.error('Cleanup task failed:', error);
            }
        });
        
        this.cleanupTasks = [];
        this.isDestroyed = true;
    }
}

class WeakLRUCache {
    constructor(maxSize) {
        this.maxSize = maxSize;
        this.cache = new Map();
        this.usage = new Map();
        this.counter = 0;
    }
    
    get(key) {
        if (this.cache.has(key)) {
            this.usage.set(key, ++this.counter);
            return this.cache.get(key);
        }
        return null;
    }
    
    set(key, value) {
        if (this.cache.size >= this.maxSize) {
            this.evictLeastUsed();
        }
        
        this.cache.set(key, value);
        this.usage.set(key, ++this.counter);
    }
    
    evictLeastUsed() {
        let leastUsedKey = null;
        let leastUsedCount = Infinity;
        
        for (const [key, count] of this.usage.entries()) {
            if (count < leastUsedCount) {
                leastUsedCount = count;
                leastUsedKey = key;
            }
        }
        
        if (leastUsedKey) {
            this.cache.delete(leastUsedKey);
            this.usage.delete(leastUsedKey);
        }
    }
}

export { CleanupUtils, CleanupManager, WeakLRUCache };
`;
  }

  /**
   * Generate monitoring dashboard
   */
  generateMonitoringDashboard() {
    return `/**
 * Memory Monitoring Dashboard - Real-time memory usage visualization
 */

class MemoryDashboard {
    constructor() {
        this.isVisible = false;
        this.updateInterval = null;
        this.charts = new Map();
    }
    
    show() {
        if (this.isVisible) return;
        
        this.createDashboard();
        this.startUpdating();
        this.isVisible = true;
    }
    
    hide() {
        if (!this.isVisible) return;
        
        this.stopUpdating();
        this.removeDashboard();
        this.isVisible = false;
    }
    
    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }
    
    createDashboard() {
        const dashboard = document.createElement('div');
        dashboard.id = 'memory-dashboard';
        dashboard.innerHTML = \`
            <div class="dashboard-header">
                <h3>Memory Monitor</h3>
                <button class="close-btn">&times;</button>
            </div>
            <div class="dashboard-content">
                <div class="memory-overview">
                    <div class="metric">
                        <label>Total Usage:</label>
                        <span id="total-usage">--</span>
                    </div>
                    <div class="metric">
                        <label>Cache:</label>
                        <span id="cache-usage">--</span>
                    </div>
                    <div class="metric">
                        <label>DOM:</label>
                        <span id="dom-usage">--</span>
                    </div>
                </div>
                <div class="memory-chart" id="memory-chart"></div>
                <div class="tracking-stats">
                    <div class="stat">
                        <label>Timers:</label>
                        <span id="timer-count">--</span>
                    </div>
                    <div class="stat">
                        <label>Listeners:</label>
                        <span id="listener-count">--</span>
                    </div>
                    <div class="stat">
                        <label>Observers:</label>
                        <span id="observer-count">--</span>
                    </div>
                </div>
                <div class="recommendations" id="recommendations"></div>
            </div>
        \`;
        
        // Add styles
        dashboard.style.cssText = \`
            position: fixed;
            top: 20px;
            right: 20px;
            width: 400px;
            max-height: 600px;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            border-radius: 8px;
            padding: 16px;
            font-family: monospace;
            font-size: 12px;
            z-index: 10000;
            overflow-y: auto;
        \`;
        
        // Add event listeners
        dashboard.querySelector('.close-btn').addEventListener('click', () => {
            this.hide();
        });
        
        document.body.appendChild(dashboard);
        this.dashboard = dashboard;
    }
    
    removeDashboard() {
        if (this.dashboard) {
            this.dashboard.remove();
            this.dashboard = null;
        }
    }
    
    startUpdating() {
        this.updateInterval = setInterval(() => {
            this.updateDisplay();
        }, 1000);
    }
    
    stopUpdating() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }
    
    updateDisplay() {
        if (!window.memoryManager || !this.dashboard) return;
        
        const usage = window.memoryManager.getCurrentUsage();
        const report = window.memoryManager.getMemoryReport();
        
        // Update overview
        this.dashboard.querySelector('#total-usage').textContent = 
            \`\${(usage.total / 1024 / 1024).toFixed(1)} MB (\${(usage.percentage * 100).toFixed(1)}%)\`;
        
        this.dashboard.querySelector('#cache-usage').textContent = 
            \`\${(usage.cache / 1024 / 1024).toFixed(1)} MB\`;
        
        this.dashboard.querySelector('#dom-usage').textContent = 
            \`\${(usage.dom / 1024 / 1024).toFixed(1)} MB\`;
        
        // Update tracking stats
        this.dashboard.querySelector('#timer-count').textContent = report.tracking.timers;
        this.dashboard.querySelector('#listener-count').textContent = report.tracking.listeners;
        this.dashboard.querySelector('#observer-count').textContent = report.tracking.observers;
        
        // Update recommendations
        const recommendationsEl = this.dashboard.querySelector('#recommendations');
        recommendationsEl.innerHTML = report.recommendations.map(rec => 
            \`<div class="recommendation">⚠️ \${rec}</div>\`
        ).join('');
        
        // Update memory chart (simplified)
        this.updateMemoryChart(report.history);
    }
    
    updateMemoryChart(history) {
        const chartEl = this.dashboard.querySelector('#memory-chart');
        if (!chartEl) return;
        
        const recent = history.slice(-20); // Last 20 data points
        if (recent.length === 0) return;
        
        const max = Math.max(...recent.map(h => h.memory.usedJSHeapSize || 0));
        const points = recent.map((h, i) => {
            const x = (i / (recent.length - 1)) * 100;
            const y = 100 - ((h.memory.usedJSHeapSize || 0) / max) * 100;
            return \`\${x},\${y}\`;
        }).join(' ');
        
        chartEl.innerHTML = \`
            <svg width="100%" height="100" viewBox="0 0 100 100" style="border: 1px solid #333;">
                <polyline points="\${points}" fill="none" stroke="#4CAF50" stroke-width="2"/>
            </svg>
        \`;
    }
}

// Global access
window.memoryDashboard = new MemoryDashboard();

// Keyboard shortcut to toggle dashboard
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'M') {
        window.memoryDashboard.toggle();
    }
});

export default MemoryDashboard;
`;
  }

  /**
   * Write script to file
   */
  async writeScript(script, filePath) {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(filePath, script, 'utf8');
  }
}

// Export for build integration
module.exports = MemoryManager;

// Run if called directly
if (require.main === module) {
  const memoryManager = new MemoryManager();
  memoryManager
    .generateMemoryManagementSystem()
    .then(() => {
      console.log('✅ Advanced memory management system generated');
    })
    .catch(error => {
      console.error('❌ Failed to generate memory management system:', error);
      process.exit(1);
    });
}
