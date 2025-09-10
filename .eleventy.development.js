// Auto-generated optimized Eleventy config
// Mode: development
// Generated: 2025-09-10T03:04:02.654Z

module.exports = function (eleventyConfig) {
  // Performance optimizations for development
  eleventyConfig.setQuietMode(true);

  // Development mode optimizations
  eleventyConfig.setWatchThrottleWaitTime(100);

  // Ignore generated data files from watch to prevent infinite rebuild loops
  eleventyConfig.watchIgnores.add('src/assets/data/books/*/entities.json');
  eleventyConfig.watchIgnores.add('src/assets/data/books/*/chapters/*.json');
  eleventyConfig.watchIgnores.add('src/assets/data/entities/*.json');
  eleventyConfig.watchIgnores.add('src/assets/data/entities-search.json');
  eleventyConfig.watchIgnores.add('src/assets/data/search-data.json');
  eleventyConfig.watchIgnores.add('src/assets/data/processing-summary.json');
  eleventyConfig.watchIgnores.add('src/assets/data/redirects.json');
  eleventyConfig.watchIgnores.add('_site/**/*');
  eleventyConfig.watchIgnores.add('.cache/**/*');
  eleventyConfig.watchIgnores.add('build-logs/**/*');
  eleventyConfig.watchIgnores.add('tmp/**/*');
  eleventyConfig.watchIgnores.add('.build-lock');
  eleventyConfig.watchIgnores.add('node_modules/**/*');

  // Conditional passthrough copy
  const needsAssetCopy = true;
  if (needsAssetCopy || 'development' === 'production') {
    eleventyConfig.addPassthroughCopy({ 'src/assets': 'assets' });
    eleventyConfig.addPassthroughCopy({ 'src/styles.css': 'styles.css' });
    eleventyConfig.addPassthroughCopy({ 'src/manifest.json': 'manifest.json' });
  }

  // Custom filters (optimized)
  eleventyConfig.addFilter('unique', function (arr) {
    return [...new Set(arr)];
  });

  eleventyConfig.addFilter('slug', function (str) {
    return (str || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  });

  eleventyConfig.addFilter('limit', function (data, limit) {
    const arr = Array.isArray(data) ? data : data.characters || data;
    return Array.isArray(arr) ? arr.slice(0, limit) : [];
  });

  eleventyConfig.addFilter('min', function (a, b) {
    return Math.min(a, b);
  });

  eleventyConfig.addFilter('range', function (start, end) {
    const result = [];
    for (let i = start; i < end; i++) {
      result.push(i);
    }
    return result;
  });

  eleventyConfig.addFilter('chapterSort', function (chapterObj) {
    if (!chapterObj) return [];
    return Object.keys(chapterObj)
      .map(Number)
      .filter(n => !isNaN(n))
      .sort((a, b) => a - b);
  });

  // Get proper commentary URL for different books
  eleventyConfig.addFilter('commentaryUrl', function (bookName, chapter) {
    const cleanBookName = bookName
      .toLowerCase()
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/psalms$/, 'psalm'); // Special case: Psalms -> Psalm

    return `https://enduringword.com/bible-commentary/${cleanBookName}-${chapter}/`;
  });

  // Enhanced URL slug filter
  eleventyConfig.addFilter('urlSlug', function (str) {
    return (str || '')
      .toLowerCase()
      .replace(/['']/g, '')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  });

  // Optimized markdown processing
  const markdownIt = require('markdown-it');
  const md = markdownIt({
    html: true,
    breaks: false,
    linkify: false, // Disable for performance in development
  });
  eleventyConfig.setLibrary('md', md);

  return {
    dir: {
      input: 'src',
      includes: '_includes',
      data: '_data',
      output: '_site',
      layouts: '_includes/layouts',
    },
    markdownTemplateEngine: 'njk',
    htmlTemplateEngine: 'njk',
    templateFormats: ['njk', 'md'],
    pathPrefix: '/',
  };
};
