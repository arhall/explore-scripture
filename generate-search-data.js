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
    
    // Write individual data files
    await Promise.all([
      writeJSON(path.join(dataDir, 'books.json'), searchData.books),
      writeJSON(path.join(dataDir, 'characters.json'), searchData.characters),
      writeJSON(path.join(dataDir, 'categories.json'), searchData.categories),
      writeJSON(path.join(dataDir, 'search-data.json'), searchData)
    ]);
    
    console.log('✅ Search data generated successfully');
    console.log(`📊 Stats:`);
    console.log(`   - Books: ${searchData.books.length}`);
    console.log(`   - Characters: ${searchData.characters.length}`);
    console.log(`   - Categories: ${searchData.categories.length}`);
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

// Run the generator
if (require.main === module) {
  generateSearchData();
}

module.exports = { generateSearchData };