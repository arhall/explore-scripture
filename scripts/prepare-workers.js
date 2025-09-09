#!/usr/bin/env node

/**
 * Prepare Explore Scripture for Cloudflare Workers deployment
 * This script optimizes the build for edge computing
 */

const fs = require('fs');
const path = require('path');

const SITE_DIR = '_site';
const ASSETS_DIR = path.join(SITE_DIR, 'assets');
const DATA_DIR = path.join(ASSETS_DIR, 'data');

console.log('🚀 Preparing Explore Scripture for Cloudflare Workers...');

async function main() {
  // 1. Optimize service worker for Workers environment
  optimizeServiceWorker();
  
  // 2. Create Workers-specific manifest
  createWorkersManifest();
  
  // 3. Optimize data files for KV storage
  await optimizeDataFiles();
  
  // 4. Create deployment summary
  createDeploymentSummary();
  
  console.log('✅ Workers preparation complete!');
}

function optimizeServiceWorker() {
  console.log('📝 Optimizing service worker...');
  
  const swPath = path.join(SITE_DIR, 'sw.js');
  
  if (fs.existsSync(swPath)) {
    let swContent = fs.readFileSync(swPath, 'utf8');
    
    // Disable service worker in Workers environment (redundant)
    const workersSwContent = `
// Service Worker disabled in Cloudflare Workers environment
// Workers provides built-in caching and optimization

if (typeof window !== 'undefined' && !window.location.hostname.includes('workers.dev')) {
${swContent}
} else {
  console.log('[SW] Skipped: Running in Cloudflare Workers environment');
}
`;
    
    fs.writeFileSync(swPath, workersSwContent);
    console.log('   ✓ Service worker optimized for Workers');
  }
}

function createWorkersManifest() {
  console.log('📋 Creating Workers manifest...');
  
  const manifest = {
    name: 'Explore Scripture',
    version: '1.0.0',
    description: 'Interactive Scripture study platform optimized for Cloudflare Workers',
    deployment: {
      platform: 'cloudflare-workers',
      optimizations: [
        'KV storage for entities',
        'Edge caching',
        'Smart preloading',
        'Analytics integration'
      ]
    },
    routes: {
      api: ['/api/*'],
      assets: ['/assets/*'],
      pages: ['/', '/books/*', '/categories/*', '/entities/*', '/gospel-thread']
    },
    caching: {
      static: '1 year',
      data: '24 hours',
      api: '5 minutes'
    },
    features: [
      '5,500+ biblical entities',
      '66 biblical books',
      'Real-time search',
      'Multiple translations',
      'Commentary integration',
      'Progressive Web App'
    ]
  };
  
  fs.writeFileSync(
    path.join(SITE_DIR, 'workers-manifest.json'),
    JSON.stringify(manifest, null, 2)
  );
  
  console.log('   ✓ Workers manifest created');
}

async function optimizeDataFiles() {
  console.log('🗂️  Optimizing data files for KV storage...');
  
  if (!fs.existsSync(DATA_DIR)) {
    console.warn('   ⚠️  Data directory not found, skipping optimization');
    return;
  }
  
  const stats = {
    totalFiles: 0,
    totalSize: 0,
    entityFiles: 0,
    searchFiles: 0,
    bookFiles: 0
  };
  
  // Create KV upload manifest
  const kvManifest = {
    entities: [],
    searchData: [],
    bookData: [],
    metadata: {
      generated: new Date().toISOString(),
      version: '1.0.0'
    }
  };
  
  // Process entity files
  const entitiesDir = path.join(DATA_DIR, 'entities');
  if (fs.existsSync(entitiesDir)) {
    const entityFiles = fs.readdirSync(entitiesDir);
    
    for (const file of entityFiles) {
      if (file.endsWith('.json')) {
        const filePath = path.join(entitiesDir, file);
        const fileStats = fs.statSync(filePath);
        const entityId = file.replace('.json', '');
        
        kvManifest.entities.push({
          key: `entity:${entityId}`,
          file: `entities/${file}`,
          size: fileStats.size
        });
        
        stats.entityFiles++;
        stats.totalSize += fileStats.size;
      }
    }
  }
  
  // Process search data files
  const searchFiles = ['books.json', 'categories.json', 'entities-search.json', 'search-data.json'];
  for (const file of searchFiles) {
    const filePath = path.join(DATA_DIR, file);
    if (fs.existsSync(filePath)) {
      const fileStats = fs.statSync(filePath);
      
      kvManifest.searchData.push({
        key: `search:${file.replace('.json', '')}`,
        file: file,
        size: fileStats.size
      });
      
      stats.searchFiles++;
      stats.totalSize += fileStats.size;
    }
  }
  
  // Process book data files
  const booksDir = path.join(DATA_DIR, 'books');
  if (fs.existsSync(booksDir)) {
    const bookFiles = fs.readdirSync(booksDir);
    
    for (const file of bookFiles) {
      if (file.endsWith('.json')) {
        const filePath = path.join(booksDir, file);
        const fileStats = fs.statSync(filePath);
        
        kvManifest.bookData.push({
          key: `book:${file.replace('.json', '')}`,
          file: `books/${file}`,
          size: fileStats.size
        });
        
        stats.bookFiles++;
        stats.totalSize += fileStats.size;
      }
    }
  }
  
  stats.totalFiles = stats.entityFiles + stats.searchFiles + stats.bookFiles;
  
  // Save KV manifest
  fs.writeFileSync(
    path.join(SITE_DIR, 'kv-manifest.json'),
    JSON.stringify(kvManifest, null, 2)
  );
  
  console.log('   ✓ KV manifest created');
  console.log(`   📊 Processed ${stats.totalFiles} files (${(stats.totalSize / 1024 / 1024).toFixed(2)}MB)`);
  console.log(`      - Entities: ${stats.entityFiles} files`);
  console.log(`      - Search data: ${stats.searchFiles} files`);
  console.log(`      - Book data: ${stats.bookFiles} files`);
}

function createDeploymentSummary() {
  console.log('📈 Creating deployment summary...');
  
  const summary = {
    timestamp: new Date().toISOString(),
    platform: 'Cloudflare Workers',
    project: 'Explore Scripture',
    optimizations: {
      serviceWorker: 'Disabled (redundant with Workers)',
      caching: 'KV storage + Edge caching',
      routing: 'itty-router with smart routing',
      security: 'CSP + Security headers',
      analytics: 'Analytics Engine integration'
    },
    deployment: {
      commands: [
        'npm install',
        'npm run build:workers',
        'wrangler kv:namespace create CACHE',
        'wrangler kv:namespace create ENTITIES',
        'npm run workers:kv:upload',
        'wrangler deploy'
      ],
      environment: {
        required: [
          'CLOUDFLARE_ACCOUNT_ID',
          'CLOUDFLARE_API_TOKEN'
        ],
        optional: [
          'ESV_API_KEY (for ESV Scripture API)'
        ]
      }
    },
    features: [
      'Edge computing with global distribution',
      'KV storage for fast entity lookups',
      'Smart caching strategies',
      'Security headers and CSP',
      'Analytics and monitoring',
      'API route handling',
      'Static asset optimization'
    ]
  };
  
  fs.writeFileSync(
    path.join(SITE_DIR, 'deployment-summary.json'),
    JSON.stringify(summary, null, 2)
  );
  
  console.log('   ✓ Deployment summary created');
  
  // Print next steps
  console.log('\\n🎯 Next Steps:');
  console.log('1. Install Wrangler CLI: npm install -g wrangler');
  console.log('2. Login to Cloudflare: wrangler login');
  console.log('3. Update wrangler.toml with your account ID');
  console.log('4. Create KV namespaces: npm run workers:kv:create');
  console.log('5. Upload data to KV: npm run workers:kv:upload');
  console.log('6. Deploy to Workers: npm run workers:deploy');
}

// Run the script
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Workers preparation failed:', error);
    process.exit(1);
  });
}

module.exports = { main };