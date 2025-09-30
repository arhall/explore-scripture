#!/usr/bin/env node

/**
 * Scalability Optimizer for Bible Explorer
 *
 * Implements various optimizations for improved scalability:
 * - Incremental builds
 * - Chunked data loading
 * - Bundle optimization
 * - Memory management
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class ScalabilityOptimizer {
  constructor() {
    this.cacheDir = '.cache';
    this.buildCacheFile = path.join(this.cacheDir, 'build-cache.json');
    this.chunkSize = 100; // Entities per chunk
    this.maxMemoryUsage = 512 * 1024 * 1024; // 512MB limit
  }

  async initialize() {
    console.log('🚀 Initializing Scalability Optimizer...');

    // Create cache directory
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }

    // Load existing build cache
    this.buildCache = this.loadBuildCache();
  }

  loadBuildCache() {
    try {
      if (fs.existsSync(this.buildCacheFile)) {
        return JSON.parse(fs.readFileSync(this.buildCacheFile, 'utf8'));
      }
    } catch (error) {
      console.warn('Warning: Could not load build cache:', error.message);
    }
    return {
      lastBuild: null,
      fileHashes: {},
      chunkManifest: {},
      buildStats: {},
    };
  }

  saveBuildCache() {
    try {
      fs.writeFileSync(this.buildCacheFile, JSON.stringify(this.buildCache, null, 2));
    } catch (error) {
      console.error('Error saving build cache:', error.message);
    }
  }

  // Calculate file hash for incremental build detection
  getFileHash(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      return crypto.createHash('md5').update(content).digest('hex');
    } catch (error) {
      return null;
    }
  }

  // Check if incremental build is possible
  shouldRebuild(filePath) {
    const currentHash = this.getFileHash(filePath);
    const cachedHash = this.buildCache.fileHashes[filePath];

    if (!currentHash || !cachedHash || currentHash !== cachedHash) {
      this.buildCache.fileHashes[filePath] = currentHash;
      return true;
    }
    return false;
  }

  // Optimize entity data into chunks for better loading performance
  async optimizeEntityChunks(entitiesData) {
    console.log('📦 Creating optimized entity chunks...');

    const chunks = [];
    const chunkManifest = {
      totalEntities: entitiesData.length,
      chunkSize: this.chunkSize,
      chunks: [],
      index: {}, // Fast lookup: entityId -> chunkId
    };

    // Sort entities by popularity (reference count) for better caching
    const sortedEntities = entitiesData.sort((a, b) => (b.refs_count || 0) - (a.refs_count || 0));

    // Create chunks
    for (let i = 0; i < sortedEntities.length; i += this.chunkSize) {
      const chunkId = Math.floor(i / this.chunkSize);
      const chunkEntities = sortedEntities.slice(i, i + this.chunkSize);

      const chunk = {
        id: chunkId,
        entities: chunkEntities.map(entity => ({
          id: entity.id,
          name: entity.name,
          type: entity.type,
          role: entity.role,
          refs_count: entity.refs_count || 0,
          searchText: entity.searchText || '',
        })),
        size: chunkEntities.length,
        priority: chunkId === 0 ? 'high' : chunkId < 5 ? 'medium' : 'low',
      };

      chunks.push(chunk);

      // Update manifest
      chunkManifest.chunks.push({
        id: chunkId,
        size: chunk.size,
        priority: chunk.priority,
        url: `/assets/data/chunks/entities-${chunkId}.json`,
      });

      // Build index
      chunkEntities.forEach(entity => {
        chunkManifest.index[entity.id] = chunkId;
      });
    }

    return { chunks, manifest: chunkManifest };
  }

  // Generate progressive loading search index
  generateProgressiveSearchIndex(entitiesData) {
    console.log('🔍 Generating progressive search index...');

    // Create tiered search index for progressive loading
    const searchTiers = {
      tier1: [], // Top 200 most referenced entities
      tier2: [], // Next 800 entities
      tier3: [], // Remaining entities
    };

    const sortedByReferences = entitiesData.sort(
      (a, b) => (b.refs_count || 0) - (a.refs_count || 0)
    );

    sortedByReferences.forEach((entity, index) => {
      const searchEntry = {
        id: entity.id,
        name: entity.name,
        type: entity.type,
        role: entity.role,
        refs_count: entity.refs_count || 0,
        searchText: entity.searchText || entity.name.toLowerCase(),
      };

      if (index < 200) {
        searchTiers.tier1.push(searchEntry);
      } else if (index < 1000) {
        searchTiers.tier2.push(searchEntry);
      } else {
        searchTiers.tier3.push(searchEntry);
      }
    });

    return searchTiers;
  }

  // Optimize JavaScript bundles
  async optimizeBundles() {
    console.log('📦 Optimizing JavaScript bundles...');

    const bundleConfig = {
      // Critical path - loaded immediately
      critical: ['theme-manager.js', 'module-loader.js'],

      // High priority - loaded on interaction
      highPriority: ['search-engine.js', 'search-interface.js'],

      // Medium priority - lazy loaded
      mediumPriority: ['chapter-reader.js', 'commentary-reader.js'],

      // Low priority - loaded on demand
      lowPriority: ['entity-relationship-visualizer.js'],

      // External dependencies
      external: {
        d3: 'https://unpkg.com/d3@7/dist/d3.min.js',
      },
    };

    // Generate bundle manifest
    const manifest = {
      version: Date.now().toString(),
      bundles: bundleConfig,
      loadStrategy: {
        critical: 'immediate',
        highPriority: 'on-interaction',
        mediumPriority: 'lazy',
        lowPriority: 'on-demand',
      },
    };

    return manifest;
  }

  // Memory-efficient data processing
  async processWithMemoryLimits(dataProcessor, inputData, options = {}) {
    const batchSize = options.batchSize || 500;
    const memoryCheckInterval = options.memoryCheckInterval || 100;
    const results = [];

    console.log(`🧠 Processing ${inputData.length} items with memory limits...`);

    for (let i = 0; i < inputData.length; i += batchSize) {
      const batch = inputData.slice(i, i + batchSize);

      // Process batch
      const batchResults = await dataProcessor(batch);
      results.push(...batchResults);

      // Memory check
      if (i % (memoryCheckInterval * batchSize) === 0) {
        const memUsage = process.memoryUsage();
        const memUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);

        console.log(`  Memory: ${memUsedMB}MB used`);

        if (memUsage.heapUsed > this.maxMemoryUsage) {
          console.log('  Triggering garbage collection...');
          if (global.gc) global.gc();
        }
      }
    }

    return results;
  }

  // Generate build performance report
  generatePerformanceReport(buildStats) {
    const report = {
      timestamp: new Date().toISOString(),
      buildTime: buildStats.totalTime,
      filesGenerated: buildStats.filesGenerated,
      avgTimePerFile: buildStats.totalTime / buildStats.filesGenerated,
      memoryPeakUsage: buildStats.memoryPeakUsage,
      optimizations: {
        incrementalBuild: buildStats.incrementalBuild,
        chunkedData: buildStats.chunkedData,
        bundleOptimization: buildStats.bundleOptimization,
        memoryManagement: buildStats.memoryManagement,
      },
      recommendations: this.generateRecommendations(buildStats),
    };

    return report;
  }

  generateRecommendations(buildStats) {
    const recommendations = [];

    if (buildStats.avgTimePerFile > 5) {
      recommendations.push({
        type: 'performance',
        priority: 'high',
        message: 'Average file generation time is high. Consider increasing batch sizes.',
      });
    }

    if (buildStats.memoryPeakUsage > this.maxMemoryUsage * 0.8) {
      recommendations.push({
        type: 'memory',
        priority: 'medium',
        message: 'Memory usage is approaching limits. Consider reducing batch sizes.',
      });
    }

    if (!buildStats.incrementalBuild) {
      recommendations.push({
        type: 'build',
        priority: 'high',
        message: 'Enable incremental builds to reduce build times for unchanged files.',
      });
    }

    return recommendations;
  }

  // CDN optimization suggestions
  generateCDNStrategy() {
    return {
      staticAssets: {
        // Cache static assets for 1 year
        cacheControl: 'public, max-age=31536000, immutable',
        files: ['*.js', '*.css', '*.svg', '*.png', '*.jpg', '*.woff2'],
      },

      dataFiles: {
        // Cache data files for 1 hour with revalidation
        cacheControl: 'public, max-age=3600, must-revalidate',
        files: ['/assets/data/**/*.json'],
      },

      htmlPages: {
        // Cache HTML for 5 minutes with revalidation
        cacheControl: 'public, max-age=300, must-revalidate',
        files: ['**/*.html'],
      },

      compressionSettings: {
        gzip: true,
        brotli: true,
        minCompressionRatio: 0.8,
      },

      preloadHints: [
        { rel: 'preload', href: '/assets/search-engine.js', as: 'script' },
        { rel: 'preload', href: '/assets/data/entities-search-tier1.json', as: 'fetch' },
        { rel: 'prefetch', href: '/assets/data/entities-search-tier2.json' },
      ],
    };
  }
}

// Export for use in build scripts
module.exports = { ScalabilityOptimizer };

// CLI execution
if (require.main === module) {
  const optimizer = new ScalabilityOptimizer();

  async function main() {
    try {
      await optimizer.initialize();
      console.log('✅ Scalability optimizer ready for integration');
    } catch (error) {
      console.error('❌ Optimization failed:', error);
      process.exit(1);
    }
  }

  main();
}
