#!/usr/bin/env node

/**
 * Incremental Build System for Bible Explorer
 * 
 * Only rebuilds changed files to dramatically reduce build times
 * Tracks file dependencies and intelligently invalidates cache
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { ScalabilityOptimizer } = require('./scalability-optimizer.js');

class IncrementalBuilder {
  constructor() {
    this.optimizer = new ScalabilityOptimizer();
    this.dependencyGraph = new Map();
    this.buildManifest = {
      lastBuild: null,
      fileHashes: {},
      dependencies: {},
      buildOrder: []
    };
    this.manifestFile = '.cache/build-manifest.json';
    this.changedFiles = new Set();
    this.filesToRebuild = new Set();
  }

  async initialize() {
    console.log('🔄 Initializing incremental build system...');
    
    await this.optimizer.initialize();
    this.loadBuildManifest();
    this.buildDependencyGraph();
  }

  loadBuildManifest() {
    try {
      if (fs.existsSync(this.manifestFile)) {
        this.buildManifest = JSON.parse(fs.readFileSync(this.manifestFile, 'utf8'));
        console.log(`   Loaded manifest with ${Object.keys(this.buildManifest.fileHashes).length} tracked files`);
      }
    } catch (error) {
      console.warn('   Warning: Could not load build manifest:', error.message);
    }
  }

  saveBuildManifest() {
    try {
      // Ensure cache directory exists
      const cacheDir = path.dirname(this.manifestFile);
      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
      }
      
      this.buildManifest.lastBuild = new Date().toISOString();
      fs.writeFileSync(this.manifestFile, JSON.stringify(this.buildManifest, null, 2));
    } catch (error) {
      console.error('Error saving build manifest:', error.message);
    }
  }

  // Build dependency graph to track file relationships
  buildDependencyGraph() {
    const dependencies = {
      // Data dependencies
      'src/_data/books.json': [
        'src/books.njk',
        'src/categories.njk',
        'src/assets/data/books.json'
      ],
      
      // Template dependencies
      'src/_includes/layouts/base.njk': [
        'src/**/*.njk' // All pages depend on base layout
      ],
      
      'src/_includes/layouts/base-minimal.njk': [
        'src/genealogy.njk',
        'src/links.njk'
      ],
      
      // Entity dependencies
      'data/source-datasets/Bible_combined_all_expanded.with_ids.v2.json': [
        'src/assets/data/entities/**/*.json',
        'src/assets/data/entities-search.json',
        'src/entities.njk'
      ],
      
      // Script dependencies
      'src/assets/search-engine.js': [
        'src/assets/search-interface.js'
      ],
      
      'src/assets/chapter-reader.js': [
        'src/_includes/layouts/book.njk'
      ],
      
      'src/assets/entity-relationship-visualizer.js': [
        'src/entities.njk'
      ]
    };
    
    // Store in build manifest
    this.buildManifest.dependencies = dependencies;
  }

  // Calculate file hash for change detection
  getFileHash(filePath) {
    try {
      if (!fs.existsSync(filePath)) return null;
      const stats = fs.statSync(filePath);
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Include both content and modification time for more reliable detection
      const hashInput = `${content}:${stats.mtime.getTime()}`;
      return crypto.createHash('sha256').update(hashInput).digest('hex');
    } catch (error) {
      console.warn(`Warning: Could not hash file ${filePath}:`, error.message);
      return null;
    }
  }

  // Check which files have changed since last build
  detectChangedFiles() {
    console.log('🔍 Detecting changed files...');
    
    const filesToCheck = [
      // Core data files
      'src/_data/books.json',
      'data/source-datasets/Bible_combined_all_expanded.with_ids.v2.json',
      'data/source-datasets/Bible_id_redirect_map.v2.json',
      
      // Layout templates
      'src/_includes/layouts/base.njk',
      'src/_includes/layouts/base-minimal.njk',
      'src/_includes/layouts/book.njk',
      'src/_includes/layouts/category.njk',
      
      // Page templates
      'src/books.njk',
      'src/categories.njk',
      'src/entities.njk',
      'src/genealogy.njk',
      'src/gospel-thread.njk',
      
      // JavaScript assets
      'src/assets/search-engine.js',
      'src/assets/search-interface.js',
      'src/assets/chapter-reader.js',
      'src/assets/commentary-reader.js',
      'src/assets/entity-relationship-visualizer.js',
      'src/assets/genealogy-explorer.js',
      
      // Styles
      'src/styles.css'
    ];
    
    this.changedFiles.clear();
    
    for (const file of filesToCheck) {
      if (!fs.existsSync(file)) continue;
      
      const currentHash = this.getFileHash(file);
      const previousHash = this.buildManifest.fileHashes[file];
      
      if (!previousHash || currentHash !== previousHash) {
        this.changedFiles.add(file);
        this.buildManifest.fileHashes[file] = currentHash;
        console.log(`   Changed: ${file}`);
      }
    }
    
    if (this.changedFiles.size === 0) {
      console.log('   No changes detected');
      return false;
    }
    
    console.log(`   Found ${this.changedFiles.size} changed files`);
    return true;
  }

  // Calculate which files need to be rebuilt based on dependencies
  calculateFilesToRebuild() {
    console.log('📋 Calculating files to rebuild...');
    
    this.filesToRebuild.clear();
    
    // Add all changed files
    for (const file of this.changedFiles) {
      this.filesToRebuild.add(file);
      
      // Add dependent files
      const dependents = this.buildManifest.dependencies[file] || [];
      for (const dependent of dependents) {
        if (dependent.includes('**')) {
          // Handle glob patterns
          this.addGlobMatches(dependent);
        } else {
          this.filesToRebuild.add(dependent);
        }
      }
    }
    
    console.log(`   Will rebuild ${this.filesToRebuild.size} files/patterns`);
    return Array.from(this.filesToRebuild);
  }

  addGlobMatches(pattern) {
    // Simple glob matching for common patterns
    if (pattern === 'src/**/*.njk') {
      // Find all .njk files in src directory
      this.findFiles('src', '.njk').forEach(file => {
        this.filesToRebuild.add(file);
      });
    }
    
    if (pattern === 'src/assets/data/entities/**/*.json') {
      this.filesToRebuild.add('entities-data-rebuild');
    }
  }

  findFiles(dir, extension) {
    const files = [];
    
    if (!fs.existsSync(dir)) return files;
    
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stats = fs.statSync(fullPath);
      
      if (stats.isDirectory()) {
        files.push(...this.findFiles(fullPath, extension));
      } else if (fullPath.endsWith(extension)) {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  // Execute incremental build
  async executeBuild() {
    const buildStartTime = Date.now();
    console.log('🚀 Starting incremental build...');
    
    const hasChanges = this.detectChangedFiles();
    if (!hasChanges) {
      console.log('✅ No changes detected, skipping build');
      return { skipped: true, reason: 'no-changes' };
    }
    
    const filesToRebuild = this.calculateFilesToRebuild();
    
    // Determine build strategy
    const buildStrategy = this.determineBuildStrategy(filesToRebuild);
    console.log(`   Build strategy: ${buildStrategy.type}`);
    
    let buildResult;
    
    switch (buildStrategy.type) {
      case 'entity-only':
        buildResult = await this.buildEntitiesOnly();
        break;
        
      case 'templates-only': 
        buildResult = await this.buildTemplatesOnly(buildStrategy.templates);
        break;
        
      case 'partial':
        buildResult = await this.buildPartial(buildStrategy.components);
        break;
        
      case 'full':
      default:
        buildResult = await this.buildFull();
        break;
    }
    
    // Save build manifest
    this.saveBuildManifest();
    
    const buildTime = Date.now() - buildStartTime;
    console.log(`✅ Incremental build completed in ${buildTime}ms`);
    
    return {
      ...buildResult,
      buildTime,
      strategy: buildStrategy.type,
      filesChanged: this.changedFiles.size,
      filesRebuilt: filesToRebuild.length
    };
  }

  determineBuildStrategy(filesToRebuild) {
    // Entity data only
    if (filesToRebuild.some(f => f.includes('Bible_combined_all_expanded')) &&
        !filesToRebuild.some(f => f.includes('src/'))) {
      return { type: 'entity-only' };
    }
    
    // Templates only
    const templateFiles = filesToRebuild.filter(f => f.includes('.njk'));
    if (templateFiles.length > 0 && templateFiles.length < 5) {
      return { type: 'templates-only', templates: templateFiles };
    }
    
    // Partial build
    if (filesToRebuild.length < 10) {
      return { type: 'partial', components: filesToRebuild };
    }
    
    // Full build
    return { type: 'full' };
  }

  async buildEntitiesOnly() {
    console.log('🔧 Building entities only...');
    
    const { processEntities } = require('./entity-utils/entity-processor.js');
    await processEntities();
    
    return { type: 'entity-only', filesGenerated: 5514 };
  }

  async buildTemplatesOnly(templates) {
    console.log(`🔧 Building ${templates.length} templates only...`);
    
    // Use Eleventy's incremental build if available
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);
    
    try {
      const result = await execAsync('npx @11ty/eleventy --incremental');
      return { 
        type: 'templates-only', 
        output: result.stdout,
        filesGenerated: this.parseEleventyOutput(result.stdout)
      };
    } catch (error) {
      console.error('Template build failed:', error.message);
      return { type: 'templates-only', error: error.message };
    }
  }

  async buildPartial(components) {
    console.log(`🔧 Partial build of ${components.length} components...`);
    
    // Build only specific components
    const results = [];
    
    for (const component of components) {
      if (component.includes('entity')) {
        const entityResult = await this.buildEntitiesOnly();
        results.push(entityResult);
      } else {
        // Use selective template building
        const templateResult = await this.buildTemplatesOnly([component]);
        results.push(templateResult);
      }
    }
    
    return { 
      type: 'partial', 
      components: results,
      filesGenerated: results.reduce((sum, r) => sum + (r.filesGenerated || 0), 0)
    };
  }

  async buildFull() {
    console.log('🔧 Full build required...');
    
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);
    
    try {
      // Run full build
      const result = await execAsync('npm run build');
      return { 
        type: 'full', 
        output: result.stdout,
        filesGenerated: this.parseEleventyOutput(result.stdout)
      };
    } catch (error) {
      console.error('Full build failed:', error.message);
      return { type: 'full', error: error.message };
    }
  }

  parseEleventyOutput(output) {
    const match = output.match(/Wrote (\d+) files/);
    return match ? parseInt(match[1], 10) : 0;
  }
}

// Export for use in other scripts
module.exports = { IncrementalBuilder };

// CLI execution
if (require.main === module) {
  const builder = new IncrementalBuilder();
  
  async function main() {
    try {
      await builder.initialize();
      const result = await builder.executeBuild();
      
      if (result.skipped) {
        console.log(`Skipped: ${result.reason}`);
        process.exit(0);
      }
      
      console.log(`Build completed: ${result.strategy} strategy`);
      console.log(`Files changed: ${result.filesChanged}`);
      console.log(`Files rebuilt: ${result.filesRebuilt}`);
      console.log(`Build time: ${result.buildTime}ms`);
      
    } catch (error) {
      console.error('❌ Incremental build failed:', error);
      process.exit(1);
    }
  }
  
  main();
}