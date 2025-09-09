#!/usr/bin/env node

/**
 * Upload Explore Scripture data to Cloudflare KV storage
 * This script uploads entity data and search indices to KV for fast edge access
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SITE_DIR = '_site';
const DATA_DIR = path.join(SITE_DIR, 'assets', 'data');

console.log('📦 Uploading Explore Scripture data to Cloudflare KV...');

async function main() {
  // Check if KV manifest exists
  const kvManifestPath = path.join(SITE_DIR, 'kv-manifest.json');
  
  if (!fs.existsSync(kvManifestPath)) {
    throw new Error('KV manifest not found. Run `npm run workers:prepare` first.');
  }
  
  const kvManifest = JSON.parse(fs.readFileSync(kvManifestPath, 'utf8'));
  
  console.log('📊 Upload Summary:');
  console.log(`   - Entities: ${kvManifest.entities.length} files`);
  console.log(`   - Search data: ${kvManifest.searchData.length} files`);
  console.log(`   - Book data: ${kvManifest.bookData.length} files`);
  
  // Upload entities to ENTITIES namespace
  if (kvManifest.entities.length > 0) {
    console.log('\\n🔄 Uploading entities...');
    await uploadEntities(kvManifest.entities);
  }
  
  // Upload search data to CACHE namespace
  if (kvManifest.searchData.length > 0) {
    console.log('\\n🔍 Uploading search data...');
    await uploadSearchData(kvManifest.searchData);
  }
  
  // Upload book data to CACHE namespace
  if (kvManifest.bookData.length > 0) {
    console.log('\\n📚 Uploading book data...');
    await uploadBookData(kvManifest.bookData);
  }
  
  console.log('\\n✅ KV upload complete!');
  
  // Create upload summary
  createUploadSummary(kvManifest);
}

async function uploadEntities(entities) {
  const batchSize = 50; // Upload in batches to avoid API limits
  let uploaded = 0;
  
  for (let i = 0; i < entities.length; i += batchSize) {
    const batch = entities.slice(i, i + batchSize);
    
    console.log(`   Uploading batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(entities.length / batchSize)} (${batch.length} files)`);
    
    for (const entity of batch) {
      const filePath = path.join(DATA_DIR, entity.file);
      
      if (fs.existsSync(filePath)) {
        try {
          const command = `wrangler kv:key put "${entity.key}" --path="${filePath}" --binding=ENTITIES`;
          execSync(command, { stdio: 'pipe' });
          uploaded++;
          
          // Progress indicator
          if (uploaded % 100 === 0) {
            console.log(`     ✓ ${uploaded}/${entities.length} entities uploaded`);
          }
        } catch (error) {
          console.warn(`     ⚠️  Failed to upload ${entity.key}:`, error.message);
        }
      }
    }
    
    // Brief pause between batches to respect rate limits
    if (i + batchSize < entities.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  console.log(`   ✅ Uploaded ${uploaded}/${entities.length} entities to KV`);
}

async function uploadSearchData(searchFiles) {
  let uploaded = 0;
  
  for (const searchFile of searchFiles) {
    const filePath = path.join(DATA_DIR, searchFile.file);
    
    if (fs.existsSync(filePath)) {
      try {
        const command = `wrangler kv:key put "${searchFile.key}" --path="${filePath}" --binding=CACHE`;
        execSync(command, { stdio: 'pipe' });
        uploaded++;
        
        console.log(`   ✓ Uploaded ${searchFile.key}`);
      } catch (error) {
        console.warn(`   ⚠️  Failed to upload ${searchFile.key}:`, error.message);
      }
    }
  }
  
  console.log(`   ✅ Uploaded ${uploaded}/${searchFiles.length} search data files to KV`);
}

async function uploadBookData(bookFiles) {
  let uploaded = 0;
  
  for (const bookFile of bookFiles) {
    const filePath = path.join(DATA_DIR, bookFile.file);
    
    if (fs.existsSync(filePath)) {
      try {
        const command = `wrangler kv:key put "${bookFile.key}" --path="${filePath}" --binding=CACHE`;
        execSync(command, { stdio: 'pipe' });
        uploaded++;
        
        console.log(`   ✓ Uploaded ${bookFile.key}`);
      } catch (error) {
        console.warn(`   ⚠️  Failed to upload ${bookFile.key}:`, error.message);
      }
    }
  }
  
  console.log(`   ✅ Uploaded ${uploaded}/${bookFiles.length} book data files to KV`);
}

function createUploadSummary(kvManifest) {
  const summary = {
    timestamp: new Date().toISOString(),
    upload: {
      entities: kvManifest.entities.length,
      searchData: kvManifest.searchData.length,
      bookData: kvManifest.bookData.length,
      total: kvManifest.entities.length + kvManifest.searchData.length + kvManifest.bookData.length
    },
    kvNamespaces: {
      ENTITIES: 'Contains all 5,500+ biblical entity data',
      CACHE: 'Contains search indices and book data'
    },
    performance: {
      entityLookups: 'Sub-millisecond from edge locations worldwide',
      searchQueries: 'Cached at edge for instant results',
      bookData: 'Fast chapter and summary access'
    },
    nextSteps: [
      'Deploy worker with: npm run workers:deploy',
      'Test deployment with: curl https://your-worker.your-subdomain.workers.dev/',
      'Monitor analytics in Cloudflare dashboard'
    ]
  };
  
  fs.writeFileSync(
    path.join(SITE_DIR, 'kv-upload-summary.json'),
    JSON.stringify(summary, null, 2)
  );
  
  console.log('\\n📋 Upload summary saved to kv-upload-summary.json');
}

// Error handling wrapper
async function safeExecSync(command) {
  try {
    return execSync(command, { stdio: 'pipe' }).toString();
  } catch (error) {
    throw new Error(`Command failed: ${command}\\n${error.message}`);
  }
}

// Validate Wrangler installation
function validateWrangler() {
  try {
    execSync('wrangler --version', { stdio: 'pipe' });
  } catch (error) {
    throw new Error('Wrangler CLI not found. Install with: npm install -g wrangler');
  }
}

// Pre-flight checks
function preflightChecks() {
  console.log('🔍 Running pre-flight checks...');
  
  // Check Wrangler installation
  validateWrangler();
  console.log('   ✓ Wrangler CLI found');
  
  // Check authentication
  try {
    execSync('wrangler whoami', { stdio: 'pipe' });
    console.log('   ✓ Cloudflare authentication verified');
  } catch (error) {
    throw new Error('Not authenticated with Cloudflare. Run: wrangler login');
  }
  
  // Check data directory
  if (!fs.existsSync(DATA_DIR)) {
    throw new Error('Data directory not found. Run: npm run build:workers');
  }
  console.log('   ✓ Data directory exists');
  
  console.log('   ✅ Pre-flight checks passed');
}

// Run the script
if (require.main === module) {
  preflightChecks();
  
  main().catch(error => {
    console.error('\\n❌ KV upload failed:', error.message);
    console.error('\\n💡 Troubleshooting:');
    console.error('   1. Ensure you\\'re logged in: wrangler login');
    console.error('   2. Check your wrangler.toml configuration');
    console.error('   3. Verify KV namespaces exist: wrangler kv:namespace list');
    console.error('   4. Run build first: npm run build:workers');
    process.exit(1);
  });
}

module.exports = { main, uploadEntities, uploadSearchData, uploadBookData };