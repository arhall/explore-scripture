const fs = require('fs');
const path = require('path');
const { minify } = require('html-minifier-terser');

const minifyOptions = {
  collapseWhitespace: true,
  removeComments: true,
  removeRedundantAttributes: true,
  removeScriptTypeAttributes: true,
  removeStyleLinkTypeAttributes: true,
  useShortDoctype: true,
  minifyCSS: true,
  minifyJS: true,
  conservativeCollapse: true,
  preserveLineBreaks: false,
  removeEmptyAttributes: true,
  sortAttributes: true,
  sortClassName: true,
};

function compressHtmlFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let processedFiles = 0;

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      compressHtmlFiles(fullPath);
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      try {
        console.log(`Compressing ${fullPath}...`);
        const content = fs.readFileSync(fullPath, 'utf8');

        // Skip very large files that might cause hanging
        if (content.length > 1024 * 1024) {
          // 1MB limit
          console.log(`Skipping large file ${fullPath} (${content.length} bytes)`);
          continue;
        }

        const minified = minify(content, minifyOptions);

        if (minified.length < content.length) {
          fs.writeFileSync(fullPath, minified);
          console.log(`✅ Compressed ${fullPath}: ${content.length} -> ${minified.length} bytes`);
        }

        processedFiles++;
        if (processedFiles % 50 === 0) {
          console.log(`📊 Processed ${processedFiles} HTML files so far...`);
        }
      } catch (error) {
        console.error(`❌ Error compressing ${fullPath}:`, error.message);
      }
    }
  }
}

const siteDir = path.join(__dirname, '..', '_site');
if (fs.existsSync(siteDir)) {
  console.log('Compressing HTML files...');

  // Add timeout to prevent hanging
  const timeout = setTimeout(() => {
    console.error('❌ HTML compression timed out after 30 seconds');
    process.exit(1);
  }, 30000);

  try {
    compressHtmlFiles(siteDir);
    clearTimeout(timeout);
    console.log('✅ HTML compression complete.');

    // Force exit to prevent hanging
    process.exit(0);
  } catch (error) {
    clearTimeout(timeout);
    console.error('❌ HTML compression failed:', error.message);
    process.exit(1);
  }
} else {
  console.error('❌ _site directory not found. Run build first.');
  process.exit(1);
}
