/**
 * Gospel Thread Deep Linking and Navigation
 * Provides smooth scrolling, active section highlighting, and URL management
 */

class GospelThreadNavigator {
  constructor() {
    this.sections = [
      'core-themes',
      'progressive-revelation', 
      'types-shadows',
      'gospel-books',
      'gospel-heart'
    ];
    
    this.themes = [
      'creation',
      'fall',
      'promise',
      'sacrifice',
      'kingship',
      'newCovenant'
    ];
    
    this.init();
  }

  init() {
    this.setupSmoothScrolling();
    this.setupActiveNavigation();
    this.handleInitialHash();
    this.setupBackToTop();
  }

  setupSmoothScrolling() {
    // Smooth scroll for all navigation and anchor links
    const allLinks = document.querySelectorAll('.section-link, .anchor-link, .theme-anchor-link, .timeline-anchor-link');
    
    allLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        this.scrollToSection(targetId);
        
        // Update URL without triggering scroll
        history.pushState(null, null, `#${targetId}`);
        
        // Add share functionality
        this.addShareButton(link, targetId);
        
        // Track navigation
        if (window.telemetry) {
          window.telemetry.recordNavigation('gospel-thread-section', targetId, {
            source: this.getLinkSource(link),
            page: 'gospel-thread'
          });
        }
      });
    });
  }
  
  getLinkSource(link) {
    if (link.classList.contains('section-link')) return 'section-navigation';
    if (link.classList.contains('anchor-link')) return 'section-anchor';
    if (link.classList.contains('theme-anchor-link')) return 'theme-anchor';
    if (link.classList.contains('timeline-anchor-link')) return 'timeline-anchor';
    return 'unknown';
  }
  
  addShareButton(linkElement, targetId) {
    // Remove existing share buttons
    document.querySelectorAll('.section-share-btn').forEach(btn => btn.remove());
    
    // Create share button
    const shareBtn = document.createElement('button');
    shareBtn.className = 'section-share-btn';
    shareBtn.innerHTML = '📋';
    shareBtn.title = 'Copy link to section';
    shareBtn.setAttribute('aria-label', 'Copy section link');
    
    // Position near the clicked link
    const rect = linkElement.getBoundingClientRect();
    shareBtn.style.position = 'fixed';
    shareBtn.style.top = `${rect.top - 40}px`;
    shareBtn.style.left = `${rect.left}px`;
    shareBtn.style.zIndex = '10000';
    
    document.body.appendChild(shareBtn);
    
    // Copy link functionality
    shareBtn.addEventListener('click', () => {
      const fullUrl = `${window.location.origin}/gospel-thread/#${targetId}`;
      
      if (navigator.clipboard) {
        navigator.clipboard.writeText(fullUrl).then(() => {
          this.showCopyFeedback(shareBtn);
        });
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = fullUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        this.showCopyFeedback(shareBtn);
      }
      
      // Track sharing
      if (window.telemetry) {
        window.telemetry.recordUserAction('gospel-thread-share', targetId, {
          method: 'copy-link'
        });
      }
    });
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      shareBtn.remove();
    }, 5000);
  }
  
  showCopyFeedback(button) {
    const originalText = button.innerHTML;
    button.innerHTML = '✅';
    button.disabled = true;
    
    setTimeout(() => {
      if (document.body.contains(button)) {
        button.innerHTML = originalText;
        button.disabled = false;
      }
    }, 1500);
  }

  setupActiveNavigation() {
    // Intersection Observer for active section highlighting
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.updateActiveNavigation(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-20% 0px -70% 0px',
        threshold: 0.1
      }
    );

    // Observe all sections and themes
    this.sections.forEach(sectionId => {
      const section = document.getElementById(sectionId);
      if (section) {
        observer.observe(section);
      }
    });

    this.themes.forEach(themeId => {
      const theme = document.getElementById(`theme-${themeId}`);
      if (theme) {
        observer.observe(theme);
      }
    });
  }

  updateActiveNavigation(activeId) {
    // Update section navigation
    const sectionLinks = document.querySelectorAll('.section-link');
    sectionLinks.forEach(link => {
      const targetId = link.getAttribute('href').substring(1);
      
      // Check if this section link should be active
      if (targetId === activeId || 
          (activeId.startsWith('theme-') && targetId === 'core-themes')) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  scrollToSection(targetId) {
    const targetElement = document.getElementById(targetId);
    
    if (!targetElement) {
      console.warn(`Gospel Thread Navigator: Target element ${targetId} not found`);
      return;
    }

    // Calculate offset for fixed header
    const headerOffset = this.getHeaderOffset();
    const elementPosition = targetElement.offsetTop;
    const offsetPosition = elementPosition - headerOffset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });

    // Add visual feedback
    this.highlightTarget(targetElement);
  }

  getHeaderOffset() {
    // Calculate offset for navigation and any fixed headers
    const nav = document.querySelector('nav.nav');
    return nav ? nav.offsetHeight + 20 : 80;
  }

  highlightTarget(element) {
    // Add temporary highlight class
    element.classList.add('scroll-target-highlight');
    
    setTimeout(() => {
      element.classList.remove('scroll-target-highlight');
    }, 2000);
  }

  handleInitialHash() {
    // Handle initial page load with hash
    const hash = window.location.hash;
    if (hash) {
      const targetId = hash.substring(1);
      
      // Delay scroll to ensure page is fully loaded
      setTimeout(() => {
        this.scrollToSection(targetId);
      }, 500);
    }
  }

  setupBackToTop() {
    // Create back-to-top button
    const backToTop = document.createElement('button');
    backToTop.className = 'back-to-top';
    backToTop.innerHTML = '↑';
    backToTop.setAttribute('aria-label', 'Back to top');
    backToTop.style.display = 'none';
    
    document.body.appendChild(backToTop);

    // Show/hide based on scroll position
    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        backToTop.style.display = 'flex';
      } else {
        backToTop.style.display = 'none';
      }
    });

    // Scroll to top functionality
    backToTop.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      
      // Update URL
      history.pushState(null, null, window.location.pathname);
      
      // Track action
      if (window.telemetry) {
        window.telemetry.recordUserAction('gospel-thread-back-to-top', 'click', {
          scrollPosition: window.scrollY
        });
      }
    });
  }

  // Public API for external use
  navigateToSection(sectionId) {
    this.scrollToSection(sectionId);
    history.pushState(null, null, `#${sectionId}`);
  }

  navigateToTheme(themeId) {
    this.scrollToSection(`theme-${themeId}`);
    history.pushState(null, null, `#theme-${themeId}`);
  }
}

// Enhanced CSS for scroll highlighting
function addGospelThreadStyles() {
  if (document.getElementById('gospel-thread-navigation-styles')) return;

  const styles = document.createElement('style');
  styles.id = 'gospel-thread-navigation-styles';
  styles.textContent = `
    /* Active section link styling */
    .section-link.active {
      background: var(--accent) !important;
      color: var(--bg) !important;
      border-color: var(--accent) !important;
      box-shadow: 0 2px 8px var(--accent-alpha-30);
    }

    /* Scroll target highlight animation */
    .scroll-target-highlight {
      animation: scroll-highlight 2s ease-out;
    }

    @keyframes scroll-highlight {
      0% {
        background-color: var(--accent-alpha-20);
        transform: scale(1.01);
      }
      100% {
        background-color: transparent;
        transform: scale(1);
      }
    }

    /* Section share button */
    .section-share-btn {
      background: var(--accent);
      color: var(--bg);
      border: none;
      border-radius: 6px;
      padding: 0.5rem;
      font-size: 1rem;
      cursor: pointer;
      box-shadow: 0 4px 12px var(--accent-alpha-30);
      transition: all 0.2s ease;
      animation: share-btn-appear 0.2s ease-out;
    }

    .section-share-btn:hover:not(:disabled) {
      transform: scale(1.1);
      box-shadow: 0 6px 20px var(--accent-alpha-40);
    }

    .section-share-btn:disabled {
      opacity: 0.8;
      cursor: default;
    }

    @keyframes share-btn-appear {
      from {
        opacity: 0;
        transform: scale(0.8) translateY(10px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }

    /* Back to top button */
    .back-to-top {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      width: 48px;
      height: 48px;
      background: var(--accent);
      color: var(--bg);
      border: none;
      border-radius: 50%;
      font-size: 1.2rem;
      font-weight: bold;
      cursor: pointer;
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px var(--accent-alpha-30);
      transition: all 0.2s ease;
    }

    .back-to-top:hover {
      transform: scale(1.1) translateY(-2px);
      box-shadow: 0 6px 20px var(--accent-alpha-40);
    }

    /* Mobile adjustments */
    @media (max-width: 768px) {
      .back-to-top {
        bottom: 1rem;
        right: 1rem;
        width: 44px;
        height: 44px;
        font-size: 1.1rem;
      }
    }
  `;
  
  document.head.appendChild(styles);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGospelThread);
} else {
  initGospelThread();
}

function initGospelThread() {
  // Only initialize on gospel thread page
  if (window.location.pathname === '/gospel-thread/') {
    addGospelThreadStyles();
    window.gospelThreadNavigator = new GospelThreadNavigator();
  }
}

// Handle browser back/forward navigation
window.addEventListener('popstate', () => {
  if (window.gospelThreadNavigator && window.location.hash) {
    const targetId = window.location.hash.substring(1);
    window.gospelThreadNavigator.scrollToSection(targetId);
  }
});

// Export for external use
window.GospelThreadNavigator = GospelThreadNavigator;