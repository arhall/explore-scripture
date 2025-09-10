#!/usr/bin/env node

/**
 * Extract Book Entities from Combined Dataset
 * Extracts entities for specific books from Bible_combined_all_expanded.with_ids.v2.json
 */

const fs = require('fs');
const path = require('path');

// Books that need entity data extracted
const booksToExtract = {
  daniel: 'Daniel',
  lamentations: 'Lamentations',
  proverbs: 'Proverbs',
  psalms: 'Psalms',
  ecclesiastes: 'Ecclesiastes',
  '1-chronicles': '1 Chronicles',
  '1-kings': '1 Kings',
  '2-samuel': '2 Samuel',
};

function createSearchText(entity) {
  return `${entity.name.toLowerCase()} ${entity.type || ''} ${entity.category || ''} ${entity.blurb || ''} `.toLowerCase();
}

function convertToSiteFormat(entity, bookName) {
  // Count references from both arrays
  let refCount = 0;
  if (entity.references && Array.isArray(entity.references)) {
    refCount += entity.references.length;
  }
  if (entity.cross_references && Array.isArray(entity.cross_references)) {
    refCount += entity.cross_references.length;
  }

  return {
    id: entity.id,
    name: entity.name,
    type: entity.type || 'entity',
    url: `/entities/${entity.id}/`,
    blurb: entity.blurb || '',
    searchText: createSearchText(entity),
    references: refCount,
    books: [bookName],
    category: entity.category || 'narrative',
  };
}

function entityAppearsInBook(entity, bookName) {
  // Check both references and cross_references arrays
  const allRefs = [];

  if (entity.references && Array.isArray(entity.references)) {
    allRefs.push(...entity.references);
  }

  if (entity.cross_references && Array.isArray(entity.cross_references)) {
    allRefs.push(...entity.cross_references);
  }

  if (allRefs.length === 0) return false;

  // Check if any reference mentions this book
  return allRefs.some(ref => {
    const refStr = ref.toString().toLowerCase();
    const bookLower = bookName.toLowerCase();

    // Handle special cases for book name matching
    if (bookName === '1 Chronicles') {
      return refStr.includes('1 chronicles') || refStr.includes('1 chron');
    }
    if (bookName === '1 Kings') {
      return refStr.includes('1 kings') || refStr.includes('1 king');
    }
    if (bookName === '2 Samuel') {
      return refStr.includes('2 samuel') || refStr.includes('2 sam');
    }

    return refStr.includes(bookLower);
  });
}

async function extractBookEntities() {
  console.log('📖 Extracting Book Entities from Combined Dataset\n');

  try {
    // Load the combined dataset
    console.log('📂 Loading Bible_combined_all_expanded.with_ids.v2.json...');
    const combinedData = JSON.parse(
      fs.readFileSync('Bible_combined_all_expanded.with_ids.v2.json', 'utf8')
    );

    if (!combinedData.entries || !Array.isArray(combinedData.entries)) {
      console.error('❌ Invalid data structure - no entries array found');
      return;
    }

    console.log(`📊 Found ${combinedData.entries.length} total entities`);
    console.log('🔍 Extracting entities for each book...\n');

    let successCount = 0;
    let failCount = 0;

    for (const [bookSlug, bookName] of Object.entries(booksToExtract)) {
      console.log(`📖 Processing ${bookName} (${bookSlug})...`);

      try {
        // Filter entities that appear in this book
        const bookEntities = combinedData.entries
          .filter(entity => entityAppearsInBook(entity, bookName))
          .map(entity => convertToSiteFormat(entity, bookName))
          .sort((a, b) => b.references - a.references) // Sort by reference count descending
          .slice(0, 50); // Limit to top 50 entities

        console.log(`   🔍 Found ${bookEntities.length} entities`);

        if (bookEntities.length === 0) {
          console.log(`   ⚠️  No entities found for ${bookName}`);
          failCount++;
          continue;
        }

        // Write to site format
        const outputPath = path.join('src/assets/data/books', `${bookSlug}-entities.json`);
        fs.writeFileSync(outputPath, JSON.stringify(bookEntities, null, 2));

        console.log(`   💾 Saved ${bookEntities.length} entities to ${bookSlug}-entities.json`);

        // Show sample entities
        const sampleNames = bookEntities
          .slice(0, 3)
          .map(e => e.name)
          .join(', ');
        console.log(`   📝 Top entities: ${sampleNames}${bookEntities.length > 3 ? '...' : ''}`);

        successCount++;
      } catch (error) {
        console.error(`   ❌ Error processing ${bookSlug}:`, error.message);
        failCount++;
      }

      console.log(''); // Empty line between books
    }

    console.log(`📊 Extraction Results:`);
    console.log(`   ✅ Success: ${successCount} books`);
    console.log(`   ❌ Failed: ${failCount} books`);

    if (successCount > 0) {
      console.log(`\n🎉 Successfully extracted entities for ${successCount} books!`);
      console.log(`\n🧪 Run the test script to verify: node scripts/test-key-figures-loading.js`);
    }
  } catch (error) {
    console.error('❌ Failed to load combined dataset:', error.message);
    process.exit(1);
  }
}

// Run the extraction
extractBookEntities().catch(error => {
  console.error('❌ Extraction failed:', error);
  process.exit(1);
});
