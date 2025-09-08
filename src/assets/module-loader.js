/**
 * Bible Explorer Module Loader
 * Implements lazy loading and code splitting for optimal performance
 */

class ModuleLoader {
  constructor() {
    this.loadedModules = new Set();
    this.loadingModules = new Map();
    this.moduleConfig = {
      // Core modules - loaded immediately
      core: [
        '/assets/logger.js',
        '/assets/security-config.js',
        '/assets/theme-manager.js',
        '/assets/search-engine.js',
        '/assets/search-interface.js'
      ],
      
      // Page-specific modules
      'chapter-reader': '/assets/chapter-reader.js',
      'commentary-reader': '/assets/commentary-reader.js',
      'scripture-widget': '/assets/scripture-widget.js',
      'search-engine': '/assets/search-engine.js',
      'search-interface': '/assets/search-interface.js',
      'theme-manager': '/assets/theme-manager.js',
      'telemetry': '/assets/telemetry.js',
      'debug-dashboard': '/assets/debug-dashboard.js',
      'gospel-thread': '/assets/gospel-thread.js'
    };
    
    this.init();
  }
  
  init() {
    // Load core modules immediately
    this.loadCoreModules();
    
    // Set up intersection observer for lazy loading based on page content
    this.setupIntersectionObserver();
    
    // Set up event-based loading
    this.setupEventBasedLoading();
    
    // Detect page type and load appropriate modules
    this.loadPageSpecificModules();
  }
  
  async loadCoreModules() {
    const promises = this.moduleConfig.core.map(url => this.loadScript(url, true));
    await Promise.allSettled(promises);
  }
  
  async loadScript(url, isCore = false) {
    // Check if already loaded
    if (this.loadedModules.has(url)) {
      return Promise.resolve();
    }
    
    // Check if currently loading
    if (this.loadingModules.has(url)) {
      return this.loadingModules.get(url);
    }
    
    // Create loading promise
    const loadPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.async = !isCore; // Core modules load synchronously
      script.defer = false; // Don't defer any scripts
      
      // Set type for ES modules
      if (url.includes('telemetry')) {
        script.type = 'module';
      }
      
      script.onload = () => {
        this.loadedModules.add(url);
        this.loadingModules.delete(url);
        console.log(`[ModuleLoader] Loaded: ${url}`);
        
        // Trigger initialization events for specific modules
        if (url.includes('chapter-reader')) {
          // Dispatch event so chapter-reader can initialize
          document.dispatchEvent(new CustomEvent('chapterReaderLoaded'));
        }
        if (url.includes('commentary-reader')) {
          // Dispatch event so commentary-reader can initialize
          document.dispatchEvent(new CustomEvent('commentaryReaderLoaded'));
        }
        if (url.includes('theme-manager')) {
          document.dispatchEvent(new CustomEvent('themeManagerLoaded'));
        }
        
        resolve();
      };
      
      script.onerror = (error) => {
        this.loadingModules.delete(url);
        console.error(`[ModuleLoader] Failed to load: ${url}`, error);
        reject(error);
      };
      
      document.head.appendChild(script);
    });
    
    this.loadingModules.set(url, loadPromise);
    return loadPromise;
  }
  
  setupIntersectionObserver() {
    if (!('IntersectionObserver' in window)) return;
    
    // eslint-disable-next-line no-undef
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = entry.target;
          
          // Load Scripture Widget when scripture references are visible
          if (target.classList.contains('scripture-ref') && !this.loadedModules.has(this.moduleConfig['scripture-widget'])) {
            this.loadModule('scripture-widget');
          }
          
          // Load Chapter Reader when chapter buttons are visible
          if (target.classList.contains('read-chapter-btn') && !this.loadedModules.has(this.moduleConfig['chapter-reader'])) {
            this.loadModule('chapter-reader');
          }
          
        }
      });
    }, {
      rootMargin: '50px' // Load modules 50px before they come into view
    });
    
    // Observe relevant elements
    this.observeElements(observer);
  }
  
  observeElements(observer) {
    // Wait for DOM to be ready
    const observeWhenReady = () => {
      // Scripture references
      document.querySelectorAll('.scripture-ref').forEach(el => observer.observe(el));
      
      // Chapter buttons
      document.querySelectorAll('.read-chapter-btn').forEach(el => observer.observe(el));
      
      // Search containers
      document.querySelectorAll('[id*="search"], [class*="search"]').forEach(el => observer.observe(el));
    };
    
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', observeWhenReady);
    } else {
      observeWhenReady();
    }
  }
  
  setupEventBasedLoading() {
    // Load theme manager when user tries to change theme
    document.addEventListener('click', (e) => {
      if (e.target.matches('.theme-toggle, .theme-button, [data-theme]')) {
        this.loadModule('theme-manager');
      }
    });
    
    // Load debug dashboard when user presses the debug key combination
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        this.loadModule('debug-dashboard');
      }
    });
    
    // Load telemetry after user interaction (not immediately)
    // Skip telemetry on mobile browsers due to ES module compatibility issues
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
    
    if (!isMobile) {
      const loadTelemetryOnInteraction = () => {
        this.loadModule('telemetry');
        document.removeEventListener('click', loadTelemetryOnInteraction);
        document.removeEventListener('scroll', loadTelemetryOnInteraction);
        document.removeEventListener('keydown', loadTelemetryOnInteraction);
      };
      
      // Delay telemetry loading until user interacts
      setTimeout(() => {
        document.addEventListener('click', loadTelemetryOnInteraction, { once: true });
        document.addEventListener('scroll', loadTelemetryOnInteraction, { once: true });
        document.addEventListener('keydown', loadTelemetryOnInteraction, { once: true });
      }, 2000);
    } else {
      console.log('[ModuleLoader] Skipping telemetry on mobile for compatibility');
    }
  }
  
  loadPageSpecificModules() {
    const pathname = window.location.pathname;
    
    // Book pages - load chapter reader and commentary reader immediately
    if (pathname.startsWith('/books/')) {
      console.log('[ModuleLoader] Loading chapter reader and commentary reader for book page');
      this.loadModule('chapter-reader');
      this.loadModule('commentary-reader');
    }
    
    // Gospel thread page - load navigation and deep linking
    if (pathname === '/gospel-thread/') {
      console.log('[ModuleLoader] Loading gospel thread navigation for gospel thread page');
      this.loadModule('gospel-thread');
    }
    
    // Theme manager is now loaded as core module, so no need to load again
  }
  
  async loadModule(moduleName) {
    const url = this.moduleConfig[moduleName];
    if (!url) {
      console.warn(`[ModuleLoader] Unknown module: ${moduleName}`);
      return;
    }
    
    try {
      await this.loadScript(url);
    } catch (error) {
      console.error(`[ModuleLoader] Failed to load module ${moduleName}:`, error);
    }
  }
  
  // Public API for manual module loading
  async load(modules) {
    if (typeof modules === 'string') {
      modules = [modules];
    }
    
    const promises = modules.map(module => this.loadModule(module));
    return Promise.allSettled(promises);
  }
  
  // Preload modules for next likely page
  preloadForNavigation(nextPath) {
    if (nextPath.startsWith('/books/')) {
      this.loadModule('chapter-reader');
      this.loadModule('commentary-reader');
    }
  }
  
  // Get loading stats
  getStats() {
    return {
      loaded: Array.from(this.loadedModules),
      loading: Array.from(this.loadingModules.keys()),
      loadedCount: this.loadedModules.size,
      totalModules: Object.keys(this.moduleConfig).length + this.moduleConfig.core.length
    };
  }
}

// Initialize module loader
window.moduleLoader = new ModuleLoader();

// Add to global scope for debugging
if (window.bibleExplorerDebug) {
  window.moduleLoader.debug = true;
  console.log('[ModuleLoader] Debug mode enabled');
}

// Expose API for other scripts
window.loadModule = (modules) => window.moduleLoader.load(modules);
window.preloadModules = (nextPath) => window.moduleLoader.preloadForNavigation(nextPath);

console.log('[ModuleLoader] Initialized with lazy loading strategy');