/**
 * Micro-Frontend Orchestrator
 * Implements a modular architecture where each major feature is a self-contained micro-frontend
 * that can be loaded independently for better scalability and maintainability.
 */

const fs = require('fs');
const path = require('path');

class MicroFrontendOrchestrator {
    constructor() {
        this.config = {
            // Define micro-frontends
            microfrontends: {
                'navigation': {
                    entry: 'navigation-module.js',
                    dependencies: ['theme-manager'],
                    priority: 'critical',
                    loadStrategy: 'immediate',
                    size: '15KB',
                    features: ['breadcrumbs', 'search-toggle', 'theme-toggle', 'mobile-menu']
                },
                
                'chapter-reader': {
                    entry: 'chapter-reader-module.js',
                    dependencies: ['api-client', 'cache-manager'],
                    priority: 'high',
                    loadStrategy: 'lazy',
                    size: '45KB',
                    features: ['modal-reader', 'translation-switcher', 'chapter-navigation', 'verse-highlighting']
                },
                
                'commentary-system': {
                    entry: 'commentary-module.js',
                    dependencies: ['api-client'],
                    priority: 'medium',
                    loadStrategy: 'lazy',
                    size: '35KB',
                    features: ['commentary-modal', 'source-selector', 'verse-lookup', 'bookmark-integration']
                },
                
                'search-engine': {
                    entry: 'search-module.js',
                    dependencies: ['search-index', 'fuzzy-matcher'],
                    priority: 'high',
                    loadStrategy: 'deferred',
                    size: '60KB',
                    features: ['unified-search', 'autocomplete', 'filters', 'result-highlighting']
                },
                
                'entity-explorer': {
                    entry: 'entity-module.js',
                    dependencies: ['d3-visualization', 'graph-data'],
                    priority: 'low',
                    loadStrategy: 'on-demand',
                    size: '80KB',
                    features: ['entity-graph', 'relationship-viewer', 'search-integration', 'export-tools']
                },
                
                'theme-system': {
                    entry: 'theme-module.js',
                    dependencies: [],
                    priority: 'critical',
                    loadStrategy: 'immediate',
                    size: '8KB',
                    features: ['theme-switcher', 'color-schemes', 'font-controls', 'accessibility-options']
                },
                
                'performance-monitor': {
                    entry: 'performance-module.js',
                    dependencies: ['analytics'],
                    priority: 'low',
                    loadStrategy: 'background',
                    size: '25KB',
                    features: ['metrics-collection', 'real-time-monitoring', 'error-tracking', 'user-analytics']
                }
            },
            
            // Shared dependencies
            sharedDependencies: {
                'api-client': {
                    version: '1.0.0',
                    size: '12KB',
                    exports: ['ApiClient', 'CacheManager', 'RequestQueue']
                },
                'event-bus': {
                    version: '1.0.0',
                    size: '5KB',
                    exports: ['EventBus', 'MessageChannel']
                },
                'utils': {
                    version: '1.0.0',
                    size: '8KB',
                    exports: ['debounce', 'throttle', 'sanitize', 'formatDate']
                },
                'cache-manager': {
                    version: '1.0.0',
                    size: '10KB',
                    exports: ['CacheManager', 'StorageAdapter', 'IndexedDBAdapter']
                }
            },
            
            // Loading strategies
            loadStrategies: {
                'immediate': { delay: 0, priority: 'high' },
                'deferred': { delay: 100, priority: 'medium' },
                'lazy': { delay: 'on-interaction', priority: 'low' },
                'on-demand': { delay: 'when-needed', priority: 'low' },
                'background': { delay: 2000, priority: 'idle' }
            },
            
            // Communication protocols
            communication: {
                eventBus: {
                    namespace: 'bible-explorer',
                    channels: {
                        'navigation': 'nav-events',
                        'search': 'search-events',
                        'reader': 'reader-events',
                        'theme': 'theme-events',
                        'system': 'system-events'
                    }
                },
                
                messageTypes: {
                    'NAVIGATE': 'navigation/navigate',
                    'SEARCH': 'search/query',
                    'THEME_CHANGE': 'theme/change',
                    'CONTENT_LOADED': 'system/content-loaded',
                    'ERROR': 'system/error'
                }
            }
        };
        
        this.registry = new Map();
        this.loadedModules = new Map();
        this.eventBus = null;
    }
    
    /**
     * Generate micro-frontend modules
     */
    async generateMicroFrontends() {
        // Create module directory
        const moduleDir = path.join(__dirname, '..', 'src', 'assets', 'modules');
        if (!fs.existsSync(moduleDir)) {
            fs.mkdirSync(moduleDir, { recursive: true });
        }
        
        // Generate each micro-frontend
        for (const [name, config] of Object.entries(this.config.microfrontends)) {
            await this.generateMicroFrontend(name, config, moduleDir);
        }
        
        // Generate orchestrator client
        await this.generateOrchestratorClient(moduleDir);
        
        // Generate shared dependencies
        await this.generateSharedDependencies(moduleDir);
        
        // Generate build integration
        await this.generateBuildIntegration();
        
        console.log('✅ Micro-frontend architecture generated');
    }
    
    /**
     * Generate individual micro-frontend module
     */
    async generateMicroFrontend(name, config, moduleDir) {
        const modulePath = path.join(moduleDir, config.entry);
        
        const moduleContent = `/**
 * ${name.charAt(0).toUpperCase() + name.slice(1)} Micro-Frontend Module
 * Auto-generated by micro-frontend-orchestrator.js
 */

class ${this.toPascalCase(name)}Module {
    constructor(orchestrator) {
        this.name = '${name}';
        this.orchestrator = orchestrator;
        this.eventBus = orchestrator.eventBus;
        this.config = ${JSON.stringify(config, null, 8)};
        this.state = {
            loaded: false,
            initialized: false,
            active: false
        };
        
        this.dependencies = new Map();
        this.exports = {};
        
        // Bind methods
        this.init = this.init.bind(this);
        this.destroy = this.destroy.bind(this);
        this.handleEvent = this.handleEvent.bind(this);
    }
    
    /**
     * Initialize the module
     */
    async init() {
        try {
            console.log(\`🚀 Initializing \${this.name} module\`);
            
            // Load dependencies
            await this.loadDependencies();
            
            // Initialize module-specific functionality
            await this.initializeFeatures();
            
            // Set up event listeners
            this.setupEventListeners();
            
            this.state.initialized = true;
            this.state.active = true;
            
            // Notify orchestrator
            this.eventBus.emit('module:initialized', {
                module: this.name,
                timestamp: Date.now()
            });
            
            console.log(\`✅ \${this.name} module initialized\`);
            
        } catch (error) {
            console.error(\`❌ Failed to initialize \${this.name} module:\`, error);
            this.eventBus.emit('module:error', {
                module: this.name,
                error: error.message,
                timestamp: Date.now()
            });
        }
    }
    
    /**
     * Load module dependencies
     */
    async loadDependencies() {
        const dependencyPromises = this.config.dependencies.map(async (depName) => {
            const dependency = await this.orchestrator.getDependency(depName);
            this.dependencies.set(depName, dependency);
            return dependency;
        });
        
        await Promise.all(dependencyPromises);
    }
    
    /**
     * Initialize module features
     */
    async initializeFeatures() {
        ${this.generateFeatureInitialization(name, config.features)}
    }
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Listen for relevant events
        const channelName = this.orchestrator.getChannelName('${name}');
        this.eventBus.on(channelName, this.handleEvent);
        
        // Listen for system events
        this.eventBus.on('system:theme-changed', (event) => {
            this.handleThemeChange(event.theme);
        });
        
        this.eventBus.on('system:resize', (event) => {
            this.handleResize(event.dimensions);
        });
    }
    
    /**
     * Handle incoming events
     */
    handleEvent(event) {
        console.log(\`📡 \${this.name} received event:\`, event.type);
        
        switch (event.type) {
            case 'activate':
                this.activate();
                break;
            case 'deactivate':
                this.deactivate();
                break;
            case 'update-config':
                this.updateConfig(event.config);
                break;
            default:
                console.warn(\`Unhandled event type: \${event.type}\`);
        }
    }
    
    /**
     * Handle theme changes
     */
    handleThemeChange(theme) {
        if (this.updateTheme) {
            this.updateTheme(theme);
        }
    }
    
    /**
     * Handle resize events
     */
    handleResize(dimensions) {
        if (this.handleResponsiveChange) {
            this.handleResponsiveChange(dimensions);
        }
    }
    
    /**
     * Activate the module
     */
    activate() {
        this.state.active = true;
        if (this.onActivate) {
            this.onActivate();
        }
    }
    
    /**
     * Deactivate the module
     */
    deactivate() {
        this.state.active = false;
        if (this.onDeactivate) {
            this.onDeactivate();
        }
    }
    
    /**
     * Update module configuration
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        if (this.onConfigUpdate) {
            this.onConfigUpdate(this.config);
        }
    }
    
    /**
     * Get module state
     */
    getState() {
        return {
            ...this.state,
            dependencies: Array.from(this.dependencies.keys()),
            exports: Object.keys(this.exports)
        };
    }
    
    /**
     * Expose module API
     */
    getExports() {
        return this.exports;
    }
    
    /**
     * Destroy the module
     */
    async destroy() {
        console.log(\`🗑️  Destroying \${this.name} module\`);
        
        // Remove event listeners
        const channelName = this.orchestrator.getChannelName('${name}');
        this.eventBus.off(channelName, this.handleEvent);
        
        // Clean up resources
        if (this.cleanup) {
            await this.cleanup();
        }
        
        this.state.active = false;
        this.state.initialized = false;
        
        // Notify orchestrator
        this.eventBus.emit('module:destroyed', {
            module: this.name,
            timestamp: Date.now()
        });
    }
}

${this.generateModuleImplementation(name, config)}

// Export module
export default ${this.toPascalCase(name)}Module;
`;
        
        fs.writeFileSync(modulePath, moduleContent, 'utf8');
    }
    
    /**
     * Generate feature initialization code
     */
    generateFeatureInitialization(name, features) {
        switch (name) {
            case 'navigation':
                return `
        // Initialize navigation features
        this.initBreadcrumbs();
        this.initSearchToggle();
        this.initThemeToggle();
        this.initMobileMenu();
        `;
            
            case 'chapter-reader':
                return `
        // Initialize chapter reader features
        await this.initModalReader();
        this.initTranslationSwitcher();
        this.initChapterNavigation();
        this.initVerseHighlighting();
        `;
            
            case 'search-engine':
                return `
        // Initialize search engine features
        await this.loadSearchIndex();
        this.initUnifiedSearch();
        this.initAutocomplete();
        this.initFilters();
        this.initResultHighlighting();
        `;
            
            default:
                return `
        // Initialize ${name} features
        ${features.map(feature => `this.init${this.toPascalCase(feature)}();`).join('\n        ')}
        `;
        }
    }
    
    /**
     * Generate module implementation
     */
    generateModuleImplementation(name, config) {
        switch (name) {
            case 'navigation':
                return this.generateNavigationModule();
            case 'chapter-reader':
                return this.generateChapterReaderModule();
            case 'search-engine':
                return this.generateSearchEngineModule();
            case 'theme-system':
                return this.generateThemeSystemModule();
            default:
                return `
// ${name} module implementation
class ${this.toPascalCase(name)}Implementation extends ${this.toPascalCase(name)}Module {
    constructor(orchestrator) {
        super(orchestrator);
    }
    
    // Add module-specific implementation here
}
`;
        }
    }
    
    /**
     * Generate navigation module implementation
     */
    generateNavigationModule() {
        return `
// Navigation Module Implementation
class NavigationImplementation extends NavigationModule {
    constructor(orchestrator) {
        super(orchestrator);
        this.breadcrumbContainer = null;
        this.mobileMenu = null;
        this.searchToggle = null;
        this.themeToggle = null;
    }
    
    initBreadcrumbs() {
        this.breadcrumbContainer = document.querySelector('.breadcrumb');
        if (this.breadcrumbContainer) {
            this.exports.updateBreadcrumbs = this.updateBreadcrumbs.bind(this);
        }
    }
    
    initSearchToggle() {
        this.searchToggle = document.querySelector('.search-toggle');
        if (this.searchToggle) {
            this.searchToggle.addEventListener('click', () => {
                this.eventBus.emit('search:toggle');
            });
        }
    }
    
    initThemeToggle() {
        this.themeToggle = document.querySelector('.theme-toggle');
        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', () => {
                this.eventBus.emit('theme:toggle');
            });
        }
    }
    
    initMobileMenu() {
        const menuToggle = document.querySelector('.mobile-menu-toggle');
        const menu = document.querySelector('.mobile-menu');
        
        if (menuToggle && menu) {
            menuToggle.addEventListener('click', () => {
                menu.classList.toggle('active');
            });
            
            this.mobileMenu = { toggle: menuToggle, menu: menu };
        }
    }
    
    updateBreadcrumbs(path) {
        if (!this.breadcrumbContainer) return;
        
        const segments = path.split('/').filter(Boolean);
        const breadcrumbs = segments.map((segment, index) => {
            const href = '/' + segments.slice(0, index + 1).join('/');
            return \`<a href="\${href}" class="breadcrumb-link">\${this.formatSegment(segment)}</a>\`;
        }).join(' / ');
        
        this.breadcrumbContainer.innerHTML = breadcrumbs;
    }
    
    formatSegment(segment) {
        return segment.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }
    
    updateTheme(theme) {
        if (this.themeToggle) {
            this.themeToggle.setAttribute('data-theme', theme);
        }
    }
    
    cleanup() {
        // Remove event listeners
        if (this.searchToggle) {
            this.searchToggle.removeEventListener('click', () => {});
        }
        if (this.themeToggle) {
            this.themeToggle.removeEventListener('click', () => {});
        }
    }
}

// Register implementation
NavigationModule.Implementation = NavigationImplementation;
`;
    }
    
    /**
     * Generate chapter reader module implementation
     */
    generateChapterReaderModule() {
        return `
// Chapter Reader Module Implementation  
class ChapterReaderImplementation extends ChapterReaderModule {
    constructor(orchestrator) {
        super(orchestrator);
        this.modal = null;
        this.currentChapter = null;
        this.translations = ['ESV', 'NIV', 'NLT', 'NKJV'];
        this.currentTranslation = 'ESV';
    }
    
    async initModalReader() {
        this.modal = this.createModal();
        document.body.appendChild(this.modal);
        
        this.exports.openChapter = this.openChapter.bind(this);
        this.exports.closeReader = this.closeReader.bind(this);
        this.exports.navigateToChapter = this.navigateToChapter.bind(this);
    }
    
    createModal() {
        const modal = document.createElement('div');
        modal.className = 'chapter-reader-modal';
        modal.innerHTML = \`
            <div class="modal-backdrop" data-action="close"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="chapter-title"></h2>
                    <button class="close-button" data-action="close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="translation-selector">
                        \${this.translations.map(t => 
                            \`<button class="translation-btn" data-translation="\${t}">\${t}</button>\`
                        ).join('')}
                    </div>
                    <div class="chapter-content"></div>
                    <div class="chapter-navigation">
                        <button class="nav-btn prev-chapter">← Previous</button>
                        <button class="nav-btn next-chapter">Next →</button>
                    </div>
                </div>
            </div>
        \`;
        
        // Add event listeners
        modal.addEventListener('click', this.handleModalClick.bind(this));
        
        return modal;
    }
    
    initTranslationSwitcher() {
        const buttons = this.modal.querySelectorAll('.translation-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.switchTranslation(btn.dataset.translation);
            });
        });
    }
    
    initChapterNavigation() {
        const prevBtn = this.modal.querySelector('.prev-chapter');
        const nextBtn = this.modal.querySelector('.next-chapter');
        
        prevBtn.addEventListener('click', () => this.navigateToPrevious());
        nextBtn.addEventListener('click', () => this.navigateToNext());
    }
    
    initVerseHighlighting() {
        // Add verse highlighting functionality
        this.modal.addEventListener('click', (e) => {
            if (e.target.matches('.verse')) {
                this.highlightVerse(e.target);
            }
        });
    }
    
    async openChapter(book, chapter) {
        const apiClient = this.dependencies.get('api-client');
        const cacheManager = this.dependencies.get('cache-manager');
        
        try {
            // Try cache first
            const cacheKey = \`\${book}-\${chapter}-\${this.currentTranslation}\`;
            let chapterData = await cacheManager.get(cacheKey);
            
            if (!chapterData) {
                chapterData = await apiClient.getChapter(book, chapter, this.currentTranslation);
                await cacheManager.set(cacheKey, chapterData, 3600); // Cache for 1 hour
            }
            
            this.currentChapter = { book, chapter };
            this.displayChapter(chapterData);
            this.modal.classList.add('active');
            
        } catch (error) {
            console.error('Failed to load chapter:', error);
            this.showError('Failed to load chapter content');
        }
    }
    
    displayChapter(chapterData) {
        const titleEl = this.modal.querySelector('.chapter-title');
        const contentEl = this.modal.querySelector('.chapter-content');
        
        titleEl.textContent = \`\${chapterData.book} \${chapterData.chapter}\`;
        
        const versesHtml = chapterData.verses.map(verse => 
            \`<p class="verse" data-verse="\${verse.number}">
                <span class="verse-number">\${verse.number}</span>
                <span class="verse-text">\${verse.text}</span>
            </p>\`
        ).join('');
        
        contentEl.innerHTML = versesHtml;
    }
    
    async switchTranslation(translation) {
        if (translation === this.currentTranslation) return;
        
        this.currentTranslation = translation;
        
        // Update active button
        const buttons = this.modal.querySelectorAll('.translation-btn');
        buttons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.translation === translation);
        });
        
        // Reload current chapter with new translation
        if (this.currentChapter) {
            await this.openChapter(this.currentChapter.book, this.currentChapter.chapter);
        }
    }
    
    async navigateToNext() {
        if (!this.currentChapter) return;
        
        const nextChapter = this.getNextChapter(this.currentChapter);
        if (nextChapter) {
            await this.openChapter(nextChapter.book, nextChapter.chapter);
        }
    }
    
    async navigateToPrevious() {
        if (!this.currentChapter) return;
        
        const prevChapter = this.getPreviousChapter(this.currentChapter);
        if (prevChapter) {
            await this.openChapter(prevChapter.book, prevChapter.chapter);
        }
    }
    
    getNextChapter(current) {
        // Implementation depends on book data structure
        // This is a simplified version
        return { book: current.book, chapter: current.chapter + 1 };
    }
    
    getPreviousChapter(current) {
        if (current.chapter > 1) {
            return { book: current.book, chapter: current.chapter - 1 };
        }
        return null;
    }
    
    highlightVerse(verseElement) {
        // Remove previous highlights
        const highlighted = this.modal.querySelectorAll('.verse.highlighted');
        highlighted.forEach(el => el.classList.remove('highlighted'));
        
        // Add highlight to clicked verse
        verseElement.classList.add('highlighted');
        
        // Emit event for other modules
        this.eventBus.emit('reader:verse-selected', {
            book: this.currentChapter.book,
            chapter: this.currentChapter.chapter,
            verse: verseElement.dataset.verse
        });
    }
    
    handleModalClick(event) {
        if (event.target.dataset.action === 'close') {
            this.closeReader();
        }
    }
    
    closeReader() {
        this.modal.classList.remove('active');
        this.currentChapter = null;
        
        this.eventBus.emit('reader:closed');
    }
    
    showError(message) {
        const contentEl = this.modal.querySelector('.chapter-content');
        contentEl.innerHTML = \`<div class="error-message">\${message}</div>\`;
    }
    
    cleanup() {
        if (this.modal) {
            this.modal.remove();
        }
    }
}

// Register implementation
ChapterReaderModule.Implementation = ChapterReaderImplementation;
`;
    }
    
    /**
     * Generate search engine module implementation
     */
    generateSearchEngineModule() {
        return `
// Search Engine Module Implementation
class SearchEngineImplementation extends SearchEngineModule {
    constructor(orchestrator) {
        super(orchestrator);
        this.searchIndex = null;
        this.searchInput = null;
        this.resultsContainer = null;
        this.autocompleteContainer = null;
        this.fuzzyMatcher = null;
    }
    
    async loadSearchIndex() {
        const searchIndexDep = this.dependencies.get('search-index');
        this.searchIndex = await searchIndexDep.load();
        
        const fuzzyMatcherDep = this.dependencies.get('fuzzy-matcher');
        this.fuzzyMatcher = new fuzzyMatcherDep.FuzzyMatcher();
        
        console.log(\`📚 Search index loaded: \${this.searchIndex.entries.length} entries\`);
    }
    
    initUnifiedSearch() {
        this.searchInput = document.querySelector('.search-input');
        this.resultsContainer = document.querySelector('.search-results');
        
        if (this.searchInput) {
            this.searchInput.addEventListener('input', this.debounce(this.handleSearch.bind(this), 300));
            this.searchInput.addEventListener('focus', this.handleFocus.bind(this));
            this.searchInput.addEventListener('blur', this.handleBlur.bind(this));
        }
        
        this.exports.search = this.search.bind(this);
        this.exports.clearResults = this.clearResults.bind(this);
    }
    
    initAutocomplete() {
        this.autocompleteContainer = document.createElement('div');
        this.autocompleteContainer.className = 'search-autocomplete';
        
        if (this.searchInput) {
            this.searchInput.parentNode.insertBefore(
                this.autocompleteContainer, 
                this.searchInput.nextSibling
            );
        }
    }
    
    initFilters() {
        const filterContainer = document.querySelector('.search-filters');
        if (filterContainer) {
            const filters = ['books', 'categories', 'entities', 'verses'];
            
            const filterHtml = filters.map(filter => 
                \`<label class="filter-option">
                    <input type="checkbox" name="filter" value="\${filter}" checked>
                    \${filter.charAt(0).toUpperCase() + filter.slice(1)}
                </label>\`
            ).join('');
            
            filterContainer.innerHTML = filterHtml;
            
            filterContainer.addEventListener('change', this.handleFilterChange.bind(this));
        }
    }
    
    initResultHighlighting() {
        // Add CSS for highlighting
        const style = document.createElement('style');
        style.textContent = \`
            .search-highlight {
                background-color: var(--highlight-color, #ffeb3b);
                padding: 1px 2px;
                border-radius: 2px;
            }
            
            .search-result-item {
                padding: 12px;
                border-bottom: 1px solid var(--border-color);
                cursor: pointer;
            }
            
            .search-result-item:hover {
                background-color: var(--hover-color);
            }
            
            .search-result-title {
                font-weight: bold;
                margin-bottom: 4px;
            }
            
            .search-result-snippet {
                color: var(--text-muted);
                font-size: 0.9em;
            }
        \`;
        document.head.appendChild(style);
    }
    
    async handleSearch(event) {
        const query = event.target.value.trim();
        
        if (query.length < 2) {
            this.clearResults();
            this.hideAutocomplete();
            return;
        }
        
        try {
            const results = await this.search(query);
            this.displayResults(results, query);
            this.showAutocomplete(query);
            
        } catch (error) {
            console.error('Search failed:', error);
            this.showError('Search failed. Please try again.');
        }
    }
    
    async search(query) {
        const filters = this.getActiveFilters();
        const options = {
            fuzzy: true,
            maxResults: 50,
            includeScore: true,
            filters: filters
        };
        
        // Use fuzzy matcher for flexible search
        const results = this.fuzzyMatcher.search(this.searchIndex, query, options);
        
        // Sort by relevance score
        return results.sort((a, b) => b.score - a.score);
    }
    
    displayResults(results, query) {
        if (!this.resultsContainer) return;
        
        if (results.length === 0) {
            this.resultsContainer.innerHTML = '<div class="no-results">No results found</div>';
            return;
        }
        
        const resultHtml = results.map(result => \`
            <div class="search-result-item" data-type="\${result.type}" data-id="\${result.id}">
                <div class="search-result-title">\${this.highlightText(result.title, query)}</div>
                <div class="search-result-snippet">\${this.highlightText(result.snippet, query)}</div>
                <div class="search-result-meta">
                    <span class="result-type">\${result.type}</span>
                    <span class="result-score">Score: \${Math.round(result.score * 100)}%</span>
                </div>
            </div>
        \`).join('');
        
        this.resultsContainer.innerHTML = resultHtml;
        
        // Add click handlers
        this.resultsContainer.addEventListener('click', this.handleResultClick.bind(this));
    }
    
    highlightText(text, query) {
        if (!text || !query) return text;
        
        const regex = new RegExp(\`(\${this.escapeRegex(query)})\`, 'gi');
        return text.replace(regex, '<span class="search-highlight">$1</span>');
    }
    
    showAutocomplete(query) {
        if (!this.autocompleteContainer) return;
        
        const suggestions = this.generateSuggestions(query);
        if (suggestions.length === 0) {
            this.hideAutocomplete();
            return;
        }
        
        const suggestionHtml = suggestions.map(suggestion => \`
            <div class="autocomplete-item" data-suggestion="\${suggestion}">
                \${this.highlightText(suggestion, query)}
            </div>
        \`).join('');
        
        this.autocompleteContainer.innerHTML = suggestionHtml;
        this.autocompleteContainer.style.display = 'block';
        
        // Add click handlers
        this.autocompleteContainer.addEventListener('click', this.handleSuggestionClick.bind(this));
    }
    
    generateSuggestions(query) {
        // Generate suggestions based on search index
        const suggestions = new Set();
        const queryLower = query.toLowerCase();
        
        this.searchIndex.entries.forEach(entry => {
            if (entry.title.toLowerCase().includes(queryLower)) {
                suggestions.add(entry.title);
            }
            
            entry.keywords?.forEach(keyword => {
                if (keyword.toLowerCase().includes(queryLower)) {
                    suggestions.add(keyword);
                }
            });
        });
        
        return Array.from(suggestions).slice(0, 8);
    }
    
    hideAutocomplete() {
        if (this.autocompleteContainer) {
            this.autocompleteContainer.style.display = 'none';
        }
    }
    
    getActiveFilters() {
        const filterInputs = document.querySelectorAll('.search-filters input[name="filter"]:checked');
        return Array.from(filterInputs).map(input => input.value);
    }
    
    handleFilterChange() {
        // Re-run search with new filters
        if (this.searchInput && this.searchInput.value.trim()) {
            this.handleSearch({ target: this.searchInput });
        }
    }
    
    handleResultClick(event) {
        const resultItem = event.target.closest('.search-result-item');
        if (!resultItem) return;
        
        const type = resultItem.dataset.type;
        const id = resultItem.dataset.id;
        
        this.eventBus.emit('search:result-selected', {
            type: type,
            id: id,
            timestamp: Date.now()
        });
        
        // Navigate to result
        this.navigateToResult(type, id);
    }
    
    handleSuggestionClick(event) {
        const suggestion = event.target.dataset.suggestion;
        if (suggestion && this.searchInput) {
            this.searchInput.value = suggestion;
            this.handleSearch({ target: this.searchInput });
            this.hideAutocomplete();
        }
    }
    
    navigateToResult(type, id) {
        let url = '/';
        
        switch (type) {
            case 'book':
                url = \`/books/\${id}/\`;
                break;
            case 'category':
                url = \`/categories/\${id}/\`;
                break;
            case 'entity':
                url = \`/entities/\${id}/\`;
                break;
            case 'chapter':
                const [book, chapter] = id.split('-');
                url = \`/books/\${book}/\`;
                // Also open chapter reader
                this.eventBus.emit('reader:open-chapter', { book, chapter });
                break;
        }
        
        if (url !== '/') {
            window.location.href = url;
        }
    }
    
    handleFocus() {
        this.resultsContainer?.classList.add('focused');
    }
    
    handleBlur() {
        // Delay to allow clicks on results
        setTimeout(() => {
            this.resultsContainer?.classList.remove('focused');
            this.hideAutocomplete();
        }, 200);
    }
    
    clearResults() {
        if (this.resultsContainer) {
            this.resultsContainer.innerHTML = '';
        }
    }
    
    showError(message) {
        if (this.resultsContainer) {
            this.resultsContainer.innerHTML = \`<div class="search-error">\${message}</div>\`;
        }
    }
    
    escapeRegex(text) {
        return text.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&');
    }
    
    debounce(func, delay) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }
    
    cleanup() {
        if (this.autocompleteContainer) {
            this.autocompleteContainer.remove();
        }
        
        // Remove event listeners
        if (this.searchInput) {
            this.searchInput.removeEventListener('input', this.handleSearch);
            this.searchInput.removeEventListener('focus', this.handleFocus);
            this.searchInput.removeEventListener('blur', this.handleBlur);
        }
    }
}

// Register implementation
SearchEngineModule.Implementation = SearchEngineImplementation;
`;
    }
    
    /**
     * Generate theme system module implementation
     */
    generateThemeSystemModule() {
        return `
// Theme System Module Implementation
class ThemeSystemImplementation extends ThemeSystemModule {
    constructor(orchestrator) {
        super(orchestrator);
        this.currentTheme = 'dark'; // Default theme
        this.themes = {
            'light': { name: 'Light', icon: '☀️' },
            'dark': { name: 'Dark', icon: '🌙' },
            'sepia': { name: 'Sepia', icon: '📜' },
            'high-contrast': { name: 'High Contrast', icon: '🔳' }
        };
    }
    
    async initializeFeatures() {
        this.initThemeSwitcher();
        this.initColorSchemes();
        this.initFontControls();
        this.initAccessibilityOptions();
        
        // Load saved theme
        await this.loadSavedTheme();
        
        // Export theme API
        this.exports.setTheme = this.setTheme.bind(this);
        this.exports.getCurrentTheme = this.getCurrentTheme.bind(this);
        this.exports.getAvailableThemes = this.getAvailableThemes.bind(this);
    }
    
    initThemeSwitcher() {
        const switcher = document.querySelector('.theme-switcher');
        if (switcher) {
            this.renderThemeSwitcher(switcher);
        }
    }
    
    renderThemeSwitcher(container) {
        const switcherHtml = Object.entries(this.themes).map(([key, theme]) => \`
            <button class="theme-option \${key === this.currentTheme ? 'active' : ''}" 
                    data-theme="\${key}" 
                    title="\${theme.name}">
                <span class="theme-icon">\${theme.icon}</span>
                <span class="theme-name">\${theme.name}</span>
            </button>
        \`).join('');
        
        container.innerHTML = switcherHtml;
        container.addEventListener('click', this.handleThemeSwitch.bind(this));
    }
    
    initColorSchemes() {
        // Define color schemes for each theme
        this.colorSchemes = {
            'light': {
                '--bg-primary': '#ffffff',
                '--bg-secondary': '#f8f9fa',
                '--text-primary': '#212529',
                '--text-secondary': '#6c757d',
                '--accent': '#007bff',
                '--border': '#dee2e6'
            },
            'dark': {
                '--bg-primary': '#1a1a1a',
                '--bg-secondary': '#2d2d2d',
                '--text-primary': '#e9ecef',
                '--text-secondary': '#adb5bd',
                '--accent': '#4dabf7',
                '--border': '#495057'
            },
            'sepia': {
                '--bg-primary': '#f4f3e8',
                '--bg-secondary': '#e8e6d3',
                '--text-primary': '#5d4e37',
                '--text-secondary': '#8b7355',
                '--accent': '#8b4513',
                '--border': '#d2b48c'
            },
            'high-contrast': {
                '--bg-primary': '#000000',
                '--bg-secondary': '#1a1a1a',
                '--text-primary': '#ffffff',
                '--text-secondary': '#cccccc',
                '--accent': '#ffff00',
                '--border': '#ffffff'
            }
        };
    }
    
    initFontControls() {
        const fontControls = document.querySelector('.font-controls');
        if (fontControls) {
            fontControls.innerHTML = \`
                <div class="font-size-control">
                    <label for="font-size">Font Size:</label>
                    <input type="range" id="font-size" min="12" max="24" value="16">
                    <span class="font-size-display">16px</span>
                </div>
                <div class="font-family-control">
                    <label for="font-family">Font Family:</label>
                    <select id="font-family">
                        <option value="system">System Default</option>
                        <option value="serif">Serif</option>
                        <option value="sans-serif">Sans Serif</option>
                        <option value="monospace">Monospace</option>
                    </select>
                </div>
            \`;
            
            fontControls.addEventListener('input', this.handleFontChange.bind(this));
            fontControls.addEventListener('change', this.handleFontChange.bind(this));
        }
    }
    
    initAccessibilityOptions() {
        const a11yOptions = document.querySelector('.accessibility-options');
        if (a11yOptions) {
            a11yOptions.innerHTML = \`
                <div class="a11y-option">
                    <label>
                        <input type="checkbox" id="reduce-motion"> Reduce Motion
                    </label>
                </div>
                <div class="a11y-option">
                    <label>
                        <input type="checkbox" id="increase-contrast"> Increase Contrast
                    </label>
                </div>
                <div class="a11y-option">
                    <label>
                        <input type="checkbox" id="dyslexia-font"> Dyslexia-Friendly Font
                    </label>
                </div>
            \`;
            
            a11yOptions.addEventListener('change', this.handleA11yChange.bind(this));
        }
    }
    
    async loadSavedTheme() {
        try {
            const saved = localStorage.getItem('bible-explorer-theme');
            if (saved) {
                const themeData = JSON.parse(saved);
                await this.setTheme(themeData.theme, false);
                
                // Restore font settings
                if (themeData.fontSize) {
                    this.setFontSize(themeData.fontSize);
                }
                if (themeData.fontFamily) {
                    this.setFontFamily(themeData.fontFamily);
                }
                if (themeData.a11yOptions) {
                    this.setA11yOptions(themeData.a11yOptions);
                }
            }
        } catch (error) {
            console.error('Failed to load saved theme:', error);
        }
    }
    
    async setTheme(themeName, save = true) {
        if (!this.themes[themeName]) {
            console.warn(\`Unknown theme: \${themeName}\`);
            return;
        }
        
        this.currentTheme = themeName;
        
        // Apply color scheme
        const colorScheme = this.colorSchemes[themeName];
        Object.entries(colorScheme).forEach(([property, value]) => {
            document.documentElement.style.setProperty(property, value);
        });
        
        // Update body class
        document.body.className = document.body.className.replace(/theme-\\w+/g, '');
        document.body.classList.add(\`theme-\${themeName}\`);
        
        // Update switcher UI
        document.querySelectorAll('.theme-option').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === themeName);
        });
        
        // Save to localStorage
        if (save) {
            this.saveThemeSettings();
        }
        
        // Notify other modules
        this.eventBus.emit('system:theme-changed', {
            theme: themeName,
            colorScheme: colorScheme,
            timestamp: Date.now()
        });
        
        console.log(\`🎨 Theme changed to: \${this.themes[themeName].name}\`);
    }
    
    handleThemeSwitch(event) {
        const themeButton = event.target.closest('.theme-option');
        if (themeButton) {
            const themeName = themeButton.dataset.theme;
            this.setTheme(themeName);
        }
    }
    
    handleFontChange(event) {
        const { id, value } = event.target;
        
        switch (id) {
            case 'font-size':
                this.setFontSize(value);
                const display = document.querySelector('.font-size-display');
                if (display) display.textContent = \`\${value}px\`;
                break;
            case 'font-family':
                this.setFontFamily(value);
                break;
        }
        
        this.saveThemeSettings();
    }
    
    setFontSize(size) {
        document.documentElement.style.setProperty('--font-size-base', \`\${size}px\`);
    }
    
    setFontFamily(family) {
        let fontStack = 'system-ui, -apple-system, sans-serif';
        
        switch (family) {
            case 'serif':
                fontStack = 'Georgia, "Times New Roman", serif';
                break;
            case 'sans-serif':
                fontStack = 'system-ui, -apple-system, sans-serif';
                break;
            case 'monospace':
                fontStack = '"SF Mono", Monaco, monospace';
                break;
        }
        
        document.documentElement.style.setProperty('--font-family-base', fontStack);
    }
    
    handleA11yChange(event) {
        const { id, checked } = event.target;
        
        switch (id) {
            case 'reduce-motion':
                document.documentElement.style.setProperty(
                    '--animation-duration', 
                    checked ? '0s' : '0.3s'
                );
                break;
            case 'increase-contrast':
                document.body.classList.toggle('high-contrast-mode', checked);
                break;
            case 'dyslexia-font':
                document.body.classList.toggle('dyslexia-font', checked);
                break;
        }
        
        this.saveThemeSettings();
    }
    
    setA11yOptions(options) {
        Object.entries(options).forEach(([option, enabled]) => {
            const checkbox = document.getElementById(option);
            if (checkbox) {
                checkbox.checked = enabled;
                checkbox.dispatchEvent(new Event('change'));
            }
        });
    }
    
    saveThemeSettings() {
        const settings = {
            theme: this.currentTheme,
            fontSize: document.getElementById('font-size')?.value,
            fontFamily: document.getElementById('font-family')?.value,
            a11yOptions: {
                'reduce-motion': document.getElementById('reduce-motion')?.checked,
                'increase-contrast': document.getElementById('increase-contrast')?.checked,
                'dyslexia-font': document.getElementById('dyslexia-font')?.checked
            }
        };
        
        localStorage.setItem('bible-explorer-theme', JSON.stringify(settings));
    }
    
    getCurrentTheme() {
        return this.currentTheme;
    }
    
    getAvailableThemes() {
        return this.themes;
    }
    
    updateTheme(newTheme) {
        this.setTheme(newTheme);
    }
}

// Register implementation
ThemeSystemModule.Implementation = ThemeSystemImplementation;
`;
    }
    
    /**
     * Generate orchestrator client
     */
    async generateOrchestratorClient(moduleDir) {
        const orchestratorPath = path.join(moduleDir, 'micro-frontend-orchestrator.js');
        
        const orchestratorContent = `/**
 * Micro-Frontend Orchestrator - Client-Side Implementation
 * Auto-generated by micro-frontend-orchestrator.js
 */

class MicroFrontendOrchestrator {
    constructor() {
        this.config = ${JSON.stringify(this.config, null, 2)};
        this.modules = new Map();
        this.dependencies = new Map();
        this.eventBus = this.createEventBus();
        this.loadQueue = [];
        this.isLoading = false;
        
        console.log('🎭 Micro-Frontend Orchestrator initialized');
    }
    
    /**
     * Create event bus for inter-module communication
     */
    createEventBus() {
        const events = new Map();
        
        return {
            on: (event, callback) => {
                if (!events.has(event)) {
                    events.set(event, []);
                }
                events.get(event).push(callback);
            },
            
            off: (event, callback) => {
                if (events.has(event)) {
                    const callbacks = events.get(event);
                    const index = callbacks.indexOf(callback);
                    if (index > -1) {
                        callbacks.splice(index, 1);
                    }
                }
            },
            
            emit: (event, data) => {
                if (events.has(event)) {
                    events.get(event).forEach(callback => {
                        try {
                            callback(data);
                        } catch (error) {
                            console.error(\`Event handler error for \${event}:\`, error);
                        }
                    });
                }
            }
        };
    }
    
    /**
     * Initialize the orchestrator
     */
    async init() {
        try {
            // Load shared dependencies first
            await this.loadSharedDependencies();
            
            // Load critical modules immediately
            await this.loadCriticalModules();
            
            // Schedule other modules based on their load strategies
            this.scheduleModuleLoading();
            
            // Set up page lifecycle events
            this.setupPageLifecycle();
            
            console.log('✅ Micro-Frontend Orchestrator ready');
            
        } catch (error) {
            console.error('❌ Failed to initialize orchestrator:', error);
        }
    }
    
    /**
     * Load shared dependencies
     */
    async loadSharedDependencies() {
        const promises = Object.entries(this.config.sharedDependencies).map(
            async ([name, config]) => {
                const dependency = await this.loadDependency(name, config);
                this.dependencies.set(name, dependency);
                return dependency;
            }
        );
        
        await Promise.all(promises);
        console.log(\`📦 Loaded \${promises.length} shared dependencies\`);
    }
    
    /**
     * Load a shared dependency
     */
    async loadDependency(name, config) {
        // This is a simplified implementation
        // In a real implementation, you might load from CDN or build system
        switch (name) {
            case 'api-client':
                return await import('./shared/api-client.js');
            case 'event-bus':
                return { EventBus: this.eventBus };
            case 'utils':
                return await import('./shared/utils.js');
            case 'cache-manager':
                return await import('./shared/cache-manager.js');
            default:
                console.warn(\`Unknown dependency: \${name}\`);
                return {};
        }
    }
    
    /**
     * Load critical modules immediately
     */
    async loadCriticalModules() {
        const criticalModules = Object.entries(this.config.microfrontends)
            .filter(([name, config]) => config.priority === 'critical')
            .map(([name, config]) => ({ name, config }));
        
        const promises = criticalModules.map(({ name, config }) => 
            this.loadModule(name, config)
        );
        
        await Promise.all(promises);
        console.log(\`⚡ Loaded \${criticalModules.length} critical modules\`);
    }
    
    /**
     * Schedule module loading based on strategies
     */
    scheduleModuleLoading() {
        Object.entries(this.config.microfrontends).forEach(([name, config]) => {
            if (config.priority === 'critical') return; // Already loaded
            
            const strategy = this.config.loadStrategies[config.loadStrategy];
            
            switch (config.loadStrategy) {
                case 'deferred':
                    setTimeout(() => this.loadModule(name, config), strategy.delay);
                    break;
                    
                case 'lazy':
                    this.setupLazyLoading(name, config);
                    break;
                    
                case 'on-demand':
                    this.setupOnDemandLoading(name, config);
                    break;
                    
                case 'background':
                    this.scheduleBackgroundLoading(name, config, strategy.delay);
                    break;
            }
        });
    }
    
    /**
     * Set up lazy loading (on user interaction)
     */
    setupLazyLoading(name, config) {
        const triggers = this.getLazyLoadTriggers(name);
        
        triggers.forEach(trigger => {
            const handler = () => {
                this.loadModule(name, config);
                // Remove listener after first trigger
                document.removeEventListener(trigger.event, handler);
            };
            
            if (trigger.element) {
                trigger.element.addEventListener(trigger.event, handler, { once: true });
            } else {
                document.addEventListener(trigger.event, handler, { once: true });
            }
        });
    }
    
    /**
     * Get lazy load triggers for a module
     */
    getLazyLoadTriggers(moduleName) {
        const triggers = [];
        
        switch (moduleName) {
            case 'chapter-reader':
                triggers.push(
                    { event: 'click', selector: '.chapter-link' },
                    { event: 'click', selector: '.read-chapter-btn' }
                );
                break;
                
            case 'commentary-system':
                triggers.push(
                    { event: 'click', selector: '.commentary-btn' }
                );
                break;
                
            case 'search-engine':
                triggers.push(
                    { event: 'focus', selector: '.search-input' },
                    { event: 'click', selector: '.search-toggle' }
                );
                break;
        }
        
        // Convert selectors to elements
        return triggers.map(trigger => ({
            event: trigger.event,
            element: trigger.selector ? document.querySelector(trigger.selector) : null
        })).filter(trigger => trigger.element || !trigger.selector);
    }
    
    /**
     * Set up on-demand loading
     */
    setupOnDemandLoading(name, config) {
        // Register load function globally
        window[\`load\${this.toPascalCase(name)}\`] = () => {
            return this.loadModule(name, config);
        };
    }
    
    /**
     * Schedule background loading
     */
    scheduleBackgroundLoading(name, config, delay) {
        // Wait for idle time
        if ('requestIdleCallback' in window) {
            requestIdleCallback(() => {
                setTimeout(() => this.loadModule(name, config), delay);
            });
        } else {
            setTimeout(() => this.loadModule(name, config), delay + 1000);
        }
    }
    
    /**
     * Load a module
     */
    async loadModule(name, config) {
        if (this.modules.has(name)) {
            return this.modules.get(name);
        }
        
        try {
            console.log(\`📥 Loading \${name} module...\`);
            
            // Dynamic import of module
            const ModuleClass = await import(\`./\${config.entry}\`);
            const moduleInstance = new ModuleClass.default(this);
            
            // Initialize module
            await moduleInstance.init();
            
            this.modules.set(name, moduleInstance);
            
            console.log(\`✅ \${name} module loaded and initialized\`);
            return moduleInstance;
            
        } catch (error) {
            console.error(\`❌ Failed to load \${name} module:\`, error);
            
            // Emit error event
            this.eventBus.emit('module:load-error', {
                module: name,
                error: error.message,
                timestamp: Date.now()
            });
            
            return null;
        }
    }
    
    /**
     * Get a loaded module
     */
    getModule(name) {
        return this.modules.get(name);
    }
    
    /**
     * Get a shared dependency
     */
    getDependency(name) {
        return this.dependencies.get(name);
    }
    
    /**
     * Get event bus channel name for a module
     */
    getChannelName(moduleName) {
        return this.config.communication.channels[moduleName] || \`\${moduleName}-events\`;
    }
    
    /**
     * Set up page lifecycle events
     */
    setupPageLifecycle() {
        // Page visibility change
        document.addEventListener('visibilitychange', () => {
            const event = document.hidden ? 'page:hidden' : 'page:visible';
            this.eventBus.emit(event, { timestamp: Date.now() });
        });
        
        // Window resize
        window.addEventListener('resize', () => {
            this.eventBus.emit('system:resize', {
                dimensions: {
                    width: window.innerWidth,
                    height: window.innerHeight
                },
                timestamp: Date.now()
            });
        });
        
        // Network status
        window.addEventListener('online', () => {
            this.eventBus.emit('system:online', { timestamp: Date.now() });
        });
        
        window.addEventListener('offline', () => {
            this.eventBus.emit('system:offline', { timestamp: Date.now() });
        });
        
        // Page unload
        window.addEventListener('beforeunload', () => {
            this.eventBus.emit('system:unload', { timestamp: Date.now() });
        });
    }
    
    /**
     * Convert string to PascalCase
     */
    toPascalCase(str) {
        return str.split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join('');
    }
    
    /**
     * Get orchestrator status
     */
    getStatus() {
        return {
            modules: Array.from(this.modules.keys()),
            dependencies: Array.from(this.dependencies.keys()),
            loadedModules: this.modules.size,
            totalModules: Object.keys(this.config.microfrontends).length
        };
    }
    
    /**
     * Destroy all modules (cleanup)
     */
    async destroy() {
        console.log('🧹 Destroying micro-frontend orchestrator...');
        
        const destroyPromises = Array.from(this.modules.values()).map(
            module => module.destroy()
        );
        
        await Promise.all(destroyPromises);
        
        this.modules.clear();
        this.dependencies.clear();
        
        console.log('✅ Orchestrator destroyed');
    }
}

// Initialize when DOM is ready
if (typeof window !== 'undefined') {
    window.MicroFrontendOrchestrator = MicroFrontendOrchestrator;
    
    document.addEventListener('DOMContentLoaded', async () => {
        window.microFrontendOrchestrator = new MicroFrontendOrchestrator();
        await window.microFrontendOrchestrator.init();
    });
}

export default MicroFrontendOrchestrator;
`;
        
        fs.writeFileSync(orchestratorPath, orchestratorContent, 'utf8');
    }
    
    /**
     * Generate shared dependencies
     */
    async generateSharedDependencies(moduleDir) {
        const sharedDir = path.join(moduleDir, 'shared');
        if (!fs.existsSync(sharedDir)) {
            fs.mkdirSync(sharedDir, { recursive: true });
        }
        
        // Generate API client
        await this.generateApiClient(sharedDir);
        
        // Generate utilities
        await this.generateUtilities(sharedDir);
        
        // Generate cache manager
        await this.generateCacheManager(sharedDir);
    }
    
    /**
     * Generate API client
     */
    async generateApiClient(sharedDir) {
        const apiClientPath = path.join(sharedDir, 'api-client.js');
        
        const apiClientContent = `/**
 * Shared API Client for Micro-Frontends
 */

class ApiClient {
    constructor() {
        this.baseUrl = window.location.origin;
        this.cache = new Map();
        this.requestQueue = new RequestQueue();
    }
    
    /**
     * Get chapter data
     */
    async getChapter(book, chapter, translation = 'ESV') {
        const cacheKey = \`chapter-\${book}-\${chapter}-\${translation}\`;
        
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }
        
        try {
            const response = await this.requestQueue.add(
                \`/api/chapters/\${book}/\${chapter}?translation=\${translation}\`
            );
            
            const data = await response.json();
            this.cache.set(cacheKey, data);
            
            return data;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }
    
    /**
     * Search content
     */
    async search(query, filters = []) {
        const params = new URLSearchParams({
            q: query,
            filters: filters.join(',')
        });
        
        const response = await this.requestQueue.add(\`/api/search?\${params}\`);
        return await response.json();
    }
}

/**
 * Request queue for managing API calls
 */
class RequestQueue {
    constructor() {
        this.queue = [];
        this.active = 0;
        this.maxConcurrent = 4;
    }
    
    async add(url, options = {}) {
        return new Promise((resolve, reject) => {
            this.queue.push({
                url,
                options,
                resolve,
                reject
            });
            
            this.process();
        });
    }
    
    async process() {
        if (this.active >= this.maxConcurrent || this.queue.length === 0) {
            return;
        }
        
        this.active++;
        const { url, options, resolve, reject } = this.queue.shift();
        
        try {
            const response = await fetch(url, options);
            resolve(response);
        } catch (error) {
            reject(error);
        } finally {
            this.active--;
            this.process(); // Process next in queue
        }
    }
}

export { ApiClient, RequestQueue };
`;
        
        fs.writeFileSync(apiClientPath, apiClientContent, 'utf8');
    }
    
    /**
     * Generate utilities
     */
    async generateUtilities(sharedDir) {
        const utilsPath = path.join(sharedDir, 'utils.js');
        
        const utilsContent = `/**
 * Shared Utilities for Micro-Frontends
 */

/**
 * Debounce function
 */
export function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

/**
 * Throttle function
 */
export function throttle(func, delay) {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, delay);
        }
    };
}

/**
 * Sanitize HTML
 */
export function sanitize(html) {
    const temp = document.createElement('div');
    temp.textContent = html;
    return temp.innerHTML;
}

/**
 * Format date
 */
export function formatDate(date, format = 'short') {
    const options = format === 'short' ? 
        { month: 'short', day: 'numeric' } :
        { year: 'numeric', month: 'long', day: 'numeric' };
    
    return new Intl.DateTimeFormat('en-US', options).format(new Date(date));
}

/**
 * Deep merge objects
 */
export function deepMerge(target, source) {
    const result = { ...target };
    
    for (const key in source) {
        if (source[key] && typeof source[key] === 'object') {
            result[key] = deepMerge(result[key] || {}, source[key]);
        } else {
            result[key] = source[key];
        }
    }
    
    return result;
}

/**
 * Create unique ID
 */
export function createId(prefix = 'id') {
    return \`\${prefix}-\${Math.random().toString(36).substr(2, 9)}\`;
}
`;
        
        fs.writeFileSync(utilsPath, utilsContent, 'utf8');
    }
    
    /**
     * Generate cache manager
     */
    async generateCacheManager(sharedDir) {
        const cacheManagerPath = path.join(sharedDir, 'cache-manager.js');
        
        const cacheManagerContent = `/**
 * Shared Cache Manager for Micro-Frontends
 */

class CacheManager {
    constructor() {
        this.memoryCache = new Map();
        this.storageAdapter = new IndexedDBAdapter();
        this.maxMemorySize = 10 * 1024 * 1024; // 10MB
        this.currentSize = 0;
    }
    
    /**
     * Get item from cache
     */
    async get(key) {
        // Try memory cache first
        if (this.memoryCache.has(key)) {
            const item = this.memoryCache.get(key);
            if (!this.isExpired(item)) {
                return item.data;
            }
            this.memoryCache.delete(key);
        }
        
        // Try persistent storage
        return await this.storageAdapter.get(key);
    }
    
    /**
     * Set item in cache
     */
    async set(key, data, ttl = 3600) {
        const item = {
            data,
            timestamp: Date.now(),
            ttl: ttl * 1000,
            size: this.estimateSize(data)
        };
        
        // Store in memory if it fits
        if (item.size < this.maxMemorySize / 4) {
            this.ensureMemorySpace(item.size);
            this.memoryCache.set(key, item);
            this.currentSize += item.size;
        }
        
        // Store in persistent storage
        await this.storageAdapter.set(key, item);
    }
    
    /**
     * Check if item is expired
     */
    isExpired(item) {
        return Date.now() - item.timestamp > item.ttl;
    }
    
    /**
     * Ensure enough memory space
     */
    ensureMemorySpace(requiredSize) {
        while (this.currentSize + requiredSize > this.maxMemorySize) {
            const oldestKey = this.findOldestItem();
            if (oldestKey) {
                const item = this.memoryCache.get(oldestKey);
                this.memoryCache.delete(oldestKey);
                this.currentSize -= item.size;
            } else {
                break;
            }
        }
    }
    
    /**
     * Find oldest item in cache
     */
    findOldestItem() {
        let oldest = null;
        let oldestTime = Infinity;
        
        for (const [key, item] of this.memoryCache.entries()) {
            if (item.timestamp < oldestTime) {
                oldestTime = item.timestamp;
                oldest = key;
            }
        }
        
        return oldest;
    }
    
    /**
     * Estimate data size
     */
    estimateSize(data) {
        return JSON.stringify(data).length * 2; // Rough estimate
    }
}

/**
 * IndexedDB storage adapter
 */
class IndexedDBAdapter {
    constructor() {
        this.dbName = 'bible-explorer-cache';
        this.version = 1;
        this.db = null;
    }
    
    async init() {
        if (this.db) return;
        
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('cache')) {
                    db.createObjectStore('cache');
                }
            };
        });
    }
    
    async get(key) {
        await this.init();
        
        return new Promise((resolve) => {
            const transaction = this.db.transaction(['cache'], 'readonly');
            const store = transaction.objectStore('cache');
            const request = store.get(key);
            
            request.onsuccess = () => {
                const result = request.result;
                if (result && !this.isExpired(result)) {
                    resolve(result.data);
                } else {
                    resolve(null);
                }
            };
            
            request.onerror = () => resolve(null);
        });
    }
    
    async set(key, item) {
        await this.init();
        
        return new Promise((resolve) => {
            const transaction = this.db.transaction(['cache'], 'readwrite');
            const store = transaction.objectStore('cache');
            const request = store.put(item, key);
            
            request.onsuccess = () => resolve();
            request.onerror = () => resolve();
        });
    }
    
    isExpired(item) {
        return Date.now() - item.timestamp > item.ttl;
    }
}

export { CacheManager, IndexedDBAdapter };
`;
        
        fs.writeFileSync(cacheManagerPath, cacheManagerContent, 'utf8');
    }
    
    /**
     * Generate build integration
     */
    async generateBuildIntegration() {
        const buildIntegrationPath = path.join(__dirname, '..', '.eleventy.js');
        
        // Add micro-frontend build configuration to Eleventy config
        const buildConfig = `
// Micro-Frontend Build Integration
eleventyConfig.addPassthroughCopy("src/assets/modules");

// Add module bundling
eleventyConfig.on('beforeBuild', async () => {
    console.log('🎭 Building micro-frontends...');
    
    // Generate module manifests
    const MicroFrontendOrchestrator = require('./scripts/micro-frontend-orchestrator.js');
    const orchestrator = new MicroFrontendOrchestrator();
    await orchestrator.generateMicroFrontends();
    
    console.log('✅ Micro-frontends built');
});
`;
        
        // Note: In a real implementation, you would integrate this with the existing .eleventy.js file
        console.log('Build integration config generated (would be added to .eleventy.js)');
    }
    
    /**
     * Convert string to PascalCase
     */
    toPascalCase(str) {
        return str.split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join('');
    }
}

// Export for build integration
module.exports = MicroFrontendOrchestrator;

// Run if called directly
if (require.main === module) {
    const orchestrator = new MicroFrontendOrchestrator();
    orchestrator.generateMicroFrontends()
        .then(() => {
            console.log('✅ Micro-frontend architecture generated successfully');
        })
        .catch(error => {
            console.error('❌ Failed to generate micro-frontend architecture:', error);
            process.exit(1);
        });
}