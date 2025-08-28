// Character Search Functionality
class CharacterSearch {
  constructor() {
    this.characters = [];
    this.filteredCharacters = [];
    this.currentQuery = '';
    this.currentFilters = {
      testament: 'all',
      significance: 'all',
      minAppearances: 0
    };
    
    this.init();
  }

  async init() {
    await this.loadCharacters();
    this.setupEventListeners();
    this.render();
  }

  async loadCharacters() {
    try {
      // Try to get from global data first (if available on page)
      if (window.charactersData && Array.isArray(window.charactersData.characters)) {
        this.characters = window.charactersData.characters;
        console.log(`Loaded ${this.characters.length} characters from global data`);
      } else if (window.charactersData && Array.isArray(window.charactersData)) {
        this.characters = window.charactersData;
        console.log(`Loaded ${this.characters.length} characters from global array`);
      } else {
        // Fallback: construct from existing DOM elements
        console.log('No global data found, extracting from DOM');
        this.characters = this.extractCharactersFromDOM();
        console.log(`Extracted ${this.characters.length} characters from DOM`);
      }
      
      this.filteredCharacters = [...this.characters];
      
      // Log first few characters for debugging
      if (this.characters.length > 0) {
        console.log('Sample characters:', this.characters.slice(0, 3));
      } else {
        console.warn('No characters loaded!');
      }
    } catch (error) {
      console.error('Error loading character data:', error);
      this.characters = this.extractCharactersFromDOM();
      this.filteredCharacters = [...this.characters];
    }
  }

  extractCharactersFromDOM() {
    const characterCards = document.querySelectorAll('.character-card:not(.search-result)');
    const characters = [];
    
    characterCards.forEach((card, index) => {
      const nameEl = card.querySelector('.character-name');
      const statsEl = card.querySelector('.character-metrics, .character-stats');
      const booksEl = card.querySelector('.character-books, .character-preview');
      
      if (nameEl) {
        const character = {
          name: nameEl.textContent.trim(),
          slug: this.createSlug(nameEl.textContent.trim()),
          url: card.href || `/characters/${this.createSlug(nameEl.textContent.trim())}/`
        };
        
        // Extract stats if available
        if (statsEl) {
          const appearances = statsEl.textContent.match(/(\d+)\s*appearance/i);
          const books = statsEl.textContent.match(/(\d+)\s*book/i);
          character.totalAppearances = appearances ? parseInt(appearances[1]) : 1;
          character.totalBooks = books ? parseInt(books[1]) : 1;
        } else {
          character.totalAppearances = 1;
          character.totalBooks = 1;
        }
        
        // Extract significance from badge if available
        const significanceBadge = card.querySelector('.significance-badge');
        if (significanceBadge) {
          const badgeText = significanceBadge.textContent.toLowerCase().trim();
          if (badgeText.includes('major')) character.significance = 'major';
          else if (badgeText.includes('notable')) character.significance = 'notable';
          else if (badgeText.includes('prominent')) character.significance = 'prominent';
          else character.significance = 'minor';
        }
        
        // Extract books if available
        if (booksEl) {
          const bookTags = booksEl.querySelectorAll('.book-tag, .book-chip');
          character.books = Array.from(bookTags).map(tag => tag.textContent.trim()).filter(book => book);
        } else {
          character.books = [];
        }
        
        // Try to determine testament from books if we have them
        if (character.books && character.books.length > 0) {
          const otBooks = ['Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel', '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra', 'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Solomon', 'Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi'];
          const ntBooks = ['Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians', 'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians', '1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews', 'James', '1 Peter', '2 Peter', '1 John', '2 John', '3 John', 'Jude', 'Revelation'];
          
          const hasOT = character.books.some(book => otBooks.includes(book));
          const hasNT = character.books.some(book => ntBooks.includes(book));
          
          if (hasOT && hasNT) character.testament = 'both';
          else if (hasOT) character.testament = 'old';
          else if (hasNT) character.testament = 'new';
          else character.testament = 'unknown';
        }
        
        characters.push(character);
      }
    });
    
    return characters;
  }

  createSlug(text) {
    return text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').trim();
  }

  setupEventListeners() {
    // Search input
    const searchInput = document.getElementById('character-search');
    const filtersContainer = document.querySelector('.search-filters');
    
    if (searchInput) {
      // Hide filters initially
      if (filtersContainer) {
        filtersContainer.style.display = 'none';
        filtersContainer.style.transition = 'all 0.3s ease';
      }
      
      // Show filters on focus or when there's content
      const showFilters = () => {
        if (filtersContainer && filtersContainer.style.display === 'none') {
          filtersContainer.style.display = 'grid';
          filtersContainer.style.opacity = '0';
          filtersContainer.style.transform = 'translateY(-10px)';
          
          // Animate in
          setTimeout(() => {
            filtersContainer.style.opacity = '1';
            filtersContainer.style.transform = 'translateY(0)';
          }, 10);
        }
      };
      
      // Hide filters when blurred and empty
      const hideFilters = () => {
        if (filtersContainer && !this.hasActiveFilters() && searchInput.value.trim() === '' && !filtersContainer.hasAttribute('data-hovering')) {
          setTimeout(() => {
            if (document.activeElement !== searchInput && !filtersContainer.contains(document.activeElement) && !filtersContainer.hasAttribute('data-hovering')) {
              filtersContainer.style.opacity = '0';
              filtersContainer.style.transform = 'translateY(-10px)';
              
              setTimeout(() => {
                if (filtersContainer.style.opacity === '0') {
                  filtersContainer.style.display = 'none';
                }
              }, 300);
            }
          }, 150);
        }
      };
      
      // Event listeners
      searchInput.addEventListener('focus', showFilters);
      searchInput.addEventListener('blur', hideFilters);
      
      searchInput.addEventListener('input', (e) => {
        this.currentQuery = e.target.value.toLowerCase().trim();
        
        // Show filters when user starts typing
        if (this.currentQuery.length > 0) {
          showFilters();
        }
        
        this.applyFilters();
      });
      
      // Keep filters visible when interacting with them
      if (filtersContainer) {
        filtersContainer.addEventListener('mouseenter', () => {
          filtersContainer.setAttribute('data-hovering', 'true');
        });
        
        filtersContainer.addEventListener('mouseleave', () => {
          filtersContainer.removeAttribute('data-hovering');
          hideFilters();
        });
        
        // Prevent hiding when focusing filter controls
        const filterInputs = filtersContainer.querySelectorAll('select, input[type="range"]');
        filterInputs.forEach(input => {
          input.addEventListener('focus', showFilters);
          input.addEventListener('blur', hideFilters);
        });
      }
    }

    // Filter controls
    const testamentFilter = document.getElementById('testament-filter');
    if (testamentFilter) {
      testamentFilter.addEventListener('change', (e) => {
        this.currentFilters.testament = e.target.value;
        this.applyFilters();
      });
    }

    const significanceFilter = document.getElementById('significance-filter');
    if (significanceFilter) {
      significanceFilter.addEventListener('change', (e) => {
        this.currentFilters.significance = e.target.value;
        this.applyFilters();
      });
    }

    const appearancesSlider = document.getElementById('appearances-filter');
    if (appearancesSlider) {
      appearancesSlider.addEventListener('input', (e) => {
        this.currentFilters.minAppearances = parseInt(e.target.value);
        document.getElementById('appearances-value').textContent = e.target.value;
        this.applyFilters();
      });
    }

    // Clear filters button
    const clearButton = document.getElementById('clear-filters');
    if (clearButton) {
      clearButton.addEventListener('click', () => {
        this.clearFilters();
      });
    }
  }

  applyFilters() {
    let filtered = [...this.characters];

    // Text search
    if (this.currentQuery) {
      filtered = filtered.filter(char => 
        char.name.toLowerCase().includes(this.currentQuery) ||
        (char.books && char.books.some(book => 
          book.toLowerCase().includes(this.currentQuery)
        )) ||
        (char.role && char.role.toLowerCase().includes(this.currentQuery))
      );
    }

    // Testament filter
    if (this.currentFilters.testament !== 'all') {
      filtered = filtered.filter(char => 
        char.testament && char.testament.toLowerCase() === this.currentFilters.testament
      );
    }

    // Significance filter
    if (this.currentFilters.significance !== 'all') {
      filtered = filtered.filter(char => 
        char.significance && char.significance === this.currentFilters.significance
      );
    }

    // Minimum appearances filter
    if (this.currentFilters.minAppearances > 0) {
      filtered = filtered.filter(char => 
        char.totalAppearances >= this.currentFilters.minAppearances
      );
    }

    this.filteredCharacters = filtered;
    this.updateResults();
  }

  updateResults() {
    const resultsContainer = document.getElementById('search-results');
    const originalListing = document.querySelector('.characters-listing:not(#search-results)');
    const resultsCount = document.getElementById('results-count');

    if (!resultsContainer) {
      console.warn('Search results container not found');
      return;
    }

    // Update results count
    if (resultsCount) {
      resultsCount.textContent = `${this.filteredCharacters.length} character${this.filteredCharacters.length !== 1 ? 's' : ''} found`;
    } else {
      console.log(`${this.filteredCharacters.length} characters found`);
    }

    // Show/hide original listing vs search results
    if (this.hasActiveFilters()) {
      if (originalListing) originalListing.style.display = 'none';
      resultsContainer.style.display = 'grid';
      resultsContainer.className = 'characters-listing search-active';
      this.renderResults();
    } else {
      if (originalListing) originalListing.style.display = 'grid';
      resultsContainer.style.display = 'none';
      resultsContainer.className = 'characters-listing';
    }
  }

  hasActiveFilters() {
    return this.currentQuery.length > 0 || 
           this.currentFilters.testament !== 'all' ||
           this.currentFilters.significance !== 'all' ||
           this.currentFilters.minAppearances > 0;
  }

  renderResults() {
    const resultsContainer = document.getElementById('search-results');
    if (!resultsContainer) return;

    if (this.filteredCharacters.length === 0) {
      resultsContainer.innerHTML = `
        <div class="no-results">
          <div class="no-results-icon">🔍</div>
          <h3>No characters found</h3>
          <p>Try adjusting your search criteria or filters.</p>
        </div>
      `;
      return;
    }

    const resultsHTML = this.filteredCharacters.map(char => `
      <a href="/characters/${char.slug}/" class="character-card search-result">
        <div class="character-header">
          <h3 class="character-name">${char.name}</h3>
          ${char.significance ? `<span class="significance-badge ${char.significance}">${this.formatSignificance(char.significance)}</span>` : ''}
        </div>
        
        <div class="character-metrics">
          <div class="metric">
            <span class="metric-number">${char.totalAppearances || 1}</span>
            <span class="metric-label">${(char.totalAppearances || 1) === 1 ? 'appearance' : 'appearances'}</span>
          </div>
          ${char.totalBooks ? `
            <div class="metric-separator">•</div>
            <div class="metric">
              <span class="metric-number">${char.totalBooks}</span>
              <span class="metric-label">${char.totalBooks === 1 ? 'book' : 'books'}</span>
            </div>
          ` : ''}
        </div>
        
        ${char.books ? `
          <div class="character-books">
            <div class="books-preview">
              ${char.books.slice(0, 3).map(book => `<span class="book-chip">${book}</span>`).join('')}
              ${char.books.length > 3 ? `<span class="books-overflow">+${char.books.length - 3} more</span>` : ''}
            </div>
          </div>
        ` : ''}
      </a>
    `).join('');

    resultsContainer.innerHTML = resultsHTML;
  }

  formatSignificance(significance) {
    const significanceMap = {
      'major': 'Major Figure',
      'prominent': 'Prominent', 
      'notable': 'Notable',
      'minor': 'Minor'
    };
    return significanceMap[significance] || significance;
  }

  clearFilters() {
    this.currentQuery = '';
    this.currentFilters = {
      testament: 'all',
      significance: 'all',
      minAppearances: 0
    };

    // Reset form controls
    const searchInput = document.getElementById('character-search');
    if (searchInput) searchInput.value = '';

    const testamentFilter = document.getElementById('testament-filter');
    if (testamentFilter) testamentFilter.value = 'all';

    const significanceFilter = document.getElementById('significance-filter');
    if (significanceFilter) significanceFilter.value = 'all';

    const appearancesSlider = document.getElementById('appearances-filter');
    if (appearancesSlider) {
      appearancesSlider.value = '0';
      document.getElementById('appearances-value').textContent = '0';
    }

    this.applyFilters();
  }

  render() {
    // The search interface is rendered via the template
    // This method can be used for additional dynamic rendering if needed
  }
}

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('.characters-hero') || document.querySelector('.character-card')) {
    window.characterSearch = new CharacterSearch();
  }
});

// Make available globally
window.CharacterSearch = CharacterSearch;