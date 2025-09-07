#!/usr/bin/env node

/**
 * Generate search data files for Bible Explorer
 * Creates JSON files that the search engine can consume
 */

const fs = require('fs');
const path = require('path');

// Import data modules
const searchDataModule = require('./searchDataGenerator.js');

async function generateSearchData() {
  console.log('🔍 Generating search data...');
  
  try {
    // Generate search data
    const searchData = searchDataModule();
    
    // Ensure assets/data directory exists
    const dataDir = path.join(__dirname, 'src', 'assets', 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Generate entities data if available
    let entitiesData = [];
    try {
      entitiesData = await generateEntitiesSearchData();
      searchData.entities = entitiesData;
    } catch (error) {
      console.log('⚠️  Entities data not found, skipping entity search indexing');
      searchData.entities = [];
    }
    
    // Write individual data files
    await Promise.all([
      writeJSON(path.join(dataDir, 'books.json'), searchData.books),
      writeJSON(path.join(dataDir, 'categories.json'), searchData.categories),
      writeJSON(path.join(dataDir, 'entities-search.json'), entitiesData),
      writeJSON(path.join(dataDir, 'search-data.json'), searchData)
    ]);
    
    console.log('✅ Search data generated successfully');
    console.log(`📊 Stats:`);
    console.log(`   - Books: ${searchData.books.length}`);
    console.log(`   - Categories: ${searchData.categories.length}`);
    console.log(`   - Entities: ${entitiesData.length}`);
    console.log(`   - Total chapters: ${searchData.books.reduce((sum, book) => sum + book.chapterCount, 0)}`);
    
  } catch (error) {
    console.error('❌ Failed to generate search data:', error);
    process.exit(1);
  }
}

async function writeJSON(filePath, data) {
  return new Promise((resolve, reject) => {
    const jsonString = JSON.stringify(data, null, 2);
    fs.writeFile(filePath, jsonString, 'utf8', (err) => {
      if (err) {
        reject(err);
      } else {
        console.log(`   ✓ ${path.basename(filePath)} (${(jsonString.length / 1024).toFixed(1)}KB)`);
        resolve();
      }
    });
  });
}

/**
 * Generate entities search data from processed entity files
 */
async function generateEntitiesSearchData() {
  console.log('🔍 Generating entities search data...');
  
  const entitiesDir = path.join(__dirname, 'src', 'assets', 'data', 'entities');
  
  if (!fs.existsSync(entitiesDir)) {
    throw new Error('Entities directory not found. Run entity processor first.');
  }
  
  // Get all entity files
  const allEntityFiles = fs.readdirSync(entitiesDir)
    .filter(file => file.endsWith('.json'));
  
  // Prioritize important entity types for search
  const prioritizedFiles = [];
  const otherFiles = [];
  
  for (const file of allEntityFiles) {
    if (file.startsWith('p.') || // persons
        file.startsWith('d.') || // divine
        file.startsWith('g.') || // groups
        file.startsWith('t.')) { // titles
      prioritizedFiles.push(file);
    } else {
      otherFiles.push(file);
    }
  }
  
  // Take all entity files for complete search coverage
  const entityFiles = [
    ...prioritizedFiles,
    ...otherFiles
  ];
  
  console.log(`📊 Entity selection: ${prioritizedFiles.length} prioritized + ${otherFiles.length} others = ${entityFiles.length} total`);
  
  const entitiesSearchData = [];
  
  for (const file of entityFiles) {
    try {
      const entityPath = path.join(entitiesDir, file);
      const entityData = JSON.parse(fs.readFileSync(entityPath, 'utf8'));
      
      // Create search-optimized entity data
      const searchEntity = {
        id: entityData.id,
        name: entityData.name,
        type: entityData.type,
        url: `/entities/${entityData.id}/`,
        blurb: entityData.blurb ? entityData.blurb.substring(0, 200) : '',
        searchText: [
          entityData.name,
          entityData.type,
          entityData.category || '',
          entityData.blurb || '',
          (entityData.canonicalized_from || []).join(' ')
        ].join(' ').toLowerCase(),
        references: (entityData.references || []).length,
        books: Object.keys(entityData.book_references || {}),
        category: entityData.category || 'unknown'
      };
      
      entitiesSearchData.push(searchEntity);
      
    } catch (error) {
      console.warn(`Failed to process entity file ${file}:`, error.message);
    }
  }
  
  // Sort by number of references (most important first)
  entitiesSearchData.sort((a, b) => b.references - a.references);
  
  console.log(`✅ Generated search data for ${entitiesSearchData.length} entities`);
  
  // Generate per-book entity files for better performance
  await generatePerBookEntityData(entitiesSearchData);
  
  return entitiesSearchData;
}

async function generatePerBookEntityData(entitiesData) {
  console.log('📚 Generating per-book entity data...');
  
  const booksDir = path.join(__dirname, 'src', 'assets', 'data', 'books');
  if (!fs.existsSync(booksDir)) {
    fs.mkdirSync(booksDir, { recursive: true });
  }
  
  // Group entities by book
  const bookEntities = {};
  
  for (const entity of entitiesData) {
    for (const book of entity.books) {
      if (!bookEntities[book]) {
        bookEntities[book] = [];
      }
      bookEntities[book].push(entity);
    }
  }
  
  // Write per-book entity files
  const bookFiles = [];
  for (const [bookName, entities] of Object.entries(bookEntities)) {
    // Sort by reference count and limit to top 50 for performance
    const topEntities = entities
      .sort((a, b) => b.references - a.references)
      .slice(0, 50);
    
    const bookSlug = bookName.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '');
    
    const fileName = `${bookSlug}-entities.json`;
    const filePath = path.join(booksDir, fileName);
    
    await writeJSON(filePath, topEntities);
    bookFiles.push(fileName);
  }
  
  console.log(`✅ Generated ${bookFiles.length} per-book entity files`);
}

// Run the generator
if (require.main === module) {
  generateSearchData();
}

module.exports = { generateSearchData };