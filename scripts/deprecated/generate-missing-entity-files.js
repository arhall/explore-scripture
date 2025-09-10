#!/usr/bin/env node

/**
 * Generate Missing Entity Files
 * Creates book-specific entity JSON files for the 8 missing books
 */

const fs = require('fs');
const path = require('path');

// Missing books that need entity files
const missingBooks = [
  '1-chronicles',
  '1-kings',
  '2-samuel',
  'daniel',
  'ecclesiastes',
  'lamentations',
  'proverbs',
  'psalms',
];

// Book name mapping from slug to full name used in entity data
const bookNameMapping = {
  '1-chronicles': '1 Chronicles',
  '1-kings': '1 Kings',
  '2-samuel': '2 Samuel',
  daniel: 'Daniel',
  ecclesiastes: 'Ecclesiastes',
  lamentations: 'Lamentations',
  proverbs: 'Proverbs',
  psalms: 'Psalms',
};

async function generateMissingEntityFiles() {
  try {
    console.log('🔍 Loading entities-search.json...');

    // Load the main entities data
    const entitiesSearchPath = path.join(__dirname, '../src/assets/data/entities-search.json');
    const entitiesData = JSON.parse(fs.readFileSync(entitiesSearchPath, 'utf8'));

    console.log(`📊 Loaded ${entitiesData.length} entities`);

    // Generate entity files for each missing book
    for (const bookSlug of missingBooks) {
      const bookName = bookNameMapping[bookSlug];
      console.log(`\n📖 Processing ${bookName} (${bookSlug})...`);

      // Filter entities that appear in this book
      const bookEntities = entitiesData.filter(
        entity => entity.books && entity.books.includes(bookName)
      );

      console.log(`   Found ${bookEntities.length} entities for ${bookName}`);

      if (bookEntities.length > 0) {
        // Write the book-specific entity file
        const outputPath = path.join(
          __dirname,
          '../src/assets/data/books',
          `${bookSlug}-entities.json`
        );
        fs.writeFileSync(outputPath, JSON.stringify(bookEntities, null, 2));

        console.log(`   ✅ Created ${bookSlug}-entities.json with ${bookEntities.length} entities`);

        // Log a few sample entities for verification
        if (bookEntities.length > 0) {
          const sampleNames = bookEntities
            .slice(0, 3)
            .map(e => e.name)
            .join(', ');
          console.log(
            `   📝 Sample entities: ${sampleNames}${bookEntities.length > 3 ? '...' : ''}`
          );
        }
      } else {
        console.log(`   ⚠️  No entities found for ${bookName} - this may indicate a mapping issue`);
      }
    }

    console.log('\n✅ Entity file generation complete!');

    // Verification: check if all files were created
    console.log('\n🔍 Verification:');
    for (const bookSlug of missingBooks) {
      const filePath = path.join(
        __dirname,
        '../src/assets/data/books',
        `${bookSlug}-entities.json`
      );
      const exists = fs.existsSync(filePath);
      const size = exists ? fs.statSync(filePath).size : 0;
      const status = exists ? `✅ Created (${Math.round(size / 1024)}KB)` : '❌ Missing';
      console.log(`   ${bookSlug}-entities.json: ${status}`);
    }
  } catch (error) {
    console.error('❌ Error generating entity files:', error);
    process.exit(1);
  }
}

// Run the script
generateMissingEntityFiles();
