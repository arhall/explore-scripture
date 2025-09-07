#!/usr/bin/env node

/**
 * Debug Entity References
 * Show sample references from the combined dataset to understand the format
 */

const fs = require('fs');

async function debugReferences() {
  console.log('🔍 Debugging Entity References\n');
  
  try {
    // Load the combined dataset
    const combinedData = JSON.parse(fs.readFileSync('Bible_combined_all_expanded.with_ids.v2.json', 'utf8'));
    
    console.log(`📊 Total entities: ${combinedData.entries.length}\n`);
    
    // Sample the first 20 entities with references
    console.log('📝 Sample entity references:');
    let sampleCount = 0;
    
    for (const entity of combinedData.entries) {
      if (entity.references && Array.isArray(entity.references) && entity.references.length > 0) {
        console.log(`\n👤 ${entity.name} (${entity.type || 'unknown'})`);
        console.log(`   📖 References: ${entity.references.slice(0, 3).join(', ')}${entity.references.length > 3 ? '...' : ''}`);
        
        sampleCount++;
        if (sampleCount >= 10) break;
      }
    }
    
    // Check for specific books
    const targetBooks = ['1 Kings', '2 Samuel', 'Daniel', 'Psalms', 'Lamentations'];
    
    console.log('\n🎯 Looking for target book references:');
    
    for (const bookName of targetBooks) {
      console.log(`\n📖 ${bookName}:`);
      let foundCount = 0;
      
      for (const entity of combinedData.entries) {
        if (entity.references && Array.isArray(entity.references)) {
          const hasBook = entity.references.some(ref => 
            ref.toString().includes(bookName)
          );
          
          if (hasBook) {
            console.log(`   👤 ${entity.name}: ${entity.references.filter(ref => ref.toString().includes(bookName)).join(', ')}`);
            foundCount++;
            if (foundCount >= 5) break; // Show first 5 matches
          }
        }
      }
      
      if (foundCount === 0) {
        console.log(`   ❌ No entities found with ${bookName} references`);
      } else {
        console.log(`   ✅ Found ${foundCount}+ entities with ${bookName} references`);
      }
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    process.exit(1);
  }
}

// Run the debug
debugReferences().catch(error => {
  console.error('❌ Debug failed:', error);
  process.exit(1);
});