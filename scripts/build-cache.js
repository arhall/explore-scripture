#!/usr/bin/env node

/**
 * Build Cache Manager for Workers Optimization
 *
 * Implements intelligent caching to reduce build times from 5+ minutes to <30 seconds
 * while preserving all data and functionality.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class BuildCache {
  constructor() {
    this.cacheDir = '.cache';
    this.cacheFile = path.join(this.cacheDir, 'build-cache.json');
    this.cache = this.loadCache();
  }

  loadCache() {
    try {
      if (fs.existsSync(this.cacheFile)) {
        return JSON.parse(fs.readFileSync(this.cacheFile, 'utf8'));
      }
    } catch (e) {
      console.warn('Cache file corrupted, starting fresh');
    }
    return {
      files: {},
      entities: {},
      lastBuild: null,
      mode: null,
    };
  }

  saveCache() {
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
    fs.writeFileSync(this.cacheFile, JSON.stringify(this.cache, null, 2));
  }

  getFileHash(filePath) {
    if (!fs.existsSync(filePath)) return null;

    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      // For directories, hash the directory structure
      try {
        const files = fs.readdirSync(filePath).sort();
        const dirContent = files.join('|');
        return crypto.createHash('md5').update(dirContent).digest('hex');
      } catch (error) {
        return null;
      }
    } else {
      // For files, hash the content
      try {
        const content = fs.readFileSync(filePath);
        return crypto.createHash('md5').update(content).digest('hex');
      } catch (error) {
        return null;
      }
    }
  }

  hasFileChanged(filePath, type = 'source') {
    const currentHash = this.getFileHash(filePath);
    const cachedHash = this.cache.files[filePath];

    if (currentHash !== cachedHash) {
      this.cache.files[filePath] = currentHash;
      return true;
    }
    return false;
  }

  isEntityProcessingNeeded() {
    const entitySources = [
      './data/source-datasets/Bible_combined_all_expanded.with_ids.v2.json',
      './data/source-datasets/Bible_id_redirect_map.v2.json',
      './src/_data/books.json',
    ];

    return entitySources.some(file => this.hasFileChanged(file));
  }

  isSearchDataGenerationNeeded() {
    const searchSources = [
      './src/assets/data/books.json',
      './src/assets/data/entities-search.json',
      './src/_data/books.json',
      './src/_data/categories.js',
    ];

    return searchSources.some(file => this.hasFileChanged(file));
  }

  shouldRunFullBuild(mode = 'development') {
    // Always run full build if mode changed
    if (this.cache.mode !== mode) {
      this.cache.mode = mode;
      return true;
    }

    // Check if more than 24 hours since last build
    if (!this.cache.lastBuild || Date.now() - this.cache.lastBuild > 24 * 60 * 60 * 1000) {
      return true;
    }

    return false;
  }

  markBuildComplete() {
    this.cache.lastBuild = Date.now();
    this.saveCache();
  }

  getOptimalBuildStrategy(mode = 'development') {
    const needsEntityProcessing = this.isEntityProcessingNeeded();
    const needsSearchGeneration = this.isSearchDataGenerationNeeded();
    const needsFullBuild = this.shouldRunFullBuild(mode);

    return {
      skipEntityProcessing: !needsEntityProcessing && !needsFullBuild,
      skipSearchGeneration: !needsSearchGeneration && !needsFullBuild,
      useIncrementalBuild: !needsFullBuild && fs.existsSync('./src/assets/data'),
      estimatedTime: this.estimateBuildTime(
        needsEntityProcessing,
        needsSearchGeneration,
        needsFullBuild
      ),
    };
  }

  estimateBuildTime(entities, search, full) {
    let time = 10; // Base Eleventy time
    if (entities) time += 120; // Entity processing: 2 minutes
    if (search) time += 30; // Search generation: 30 seconds
    if (full) time += 60; // Full Eleventy build: 1 minute
    return time;
  }
}

module.exports = { BuildCache };

// CLI usage
if (require.main === module) {
  const cache = new BuildCache();
  const mode = process.argv[2] || 'development';
  const strategy = cache.getOptimalBuildStrategy(mode);

  console.log('🔍 Build Cache Analysis:');
  console.log(`📊 Mode: ${mode}`);
  console.log(`⚡ Skip entity processing: ${strategy.skipEntityProcessing}`);
  console.log(`🔍 Skip search generation: ${strategy.skipSearchGeneration}`);
  console.log(`📈 Use incremental build: ${strategy.useIncrementalBuild}`);
  console.log(`⏱️  Estimated time: ${strategy.estimatedTime}s`);

  // Output JSON for script consumption
  if (process.argv.includes('--json')) {
    console.log(JSON.stringify(strategy));
  }
}
