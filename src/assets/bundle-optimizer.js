/**
 * Bundle Optimizer and Lazy Loading Manager
 * 
 * Implements intelligent module loading, code splitting,
 * and progressive enhancement for better performance
 */

class BundleOptimizer {
  constructor() {
    this.loadedModules = new Set();
    this.loadingPromises = new Map();
    this.intersectionObserver = null;
    this.criticalModules = new Set(['theme-manager', 'logger']);
    this.moduleRegistry = new Map();
    this.loadTiming = new Map();
    
    this.init();
  }

  init() {
    console.log('[BundleOptimizer] Initializing...');
    
    // Setup intersection observer for lazy loading
    this.setupIntersectionObserver();
    
    // Setup module registry
    this.registerModules();
    
    // Load critical modules immediately
    this.loadCriticalModules();
    
    // Setup event listeners for user interactions
    this.setupInteractionListeners();
    
    console.log('[BundleOptimizer] Ready');
  }

  registerModules() {
    // Module definitions with loading priorities and dependencies
    const modules = {
      // Critical - Load immediately
      'theme-manager': {
        url: '/assets/theme-manager.js',
        priority: 'critical',
        size: 8, // KB
        dependencies: []
      },
      
      'logger': {
        url: '/assets/logger.js',
        priority: 'critical',
        size: 5,
        dependencies: []
      },

      // High Priority - Load on interaction or visibility
      'search-engine': {
        url: '/assets/search-engine.js',
        priority: 'high',
        size: 25,
        dependencies: [],
        triggers: ['search-focus', 'search-visible']
      },

      'search-interface': {
        url: '/assets/search-interface.js',
        priority: 'high',
        size: 15,
        dependencies: ['search-engine'],
        triggers: ['search-focus', 'search-visible']
      },

      // Medium Priority - Load when likely to be needed
      'chapter-reader': {
        url: '/assets/chapter-reader.js',
        priority: 'medium',
        size: 35,
        dependencies: [],
        triggers: ['chapter-btn-visible', 'book-page-visit']
      },

      'commentary-reader': {
        url: '/assets/commentary-reader.js',
        priority: 'medium', 
        size: 20,
        dependencies: [],
        triggers: ['commentary-btn-visible', 'book-page-visit']
      },

      // Low Priority - Load on demand
      'entity-relationship-visualizer': {
        url: '/assets/entity-relationship-visualizer.js',
        priority: 'low',
        size: 45,
        dependencies: ['d3'],
        triggers: ['entity-relations-visible']
      },

      'genealogy-explorer': {
        url: '/assets/genealogy-explorer.js',
        priority: 'low',
        size: 50,
        dependencies: ['d3'],
        triggers: ['genealogy-page-visit']
      },

      // External dependencies
      'd3': {
        url: 'https://unpkg.com/d3@7/dist/d3.min.js',
        priority: 'external',
        size: 250,
        dependencies: [],
        cached: true
      }
    };

    // Register all modules
    Object.entries(modules).forEach(([name, config]) => {
      this.moduleRegistry.set(name, {
        ...config,
        loaded: false,
        loading: false,
        error: null
      });
    });
  }

  setupIntersectionObserver() {
    if (!('IntersectionObserver' in window)) {
      console.warn('[BundleOptimizer] IntersectionObserver not supported');
      return;
    }

    this.intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const triggers = entry.target.dataset.lazyTrigger?.split(',') || [];
          triggers.forEach(trigger => this.handleTrigger(trigger.trim()));
        }
      });
    }, {
      rootMargin: '50px', // Load 50px before element becomes visible
      threshold: 0.1
    });

    // Observe elements that should trigger lazy loading
    this.observeLazyElements();
  }

  observeLazyElements() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.observeLazyElements());
      return;
    }

    // Search elements
    const searchElements = document.querySelectorAll('input[type="search"], .search-box, #searchInput');
    searchElements.forEach(el => {
      el.dataset.lazyTrigger = 'search-visible';
      this.intersectionObserver?.observe(el);
    });

    // Chapter buttons
    const chapterBtns = document.querySelectorAll('.chapter-btn, .read-chapter-btn');
    chapterBtns.forEach(el => {
      el.dataset.lazyTrigger = 'chapter-btn-visible';
      this.intersectionObserver?.observe(el);
    });

    // Commentary buttons  
    const commentaryBtns = document.querySelectorAll('.commentary-btn');
    commentaryBtns.forEach(el => {
      el.dataset.lazyTrigger = 'commentary-btn-visible';
      this.intersectionObserver?.observe(el);
    });

    // Entity relations sections
    const relationSections = document.querySelectorAll('.relations-visualization');
    relationSections.forEach(el => {
      el.dataset.lazyTrigger = 'entity-relations-visible';
      this.intersectionObserver?.observe(el);
    });
  }

  setupInteractionListeners() {
    // Search focus triggers
    document.addEventListener('focusin', (e) => {
      if (e.target.matches('input[type="search"], .search-box')) {
        this.handleTrigger('search-focus');
      }
    });

    // Page-specific triggers based on URL
    const currentPath = window.location.pathname;
    
    if (currentPath.startsWith('/books/')) {
      setTimeout(() => this.handleTrigger('book-page-visit'), 1000);
    } else if (currentPath === '/genealogy/') {
      setTimeout(() => this.handleTrigger('genealogy-page-visit'), 500);
    }
  }

  loadCriticalModules() {
    console.log('[BundleOptimizer] Loading critical modules...');
    
    this.criticalModules.forEach(moduleName => {
      this.loadModule(moduleName, { priority: 'critical' });
    });
  }

  async handleTrigger(trigger) {
    console.log(`[BundleOptimizer] Trigger: ${trigger}`);
    
    // Find modules that should be loaded for this trigger
    const modulesToLoad = [];
    
    this.moduleRegistry.forEach((config, name) => {
      if (config.triggers?.includes(trigger) && !config.loaded && !config.loading) {
        modulesToLoad.push(name);
      }
    });

    if (modulesToLoad.length > 0) {
      console.log(`[BundleOptimizer] Loading modules for trigger "${trigger}":`, modulesToLoad);
      
      // Load modules in priority order
      const sortedModules = modulesToLoad.sort((a, b) => {
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3, external: 4 };
        const aPriority = this.moduleRegistry.get(a)?.priority || 'low';
        const bPriority = this.moduleRegistry.get(b)?.priority || 'low';
        return priorityOrder[aPriority] - priorityOrder[bPriority];
      });

      // Load modules with dependency resolution
      for (const moduleName of sortedModules) {
        await this.loadModule(moduleName);
      }
    }
  }

  async loadModule(moduleName, options = {}) {
    const config = this.moduleRegistry.get(moduleName);
    if (!config) {
      console.error(`[BundleOptimizer] Module not found: ${moduleName}`);
      return false;
    }

    if (config.loaded) {
      return true; // Already loaded
    }

    if (config.loading) {
      // Return existing loading promise
      return this.loadingPromises.get(moduleName) || false;
    }

    console.log(`[BundleOptimizer] Loading module: ${moduleName} (${config.size}KB)`);
    
    const loadStart = performance.now();
    config.loading = true;

    try {
      // Load dependencies first
      if (config.dependencies && config.dependencies.length > 0) {
        console.log(`[BundleOptimizer] Loading dependencies for ${moduleName}:`, config.dependencies);
        
        await Promise.all(
          config.dependencies.map(dep => this.loadModule(dep))
        );
      }

      // Create loading promise
      const loadingPromise = this.loadScript(config.url, moduleName);
      this.loadingPromises.set(moduleName, loadingPromise);

      // Wait for script to load
      await loadingPromise;

      // Mark as loaded
      config.loaded = true;
      config.loading = false;
      config.error = null;

      // Record timing
      const loadTime = performance.now() - loadStart;
      this.loadTiming.set(moduleName, loadTime);

      console.log(`[BundleOptimizer] Loaded ${moduleName} in ${Math.round(loadTime)}ms`);

      // Track loading for telemetry
      if (window.telemetry) {
        window.telemetry.recordPerformanceMetric('module-load', {
          module: moduleName,
          loadTime,
          size: config.size,
          priority: config.priority
        });
      }

      return true;

    } catch (error) {
      console.error(`[BundleOptimizer] Failed to load ${moduleName}:`, error);
      
      config.loading = false;
      config.error = error.message;
      
      // Clean up promises
      this.loadingPromises.delete(moduleName);
      
      return false;
    }
  }

  loadScript(url, moduleName) {
    return new Promise((resolve, reject) => {
      // Check if script already exists
      const existing = document.querySelector(`script[src="${url}"]`);
      if (existing) {
        if (existing.dataset.loaded === 'true') {
          resolve();
          return;
        }
        
        // Wait for existing script to load
        existing.addEventListener('load', resolve);
        existing.addEventListener('error', reject);
        return;
      }

      // Create new script element
      const script = document.createElement('script');
      script.src = url;
      script.async = true;
      script.dataset.module = moduleName;

      // Handle loading
      script.addEventListener('load', () => {
        script.dataset.loaded = 'true';
        resolve();
      });

      script.addEventListener('error', () => {
        reject(new Error(`Failed to load script: ${url}`));
      });

      // Add to head
      document.head.appendChild(script);
    });
  }

  // Preload modules that are likely to be needed soon
  preloadModule(moduleName) {
    const config = this.moduleRegistry.get(moduleName);
    if (!config || config.loaded || config.loading) {
      return;
    }

    console.log(`[BundleOptimizer] Preloading: ${moduleName}`);

    // Use link preload for better browser optimization
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = config.url;
    link.as = 'script';
    link.crossOrigin = 'anonymous';
    
    document.head.appendChild(link);
  }

  // Progressive enhancement for features
  enhance(feature, callback) {
    const featureModules = this.getModulesForFeature(feature);
    
    if (featureModules.length === 0) {
      // No modules needed, enhance immediately
      callback();
      return;
    }

    // Load required modules then enhance
    Promise.all(featureModules.map(module => this.loadModule(module)))
      .then(() => {
        console.log(`[BundleOptimizer] Enhanced feature: ${feature}`);
        callback();
      })
      .catch(error => {
        console.error(`[BundleOptimizer] Failed to enhance ${feature}:`, error);
        // Try to enhance with basic functionality
        callback();
      });
  }

  getModulesForFeature(feature) {
    const featureModules = {
      'search': ['search-engine', 'search-interface'],
      'chapter-reading': ['chapter-reader'],
      'commentary': ['commentary-reader'],
      'entity-relationships': ['entity-relationship-visualizer', 'd3'],
      'genealogy': ['genealogy-explorer', 'd3']
    };

    return featureModules[feature] || [];
  }

  // Get loading statistics
  getStats() {
    const loadedCount = Array.from(this.moduleRegistry.values())
      .filter(config => config.loaded).length;
    
    const totalSize = Array.from(this.moduleRegistry.entries())
      .filter(([name, config]) => config.loaded)
      .reduce((total, [name, config]) => total + config.size, 0);

    const avgLoadTime = Array.from(this.loadTiming.values())
      .reduce((sum, time, _, arr) => sum + time / arr.length, 0);

    return {
      modulesLoaded: loadedCount,
      totalModules: this.moduleRegistry.size,
      totalSizeKB: totalSize,
      avgLoadTimeMs: Math.round(avgLoadTime),
      loadedModules: Array.from(this.moduleRegistry.entries())
        .filter(([name, config]) => config.loaded)
        .map(([name, config]) => ({ name, size: config.size, priority: config.priority }))
    };
  }

  // Manual module loading for specific use cases
  async require(moduleName) {
    return this.loadModule(moduleName);
  }

  // Cleanup method
  destroy() {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
    
    this.loadingPromises.clear();
    this.loadTiming.clear();
    this.loadedModules.clear();
  }
}

// Initialize bundle optimizer
const bundleOptimizer = new BundleOptimizer();

// Make available globally
window.bundleOptimizer = bundleOptimizer;

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { BundleOptimizer };
}