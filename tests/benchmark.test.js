const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Benchmarking utilities
describe('Performance Benchmarks', () => {
  const siteDir = path.join(__dirname, '..', '_site');
  let benchmarkResults = {};
  const BENCHMARK_SLA = {
    buildAvgMs: 20000,
    incrementalAvgMs: 18000,
    totalSiteBytes: 400 * 1024 * 1024,
    maxFileCount: 20000,
    minAvgFileSize: 5 * 1024,
  };

  beforeAll(() => {
    // Ensure fresh build for consistent benchmarking
    console.log('  Preparing fresh build for benchmarking...');
    execSync('npm run clean && npm run build', {
      cwd: path.join(__dirname, '..'),
      stdio: 'pipe',
    });
  });

  describe('Build Performance Benchmarks', () => {
    test('should benchmark clean build time', () => {
      const iterations = 3;
      const buildTimes = [];

      console.log(`\\n⏱  Running ${iterations} build iterations...`);

      for (let i = 0; i < iterations; i++) {
        // Clean build
        execSync('npm run clean', {
          cwd: path.join(__dirname, '..'),
          stdio: 'pipe',
        });

        const startTime = process.hrtime.bigint();

        execSync('npm run build', {
          cwd: path.join(__dirname, '..'),
          stdio: 'pipe',
        });

        const endTime = process.hrtime.bigint();
        const buildTime = Number(endTime - startTime) / 1000000; // Convert to milliseconds

        buildTimes.push(buildTime);
        console.log(`   Build ${i + 1}: ${Math.round(buildTime)}ms`);
      }

      const avgBuildTime = buildTimes.reduce((a, b) => a + b, 0) / buildTimes.length;
      const minBuildTime = Math.min(...buildTimes);
      const maxBuildTime = Math.max(...buildTimes);

      console.log(`\\n Build Performance Summary:`);
      console.log(`   Average: ${Math.round(avgBuildTime)}ms`);
      console.log(`   Best: ${Math.round(minBuildTime)}ms`);
      console.log(`   Worst: ${Math.round(maxBuildTime)}ms`);

      benchmarkResults.build = {
        average: avgBuildTime,
        min: minBuildTime,
        max: maxBuildTime,
        iterations: iterations,
      };

      // Ensure average build time meets our SLA
      expect(avgBuildTime).toBeLessThan(BENCHMARK_SLA.buildAvgMs);
    }, 120000);

    test('should benchmark incremental build time', () => {
      // First, do a clean build
      execSync('npm run clean && npm run build', {
        cwd: path.join(__dirname, '..'),
        stdio: 'pipe',
      });

      // Now benchmark incremental builds (no changes)
      const iterations = 5;
      const incrementalTimes = [];

      console.log(`\\n Running ${iterations} incremental build iterations...`);

      for (let i = 0; i < iterations; i++) {
        const startTime = process.hrtime.bigint();

        execSync('npm run build', {
          cwd: path.join(__dirname, '..'),
          stdio: 'pipe',
        });

        const endTime = process.hrtime.bigint();
        const buildTime = Number(endTime - startTime) / 1000000;

        incrementalTimes.push(buildTime);
        console.log(`   Incremental build ${i + 1}: ${Math.round(buildTime)}ms`);
      }

      const avgIncrementalTime =
        incrementalTimes.reduce((a, b) => a + b, 0) / incrementalTimes.length;

      console.log(`\\n Incremental Build Average: ${Math.round(avgIncrementalTime)}ms`);

      benchmarkResults.incrementalBuild = {
        average: avgIncrementalTime,
        iterations: iterations,
      };

      // Incremental builds should be much faster
      expect(avgIncrementalTime).toBeLessThan(BENCHMARK_SLA.incrementalAvgMs);
    }, 120000);
  });

  describe('File System Benchmarks', () => {
    test('should benchmark site size metrics', () => {
      const sizeMetrics = {};

      // Total size (macOS compatible)
      const totalSizeCmd =
        process.platform === 'darwin'
          ? `find "${siteDir}" -type f -exec stat -f%z {} + | awk '{sum += $1} END {print sum}'`
          : `du -sb "${siteDir}" | cut -f1`;
      const totalBytes = parseInt(execSync(totalSizeCmd, { encoding: 'utf8' }));
      sizeMetrics.totalSize = totalBytes;

      // File count
      const fileCountCmd = `find "${siteDir}" -type f | wc -l`;
      const fileCount = parseInt(execSync(fileCountCmd, { encoding: 'utf8' }));
      sizeMetrics.fileCount = fileCount;

      // Directory count
      const dirCountCmd = `find "${siteDir}" -type d | wc -l`;
      const dirCount = parseInt(execSync(dirCountCmd, { encoding: 'utf8' }));
      sizeMetrics.dirCount = dirCount;

      // Average file size
      const avgFileSize = totalBytes / fileCount;
      sizeMetrics.avgFileSize = avgFileSize;

      // Largest files
      const largeFilesCmd = `find "${siteDir}" -type f -exec ls -la {} + | sort -nrk5 | head -5`;
      const largeFiles = execSync(largeFilesCmd, { encoding: 'utf8' });

      console.log(`\\n Site Size Metrics:`);
      console.log(`   Total Size: ${(totalBytes / 1024 / 1024).toFixed(2)} MB`);
      console.log(`   File Count: ${fileCount.toLocaleString()}`);
      console.log(`   Directory Count: ${dirCount.toLocaleString()}`);
      console.log(`   Average File Size: ${(avgFileSize / 1024).toFixed(2)} KB`);
      console.log(`\\n Largest Files:`);
      console.log(
        largeFiles
          .split('\\n')
          .slice(0, 3)
          .map(line => '   ' + line)
          .join('\\n')
      );

      benchmarkResults.sizeMetrics = sizeMetrics;

      // Assert reasonable metrics
      expect(totalBytes).toBeLessThan(BENCHMARK_SLA.totalSiteBytes);
      expect(fileCount).toBeLessThan(BENCHMARK_SLA.maxFileCount);
      expect(avgFileSize).toBeGreaterThan(BENCHMARK_SLA.minAvgFileSize);
    });

    test('should benchmark file type distribution', () => {
      const fileTypes = {};

      // Get file extensions and count them
      const extCmd = `find "${siteDir}" -type f -name "*.*" | sed 's/.*\\.//' | sort | uniq -c | sort -nr`;
      const extOutput = execSync(extCmd, { encoding: 'utf8' });

      console.log(`\\n File Type Distribution:`);

      const lines = extOutput.trim().split('\n').slice(0, 10); // Top 10
      lines.forEach(line => {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 2) {
          const count = parseInt(parts[0]);
          const ext = parts[1];
          fileTypes[ext] = count;
          console.log(`   .${ext}: ${count} files`);
        }
      });

      benchmarkResults.fileTypes = fileTypes;

      // Should have reasonable distribution
      expect(fileTypes.html).toBeGreaterThan(300); // Many HTML files
      expect(fileTypes.css).toBeGreaterThanOrEqual(1); // At least one CSS file
    });
  });

  describe('Data Processing Benchmarks', () => {
    test('should benchmark entity ID processing', () => {
      const startTime = process.hrtime.bigint();

      // Load and process entity IDs
      const entityIds = require('../src/_data/entityIds.js');

      const endTime = process.hrtime.bigint();
      const processingTime = Number(endTime - startTime) / 1000000;

      console.log(`\\n Entity ID Processing:`);
      console.log(`   Processing Time: ${Math.round(processingTime)}ms`);
      console.log(`   Entities Processed: ${entityIds.length.toLocaleString()}`);
      console.log(
        `   Rate: ${Math.round(entityIds.length / (processingTime / 1000))} entities/second`
      );

      benchmarkResults.entityIdProcessing = {
        time: processingTime,
        count: entityIds.length,
        rate: entityIds.length / (processingTime / 1000),
      };

      expect(processingTime).toBeLessThan(5000); // Should process in under 5 seconds
      expect(entityIds.length).toBeGreaterThan(1000); // Should find many entities
    });

    test('should benchmark books data validation', () => {
      const startTime = process.hrtime.bigint();

      const books = require('../src/_data/books.json');

      // Validate all books
      let chapterCount = 0;
      let summaryCount = 0;

      books.forEach(book => {
        if (book.chapterSummaries) {
          const chapters = Object.keys(book.chapterSummaries);
          chapterCount += chapters.length;
          summaryCount += chapters.filter(ch => book.chapterSummaries[ch]).length;
        }
      });

      const endTime = process.hrtime.bigint();
      const processingTime = Number(endTime - startTime) / 1000000;

      console.log(`\\n Books Data Processing:`);
      console.log(`   Processing Time: ${Math.round(processingTime)}ms`);
      console.log(`   Books Processed: ${books.length}`);
      console.log(`   Chapters Found: ${chapterCount.toLocaleString()}`);
      console.log(`   Summaries Available: ${summaryCount.toLocaleString()}`);

      benchmarkResults.booksProcessing = {
        time: processingTime,
        bookCount: books.length,
        chapterCount: chapterCount,
        summaryCount: summaryCount,
      };

      expect(processingTime).toBeLessThan(1000); // Should be very fast
      expect(books.length).toBe(66); // Exactly 66 biblical books
    });
  });

  afterAll(() => {
    // Save benchmark results
    const resultsPath = path.join(__dirname, '..', 'benchmark-results.json');
    const resultData = {
      timestamp: new Date().toISOString(),
      nodeVersion: process.version,
      platform: process.platform,
      results: benchmarkResults,
    };

    fs.writeFileSync(resultsPath, JSON.stringify(resultData, null, 2));

    console.log(`\\n Benchmark results saved to: ${resultsPath}`);
    console.log(`\\n Performance Summary:`);
    console.log(`   Average Build Time: ${Math.round(benchmarkResults.build?.average || 0)}ms`);
    console.log(
      `   Total Site Size: ${((benchmarkResults.sizeMetrics?.totalSize || 0) / 1024 / 1024).toFixed(2)}MB`
    );
    console.log(
      `   Entity Processing Rate: ${Math.round(benchmarkResults.entityIdProcessing?.rate || 0)} entities/sec`
    );
  });
});
