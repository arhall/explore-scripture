/**
 * Intelligent Resource Prioritization System
 * Dynamically adjusts resource loading priorities based on user behavior, 
 * device capabilities, network conditions, and real-time performance metrics.
 */

const fs = require('fs');
const path = require('path');

class ResourcePrioritizer {
    constructor() {
        this.config = {
            // Resource categories with base priorities
            resourceTypes: {
                'critical-css': {
                    basePriority: 100,
                    loadStrategy: 'blocking',
                    timeout: 5000,
                    fallback: 'inline-css'
                },
                'navigation-js': {
                    basePriority: 95,
                    loadStrategy: 'blocking',
                    timeout: 3000,
                    fallback: 'basic-navigation'
                },
                'chapter-reader': {
                    basePriority: 80,
                    loadStrategy: 'lazy',
                    timeout: 5000,
                    fallback: 'text-fallback'
                },
                'search-engine': {
                    basePriority: 75,
                    loadStrategy: 'deferred',
                    timeout: 8000,
                    fallback: 'basic-search'
                },
                'commentary-system': {
                    basePriority: 60,
                    loadStrategy: 'on-demand',
                    timeout: 10000,
                    fallback: 'external-links'
                },
                'theme-system': {
                    basePriority: 90,
                    loadStrategy: 'immediate',
                    timeout: 2000,
                    fallback: 'default-theme'
                },
                'analytics': {
                    basePriority: 20,
                    loadStrategy: 'background',
                    timeout: 15000,
                    fallback: 'none'
                },
                'social-features': {
                    basePriority: 30,
                    loadStrategy: 'background',
                    timeout: 20000,
                    fallback: 'none'
                }
            },
            
            // Priority adjustment factors
            adjustmentFactors: {
                // Network-based adjustments
                network: {
                    '4g': { multiplier: 1.0, maxConcurrent: 6, chunkSize: '1MB' },
                    '3g': { multiplier: 0.7, maxConcurrent: 4, chunkSize: '500KB' },
                    '2g': { multiplier: 0.3, maxConcurrent: 2, chunkSize: '200KB' },
                    'slow-2g': { multiplier: 0.1, maxConcurrent: 1, chunkSize: '100KB' },
                    'offline': { multiplier: 0.0, maxConcurrent: 0, chunkSize: '0KB' }
                },
                
                // Device-based adjustments
                device: {
                    desktop: { 
                        multiplier: 1.0, 
                        memoryLimit: '100MB',
                        cpuIntensive: true,
                        parallelLoading: 8
                    },
                    tablet: { 
                        multiplier: 0.8, 
                        memoryLimit: '60MB',
                        cpuIntensive: true,
                        parallelLoading: 6
                    },
                    mobile: { 
                        multiplier: 0.6, 
                        memoryLimit: '40MB',
                        cpuIntensive: false,
                        parallelLoading: 4
                    },
                    'low-end': { 
                        multiplier: 0.3, 
                        memoryLimit: '20MB',
                        cpuIntensive: false,
                        parallelLoading: 2
                    }
                },
                
                // Usage pattern adjustments
                usage: {
                    'first-time': { 
                        criticalBoost: 1.2,
                        experienceBoost: 0.8,
                        guidanceBoost: 1.5
                    },
                    'returning': { 
                        criticalBoost: 1.0,
                        experienceBoost: 1.1,
                        guidanceBoost: 0.9
                    },
                    'power-user': { 
                        criticalBoost: 0.9,
                        experienceBoost: 1.3,
                        guidanceBoost: 0.7
                    },
                    'casual': { 
                        criticalBoost: 1.1,
                        experienceBoost: 0.9,
                        guidanceBoost: 1.0
                    }
                },
                
                // Time-based adjustments
                temporal: {
                    'peak-hours': { multiplier: 0.8, description: '7-9 AM, 7-10 PM' },
                    'off-hours': { multiplier: 1.2, description: '10 PM - 7 AM' },
                    'weekend': { multiplier: 1.1, description: 'Saturday-Sunday' },
                    'holidays': { multiplier: 0.9, description: 'Religious holidays' }
                }
            },
            
            // Performance budgets by priority level
            performanceBudgets: {
                critical: {
                    loadTime: '1s',
                    size: '100KB',
                    requests: 5,
                    renderBlocking: true
                },
                high: {
                    loadTime: '2s',
                    size: '300KB',
                    requests: 10,
                    renderBlocking: false
                },
                medium: {
                    loadTime: '5s',
                    size: '800KB',
                    requests: 20,
                    renderBlocking: false
                },
                low: {
                    loadTime: '10s',
                    size: '2MB',
                    requests: 50,
                    renderBlocking: false
                }
            }
        };
        
        this.analytics = {
            loadTimes: new Map(),
            failureRates: new Map(),
            userPatterns: new Map(),
            resourceUsage: new Map()
        };
        
        this.currentContext = {
            network: '4g',
            device: 'desktop',
            userType: 'returning',
            timeContext: 'off-hours',
            pageType: 'home',
            batteryLevel: 1.0,
            memoryPressure: 'normal'
        };
    }
    
    /**
     * Generate intelligent resource prioritization system
     */
    async generatePrioritizationSystem() {
        // Create prioritization client script
        const clientScript = await this.generateClientScript();
        
        // Generate resource manifest
        const manifest = this.generateResourceManifest();
        
        // Create performance budgets
        const budgets = this.generatePerformanceBudgets();
        
        // Generate adaptation strategies
        const strategies = this.generateAdaptationStrategies();
        
        // Write client implementation
        const outputPath = path.join(__dirname, '..', 'src', 'assets', 'resource-prioritizer.js');
        await this.writeClientScript(clientScript, outputPath);
        
        // Write resource manifest
        const manifestPath = path.join(__dirname, '..', 'src', 'assets', 'data', 'resource-manifest.json');
        fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
        
        console.log('✅ Intelligent resource prioritization system generated');
        
        return {
            clientScript,
            manifest,
            budgets,
            strategies
        };
    }
    
    /**
     * Generate client-side prioritization script
     */
    async generateClientScript() {
        return `/**
 * Intelligent Resource Prioritizer - Client Implementation
 * Auto-generated by resource-prioritizer.js
 */

class ResourcePrioritizer {
    constructor() {
        this.config = ${JSON.stringify(this.config, null, 2)};
        this.loadQueue = new PriorityQueue();
        this.loadingResources = new Map();
        this.completedResources = new Map();
        this.failedResources = new Map();
        this.analytics = {
            loadTimes: new Map(),
            networkMetrics: new Map(),
            userInteractions: new Map()
        };
        
        // Device and network detection
        this.deviceInfo = this.detectDevice();
        this.networkInfo = this.detectNetwork();
        this.userContext = this.analyzeUserContext();
        
        // Performance observers
        this.performanceObserver = null;
        this.resourceObserver = null;
        
        console.log('🎯 Resource Prioritizer initialized');
        console.log('📱 Device:', this.deviceInfo);
        console.log('📶 Network:', this.networkInfo);
        console.log('👤 User Context:', this.userContext);
    }
    
    /**
     * Initialize the prioritizer
     */
    init() {
        // Set up performance monitoring
        this.setupPerformanceMonitoring();
        
        // Set up network monitoring
        this.setupNetworkMonitoring();
        
        // Set up user behavior tracking
        this.setupUserBehaviorTracking();
        
        // Start adaptive loading
        this.startAdaptiveLoading();
        
        // Export public API
        window.ResourcePrioritizer = {
            prioritize: this.prioritizeResource.bind(this),
            loadResource: this.loadResource.bind(this),
            getLoadingStatus: this.getLoadingStatus.bind(this),
            updateContext: this.updateContext.bind(this),
            getRecommendations: this.getLoadingRecommendations.bind(this)
        };
    }
    
    /**
     * Detect device capabilities
     */
    detectDevice() {
        const info = {
            type: 'desktop',
            memory: navigator.deviceMemory || 4,
            cores: navigator.hardwareConcurrency || 4,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            pixelRatio: window.devicePixelRatio || 1,
            touch: 'ontouchstart' in window
        };
        
        // Classify device type
        if (info.touch && info.viewport.width < 768) {
            info.type = info.memory < 2 ? 'low-end' : 'mobile';
        } else if (info.touch && info.viewport.width < 1024) {
            info.type = 'tablet';
        }
        
        // Detect specific constraints
        info.constraints = {
            lowMemory: info.memory < 2,
            slowCPU: info.cores < 4,
            smallScreen: info.viewport.width < 768,
            highDPI: info.pixelRatio > 1.5
        };
        
        return info;
    }
    
    /**
     * Detect network conditions
     */
    detectNetwork() {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        
        const info = {
            effectiveType: connection?.effectiveType || '4g',
            downlink: connection?.downlink || 10,
            rtt: connection?.rtt || 100,
            saveData: connection?.saveData || false,
            type: connection?.type || 'unknown'
        };
        
        // Classify network quality
        if (info.downlink < 0.5 || info.rtt > 2000) {
            info.quality = 'poor';
        } else if (info.downlink < 1.5 || info.rtt > 1000) {
            info.quality = 'moderate';
        } else if (info.downlink > 5 && info.rtt < 200) {
            info.quality = 'excellent';
        } else {
            info.quality = 'good';
        }
        
        return info;
    }
    
    /**
     * Analyze user context
     */
    analyzeUserContext() {
        const visits = parseInt(localStorage.getItem('bible-explorer-visits') || '0');
        const lastVisit = localStorage.getItem('bible-explorer-last-visit');
        const preferences = JSON.parse(localStorage.getItem('bible-explorer-preferences') || '{}');
        
        return {
            userType: this.classifyUserType(visits, lastVisit, preferences),
            visitCount: visits,
            isReturning: visits > 1,
            hasPreferences: Object.keys(preferences).length > 0,
            timeContext: this.getTimeContext(),
            batteryStatus: this.getBatteryStatus()
        };
    }
    
    /**
     * Classify user type based on behavior
     */
    classifyUserType(visits, lastVisit, preferences) {
        if (visits === 0) return 'first-time';
        if (visits < 5) return 'casual';
        
        const daysSinceLastVisit = lastVisit ? 
            (Date.now() - new Date(lastVisit).getTime()) / (1000 * 60 * 60 * 24) : 0;
        
        if (visits > 20 && daysSinceLastVisit < 7) return 'power-user';
        return 'returning';
    }
    
    /**
     * Get current time context
     */
    getTimeContext() {
        const hour = new Date().getHours();
        const day = new Date().getDay();
        
        if (day === 0 || day === 6) return 'weekend';
        if ((hour >= 7 && hour <= 9) || (hour >= 19 && hour <= 22)) return 'peak-hours';
        if (hour >= 22 || hour <= 7) return 'off-hours';
        return 'normal-hours';
    }
    
    /**
     * Get battery status
     */
    getBatteryStatus() {
        if ('getBattery' in navigator) {
            navigator.getBattery().then(battery => {
                this.userContext.batteryLevel = battery.level;
                this.userContext.isCharging = battery.charging;
            });
        }
        return { level: 1.0, charging: true };
    }
    
    /**
     * Set up performance monitoring
     */
    setupPerformanceMonitoring() {
        // Resource timing observer
        if ('PerformanceObserver' in window) {
            this.resourceObserver = new PerformanceObserver((list) => {
                list.getEntries().forEach(entry => {
                    this.recordResourceMetrics(entry);
                });
            });
            
            this.resourceObserver.observe({ entryTypes: ['resource'] });
            
            // Navigation timing observer
            this.performanceObserver = new PerformanceObserver((list) => {
                list.getEntries().forEach(entry => {
                    this.recordNavigationMetrics(entry);
                });
            });
            
            this.performanceObserver.observe({ entryTypes: ['navigation'] });
        }
        
        // Core Web Vitals
        this.observeCoreWebVitals();
    }
    
    /**
     * Set up network monitoring
     */
    setupNetworkMonitoring() {
        if ('connection' in navigator) {
            const connection = navigator.connection;
            
            const updateNetworkInfo = () => {
                this.networkInfo = this.detectNetwork();
                this.adaptToNetworkChange();
            };
            
            connection.addEventListener('change', updateNetworkInfo);
        }
        
        // Monitor online/offline status
        window.addEventListener('online', () => {
            this.handleConnectionChange(true);
        });
        
        window.addEventListener('offline', () => {
            this.handleConnectionChange(false);
        });
    }
    
    /**
     * Set up user behavior tracking
     */
    setupUserBehaviorTracking() {
        // Track page engagement
        let pageStartTime = Date.now();
        let interactionCount = 0;
        
        ['click', 'touch', 'keydown', 'scroll'].forEach(event => {
            document.addEventListener(event, () => {
                interactionCount++;
                this.recordUserInteraction(event);
            });
        });
        
        // Track page visibility
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                const engagementTime = Date.now() - pageStartTime;
                this.recordEngagement(engagementTime, interactionCount);
            } else {
                pageStartTime = Date.now();
                interactionCount = 0;
            }
        });
    }
    
    /**
     * Prioritize resource loading
     */
    prioritizeResource(resourceType, url, options = {}) {
        const baseConfig = this.config.resourceTypes[resourceType];
        if (!baseConfig) {
            console.warn(\`Unknown resource type: \${resourceType}\`);
            return 50; // Default priority
        }
        
        // Calculate dynamic priority
        let priority = baseConfig.basePriority;
        
        // Apply network adjustments
        const networkAdjustment = this.config.adjustmentFactors.network[this.networkInfo.effectiveType];
        priority *= networkAdjustment?.multiplier || 1.0;
        
        // Apply device adjustments
        const deviceAdjustment = this.config.adjustmentFactors.device[this.deviceInfo.type];
        priority *= deviceAdjustment?.multiplier || 1.0;
        
        // Apply usage pattern adjustments
        const usageAdjustment = this.config.adjustmentFactors.usage[this.userContext.userType];
        if (baseConfig.category === 'critical') {
            priority *= usageAdjustment?.criticalBoost || 1.0;
        } else if (baseConfig.category === 'experience') {
            priority *= usageAdjustment?.experienceBoost || 1.0;
        }
        
        // Apply temporal adjustments
        const temporalAdjustment = this.config.adjustmentFactors.temporal[this.userContext.timeContext];
        priority *= temporalAdjustment?.multiplier || 1.0;
        
        // Apply battery and memory constraints
        if (this.userContext.batteryLevel < 0.2 && !this.userContext.isCharging) {
            priority *= 0.5; // Reduce priority on low battery
        }
        
        if (this.deviceInfo.memory < 2) {
            priority *= 0.7; // Reduce priority on low memory devices
        }
        
        // Apply save-data preference
        if (this.networkInfo.saveData && baseConfig.category !== 'critical') {
            priority *= 0.3;
        }
        
        // Store prioritized resource
        const prioritizedResource = {
            type: resourceType,
            url: url,
            priority: Math.round(priority),
            config: baseConfig,
            options: options,
            timestamp: Date.now()
        };
        
        this.loadQueue.enqueue(prioritizedResource, priority);
        
        console.log(\`📊 Prioritized \${resourceType}: \${Math.round(priority)} (base: \${baseConfig.basePriority})\`);
        
        return priority;
    }
    
    /**
     * Load resource with adaptive strategy
     */
    async loadResource(resourceType, url, options = {}) {
        const priority = this.prioritizeResource(resourceType, url, options);
        const resource = this.loadQueue.peek();
        
        if (!resource) return null;
        
        try {
            this.loadingResources.set(url, {
                startTime: Date.now(),
                type: resourceType,
                priority: priority
            });
            
            // Choose loading strategy based on priority and context
            const strategy = this.selectLoadingStrategy(resource);
            const result = await this.executeLoadingStrategy(strategy, resource);
            
            // Record successful load
            this.recordSuccessfulLoad(url, resourceType, Date.now() - this.loadingResources.get(url).startTime);
            this.completedResources.set(url, result);
            this.loadingResources.delete(url);
            
            return result;
            
        } catch (error) {
            console.error(\`Failed to load \${resourceType} from \${url}:\`, error);
            
            // Record failure and attempt fallback
            this.recordFailedLoad(url, resourceType, error);
            this.loadingResources.delete(url);
            
            const fallback = await this.handleLoadFailure(resource, error);
            return fallback;
        }
    }
    
    /**
     * Select optimal loading strategy
     */
    selectLoadingStrategy(resource) {
        const { config, priority, type } = resource;
        
        // High priority resources use aggressive strategies
        if (priority > 90) {
            return {
                method: 'fetch',
                priority: 'high',
                timeout: config.timeout,
                retries: 2,
                preload: true
            };
        }
        
        // Medium priority resources use balanced strategies
        if (priority > 60) {
            return {
                method: 'fetch',
                priority: 'medium',
                timeout: config.timeout * 1.5,
                retries: 1,
                preload: false
            };
        }
        
        // Low priority resources use conservative strategies
        return {
            method: 'lazy',
            priority: 'low',
            timeout: config.timeout * 2,
            retries: 0,
            preload: false
        };
    }
    
    /**
     * Execute loading strategy
     */
    async executeLoadingStrategy(strategy, resource) {
        const { url, options } = resource;
        
        switch (strategy.method) {
            case 'fetch':
                return await this.fetchWithStrategy(url, strategy, options);
            case 'lazy':
                return await this.lazyLoadWithStrategy(url, strategy, options);
            case 'preload':
                return await this.preloadWithStrategy(url, strategy, options);
            default:
                throw new Error(\`Unknown loading strategy: \${strategy.method}\`);
        }
    }
    
    /**
     * Fetch resource with specific strategy
     */
    async fetchWithStrategy(url, strategy, options) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), strategy.timeout);
        
        try {
            const fetchOptions = {
                ...options,
                signal: controller.signal,
                priority: strategy.priority
            };
            
            const response = await fetch(url, fetchOptions);
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
            }
            
            return await response.text();
            
        } catch (error) {
            clearTimeout(timeoutId);
            
            if (strategy.retries > 0) {
                console.log(\`🔄 Retrying load of \${url} (\${strategy.retries} retries left)\`);
                strategy.retries--;
                return await this.fetchWithStrategy(url, strategy, options);
            }
            
            throw error;
        }
    }
    
    /**
     * Lazy load with intersection observer
     */
    async lazyLoadWithStrategy(url, strategy, options) {
        return new Promise((resolve, reject) => {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        observer.disconnect();
                        this.fetchWithStrategy(url, { ...strategy, method: 'fetch' }, options)
                            .then(resolve)
                            .catch(reject);
                    }
                });
            });
            
            // Find target element or create trigger
            const target = document.querySelector(options.trigger) || 
                           document.querySelector('[data-lazy-load]') ||
                           document.body;
            
            observer.observe(target);
        });
    }
    
    /**
     * Preload resource
     */
    async preloadWithStrategy(url, strategy, options) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = url;
        link.as = options.as || 'fetch';
        
        if (strategy.priority) {
            link.fetchpriority = strategy.priority;
        }
        
        document.head.appendChild(link);
        
        // Still fetch normally
        return await this.fetchWithStrategy(url, strategy, options);
    }
    
    /**
     * Handle load failure with fallbacks
     */
    async handleLoadFailure(resource, error) {
        const { config, type } = resource;
        
        console.log(\`🔄 Attempting fallback for \${type}...\`);
        
        switch (config.fallback) {
            case 'inline-css':
                return this.getInlineCSSFallback();
            case 'basic-navigation':
                return this.getBasicNavigationFallback();
            case 'text-fallback':
                return this.getTextFallback();
            case 'external-links':
                return this.getExternalLinksFallback();
            case 'none':
                return null;
            default:
                console.warn(\`No fallback available for \${type}\`);
                return null;
        }
    }
    
    /**
     * Get loading status and recommendations
     */
    getLoadingStatus() {
        return {
            queued: this.loadQueue.size(),
            loading: this.loadingResources.size,
            completed: this.completedResources.size,
            failed: this.failedResources.size,
            networkStatus: this.networkInfo,
            deviceStatus: this.deviceInfo,
            recommendations: this.getLoadingRecommendations()
        };
    }
    
    /**
     * Get loading recommendations
     */
    getLoadingRecommendations() {
        const recommendations = [];
        
        // Network-based recommendations
        if (this.networkInfo.quality === 'poor') {
            recommendations.push({
                type: 'network',
                message: 'Poor network detected. Consider enabling data saver mode.',
                action: 'enable-data-saver'
            });
        }
        
        // Device-based recommendations
        if (this.deviceInfo.constraints.lowMemory) {
            recommendations.push({
                type: 'memory',
                message: 'Low memory device detected. Reducing feature set.',
                action: 'reduce-features'
            });
        }
        
        // Battery-based recommendations
        if (this.userContext.batteryLevel < 0.3) {
            recommendations.push({
                type: 'battery',
                message: 'Low battery detected. Reducing background activity.',
                action: 'reduce-background-activity'
            });
        }
        
        return recommendations;
    }
    
    /**
     * Start adaptive loading system
     */
    startAdaptiveLoading() {
        // Process load queue periodically
        setInterval(() => {
            this.processLoadQueue();
        }, 100);
        
        // Adapt to changing conditions
        setInterval(() => {
            this.adaptToCurrentConditions();
        }, 5000);
        
        // Update analytics
        setInterval(() => {
            this.updateAnalytics();
        }, 10000);
    }
    
    /**
     * Process the load queue
     */
    processLoadQueue() {
        const maxConcurrent = this.getMaxConcurrentLoads();
        
        while (this.loadingResources.size < maxConcurrent && !this.loadQueue.isEmpty()) {
            const resource = this.loadQueue.dequeue();
            if (resource) {
                this.loadResource(resource.type, resource.url, resource.options);
            }
        }
    }
    
    /**
     * Get maximum concurrent loads based on current conditions
     */
    getMaxConcurrentLoads() {
        const networkLimit = this.config.adjustmentFactors.network[this.networkInfo.effectiveType]?.maxConcurrent || 4;
        const deviceLimit = this.config.adjustmentFactors.device[this.deviceInfo.type]?.parallelLoading || 4;
        
        return Math.min(networkLimit, deviceLimit);
    }
    
    /**
     * Adapt to changing conditions
     */
    adaptToCurrentConditions() {
        // Re-detect network conditions
        const newNetworkInfo = this.detectNetwork();
        if (newNetworkInfo.effectiveType !== this.networkInfo.effectiveType) {
            console.log(\`📶 Network change detected: \${this.networkInfo.effectiveType} → \${newNetworkInfo.effectiveType}\`);
            this.networkInfo = newNetworkInfo;
            this.reprioritizeQueue();
        }
        
        // Check memory pressure
        if ('memory' in performance) {
            const memoryInfo = performance.memory;
            const memoryUsage = memoryInfo.usedJSHeapSize / memoryInfo.totalJSHeapSize;
            
            if (memoryUsage > 0.8) {
                console.log('🧠 High memory usage detected, reducing load queue');
                this.reduceLoadQueue();
            }
        }
    }
    
    /**
     * Record performance metrics
     */
    recordResourceMetrics(entry) {
        const resourceType = this.inferResourceType(entry.name);
        
        this.analytics.loadTimes.set(entry.name, {
            duration: entry.duration,
            size: entry.transferSize,
            type: resourceType,
            timestamp: entry.startTime
        });
    }
    
    /**
     * Update analytics and learning
     */
    updateAnalytics() {
        // Calculate average load times by resource type
        const loadTimesByType = new Map();
        
        this.analytics.loadTimes.forEach((metrics, url) => {
            if (!loadTimesByType.has(metrics.type)) {
                loadTimesByType.set(metrics.type, []);
            }
            loadTimesByType.get(metrics.type).push(metrics.duration);
        });
        
        // Log performance insights
        if (window.bibleExplorerDebug) {
            console.log('📊 Resource Loading Analytics:');
            loadTimesByType.forEach((times, type) => {
                const avg = times.reduce((a, b) => a + b, 0) / times.length;
                console.log(\`  \${type}: \${Math.round(avg)}ms average (\${times.length} loads)\`);
            });
        }
    }
    
    /**
     * Observe Core Web Vitals
     */
    observeCoreWebVitals() {
        // Largest Contentful Paint
        if ('PerformanceObserver' in window) {
            new PerformanceObserver((list) => {
                list.getEntries().forEach(entry => {
                    console.log(\`🎯 LCP: \${Math.round(entry.startTime)}ms\`);
                });
            }).observe({ entryTypes: ['largest-contentful-paint'] });
            
            // First Input Delay
            new PerformanceObserver((list) => {
                list.getEntries().forEach(entry => {
                    console.log(\`⚡ FID: \${Math.round(entry.processingStart - entry.startTime)}ms\`);
                });
            }).observe({ entryTypes: ['first-input'] });
        }
    }
    
    // Utility methods
    inferResourceType(url) {
        if (url.includes('chapter-reader')) return 'chapter-reader';
        if (url.includes('search')) return 'search-engine';
        if (url.includes('commentary')) return 'commentary-system';
        if (url.includes('theme')) return 'theme-system';
        if (url.includes('.css')) return 'critical-css';
        if (url.includes('navigation')) return 'navigation-js';
        return 'unknown';
    }
    
    // Fallback implementations
    getInlineCSSFallback() { return 'body { font-family: system-ui; }'; }
    getBasicNavigationFallback() { return '<nav>Basic navigation</nav>'; }
    getTextFallback() { return 'Content loading...'; }
    getExternalLinksFallback() { return '<a href="#" target="_blank">View externally</a>'; }
}

/**
 * Priority Queue implementation
 */
class PriorityQueue {
    constructor() {
        this.items = [];
    }
    
    enqueue(item, priority) {
        const queueElement = { item, priority };
        let added = false;
        
        for (let i = 0; i < this.items.length; i++) {
            if (queueElement.priority > this.items[i].priority) {
                this.items.splice(i, 0, queueElement);
                added = true;
                break;
            }
        }
        
        if (!added) {
            this.items.push(queueElement);
        }
    }
    
    dequeue() {
        return this.items.shift()?.item;
    }
    
    peek() {
        return this.items[0]?.item;
    }
    
    size() {
        return this.items.length;
    }
    
    isEmpty() {
        return this.items.length === 0;
    }
}

// Initialize when DOM is ready
if (typeof window !== 'undefined') {
    window.ResourcePrioritizer = ResourcePrioritizer;
    
    document.addEventListener('DOMContentLoaded', () => {
        window.resourcePrioritizer = new ResourcePrioritizer();
        window.resourcePrioritizer.init();
    });
}

export default ResourcePrioritizer;
`;
    }
    
    /**
     * Generate resource manifest
     */
    generateResourceManifest() {
        return {
            version: '1.0.0',
            generatedAt: new Date().toISOString(),
            resources: {
                critical: [
                    {
                        id: 'critical-css',
                        url: '/styles.css',
                        type: 'text/css',
                        size: 45120,
                        integrity: 'sha384-...',
                        priority: 100,
                        loadStrategy: 'blocking'
                    },
                    {
                        id: 'navigation-js',
                        url: '/assets/navigation.js',
                        type: 'application/javascript',
                        size: 12800,
                        integrity: 'sha384-...',
                        priority: 95,
                        loadStrategy: 'blocking'
                    }
                ],
                
                high: [
                    {
                        id: 'theme-system',
                        url: '/assets/theme-manager.js',
                        type: 'application/javascript',
                        size: 8960,
                        integrity: 'sha384-...',
                        priority: 90,
                        loadStrategy: 'immediate'
                    },
                    {
                        id: 'chapter-reader',
                        url: '/assets/chapter-reader.js',
                        type: 'application/javascript',
                        size: 35840,
                        integrity: 'sha384-...',
                        priority: 80,
                        loadStrategy: 'lazy'
                    }
                ],
                
                medium: [
                    {
                        id: 'search-engine',
                        url: '/assets/search-engine.js',
                        type: 'application/javascript',
                        size: 48640,
                        integrity: 'sha384-...',
                        priority: 75,
                        loadStrategy: 'deferred'
                    },
                    {
                        id: 'commentary-system',
                        url: '/assets/commentary-reader.js',
                        type: 'application/javascript',
                        size: 28160,
                        integrity: 'sha384-...',
                        priority: 60,
                        loadStrategy: 'on-demand'
                    }
                ],
                
                low: [
                    {
                        id: 'social-features',
                        url: '/assets/social-sharing.js',
                        type: 'application/javascript',
                        size: 15360,
                        integrity: 'sha384-...',
                        priority: 30,
                        loadStrategy: 'background'
                    },
                    {
                        id: 'analytics',
                        url: '/assets/analytics.js',
                        type: 'application/javascript',
                        size: 20480,
                        integrity: 'sha384-...',
                        priority: 20,
                        loadStrategy: 'background'
                    }
                ]
            },
            
            // Adaptive loading rules
            adaptiveRules: [
                {
                    condition: 'network.effectiveType === "slow-2g"',
                    action: 'disable-non-critical',
                    priority: 'critical-only'
                },
                {
                    condition: 'device.memory < 2',
                    action: 'reduce-concurrent',
                    maxConcurrent: 2
                },
                {
                    condition: 'battery.level < 0.2 && !battery.charging',
                    action: 'defer-background',
                    priority: 'essential-only'
                }
            ],
            
            // Performance budgets
            budgets: {
                critical: { size: '150KB', time: '1s' },
                high: { size: '400KB', time: '2s' },
                medium: { size: '800KB', time: '5s' },
                low: { size: '2MB', time: '10s' }
            }
        };
    }
    
    /**
     * Generate performance budgets
     */
    generatePerformanceBudgets() {
        return {
            global: {
                maxTotalSize: '5MB',
                maxRequests: 100,
                maxCriticalPath: '150KB',
                maxRenderBlockingTime: '1s'
            },
            
            byNetworkType: {
                '4g': { maxSize: '5MB', maxTime: '3s' },
                '3g': { maxSize: '2MB', maxTime: '5s' },
                '2g': { maxSize: '1MB', maxTime: '8s' },
                'slow-2g': { maxSize: '500KB', maxTime: '15s' }
            },
            
            byDeviceType: {
                desktop: { maxMemory: '100MB', maxCPU: '100ms' },
                tablet: { maxMemory: '60MB', maxCPU: '200ms' },
                mobile: { maxMemory: '40MB', maxCPU: '300ms' },
                'low-end': { maxMemory: '20MB', maxCPU: '500ms' }
            },
            
            coreWebVitals: {
                LCP: '2.5s',
                FID: '100ms',
                CLS: '0.1'
            }
        };
    }
    
    /**
     * Generate adaptation strategies
     */
    generateAdaptationStrategies() {
        return {
            networkAdaptations: {
                '4g': 'aggressive-loading',
                '3g': 'balanced-loading', 
                '2g': 'conservative-loading',
                'slow-2g': 'minimal-loading'
            },
            
            deviceAdaptations: {
                'low-memory': 'reduce-cache-size',
                'slow-cpu': 'defer-heavy-computations',
                'small-screen': 'prioritize-viewport-content',
                'high-dpi': 'load-high-res-assets'
            },
            
            userPatternAdaptations: {
                'first-time': 'guided-experience',
                'returning': 'optimized-for-performance',
                'power-user': 'full-feature-set',
                'casual': 'simplified-interface'
            },
            
            contextualAdaptations: {
                'low-battery': 'power-saving-mode',
                'save-data': 'data-efficient-mode',
                'peak-hours': 'cdn-optimization',
                'offline': 'cached-content-only'
            }
        };
    }
    
    /**
     * Write client script to file
     */
    async writeClientScript(script, outputPath) {
        // Ensure directory exists
        const dir = path.dirname(outputPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        
        fs.writeFileSync(outputPath, script, 'utf8');
    }
}

// Export for build integration
module.exports = ResourcePrioritizer;

// Run if called directly
if (require.main === module) {
    const prioritizer = new ResourcePrioritizer();
    prioritizer.generatePrioritizationSystem()
        .then(() => {
            console.log('✅ Intelligent resource prioritization system generated');
        })
        .catch(error => {
            console.error('❌ Failed to generate resource prioritization system:', error);
            process.exit(1);
        });
}