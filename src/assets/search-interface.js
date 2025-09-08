/**
 * Search Interface for Bible Explorer
 * Provides autocomplete search with real-time suggestions across all content
 */

class SearchInterface {
  constructor(options = {}) {
    this.containerId = options.containerId || 'search-container';
    this.inputId = options.inputId || 'search-input';
    this.resultsId = options.resultsId || 'search-results';
    this.maxResults = options.maxResults || 8;
    this.minQueryLength = options.minQueryLength || 1;
    this.debounceDelay = options.debounceDelay || 150;
    
    this.isInitialized = false;
    this.searchEngine = null;
    this.currentQuery = '';
    this.selectedIndex = -1;
    this.results = [];
    this.isVisible = false;
    
    // Bind methods
    this.handleInput = this.handleInput.bind(this);
    this.handleKeydown = this.handleKeydown.bind(this);
    this.handleResultClick = this.handleResultClick.bind(this);
    this.handleDocumentClick = this.handleDocumentClick.bind(this);
    this.handleFocus = this.handleFocus.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
    this.handleClearClick = this.handleClearClick.bind(this);
  }

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      // Wait for search engine to be ready
      await this.waitForSearchEngine();
      
      // Initialize UI
      this.initializeUI();
      
      // Bind events
      this.bindEvents();
      
      this.isInitialized = true;
      console.log('[SearchInterface] Initialized successfully');
      
    } catch (error) {
      console.error('[SearchInterface] Failed to initialize:', error);
      throw error;
    }
  }

  async waitForSearchEngine() {
    // Check if search engine is already available
    if (window.searchEngine && window.searchEngine.initialized) {
      this.searchEngine = window.searchEngine;
      return;
    }
    
    // Wait for search engine to be ready
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Search engine initialization timeout'));
      }, 10000); // 10 second timeout
      
      const checkEngine = () => {
        if (window.searchEngine && window.searchEngine.initialized) {
          clearTimeout(timeout);
          this.searchEngine = window.searchEngine;
          resolve();
        } else {
          setTimeout(checkEngine, 100);
        }
      };
      
      // Also listen for the ready event
      window.addEventListener('searchEngineReady', () => {
        clearTimeout(timeout);
        this.searchEngine = window.searchEngine;
        resolve();
      }, { once: true });
      
      checkEngine();
    });
  }

  initializeUI() {
    // Create search container if it doesn't exist
    let container = document.getElementById(this.containerId);
    if (!container) {
      container = document.createElement('div');
      container.id = this.containerId;
      container.className = 'search-container';
      
      // Insert after navigation
      const nav = document.querySelector('.nav');
      if (nav) {
        nav.insertAdjacentElement('afterend', container);
      } else {
        document.body.insertBefore(container, document.body.firstChild);
      }
    }

    // Create search HTML structure
    container.innerHTML = `
      <div class="search-wrapper">
        <div class="search-input-container">
          <input 
            type="text" 
            id="${this.inputId}"
            class="search-input"
            placeholder="Search books, chapters, characters..."
            autocomplete="off"
            spellcheck="false"
          />
          <button class="search-clear" aria-label="Clear search" style="display: none;">
            <span class="search-clear-icon">×</span>
          </button>
        </div>
        <div id="${this.resultsId}" class="search-results" style="display: none;"></div>
      </div>
    `;
    
    // Add search styles
    this.addSearchStyles();
  }

  addSearchStyles() {
    // Check if styles already exist
    if (document.getElementById('search-interface-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'search-interface-styles';
    style.textContent = `
      .search-container {
        position: relative;
        max-width: 600px;
        margin: 1rem auto;
        padding: 0 1rem;
        z-index: 1000;
      }
      
      .search-wrapper {
        position: relative;
        width: 100%;
      }
      
      .search-input-container {
        position: relative;
        display: flex;
        align-items: center;
      }
      
      .search-input {
        width: 100%;
        padding: 0.75rem 1rem;
        border: 2px solid var(--border);
        border-radius: 0.5rem;
        background: var(--bg);
        color: var(--text);
        font-size: 1rem;
        font-family: inherit;
        transition: all 0.2s ease;
        outline: none;
      }
      
      .search-input:focus {
        border-color: var(--accent);
        box-shadow: 0 0 0 3px var(--bg-secondary);
      }
      
      .search-clear {
        position: absolute;
        right: 0.5rem;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        color: var(--text-secondary);
        cursor: pointer;
        padding: 0.25rem;
        border-radius: 0.25rem;
        font-size: 1.25rem;
        line-height: 1;
        transition: color 0.2s ease;
      }
      
      .search-clear:hover {
        color: var(--text);
        background: var(--bg-secondary);
      }
      
      .search-results {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: var(--card);
        border: 1px solid var(--border);
        border-radius: 0.5rem;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        max-height: 400px;
        overflow-y: auto;
        z-index: 1001;
        margin-top: 0.25rem;
      }
      
      .search-result {
        padding: 0.75rem 1rem;
        border-bottom: 1px solid var(--border);
        cursor: pointer;
        transition: background-color 0.15s ease;
      }
      
      .search-result:last-child {
        border-bottom: none;
      }
      
      .search-result:hover,
      .search-result.selected {
        background: var(--bg-secondary);
      }
      
      .search-result-title {
        font-weight: 600;
        color: var(--text);
        margin-bottom: 0.25rem;
        font-size: 0.95rem;
      }
      
      .search-result-subtitle {
        color: var(--text-secondary);
        font-size: 0.85rem;
        margin-bottom: 0.25rem;
      }
      
      .search-result-description {
        color: var(--text-secondary);
        font-size: 0.8rem;
        line-height: 1.4;
      }
      
      .search-result-type {
        display: inline-block;
        padding: 0.125rem 0.5rem;
        background: var(--bg-secondary);
        color: var(--text-secondary);
        border-radius: 1rem;
        font-size: 0.75rem;
        font-weight: 500;
        text-transform: capitalize;
        margin-right: 0.5rem;
      }
      
      .search-result-type.book {
        background: #dbeafe;
        color: #1e40af;
      }
      
      .search-result-type.character {
        background: #fecaca;
        color: #dc2626;
      }
      
      .search-result-type.chapter {
        background: #d1fae5;
        color: #059669;
      }
      
      .search-result-type.category {
        background: #fef3c7;
        color: #d97706;
      }
      
      .search-empty {
        padding: 2rem 1rem;
        text-align: center;
        color: var(--text-secondary);
        font-size: 0.9rem;
      }
      
      .search-loading {
        padding: 1rem;
        text-align: center;
        color: var(--text-secondary);
        font-size: 0.9rem;
      }
      
      /* Mobile responsiveness */
      @media (max-width: 768px) {
        .search-container {
          margin: 0.5rem auto;
          padding: 0 0.5rem;
        }
        
        .search-input {
          font-size: 16px; /* Prevent zoom on iOS */
        }
        
        .search-results {
          max-height: 300px;
        }
      }
      
    `;
    
    document.head.appendChild(style);
  }

  bindEvents() {
    const input = document.getElementById(this.inputId);
    const results = document.getElementById(this.resultsId);
    const clearButton = this.container?.querySelector('.search-clear');
    
    if (!input) {
      console.error('[SearchInterface] Search input not found');
      return;
    }
    
    // Input events
    input.addEventListener('input', this.handleInput);
    input.addEventListener('keydown', this.handleKeydown);
    input.addEventListener('focus', this.handleFocus);
    input.addEventListener('blur', this.handleBlur);
    
    // Clear button
    if (clearButton) {
      clearButton.addEventListener('click', this.handleClearClick);
    }
    
    // Results events
    if (results) {
      results.addEventListener('click', this.handleResultClick);
    }
    
    // Document events
    document.addEventListener('click', this.handleDocumentClick);
    
    // Store references
    this.input = input;
    this.resultsContainer = results;
    this.clearButton = clearButton;
    this.container = document.getElementById(this.containerId);
  }

  handleInput(event) {
    const query = event.target.value.trim();
    this.currentQuery = query;
    
    // Show/hide clear button
    if (this.clearButton) {
      this.clearButton.style.display = query ? 'block' : 'none';
    }
    
    if (query.length < this.minQueryLength) {
      this.hideResults();
      return;
    }
    
    this.performSearch(query);
  }

  handleKeydown(event) {
    if (!this.isVisible) return;
    
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.navigateResults(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.navigateResults(-1);
        break;
      case 'Enter':
        event.preventDefault();
        this.selectResult();
        break;
      case 'Escape':
        event.preventDefault();
        this.hideResults();
        this.input.blur();
        break;
    }
  }

  handleFocus() {
    if (this.currentQuery.length >= this.minQueryLength && this.results.length > 0) {
      this.showResults();
    }
  }

  handleBlur() {
    // Delay hiding to allow clicks on results
    setTimeout(() => {
      this.hideResults();
    }, 150);
  }

  handleResultClick(event) {
    const resultElement = event.target.closest('.search-result');
    if (resultElement) {
      const url = resultElement.dataset.url;
      if (url) {
        window.location.href = url;
      }
    }
  }

  handleDocumentClick(event) {
    if (!this.container?.contains(event.target)) {
      this.hideResults();
    }
  }

  handleClearClick() {
    if (this.input) {
      this.input.value = '';
      this.clearSearch();
      this.input.focus();
    }
  }

  performSearch(query) {
    if (!this.searchEngine) {
      console.warn('[SearchInterface] Search engine not available');
      return;
    }
    
    // Use debounced search for performance
    this.searchEngine.debouncedSearch(query, (results) => {
      this.results = results;
      this.selectedIndex = -1;
      this.renderResults();
      
      if (results.length > 0) {
        this.showResults();
      } else {
        this.hideResults();
      }
    }, this.debounceDelay);
  }

  renderResults() {
    if (!this.resultsContainer) return;
    
    if (this.results.length === 0) {
      this.resultsContainer.innerHTML = `
        <div class="search-empty">
          No results found for "${this.currentQuery}"
        </div>
      `;
      return;
    }
    
    const resultsHTML = this.results.map((result, index) => `
      <div class="search-result${index === this.selectedIndex ? ' selected' : ''}" 
           data-url="${this.escapeHtml(result.url)}" 
           data-index="${index}">
        <div class="search-result-title">
          <span class="search-result-type ${this.escapeHtml(result.type)}">${this.escapeHtml(result.type)}</span>
          ${this.escapeHtml(result.text)}
        </div>
        ${result.subtitle ? `<div class="search-result-subtitle">${this.escapeHtml(result.subtitle)}</div>` : ''}
      </div>
    `).join('');
    
    this.resultsContainer.innerHTML = resultsHTML;
  }

  navigateResults(direction) {
    if (this.results.length === 0) return;
    
    this.selectedIndex += direction;
    
    if (this.selectedIndex >= this.results.length) {
      this.selectedIndex = 0;
    } else if (this.selectedIndex < 0) {
      this.selectedIndex = this.results.length - 1;
    }
    
    this.updateSelection();
  }

  updateSelection() {
    const resultElements = this.resultsContainer?.querySelectorAll('.search-result');
    if (!resultElements) return;
    
    resultElements.forEach((element, index) => {
      element.classList.toggle('selected', index === this.selectedIndex);
    });
  }

  selectResult() {
    if (this.selectedIndex >= 0 && this.selectedIndex < this.results.length) {
      const result = this.results[this.selectedIndex];
      if (result.url) {
        window.location.href = result.url;
      }
    }
  }

  showResults() {
    if (this.resultsContainer && this.results.length > 0) {
      this.resultsContainer.style.display = 'block';
      this.isVisible = true;
    }
  }

  hideResults() {
    if (this.resultsContainer) {
      this.resultsContainer.style.display = 'none';
      this.isVisible = false;
    }
  }

  clearSearch() {
    this.currentQuery = '';
    this.results = [];
    this.selectedIndex = -1;
    this.hideResults();
    
    if (this.clearButton) {
      this.clearButton.style.display = 'none';
    }
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Public methods for external control
  focus() {
    this.input?.focus();
  }

  clear() {
    if (this.input) {
      this.input.value = '';
    }
    this.clearSearch();
  }

  setQuery(query) {
    if (this.input) {
      this.input.value = query;
      this.currentQuery = query;
      if (query.length >= this.minQueryLength) {
        this.performSearch(query);
      }
    }
  }

  // Cleanup method to prevent memory leaks
  destroy() {
    if (!this.isInitialized) return;

    // Remove event listeners
    if (this.input) {
      this.input.removeEventListener('input', this.handleInput);
      this.input.removeEventListener('keydown', this.handleKeydown);
      this.input.removeEventListener('focus', this.handleFocus);
      this.input.removeEventListener('blur', this.handleBlur);
    }

    if (this.clearButton) {
      this.clearButton.removeEventListener('click', this.handleClearClick);
    }

    if (this.resultsContainer) {
      this.resultsContainer.removeEventListener('click', this.handleResultClick);
    }

    document.removeEventListener('click', this.handleDocumentClick);

    // Clear references
    this.input = null;
    this.resultsContainer = null;
    this.clearButton = null;
    this.container = null;
    this.searchEngine = null;
    this.results = [];
    this.isInitialized = false;
  }
}

// Global search interface instance
window.searchInterface = null;

// Initialize search interface when DOM is ready
function initializeSearchInterface() {
  // Clean up existing instance to prevent memory leaks
  if (window.searchInterface) {
    window.searchInterface.destroy();
  }
  
  window.searchInterface = new SearchInterface({
    maxResults: 8,
    minQueryLength: 1,
    debounceDelay: 150
  });
  
  window.searchInterface.initialize().catch(error => {
    console.error('[SearchInterface] Failed to initialize:', error);
  });
}

// Auto-initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeSearchInterface);
} else {
  initializeSearchInterface();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SearchInterface;
}