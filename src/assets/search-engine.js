/**
 * Advanced Search Engine for Bible Explorer
 * Features: Fuzzy matching, ranking, multi-field search, typo tolerance
 */

class SearchEngine {
  constructor() {
    this.indices = new Map();
    this.searchHistory = [];
    this.suggestionCache = new Map();
    this.stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should']);
    this.synonyms = new Map([
      ['god', ['lord', 'yahweh', 'jehovah', 'almighty']],
      ['jesus', ['christ', 'messiah', 'savior', 'lord']],
      ['bible', ['scripture', 'word', 'holy book']],
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
  
  // Initialize search indices for different content types
  async initializeIndices(data) {
    console.log('[SearchEngine] Initializing search indices...');
    
    // Create indices for different content types
    if (data.books) {
      this.createIndex('books', data.books, {
        searchFields: ['name', 'testament', 'category', 'author', 'description', 'keyThemes'],
        titleField: 'name',
        urlPattern: '/books/{slug}/',
        type: 'book'
      });
    }
    
    if (data.characters) {
      this.createIndex('characters', data.characters, {
        searchFields: ['name', 'description', 'significance', 'keyVerses', 'modernApplications'],
        titleField: 'name',
        urlPattern: '/characters/{slug}/',
        type: 'character'
      });
    }
    
    if (data.chapters) {
      this.createIndex('chapters', data.chapters, {
        searchFields: ['summary', 'keyEvents', 'themes'],
        titleField: 'title',
        urlPattern: '/books/{book}/chapter-{chapter}/',
        type: 'chapter'
      });
    }
    
    console.log('[SearchEngine] Indices initialized:', Array.from(this.indices.keys()));
  }
  
  createIndex(name, data, config) {
    const index = {
      data: data,
      config: config,
      searchableText: [],
      ngrams: new Map(),
      wordIndex: new Map()
    };
    
    // Build searchable text and indices
    data.forEach((item, itemIndex) => {
      const searchText = this.extractSearchableText(item, config.searchFields);
      index.searchableText.push(searchText);
      
      // Build n-gram index for fuzzy matching
      this.buildNGrams(searchText, itemIndex, index.ngrams);
      
      // Build word index for exact matching
      this.buildWordIndex(searchText, itemIndex, index.wordIndex);
    });
    
    this.indices.set(name, index);
  }
  
  extractSearchableText(item, fields) {
    let text = '';
    
    fields.forEach(field => {
      const value = this.getNestedValue(item, field);
      if (value) {
        if (Array.isArray(value)) {
          text += ' ' + value.join(' ');
        } else {
          text += ' ' + String(value);
        }
      }
    });
    
    return this.normalizeText(text);
  }
  
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }
  
  normalizeText(text) {
    return text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
  
  buildNGrams(text, itemIndex, ngramMap, n = 3) {
    const words = text.split(' ');
    
    words.forEach(word => {
      if (word.length >= n && !this.stopWords.has(word)) {
        for (let i = 0; i <= word.length - n; i++) {
          const ngram = word.substring(i, i + n);
          if (!ngramMap.has(ngram)) {
            ngramMap.set(ngram, []);
          }
          ngramMap.get(ngram).push(itemIndex);
        }
      }
    });
  }
  
  buildWordIndex(text, itemIndex, wordIndex) {
    const words = text.split(' ').filter(word => !this.stopWords.has(word));
    
    words.forEach(word => {
      if (!wordIndex.has(word)) {
        wordIndex.set(word, []);
      }
      wordIndex.get(word).push(itemIndex);
    });
  }
  
  // Main search function
  search(query, options = {}) {
    const startTime = performance.now();
    
    if (!query || query.length < 2) {
      return { results: [], suggestions: [], stats: { totalTime: 0, totalResults: 0 } };
    }
    
    const normalizedQuery = this.normalizeText(query);
    const queryWords = normalizedQuery.split(' ').filter(word => word.length > 0);
    
    let allResults = [];
    
    // Search across all indices
    this.indices.forEach((index, indexName) => {
      const indexResults = this.searchIndex(index, queryWords, options);
      allResults.push(...indexResults.map(result => ({
        ...result,
        sourceIndex: indexName,
        type: index.config.type
      })));
    });
    
    // Sort by relevance score
    allResults.sort((a, b) => b.score - a.score);
    
    // Apply pagination
    const limit = options.limit || 50;
    const offset = options.offset || 0;
    const paginatedResults = allResults.slice(offset, offset + limit);
    
    // Generate suggestions
    const suggestions = this.generateSuggestions(query, allResults);
    
    const endTime = performance.now();
    const stats = {
      totalTime: endTime - startTime,
      totalResults: allResults.length,
      query: query,
      normalizedQuery: normalizedQuery
    };
    
    // Save to search history
    this.addToSearchHistory(query, allResults.length);
    
    console.log(`[SearchEngine] Search completed in ${stats.totalTime.toFixed(2)}ms, ${stats.totalResults} results found`);
    
    return {
      results: paginatedResults,
      suggestions: suggestions,
      stats: stats
    };
  }
  
  searchIndex(index, queryWords, options) {
    const results = [];
    const exactMatches = new Set();
    const fuzzyMatches = new Map();
    
    // 1. Exact word matching (highest priority)
    queryWords.forEach(word => {
      const expanded = this.expandWithSynonyms(word);
      expanded.forEach(expandedWord => {
        if (index.wordIndex.has(expandedWord)) {
          index.wordIndex.get(expandedWord).forEach(itemIndex => {
            exactMatches.add(itemIndex);
          });
        }
      });
    });
    
    // 2. Fuzzy matching using n-grams
    queryWords.forEach(word => {
      if (word.length >= 3) {
        const fuzzyResults = this.fuzzySearch(word, index.ngrams);
        fuzzyResults.forEach(([itemIndex, similarity]) => {
          if (!exactMatches.has(itemIndex)) {
            if (!fuzzyMatches.has(itemIndex)) {
              fuzzyMatches.set(itemIndex, []);
            }
            fuzzyMatches.get(itemIndex).push(similarity);
          }
        });
      }
    });
    
    // Process exact matches
    exactMatches.forEach(itemIndex => {
      const item = index.data[itemIndex];
      const score = this.calculateScore(item, queryWords, index, 'exact');
      results.push({
        item: item,
        score: score,
        matchType: 'exact',
        title: item[index.config.titleField] || 'Untitled',
        url: this.generateUrl(item, index.config.urlPattern),
        snippet: this.generateSnippet(index.searchableText[itemIndex], queryWords)
      });
    });
    
    // Process fuzzy matches
    fuzzyMatches.forEach((similarities, itemIndex) => {
      const item = index.data[itemIndex];
      const avgSimilarity = similarities.reduce((sum, sim) => sum + sim, 0) / similarities.length;
      const score = this.calculateScore(item, queryWords, index, 'fuzzy', avgSimilarity);
      results.push({
        item: item,
        score: score,
        matchType: 'fuzzy',
        similarity: avgSimilarity,
        title: item[index.config.titleField] || 'Untitled',
        url: this.generateUrl(item, index.config.urlPattern),
        snippet: this.generateSnippet(index.searchableText[itemIndex], queryWords)
      });
    });
    
    return results;
  }
  
  expandWithSynonyms(word) {
    const expanded = [word];
    if (this.synonyms.has(word)) {
      expanded.push(...this.synonyms.get(word));
    }
    
    // Also check if word is a synonym of something else
    this.synonyms.forEach((synonyms, key) => {
      if (synonyms.includes(word)) {
        expanded.push(key);
        expanded.push(...synonyms);
      }
    });
    
    return [...new Set(expanded)];
  }
  
  fuzzySearch(query, ngramIndex, threshold = 0.3) {
    const queryNgrams = new Set();
    for (let i = 0; i <= query.length - 3; i++) {
      queryNgrams.add(query.substring(i, i + 3));
    }
    
    const candidates = new Map();
    
    // Find candidates using n-grams
    queryNgrams.forEach(ngram => {
      if (ngramIndex.has(ngram)) {
        ngramIndex.get(ngram).forEach(itemIndex => {
          candidates.set(itemIndex, (candidates.get(itemIndex) || 0) + 1);
        });
      }
    });
    
    // Calculate Jaccard similarity and filter by threshold
    const results = [];
    candidates.forEach((commonNgrams, itemIndex) => {
      const similarity = commonNgrams / (queryNgrams.size + commonNgrams - commonNgrams);
      if (similarity >= threshold) {
        results.push([itemIndex, similarity]);
      }
    });
    
    return results.sort((a, b) => b[1] - a[1]);
  }
  
  calculateScore(item, queryWords, index, matchType, similarity = 1.0) {
    let score = 0;
    
    // Base score by match type
    switch (matchType) {
      case 'exact':
        score = 100;
        break;
      case 'fuzzy':
        score = 60 * similarity;
        break;
      default:
        score = 30;
    }
    
    // Boost for title matches
    const title = (item[index.config.titleField] || '').toLowerCase();
    const titleMatches = queryWords.filter(word => title.includes(word)).length;
    score += titleMatches * 20;
    
    // Boost for complete phrase matches
    const searchText = index.searchableText[index.data.indexOf(item)];
    const originalQuery = queryWords.join(' ');
    if (searchText.includes(originalQuery)) {
      score += 50;
    }
    
    // Boost based on content length (shorter, more focused content ranks higher)
    const contentLength = searchText.length;
    if (contentLength < 200) score += 10;
    else if (contentLength < 500) score += 5;
    
    // Boost for popular items (if available)
    if (item.popularity) {
      score += Math.min(item.popularity * 0.1, 10);
    }
    
    return Math.round(score);
  }
  
  generateUrl(item, urlPattern) {
    let url = urlPattern;
    Object.keys(item).forEach(key => {
      url = url.replace(`{${key}}`, encodeURIComponent(item[key] || ''));
    });
    return url;
  }
  
  generateSnippet(text, queryWords, maxLength = 200) {
    const lowerText = text.toLowerCase();
    const queryPositions = [];
    
    // Find positions of query words
    queryWords.forEach(word => {
      let pos = lowerText.indexOf(word.toLowerCase());
      while (pos !== -1) {
        queryPositions.push({ pos, length: word.length, word });
        pos = lowerText.indexOf(word.toLowerCase(), pos + 1);
      }
    });
    
    if (queryPositions.length === 0) {
      return text.substring(0, maxLength) + (text.length > maxLength ? '...' : '');
    }
    
    // Sort by position
    queryPositions.sort((a, b) => a.pos - b.pos);
    
    // Find the best snippet window
    const firstMatch = queryPositions[0];
    const snippetStart = Math.max(0, firstMatch.pos - 50);
    const snippetEnd = Math.min(text.length, snippetStart + maxLength);
    
    let snippet = text.substring(snippetStart, snippetEnd);
    
    // Add ellipsis if needed
    if (snippetStart > 0) snippet = '...' + snippet;
    if (snippetEnd < text.length) snippet = snippet + '...';
    
    // Highlight query terms
    queryWords.forEach(word => {
      const regex = new RegExp(`(${this.escapeRegex(word)})`, 'gi');
      snippet = snippet.replace(regex, '<mark>$1</mark>');
    });
    
    return snippet;
  }
  
  escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
  
  generateSuggestions(query, results) {
    if (this.suggestionCache.has(query)) {
      return this.suggestionCache.get(query);
    }
    
    const suggestions = [];
    
    // Typo corrections using Levenshtein distance
    if (results.length < 3) {
      const corrections = this.suggestTypoCorrections(query);
      suggestions.push(...corrections.map(correction => ({
        type: 'correction',
        text: correction,
        reason: 'Did you mean'
      })));
    }
    
    // Related searches from popular terms
    const relatedTerms = this.findRelatedTerms(query);
    suggestions.push(...relatedTerms.map(term => ({
      type: 'related',
      text: term,
      reason: 'Related'
    })));
    
    // Autocomplete suggestions
    const autocomplete = this.generateAutocompleteSuggestions(query);
    suggestions.push(...autocomplete.map(suggestion => ({
      type: 'autocomplete',
      text: suggestion,
      reason: 'Complete'
    })));
    
    const uniqueSuggestions = suggestions
      .filter((suggestion, index, self) => 
        index === self.findIndex(s => s.text === suggestion.text)
      )
      .slice(0, 5);
    
    this.suggestionCache.set(query, uniqueSuggestions);
    return uniqueSuggestions;
  }
  
  suggestTypoCorrections(query, maxDistance = 2) {
    const corrections = [];
    const queryWords = query.toLowerCase().split(' ');
    
    this.indices.forEach(index => {
      index.wordIndex.forEach((positions, word) => {
        queryWords.forEach(queryWord => {
          const distance = this.levenshteinDistance(queryWord, word);
          if (distance > 0 && distance <= maxDistance && word.length > 3) {
            corrections.push(query.replace(queryWord, word));
          }
        });
      });
    });
    
    return [...new Set(corrections)].slice(0, 3);
  }
  
  levenshteinDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }
  
  findRelatedTerms(query) {
    const queryWords = query.toLowerCase().split(' ');
    const related = [];
    
    // Check synonyms
    queryWords.forEach(word => {
      if (this.synonyms.has(word)) {
        related.push(...this.synonyms.get(word));
      }
    });
    
    // Add common biblical terms that might be related
    const biblicalTerms = ['faith', 'prayer', 'worship', 'covenant', 'scripture', 'prophecy', 'miracle', 'salvation', 'redemption', 'grace'];
    const randomTerms = biblicalTerms.sort(() => 0.5 - Math.random()).slice(0, 2);
    related.push(...randomTerms);
    
    return [...new Set(related)].slice(0, 3);
  }
  
  generateAutocompleteSuggestions(query) {
    const suggestions = [];
    const queryLower = query.toLowerCase();
    
    // Find terms that start with the query
    this.indices.forEach(index => {
      index.wordIndex.forEach((positions, word) => {
        if (word.startsWith(queryLower) && word !== queryLower && word.length > queryLower.length) {
          suggestions.push(word);
        }
      });
    });
    
    // Sort by length (shorter suggestions first) and frequency
    return [...new Set(suggestions)]
      .sort((a, b) => a.length - b.length)
      .slice(0, 5);
  }
  
  addToSearchHistory(query, resultCount) {
    const historyEntry = {
      query,
      resultCount,
      timestamp: Date.now()
    };
    
    this.searchHistory.unshift(historyEntry);
    
    // Keep only last 100 searches
    if (this.searchHistory.length > 100) {
      this.searchHistory = this.searchHistory.slice(0, 100);
    }
    
    // Save to localStorage
    try {
      localStorage.setItem('bibleExplorerSearchHistory', JSON.stringify(this.searchHistory));
    } catch (e) {
      console.warn('Could not save search history to localStorage');
    }
  }
  
  getSearchHistory() {
    return this.searchHistory.slice(0, 10); // Return last 10 searches
  }
  
  getStats() {
    return {
      indices: Array.from(this.indices.keys()),
      totalItems: Array.from(this.indices.values()).reduce((sum, index) => sum + index.data.length, 0),
      searchHistory: this.searchHistory.length,
      cacheSize: this.suggestionCache.size
    };
  }
}

// Export for use in other modules
window.SearchEngine = SearchEngine;
console.log('[SearchEngine] Advanced search engine loaded with fuzzy matching and ranking');