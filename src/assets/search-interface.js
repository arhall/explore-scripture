/**
 * Search Interface for Explore Scripture
 * Provides autocomplete search with real-time suggestions across all content
 */

class SearchInterface {
  constructor(options = {}) {
    // Parameter validation
    if (options && typeof options !== 'object') {
      throw new TypeError('SearchInterface options must be an object');
    }

    this.containerId = options.containerId || 'search-container';
    this.inputId = options.inputId || 'search-input';
    this.resultsId = options.resultsId || 'search-results';
    this.maxResults = Math.max(1, parseInt(options.maxResults) || 8);
    this.minQueryLength = Math.max(0, parseInt(options.minQueryLength) || 1);
    this.debounceDelay = Math.max(0, parseInt(options.debounceDelay) || 150);

    this.isInitialized = false;
    this.searchEngine = null;
    this.currentQuery = '';
    this.selectedIndex = -1;
    this.results = [];
    this.isVisible = false;
    this.styleTimeout = null; // Track style application timeout

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
      console.log('[SearchInterface] Initialized successfully - v4.5.0 - Fixed error boundaries and edge cases');
      
      // Bind suggestion events
      this.bindSuggestionEvents();
      
      // Force apply styles after initialization
      this.styleTimeout = setTimeout(() => {
        if (this.isInitialized) { // Check if component is still active
          const container = document.getElementById(this.containerId);
          if (container) {
            container.style.maxWidth = '680px';
            container.style.margin = '2rem auto 3rem auto';
            console.log('[SearchInterface] Applied premium container styles');
          }
        }
        this.styleTimeout = null;
      }, 100);
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
      let resolved = false; // Prevent multiple resolution
      let pollingInterval = null;
      
      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          if (pollingInterval) {
            clearInterval(pollingInterval);
          }
          reject(new Error('Search engine initialization timeout'));
        }
      }, 10000); // 10 second timeout

      const resolveOnce = () => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          if (pollingInterval) {
            clearInterval(pollingInterval);
          }
          this.searchEngine = window.searchEngine;
          resolve();
        }
      };

      // Polling with interval instead of recursive setTimeout to prevent stack issues
      pollingInterval = setInterval(() => {
        if (window.searchEngine && window.searchEngine.initialized) {
          resolveOnce();
        }
      }, 100);

      // Also listen for the ready event
      window.addEventListener('searchEngineReady', resolveOnce, { once: true });
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
      try {
        const nav = document.querySelector('.nav');
        if (nav && nav.parentNode) {
          nav.insertAdjacentElement('afterend', container);
        } else {
          // Fallback: insert at beginning of body
          if (document.body && document.body.firstChild) {
            document.body.insertBefore(container, document.body.firstChild);
          } else if (document.body) {
            document.body.appendChild(container);
          } else {
            throw new Error('Unable to find suitable container for search interface');
          }
        }
      } catch (error) {
        console.error('[SearchInterface] Failed to insert container:', error);
        throw error;
      }
    }

    // Create search HTML structure
    container.innerHTML = `
      <div class="search-wrapper">
        <div class="search-hero">
          <h2 class="search-title">Discover Scripture</h2>
          <p class="search-subtitle">Search 66 books, 5,500+ characters, and comprehensive commentary</p>
        </div>
        <div class="search-input-container" role="combobox" aria-expanded="false" aria-haspopup="listbox">
          <input 
            type="text" 
            id="${this.inputId}"
            class="search-input"
            placeholder="Try 'Genesis creation' or 'David'"
            autocomplete="off"
            spellcheck="false"
            aria-label="Search scripture, characters, and commentary"
            aria-describedby="search-instructions"
            role="searchbox"
            aria-autocomplete="list"
            aria-controls="${this.resultsId}"
          />
          <div class="search-shortcut" id="searchShortcut" aria-label="Keyboard shortcut Command K">
            <span class="shortcut-key">${this.getShortcutKey()}</span>
            <span class="shortcut-text">K</span>
          </div>
          <button class="search-clear" aria-label="Clear search" style="display: none;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div id="search-instructions" class="sr-only">
          Type to search for books, chapters, or biblical characters. Use arrow keys to navigate results and Enter to select.
        </div>
        <div class="search-suggestions" role="group" aria-label="Popular search suggestions">
          <span class="suggestion-label">Popular:</span>
          <button class="search-suggestion" data-query="Genesis creation" aria-label="Search for Genesis creation">Genesis creation</button>
          <button class="search-suggestion" data-query="Jesus parables" aria-label="Search for Jesus parables">Jesus parables</button>
          <button class="search-suggestion" data-query="David" aria-label="Search for David">David</button>
          <button class="search-suggestion" data-query="Exodus" aria-label="Search for Exodus">Exodus</button>
        </div>
        <div id="${this.resultsId}" class="search-results" role="listbox" aria-label="Search results" style="display: none;"></div>
        <div aria-live="polite" aria-atomic="true" class="sr-only" id="search-announcements"></div>
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
        max-width: 680px !important;
        margin: 2rem auto 3rem auto !important;
        padding: 0 1.5rem !important;
        z-index: 1000;
        display: flex !important;
        justify-content: center !important;
      }
      
      .sr-only {
        position: absolute !important;
        width: 1px !important;
        height: 1px !important;
        padding: 0 !important;
        margin: -1px !important;
        overflow: hidden !important;
        clip: rect(0,0,0,0) !important;
        white-space: nowrap !important;
        border: 0 !important;
      }
      
      .search-wrapper {
        position: relative;
        width: 100%;
      }

      .search-hero {
        text-align: center;
        margin-bottom: 2rem;
        opacity: 0;
        animation: fadeInUp 0.8s ease forwards;
      }

      .search-title {
        font-size: 2.25rem;
        font-weight: 700;
        color: rgba(255, 255, 255, 0.95);
        margin: 0 0 0.5rem 0;
        letter-spacing: -0.025em;
        line-height: 1.1;
      }

      .search-subtitle {
        font-size: 1.125rem;
        color: rgba(156, 163, 175, 0.9);
        margin: 0;
        font-weight: 400;
        line-height: 1.4;
      }

      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      .search-input-container {
        position: relative;
        display: flex;
        align-items: center;
        background: rgba(51, 65, 85, 0.8);
        border: 1px solid rgba(75, 85, 99, 0.4);
        border-radius: 12px;
        transition: all 0.2s ease;
        min-height: 48px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        opacity: 0;
        animation: fadeInUp 0.8s ease 0.2s forwards;
      }

      .search-input-container:hover {
        border-color: rgba(59, 130, 246, 0.5);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      .search-input-container:focus-within {
        border-color: rgba(59, 130, 246, 0.8);
        box-shadow: 
          0 4px 12px rgba(0, 0, 0, 0.15),
          0 0 0 3px rgba(59, 130, 246, 0.1);
      }

      
      .search-input {
        flex: 1;
        padding: 14px 16px 14px 20px;
        background: transparent;
        border: none;
        color: rgba(255, 255, 255, 0.95);
        font-size: 15px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, system-ui, sans-serif;
        outline: none;
        font-weight: 400;
        line-height: 1.4;
        min-width: 0;
      }
      
      .search-input::placeholder {
        color: rgba(156, 163, 175, 0.6);
        font-weight: 400;
        transition: color 0.3s ease;
      }

      .search-input:focus::placeholder {
        color: rgba(156, 163, 175, 0.4);
      }

      .search-suggestions {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-top: 16px;
        flex-wrap: wrap;
        justify-content: center;
        opacity: 0;
        animation: fadeInUp 0.8s ease 0.4s forwards;
      }

      .suggestion-label {
        color: rgba(156, 163, 175, 0.7);
        font-size: 14px;
        font-weight: 500;
        margin-right: 4px;
      }

      .search-suggestion {
        background: rgba(59, 130, 246, 0.1);
        border: 1px solid rgba(59, 130, 246, 0.2);
        border-radius: 20px;
        padding: 6px 16px;
        color: rgba(147, 197, 253, 0.9);
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s ease;
        outline: none;
      }

      .search-suggestion:hover {
        background: rgba(59, 130, 246, 0.2);
        border-color: rgba(59, 130, 246, 0.4);
        color: rgba(147, 197, 253, 1);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
      }

      .search-suggestion:active {
        transform: translateY(0);
      }

      .search-shortcut {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 4px 6px;
        margin-right: 12px;
        background: rgba(17, 24, 39, 0.6);
        border: 1px solid rgba(75, 85, 99, 0.4);
        border-radius: 4px;
        font-size: 11px;
        color: rgba(156, 163, 175, 0.7);
        gap: 1px;
        user-select: none;
        transition: all 0.2s ease;
        font-family: ui-monospace, 'SF Mono', 'Monaco', 'Consolas', monospace;
        font-weight: 500;
        flex-shrink: 0;
      }

      .search-input-container:hover .search-shortcut {
        background: rgba(17, 24, 39, 0.9);
        border-color: rgba(75, 85, 99, 0.8);
        color: rgba(156, 163, 175, 1);
      }

      .search-input-container:focus-within .search-shortcut {
        opacity: 0;
        pointer-events: none;
        transform: scale(0.9);
      }

      .shortcut-key {
        font-weight: 600;
        font-size: 11px;
        line-height: 1;
      }

      .shortcut-text {
        font-weight: 600;
        font-size: 11px;
        line-height: 1;
      }
      
      .search-clear {
        padding: 6px 8px;
        background: transparent;
        border: none;
        color: rgba(255, 255, 255, 0.4);
        cursor: pointer;
        border-radius: 6px;
        font-size: 16px;
        line-height: 1;
        transition: all 0.25s ease;
        margin-right: 6px;
        display: none;
      }
      
      .search-clear:hover {
        color: rgba(255, 255, 255, 0.8);
        background: rgba(255, 255, 255, 0.1);
        transform: scale(1.1);
      }
      
      .search-results {
        position: absolute;
        top: calc(100% + 4px);
        left: 0;
        right: 0;
        background: rgba(17, 24, 39, 0.95);
        border: 1px solid rgba(75, 85, 99, 0.6);
        border-radius: 8px;
        box-shadow: 
          0 10px 25px rgba(0, 0, 0, 0.25),
          0 4px 10px rgba(0, 0, 0, 0.1);
        max-height: 400px;
        overflow-y: auto;
        overflow-x: hidden;
        z-index: 1001;
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
      }
      
      .search-result {
        padding: 12px 16px;
        border-bottom: 1px solid rgba(75, 85, 99, 0.3);
        cursor: pointer;
        transition: background-color 0.15s ease;
      }
      
      .search-result:last-child {
        border-bottom: none;
      }
      
      .search-result:hover,
      .search-result.selected {
        background: rgba(59, 130, 246, 0.1);
      }
      
      .search-result-title {
        font-weight: 600;
        color: rgba(243, 244, 246, 0.95);
        margin-bottom: 4px;
        font-size: 14px;
        line-height: 1.3;
      }
      
      .search-result-subtitle {
        color: rgba(156, 163, 175, 0.9);
        font-size: 13px;
        margin-bottom: 6px;
        font-weight: 500;
        line-height: 1.2;
      }
      
      .search-result-description {
        color: rgba(156, 163, 175, 0.7);
        font-size: 12px;
        line-height: 1.4;
        font-weight: 400;
      }
      
      .search-result-type {
        display: inline-block;
        padding: 2px 8px;
        background: rgba(75, 85, 99, 0.6);
        color: rgba(156, 163, 175, 0.9);
        border-radius: 4px;
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        margin-right: 8px;
        letter-spacing: 0.5px;
      }
      
      .search-result-type.book {
        background: rgba(59, 130, 246, 0.2);
        color: rgba(147, 197, 253, 1);
      }
      
      .search-result-type.character {
        background: rgba(239, 68, 68, 0.2);
        color: rgba(252, 165, 165, 1);
      }
      
      .search-result-type.chapter {
        background: rgba(34, 197, 94, 0.2);
        color: rgba(134, 239, 172, 1);
      }
      
      .search-result-type.category {
        background: rgba(245, 158, 11, 0.2);
        color: rgba(253, 230, 138, 1);
      }
      
      .search-empty {
        padding: 2rem 1rem;
        text-align: center;
        color: rgba(255, 255, 255, 0.5);
      }

      /* Mobile Responsive Styles */
      @media (max-width: 768px) {
        .search-container {
          max-width: 100% !important;
          margin: 1.5rem auto 2rem auto !important;
          padding: 0 1rem !important;
        }

        .search-hero {
          margin-bottom: 1.5rem;
        }

        .search-title {
          font-size: 1.875rem;
        }

        .search-subtitle {
          font-size: 1rem;
        }

        .search-input-container {
          min-height: 46px;
          border-radius: 10px;
        }

        .search-input {
          font-size: 16px; /* Prevents zoom on iOS */
          padding: 12px 14px 12px 16px;
        }

        .search-shortcut {
          display: none; /* Hide keyboard shortcut on mobile */
        }

        .search-suggestions {
          margin-top: 12px;
          gap: 8px;
        }

        .search-suggestion {
          font-size: 13px;
          padding: 5px 12px;
        }

        .search-results {
          max-height: 60vh;
        }
      }

      @media (max-width: 480px) {
        .search-container {
          padding: 0 1rem !important;
          margin: 1rem auto 1.5rem auto !important;
        }

        .search-hero {
          margin-bottom: 1.25rem;
        }

        .search-title {
          font-size: 1.75rem;
        }

        .search-subtitle {
          font-size: 0.9rem;
        }

        .search-input-container {
          min-height: 44px;
          border-radius: 8px;
        }

        .search-input {
          padding: 10px 12px 10px 14px;
          font-size: 16px;
        }

        .search-shortcut {
          margin-right: 8px;
          padding: 3px 5px;
          font-size: 10px;
        }

        .search-suggestions {
          margin-top: 10px;
          gap: 6px;
        }

        .suggestion-label {
          font-size: 13px;
        }

        .search-suggestion {
          font-size: 12px;
          padding: 4px 10px;
        }

        .search-result {
          padding: 12px 14px;
        }

        .search-result-title {
          font-size: 14px;
        }

        .search-result-subtitle {
          font-size: 13px;
        }
      }
      
      .search-loading {
        padding: 1.5rem;
        text-align: center;
        color: rgba(255, 255, 255, 0.5);
        font-size: 14px;
        font-weight: 500;
      }
    `;

    document.head.appendChild(style);
  }

  bindEvents() {
    const container = document.getElementById(this.containerId);
    const input = document.getElementById(this.inputId);
    const results = document.getElementById(this.resultsId);
    const clearButton = container?.querySelector('.search-clear');

    if (!input) {
      console.error('[SearchInterface] Search input not found');
      return;
    }

    if (!container) {
      console.error('[SearchInterface] Search container not found');
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
    this.container = container;
  }

  bindSuggestionEvents() {
    if (!this.container) {
      console.warn('[SearchInterface] Container not available for suggestion events');
      return;
    }

    // Use event delegation to handle dynamically added suggestions
    this.handleSuggestionClick = (e) => {
      const suggestion = e.target.closest('.search-suggestion');
      if (suggestion) {
        e.preventDefault();
        e.stopPropagation();
        
        const query = suggestion.dataset.query;
        if (query && this.input) {
          this.input.value = query;
          this.currentQuery = query;
          this.input.focus();
          this.performSearch(query);
        }
      }
    };
    
    this.container.addEventListener('click', this.handleSuggestionClick);
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
    this.updateShortcutHint();
  }

  handleBlur() {
    // Clear any existing blur timeout to prevent multiple executions
    if (this.blurTimeout) {
      clearTimeout(this.blurTimeout);
    }
    
    // Delay hiding to allow clicks on results
    this.blurTimeout = setTimeout(() => {
      if (this.isInitialized) {  // Only execute if component is still active
        this.hideResults();
      }
      this.blurTimeout = null;
    }, 150);
    this.updateShortcutHint();
  }

  handleResultClick(event) {
    try {
      const resultElement = event.target.closest('.search-result');
      if (resultElement) {
        const url = resultElement.dataset.url;
        if (url && typeof url === 'string' && url.trim()) {
          // Basic URL validation
          if (url.startsWith('/') || url.startsWith('http')) {
            window.location.href = url;
          } else {
            console.warn('[SearchInterface] Invalid URL format:', url);
          }
        } else {
          console.warn('[SearchInterface] No valid URL found for result');
        }
      }
    } catch (error) {
      console.error('[SearchInterface] Error handling result click:', error);
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

    if (!query || typeof query !== 'string') {
      console.warn('[SearchInterface] Invalid search query:', query);
      this.hideResults();
      return;
    }

    // Use debounced search for performance
    try {
      this.searchEngine.debouncedSearch(
        query,
        results => {
          // Check if component is still initialized to prevent race conditions
          if (!this.isInitialized) {
            console.log('[SearchInterface] Ignoring search results - component destroyed');
            return;
          }
          
          if (!Array.isArray(results)) {
            console.warn('[SearchInterface] Invalid search results:', results);
            return;
          }
          
          this.results = results;
          this.selectedIndex = -1;
          this.renderResults();

          if (results.length > 0) {
            this.showResults();
          } else {
            this.hideResults();
          }
        },
        this.debounceDelay
      );
    } catch (error) {
      console.error('[SearchInterface] Search error:', error);
      this.hideResults();
    }
  }

  renderResults() {
    if (!this.resultsContainer) return;

    if (this.results.length === 0) {
      this.resultsContainer.innerHTML = `
        <div class="search-empty" role="status" aria-live="polite">
          No results found for "${this.escapeHtml(this.currentQuery || '')}"
        </div>
      `;
      return;
    }

    const resultsHTML = this.results
      .map(
        (result, index) => `
      <div class="search-result${index === this.selectedIndex ? ' selected' : ''}" 
           data-url="${this.escapeHtml(result.url)}" 
           data-index="${index}"
           role="option"
           aria-selected="${index === this.selectedIndex ? 'true' : 'false'}"
           tabindex="-1">
        <div class="search-result-title">
          <span class="search-result-type ${this.escapeHtml(result.type)}" aria-label="${this.escapeHtml(result.type)} type">${this.escapeHtml(result.type)}</span>
          ${this.escapeHtml(result.text)}
        </div>
        ${result.subtitle ? `<div class="search-result-subtitle">${this.escapeHtml(result.subtitle)}</div>` : ''}
      </div>
    `
      )
      .join('');

    this.resultsContainer.innerHTML = resultsHTML;
    
    // Announce results to screen readers
    this.announceResults();
  }

  navigateResults(direction) {
    if (!Array.isArray(this.results) || this.results.length === 0) {
      this.selectedIndex = -1;
      return;
    }

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
      const isSelected = index === this.selectedIndex;
      element.classList.toggle('selected', isSelected);
      element.setAttribute('aria-selected', isSelected ? 'true' : 'false');
    });
    
    // Announce selection change to screen readers
    if (this.selectedIndex >= 0 && this.selectedIndex < this.results.length) {
      const selectedResult = this.results[this.selectedIndex];
      this.announceSelection(selectedResult);
    }
  }

  selectResult() {
    try {
      if (this.selectedIndex >= 0 && 
          this.selectedIndex < this.results.length && 
          Array.isArray(this.results)) {
        const result = this.results[this.selectedIndex];
        if (result && result.url && typeof result.url === 'string' && result.url.trim()) {
          // Basic URL validation
          if (result.url.startsWith('/') || result.url.startsWith('http')) {
            window.location.href = result.url;
          } else {
            console.warn('[SearchInterface] Invalid result URL:', result.url);
          }
        } else {
          console.warn('[SearchInterface] No valid URL in selected result');
        }
      }
    } catch (error) {
      console.error('[SearchInterface] Error selecting result:', error);
    }
  }

  showResults() {
    if (this.resultsContainer && this.results.length > 0) {
      this.resultsContainer.style.display = 'block';
      this.isVisible = true;
      this.updateExpandedState(true);
    }
  }

  hideResults() {
    if (this.resultsContainer) {
      this.resultsContainer.style.display = 'none';
      this.isVisible = false;
      this.updateExpandedState(false);
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
    if (text === null || text === undefined) {
      return '';
    }
    if (typeof text !== 'string') {
      text = String(text);
    }
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

  // Get platform-specific shortcut key
  getShortcutKey() {
    // Detect platform
    const isMac = /Mac|iPhone|iPad|iPod/.test(navigator.userAgent) || navigator.platform === 'MacIntel';
    return isMac ? '⌘' : 'Ctrl+';
  }

  // Update shortcut hint visibility
  updateShortcutHint() {
    const shortcutHint = document.getElementById('searchShortcut');
    if (shortcutHint) {
      const input = document.getElementById(this.inputId);
      if (input) {
        shortcutHint.style.display = input === document.activeElement ? 'none' : 'flex';
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

    if (this.container && this.handleSuggestionClick) {
      this.container.removeEventListener('click', this.handleSuggestionClick);
    }

    document.removeEventListener('click', this.handleDocumentClick);

    // Clear any pending timeouts
    if (this.blurTimeout) {
      clearTimeout(this.blurTimeout);
      this.blurTimeout = null;
    }
    
    if (this.styleTimeout) {
      clearTimeout(this.styleTimeout);
      this.styleTimeout = null;
    }

    // Clear references
    this.input = null;
    this.resultsContainer = null;
    this.clearButton = null;
    this.container = null;
    this.searchEngine = null;
    this.results = [];
    this.isInitialized = false;
  }

  // Accessibility methods for screen reader announcements
  announceResults() {
    const announcer = document.getElementById('search-announcements');
    if (!announcer) return;

    const resultCount = Array.isArray(this.results) ? this.results.length : 0;
    const query = this.escapeHtml(this.currentQuery || '');
    let message = '';
    
    if (resultCount === 0) {
      message = `No results found for "${query}"`;
    } else if (resultCount === 1) {
      message = `1 result found for "${query}". Use arrow keys to navigate.`;
    } else {
      message = `${resultCount} results found for "${query}". Use arrow keys to navigate.`;
    }
    
    announcer.textContent = message;
  }

  announceSelection(result) {
    const announcer = document.getElementById('search-announcements');
    if (!announcer || !result) return;

    const position = this.selectedIndex + 1;
    const total = Array.isArray(this.results) ? this.results.length : 0;
    const type = this.escapeHtml(result.type || '');
    const text = this.escapeHtml(result.text || '');
    const subtitle = result.subtitle ? ', ' + this.escapeHtml(result.subtitle) : '';
    const message = `${position} of ${total}: ${type} ${text}${subtitle}`;
    
    announcer.textContent = message;
  }

  // Update ARIA expanded state
  updateExpandedState(expanded) {
    const inputContainer = this.container?.querySelector('[role="combobox"]');
    if (inputContainer) {
      inputContainer.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    }
  }
}

// Export SearchInterface class to global scope
window.SearchInterface = SearchInterface;

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
    debounceDelay: 150,
  });

  window.searchInterface.initialize().catch(error => {
    console.error('[SearchInterface] Failed to initialize:', error);
  });
}

// Auto-initialize disabled - will be initialized manually from base.njk
// if (document.readyState === 'loading') {
//   document.addEventListener('DOMContentLoaded', initializeSearchInterface);
// } else {
//   initializeSearchInterface();
// }

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SearchInterface;
}
