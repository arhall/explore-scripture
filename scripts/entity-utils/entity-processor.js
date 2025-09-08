#!/usr/bin/env node

/**
 * Entity Data Processor for Bible Explorer
 * 
 * Processes the master entities file and generates:
 * - Per-book entity indexes: books/{slug}/entities.json
 * - Per-chapter entity indexes: books/{slug}/chapters/{n}.json  
 * - Global entity pages: entities/{id}.json
 * - Normalized redirect map: redirects.json
 */

const fs = require('fs');
const path = require('path');

// Configuration
const INPUT_DIR = './data/source-datasets';
const OUTPUT_DIR = './src/assets/data';
const MASTER_FILE = 'Bible_combined_all_expanded.with_ids.v2.json';
const REDIRECT_MAP_FILE = 'Bible_id_redirect_map.v2.json';
const BOOKS_FILE = './src/_data/books.json';

/**
 * Redirect resolver system
 */
class RedirectResolver {
    constructor(redirectMap) {
        this.redirectMap = new Map();
        redirectMap.forEach(entry => {
            this.redirectMap.set(entry.from_id, entry.to_canonical_id);
        });
    }

    resolveId(id) {
        const seen = new Set();
        let current = id;
        
        while (this.redirectMap.has(current) && !seen.has(current)) {
            seen.add(current);
            current = this.redirectMap.get(current);
        }
        
        return current;
    }
}

/**
 * Book name mappings for reference parsing
 */
const BOOK_ABBREVIATIONS = {
    'Gen': 'Genesis', 'Genesis': 'Genesis',
    'Exod': 'Exodus', 'Exodus': 'Exodus', 'Ex': 'Exodus',
    'Lev': 'Leviticus', 'Leviticus': 'Leviticus',
    'Num': 'Numbers', 'Numbers': 'Numbers',
    'Deut': 'Deuteronomy', 'Deuteronomy': 'Deuteronomy', 'Dt': 'Deuteronomy',
    'Josh': 'Joshua', 'Joshua': 'Joshua',
    'Judg': 'Judges', 'Judges': 'Judges',
    'Ruth': 'Ruth',
    '1 Sam': '1 Samuel', '1Samuel': '1 Samuel', '1 Samuel': '1 Samuel',
    '2 Sam': '2 Samuel', '2Samuel': '2 Samuel', '2 Samuel': '2 Samuel',
    '1 Kgs': '1 Kings', '1Kings': '1 Kings', '1 Kings': '1 Kings',
    '2 Kgs': '2 Kings', '2Kings': '2 Kings', '2 Kings': '2 Kings',
    '1 Chr': '1 Chronicles', '1Chronicles': '1 Chronicles', '1 Chronicles': '1 Chronicles',
    '2 Chr': '2 Chronicles', '2Chronicles': '2 Chronicles', '2 Chronicles': '2 Chronicles',
    'Ezra': 'Ezra',
    'Neh': 'Nehemiah', 'Nehemiah': 'Nehemiah',
    'Esth': 'Esther', 'Esther': 'Esther',
    'Job': 'Job',
    'Ps': 'Psalms', 'Psalm': 'Psalms', 'Psalms': 'Psalms',
    'Prov': 'Proverbs', 'Proverbs': 'Proverbs',
    'Eccl': 'Ecclesiastes', 'Ecclesiastes': 'Ecclesiastes',
    'Song': 'Song of Songs', 'Song of Songs': 'Song of Songs',
    'Isa': 'Isaiah', 'Isaiah': 'Isaiah',
    'Jer': 'Jeremiah', 'Jeremiah': 'Jeremiah',
    'Lam': 'Lamentations', 'Lamentations': 'Lamentations',
    'Ezek': 'Ezekiel', 'Ezekiel': 'Ezekiel',
    'Dan': 'Daniel', 'Daniel': 'Daniel',
    'Hos': 'Hosea', 'Hosea': 'Hosea',
    'Joel': 'Joel',
    'Amos': 'Amos',
    'Obad': 'Obadiah', 'Obadiah': 'Obadiah',
    'Jonah': 'Jonah',
    'Mic': 'Micah', 'Micah': 'Micah',
    'Nah': 'Nahum', 'Nahum': 'Nahum',
    'Hab': 'Habakkuk', 'Habakkuk': 'Habakkuk',
    'Zeph': 'Zephaniah', 'Zephaniah': 'Zephaniah',
    'Hag': 'Haggai', 'Haggai': 'Haggai',
    'Zech': 'Zechariah', 'Zechariah': 'Zechariah',
    'Mal': 'Malachi', 'Malachi': 'Malachi',
    
    // New Testament
    'Matt': 'Matthew', 'Matthew': 'Matthew', 'Mt': 'Matthew',
    'Mark': 'Mark', 'Mk': 'Mark',
    'Luke': 'Luke', 'Lk': 'Luke',
    'John': 'John', 'Jn': 'John',
    'Acts': 'Acts',
    'Rom': 'Romans', 'Romans': 'Romans',
    '1 Cor': '1 Corinthians', '1Cor': '1 Corinthians', '1 Corinthians': '1 Corinthians',
    '2 Cor': '2 Corinthians', '2Cor': '2 Corinthians', '2 Corinthians': '2 Corinthians',
    'Gal': 'Galatians', 'Galatians': 'Galatians',
    'Eph': 'Ephesians', 'Ephesians': 'Ephesians',
    'Phil': 'Philippians', 'Philippians': 'Philippians',
    'Col': 'Colossians', 'Colossians': 'Colossians',
    '1 Thess': '1 Thessalonians', '1Thess': '1 Thessalonians', '1 Thessalonians': '1 Thessalonians',
    '2 Thess': '2 Thessalonians', '2Thess': '2 Thessalonians', '2 Thessalonians': '2 Thessalonians',
    '1 Tim': '1 Timothy', '1Tim': '1 Timothy', '1 Timothy': '1 Timothy',
    '2 Tim': '2 Timothy', '2Tim': '2 Timothy', '2 Timothy': '2 Timothy',
    'Titus': 'Titus',
    'Phlm': 'Philemon', 'Philem': 'Philemon', 'Philemon': 'Philemon',
    'Heb': 'Hebrews', 'Hebrews': 'Hebrews',
    'Jas': 'James', 'James': 'James',
    '1 Pet': '1 Peter', '1Pet': '1 Peter', '1 Peter': '1 Peter',
    '2 Pet': '2 Peter', '2Pet': '2 Peter', '2 Peter': '2 Peter',
    '1 John': '1 John', '1Jn': '1 John',
    '2 John': '2 John', '2Jn': '2 John',
    '3 John': '3 John', '3Jn': '3 John',
    'Jude': 'Jude',
    'Rev': 'Revelation', 'Revelation': 'Revelation'
};

/**
 * Parse chapter references from entity reference strings
 */
function parseReferences(references = []) {
    const bookChapters = new Map();
    
    references.forEach(ref => {
        // Handle various reference formats
        // Examples: "Genesis 1–3", "Rom 8:28", "1 Corinthians 15", "Genesis 2–5"
        
        const patterns = [
            // Book Chapter:Verse format (e.g., "Rom 8:28", "Genesis 1:1")  
            /^([^\d]*(?:\d+\s+)?[^\d\s]+)\s+(\d+):\d+/,
            // Book Chapter–Chapter format (e.g., "Genesis 1–3")
            /^([^\d]*(?:\d+\s+)?[^\d\s]+)\s+(\d+)(?:–(\d+))?$/,
            // Book Chapter format (e.g., "1 Corinthians 15")
            /^([^\d]*(?:\d+\s+)?[^\d\s]+)\s+(\d+)$/
        ];
        
        for (const pattern of patterns) {
            const match = ref.match(pattern);
            if (match) {
                const rawBookName = match[1].trim();
                const startChapter = parseInt(match[2]);
                const endChapter = match[3] ? parseInt(match[3]) : startChapter;
                
                // Normalize book name
                const bookName = BOOK_ABBREVIATIONS[rawBookName] || rawBookName;
                
                if (!bookChapters.has(bookName)) {
                    bookChapters.set(bookName, new Set());
                }
                
                // Add all chapters in range
                for (let ch = startChapter; ch <= endChapter; ch++) {
                    bookChapters.get(bookName).add(ch);
                }
                break;
            }
        }
    });
    
    return bookChapters;
}

/**
 * Calculate entity score for sorting
 */
function calculateEntityScore(entity, bookName, refCount) {
    let score = refCount;
    
    // Type weights
    const typeWeights = {
        'person': 10,
        'divine': 15,
        'place': 5,
        'title': 3,
        'figure': 2,
        'event': 4,
        'group': 6
    };
    
    score += typeWeights[entity.type] || 1;
    
    // Boost for longer blurbs (more important entities typically have more content)
    if (entity.blurb && entity.blurb.length > 200) {
        score += 5;
    }
    
    return score;
}

/**
 * Main processing function
 */
async function processEntities() {
    console.log('🚀 Starting entity processing...');
    
    // Load data files
    console.log('📖 Loading data files...');
    const masterData = JSON.parse(fs.readFileSync(path.join(INPUT_DIR, MASTER_FILE), 'utf8'));
    const redirectMapData = JSON.parse(fs.readFileSync(path.join(INPUT_DIR, REDIRECT_MAP_FILE), 'utf8'));
    const booksData = JSON.parse(fs.readFileSync(BOOKS_FILE, 'utf8'));
    
    // Create book slug lookup
    const bookSlugMap = new Map();
    const bookChapterCounts = new Map();
    booksData.forEach(book => {
        bookSlugMap.set(book.name, book.slug);
        // Extract chapter count from chapterSummaries
        const chapterCount = Object.keys(book.chapterSummaries || {}).length;
        bookChapterCounts.set(book.name, chapterCount);
    });
    
    // Initialize redirect resolver
    const redirectResolver = new RedirectResolver(redirectMapData);
    
    // Create output directories
    console.log('📁 Creating output directories...');
    const dirs = [
        OUTPUT_DIR,
        path.join(OUTPUT_DIR, 'books'),
        path.join(OUTPUT_DIR, 'entities')
    ];
    
    dirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });
    
    // Process entities and group by book
    console.log('🔄 Processing entities...');
    const bookEntities = new Map();
    const chapterEntities = new Map();
    const globalEntities = new Map();
    
    // Initialize book entities maps
    booksData.forEach(book => {
        bookEntities.set(book.name, []);
        chapterEntities.set(book.name, new Map());
        
        // Initialize chapter maps
        for (let ch = 1; ch <= bookChapterCounts.get(book.name); ch++) {
            chapterEntities.get(book.name).set(ch, []);
        }
    });
    
    // Process each entity
    masterData.entries.forEach((entity, index) => {
        if (index % 500 === 0) {
            console.log(`  Processed ${index}/${masterData.entries.length} entities...`);
        }
        
        // Resolve canonical ID
        const canonicalId = redirectResolver.resolveId(entity.id);
        
        // Parse references to get book/chapter mappings
        const bookChapters = parseReferences(entity.references);
        
        // Create entity summary for book pages
        const entitySummary = {
            id: canonicalId,
            name: entity.name,
            type: entity.type,
            role: entity.category || 'unknown',
            refs_count: entity.references ? entity.references.length : 0
        };
        
        // Create full entity data for global pages
        const fullEntity = {
            ...entity,
            id: canonicalId,
            book_references: {}
        };
        
        // Group by books and chapters
        bookChapters.forEach((chapters, bookName) => {
            if (bookEntities.has(bookName)) {
                // Add to book entities
                const bookEntitySummary = {
                    ...entitySummary,
                    refs_count: chapters.size,
                    score: calculateEntityScore(entity, bookName, chapters.size)
                };
                bookEntities.get(bookName).push(bookEntitySummary);
                
                // Add to chapter entities
                chapters.forEach(chapterNum => {
                    if (chapterEntities.get(bookName).has(chapterNum)) {
                        chapterEntities.get(bookName).get(chapterNum).push(entitySummary);
                    }
                });
                
                // Add book references to full entity
                fullEntity.book_references[bookName] = Array.from(chapters).sort((a, b) => a - b);
            }
        });
        
        // Store global entity
        globalEntities.set(canonicalId, fullEntity);
    });
    
    console.log('💾 Writing output files...');
    
    // Write per-book entity indexes
    for (const [bookName, entities] of bookEntities) {
        const bookSlug = bookSlugMap.get(bookName);
        if (!bookSlug) continue;
        
        const bookDir = path.join(OUTPUT_DIR, 'books', bookSlug);
        if (!fs.existsSync(bookDir)) {
            fs.mkdirSync(bookDir, { recursive: true });
        }
        
        // Sort entities by score (highest first)
        entities.sort((a, b) => (b.score || 0) - (a.score || 0));
        
        const bookEntityData = {
            book: bookName,
            slug: bookSlug,
            entity_count: entities.length,
            key_figures: entities.slice(0, 20), // Top 20 for display
            all_entities: entities
        };
        
        fs.writeFileSync(
            path.join(bookDir, 'entities.json'),
            JSON.stringify(bookEntityData, null, 2)
        );
    }
    
    // Write per-chapter entity indexes
    for (const [bookName, chapterMap] of chapterEntities) {
        const bookSlug = bookSlugMap.get(bookName);
        if (!bookSlug) continue;
        
        const chaptersDir = path.join(OUTPUT_DIR, 'books', bookSlug, 'chapters');
        if (!fs.existsSync(chaptersDir)) {
            fs.mkdirSync(chaptersDir, { recursive: true });
        }
        
        for (const [chapterNum, entities] of chapterMap) {
            if (entities.length > 0) {
                const chapterEntityData = {
                    book: bookName,
                    chapter: chapterNum,
                    entity_count: entities.length,
                    entities: entities.slice(0, 10) // Top 10 for chapter display
                };
                
                fs.writeFileSync(
                    path.join(chaptersDir, `${chapterNum}.json`),
                    JSON.stringify(chapterEntityData, null, 2)
                );
            }
        }
    }
    
    // Write global entity pages
    const entitiesDir = path.join(OUTPUT_DIR, 'entities');
    let entityCount = 0;
    for (const [id, entity] of globalEntities) {
        fs.writeFileSync(
            path.join(entitiesDir, `${id}.json`),
            JSON.stringify(entity, null, 2)
        );
        entityCount++;
        
        if (entityCount % 500 === 0) {
            console.log(`  Written ${entityCount}/${globalEntities.size} entity files...`);
        }
    }
    
    // Write redirect map
    const normalizedRedirects = {};
    redirectMapData.forEach(entry => {
        normalizedRedirects[entry.from_id] = entry.to_canonical_id;
    });
    
    fs.writeFileSync(
        path.join(OUTPUT_DIR, 'redirects.json'),
        JSON.stringify(normalizedRedirects, null, 2)
    );
    
    // Write processing summary
    const summary = {
        processed_at: new Date().toISOString(),
        total_entities: masterData.entries.length,
        unique_canonical_entities: globalEntities.size,
        books_processed: bookEntities.size,
        redirect_mappings: Object.keys(normalizedRedirects).length,
        output_files: {
            book_entity_indexes: bookEntities.size,
            chapter_entity_indexes: Array.from(chapterEntities.values()).reduce((sum, map) => sum + map.size, 0),
            global_entity_pages: globalEntities.size,
            redirect_map: 1
        }
    };
    
    fs.writeFileSync(
        path.join(OUTPUT_DIR, 'processing-summary.json'),
        JSON.stringify(summary, null, 2)
    );
    
    console.log('✅ Entity processing complete!');
    console.log(`📊 Summary:`);
    console.log(`   - Processed ${summary.total_entities} entities`);
    console.log(`   - Generated ${summary.unique_canonical_entities} unique entities`);
    console.log(`   - Created ${summary.output_files.book_entity_indexes} book indexes`);
    console.log(`   - Created ${summary.output_files.global_entity_pages} entity pages`);
    console.log(`   - Output directory: ${OUTPUT_DIR}`);
}

// Run if called directly
if (require.main === module) {
    processEntities().catch(console.error);
}

module.exports = { processEntities, RedirectResolver };