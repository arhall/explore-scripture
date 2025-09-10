#!/usr/bin/env node

/**
 * Test Key Figures Loading for All 66 Books
 * Verifies that all book entity files exist and are properly formatted
 */

const fs = require('fs');
const path = require('path');

// Load books data to get all 66 books
const booksData = JSON.parse(fs.readFileSync('src/_data/books.json', 'utf8'));

async function testKeyFiguresLoading() {
  console.log('🧪 Testing Key Figures Loading for All 66 Books\n');

  let passCount = 0;
  let failCount = 0;
  const failures = [];

  for (const book of booksData) {
    const bookSlug = book.slug;
    const entityFile = path.join('src/assets/data/books', `${bookSlug}-entities.json`);

    try {
      // Check if file exists
      if (!fs.existsSync(entityFile)) {
        console.log(`❌ ${book.name} (${bookSlug}): Entity file missing`);
        failures.push({ book: book.name, slug: bookSlug, error: 'File missing' });
        failCount++;
        continue;
      }

      // Check if file is valid JSON
      const entityData = JSON.parse(fs.readFileSync(entityFile, 'utf8'));

      // Check if it's an array
      if (!Array.isArray(entityData)) {
        console.log(`❌ ${book.name} (${bookSlug}): Entity data is not an array`);
        failures.push({ book: book.name, slug: bookSlug, error: 'Not an array' });
        failCount++;
        continue;
      }

      // Success
      const entityCount = entityData.length;
      const status = entityCount === 0 ? '(empty)' : `(${entityCount} entities)`;
      console.log(`✅ ${book.name} (${bookSlug}): ${status}`);
      passCount++;
    } catch (error) {
      console.log(`❌ ${book.name} (${bookSlug}): ${error.message}`);
      failures.push({ book: book.name, slug: bookSlug, error: error.message });
      failCount++;
    }
  }

  console.log(`\n📊 Test Results:`);
  console.log(`   ✅ Passed: ${passCount}/${booksData.length} books`);
  console.log(`   ❌ Failed: ${failCount}/${booksData.length} books`);

  if (failures.length > 0) {
    console.log(`\n🔍 Failures:`);
    failures.forEach(failure => {
      console.log(`   • ${failure.book} (${failure.slug}): ${failure.error}`);
    });
  }

  if (failCount === 0) {
    console.log(`\n🎉 All 66 books have properly formatted entity files!`);
  } else {
    console.log(`\n⚠️  ${failCount} books need attention.`);
  }

  // Additional stats
  console.log(`\n📈 Entity Statistics:`);
  let totalEntities = 0;
  let booksWithEntities = 0;
  let booksWithoutEntities = 0;

  for (const book of booksData) {
    const entityFile = path.join('src/assets/data/books', `${book.slug}-entities.json`);
    if (fs.existsSync(entityFile)) {
      try {
        const entityData = JSON.parse(fs.readFileSync(entityFile, 'utf8'));
        if (Array.isArray(entityData)) {
          totalEntities += entityData.length;
          if (entityData.length > 0) {
            booksWithEntities++;
          } else {
            booksWithoutEntities++;
          }
        }
      } catch {
        // Skip files with errors
      }
    }
  }

  console.log(`   📚 Books with entities: ${booksWithEntities}`);
  console.log(`   📄 Books without entities: ${booksWithoutEntities}`);
  console.log(`   👥 Total entities: ${totalEntities}`);
  console.log(`   📊 Average entities per book: ${(totalEntities / booksData.length).toFixed(1)}`);
}

// Run the test
testKeyFiguresLoading().catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
