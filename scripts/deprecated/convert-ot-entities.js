#!/usr/bin/env node

/**
 * Convert OT Entity Files to Site Format
 * Converts OT_EntitiesByBook JSON files to the format expected by the site
 */

const fs = require('fs');
const path = require('path');

// Books that need entity data from OT files
const booksToConvert = {
  'daniel': 'daniel_all_expanded.with_ids.v1.json',
  'lamentations': 'lamentations_all_expanded.with_ids.v1.json', 
  'proverbs': 'proverbs_all_expanded.with_ids.v1.json',
  'psalms': 'psalms_all_expanded.with_ids.v1.json',
  'ecclesiastes': 'ecclesiastes_all_expanded.with_ids.v1.json'
};

function createSearchText(entity) {
  return `${entity.name.toLowerCase()} ${entity.type || ''} ${entity.category || ''} ${entity.blurb || ''} `.toLowerCase();
}

function convertOTEntity(entity, bookName) {
  return {
    id: entity.id,
    name: entity.name,
    type: entity.type || 'entity',
    url: `/entities/${entity.id}/`,
    blurb: entity.blurb || '',
    searchText: createSearchText(entity),
    references: entity.references ? entity.references.length : 0,
    books: [bookName],
    category: entity.category || 'narrative'
  };
}

function getLastEntityArray(data) {
  // The entities are stored in a nested structure - find the actual entities array
  if (Array.isArray(data)) return data;
  
  // Look for entities array in the data structure
  function findEntitiesRecursive(obj) {
    if (Array.isArray(obj)) {
      // Check if this array contains entity objects
      if (obj.length > 0 && obj[0].id && obj[0].name) {
        return obj;
      }
      // Otherwise, search within array elements
      for (let item of obj) {
        const result = findEntitiesRecursive(item);
        if (result) return result;
      }
    } else if (typeof obj === 'object' && obj !== null) {
      for (let value of Object.values(obj)) {
        const result = findEntitiesRecursive(value);
        if (result) return result;
      }
    }
    return null;
  }
  
  return findEntitiesRecursive(data);
}

async function convertOTEntities() {
  console.log('🔄 Converting OT Entity Files to Site Format\n');
  
  let successCount = 0;
  let failCount = 0;
  
  for (const [bookSlug, fileName] of Object.entries(booksToConvert)) {
    const bookName = bookSlug.charAt(0).toUpperCase() + bookSlug.slice(1);
    console.log(`📖 Processing ${bookName} (${bookSlug})...`);
    
    try {
      const sourcePath = path.join('OT_EntitiesByBook', fileName);
      
      if (!fs.existsSync(sourcePath)) {
        console.log(`   ❌ Source file not found: ${fileName}`);
        failCount++;
        continue;
      }
      
      // Read the OT entity file
      const otData = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
      console.log(`   📂 Loaded OT data for ${otData.book || bookName}`);
      
      // Extract entities array from the nested structure
      const entities = getLastEntityArray(otData);
      
      if (!entities || !Array.isArray(entities)) {
        console.log(`   ❌ Could not find entities array in ${fileName}`);
        failCount++;
        continue;
      }
      
      console.log(`   🔍 Found ${entities.length} entities`);
      
      // Convert to site format
      const convertedEntities = entities
        .filter(entity => entity.id && entity.name) // Only valid entities
        .map(entity => convertOTEntity(entity, bookName))
        .sort((a, b) => b.references - a.references) // Sort by reference count descending
        .slice(0, 50); // Limit to top 50 entities
      
      console.log(`   ✅ Converted ${convertedEntities.length} entities`);
      
      // Write to site format
      const outputPath = path.join('src/assets/data/books', `${bookSlug}-entities.json`);
      fs.writeFileSync(outputPath, JSON.stringify(convertedEntities, null, 2));
      
      console.log(`   💾 Saved to ${bookSlug}-entities.json`);
      
      // Show sample entities
      if (convertedEntities.length > 0) {
        const sampleNames = convertedEntities.slice(0, 3).map(e => e.name).join(', ');
        console.log(`   📝 Top entities: ${sampleNames}${convertedEntities.length > 3 ? '...' : ''}`);
      }
      
      successCount++;
      
    } catch (error) {
      console.error(`   ❌ Error processing ${bookSlug}:`, error.message);
      failCount++;
    }
    
    console.log(''); // Empty line between books
  }
  
  console.log(`📊 Conversion Results:`);
  console.log(`   ✅ Success: ${successCount} books`);
  console.log(`   ❌ Failed: ${failCount} books`);
  
  if (successCount > 0) {
    console.log(`\n🎉 Successfully converted ${successCount} books with real entity data!`);
    console.log(`\n🧪 Run the test script to verify: node scripts/test-key-figures-loading.js`);
  }
}

// Run the conversion
convertOTEntities().catch(error => {
  console.error('❌ Conversion failed:', error);
  process.exit(1);
});