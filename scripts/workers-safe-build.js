#!/usr/bin/env node

/**
 * Workers Safe Build
 *
 * Builds the site for Cloudflare Workers development without triggering
 * infinite rebuild loops by avoiding writes to watched directories
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

class WorkersSafeBuild {
  constructor() {
    this.tempDataDir = './tmp/data';
    this.outputDir = '_site';
  }

  async createTempDataStructure() {
    console.log('📁 Creating temporary data structure...');

    // Create temp directory
    if (fs.existsSync(this.tempDataDir)) {
      fs.rmSync(this.tempDataDir, { recursive: true });
    }
    fs.mkdirSync(this.tempDataDir, { recursive: true });

    // Copy existing data files to temp location
    const dataDir = './src/assets/data';
    if (fs.existsSync(dataDir)) {
      await this.copyDirectory(dataDir, this.tempDataDir);
    }

    console.log('✅ Temporary data structure created');
  }

  async copyDirectory(src, dest) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }

    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        await this.copyDirectory(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }

  async runCommand(command, args = []) {
    return new Promise((resolve, reject) => {
      console.log(`🚀 Running: ${command} ${args.join(' ')}`);

      const child = spawn(command, args, {
        stdio: 'inherit',
        shell: false, // Disable shell to prevent hanging
      });

      // Add timeout to prevent hanging
      const timeout = setTimeout(() => {
        child.kill('SIGTERM');
        reject(new Error('Command timeout'));
      }, 60000); // 60 second timeout

      child.on('exit', code => {
        clearTimeout(timeout);
        if (code === 0) {
          resolve(code);
        } else {
          reject(new Error(`Command failed with code ${code}`));
        }
      });

      child.on('error', error => {
        clearTimeout(timeout);
        reject(error);
      });
    });
  }

  async buildWithoutWatching() {
    console.log('🔨 Building site without triggering file watchers...');

    try {
      // Set environment variables to use temp data
      process.env.TEMP_BUILD = 'true';
      process.env.DATA_DIR = this.tempDataDir;

      // Run optimized entity processing (outputs to temp)
      await this.runCommand('node', ['scripts/optimized-entity-processor.js', 'development']);

      // Generate search data from temp
      await this.runCommand('node', ['generate-search-data.js']);

      // Run Eleventy build
      await this.runCommand('npx', ['eleventy', '--config=.eleventy.js']);

      // Optimize HTML
      await this.runCommand('npm', ['run', 'optimize:html']);

      // Prepare workers files
      await this.runCommand('node', ['scripts/prepare-workers.js']);

      console.log('✅ Safe build completed');
    } catch (error) {
      console.error('❌ Build failed:', error.message);
      throw error;
    }
  }

  async cleanup() {
    console.log('🧹 Cleaning up temporary files...');

    if (fs.existsSync('./tmp')) {
      fs.rmSync('./tmp', { recursive: true });
    }

    console.log('✅ Cleanup completed');
  }

  async run() {
    try {
      await this.createTempDataStructure();
      await this.buildWithoutWatching();
      await this.cleanup();

      console.log('🎉 Workers safe build completed successfully!');
    } catch (error) {
      console.error('💥 Workers safe build failed:', error.message);
      await this.cleanup();
      process.exit(1);
    }
  }
}

// CLI usage
if (require.main === module) {
  const builder = new WorkersSafeBuild();
  builder.run();
}

module.exports = { WorkersSafeBuild };
