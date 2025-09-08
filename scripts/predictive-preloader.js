/**
 * Predictive Content Preloader
 * Implements machine learning-based content prediction and intelligent preloading
 * for Bible Explorer to anticipate user behavior and reduce perceived load times.
 */

const fs = require('fs');
const path = require('path');

class PredictivePreloader {
    constructor() {
        this.config = {
            // User behavior patterns
            patterns: {
                // Common navigation sequences
                sequences: [
                    ['genesis', 'exodus', 'leviticus'], // Sequential book reading
                    ['matthew', 'mark', 'luke', 'john'], // Gospel reading
                    ['romans', '1-corinthians', '2-corinthians'], // Pauline epistles
                    ['genesis-1', 'genesis-2', 'genesis-3'], // Chapter sequences
                    ['psalm-23', 'john-3-16', 'romans-8-28'], // Popular verses
                ],
                
                // Time-based patterns (seasonal/liturgical)
                seasonal: {
                    christmas: ['matthew-1', 'matthew-2', 'luke-1', 'luke-2', 'isaiah-9'],
                    easter: ['matthew-27', 'matthew-28', 'mark-15', 'mark-16', 'luke-23', 'luke-24'],
                    advent: ['isaiah-7', 'isaiah-9', 'micah-5', 'matthew-1', 'luke-1'],
                    lent: ['matthew-4', 'mark-1', 'luke-4', 'psalm-51', 'joel-2']
                },
                
                // Study patterns
                topical: {
                    salvation: ['john-3', 'romans-3', 'romans-6', 'ephesians-2'],
                    prayer: ['matthew-6', 'luke-11', '1-thessalonians-5', 'philippians-4'],
                    love: ['1-corinthians-13', '1-john-4', 'john-15', 'romans-8'],
                    wisdom: ['proverbs-3', 'james-1', 'ecclesiastes-3', 'psalm-119']
                }
            },
            
            // Preloading strategies
            strategies: {
                // Immediate preload (high confidence)
                immediate: {
                    priority: 'high',
                    threshold: 0.8,
                    maxSize: '500KB',
                    resources: ['critical-css', 'chapter-data', 'search-index']
                },
                
                // Background preload (medium confidence)
                background: {
                    priority: 'low',
                    threshold: 0.5,
                    maxSize: '2MB',
                    resources: ['commentary-data', 'cross-references', 'entity-data']
                },
                
                // On-hover preload (user intent detected)
                hover: {
                    priority: 'medium',
                    delay: 200, // ms
                    resources: ['page-data', 'images', 'videos']
                },
                
                // Viewport-based preload (visible elements)
                viewport: {
                    rootMargin: '50px',
                    threshold: 0.1,
                    resources: ['lazy-images', 'chapter-summaries']
                }
            }
        };
        
        this.analytics = {
            predictions: new Map(),
            accuracy: new Map(),
            performance: new Map()
        };
    }
    
    /**
     * Generate predictive preloading configuration
     */
    async generatePreloadConfig() {
        const config = {
            // Machine learning model for user behavior prediction
            mlModel: this.generateMLModel(),
            
            // Preload rules based on patterns
            rules: this.generatePreloadRules(),
            
            // Resource prioritization matrix
            prioritization: this.generatePrioritizationMatrix(),
            
            // Performance budgets
            budgets: this.generatePerformanceBudgets()
        };
        
        // Write configuration
        const outputPath = path.join(__dirname, '..', 'src', 'assets', 'predictive-preloader.js');
        await this.writePreloaderScript(config, outputPath);
        
        // Generate service worker integration
        await this.generateServiceWorkerIntegration();
        
        return config;
    }
    
    /**
     * Generate machine learning model for prediction
     */
    generateMLModel() {
        return {
            // Simplified neural network for browser execution
            weights: {
                // Input layer: [current_page, time_on_page, scroll_depth, previous_pages]
                input: [
                    [0.3, 0.2, 0.1, 0.4], // Book navigation weight
                    [0.4, 0.3, 0.2, 0.1], // Chapter navigation weight
                    [0.2, 0.4, 0.3, 0.1], // Search behavior weight
                    [0.1, 0.2, 0.3, 0.4]  // Cross-reference weight
                ],
                
                // Hidden layer
                hidden: [
                    [0.5, 0.3, 0.2],
                    [0.3, 0.4, 0.3],
                    [0.2, 0.3, 0.5]
                ],
                
                // Output layer: prediction confidence
                output: [0.6, 0.3, 0.1]
            },
            
            // Activation function parameters
            activation: {
                type: 'sigmoid',
                threshold: 0.5
            },
            
            // Learning parameters
            learning: {
                rate: 0.01,
                momentum: 0.9,
                decay: 0.001
            }
        };
    }
    
    /**
     * Generate preload rules based on patterns
     */
    generatePreloadRules() {
        const rules = [];
        
        // Sequential navigation rules
        this.config.patterns.sequences.forEach((sequence, index) => {
            for (let i = 0; i < sequence.length - 1; i++) {
                rules.push({
                    id: `seq_${index}_${i}`,
                    trigger: sequence[i],
                    target: sequence[i + 1],
                    confidence: 0.7,
                    strategy: 'background',
                    resources: ['chapter-data', 'commentary']
                });
            }
        });
        
        // Seasonal content rules
        Object.entries(this.config.patterns.seasonal).forEach(([season, chapters]) => {
            chapters.forEach((chapter, index) => {
                if (index < chapters.length - 1) {
                    rules.push({
                        id: `seasonal_${season}_${index}`,
                        trigger: chapter,
                        target: chapters[index + 1],
                        confidence: 0.8,
                        strategy: 'immediate',
                        seasonal: season,
                        resources: ['chapter-data', 'cross-references']
                    });
                }
            });
        });
        
        // Topical study rules
        Object.entries(this.config.patterns.topical).forEach(([topic, chapters]) => {
            chapters.forEach((chapter, index) => {
                const otherChapters = chapters.filter((_, i) => i !== index);
                rules.push({
                    id: `topical_${topic}_${index}`,
                    trigger: chapter,
                    targets: otherChapters,
                    confidence: 0.6,
                    strategy: 'background',
                    topic: topic,
                    resources: ['chapter-data', 'commentary', 'cross-references']
                });
            });
        });
        
        // Popular content rules
        const popularContent = [
            'john-3-16', 'psalm-23', 'romans-8-28', '1-corinthians-13',
            'genesis-1', 'matthew-5', 'revelation-21'
        ];
        
        popularContent.forEach(content => {
            rules.push({
                id: `popular_${content}`,
                trigger: 'homepage',
                target: content,
                confidence: 0.5,
                strategy: 'background',
                resources: ['chapter-data']
            });
        });
        
        return rules;
    }
    
    /**
     * Generate resource prioritization matrix
     */
    generatePrioritizationMatrix() {
        return {
            // Critical path resources (must load first)
            critical: {
                weight: 1.0,
                resources: [
                    'main-css',
                    'core-js',
                    'navigation-data',
                    'theme-config'
                ]
            },
            
            // Important resources (load early)
            important: {
                weight: 0.8,
                resources: [
                    'search-engine',
                    'chapter-reader',
                    'book-data',
                    'category-data'
                ]
            },
            
            // Enhanced resources (load when bandwidth allows)
            enhanced: {
                weight: 0.6,
                resources: [
                    'commentary-system',
                    'cross-references',
                    'entity-data',
                    'video-integration'
                ]
            },
            
            // Optional resources (load last)
            optional: {
                weight: 0.4,
                resources: [
                    'advanced-features',
                    'analytics',
                    'social-sharing',
                    'print-styles'
                ]
            }
        };
    }
    
    /**
     * Generate performance budgets
     */
    generatePerformanceBudgets() {
        return {
            // Network-based budgets
            network: {
                '4g': {
                    totalSize: '2MB',
                    criticalSize: '500KB',
                    requestCount: 50,
                    loadTime: '3s'
                },
                '3g': {
                    totalSize: '1MB',
                    criticalSize: '300KB',
                    requestCount: 30,
                    loadTime: '5s'
                },
                '2g': {
                    totalSize: '500KB',
                    criticalSize: '150KB',
                    requestCount: 20,
                    loadTime: '8s'
                }
            },
            
            // Device-based budgets
            device: {
                desktop: {
                    memory: '50MB',
                    cpu: '100ms',
                    storage: '20MB'
                },
                tablet: {
                    memory: '30MB',
                    cpu: '200ms',
                    storage: '15MB'
                },
                mobile: {
                    memory: '20MB',
                    cpu: '300ms',
                    storage: '10MB'
                }
            },
            
            // Time-based budgets
            timing: {
                firstByte: '200ms',
                firstPaint: '1s',
                firstContentfulPaint: '1.5s',
                largestContentfulPaint: '2.5s',
                firstInputDelay: '100ms',
                cumulativeLayoutShift: '0.1'
            }
        };
    }
    
    /**
     * Write the predictive preloader script
     */
    async writePreloaderScript(config, outputPath) {
        const script = `/**
 * Predictive Content Preloader - Client-Side Implementation
 * Auto-generated by predictive-preloader.js
 */

class PredictivePreloader {
    constructor() {
        this.config = ${JSON.stringify(config, null, 2)};
        this.cache = new Map();
        this.predictions = new Map();
        this.analytics = {
            hits: 0,
            misses: 0,
            accuracy: 0
        };
        
        // Initialize ML model
        this.model = new SimpleNeuralNetwork(this.config.mlModel);
        
        // Bind methods
        this.predict = this.predict.bind(this);
        this.preload = this.preload.bind(this);
        this.trackAccuracy = this.trackAccuracy.bind(this);
        
        this.init();
    }
    
    /**
     * Initialize preloader
     */
    init() {
        // Set up user behavior tracking
        this.setupBehaviorTracking();
        
        // Initialize intersection observer for viewport preloading
        this.setupViewportObserver();
        
        // Set up hover preloading
        this.setupHoverPreloading();
        
        // Start background prediction
        this.startPredictionLoop();
        
        console.log('🔮 Predictive Preloader initialized');
    }
    
    /**
     * Set up user behavior tracking
     */
    setupBehaviorTracking() {
        this.userSession = {
            startTime: Date.now(),
            pageViews: [],
            scrollDepth: 0,
            timeOnPage: 0,
            interactions: 0
        };
        
        // Track page navigation
        const originalPushState = history.pushState;
        history.pushState = (...args) => {
            this.trackPageView(args[2]);
            return originalPushState.apply(history, args);
        };
        
        // Track scroll depth
        let maxScroll = 0;
        window.addEventListener('scroll', () => {
            const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
            if (scrollPercent > maxScroll) {
                maxScroll = scrollPercent;
                this.userSession.scrollDepth = Math.round(maxScroll);
            }
        });
        
        // Track interactions
        ['click', 'touch', 'keydown'].forEach(event => {
            document.addEventListener(event, () => {
                this.userSession.interactions++;
            });
        });
    }
    
    /**
     * Track page views
     */
    trackPageView(url) {
        const page = this.extractPageInfo(url);
        this.userSession.pageViews.push({
            page: page,
            timestamp: Date.now(),
            timeOnPreviousPage: this.userSession.timeOnPage
        });
        
        // Make prediction based on new page
        this.predict(page);
    }
    
    /**
     * Extract page information from URL
     */
    extractPageInfo(url) {
        const path = url || window.location.pathname;
        const segments = path.split('/').filter(Boolean);
        
        return {
            type: segments[0] || 'home',
            book: segments[1],
            chapter: segments[2],
            section: segments[3],
            full: path
        };
    }
    
    /**
     * Make predictions using ML model
     */
    predict(currentPage) {
        const features = this.extractFeatures(currentPage);
        const predictions = this.model.predict(features);
        
        // Find matching rules
        const matchingRules = this.config.rules.filter(rule => 
            this.matchesRule(rule, currentPage)
        );
        
        // Combine ML predictions with rule-based predictions
        matchingRules.forEach(rule => {
            const confidence = Math.max(predictions.confidence, rule.confidence);
            if (confidence > this.config.strategies[rule.strategy].threshold) {
                this.schedulePreload(rule.target || rule.targets, rule.strategy, confidence);
            }
        });
        
        // Store prediction for accuracy tracking
        this.predictions.set(currentPage.full, {
            timestamp: Date.now(),
            predictions: matchingRules.map(rule => rule.target || rule.targets).flat(),
            confidence: predictions.confidence
        });
    }
    
    /**
     * Extract features for ML model
     */
    extractFeatures(currentPage) {
        const session = this.userSession;
        const recentPages = session.pageViews.slice(-5);
        
        return [
            this.encodePageType(currentPage.type),
            Math.min(session.timeOnPage / 60000, 1), // Normalize to 0-1 (max 1 minute)
            session.scrollDepth / 100, // Already 0-1
            recentPages.length / 5, // Navigation frequency 0-1
            session.interactions / 100, // Interaction rate (normalized)
            this.getTimeOfDay(), // 0-1 based on time
            this.getSeasonalFactor() // 0-1 based on date
        ];
    }
    
    /**
     * Encode page type as number
     */
    encodePageType(type) {
        const types = {
            'home': 0.1,
            'books': 0.3,
            'categories': 0.5,
            'entities': 0.7,
            'search': 0.9
        };
        return types[type] || 0.0;
    }
    
    /**
     * Get time of day factor
     */
    getTimeOfDay() {
        const hour = new Date().getHours();
        // Peak Bible study times: 6-9 AM (0.8), 7-10 PM (1.0)
        if (hour >= 6 && hour <= 9) return 0.8;
        if (hour >= 19 && hour <= 22) return 1.0;
        return Math.max(0.2, Math.sin((hour / 24) * Math.PI * 2) * 0.5 + 0.5);
    }
    
    /**
     * Get seasonal factor
     */
    getSeasonalFactor() {
        const now = new Date();
        const month = now.getMonth();
        const day = now.getDate();
        
        // Christmas season (November-January)
        if (month >= 10 || month <= 0) return 1.0;
        
        // Easter season (March-April)
        if (month >= 2 && month <= 3) return 0.9;
        
        // Back to school (August-September)
        if (month >= 7 && month <= 8) return 0.8;
        
        // Summer (June-July)
        if (month >= 5 && month <= 6) return 0.6;
        
        return 0.5;
    }
    
    /**
     * Check if current page matches rule
     */
    matchesRule(rule, currentPage) {
        if (rule.trigger === 'homepage' && currentPage.type === 'home') return true;
        if (rule.trigger === currentPage.book) return true;
        if (rule.trigger === \`\${currentPage.book}-\${currentPage.chapter}\`) return true;
        return false;
    }
    
    /**
     * Schedule content preloading
     */
    schedulePreload(targets, strategy, confidence) {
        const targetArray = Array.isArray(targets) ? targets : [targets];
        const strategyConfig = this.config.strategies[strategy];
        
        targetArray.forEach(target => {
            if (!this.cache.has(target)) {
                const delay = strategy === 'hover' ? strategyConfig.delay : 0;
                setTimeout(() => {
                    this.preload(target, strategyConfig, confidence);
                }, delay);
            }
        });
    }
    
    /**
     * Preload content
     */
    async preload(target, strategyConfig, confidence) {
        try {
            const resources = this.getResourceUrls(target, strategyConfig.resources);
            const totalSize = await this.estimateResourceSize(resources);
            
            // Check performance budget
            if (!this.checkPerformanceBudget(totalSize, strategyConfig)) {
                console.log(\`⚠️  Preload skipped for \${target}: exceeds performance budget\`);
                return;
            }
            
            // Preload resources
            const promises = resources.map(resource => this.fetchResource(resource, strategyConfig));
            const results = await Promise.allSettled(promises);
            
            // Cache successful results
            const successful = results.filter(result => result.status === 'fulfilled');
            if (successful.length > 0) {
                this.cache.set(target, {
                    timestamp: Date.now(),
                    confidence: confidence,
                    resources: successful.map(result => result.value)
                });
                
                console.log(\`🚀 Preloaded \${successful.length}/\${resources.length} resources for \${target}\`);
            }
            
        } catch (error) {
            console.error(\`Failed to preload \${target}:\`, error);
        }
    }
    
    /**
     * Get resource URLs for target
     */
    getResourceUrls(target, resourceTypes) {
        const urls = [];
        const baseUrl = window.location.origin;
        
        resourceTypes.forEach(type => {
            switch (type) {
                case 'chapter-data':
                    urls.push(\`\${baseUrl}/assets/data/books/\${target}.json\`);
                    break;
                case 'commentary':
                    urls.push(\`\${baseUrl}/assets/data/commentary/\${target}.json\`);
                    break;
                case 'cross-references':
                    urls.push(\`\${baseUrl}/assets/data/cross-refs/\${target}.json\`);
                    break;
                case 'page-data':
                    urls.push(\`\${baseUrl}/books/\${target}/\`);
                    break;
            }
        });
        
        return urls;
    }
    
    /**
     * Estimate resource size
     */
    async estimateResourceSize(urls) {
        // Use HEAD requests to estimate size without downloading
        const sizeEstimates = await Promise.allSettled(
            urls.map(async url => {
                try {
                    const response = await fetch(url, { method: 'HEAD' });
                    return parseInt(response.headers.get('content-length')) || 1024;
                } catch {
                    return 1024; // Default estimate
                }
            })
        );
        
        return sizeEstimates
            .filter(result => result.status === 'fulfilled')
            .reduce((total, result) => total + result.value, 0);
    }
    
    /**
     * Check performance budget
     */
    checkPerformanceBudget(size, strategyConfig) {
        const maxSize = this.parseSize(strategyConfig.maxSize);
        return size <= maxSize;
    }
    
    /**
     * Parse size string to bytes
     */
    parseSize(sizeStr) {
        const units = { KB: 1024, MB: 1024 * 1024, GB: 1024 * 1024 * 1024 };
        const match = sizeStr.match(/(\\d+)(\\w+)/);
        if (match) {
            return parseInt(match[1]) * (units[match[2]] || 1);
        }
        return parseInt(sizeStr) || 0;
    }
    
    /**
     * Fetch resource with appropriate priority
     */
    async fetchResource(url, strategyConfig) {
        const fetchOptions = {
            method: 'GET',
            priority: strategyConfig.priority,
            credentials: 'same-origin'
        };
        
        const response = await fetch(url, fetchOptions);
        if (!response.ok) {
            throw new Error(\`Failed to fetch \${url}: \${response.status}\`);
        }
        
        return {
            url: url,
            data: await response.text(),
            headers: Object.fromEntries(response.headers.entries()),
            timestamp: Date.now()
        };
    }
    
    /**
     * Set up viewport observer for lazy preloading
     */
    setupViewportObserver() {
        const config = this.config.strategies.viewport;
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const target = entry.target.getAttribute('data-preload');
                    if (target) {
                        this.schedulePreload(target, 'background', 0.6);
                    }
                }
            });
        }, {
            rootMargin: config.rootMargin,
            threshold: config.threshold
        });
        
        // Observe preloadable elements
        document.addEventListener('DOMContentLoaded', () => {
            document.querySelectorAll('[data-preload]').forEach(el => {
                observer.observe(el);
            });
        });
    }
    
    /**
     * Set up hover preloading
     */
    setupHoverPreloading() {
        document.addEventListener('mouseover', (event) => {
            const link = event.target.closest('a[href]');
            if (link && this.isInternalLink(link.href)) {
                const target = this.extractTargetFromUrl(link.href);
                if (target) {
                    this.schedulePreload(target, 'hover', 0.7);
                }
            }
        });
    }
    
    /**
     * Check if link is internal
     */
    isInternalLink(href) {
        try {
            const url = new URL(href, window.location.origin);
            return url.origin === window.location.origin;
        } catch {
            return false;
        }
    }
    
    /**
     * Extract target from URL
     */
    extractTargetFromUrl(href) {
        const url = new URL(href, window.location.origin);
        const segments = url.pathname.split('/').filter(Boolean);
        
        if (segments[0] === 'books' && segments[1]) {
            return segments[1];
        }
        
        return null;
    }
    
    /**
     * Start prediction loop
     */
    startPredictionLoop() {
        setInterval(() => {
            this.userSession.timeOnPage = Date.now() - this.userSession.startTime;
            
            // Clean old cache entries
            this.cleanCache();
            
            // Update analytics
            this.updateAnalytics();
            
        }, 5000); // Every 5 seconds
    }
    
    /**
     * Clean old cache entries
     */
    cleanCache() {
        const maxAge = 10 * 60 * 1000; // 10 minutes
        const now = Date.now();
        
        for (const [key, entry] of this.cache.entries()) {
            if (now - entry.timestamp > maxAge) {
                this.cache.delete(key);
            }
        }
    }
    
    /**
     * Update analytics
     */
    updateAnalytics() {
        // Calculate prediction accuracy
        let hits = 0;
        let total = 0;
        
        for (const [page, prediction] of this.predictions.entries()) {
            total++;
            const actualNext = this.userSession.pageViews
                .find(view => view.timestamp > prediction.timestamp)?.page.full;
            
            if (actualNext && prediction.predictions.includes(actualNext)) {
                hits++;
            }
        }
        
        this.analytics.hits = hits;
        this.analytics.misses = total - hits;
        this.analytics.accuracy = total > 0 ? hits / total : 0;
        
        // Log performance metrics
        if (window.bibleExplorerDebug) {
            console.log('🎯 Prediction Analytics:', this.analytics);
            console.log('💾 Cache Size:', this.cache.size);
            console.log('🧠 Active Predictions:', this.predictions.size);
        }
    }
    
    /**
     * Get cache hit rate
     */
    getCacheHitRate() {
        return this.analytics.accuracy;
    }
    
    /**
     * Get preloaded content
     */
    getPreloadedContent(target) {
        return this.cache.get(target);
    }
}

/**
 * Simple Neural Network for prediction
 */
class SimpleNeuralNetwork {
    constructor(config) {
        this.weights = config.weights;
        this.activation = config.activation;
    }
    
    /**
     * Sigmoid activation function
     */
    sigmoid(x) {
        return 1 / (1 + Math.exp(-x));
    }
    
    /**
     * Forward pass prediction
     */
    predict(inputs) {
        // Input to hidden layer
        let hidden = [];
        for (let i = 0; i < this.weights.hidden.length; i++) {
            let sum = 0;
            for (let j = 0; j < inputs.length; j++) {
                sum += inputs[j] * this.weights.input[j][i];
            }
            hidden.push(this.sigmoid(sum));
        }
        
        // Hidden to output layer
        let output = 0;
        for (let i = 0; i < hidden.length; i++) {
            output += hidden[i] * this.weights.output[i];
        }
        
        const confidence = this.sigmoid(output);
        
        return {
            confidence: confidence,
            prediction: confidence > this.activation.threshold
        };
    }
}

// Initialize when DOM is ready
if (typeof window !== 'undefined') {
    window.PredictivePreloader = PredictivePreloader;
    
    // Auto-initialize if not in debug mode
    if (!window.bibleExplorerDebug) {
        document.addEventListener('DOMContentLoaded', () => {
            window.predictivePreloader = new PredictivePreloader();
        });
    }
}

export default PredictivePreloader;
`;
        
        fs.writeFileSync(outputPath, script, 'utf8');
    }
    
    /**
     * Generate service worker integration
     */
    async generateServiceWorkerIntegration() {
        const swPath = path.join(__dirname, '..', 'src', 'sw.js');
        
        // Read existing service worker
        let swContent = '';
        if (fs.existsSync(swPath)) {
            swContent = fs.readFileSync(swPath, 'utf8');
        }
        
        // Add predictive caching logic
        const predictiveCaching = `
// Predictive Caching Integration
class PredictiveCacheManager {
    constructor() {
        this.PREDICTIVE_CACHE = 'bible-explorer-predictive-v1';
        this.predictions = new Map();
        this.maxCacheSize = 50 * 1024 * 1024; // 50MB
    }
    
    /**
     * Handle predictive cache requests
     */
    async handlePredictiveRequest(event) {
        const url = new URL(event.request.url);
        
        // Check if this is a predictive preload
        if (url.searchParams.has('predictive')) {
            return this.handlePreload(event.request);
        }
        
        // Check if we have predictively cached content
        const cached = await this.getPredictiveCache(event.request);
        if (cached) {
            return cached;
        }
        
        return fetch(event.request);
    }
    
    /**
     * Handle preload requests
     */
    async handlePreload(request) {
        try {
            const response = await fetch(request);
            if (response.ok) {
                // Store in predictive cache
                const cache = await caches.open(this.PREDICTIVE_CACHE);
                await cache.put(request, response.clone());
                
                // Manage cache size
                await this.manageCacheSize();
                
                return response;
            }
        } catch (error) {
            console.error('Predictive preload failed:', error);
        }
        
        return new Response('Preload failed', { status: 204 });
    }
    
    /**
     * Get predictively cached content
     */
    async getPredictiveCache(request) {
        const cache = await caches.open(this.PREDICTIVE_CACHE);
        return await cache.match(request);
    }
    
    /**
     * Manage cache size
     */
    async manageCacheSize() {
        const cache = await caches.open(this.PREDICTIVE_CACHE);
        const requests = await cache.keys();
        
        if (requests.length > 100) { // Max 100 predictive entries
            // Remove oldest entries
            const toDelete = requests.slice(0, 20);
            await Promise.all(toDelete.map(req => cache.delete(req)));
        }
    }
}

const predictiveCacheManager = new PredictiveCacheManager();
`;
        
        // Integrate with existing service worker
        if (!swContent.includes('PredictiveCacheManager')) {
            // Add predictive caching to existing service worker
            const updatedContent = swContent.replace(
                'self.addEventListener(\'fetch\',',
                `${predictiveCaching}
self.addEventListener('fetch',`
            );
            
            fs.writeFileSync(swPath, updatedContent, 'utf8');
        }
    }
}

// Export for build integration
module.exports = PredictivePreloader;

// Run if called directly
if (require.main === module) {
    const preloader = new PredictivePreloader();
    preloader.generatePreloadConfig()
        .then(() => {
            console.log('✅ Predictive preloader configuration generated');
        })
        .catch(error => {
            console.error('❌ Failed to generate predictive preloader:', error);
            process.exit(1);
        });
}