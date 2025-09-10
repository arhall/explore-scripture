#!/usr/bin/env node

/**
 * Build Performance Logger
 * Logs build performance and statistics for the Bible Explorer site
 */

const fs = require('fs').promises;
const path = require('path');

class BuildLogger {
  constructor() {
    this.startTime = Date.now();
    this.stats = {
      buildStart: new Date().toISOString(),
      files: {
        total: 0,
        html: 0,
        css: 0,
        js: 0,
        json: 0,
        other: 0,
      },
      sizes: {
        total: 0,
        html: 0,
        css: 0,
        js: 0,
        json: 0,
        other: 0,
      },
      books: {
        total: 0,
        withSummaries: 0,
        withVideos: 0,
        totalChapters: 0,
      },
      errors: [],
      warnings: [],
    };
  }

  async collectBuildStats() {
    try {
      console.log('🔍 Collecting build statistics...');

      // Analyze source files
      await this.analyzeDirectory('src');

      // Analyze built files if _site exists
      try {
        await this.analyzeDirectory('_site');
      } catch (e) {
        this.stats.warnings.push('_site directory not found - build may not be complete');
      }

      // Analyze data files
      await this.analyzeDataFiles();

      // Calculate build duration
      const buildDuration = Date.now() - this.startTime;
      this.stats.buildDuration = buildDuration;
      this.stats.buildEnd = new Date().toISOString();

      return this.stats;
    } catch (error) {
      this.stats.errors.push({
        message: error.message,
        stack: error.stack,
        component: 'build-stats-collection',
      });
      throw error;
    }
  }

  async analyzeDirectory(dirPath, prefix = '') {
    try {
      const items = await fs.readdir(dirPath);

      for (const item of items) {
        const fullPath = path.join(dirPath, item);
        const stat = await fs.stat(fullPath);

        if (stat.isDirectory()) {
          // Skip node_modules and other build directories
          if (!['node_modules', '.git', '.netlify', '.cache'].includes(item)) {
            await this.analyzeDirectory(fullPath, prefix + item + '/');
          }
        } else if (stat.isFile()) {
          const ext = path.extname(item).toLowerCase();
          const size = stat.size;

          this.stats.files.total++;
          this.stats.sizes.total += size;

          // Categorize by file type
          switch (ext) {
            case '.html':
              this.stats.files.html++;
              this.stats.sizes.html += size;
              break;
            case '.css':
              this.stats.files.css++;
              this.stats.sizes.css += size;
              break;
            case '.js':
              this.stats.files.js++;
              this.stats.sizes.js += size;
              break;
            case '.json':
              this.stats.files.json++;
              this.stats.sizes.json += size;
              break;
            default:
              this.stats.files.other++;
              this.stats.sizes.other += size;
          }
        }
      }
    } catch (error) {
      this.stats.warnings.push(`Could not analyze directory ${dirPath}: ${error.message}`);
    }
  }

  async analyzeDataFiles() {
    try {
      // Analyze books data
      const booksPath = path.join('src', '_data', 'books.json');
      try {
        const booksData = JSON.parse(await fs.readFile(booksPath, 'utf8'));

        if (Array.isArray(booksData)) {
          this.stats.books.total = booksData.length;

          booksData.forEach(book => {
            if (book.chapterSummaries && Object.keys(book.chapterSummaries).length > 0) {
              this.stats.books.withSummaries++;
              this.stats.books.totalChapters += Object.keys(book.chapterSummaries).length;
            }
          });
        }
      } catch (e) {
        this.stats.warnings.push('Could not analyze books.json');
      }

      // Analyze video data
      const videosPath = path.join('src', '_data', 'bibleProjectVideos.json');
      try {
        const videosData = JSON.parse(await fs.readFile(videosPath, 'utf8'));
        this.stats.books.withVideos = Object.keys(videosData).length;
      } catch (e) {
        this.stats.warnings.push('Could not analyze bibleProjectVideos.json');
      }
    } catch (error) {
      this.stats.errors.push({
        message: `Data file analysis failed: ${error.message}`,
        component: 'data-analysis',
      });
    }
  }

  formatSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  formatDuration(ms) {
    if (ms < 1000) return ms + 'ms';
    return (ms / 1000).toFixed(1) + 's';
  }

  generateReport() {
    const report = {
      summary: {
        buildDuration: this.formatDuration(this.stats.buildDuration),
        totalFiles: this.stats.files.total,
        totalSize: this.formatSize(this.stats.sizes.total),
        booksWithContent: `${this.stats.books.withSummaries}/${this.stats.books.total}`,
        totalChapters: this.stats.books.totalChapters,
        errors: this.stats.errors.length,
        warnings: this.stats.warnings.length,
      },
      breakdown: {
        files: this.stats.files,
        sizes: {
          html: this.formatSize(this.stats.sizes.html),
          css: this.formatSize(this.stats.sizes.css),
          js: this.formatSize(this.stats.sizes.js),
          json: this.formatSize(this.stats.sizes.json),
          other: this.formatSize(this.stats.sizes.other),
          total: this.formatSize(this.stats.sizes.total),
        },
      },
      content: {
        books: this.stats.books,
      },
      issues: {
        errors: this.stats.errors,
        warnings: this.stats.warnings,
      },
      metadata: {
        buildStart: this.stats.buildStart,
        buildEnd: this.stats.buildEnd,
        buildDuration: this.stats.buildDuration,
        timestamp: new Date().toISOString(),
      },
    };

    return report;
  }

  async saveBuildLog() {
    try {
      const report = this.generateReport();
      const logPath = path.join('build-logs');

      // Ensure logs directory exists
      try {
        await fs.mkdir(logPath, { recursive: true });
      } catch (e) {
        // Directory might already exist
      }

      // Save detailed log
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const detailedLogPath = path.join(logPath, `build-${timestamp}.json`);
      await fs.writeFile(detailedLogPath, JSON.stringify(report, null, 2));

      // Save latest log (overwrite)
      const latestLogPath = path.join(logPath, 'latest-build.json');
      await fs.writeFile(latestLogPath, JSON.stringify(report, null, 2));

      console.log('📊 Build log saved to:', detailedLogPath);
      return detailedLogPath;
    } catch (error) {
      console.error('Failed to save build log:', error);
      throw error;
    }
  }

  printSummary() {
    const report = this.generateReport();

    console.log('\n📋 Build Summary:');
    console.log('─'.repeat(50));
    console.log(`⏱️  Build Duration: ${report.summary.buildDuration}`);
    console.log(`📁 Total Files: ${report.summary.totalFiles}`);
    console.log(`📦 Total Size: ${report.summary.totalSize}`);
    console.log(`📖 Books with Content: ${report.summary.booksWithContent}`);
    console.log(`📄 Total Chapters: ${report.summary.totalChapters}`);

    if (report.summary.errors > 0) {
      console.log(`❌ Errors: ${report.summary.errors}`);
    }

    if (report.summary.warnings > 0) {
      console.log(`⚠️  Warnings: ${report.summary.warnings}`);
    }

    console.log('\n📊 File Breakdown:');
    console.log(`  HTML: ${report.breakdown.files.html} files (${report.breakdown.sizes.html})`);
    console.log(`  CSS:  ${report.breakdown.files.css} files (${report.breakdown.sizes.css})`);
    console.log(`  JS:   ${report.breakdown.files.js} files (${report.breakdown.sizes.js})`);
    console.log(`  JSON: ${report.breakdown.files.json} files (${report.breakdown.sizes.json})`);
    console.log(`  Other: ${report.breakdown.files.other} files (${report.breakdown.sizes.other})`);

    if (report.issues.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      report.issues.warnings.forEach(warning => console.log(`  - ${warning}`));
    }

    if (report.issues.errors.length > 0) {
      console.log('\n❌ Errors:');
      report.issues.errors.forEach(error => console.log(`  - ${error.message}`));
    }

    console.log('─'.repeat(50));
  }
}

// CLI execution
if (require.main === module) {
  const logger = new BuildLogger();

  logger
    .collectBuildStats()
    .then(() => {
      logger.printSummary();
      return logger.saveBuildLog();
    })
    .then(() => {
      console.log('✅ Build analysis complete!');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Build analysis failed:', error.message);
      process.exit(1);
    });
}

module.exports = BuildLogger;
