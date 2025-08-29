/**
 * Unified Search Interface for Bible Explorer
 * Integrates with the advanced search engine and provides a consistent search experience
 */

class UnifiedSearch {
  constructor() {
    this.searchEngine = null;
    this.searchInput = null;
    this.searchResults = null;
    this.searchSuggestions = null;
    this.searchFilters = null;
    this.isInitialized = false;
    this.currentQuery = '';
    this.searchTimeout = null;
    this.minQueryLength = 2;
    this.searchDelay = 300; // ms
    
    this.filters = {
      type: 'all', // 'all', 'books', 'characters', 'chapters'
      testament: 'all', // 'all', 'old', 'new'
      category: 'all'
    };
    
    this.init();
  }
  
  async init() {
    // Wait for SearchEngine to be available
    if (typeof SearchEngine === 'undefined') {
      setTimeout(() => this.init(), 100);
      return;
    }
    
    this.searchEngine = new SearchEngine();
    
    // Load data for search indices
    await this.loadSearchData();
    
    // Initialize UI components
    this.initializeUI();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Load search history
    this.loadSearchHistory();
    
    this.isInitialized = true;
    console.log('[UnifiedSearch] Initialized successfully');
  }
  
  async loadSearchData() {
    try {
      // Try to get data from global variables first
      const data = {};
      
      if (window.booksData) {
        data.books = window.booksData;
      }
      
      if (window.charactersData) {
        data.characters = Array.isArray(window.charactersData) 
          ? window.charactersData 
          : window.charactersData.characters || [];
      }
      
      if (window.chaptersData) {
        data.chapters = window.chaptersData;
      }
      
      // If no global data, try to fetch from endpoints
      if (Object.keys(data).length === 0) {
        console.log('[UnifiedSearch] No global data found, will search DOM elements');
        data.characters = this.extractCharactersFromDOM();
        data.books = this.extractBooksFromDOM();
      }
      
      await this.searchEngine.initializeIndices(data);
    } catch (error) {
      console.error('[UnifiedSearch] Error loading search data:', error);
    }
  }
  
  extractCharactersFromDOM() {
    const characters = [];
    
    // Extract from character cards
    document.querySelectorAll('.character-card, .character-item').forEach(card => {
      const nameElement = card.querySelector('h3, .character-name, [data-character-name]');
      const descElement = card.querySelector('.character-description, .description, p');
      const linkElement = card.querySelector('a[href*="/characters/"]');
      
      if (nameElement) {
        characters.push({
          name: nameElement.textContent.trim(),
          description: descElement ? descElement.textContent.trim() : '',
          slug: this.extractSlugFromUrl(linkElement ? linkElement.href : ''),
          significance: this.extractSignificance(card),
          testament: this.extractTestament(card)
        });
      }
    });
    
    return characters;
  }
  
  extractBooksFromDOM() {
    const books = [];
    
    // Extract from book cards or links
    document.querySelectorAll('.book-card, .book-item, a[href*="/books/"]').forEach(element => {
      const nameElement = element.querySelector('h3, .book-name, .book-title') || element;
      const categoryElement = element.querySelector('.category, .book-category');
      const testamentElement = element.querySelector('.testament, .book-testament');
      
      if (nameElement) {
        books.push({
          name: nameElement.textContent.trim(),
          slug: this.extractSlugFromUrl(element.href || ''),
          category: categoryElement ? categoryElement.textContent.trim() : '',
          testament: testamentElement ? testamentElement.textContent.trim() : this.guessTestament(nameElement.textContent)
        });
      }
    });
    
    return books;
  }
  
  extractSlugFromUrl(url) {
    const matches = url.match(/\/(books|characters)\/([^\/]+)\//);
    return matches ? matches[2] : '';
  }
  
  extractSignificance(element) {
    const significanceClasses = ['major', 'key', 'important', 'minor'];
    for (const cls of significanceClasses) {
      if (element.classList.contains(cls)) {
        return cls;
      }
    }
    return 'regular';
  }
  
  extractTestament(element) {
    const testamentClasses = ['old-testament', 'new-testament'];
    for (const cls of testamentClasses) {
      if (element.classList.contains(cls)) {
        return cls.replace('-testament', '');
      }
    }
    return 'unknown';
  }
  
  guessTestament(bookName) {
    const oldTestamentBooks = ['genesis', 'exodus', 'leviticus', 'numbers', 'deuteronomy', 'joshua', 'judges', 'ruth', 'samuel', 'kings', 'chronicles', 'ezra', 'nehemiah', 'esther', 'job', 'psalms', 'proverbs', 'ecclesiastes', 'song', 'isaiah', 'jeremiah', 'lamentations', 'ezekiel', 'daniel', 'hosea', 'joel', 'amos', 'obadiah', 'jonah', 'micah', 'nahum', 'habakkuk', 'zephaniah', 'haggai', 'zechariah', 'malachi'];
    const bookLower = bookName.toLowerCase();
    
    return oldTestamentBooks.some(book => bookLower.includes(book)) ? 'old' : 'new';
  }
  
  initializeUI() {
    // Find or create search input
    this.searchInput = document.querySelector('#unifiedSearch, .search-input, [data-search="input"]');
    if (!this.searchInput) {
      this.createSearchUI();
    }
    
    // Find or create results container
    this.searchResults = document.querySelector('#searchResults, .search-results, [data-search="results"]');
    if (!this.searchResults) {
      this.searchResults = this.createSearchResults();
    }
    
    // Find or create suggestions container
    this.searchSuggestions = document.querySelector('#searchSuggestions, .search-suggestions, [data-search="suggestions"]');
    if (!this.searchSuggestions) {
      this.searchSuggestions = this.createSearchSuggestions();
    }
    
    // Find or create filters
    this.searchFilters = document.querySelector('#searchFilters, .search-filters, [data-search="filters"]');
  }
  
  createSearchUI() {
    const searchContainer = document.createElement('div');
    searchContainer.className = 'unified-search-container';
    searchContainer.innerHTML = `
      <div class="search-input-container">
        <input 
          type="search" 
          id="unifiedSearch" 
          class="search-input"
          placeholder="Search Bible books, characters, and content..."
          autocomplete="off"
          spellcheck="false"
        >
        <button class="search-button" type="button" aria-label="Search">
          <span class="search-icon">🔍</span>
        </button>
        <button class="search-clear" type="button" aria-label="Clear search" style="display: none;">
          <span class="clear-icon">✕</span>
        </button>
      </div>
      <div class="search-loading" style="display: none;">
        <div class="loading-spinner"></div>
        <span>Searching...</span>
      </div>
    `;
    
    // Insert at the top of the main content or after nav
    const insertPoint = document.querySelector('main, .container, .content') || document.body;
    insertPoint.insertBefore(searchContainer, insertPoint.firstChild);
    
    this.searchInput = searchContainer.querySelector('#unifiedSearch');
  }
  
  createSearchResults() {
    const results = document.createElement('div');
    results.id = 'searchResults';
    results.className = 'search-results';
    results.style.display = 'none';
    
    const searchContainer = this.searchInput.closest('.unified-search-container') || document.body;
    searchContainer.appendChild(results);
    
    return results;
  }
  
  createSearchSuggestions() {
    const suggestions = document.createElement('div');
    suggestions.id = 'searchSuggestions';
    suggestions.className = 'search-suggestions';
    suggestions.style.display = 'none';
    
    const searchContainer = this.searchInput.closest('.unified-search-container') || document.body;
    searchContainer.appendChild(suggestions);
    
    return suggestions;
  }
  
  setupEventListeners() {
    if (!this.searchInput) return;
    
    // Search input events
    this.searchInput.addEventListener('input', (e) => {
      this.handleSearchInput(e.target.value);
    });
    
    this.searchInput.addEventListener('keydown', (e) => {
      this.handleKeyboardNavigation(e);
    });
    
    this.searchInput.addEventListener('focus', () => {
      this.handleSearchFocus();
    });
    
    this.searchInput.addEventListener('blur', (e) => {
      // Delay hiding suggestions to allow clicking on them
      setTimeout(() => this.handleSearchBlur(), 150);
    });
    
    // Search button
    const searchButton = document.querySelector('.search-button');
    if (searchButton) {
      searchButton.addEventListener('click', () => {
        this.performSearch(this.searchInput.value);
      });
    }
    
    // Clear button
    const clearButton = document.querySelector('.search-clear');
    if (clearButton) {
      clearButton.addEventListener('click', () => {
        this.clearSearch();
      });
    }
    
    // Filters (if available)
    if (this.searchFilters) {
      this.searchFilters.addEventListener('change', () => {
        this.handleFilterChange();
      });
    }
    
    // Click outside to close
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.unified-search-container')) {
        this.hideSuggestions();
      }
    });
  }
  
  handleSearchInput(value) {
    this.currentQuery = value;
    
    // Show/hide clear button
    const clearButton = document.querySelector('.search-clear');
    if (clearButton) {
      clearButton.style.display = value ? 'block' : 'none';
    }
    
    // Clear previous timeout
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    
    // If query is too short, hide results and suggestions
    if (value.length < this.minQueryLength) {
      this.hideResults();
      this.hideSuggestions();
      return;
    }
    
    // Debounce search
    this.searchTimeout = setTimeout(() => {
      this.performSearch(value);
    }, this.searchDelay);
  }
  
  handleKeyboardNavigation(e) {
    const suggestions = this.searchSuggestions.querySelectorAll('.suggestion-item');
    const currentFocus = this.searchSuggestions.querySelector('.suggestion-item.focused');
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (currentFocus) {
          const next = currentFocus.nextElementSibling;
          if (next) {
            currentFocus.classList.remove('focused');
            next.classList.add('focused');
          }
        } else if (suggestions.length > 0) {
          suggestions[0].classList.add('focused');
        }
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        if (currentFocus) {
          const prev = currentFocus.previousElementSibling;
          if (prev) {
            currentFocus.classList.remove('focused');
            prev.classList.add('focused');
          }
        }
        break;
        
      case 'Enter':
        if (currentFocus) {
          e.preventDefault();
          currentFocus.click();
        }
        break;
        
      case 'Escape':
        this.hideSuggestions();
        this.searchInput.blur();
        break;
    }
  }
  
  handleSearchFocus() {
    if (this.currentQuery.length >= this.minQueryLength) {
      this.showSuggestions();
    }
  }
  
  handleSearchBlur() {
    // Hide suggestions unless clicking on them
    this.hideSuggestions();
  }
  
  handleFilterChange() {
    // Update filters from UI
    const typeFilter = this.searchFilters.querySelector('[name="type"]');
    const testamentFilter = this.searchFilters.querySelector('[name="testament"]');
    const categoryFilter = this.searchFilters.querySelector('[name="category"]');
    
    if (typeFilter) this.filters.type = typeFilter.value;
    if (testamentFilter) this.filters.testament = testamentFilter.value;
    if (categoryFilter) this.filters.category = categoryFilter.value;
    
    // Re-run search with new filters
    if (this.currentQuery.length >= this.minQueryLength) {
      this.performSearch(this.currentQuery);
    }
  }
  
  async performSearch(query) {
    if (!this.searchEngine || query.length < this.minQueryLength) {
      return;
    }
    
    // Show loading state
    this.showLoading();
    
    try {
      // Apply filters to search options
      const searchOptions = {
        filters: this.filters,
        limit: 50,
        offset: 0
      };
      
      const searchResults = this.searchEngine.search(query, searchOptions);
      
      // Display results
      this.displayResults(searchResults);
      this.displaySuggestions(searchResults.suggestions);
      
      // Hide loading state
      this.hideLoading();
      
      console.log(`[UnifiedSearch] Found ${searchResults.results.length} results for "${query}"`);
      
    } catch (error) {
      console.error('[UnifiedSearch] Search error:', error);
      this.hideLoading();
      this.showError('Search temporarily unavailable. Please try again.');
    }
  }
  
  displayResults(searchResults) {
    if (!this.searchResults) return;
    
    const { results, stats } = searchResults;
    
    if (results.length === 0) {
      this.searchResults.innerHTML = `
        <div class="no-results">
          <div class="no-results-icon">🔍</div>
          <h3>No results found</h3>
          <p>Try different keywords or check your spelling.</p>
        </div>
      `;
    } else {
      let html = `
        <div class="search-stats">
          Found ${results.length} result${results.length !== 1 ? 's' : ''} in ${stats.totalTime.toFixed(0)}ms
        </div>
        <div class="search-results-list">
      `;
      
      results.forEach(result => {
        html += this.renderSearchResult(result);
      });
      
      html += '</div>';
      this.searchResults.innerHTML = html;
    }
    
    this.showResults();
  }
  
  renderSearchResult(result) {
    const typeIcon = this.getTypeIcon(result.type);
    const matchTypeClass = result.matchType || 'exact';
    
    return `
      <div class="search-result-item ${matchTypeClass}" data-type="${result.type}">
        <div class="result-icon">${typeIcon}</div>
        <div class="result-content">
          <h3 class="result-title">
            <a href="${result.url}" class="result-link">${result.title}</a>
          </h3>
          <div class="result-snippet">${result.snippet || ''}</div>
          <div class="result-meta">
            <span class="result-type">${result.type}</span>
            ${result.matchType === 'fuzzy' ? `<span class="result-similarity">${Math.round(result.similarity * 100)}% match</span>` : ''}
            <span class="result-score">Score: ${result.score}</span>
          </div>
        </div>
      </div>
    `;
  }
  
  getTypeIcon(type) {
    const icons = {
      book: '📖',
      character: '👤',
      chapter: '📄',
      category: '📚',
      default: '📄'
    };
    return icons[type] || icons.default;
  }
  
  displaySuggestions(suggestions) {
    if (!this.searchSuggestions || !suggestions || suggestions.length === 0) {
      this.hideSuggestions();
      return;
    }
    
    let html = '<div class="suggestions-list">';
    
    suggestions.forEach(suggestion => {
      html += `
        <div class="suggestion-item" data-suggestion="${suggestion.text}">
          <span class="suggestion-reason">${suggestion.reason}:</span>
          <span class="suggestion-text">${suggestion.text}</span>
        </div>
      `;
    });
    
    html += '</div>';
    this.searchSuggestions.innerHTML = html;
    
    // Add click handlers to suggestions
    this.searchSuggestions.querySelectorAll('.suggestion-item').forEach(item => {
      item.addEventListener('click', () => {
        const suggestionText = item.dataset.suggestion;
        this.searchInput.value = suggestionText;
        this.performSearch(suggestionText);
        this.hideSuggestions();
      });
    });
    
    this.showSuggestions();
  }
  
  showResults() {
    if (this.searchResults) {
      this.searchResults.style.display = 'block';
    }
  }
  
  hideResults() {
    if (this.searchResults) {
      this.searchResults.style.display = 'none';
    }
  }
  
  showSuggestions() {
    if (this.searchSuggestions) {
      this.searchSuggestions.style.display = 'block';
    }
  }
  
  hideSuggestions() {
    if (this.searchSuggestions) {
      this.searchSuggestions.style.display = 'none';
      // Remove focus from suggestions
      this.searchSuggestions.querySelectorAll('.suggestion-item.focused')
        .forEach(item => item.classList.remove('focused'));
    }
  }
  
  showLoading() {
    const loadingElement = document.querySelector('.search-loading');
    if (loadingElement) {
      loadingElement.style.display = 'flex';
    }
  }
  
  hideLoading() {
    const loadingElement = document.querySelector('.search-loading');
    if (loadingElement) {
      loadingElement.style.display = 'none';
    }
  }
  
  showError(message) {
    if (this.searchResults) {
      this.searchResults.innerHTML = `
        <div class="search-error">
          <div class="error-icon">⚠️</div>
          <p>${message}</p>
        </div>
      `;
      this.showResults();
    }
  }
  
  clearSearch() {
    this.searchInput.value = '';
    this.currentQuery = '';
    this.hideResults();
    this.hideSuggestions();
    
    const clearButton = document.querySelector('.search-clear');
    if (clearButton) {
      clearButton.style.display = 'none';
    }
    
    this.searchInput.focus();
  }
  
  loadSearchHistory() {
    try {
      const history = JSON.parse(localStorage.getItem('bibleExplorerSearchHistory') || '[]');
      if (this.searchEngine) {
        this.searchEngine.searchHistory = history;
      }
    } catch (e) {
      console.warn('[UnifiedSearch] Could not load search history');
    }
  }
  
  getSearchStats() {
    if (!this.searchEngine) return null;
    
    return {
      isInitialized: this.isInitialized,
      currentQuery: this.currentQuery,
      filters: this.filters,
      ...this.searchEngine.getStats()
    };
  }
}

// Initialize unified search
let unifiedSearch;

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    unifiedSearch = new UnifiedSearch();
  });
} else {
  unifiedSearch = new UnifiedSearch();
}

// Expose to global scope
window.unifiedSearch = unifiedSearch;

console.log('[UnifiedSearch] Unified search interface loaded');