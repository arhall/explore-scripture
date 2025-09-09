/**
 * CSS Optimizer for Explore Scripture
 * Handles critical CSS, lazy loading, and performance optimization
 */

class CSSOptimizer {
  constructor() {
    this.loadedStyles = new Set();
    this.criticalCSS = this.extractCriticalCSS();
    this.init();
  }
  
  init() {
    // Inline critical CSS
    this.inlineCriticalCSS();
    
    // Set up lazy loading for non-critical styles
    this.setupLazyStyleLoading();
    
    // Optimize font loading
    this.optimizeFontLoading();
  }
  
  extractCriticalCSS() {
    // Define critical CSS patterns for above-the-fold content
    return {
      // Core layout and typography
      core: `
        :root { 
          --bg: #ffffff; 
          --text: #0f172a; 
          --accent: #3b82f6; 
          --border: #e2e8f0;
        }
        [data-theme="dark"] { 
          --bg: #0f172a; 
          --text: #f1f5f9; 
          --accent: #60a5fa; 
          --border: #334155;
        }
        body { 
          font-family: Inter, system-ui, -apple-system, sans-serif; 
          background: var(--bg); 
          color: var(--text); 
          margin: 0; 
          line-height: 1.6;
        }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 1rem; }
      `,
      
      // Navigation (always visible)
      nav: `
        .nav { 
          display: flex; 
          justify-content: space-between; 
          align-items: center; 
          padding: 1rem 0; 
          border-bottom: 1px solid var(--border);
        }
        .nav-brand { 
          font-weight: 700; 
          font-size: 1.25rem; 
          color: var(--accent); 
          text-decoration: none;
        }
        .nav-links { display: flex; gap: 1rem; align-items: center; }
        .nav-link { 
          color: var(--text); 
          text-decoration: none; 
          padding: 0.5rem 1rem; 
          border-radius: 6px;
          transition: background-color 0.2s;
        }
        .nav-link:hover, .nav-link.active { 
          background: var(--accent); 
          color: white; 
        }
        .theme-toggle { 
          background: transparent; 
          border: 1px solid var(--border); 
          border-radius: 6px; 
          padding: 0.5rem; 
          cursor: pointer;
          color: var(--text);
        }
      `,
      
      // Loading states
      loading: `
        .loading { 
          display: inline-block; 
          width: 20px; 
          height: 20px; 
          border: 2px solid var(--border); 
          border-radius: 50%; 
          border-top-color: var(--accent); 
          animation: spin 1s linear infinite; 
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .skeleton { 
          background: linear-gradient(90deg, var(--border) 25%, transparent 50%, var(--border) 75%); 
          background-size: 200% 100%; 
          animation: shimmer 1.5s infinite; 
        }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
      `
    };
  }
  
  inlineCriticalCSS() {
    const criticalCSS = Object.values(this.criticalCSS).join('\n');
    
    // Check if critical CSS is already inlined
    if (document.querySelector('#critical-css')) return;
    
    const style = document.createElement('style');
    style.id = 'critical-css';
    style.textContent = criticalCSS;
    document.head.insertBefore(style, document.head.firstChild);
    
    console.log('[CSSOptimizer] Critical CSS inlined');
  }
  
  setupLazyStyleLoading() {
    // Load non-critical styles after page load
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => this.loadNonCriticalStyles(), 100);
      });
    } else {
      setTimeout(() => this.loadNonCriticalStyles(), 100);
    }
  }
  
  loadNonCriticalStyles() {
    const nonCriticalStyles = [
      // Component-specific styles
      { href: '/styles.css', media: 'all' },
    ];
    
    nonCriticalStyles.forEach(style => {
      this.loadStyleSheet(style.href, style.media);
    });
  }
  
  loadStyleSheet(href, media = 'all') {
    if (this.loadedStyles.has(href)) return;
    
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.media = media;
      link.onload = () => {
        this.loadedStyles.add(href);
        resolve();
      };
      link.onerror = reject;
      document.head.appendChild(link);
    });
  }
  
  optimizeFontLoading() {
    // Preload critical font variants
    const criticalFonts = [
      'https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap',
    ];
    
    criticalFonts.forEach(fontUrl => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'style';
      link.href = fontUrl;
      link.onload = () => {
        link.rel = 'stylesheet';
      };
      document.head.appendChild(link);
    });
    
    // Use font-display: swap for better loading performance
    const fontOptimizationCSS = `
      @font-face {
        font-family: 'Inter';
        font-display: swap;
      }
    `;
    
    const style = document.createElement('style');
    style.textContent = fontOptimizationCSS;
    document.head.appendChild(style);
  }
  
  // Lazy load styles based on page content
  loadStylesForContent(contentType) {
    const styleMap = {
      'character-search': '/assets/character-search.css',
      'chapter-reader': '/assets/chapter-reader.css',
      'debug-dashboard': '/assets/debug-dashboard.css',
    };
    
    const styleHref = styleMap[contentType];
    if (styleHref) {
      this.loadStyleSheet(styleHref);
    }
  }
  
  // Preload styles for next likely page
  preloadStyles(nextPageType) {
    const preloadMap = {
      'book': ['/assets/chapter-reader.css'],
      'character': ['/assets/character-profile.css'],
      'search': ['/assets/search-results.css'],
    };
    
    const stylesToPreload = preloadMap[nextPageType] || [];
    stylesToPreload.forEach(href => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = href;
      document.head.appendChild(link);
    });
  }
  
  // Get optimization stats
  getStats() {
    return {
      loadedStyles: Array.from(this.loadedStyles),
      criticalCSSSize: Object.values(this.criticalCSS).join('').length,
      totalLoadedStyles: this.loadedStyles.size
    };
  }
}

// Initialize CSS optimizer
const cssOptimizer = new CSSOptimizer();

// Expose to global scope
window.cssOptimizer = cssOptimizer;
window.loadStylesForContent = (contentType) => cssOptimizer.loadStylesForContent(contentType);
window.preloadStyles = (pageType) => cssOptimizer.preloadStyles(pageType);

console.log('[CSSOptimizer] Initialized with critical CSS inlining and lazy loading');