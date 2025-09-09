/**
 * Advanced Search Engine for Explore Scripture
 * Provides unified search across books, chapters, and categories
 * Features: Fuzzy matching, autocomplete, performance optimization
 */

class SearchEngine {
  constructor() {
    this.indices = new Map();
    this.searchHistory = [];
    this.suggestionCache = new Map();
    this.initialized = false;
    this.searchData = null;
    
    // Performance optimizations
    this.debounceTimer = null;
    this.lastQuery = '';
    this.maxResults = 50;
    
    // Search configuration
    this.stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should']);
    
    // Biblical synonyms for enhanced search
    this.synonyms = new Map([
      ['god', ['lord', 'yahweh', 'jehovah', 'almighty', 'creator']],
      ['jesus', ['christ', 'messiah', 'savior', 'lord', 'lamb']],
      ['bible', ['scripture', 'word', 'holy book', 'testament']],
      ['prophet', ['seer', 'messenger']],
      ['king', ['ruler', 'monarch']],
      ['priest', ['minister', 'clergyman']],
      ['disciple', ['apostle', 'follower']],
      ['temple', ['sanctuary', 'house of god']],
      ['prayer', ['worship', 'praise']],
      ['sin', ['transgression', 'iniquity', 'wrongdoing']],
      ['forgiveness', ['mercy', 'grace', 'pardon']],
      ['faith', ['belief', 'trust', 'confidence']],
      ['covenant', ['agreement', 'promise', 'pact']],
      ['sacrifice', ['offering', 'oblation']],
      ['holy', ['sacred', 'divine', 'blessed']],
      ['miracle', ['wonder', 'sign', 'supernatural']],
      ['parable', ['story', 'illustration', 'allegory']],
      ['prophecy', ['prediction', 'foretelling', 'vision']],
      ['resurrection', ['rising', 'revival', 'restoration']],
      ['salvation', ['redemption', 'deliverance', 'rescue']]
    ]);
  }

  // Initialize search engine with all content
  async initialize() {
    if (this.initialized) return;
    
    try {
      console.log('[SearchEngine] Initializing...');
      
      // Load all search data
      await this.loadSearchData();
      
      // Build search indices
      this.buildIndices();
      
      this.initialized = true;
      console.log('[SearchEngine] Initialization complete');
      
      // Dispatch initialization event
      window.dispatchEvent(new CustomEvent('searchEngineReady'));
      
    } catch (error) {
      console.error('[SearchEngine] Initialization failed:', error);
      throw error;
    }
  }

  // Load all search data from the site
  async loadSearchData() {
    try {
      const promises = [];
      
      // Load books data
      promises.push(this.fetchJSON('/assets/data/books.json').catch(() => null));
      
      // Load categories data
      promises.push(this.fetchJSON('/assets/data/categories.json').catch(() => null));
      
      // Load entities data
      promises.push(this.fetchJSON('/assets/data/entities-search.json').catch(() => null));
      
      const [booksData, categoriesData, entitiesData] = await Promise.all(promises);
      
      this.searchData = {
        books: booksData || [],
        categories: categoriesData || [],
        entities: entitiesData || []
      };
      
    } catch (error) {
      console.error('[SearchEngine] Failed to load search data:', error);
      // Initialize with empty data if loading fails
      this.searchData = { books: [], categories: [], entities: [] };
    }
  }

  // Helper to fetch JSON with error handling
  async fetchJSON(url) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
    }
    return response.json();
  }

  // Build search indices for all content types
  buildIndices() {
    console.log('[SearchEngine] Building search indices...');
    
    // Build books index
    this.buildBooksIndex();
    
    // Build categories index
    this.buildCategoriesIndex();
    
    // Build entities index
    this.buildEntitiesIndex();
    
    console.log('[SearchEngine] Indices built successfully');
  }

  // Build index for books and their chapters
  buildBooksIndex() {
    // Data validation security fix
    if (!this.searchData || !Array.isArray(this.searchData.books)) {
      console.warn('[SearchEngine] Invalid books data, skipping books index');
      return;
    }
    
    const books = this.searchData.books;
    const bookItems = [];
    
    books.forEach(book => {
      // Add book itself
      bookItems.push({
        id: `book-${book.slug}`,
        type: 'book',
        title: book.name,
        subtitle: `${book.testament} • ${book.category}`,
        description: `${book.author ? `Written by ${book.author}. ` : ''}${book.chapterSummaries ? Object.keys(book.chapterSummaries).length : 0} chapters.`,
        url: `/books/${book.slug}/`,
        searchText: this.buildSearchText([
          book.name,
          book.testament,
          book.category,
          book.author,
          book.language
        ]),
        relevanceBoost: 2.0, // Books get higher relevance
        testament: book.testament,
        category: book.category
      });
      
      // Add individual chapters
      if (book.chapterSummaries) {
        Object.entries(book.chapterSummaries).forEach(([chapterNum, summary]) => {
          bookItems.push({
            id: `chapter-${book.slug}-${chapterNum}`,
            type: 'chapter',
            title: `${book.name} ${chapterNum}`,
            subtitle: 'Chapter',
            description: this.truncateText(summary, 150),
            url: `/books/${book.slug}/#chapter-${chapterNum}`,
            searchText: this.buildSearchText([
              book.name,
              `chapter ${chapterNum}`,
              summary
            ]),
            relevanceBoost: 1.0,
            bookName: book.name,
            chapterNumber: parseInt(chapterNum, 10)
          });
        });
      }
    });
    
    this.indices.set('books', bookItems);
    console.log(`[SearchEngine] Books index: ${bookItems.length} items`);
  }


  // Build index for categories
  buildCategoriesIndex() {
    const categories = this.searchData.categories;
    const categoryItems = [];
    
    categories.forEach(category => {
      categoryItems.push({
        id: `category-${category.slug}`,
        type: 'category',
        title: category.name,
        subtitle: `${category.testament} • ${category.bookCount || 0} books`,
        description: category.description,
        url: `/categories/${category.slug}/`,
        searchText: this.buildSearchText([
          category.name,
          category.description,
          category.testament,
          ...(category.themes || []),
          ...(category.keyFigures || [])
        ]),
        relevanceBoost: 1.2,
        testament: category.testament
      });
    });
    
    this.indices.set('categories', categoryItems);
    console.log(`[SearchEngine] Categories index: ${categoryItems.length} items`);
  }

  // Build index for entities (biblical characters, places, etc.)
  buildEntitiesIndex() {
    const entities = this.searchData.entities || [];
    const entityItems = [];
    
    entities.forEach(entity => {
      entityItems.push({
        id: `entity-${entity.id}`,
        type: 'entity',
        title: entity.name,
        subtitle: `${entity.type} • ${entity.references} reference${entity.references !== 1 ? 's' : ''}`,
        description: entity.blurb || `A ${entity.type} mentioned in ${entity.books.length} book${entity.books.length !== 1 ? 's' : ''}: ${entity.books.slice(0, 3).join(', ')}${entity.books.length > 3 ? '...' : ''}`,
        url: entity.url,
        searchText: entity.searchText,
        relevanceBoost: this.getEntityRelevanceBoost(entity.type, entity.references),
        entityType: entity.type,
        referenceCount: entity.references,
        books: entity.books,
        category: entity.category
      });
    });
    
    this.indices.set('entities', entityItems);
    console.log(`[SearchEngine] Entities index: ${entityItems.length} items`);
  }

  // Calculate relevance boost based on entity type and reference count
  getEntityRelevanceBoost(entityType, referenceCount) {
    const typeBoosts = {
      'divine': 3.5,        // God, Lord, Holy Spirit get highest boost
      'person': 2.8,        // Major biblical figures
      'place': 2.2,         // Important locations
      'title': 2.0,         // Roles and titles
      'group': 1.7,         // Tribes, nations, groups
      'event': 1.5,         // Historical events
      'figure': 1.2,        // Minor figures
      'concept': 1.0        // Abstract concepts
    };
    
    const baseBoost = typeBoosts[entityType] || 1.0;
    
    // Enhanced reference counting with logarithmic scaling
    // More references = more important, but with diminishing returns
    const referenceBoost = referenceCount > 0 ? 
      Math.min(Math.log10(referenceCount + 1) * 0.5, 2.0) : 0;
    
    // Additional boost for well-known entities
    const importanceBoost = this.getEntityImportanceBoost(referenceCount);
    
    return baseBoost + referenceBoost + importanceBoost;
  }

  // Get importance boost based on reference patterns
  getEntityImportanceBoost(referenceCount) {
    if (referenceCount >= 100) return 1.0;      // Major figures (Jesus, God, etc.)
    if (referenceCount >= 50) return 0.7;       // Important figures (David, Moses, etc.)
    if (referenceCount >= 20) return 0.5;       // Notable figures
    if (referenceCount >= 10) return 0.3;       // Mentioned figures
    if (referenceCount >= 5) return 0.2;        // Minor figures
    return 0;
  }

  // Build searchable text from multiple fields
  buildSearchText(fields) {
    return fields
      .filter(field => field && typeof field === 'string')
      .join(' ')
      .toLowerCase()
      .trim();
  }

  // Truncate text with ellipsis
  truncateText(text, maxLength) {
    if (!text || text.length <= maxLength) return text || '';
    return text.substring(0, maxLength).trim() + '...';
  }

  // Main search function
  search(query, options = {}) {
    if (!this.initialized) {
      console.warn('[SearchEngine] Not initialized, returning empty results');
      return [];
    }
    
    if (!query || query.trim().length < 1) {
      return [];
    }
    
    const normalizedQuery = this.normalizeQuery(query);
    const maxResults = options.maxResults || this.maxResults;
    
    // Check cache first
    const cacheKey = `${normalizedQuery}-${maxResults}`;
    if (this.suggestionCache.has(cacheKey)) {
      return this.suggestionCache.get(cacheKey);
    }
    
    let allResults = [];
    
    // Search all indices
    for (const [, items] of this.indices) {
      const indexResults = this.searchIndex(items, normalizedQuery, options);
      allResults = allResults.concat(indexResults);
    }
    
    // Sort by relevance and limit results
    allResults.sort((a, b) => b.score - a.score);
    const limitedResults = allResults.slice(0, maxResults);
    
    // Cache results
    this.suggestionCache.set(cacheKey, limitedResults);
    
    // Clean cache if it gets too large
    if (this.suggestionCache.size > 1000) {
      const oldestKeys = Array.from(this.suggestionCache.keys()).slice(0, 500);
      oldestKeys.forEach(key => this.suggestionCache.delete(key));
    }
    
    return limitedResults;
  }

  // Search within a specific index
  searchIndex(items, query, _options = {}) {
    const results = [];
    const queryTokens = this.tokenize(query);
    
    items.forEach(item => {
      const score = this.calculateRelevanceScore(item, queryTokens, query);
      
      if (score > 0) {
        results.push({
          ...item,
          score: score * (item.relevanceBoost || 1.0)
        });
      }
    });
    
    return results;
  }

  // Calculate relevance score for an item
  calculateRelevanceScore(item, queryTokens, originalQuery) {
    let score = 0;
    const searchText = item.searchText.toLowerCase();
    const title = item.title.toLowerCase();
    const queryLower = originalQuery.toLowerCase();
    
    // Exact matches get highest priority
    if (title === queryLower) {
      score += 150; // Increased from 100
    } else if (title.startsWith(queryLower)) {
      score += 80; // Increased from 50  
    } else if (title.includes(queryLower)) {
      score += 40; // Increased from 25
    }
    
    // Word boundary matching (more precise)
    const titleWords = title.split(/\s+/);
    const queryWords = queryLower.split(/\s+/);
    
    queryWords.forEach(queryWord => {
      titleWords.forEach(titleWord => {
        if (titleWord === queryWord) {
          score += 30; // Exact word match
        } else if (titleWord.startsWith(queryWord) && queryWord.length >= 3) {
          score += 15; // Word prefix match
        }
      });
    });
    
    // Token-based scoring with enhanced weights
    queryTokens.forEach(token => {
      // Title matching (most important)
      if (title.includes(token)) {
        const isWholeWord = new RegExp(`\\b${token}\\b`, 'i').test(title);
        score += isWholeWord ? 20 : 12; // Higher score for whole word matches
      }
      
      // Search text matching
      if (searchText.includes(token)) {
        const isWholeWord = new RegExp(`\\b${token}\\b`, 'i').test(searchText);
        score += isWholeWord ? 8 : 5;
      }
      
      // Enhanced fuzzy matching with context awareness
      const fuzzyTitleScore = this.getFuzzyScore(token, title);
      const fuzzySearchScore = this.getFuzzyScore(token, searchText);
      score += fuzzyTitleScore * 4 + fuzzySearchScore * 2;
      
      // Synonym matching with context
      this.expandWithSynonyms(token).forEach(synonym => {
        if (searchText.includes(synonym)) {
          const isWholeWord = new RegExp(`\\b${synonym}\\b`, 'i').test(searchText);
          score += isWholeWord ? 6 : 3; // Increased from 2
        }
      });
    });
    
    // Bonus scoring for entity-specific features
    if (item.type === 'entity') {
      score += this.getEntityContextBonus(item, queryTokens);
    }
    
    // Length penalty for very long matches (prefer more specific results)
    if (title.length > 50) {
      score = score * 0.95;
    }
    
    return Math.round(score);
  }

  // Get enhanced fuzzy matching score
  getFuzzyScore(pattern, text) {
    const distance = this.levenshteinDistance(pattern, text);
    const maxLength = Math.max(pattern.length, text.length);
    
    if (distance === 0) return 1.0;
    if (distance > Math.min(3, pattern.length / 2)) return 0;
    
    return Math.max(0, 1 - (distance / maxLength));
  }

  // Expand token with synonyms
  expandWithSynonyms(token) {
    return this.synonyms.get(token) || [];
  }

  // Get entity-specific context bonus
  getEntityContextBonus(entity, queryTokens) {
    let bonus = 0;
    
    // Check if query relates to entity attributes
    queryTokens.forEach(token => {
      // Testament context
      if (entity.testament && entity.testament.toLowerCase().includes(token)) {
        bonus += 5;
      }
      
      // Role/title context
      if (entity.role && entity.role.toLowerCase().includes(token)) {
        bonus += 8;
      }
      
      // Location context
      if (entity.location && entity.location.toLowerCase().includes(token)) {
        bonus += 6;
      }
      
      // Tribe context
      if (entity.tribe && entity.tribe.toLowerCase().includes(token)) {
        bonus += 7;
      }
    });
    
    return bonus;
  }

  // Normalize search query
  normalizeQuery(query) {
    return query.toLowerCase().trim().replace(/\s+/g, ' ');
  }

  // Tokenize query into searchable terms
  tokenize(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(token => token.length > 1 && !this.stopWords.has(token));
  }

  // Simple fuzzy matching
  fuzzyMatch(pattern, text, maxDistance = 2) {
    return this.levenshteinDistance(pattern, text) <= maxDistance;
  }

  // Calculate Levenshtein distance
  levenshteinDistance(str1, str2) {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) {
      matrix[0][i] = i;
    }
    
    for (let j = 0; j <= str2.length; j++) {
      matrix[j][0] = j;
    }
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + cost
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  // Get autocomplete suggestions
  getAutocompleteSuggestions(query, maxSuggestions = 8) {
    if (!query || query.length < 1) {
      return [];
    }
    
    const results = this.search(query, { maxResults: maxSuggestions });
    return results.map(result => ({
      text: result.title,
      subtitle: result.subtitle,
      type: result.type,
      url: result.url
    }));
  }

  // Debounced search for real-time suggestions
  debouncedSearch(query, callback, delay = 150) {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      const results = this.getAutocompleteSuggestions(query);
      callback(results);
    }, delay);
  }
}

// Global search engine instance
window.searchEngine = new SearchEngine();

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.searchEngine.initialize().catch(console.error);
  });
} else {
  window.searchEngine.initialize().catch(console.error);
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SearchEngine;
}