const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Performance SLA thresholds
const SLA_THRESHOLDS = {
  buildTime: { excellent: 1000, good: 1500, target: 2000 },
  siteSize: { excellent: 40, good: 50, target: 60 }, // MB
  pageLoad: { excellent: 1000, good: 1500, target: 2000 }, // ms
  lighthouse: { excellent: 95, good: 90, target: 85 },
};

function generatePerformanceReport() {
  console.log('🚀 Generating Performance Report...\n');

  const reportData = {
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    sections: [],
  };

  // Build Performance
  console.log('⏱️  Measuring build performance...');
  const buildStartTime = Date.now();

  try {
    execSync('npm run clean && npm run build', { stdio: 'pipe' });
    const buildTime = Date.now() - buildStartTime;

    const buildStatus = getBuildStatus(buildTime);
    reportData.sections.push({
      name: 'Build Performance',
      metrics: {
        buildTime: buildTime,
        status: buildStatus,
        sla: SLA_THRESHOLDS.buildTime.target,
      },
    });

    console.log(`   Build completed in ${buildTime}ms ${getStatusEmoji(buildStatus)}`);
  } catch (error) {
    console.error('   ❌ Build failed:', error.message);
    return;
  }

  // Site Size Analysis
  console.log('\\n📦 Analyzing site size...');
  const siteDir = path.join(__dirname, '..', '_site');

  try {
    const totalSize = execSync(`du -sb "${siteDir}" | cut -f1`, { encoding: 'utf8' });
    const sizeMB = parseInt(totalSize) / (1024 * 1024);
    const sizeStatus = getSizeStatus(sizeMB);

    const fileCount = execSync(`find "${siteDir}" -type f | wc -l`, { encoding: 'utf8' });
    const totalFiles = parseInt(fileCount.trim());

    reportData.sections.push({
      name: 'Site Size',
      metrics: {
        totalSizeMB: Math.round(sizeMB * 100) / 100,
        fileCount: totalFiles,
        status: sizeStatus,
        sla: SLA_THRESHOLDS.siteSize.target,
      },
    });

    console.log(
      `   Total size: ${sizeMB.toFixed(2)}MB (${totalFiles} files) ${getStatusEmoji(sizeStatus)}`
    );
  } catch (error) {
    console.error('   ❌ Size analysis failed:', error.message);
  }

  // File Type Distribution
  console.log('\\n📋 File type analysis...');
  try {
    const extOutput = execSync(
      `find "${siteDir}" -name "*.*" -type f | sed 's/.*\\.//' | sort | uniq -c | sort -nr | head -5`,
      { encoding: 'utf8' }
    );
    const fileTypes = {};

    extOutput
      .trim()
      .split('\\n')
      .forEach(line => {
        const [count, ext] = line.trim().split(/\\s+/);
        if (ext) {
          fileTypes[ext] = parseInt(count);
          console.log(`   .${ext}: ${count} files`);
        }
      });

    reportData.sections.push({
      name: 'File Distribution',
      metrics: { fileTypes },
    });
  } catch (error) {
    console.error('   ⚠️  File type analysis failed:', error.message);
  }

  // Character Processing Performance
  console.log('\\n👥 Testing character data processing...');
  try {
    const startTime = process.hrtime.bigint();
    const charactersModule = require('../src/_data/characters.js');
    const characters = charactersModule();
    const endTime = process.hrtime.bigint();

    const processingTime = Number(endTime - startTime) / 1000000; // ms
    const processingRate = characters.length / (processingTime / 1000); // chars/second

    reportData.sections.push({
      name: 'Character Processing',
      metrics: {
        processingTimeMs: Math.round(processingTime),
        characterCount: characters.length,
        processingRate: Math.round(processingRate),
      },
    });

    console.log(`   Processed ${characters.length} characters in ${Math.round(processingTime)}ms`);
    console.log(`   Rate: ${Math.round(processingRate)} characters/second`);
  } catch (error) {
    console.error('   ❌ Character processing test failed:', error.message);
  }

  // Books Data Validation
  console.log('\\n📚 Validating books data...');
  try {
    const books = require('../src/_data/books.json');
    let totalChapters = 0;
    let completedSummaries = 0;

    books.forEach(book => {
      if (book.chapterSummaries) {
        const chapters = Object.keys(book.chapterSummaries);
        totalChapters += chapters.length;
        completedSummaries += chapters.filter(ch => book.chapterSummaries[ch]?.length > 0).length;
      }
    });

    const completionRate = (completedSummaries / totalChapters) * 100;

    reportData.sections.push({
      name: 'Content Completeness',
      metrics: {
        totalBooks: books.length,
        totalChapters: totalChapters,
        completedSummaries: completedSummaries,
        completionRate: Math.round(completionRate * 100) / 100,
      },
    });

    console.log(`   ${books.length} books, ${totalChapters} chapters`);
    console.log(`   ${completedSummaries} summaries completed (${completionRate.toFixed(1)}%)`);
  } catch (error) {
    console.error('   ❌ Books data validation failed:', error.message);
  }

  // Performance Recommendations
  console.log('\\n💡 Performance Recommendations:');
  const recommendations = generateRecommendations(reportData);
  recommendations.forEach(rec => console.log(`   • ${rec}`));

  reportData.recommendations = recommendations;

  // Save Report
  const reportPath = path.join(__dirname, '..', 'performance-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));

  console.log(`\\n📊 Performance report saved to: ${reportPath}`);
  console.log('\\n🎯 Overall Performance Summary:');

  const overallScore = calculateOverallScore(reportData);
  console.log(`   Overall Score: ${overallScore}/100 ${getScoreEmoji(overallScore)}`);

  return reportData;
}

function getBuildStatus(buildTime) {
  if (buildTime <= SLA_THRESHOLDS.buildTime.excellent) return 'excellent';
  if (buildTime <= SLA_THRESHOLDS.buildTime.good) return 'good';
  if (buildTime <= SLA_THRESHOLDS.buildTime.target) return 'acceptable';
  return 'needs-improvement';
}

function getSizeStatus(sizeMB) {
  if (sizeMB <= SLA_THRESHOLDS.siteSize.excellent) return 'excellent';
  if (sizeMB <= SLA_THRESHOLDS.siteSize.good) return 'good';
  if (sizeMB <= SLA_THRESHOLDS.siteSize.target) return 'acceptable';
  return 'needs-improvement';
}

function getStatusEmoji(status) {
  const emojis = {
    excellent: '🚀',
    good: '✅',
    acceptable: '⚠️',
    'needs-improvement': '❌',
  };
  return emojis[status] || '❓';
}

function getScoreEmoji(score) {
  if (score >= 95) return '🚀';
  if (score >= 90) return '✅';
  if (score >= 80) return '⚠️';
  return '❌';
}

function generateRecommendations(reportData) {
  const recommendations = [];

  const buildMetrics = reportData.sections.find(s => s.name === 'Build Performance')?.metrics;
  if (buildMetrics && buildMetrics.buildTime > SLA_THRESHOLDS.buildTime.good) {
    recommendations.push('Consider optimizing Eleventy configuration for faster builds');
  }

  const sizeMetrics = reportData.sections.find(s => s.name === 'Site Size')?.metrics;
  if (sizeMetrics && sizeMetrics.totalSizeMB > SLA_THRESHOLDS.siteSize.good) {
    recommendations.push('Site size could be further optimized - review large files');
  }

  const contentMetrics = reportData.sections.find(s => s.name === 'Content Completeness')?.metrics;
  if (contentMetrics && contentMetrics.completionRate < 95) {
    recommendations.push('Consider completing remaining chapter summaries for better coverage');
  }

  if (recommendations.length === 0) {
    recommendations.push('Excellent performance! All metrics meet targets 🎉');
  }

  return recommendations;
}

function calculateOverallScore(reportData) {
  let totalScore = 0;
  let weights = 0;

  const buildMetrics = reportData.sections.find(s => s.name === 'Build Performance')?.metrics;
  if (buildMetrics) {
    const buildScore = getBuildScore(buildMetrics.buildTime);
    totalScore += buildScore * 0.3; // 30% weight
    weights += 0.3;
  }

  const sizeMetrics = reportData.sections.find(s => s.name === 'Site Size')?.metrics;
  if (sizeMetrics) {
    const sizeScore = getSizeScore(sizeMetrics.totalSizeMB);
    totalScore += sizeScore * 0.3; // 30% weight
    weights += 0.3;
  }

  const contentMetrics = reportData.sections.find(s => s.name === 'Content Completeness')?.metrics;
  if (contentMetrics) {
    totalScore += contentMetrics.completionRate * 0.4; // 40% weight
    weights += 0.4;
  }

  return weights > 0 ? Math.round(totalScore / weights) : 0;
}

function getBuildScore(buildTime) {
  if (buildTime <= SLA_THRESHOLDS.buildTime.excellent) return 100;
  if (buildTime <= SLA_THRESHOLDS.buildTime.good) return 90;
  if (buildTime <= SLA_THRESHOLDS.buildTime.target) return 80;
  return Math.max(50, 80 - (buildTime - SLA_THRESHOLDS.buildTime.target) / 100);
}

function getSizeScore(sizeMB) {
  if (sizeMB <= SLA_THRESHOLDS.siteSize.excellent) return 100;
  if (sizeMB <= SLA_THRESHOLDS.siteSize.good) return 90;
  if (sizeMB <= SLA_THRESHOLDS.siteSize.target) return 80;
  return Math.max(50, 80 - (sizeMB - SLA_THRESHOLDS.siteSize.target) * 2);
}

// Run if called directly
if (require.main === module) {
  generatePerformanceReport();
}

module.exports = {
  generatePerformanceReport,
  SLA_THRESHOLDS,
};
