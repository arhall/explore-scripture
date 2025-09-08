/**
 * Distributed Search Index System
 * Implements intelligent search indexing with sharding, distributed caching,
 * and advanced relevance algorithms for optimal performance at scale.
 */

const fs = require('fs');
const path = require('path');

class DistributedSearchIndex {
    constructor() {
        this.config = {
            // Index sharding configuration
            sharding: {
                strategy: 'hybrid', // 'content-type', 'alphabetical', 'size-based', 'hybrid'
                maxShardSize: 10 * 1024 * 1024, // 10MB per shard
                minShardSize: 1 * 1024 * 1024,  // 1MB min
                targetShards: 12, // Optimal number for parallel processing
                rebalanceThreshold: 0.3 // Rebalance if size difference > 30%
            },
            
            // Content indexing configuration
            indexing: {
                // Field weights for relevance scoring
                fieldWeights: {
                    title: 10.0,        // Book/chapter titles
                    heading: 8.0,       // Section headings
                    verse: 5.0,         // Verse content
                    summary: 4.0,       // Chapter summaries
                    name: 7.0,          // Entity names
                    description: 3.0,   // Descriptions
                    tag: 6.0,          // Tags and categories
                    reference: 2.0      // Cross-references
                },
                
                // Text processing configuration
                processing: {
                    stemming: true,         // Enable word stemming
                    stopWords: true,        // Remove common stop words
                    synonyms: true,         // Handle biblical synonyms
                    abbreviations: true,    // Expand abbreviations
                    fuzzyMatching: true,    // Enable fuzzy matching
                    phoneticMatching: true, // Soundex-like matching
                    contextualBoost: true   // Boost based on context
                },
                
                // N-gram configuration
                ngrams: {
                    min: 2,         // Minimum n-gram size
                    max: 4,         // Maximum n-gram size
                    overlap: 1,     // Character overlap
                    threshold: 0.1  // Minimum score threshold
                }
            },
            
            // Caching and storage configuration
            caching: {
                levels: {
                    // L1: In-memory cache (fastest)
                    l1: {
                        type: 'memory',
                        maxSize: 50 * 1024 * 1024, // 50MB
                        ttl: 300000,  // 5 minutes
                        maxEntries: 10000
                    },
                    
                    // L2: IndexedDB cache (persistent)
                    l2: {
                        type: 'indexeddb',
                        maxSize: 200 * 1024 * 1024, // 200MB
                        ttl: 3600000, // 1 hour
                        maxEntries: 100000
                    },
                    
                    // L3: Service Worker cache (network fallback)
                    l3: {
                        type: 'service-worker',
                        maxSize: 500 * 1024 * 1024, // 500MB
                        ttl: 86400000, // 24 hours
                        strategy: 'cache-first'
                    }
                },
                
                // Cache invalidation rules
                invalidation: {
                    contentUpdate: true,    // Invalidate on content changes
                    timeBasedExpiry: true,  // Auto-expire old entries
                    memoryPressure: true,   // Invalidate on low memory
                    userPreferences: true   // Invalidate on preference changes
                }
            },
            
            // Query optimization configuration
            optimization: {
                // Query rewriting rules
                rewriting: {
                    expandAbbreviations: true,
                    handleTypos: true,
                    synonymExpansion: true,
                    contextualExpansion: true
                },
                
                // Result ranking factors
                ranking: {
                    textRelevance: 0.4,     // TF-IDF score weight
                    popularityBoost: 0.2,   // Popular content boost
                    recentnessBoost: 0.1,   // Recent content boost
                    userPreference: 0.2,    // User preference boost
                    contextualMatch: 0.1    // Contextual relevance boost
                },
                
                // Performance targets
                performance: {
                    maxQueryTime: 100,      // 100ms target
                    maxResultTime: 300,     // 300ms for full results
                    maxIndexTime: 5000,     // 5s for index operations
                    concurrentQueries: 10   // Support 10 concurrent queries
                }
            }
        };
        
        this.indexData = {
            shards: new Map(),
            metadata: new Map(),
            statistics: new Map(),
            synonyms: new Map(),
            abbreviations: new Map()
        };
        
        this.cacheManager = null;
        this.queryProcessor = null;
    }
    
    /**
     * Generate distributed search index system
     */
    async generateSearchIndexSystem() {
        // Generate core index builder
        const indexBuilder = this.generateIndexBuilder();
        
        // Generate query processor
        const queryProcessor = this.generateQueryProcessor();
        
        // Generate cache manager
        const cacheManager = this.generateCacheManager();
        
        // Generate search client
        const searchClient = this.generateSearchClient();
        
        // Generate shard manager
        const shardManager = this.generateShardManager();
        
        // Generate build integration
        const buildIntegration = this.generateBuildIntegration();
        
        // Write all components
        const outputDir = path.join(__dirname, '..', 'src', 'assets', 'search');
        
        await this.ensureDirectory(outputDir);
        
        await Promise.all([
            this.writeComponent(indexBuilder, path.join(outputDir, 'index-builder.js')),
            this.writeComponent(queryProcessor, path.join(outputDir, 'query-processor.js')),
            this.writeComponent(cacheManager, path.join(outputDir, 'cache-manager.js')),
            this.writeComponent(searchClient, path.join(outputDir, 'search-client.js')),
            this.writeComponent(shardManager, path.join(outputDir, 'shard-manager.js')),
            this.writeComponent(buildIntegration, path.join(__dirname, 'search-build-integration.js'))
        ]);
        
        // Generate biblical data dictionaries
        await this.generateBiblicalDictionaries(outputDir);
        
        console.log('✅ Distributed search index system generated');
        
        return {
            indexBuilder,
            queryProcessor,
            cacheManager,
            searchClient,
            shardManager,
            buildIntegration
        };
    }
    
    /**
     * Generate index builder component
     */
    generateIndexBuilder() {
        return `/**
 * Distributed Search Index Builder
 * Builds optimized search indexes with intelligent sharding
 */

class SearchIndexBuilder {
    constructor() {
        this.config = ${JSON.stringify(this.config, null, 2)};
        this.textProcessor = new TextProcessor();
        this.shardManager = new ShardManager();
        this.statistics = {
            documentsProcessed: 0,
            termsIndexed: 0,
            shardsCreated: 0,
            buildTime: 0
        };
    }
    
    /**
     * Build complete search index from content
     */
    async buildIndex(contentSources) {
        const startTime = Date.now();
        console.log('🔨 Building distributed search index...');
        
        try {
            // Step 1: Analyze content for optimal sharding
            const shardingPlan = await this.analyzeContentForSharding(contentSources);
            
            // Step 2: Process content into documents
            const documents = await this.processContentSources(contentSources);
            
            // Step 3: Build inverted indexes for each shard
            const shardedIndexes = await this.buildShardedIndexes(documents, shardingPlan);
            
            // Step 4: Generate metadata and statistics
            const metadata = this.generateIndexMetadata(shardedIndexes);
            
            // Step 5: Optimize indexes for query performance
            const optimizedIndexes = await this.optimizeIndexes(shardedIndexes);
            
            // Step 6: Generate auxiliary data structures
            const auxiliaryData = await this.generateAuxiliaryData(documents);
            
            this.statistics.buildTime = Date.now() - startTime;
            
            console.log(\`✅ Search index built in \${this.statistics.buildTime}ms\`);
            console.log(\`   📊 Documents: \${this.statistics.documentsProcessed}\`);
            console.log(\`   🔤 Terms: \${this.statistics.termsIndexed}\`);
            console.log(\`   📦 Shards: \${this.statistics.shardsCreated}\`);
            
            return {
                indexes: optimizedIndexes,
                metadata: metadata,
                auxiliary: auxiliaryData,
                statistics: this.statistics
            };
            
        } catch (error) {
            console.error('❌ Index building failed:', error);
            throw error;
        }
    }
    
    /**
     * Analyze content to determine optimal sharding strategy
     */
    async analyzeContentForSharding(contentSources) {
        const analysis = {
            totalSize: 0,
            contentTypes: new Map(),
            sizeDistribution: [],
            recommendedStrategy: 'hybrid'
        };
        
        // Analyze each content source
        for (const [sourceName, sourceData] of Object.entries(contentSources)) {
            const sourceSize = this.estimateContentSize(sourceData);
            const contentType = this.classifyContentType(sourceName, sourceData);
            
            analysis.totalSize += sourceSize;
            analysis.contentTypes.set(sourceName, {
                type: contentType,
                size: sourceSize,
                itemCount: Array.isArray(sourceData) ? sourceData.length : Object.keys(sourceData).length
            });
            
            analysis.sizeDistribution.push({ source: sourceName, size: sourceSize });
        }
        
        // Determine optimal sharding strategy
        analysis.recommendedStrategy = this.selectShardingStrategy(analysis);
        
        // Calculate target shard configuration
        const targetShardSize = analysis.totalSize / this.config.sharding.targetShards;
        const shardPlan = this.generateShardPlan(analysis, targetShardSize);
        
        return {
            analysis: analysis,
            plan: shardPlan,
            strategy: analysis.recommendedStrategy
        };
    }
    
    /**
     * Process content sources into searchable documents
     */
    async processContentSources(contentSources) {
        const documents = [];
        let documentId = 0;
        
        // Process Bible books
        if (contentSources.books) {
            for (const book of contentSources.books) {
                // Index book metadata
                documents.push({
                    id: \`book-\${documentId++}\`,
                    type: 'book',
                    title: book.name,
                    content: book.description || '',
                    metadata: {
                        testament: book.testament,
                        category: book.category,
                        chapters: book.chapterCount,
                        author: book.author
                    },
                    boost: 1.2 // Books get slight relevance boost
                });
                
                // Index chapter summaries
                if (book.chapterSummaries) {
                    for (const [chapterNum, summary] of Object.entries(book.chapterSummaries)) {
                        documents.push({
                            id: \`chapter-\${book.slug}-\${chapterNum}\`,
                            type: 'chapter',
                            title: \`\${book.name} \${chapterNum}\`,
                            content: summary,
                            metadata: {
                                book: book.slug,
                                chapter: parseInt(chapterNum),
                                testament: book.testament,
                                category: book.category
                            },
                            boost: 1.0
                        });
                    }
                }
            }
        }
        
        // Process entities
        if (contentSources.entities) {
            for (const entity of contentSources.entities) {
                documents.push({
                    id: \`entity-\${entity.id}\`,
                    type: 'entity',
                    title: entity.name,
                    content: (entity.description || '') + ' ' + (entity.tags || []).join(' '),
                    metadata: {
                        type: entity.type,
                        references: entity.references || [],
                        aliases: entity.aliases || []
                    },
                    boost: entity.isPopular ? 1.3 : 1.0
                });
            }
        }
        
        // Process categories
        if (contentSources.categories) {
            for (const category of contentSources.categories) {
                documents.push({
                    id: \`category-\${category.slug}\`,
                    type: 'category',
                    title: category.name,
                    content: category.description || '',
                    metadata: {
                        testament: category.testament,
                        bookCount: category.books ? category.books.length : 0
                    },
                    boost: 0.8 // Categories get lower relevance
                });
            }
        }
        
        this.statistics.documentsProcessed = documents.length;
        return documents;
    }
    
    /**
     * Build sharded inverted indexes
     */
    async buildShardedIndexes(documents, shardingPlan) {
        const indexes = new Map();
        
        // Group documents by shard
        const documentGroups = this.groupDocumentsByShards(documents, shardingPlan);
        
        // Build index for each shard
        for (const [shardId, shardDocuments] of documentGroups.entries()) {
            console.log(\`📦 Building shard \${shardId} with \${shardDocuments.length} documents\`);
            
            const shardIndex = await this.buildSingleShardIndex(shardDocuments, shardId);
            indexes.set(shardId, shardIndex);
            this.statistics.shardsCreated++;
        }
        
        return indexes;
    }
    
    /**
     * Build index for a single shard
     */
    async buildSingleShardIndex(documents, shardId) {
        const index = {
            id: shardId,
            documents: new Map(),
            terms: new Map(),
            metadata: {
                documentCount: documents.length,
                termCount: 0,
                averageDocumentLength: 0,
                createdAt: Date.now()
            }
        };
        
        let totalLength = 0;
        
        // Process each document
        for (const doc of documents) {
            // Store document
            index.documents.set(doc.id, {
                title: doc.title,
                type: doc.type,
                metadata: doc.metadata,
                boost: doc.boost || 1.0,
                length: 0
            });
            
            // Extract and process terms
            const terms = await this.textProcessor.extractTerms(doc.title + ' ' + doc.content);
            const termFreqs = new Map();
            
            // Count term frequencies
            for (const term of terms) {
                termFreqs.set(term, (termFreqs.get(term) || 0) + 1);
            }
            
            totalLength += terms.length;
            index.documents.get(doc.id).length = terms.length;
            
            // Add terms to inverted index
            for (const [term, freq] of termFreqs.entries()) {
                if (!index.terms.has(term)) {
                    index.terms.set(term, {
                        documentFrequency: 0,
                        postings: []
                    });
                }
                
                const termData = index.terms.get(term);
                termData.documentFrequency++;
                termData.postings.push({
                    documentId: doc.id,
                    termFrequency: freq,
                    positions: await this.textProcessor.findTermPositions(terms, term)
                });
            }
        }
        
        index.metadata.termCount = index.terms.size;
        index.metadata.averageDocumentLength = totalLength / documents.length;
        
        this.statistics.termsIndexed += index.terms.size;
        
        return index;
    }
    
    /**
     * Optimize indexes for query performance
     */
    async optimizeIndexes(indexes) {
        const optimized = new Map();
        
        for (const [shardId, index] of indexes.entries()) {
            console.log(\`⚡ Optimizing shard \${shardId}\`);
            
            const optimizedIndex = {
                ...index,
                terms: this.optimizeTermsIndex(index.terms),
                bloomFilter: this.createBloomFilter(index.terms.keys()),
                termPrefixTree: this.buildPrefixTree(index.terms.keys()),
                documentVectors: this.buildDocumentVectors(index)
            };
            
            optimized.set(shardId, optimizedIndex);
        }
        
        return optimized;
    }
    
    /**
     * Generate auxiliary data structures
     */
    async generateAuxiliaryData(documents) {
        return {
            synonyms: await this.buildSynonymMap(),
            abbreviations: await this.buildAbbreviationMap(),
            popularQueries: await this.buildPopularQueriesIndex(),
            autoComplete: await this.buildAutoCompleteIndex(documents),
            contextualRules: await this.buildContextualRules()
        };
    }
    
    // Utility methods for index building
    
    estimateContentSize(content) {
        return JSON.stringify(content).length * 2; // Rough estimate
    }
    
    classifyContentType(name, data) {
        if (name.includes('book')) return 'books';
        if (name.includes('entity')) return 'entities';
        if (name.includes('category')) return 'categories';
        return 'mixed';
    }
    
    selectShardingStrategy(analysis) {
        const { totalSize, contentTypes } = analysis;
        const typeCount = contentTypes.size;
        
        // If content is homogeneous, use size-based sharding
        if (typeCount <= 2) return 'size-based';
        
        // If we have distinct content types, use hybrid approach
        if (typeCount >= 3) return 'hybrid';
        
        // Default to alphabetical for medium complexity
        return 'alphabetical';
    }
    
    generateShardPlan(analysis, targetShardSize) {
        const plan = {
            shards: [],
            strategy: analysis.recommendedStrategy,
            targetSize: targetShardSize
        };
        
        switch (analysis.recommendedStrategy) {
            case 'content-type':
                plan.shards = this.planContentTypeShards(analysis);
                break;
            case 'size-based':
                plan.shards = this.planSizeBasedShards(analysis, targetShardSize);
                break;
            case 'alphabetical':
                plan.shards = this.planAlphabeticalShards(analysis);
                break;
            case 'hybrid':
                plan.shards = this.planHybridShards(analysis, targetShardSize);
                break;
        }
        
        return plan;
    }
    
    planHybridShards(analysis, targetSize) {
        const shards = [];
        
        // Create type-specific shards for large content types
        for (const [source, info] of analysis.contentTypes.entries()) {
            if (info.size > targetSize) {
                // Large content type gets its own shards
                const subShards = Math.ceil(info.size / targetSize);
                for (let i = 0; i < subShards; i++) {
                    shards.push({
                        id: \`\${info.type}-\${i}\`,
                        strategy: 'size-based',
                        contentTypes: [info.type],
                        estimatedSize: targetSize
                    });
                }
            }
        }
        
        // Group smaller content types together
        const remainingTypes = Array.from(analysis.contentTypes.entries())
            .filter(([source, info]) => info.size <= targetSize);
        
        let currentShard = null;
        let currentSize = 0;
        
        for (const [source, info] of remainingTypes) {
            if (!currentShard || currentSize + info.size > targetSize) {
                currentShard = {
                    id: \`mixed-\${shards.length}\`,
                    strategy: 'mixed',
                    contentTypes: [],
                    estimatedSize: 0
                };
                shards.push(currentShard);
                currentSize = 0;
            }
            
            currentShard.contentTypes.push(info.type);
            currentShard.estimatedSize += info.size;
            currentSize += info.size;
        }
        
        return shards;
    }
    
    groupDocumentsByShards(documents, shardingPlan) {
        const groups = new Map();
        
        for (const shard of shardingPlan.plan.shards) {
            groups.set(shard.id, []);
        }
        
        // Assign documents to shards based on plan
        for (const doc of documents) {
            const assignedShard = this.assignDocumentToShard(doc, shardingPlan);
            if (groups.has(assignedShard)) {
                groups.get(assignedShard).push(doc);
            }
        }
        
        return groups;
    }
    
    assignDocumentToShard(document, shardingPlan) {
        const shards = shardingPlan.plan.shards;
        
        // Find shard that accepts this document type
        for (const shard of shards) {
            if (shard.contentTypes.includes(document.type) || shard.contentTypes.includes('mixed')) {
                return shard.id;
            }
        }
        
        // Fallback to first shard
        return shards[0]?.id || 'default';
    }
    
    optimizeTermsIndex(termsMap) {
        const optimized = new Map();
        
        for (const [term, data] of termsMap.entries()) {
            // Sort postings by relevance score for faster retrieval
            const sortedPostings = data.postings.sort((a, b) => b.termFrequency - a.termFrequency);
            
            optimized.set(term, {
                ...data,
                postings: sortedPostings,
                // Pre-calculate some metrics for faster querying
                maxTermFreq: Math.max(...sortedPostings.map(p => p.termFrequency)),
                avgTermFreq: sortedPostings.reduce((sum, p) => sum + p.termFrequency, 0) / sortedPostings.length
            });
        }
        
        return optimized;
    }
    
    createBloomFilter(terms) {
        // Simplified bloom filter implementation
        const size = Math.max(1000, terms.size * 10);
        const filter = new Array(size).fill(false);
        
        for (const term of terms) {
            const hash1 = this.simpleHash(term) % size;
            const hash2 = this.simpleHash(term, 31) % size;
            filter[hash1] = true;
            filter[hash2] = true;
        }
        
        return {
            filter: filter,
            size: size,
            contains: (term) => {
                const hash1 = this.simpleHash(term) % size;
                const hash2 = this.simpleHash(term, 31) % size;
                return filter[hash1] && filter[hash2];
            }
        };
    }
    
    simpleHash(str, seed = 0) {
        let hash = seed;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash + str.charCodeAt(i)) & 0xffffffff;
        }
        return Math.abs(hash);
    }
    
    buildPrefixTree(terms) {
        const tree = {};
        
        for (const term of terms) {
            let node = tree;
            for (const char of term) {
                if (!node[char]) {
                    node[char] = {};
                }
                node = node[char];
            }
            node._terminal = true;
            node._term = term;
        }
        
        return tree;
    }
    
    buildDocumentVectors(index) {
        const vectors = new Map();
        
        for (const [docId, docData] of index.documents.entries()) {
            const vector = {};
            
            // Build TF-IDF vector for document
            for (const [term, termData] of index.terms.entries()) {
                const posting = termData.postings.find(p => p.documentId === docId);
                if (posting) {
                    const tf = posting.termFrequency / docData.length;
                    const idf = Math.log(index.documents.size / termData.documentFrequency);
                    vector[term] = tf * idf;
                }
            }
            
            vectors.set(docId, vector);
        }
        
        return vectors;
    }
    
    async buildSynonymMap() {
        // Biblical synonyms and related terms
        return {
            'god': ['lord', 'yahweh', 'jehovah', 'almighty', 'father'],
            'jesus': ['christ', 'messiah', 'savior', 'lord', 'son'],
            'holy spirit': ['spirit', 'comforter', 'advocate', 'paraclete'],
            'salvation': ['redemption', 'deliverance', 'rescue'],
            'sin': ['transgression', 'iniquity', 'wickedness'],
            'love': ['charity', 'agape', 'compassion'],
            'faith': ['belief', 'trust', 'confidence'],
            'prayer': ['supplication', 'intercession', 'petition'],
            'worship': ['praise', 'adoration', 'reverence']
        };
    }
    
    async buildAbbreviationMap() {
        // Common biblical abbreviations
        return {
            'gen': 'genesis',
            'ex': 'exodus',
            'lev': 'leviticus',
            'num': 'numbers',
            'deut': 'deuteronomy',
            'josh': 'joshua',
            'judg': 'judges',
            'sam': 'samuel',
            'kg': 'kings',
            'chron': 'chronicles',
            'neh': 'nehemiah',
            'ps': 'psalms',
            'prov': 'proverbs',
            'eccl': 'ecclesiastes',
            'isa': 'isaiah',
            'jer': 'jeremiah',
            'lam': 'lamentations',
            'ezek': 'ezekiel',
            'dan': 'daniel',
            'hos': 'hosea',
            'joel': 'joel',
            'amos': 'amos',
            'obad': 'obadiah',
            'jonah': 'jonah',
            'mic': 'micah',
            'nah': 'nahum',
            'hab': 'habakkuk',
            'zeph': 'zephaniah',
            'hag': 'haggai',
            'zech': 'zechariah',
            'mal': 'malachi',
            'matt': 'matthew',
            'mk': 'mark',
            'lk': 'luke',
            'jn': 'john',
            'rom': 'romans',
            'cor': 'corinthians',
            'gal': 'galatians',
            'eph': 'ephesians',
            'phil': 'philippians',
            'col': 'colossians',
            'thess': 'thessalonians',
            'tim': 'timothy',
            'tit': 'titus',
            'philem': 'philemon',
            'heb': 'hebrews',
            'jas': 'james',
            'pet': 'peter',
            'jude': 'jude',
            'rev': 'revelation'
        };
    }
    
    async buildPopularQueriesIndex() {
        // Index of popular biblical queries for boosting
        return new Set([
            'john 3:16',
            'psalm 23',
            'romans 8:28',
            'jeremiah 29:11',
            'philippians 4:13',
            'isaiah 40:31',
            'matthew 6:33',
            'proverbs 3:5-6',
            '1 corinthians 13',
            'ephesians 2:8-9'
        ]);
    }
    
    async buildAutoCompleteIndex(documents) {
        const suggestions = new Map();
        
        // Build suggestions from document titles
        for (const doc of documents) {
            const words = doc.title.toLowerCase().split(/\\s+/);
            
            for (let i = 0; i < words.length; i++) {
                for (let j = 1; j <= 3 && i + j <= words.length; j++) {
                    const phrase = words.slice(i, i + j).join(' ');
                    if (phrase.length >= 2) {
                        if (!suggestions.has(phrase)) {
                            suggestions.set(phrase, { count: 0, examples: [] });
                        }
                        const data = suggestions.get(phrase);
                        data.count++;
                        if (data.examples.length < 3) {
                            data.examples.push(doc.title);
                        }
                    }
                }
            }
        }
        
        // Sort by popularity
        return new Map([...suggestions.entries()].sort((a, b) => b[1].count - a[1].count));
    }
    
    async buildContextualRules() {
        return {
            // Boost rules based on context
            bookContext: {
                'law': ['moses', 'commandments', 'covenant'],
                'history': ['israel', 'kingdom', 'battle'],
                'wisdom': ['wisdom', 'understanding', 'knowledge'],
                'prophecy': ['vision', 'prophecy', 'future'],
                'gospel': ['jesus', 'disciples', 'miracles'],
                'epistles': ['church', 'believers', 'faith']
            },
            
            // Seasonal boost rules
            seasonal: {
                christmas: ['birth', 'bethlehem', 'mary', 'joseph', 'shepherds'],
                easter: ['resurrection', 'cross', 'tomb', 'disciples'],
                pentecost: ['holy spirit', 'tongues', 'jerusalem']
            }
        };
    }
}

/**
 * Text Processing Pipeline
 */
class TextProcessor {
    constructor() {
        this.stopWords = new Set([
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
            'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have',
            'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
            'may', 'might', 'must', 'shall', 'can', 'this', 'that', 'these', 'those'
        ]);
    }
    
    async extractTerms(text) {
        // Convert to lowercase
        let processed = text.toLowerCase();
        
        // Remove punctuation except hyphens and colons (for references)
        processed = processed.replace(/[^\\w\\s:-]/g, ' ');
        
        // Split into words
        let terms = processed.split(/\\s+/).filter(term => term.length > 1);
        
        // Remove stop words
        terms = terms.filter(term => !this.stopWords.has(term));
        
        // Basic stemming (simplified)
        terms = terms.map(term => this.simpleStem(term));
        
        return terms;
    }
    
    async findTermPositions(terms, searchTerm) {
        const positions = [];
        for (let i = 0; i < terms.length; i++) {
            if (terms[i] === searchTerm) {
                positions.push(i);
            }
        }
        return positions;
    }
    
    simpleStem(word) {
        // Very basic English stemming
        if (word.endsWith('ing')) return word.slice(0, -3);
        if (word.endsWith('ed')) return word.slice(0, -2);
        if (word.endsWith('s') && word.length > 3) return word.slice(0, -1);
        return word;
    }
}

/**
 * Shard Manager for distributed operations
 */
class ShardManager {
    constructor() {
        this.shards = new Map();
        this.metadata = new Map();
    }
    
    registerShard(shardId, shardData) {
        this.shards.set(shardId, shardData);
        this.metadata.set(shardId, {
            size: this.estimateShardSize(shardData),
            documentCount: shardData.documents?.size || 0,
            termCount: shardData.terms?.size || 0,
            lastUpdated: Date.now()
        });
    }
    
    getShard(shardId) {
        return this.shards.get(shardId);
    }
    
    getAllShards() {
        return Array.from(this.shards.keys());
    }
    
    estimateShardSize(shardData) {
        return JSON.stringify(shardData).length;
    }
    
    getShardMetadata(shardId) {
        return this.metadata.get(shardId);
    }
    
    balanceShards() {
        // Implement shard rebalancing logic
        console.log('⚖️  Checking shard balance...');
        
        const shardSizes = Array.from(this.metadata.values()).map(m => m.size);
        const avgSize = shardSizes.reduce((a, b) => a + b, 0) / shardSizes.length;
        const maxDeviation = Math.max(...shardSizes.map(size => Math.abs(size - avgSize)));
        
        if (maxDeviation > avgSize * 0.3) {
            console.log('🔄 Shards need rebalancing');
            return true;
        }
        
        return false;
    }
}

export { SearchIndexBuilder, TextProcessor, ShardManager };
`;
    }
    
    /**
     * Generate query processor component
     */
    generateQueryProcessor() {
        return `/**
 * Query Processor - Handles search query analysis and optimization
 */

class QueryProcessor {
    constructor(config, auxiliaryData) {
        this.config = config;
        this.synonyms = auxiliaryData.synonyms;
        this.abbreviations = auxiliaryData.abbreviations;
        this.popularQueries = auxiliaryData.popularQueries;
        this.contextualRules = auxiliaryData.contextualRules;
        this.queryCache = new Map();
    }
    
    /**
     * Process and optimize search query
     */
    async processQuery(rawQuery, options = {}) {
        // Check cache first
        const cacheKey = this.createQueryCacheKey(rawQuery, options);
        if (this.queryCache.has(cacheKey)) {
            return this.queryCache.get(cacheKey);
        }
        
        const processedQuery = {
            original: rawQuery,
            normalized: '',
            terms: [],
            phrases: [],
            filters: {},
            boosts: {},
            intent: 'general',
            complexity: 'simple'
        };
        
        try {
            // Step 1: Normalize query
            processedQuery.normalized = await this.normalizeQuery(rawQuery);
            
            // Step 2: Detect query intent
            processedQuery.intent = await this.detectQueryIntent(processedQuery.normalized);
            
            // Step 3: Extract terms and phrases
            const extraction = await this.extractTermsAndPhrases(processedQuery.normalized);
            processedQuery.terms = extraction.terms;
            processedQuery.phrases = extraction.phrases;
            
            // Step 4: Apply query expansion
            const expanded = await this.expandQuery(processedQuery);
            processedQuery.expandedTerms = expanded.terms;
            processedQuery.synonyms = expanded.synonyms;
            
            // Step 5: Detect filters and sorting preferences
            processedQuery.filters = await this.detectFilters(rawQuery, options);
            
            // Step 6: Calculate boost factors
            processedQuery.boosts = await this.calculateBoosts(processedQuery);
            
            // Step 7: Determine query complexity
            processedQuery.complexity = this.assessQueryComplexity(processedQuery);
            
            // Cache the result
            this.queryCache.set(cacheKey, processedQuery);
            
            return processedQuery;
            
        } catch (error) {
            console.error('Query processing error:', error);
            return this.createFallbackQuery(rawQuery);
        }
    }
    
    /**
     * Normalize query string
     */
    async normalizeQuery(query) {
        let normalized = query.toLowerCase().trim();
        
        // Expand common abbreviations
        for (const [abbrev, full] of Object.entries(this.abbreviations)) {
            const regex = new RegExp(\`\\\\b\${abbrev}\\\\b\`, 'gi');
            normalized = normalized.replace(regex, full);
        }
        
        // Handle biblical references (e.g., "john 3:16")
        normalized = normalized.replace(/(\\d+):(\\d+)(-\\d+)?/g, (match, chapter, verse, range) => {
            return \`chapter \${chapter} verse \${verse}\${range || ''}\`;
        });
        
        // Clean up extra whitespace
        normalized = normalized.replace(/\\s+/g, ' ').trim();
        
        return normalized;
    }
    
    /**
     * Detect query intent
     */
    async detectQueryIntent(query) {
        // Reference lookup (e.g., "john 3:16", "psalm 23")
        if (/\\b\\w+\\s+\\d+/.test(query) || /chapter|verse/i.test(query)) {
            return 'reference';
        }
        
        // Entity lookup (names, places)
        if (/\\b(who is|what is|where is)\\b/i.test(query)) {
            return 'entity';
        }
        
        // Topical search
        if (/\\b(about|topic|theme)\\b/i.test(query)) {
            return 'topical';
        }
        
        // Popular queries
        if (this.popularQueries.has(query.toLowerCase())) {
            return 'popular';
        }
        
        return 'general';
    }
    
    /**
     * Extract terms and phrases from query
     */
    async extractTermsAndPhrases(query) {
        const terms = [];
        const phrases = [];
        
        // Extract quoted phrases first
        const quotedPhrases = query.match(/"([^"]*)"/g) || [];
        for (const quoted of quotedPhrases) {
            const phrase = quoted.slice(1, -1); // Remove quotes
            if (phrase.trim()) {
                phrases.push(phrase.trim());
            }
            query = query.replace(quoted, ''); // Remove from query
        }
        
        // Extract remaining terms
        const words = query.split(/\\s+/).filter(word => word.length > 0);
        
        // Build n-grams for phrase detection
        for (let n = 2; n <= Math.min(4, words.length); n++) {
            for (let i = 0; i <= words.length - n; i++) {
                const phrase = words.slice(i, i + n).join(' ');
                if (this.isLikelyPhrase(phrase)) {
                    phrases.push(phrase);
                }
            }
        }
        
        // Add individual terms
        for (const word of words) {
            if (word.length > 1) {
                terms.push(word);
            }
        }
        
        return { terms, phrases };
    }
    
    /**
     * Expand query with synonyms and related terms
     */
    async expandQuery(processedQuery) {
        const expandedTerms = [...processedQuery.terms];
        const synonymMap = new Map();
        
        // Add synonyms for each term
        for (const term of processedQuery.terms) {
            const termSynonyms = this.synonyms[term] || [];
            if (termSynonyms.length > 0) {
                synonymMap.set(term, termSynonyms);
                expandedTerms.push(...termSynonyms);
            }
        }
        
        // Add contextual expansions
        const context = this.detectContext(processedQuery);
        if (context && this.contextualRules.bookContext[context]) {
            const contextTerms = this.contextualRules.bookContext[context];
            expandedTerms.push(...contextTerms);
        }
        
        return {
            terms: [...new Set(expandedTerms)], // Remove duplicates
            synonyms: Object.fromEntries(synonymMap)
        };
    }
    
    /**
     * Detect context from query
     */
    detectContext(processedQuery) {
        const query = processedQuery.normalized;
        
        // Check for book categories
        if (/\\b(genesis|exodus|leviticus|numbers|deuteronomy)\\b/i.test(query)) {
            return 'law';
        }
        if (/\\b(joshua|judges|ruth|samuel|kings|chronicles)\\b/i.test(query)) {
            return 'history';
        }
        if (/\\b(job|psalms|proverbs|ecclesiastes|song)\\b/i.test(query)) {
            return 'wisdom';
        }
        if (/\\b(isaiah|jeremiah|ezekiel|daniel|hosea|joel|amos)\\b/i.test(query)) {
            return 'prophecy';
        }
        if (/\\b(matthew|mark|luke|john)\\b/i.test(query)) {
            return 'gospel';
        }
        if (/\\b(romans|corinthians|galatians|ephesians|philippians|colossians|thessalonians)\\b/i.test(query)) {
            return 'epistles';
        }
        
        return null;
    }
    
    /**
     * Detect filters from query and options
     */
    async detectFilters(query, options) {
        const filters = {};
        
        // Testament filters
        if (/\\b(old testament|ot)\\b/i.test(query)) {
            filters.testament = 'old';
        } else if (/\\b(new testament|nt)\\b/i.test(query)) {
            filters.testament = 'new';
        }
        
        // Content type filters
        if (/\\b(book|books)\\b/i.test(query)) {
            filters.type = 'book';
        } else if (/\\b(person|people|character)\\b/i.test(query)) {
            filters.type = 'entity';
        } else if (/\\b(chapter|verse)\\b/i.test(query)) {
            filters.type = 'chapter';
        }
        
        // Apply explicit filters from options
        Object.assign(filters, options.filters || {});
        
        return filters;
    }
    
    /**
     * Calculate boost factors for relevance
     */
    async calculateBoosts(processedQuery) {
        const boosts = {
            popularQuery: 1.0,
            exactMatch: 1.0,
            phraseMatch: 1.0,
            contextualMatch: 1.0,
            recencyBoost: 1.0
        };
        
        // Popular query boost
        if (processedQuery.intent === 'popular') {
            boosts.popularQuery = 1.3;
        }
        
        // Exact match boost
        if (processedQuery.terms.length === 1) {
            boosts.exactMatch = 1.2;
        }
        
        // Phrase match boost
        if (processedQuery.phrases.length > 0) {
            boosts.phraseMatch = 1.4;
        }
        
        // Contextual match boost
        const context = this.detectContext(processedQuery);
        if (context) {
            boosts.contextualMatch = 1.2;
        }
        
        // Reference query boost
        if (processedQuery.intent === 'reference') {
            boosts.referenceMatch = 1.5;
        }
        
        return boosts;
    }
    
    /**
     * Assess query complexity
     */
    assessQueryComplexity(processedQuery) {
        let complexity = 0;
        
        // Term count factor
        complexity += processedQuery.terms.length * 0.5;
        
        // Phrase factor
        complexity += processedQuery.phrases.length * 1.0;
        
        // Filter factor
        complexity += Object.keys(processedQuery.filters).length * 0.3;
        
        // Intent factor
        const intentComplexity = {
            'reference': 1,
            'entity': 2,
            'topical': 3,
            'general': 2,
            'popular': 1
        };
        complexity += intentComplexity[processedQuery.intent] || 2;
        
        if (complexity <= 2) return 'simple';
        if (complexity <= 5) return 'medium';
        return 'complex';
    }
    
    /**
     * Create fallback query for error cases
     */
    createFallbackQuery(rawQuery) {
        return {
            original: rawQuery,
            normalized: rawQuery.toLowerCase().trim(),
            terms: rawQuery.toLowerCase().split(/\\s+/).filter(term => term.length > 1),
            phrases: [],
            filters: {},
            boosts: { fallback: 0.8 },
            intent: 'general',
            complexity: 'simple',
            isFallback: true
        };
    }
    
    /**
     * Utility methods
     */
    
    createQueryCacheKey(query, options) {
        return \`\${query}:\${JSON.stringify(options)}\`;
    }
    
    isLikelyPhrase(phrase) {
        // Simple heuristics to determine if a sequence of words is a meaningful phrase
        if (phrase.length < 6) return false; // Too short
        
        // Common biblical phrases
        const biblicalPhrases = [
            'holy spirit', 'son of god', 'kingdom of heaven', 'lord jesus christ',
            'old testament', 'new testament', 'ten commandments', 'golden rule'
        ];
        
        return biblicalPhrases.some(bp => phrase.includes(bp));
    }
}

export default QueryProcessor;
`;
    }
    
    /**
     * Generate cache manager component
     */
    generateCacheManager() {
        return `/**
 * Multi-Level Cache Manager for Search System
 */

class SearchCacheManager {
    constructor(config) {
        this.config = config;
        this.caches = {
            l1: new MemoryCache(config.caching.levels.l1),
            l2: new IndexedDBCache(config.caching.levels.l2),
            l3: new ServiceWorkerCache(config.caching.levels.l3)
        };
        this.stats = {
            hits: { l1: 0, l2: 0, l3: 0 },
            misses: 0,
            evictions: 0,
            totalRequests: 0
        };
    }
    
    /**
     * Get item from cache (tries L1 -> L2 -> L3)
     */
    async get(key) {
        this.stats.totalRequests++;
        
        try {
            // Try L1 cache first (memory)
            const l1Result = await this.caches.l1.get(key);
            if (l1Result !== null) {
                this.stats.hits.l1++;
                return l1Result;
            }
            
            // Try L2 cache (IndexedDB)
            const l2Result = await this.caches.l2.get(key);
            if (l2Result !== null) {
                this.stats.hits.l2++;
                // Promote to L1
                await this.caches.l1.set(key, l2Result);
                return l2Result;
            }
            
            // Try L3 cache (Service Worker)
            const l3Result = await this.caches.l3.get(key);
            if (l3Result !== null) {
                this.stats.hits.l3++;
                // Promote to L1 and L2
                await this.caches.l1.set(key, l3Result);
                await this.caches.l2.set(key, l3Result);
                return l3Result;
            }
            
            this.stats.misses++;
            return null;
            
        } catch (error) {
            console.error('Cache get error:', error);
            this.stats.misses++;
            return null;
        }
    }
    
    /**
     * Set item in all cache levels
     */
    async set(key, value, options = {}) {
        const promises = [];
        
        try {
            // Set in all levels
            promises.push(this.caches.l1.set(key, value, options));
            promises.push(this.caches.l2.set(key, value, options));
            promises.push(this.caches.l3.set(key, value, options));
            
            await Promise.allSettled(promises);
            
        } catch (error) {
            console.error('Cache set error:', error);
        }
    }
    
    /**
     * Remove item from all cache levels
     */
    async remove(key) {
        const promises = [
            this.caches.l1.remove(key),
            this.caches.l2.remove(key),
            this.caches.l3.remove(key)
        ];
        
        await Promise.allSettled(promises);
    }
    
    /**
     * Clear all caches
     */
    async clear() {
        const promises = [
            this.caches.l1.clear(),
            this.caches.l2.clear(),
            this.caches.l3.clear()
        ];
        
        await Promise.allSettled(promises);
        
        // Reset stats
        this.stats = {
            hits: { l1: 0, l2: 0, l3: 0 },
            misses: 0,
            evictions: 0,
            totalRequests: 0
        };
    }
    
    /**
     * Get cache statistics
     */
    getStats() {
        const totalHits = this.stats.hits.l1 + this.stats.hits.l2 + this.stats.hits.l3;
        const hitRate = this.stats.totalRequests > 0 ? 
            (totalHits / this.stats.totalRequests) * 100 : 0;
        
        return {
            ...this.stats,
            totalHits,
            hitRate: hitRate.toFixed(2) + '%',
            l1HitRate: this.stats.totalRequests > 0 ? 
                (this.stats.hits.l1 / this.stats.totalRequests * 100).toFixed(2) + '%' : '0%'
        };
    }
    
    /**
     * Invalidate cache entries based on rules
     */
    async invalidate(rules) {
        if (rules.contentUpdate) {
            await this.clear();
        }
        
        if (rules.memoryPressure) {
            await this.caches.l1.evictLRU(0.5); // Evict 50% of L1 cache
        }
        
        if (rules.userPreferences) {
            // Invalidate personalized results
            await this.invalidateByPrefix('user:');
        }
    }
    
    async invalidateByPrefix(prefix) {
        // This is a simplified implementation
        // In practice, you'd need more sophisticated prefix matching
        await this.caches.l1.invalidateByPrefix(prefix);
        await this.caches.l2.invalidateByPrefix(prefix);
        await this.caches.l3.invalidateByPrefix(prefix);
    }
}

/**
 * L1 Memory Cache
 */
class MemoryCache {
    constructor(config) {
        this.config = config;
        this.cache = new Map();
        this.usage = new Map(); // For LRU tracking
        this.currentSize = 0;
        this.accessCounter = 0;
    }
    
    async get(key) {
        if (this.cache.has(key)) {
            const entry = this.cache.get(key);
            
            // Check TTL
            if (Date.now() - entry.timestamp > this.config.ttl) {
                this.cache.delete(key);
                this.usage.delete(key);
                this.currentSize -= entry.size;
                return null;
            }
            
            // Update access time for LRU
            this.usage.set(key, ++this.accessCounter);
            return entry.data;
        }
        
        return null;
    }
    
    async set(key, value, options = {}) {
        const entry = {
            data: value,
            timestamp: Date.now(),
            size: this.estimateSize(value),
            ttl: options.ttl || this.config.ttl
        };
        
        // Check if we need to evict
        while (this.currentSize + entry.size > this.config.maxSize && this.cache.size > 0) {
            this.evictLRU();
        }
        
        // Don't cache if too large
        if (entry.size > this.config.maxSize) {
            return;
        }
        
        // Update existing or add new
        if (this.cache.has(key)) {
            const oldEntry = this.cache.get(key);
            this.currentSize -= oldEntry.size;
        }
        
        this.cache.set(key, entry);
        this.usage.set(key, ++this.accessCounter);
        this.currentSize += entry.size;
    }
    
    async remove(key) {
        if (this.cache.has(key)) {
            const entry = this.cache.get(key);
            this.currentSize -= entry.size;
            this.cache.delete(key);
            this.usage.delete(key);
        }
    }
    
    async clear() {
        this.cache.clear();
        this.usage.clear();
        this.currentSize = 0;
        this.accessCounter = 0;
    }
    
    evictLRU(factor = 1) {
        // Find least recently used item
        let lruKey = null;
        let lruAccess = Infinity;
        
        for (const [key, access] of this.usage.entries()) {
            if (access < lruAccess) {
                lruAccess = access;
                lruKey = key;
            }
        }
        
        if (lruKey) {
            this.remove(lruKey);
            
            // If factor < 1, continue evicting
            if (factor < 1 && Math.random() < factor) {
                this.evictLRU(factor);
            }
        }
    }
    
    async invalidateByPrefix(prefix) {
        const keysToDelete = [];
        for (const key of this.cache.keys()) {
            if (key.startsWith(prefix)) {
                keysToDelete.push(key);
            }
        }
        
        for (const key of keysToDelete) {
            await this.remove(key);
        }
    }
    
    estimateSize(value) {
        try {
            return JSON.stringify(value).length * 2; // Rough estimate
        } catch {
            return 1000; // Fallback
        }
    }
}

/**
 * L2 IndexedDB Cache
 */
class IndexedDBCache {
    constructor(config) {
        this.config = config;
        this.db = null;
        this.dbName = 'BibleExplorerSearchCache';
        this.version = 1;
        this.init();
    }
    
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('searchCache')) {
                    const store = db.createObjectStore('searchCache');
                    store.createIndex('timestamp', 'timestamp');
                }
            };
        });
    }
    
    async get(key) {
        if (!this.db) await this.init();
        
        return new Promise((resolve) => {
            const transaction = this.db.transaction(['searchCache'], 'readonly');
            const store = transaction.objectStore('searchCache');
            const request = store.get(key);
            
            request.onsuccess = () => {
                const result = request.result;
                
                if (result && Date.now() - result.timestamp <= this.config.ttl) {
                    resolve(result.data);
                } else {
                    resolve(null);
                }
            };
            
            request.onerror = () => resolve(null);
        });
    }
    
    async set(key, value, options = {}) {
        if (!this.db) await this.init();
        
        const entry = {
            data: value,
            timestamp: Date.now(),
            ttl: options.ttl || this.config.ttl
        };
        
        return new Promise((resolve) => {
            const transaction = this.db.transaction(['searchCache'], 'readwrite');
            const store = transaction.objectStore('searchCache');
            const request = store.put(entry, key);
            
            request.onsuccess = () => resolve();
            request.onerror = () => resolve();
        });
    }
    
    async remove(key) {
        if (!this.db) await this.init();
        
        return new Promise((resolve) => {
            const transaction = this.db.transaction(['searchCache'], 'readwrite');
            const store = transaction.objectStore('searchCache');
            const request = store.delete(key);
            
            request.onsuccess = () => resolve();
            request.onerror = () => resolve();
        });
    }
    
    async clear() {
        if (!this.db) await this.init();
        
        return new Promise((resolve) => {
            const transaction = this.db.transaction(['searchCache'], 'readwrite');
            const store = transaction.objectStore('searchCache');
            const request = store.clear();
            
            request.onsuccess = () => resolve();
            request.onerror = () => resolve();
        });
    }
    
    async invalidateByPrefix(prefix) {
        if (!this.db) await this.init();
        
        return new Promise((resolve) => {
            const transaction = this.db.transaction(['searchCache'], 'readwrite');
            const store = transaction.objectStore('searchCache');
            const request = store.openCursor();
            
            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    if (cursor.key.startsWith(prefix)) {
                        cursor.delete();
                    }
                    cursor.continue();
                } else {
                    resolve();
                }
            };
            
            request.onerror = () => resolve();
        });
    }
}

/**
 * L3 Service Worker Cache
 */
class ServiceWorkerCache {
    constructor(config) {
        this.config = config;
        this.cacheName = 'bible-explorer-search-v1';
    }
    
    async get(key) {
        if (!('caches' in window)) return null;
        
        try {
            const cache = await caches.open(this.cacheName);
            const request = new Request(this.keyToUrl(key));
            const response = await cache.match(request);
            
            if (response) {
                const data = await response.json();
                
                // Check TTL
                if (Date.now() - data.timestamp <= this.config.ttl) {
                    return data.value;
                } else {
                    await cache.delete(request);
                }
            }
            
            return null;
        } catch (error) {
            console.error('Service Worker cache get error:', error);
            return null;
        }
    }
    
    async set(key, value, options = {}) {
        if (!('caches' in window)) return;
        
        try {
            const cache = await caches.open(this.cacheName);
            const data = {
                value: value,
                timestamp: Date.now(),
                ttl: options.ttl || this.config.ttl
            };
            
            const response = new Response(JSON.stringify(data));
            const request = new Request(this.keyToUrl(key));
            
            await cache.put(request, response);
        } catch (error) {
            console.error('Service Worker cache set error:', error);
        }
    }
    
    async remove(key) {
        if (!('caches' in window)) return;
        
        try {
            const cache = await caches.open(this.cacheName);
            const request = new Request(this.keyToUrl(key));
            await cache.delete(request);
        } catch (error) {
            console.error('Service Worker cache remove error:', error);
        }
    }
    
    async clear() {
        if (!('caches' in window)) return;
        
        try {
            await caches.delete(this.cacheName);
        } catch (error) {
            console.error('Service Worker cache clear error:', error);
        }
    }
    
    async invalidateByPrefix(prefix) {
        if (!('caches' in window)) return;
        
        try {
            const cache = await caches.open(this.cacheName);
            const requests = await cache.keys();
            
            const toDelete = requests.filter(request => 
                this.urlToKey(request.url).startsWith(prefix)
            );
            
            await Promise.all(toDelete.map(request => cache.delete(request)));
        } catch (error) {
            console.error('Service Worker cache invalidate error:', error);
        }
    }
    
    keyToUrl(key) {
        return \`https://cache.local/search/\${encodeURIComponent(key)}\`;
    }
    
    urlToKey(url) {
        const match = url.match(/\\/search\\/(.+)$/);
        return match ? decodeURIComponent(match[1]) : '';
    }
}

export { SearchCacheManager, MemoryCache, IndexedDBCache, ServiceWorkerCache };
`;
    }
    
    /**
     * Generate search client component
     */
    generateSearchClient() {
        return `/**
 * Distributed Search Client - Main search interface
 */

class DistributedSearchClient {
    constructor() {
        this.config = null;
        this.queryProcessor = null;
        this.cacheManager = null;
        this.shardManager = null;
        this.indexes = new Map();
        this.isInitialized = false;
        this.searchStats = {
            totalQueries: 0,
            avgResponseTime: 0,
            cacheHitRate: 0
        };
    }
    
    /**
     * Initialize the search client
     */
    async init() {
        try {
            // Load configuration and indexes
            await this.loadConfiguration();
            await this.loadIndexes();
            
            // Initialize components
            this.queryProcessor = new QueryProcessor(this.config, this.auxiliaryData);
            this.cacheManager = new SearchCacheManager(this.config);
            this.shardManager = new ShardManager();
            
            this.isInitialized = true;
            console.log('🔍 Distributed Search Client initialized');
            console.log(\`📦 Loaded \${this.indexes.size} search index shards\`);
            
        } catch (error) {
            console.error('Failed to initialize search client:', error);
            throw error;
        }
    }
    
    /**
     * Perform distributed search
     */
    async search(query, options = {}) {
        if (!this.isInitialized) {
            throw new Error('Search client not initialized');
        }
        
        const startTime = Date.now();
        this.searchStats.totalQueries++;
        
        try {
            // Process query
            const processedQuery = await this.queryProcessor.processQuery(query, options);
            
            // Check cache first
            const cacheKey = this.createCacheKey(processedQuery, options);
            const cachedResult = await this.cacheManager.get(cacheKey);
            
            if (cachedResult) {
                this.updateSearchStats(startTime, true);
                return this.formatSearchResult(cachedResult, processedQuery, startTime);
            }
            
            // Execute distributed search
            const searchResult = await this.executeDistributedSearch(processedQuery, options);
            
            // Cache the result
            await this.cacheManager.set(cacheKey, searchResult, {
                ttl: this.calculateCacheTTL(processedQuery)
            });
            
            this.updateSearchStats(startTime, false);
            
            return this.formatSearchResult(searchResult, processedQuery, startTime);
            
        } catch (error) {
            console.error('Search failed:', error);
            return this.createErrorResult(query, error, startTime);
        }
    }
    
    /**
     * Execute search across all shards
     */
    async executeDistributedSearch(processedQuery, options) {
        const shardResults = [];
        const searchPromises = [];
        
        // Determine which shards to search
        const targetShards = this.selectTargetShards(processedQuery, options);
        
        // Search each shard in parallel
        for (const shardId of targetShards) {
            const promise = this.searchShard(shardId, processedQuery, options);
            searchPromises.push(promise);
        }
        
        // Wait for all shard searches to complete
        const results = await Promise.allSettled(searchPromises);
        
        // Collect successful results
        for (let i = 0; i < results.length; i++) {
            if (results[i].status === 'fulfilled') {
                shardResults.push({
                    shardId: targetShards[i],
                    results: results[i].value
                });
            } else {
                console.warn(\`Shard \${targetShards[i]} search failed:\`, results[i].reason);
            }
        }
        
        // Merge and rank results
        const mergedResults = this.mergeShardResults(shardResults, processedQuery);
        
        return mergedResults;
    }
    
    /**
     * Search a single shard
     */
    async searchShard(shardId, processedQuery, options) {
        const index = this.indexes.get(shardId);
        if (!index) {
            throw new Error(\`Shard \${shardId} not found\`);
        }
        
        const results = [];
        const maxResults = options.maxResults || 50;
        
        // Search for each term/phrase
        const termScores = new Map();
        
        // Search individual terms
        for (const term of processedQuery.expandedTerms || processedQuery.terms) {
            const termResults = this.searchTermInShard(term, index, processedQuery);
            
            for (const result of termResults) {
                const docId = result.documentId;
                if (!termScores.has(docId)) {
                    termScores.set(docId, {
                        document: index.documents.get(docId),
                        totalScore: 0,
                        termMatches: [],
                        phraseMatches: []
                    });
                }
                
                const docScore = termScores.get(docId);
                docScore.totalScore += result.score;
                docScore.termMatches.push({
                    term: term,
                    score: result.score,
                    positions: result.positions
                });
            }
        }
        
        // Search phrases with higher weight
        for (const phrase of processedQuery.phrases) {
            const phraseResults = this.searchPhraseInShard(phrase, index, processedQuery);
            
            for (const result of phraseResults) {
                const docId = result.documentId;
                if (!termScores.has(docId)) {
                    termScores.set(docId, {
                        document: index.documents.get(docId),
                        totalScore: 0,
                        termMatches: [],
                        phraseMatches: []
                    });
                }
                
                const docScore = termScores.get(docId);
                docScore.totalScore += result.score * 2; // Phrase bonus
                docScore.phraseMatches.push({
                    phrase: phrase,
                    score: result.score,
                    positions: result.positions
                });
            }
        }
        
        // Convert to results array and apply additional scoring
        for (const [docId, scoreData] of termScores.entries()) {
            const finalScore = this.calculateFinalScore(scoreData, processedQuery, index);
            
            results.push({
                documentId: docId,
                document: scoreData.document,
                score: finalScore,
                termMatches: scoreData.termMatches,
                phraseMatches: scoreData.phraseMatches,
                snippet: this.generateSnippet(scoreData, processedQuery),
                shardId: shardId
            });
        }
        
        // Sort by score and return top results
        results.sort((a, b) => b.score - a.score);
        return results.slice(0, maxResults);
    }
    
    /**
     * Search for a term in a shard
     */
    searchTermInShard(term, index, processedQuery) {
        const termData = index.terms.get(term.toLowerCase());
        if (!termData) return [];
        
        const results = [];
        
        for (const posting of termData.postings) {
            const document = index.documents.get(posting.documentId);
            if (!document) continue;
            
            // Calculate TF-IDF score
            const tf = posting.termFrequency / document.length;
            const idf = Math.log(index.metadata.documentCount / termData.documentFrequency);
            const tfidfScore = tf * idf;
            
            // Apply field weights
            let fieldWeight = 1.0;
            if (document.title && document.title.toLowerCase().includes(term.toLowerCase())) {
                fieldWeight = this.config.indexing.fieldWeights.title;
            }
            
            // Apply document boost
            const documentBoost = document.boost || 1.0;
            
            const finalScore = tfidfScore * fieldWeight * documentBoost;
            
            results.push({
                documentId: posting.documentId,
                score: finalScore,
                termFrequency: posting.termFrequency,
                positions: posting.positions
            });
        }
        
        return results;
    }
    
    /**
     * Search for a phrase in a shard
     */
    searchPhraseInShard(phrase, index, processedQuery) {
        const phraseTerms = phrase.toLowerCase().split(/\\s+/);
        if (phraseTerms.length < 2) return [];
        
        // Find documents containing all phrase terms
        const candidateDocs = new Map();
        
        for (const term of phraseTerms) {
            const termData = index.terms.get(term);
            if (!termData) return []; // If any term is missing, phrase can't match
            
            for (const posting of termData.postings) {
                if (!candidateDocs.has(posting.documentId)) {
                    candidateDocs.set(posting.documentId, new Map());
                }
                candidateDocs.get(posting.documentId).set(term, posting.positions);
            }
        }
        
        const results = [];
        
        // Check for actual phrase matches
        for (const [docId, termPositions] of candidateDocs.entries()) {
            if (termPositions.size !== phraseTerms.length) continue;
            
            const phraseMatches = this.findPhraseMatches(phraseTerms, termPositions);
            
            if (phraseMatches.length > 0) {
                const document = index.documents.get(docId);
                const score = this.calculatePhraseScore(phraseMatches, document, index);
                
                results.push({
                    documentId: docId,
                    score: score,
                    positions: phraseMatches,
                    termFrequency: phraseMatches.length
                });
            }
        }
        
        return results;
    }
    
    /**
     * Find exact phrase matches in position data
     */
    findPhraseMatches(phraseTerms, termPositions) {
        const matches = [];
        const firstTermPositions = termPositions.get(phraseTerms[0]) || [];
        
        for (const startPos of firstTermPositions) {
            let isMatch = true;
            
            // Check if subsequent terms appear in order
            for (let i = 1; i < phraseTerms.length; i++) {
                const expectedPos = startPos + i;
                const termPos = termPositions.get(phraseTerms[i]) || [];
                
                if (!termPos.includes(expectedPos)) {
                    isMatch = false;
                    break;
                }
            }
            
            if (isMatch) {
                matches.push({
                    startPosition: startPos,
                    endPosition: startPos + phraseTerms.length - 1,
                    phrase: phraseTerms.join(' ')
                });
            }
        }
        
        return matches;
    }
    
    /**
     * Calculate final relevance score
     */
    calculateFinalScore(scoreData, processedQuery, index) {
        let score = scoreData.totalScore;
        
        // Apply query boosts
        for (const [boostType, boostValue] of Object.entries(processedQuery.boosts)) {
            score *= boostValue;
        }
        
        // Apply document type boosts
        const docType = scoreData.document.type;
        if (docType === 'book') score *= 1.2;
        else if (docType === 'entity') score *= 1.1;
        else if (docType === 'chapter') score *= 1.0;
        else if (docType === 'category') score *= 0.8;
        
        // Phrase match bonus
        if (scoreData.phraseMatches.length > 0) {
            score *= 1.5;
        }
        
        // Multiple term match bonus
        if (scoreData.termMatches.length > 1) {
            score *= 1 + (scoreData.termMatches.length - 1) * 0.1;
        }
        
        return score;
    }
    
    /**
     * Generate search result snippet
     */
    generateSnippet(scoreData, processedQuery, maxLength = 200) {
        const document = scoreData.document;
        let text = (document.title || '') + ' ' + (document.content || '');
        
        if (text.length <= maxLength) {
            return text;
        }
        
        // Find best snippet around matches
        let bestSnippet = '';
        let bestScore = 0;
        
        // Try to center snippet around term matches
        for (const termMatch of scoreData.termMatches) {
            const termIndex = text.toLowerCase().indexOf(termMatch.term.toLowerCase());
            if (termIndex !== -1) {
                const start = Math.max(0, termIndex - maxLength / 2);
                const end = Math.min(text.length, start + maxLength);
                const snippet = text.substring(start, end).trim();
                
                const score = this.scoreSnippet(snippet, processedQuery);
                if (score > bestScore) {
                    bestScore = score;
                    bestSnippet = snippet;
                }
            }
        }
        
        if (!bestSnippet) {
            bestSnippet = text.substring(0, maxLength).trim();
        }
        
        return bestSnippet + (bestSnippet.length < text.length ? '...' : '');
    }
    
    scoreSnippet(snippet, processedQuery) {
        let score = 0;
        const lowerSnippet = snippet.toLowerCase();
        
        for (const term of processedQuery.terms) {
            const termCount = (lowerSnippet.match(new RegExp(term.toLowerCase(), 'g')) || []).length;
            score += termCount * 10;
        }
        
        for (const phrase of processedQuery.phrases) {
            if (lowerSnippet.includes(phrase.toLowerCase())) {
                score += 50;
            }
        }
        
        return score;
    }
    
    /**
     * Merge results from all shards
     */
    mergeShardResults(shardResults, processedQuery) {
        const allResults = [];
        
        // Collect all results
        for (const shardResult of shardResults) {
            allResults.push(...shardResult.results);
        }
        
        // Remove duplicates (if any)
        const uniqueResults = this.deduplicateResults(allResults);
        
        // Re-sort by final score
        uniqueResults.sort((a, b) => b.score - a.score);
        
        return {
            results: uniqueResults,
            totalResults: uniqueResults.length,
            searchTime: 0, // Will be set by caller
            shardsCovered: shardResults.length,
            query: processedQuery
        };
    }
    
    /**
     * Remove duplicate results
     */
    deduplicateResults(results) {
        const seen = new Set();
        const unique = [];
        
        for (const result of results) {
            const key = result.documentId;
            if (!seen.has(key)) {
                seen.add(key);
                unique.push(result);
            }
        }
        
        return unique;
    }
    
    /**
     * Select which shards to search
     */
    selectTargetShards(processedQuery, options) {
        // For now, search all shards
        // In a more advanced implementation, you could use bloom filters
        // or other techniques to eliminate shards that definitely don't contain matches
        return Array.from(this.indexes.keys());
    }
    
    /**
     * Load search configuration
     */
    async loadConfiguration() {
        try {
            const response = await fetch('/assets/data/search-config.json');
            this.config = await response.json();
            
            // Load auxiliary data
            const auxResponse = await fetch('/assets/data/search-auxiliary.json');
            this.auxiliaryData = await auxResponse.json();
            
        } catch (error) {
            console.error('Failed to load search configuration:', error);
            throw error;
        }
    }
    
    /**
     * Load search indexes
     */
    async loadIndexes() {
        try {
            // Load index manifest
            const manifestResponse = await fetch('/assets/data/search-index-manifest.json');
            const manifest = await manifestResponse.json();
            
            // Load each shard
            const loadPromises = manifest.shards.map(async (shard) => {
                const response = await fetch(\`/assets/data/search-indexes/\${shard.id}.json\`);
                const indexData = await response.json();
                this.indexes.set(shard.id, indexData);
            });
            
            await Promise.all(loadPromises);
            
        } catch (error) {
            console.error('Failed to load search indexes:', error);
            throw error;
        }
    }
    
    /**
     * Utility methods
     */
    
    createCacheKey(processedQuery, options) {
        const key = {
            query: processedQuery.normalized,
            filters: processedQuery.filters,
            options: options
        };
        return JSON.stringify(key);
    }
    
    calculateCacheTTL(processedQuery) {
        // Cache popular queries longer
        if (processedQuery.intent === 'popular') {
            return 3600000; // 1 hour
        }
        
        // Cache simple queries longer
        if (processedQuery.complexity === 'simple') {
            return 1800000; // 30 minutes
        }
        
        return 900000; // 15 minutes default
    }
    
    formatSearchResult(searchResult, processedQuery, startTime) {
        const endTime = Date.now();
        
        return {
            ...searchResult,
            searchTime: endTime - startTime,
            processedQuery: {
                original: processedQuery.original,
                normalized: processedQuery.normalized,
                intent: processedQuery.intent,
                complexity: processedQuery.complexity
            },
            metadata: {
                timestamp: endTime,
                cached: searchResult.cached || false,
                totalShards: this.indexes.size
            }
        };
    }
    
    createErrorResult(query, error, startTime) {
        return {
            results: [],
            totalResults: 0,
            searchTime: Date.now() - startTime,
            error: error.message,
            query: {
                original: query,
                processed: false
            }
        };
    }
    
    updateSearchStats(startTime, wasCached) {
        const responseTime = Date.now() - startTime;
        
        // Update rolling average
        this.searchStats.avgResponseTime = 
            (this.searchStats.avgResponseTime + responseTime) / 2;
        
        // Update cache hit rate
        if (wasCached) {
            this.searchStats.cacheHitRate = 
                (this.searchStats.cacheHitRate + 1) / 2;
        } else {
            this.searchStats.cacheHitRate = 
                this.searchStats.cacheHitRate / 2;
        }
    }
    
    calculatePhraseScore(phraseMatches, document, index) {
        const baseScore = phraseMatches.length * 10;
        const documentBoost = document.boost || 1.0;
        return baseScore * documentBoost;
    }
    
    /**
     * Get search statistics
     */
    getStats() {
        return {
            ...this.searchStats,
            indexStats: {
                totalShards: this.indexes.size,
                totalDocuments: Array.from(this.indexes.values())
                    .reduce((sum, index) => sum + (index.metadata?.documentCount || 0), 0),
                totalTerms: Array.from(this.indexes.values())
                    .reduce((sum, index) => sum + (index.metadata?.termCount || 0), 0)
            },
            cacheStats: this.cacheManager?.getStats()
        };
    }
}

// Global initialization
window.DistributedSearchClient = DistributedSearchClient;

// Auto-initialize
document.addEventListener('DOMContentLoaded', async () => {
    try {
        window.searchClient = new DistributedSearchClient();
        await window.searchClient.init();
        console.log('🔍 Search system ready');
    } catch (error) {
        console.error('Failed to initialize search system:', error);
    }
});

export default DistributedSearchClient;
`;
    }
    
    /**
     * Generate shard manager component
     */
    generateShardManager() {
        return `/**
 * Shard Manager - Manages distributed index shards
 */

class ShardManager {
    constructor() {
        this.shards = new Map();
        this.metadata = new Map();
        this.loadBalancer = new LoadBalancer();
        this.healthMonitor = new HealthMonitor();
    }
    
    /**
     * Register a shard with the manager
     */
    registerShard(shardId, shardData, metadata = {}) {
        this.shards.set(shardId, shardData);
        this.metadata.set(shardId, {
            ...metadata,
            id: shardId,
            registeredAt: Date.now(),
            lastAccessed: Date.now(),
            accessCount: 0,
            size: this.estimateShardSize(shardData),
            status: 'active'
        });
        
        console.log(\`📦 Registered shard: \${shardId}\`);
    }
    
    /**
     * Get shard data
     */
    getShard(shardId) {
        const shard = this.shards.get(shardId);
        if (shard) {
            this.updateShardAccess(shardId);
        }
        return shard;
    }
    
    /**
     * Get shard metadata
     */
    getShardMetadata(shardId) {
        return this.metadata.get(shardId);
    }
    
    /**
     * Get all shard IDs
     */
    getAllShardIds() {
        return Array.from(this.shards.keys());
    }
    
    /**
     * Get optimal shards for a query
     */
    selectOptimalShards(query, options = {}) {
        const allShards = this.getAllShardIds();
        
        // Apply load balancing
        const balancedShards = this.loadBalancer.selectShards(allShards, this.metadata, options);
        
        // Apply health filtering
        const healthyShards = this.healthMonitor.filterHealthyShards(balancedShards, this.metadata);
        
        return healthyShards;
    }
    
    /**
     * Monitor shard health
     */
    monitorShardHealth() {
        for (const [shardId, metadata] of this.metadata.entries()) {
            const health = this.healthMonitor.checkShardHealth(shardId, metadata, this.shards.get(shardId));
            metadata.health = health;
            
            if (health.status === 'unhealthy') {
                console.warn(\`⚠️  Shard \${shardId} is unhealthy:\`, health.issues);
            }
        }
    }
    
    /**
     * Balance shard load
     */
    balanceLoad() {
        return this.loadBalancer.rebalanceShards(this.metadata);
    }
    
    /**
     * Get shard statistics
     */
    getShardStats() {
        const stats = {
            totalShards: this.shards.size,
            activeShard: 0,
            totalSize: 0,
            totalAccesses: 0,
            averageSize: 0,
            healthDistribution: { healthy: 0, degraded: 0, unhealthy: 0 }
        };
        
        for (const metadata of this.metadata.values()) {
            if (metadata.status === 'active') stats.activeShards++;
            stats.totalSize += metadata.size;
            stats.totalAccesses += metadata.accessCount;
            
            const healthStatus = metadata.health?.status || 'healthy';
            stats.healthDistribution[healthStatus]++;
        }
        
        stats.averageSize = stats.totalSize / this.shards.size;
        
        return stats;
    }
    
    // Private methods
    
    updateShardAccess(shardId) {
        const metadata = this.metadata.get(shardId);
        if (metadata) {
            metadata.lastAccessed = Date.now();
            metadata.accessCount++;
        }
    }
    
    estimateShardSize(shardData) {
        try {
            return JSON.stringify(shardData).length;
        } catch (error) {
            return 0;
        }
    }
}

/**
 * Load Balancer for shard selection
 */
class LoadBalancer {
    constructor() {
        this.strategy = 'round-robin'; // 'round-robin', 'least-loaded', 'random'
        this.roundRobinIndex = 0;
    }
    
    selectShards(shardIds, metadataMap, options = {}) {
        const maxShards = options.maxShards || shardIds.length;
        const strategy = options.strategy || this.strategy;
        
        switch (strategy) {
            case 'round-robin':
                return this.roundRobinSelection(shardIds, maxShards);
            case 'least-loaded':
                return this.leastLoadedSelection(shardIds, metadataMap, maxShards);
            case 'random':
                return this.randomSelection(shardIds, maxShards);
            default:
                return shardIds.slice(0, maxShards);
        }
    }
    
    roundRobinSelection(shardIds, maxShards) {
        const selected = [];
        
        for (let i = 0; i < maxShards && i < shardIds.length; i++) {
            const index = (this.roundRobinIndex + i) % shardIds.length;
            selected.push(shardIds[index]);
        }
        
        this.roundRobinIndex = (this.roundRobinIndex + maxShards) % shardIds.length;
        return selected;
    }
    
    leastLoadedSelection(shardIds, metadataMap, maxShards) {
        const shardsWithLoad = shardIds.map(id => ({
            id,
            load: this.calculateShardLoad(metadataMap.get(id))
        }));
        
        shardsWithLoad.sort((a, b) => a.load - b.load);
        
        return shardsWithLoad.slice(0, maxShards).map(shard => shard.id);
    }
    
    randomSelection(shardIds, maxShards) {
        const shuffled = [...shardIds].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, maxShards);
    }
    
    calculateShardLoad(metadata) {
        if (!metadata) return Infinity;
        
        // Simple load calculation based on access frequency and size
        const recentAccesses = metadata.accessCount / Math.max(1, (Date.now() - metadata.registeredAt) / 3600000); // per hour
        const sizeLoad = metadata.size / (1024 * 1024); // MB
        
        return recentAccesses + sizeLoad;
    }
    
    rebalanceShards(metadataMap) {
        const loads = Array.from(metadataMap.values()).map(m => this.calculateShardLoad(m));
        const avgLoad = loads.reduce((a, b) => a + b, 0) / loads.length;
        const maxDeviation = Math.max(...loads.map(load => Math.abs(load - avgLoad)));
        
        const needsRebalancing = maxDeviation > avgLoad * 0.5; // 50% deviation threshold
        
        return {
            needsRebalancing,
            avgLoad,
            maxDeviation,
            recommendations: needsRebalancing ? this.generateRebalancingRecommendations(metadataMap) : []
        };
    }
    
    generateRebalancingRecommendations(metadataMap) {
        // Simple recommendations for load balancing
        return [
            'Consider redistributing high-traffic content across multiple shards',
            'Monitor shard access patterns and adjust load balancing strategy',
            'Consider splitting large shards if memory usage is high'
        ];
    }
}

/**
 * Health Monitor for shard status
 */
class HealthMonitor {
    checkShardHealth(shardId, metadata, shardData) {
        const health = {
            status: 'healthy',
            score: 100,
            issues: [],
            lastCheck: Date.now()
        };
        
        // Check shard size
        if (metadata.size > 50 * 1024 * 1024) { // 50MB
            health.issues.push('Shard size is very large');
            health.score -= 20;
        }
        
        // Check last access time
        const hoursSinceAccess = (Date.now() - metadata.lastAccessed) / 3600000;
        if (hoursSinceAccess > 24) {
            health.issues.push('Shard not accessed recently');
            health.score -= 10;
        }
        
        // Check data integrity
        if (!shardData || !shardData.terms || !shardData.documents) {
            health.issues.push('Shard data structure is invalid');
            health.score -= 50;
        }
        
        // Determine status based on score
        if (health.score >= 80) {
            health.status = 'healthy';
        } else if (health.score >= 50) {
            health.status = 'degraded';
        } else {
            health.status = 'unhealthy';
        }
        
        return health;
    }
    
    filterHealthyShards(shardIds, metadataMap) {
        return shardIds.filter(id => {
            const metadata = metadataMap.get(id);
            const healthStatus = metadata?.health?.status || 'healthy';
            return healthStatus !== 'unhealthy';
        });
    }
}

export { ShardManager, LoadBalancer, HealthMonitor };
`;
    }
    
    /**
     * Generate build integration
     */
    generateBuildIntegration() {
        return `/**
 * Build Integration for Distributed Search Index
 * Integrates with Eleventy build process to generate search indexes
 */

const fs = require('fs').promises;
const path = require('path');
const { SearchIndexBuilder } = require('./index-builder');

class SearchBuildIntegration {
    constructor(eleventyConfig) {
        this.eleventyConfig = eleventyConfig;
        this.outputDir = '_site';
        this.searchDataDir = 'src/assets/data';
        this.indexBuilder = new SearchIndexBuilder();
    }
    
    /**
     * Integrate with Eleventy build process
     */
    integrate() {
        // Run index generation before build
        this.eleventyConfig.on('beforeBuild', async () => {
            await this.generateSearchIndexes();
        });
        
        // Copy search data to output
        this.eleventyConfig.addPassthroughCopy('src/assets/data/search-*');
        this.eleventyConfig.addPassthroughCopy('src/assets/search/');
        
        console.log('🔍 Search build integration configured');
    }
    
    /**
     * Generate search indexes during build
     */
    async generateSearchIndexes() {
        try {
            console.log('🔨 Generating distributed search indexes...');
            
            // Load content sources
            const contentSources = await this.loadContentSources();
            
            // Build indexes
            const indexResult = await this.indexBuilder.buildIndex(contentSources);
            
            // Write indexes to files
            await this.writeIndexesToFiles(indexResult);
            
            console.log('✅ Search indexes generated successfully');
            
        } catch (error) {
            console.error('❌ Failed to generate search indexes:', error);
            throw error;
        }
    }
    
    /**
     * Load content from data sources
     */
    async loadContentSources() {
        const sources = {};
        
        // Load books data
        try {
            const booksPath = path.join(this.searchDataDir, 'books.json');
            const booksData = await fs.readFile(booksPath, 'utf8');
            sources.books = JSON.parse(booksData);
        } catch (error) {
            console.warn('Could not load books data:', error.message);
        }
        
        // Load entities data
        try {
            const entitiesPath = path.join(this.searchDataDir, 'entities-search.json');
            const entitiesData = await fs.readFile(entitiesPath, 'utf8');
            sources.entities = JSON.parse(entitiesData);
        } catch (error) {
            console.warn('Could not load entities data:', error.message);
        }
        
        // Load categories data
        try {
            const categoriesPath = path.join(this.searchDataDir, 'categories.json');
            const categoriesData = await fs.readFile(categoriesPath, 'utf8');
            sources.categories = JSON.parse(categoriesData);
        } catch (error) {
            console.warn('Could not load categories data:', error.message);
        }
        
        return sources;
    }
    
    /**
     * Write generated indexes to files
     */
    async writeIndexesToFiles(indexResult) {
        const outputDir = path.join(this.searchDataDir, 'search-indexes');
        
        // Ensure output directory exists
        await fs.mkdir(outputDir, { recursive: true });
        
        // Write each shard to a separate file
        const manifest = {
            version: '1.0',
            generatedAt: new Date().toISOString(),
            shards: [],
            statistics: indexResult.statistics
        };
        
        for (const [shardId, indexData] of indexResult.indexes.entries()) {
            const filename = \`\${shardId}.json\`;
            const filepath = path.join(outputDir, filename);
            
            // Convert Maps to Objects for JSON serialization
            const serializedIndex = this.serializeIndex(indexData);
            
            await fs.writeFile(filepath, JSON.stringify(serializedIndex, null, 2));
            
            manifest.shards.push({
                id: shardId,
                filename: filename,
                size: serializedIndex.metadata?.termCount || 0,
                documents: serializedIndex.metadata?.documentCount || 0
            });
        }
        
        // Write manifest
        const manifestPath = path.join(this.searchDataDir, 'search-index-manifest.json');
        await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
        
        // Write auxiliary data
        const auxiliaryPath = path.join(this.searchDataDir, 'search-auxiliary.json');
        await fs.writeFile(auxiliaryPath, JSON.stringify(indexResult.auxiliary, null, 2));
        
        // Write search configuration
        const configPath = path.join(this.searchDataDir, 'search-config.json');
        await fs.writeFile(configPath, JSON.stringify(this.indexBuilder.config, null, 2));
    }
    
    /**
     * Convert Maps to Objects for JSON serialization
     */
    serializeIndex(indexData) {
        return {
            ...indexData,
            documents: Object.fromEntries(indexData.documents || new Map()),
            terms: Object.fromEntries(indexData.terms || new Map()),
            bloomFilter: indexData.bloomFilter ? {
                ...indexData.bloomFilter,
                filter: Array.from(indexData.bloomFilter.filter)
            } : null
        };
    }
}

// Export for Eleventy integration
module.exports = {
    configFunction: (eleventyConfig) => {
        const integration = new SearchBuildIntegration(eleventyConfig);
        integration.integrate();
    }
};
`;
    }
    
    /**
     * Generate biblical dictionaries
     */
    async generateBiblicalDictionaries(outputDir) {
        const dictionariesDir = path.join(outputDir, 'dictionaries');
        await this.ensureDirectory(dictionariesDir);
        
        // Generate synonyms dictionary
        const synonyms = {
            'god': ['lord', 'yahweh', 'jehovah', 'almighty', 'father', 'creator'],
            'jesus': ['christ', 'messiah', 'savior', 'lord', 'son', 'lamb'],
            'holy spirit': ['spirit', 'comforter', 'advocate', 'paraclete', 'helper'],
            'salvation': ['redemption', 'deliverance', 'rescue', 'saving'],
            'sin': ['transgression', 'iniquity', 'wickedness', 'trespass'],
            'love': ['charity', 'agape', 'compassion', 'mercy'],
            'faith': ['belief', 'trust', 'confidence', 'conviction'],
            'prayer': ['supplication', 'intercession', 'petition', 'worship'],
            'worship': ['praise', 'adoration', 'reverence', 'honor']
        };
        
        await fs.writeFileSync(
            path.join(dictionariesDir, 'synonyms.json'),
            JSON.stringify(synonyms, null, 2),
            'utf8'
        );
        
        // Generate abbreviations dictionary
        const abbreviations = {
            // Old Testament
            'gen': 'genesis', 'ex': 'exodus', 'lev': 'leviticus', 'num': 'numbers',
            'deut': 'deuteronomy', 'josh': 'joshua', 'judg': 'judges',
            // New Testament  
            'matt': 'matthew', 'mk': 'mark', 'lk': 'luke', 'jn': 'john',
            'rom': 'romans', 'cor': 'corinthians', 'gal': 'galatians',
            'eph': 'ephesians', 'phil': 'philippians', 'col': 'colossians',
            'thess': 'thessalonians', 'tim': 'timothy', 'tit': 'titus',
            'heb': 'hebrews', 'jas': 'james', 'pet': 'peter', 'rev': 'revelation'
        };
        
        await fs.writeFileSync(
            path.join(dictionariesDir, 'abbreviations.json'),
            JSON.stringify(abbreviations, null, 2),
            'utf8'
        );
    }
    
    /**
     * Ensure directory exists
     */
    async ensureDirectory(dirPath) {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
    }
    
    /**
     * Write component to file
     */
    async writeComponent(content, filePath) {
        const dir = path.dirname(filePath);
        await this.ensureDirectory(dir);
        fs.writeFileSync(filePath, content, 'utf8');
    }
}

// Export for build integration
module.exports = DistributedSearchIndex;

// Run if called directly
if (require.main === module) {
    const searchIndex = new DistributedSearchIndex();
    searchIndex.generateSearchIndexSystem()
        .then(() => {
            console.log('✅ Distributed search index system generated');
        })
        .catch(error => {
            console.error('❌ Failed to generate search index system:', error);
            process.exit(1);
        });
}