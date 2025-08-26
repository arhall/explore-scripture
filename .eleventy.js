module.exports = function(eleventyConfig) {
  // Add bundle plugin for CSS/JS optimization (conditional)
  try {
    const bundlerPlugin = require("@11ty/eleventy-plugin-bundle");
    if (bundlerPlugin && typeof bundlerPlugin === 'function') {
      eleventyConfig.addPlugin(bundlerPlugin);
    }
  } catch (e) {
    console.warn('Bundle plugin not available:', e.message);
  }

  // Performance optimizations
  eleventyConfig.setQuietMode(true);
  
  // Optimize passthrough copy
  eleventyConfig.addPassthroughCopy({"src/assets": "assets"});
  eleventyConfig.addPassthroughCopy({"src/styles.css": "styles.css"});

  // Custom filters
  eleventyConfig.addFilter("unique", function(arr) {
    return [...new Set(arr)];
  });

  eleventyConfig.addFilter("slug", function(str) {
    return (str || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
  });

  eleventyConfig.addFilter("limit", function(arr, limit) {
    return arr.slice(0, limit);
  });

  eleventyConfig.addFilter("min", function(a, b) {
    return Math.min(a, b);
  });

  // Add range filter for pagination
  eleventyConfig.addFilter("range", function(start, end) {
    const result = [];
    for (let i = start; i < end; i++) {
      result.push(i);
    }
    return result;
  });

  // Sort chapters numerically instead of alphabetically
  eleventyConfig.addFilter("chapterSort", function(chapterObj) {
    if (!chapterObj) return [];
    
    return Object.entries(chapterObj).sort((a, b) => {
      const numA = parseInt(a[0], 10);
      const numB = parseInt(b[0], 10);
      return numA - numB;
    });
  });

  // Get proper commentary URL for different books
  eleventyConfig.addFilter("commentaryUrl", function(bookName, chapter) {
    const cleanBookName = bookName.toLowerCase()
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/psalms$/, 'psalm'); // Special case: Psalms -> Psalm
    
    return `https://enduringword.com/bible-commentary/${cleanBookName}-${chapter}/`;
  });

  // Transform HTML output for production
  if (process.env.NODE_ENV === 'production') {
    const htmlnano = require('htmlnano');
    
    eleventyConfig.addTransform("htmlnano", function(content, outputPath) {
      if (outputPath && outputPath.endsWith(".html")) {
        return htmlnano.process(content, {
          removeComments: true,
          collapseWhitespace: 'conservative',
          minifyJs: true,
          minifyCss: true
        }).then(result => result.html);
      }
      return content;
    });
  }

  // Improve build performance with incremental builds
  eleventyConfig.setWatchThrottleWaitTime(100);
  
  return {
    dir: {
      input: "src",
      includes: "_includes", 
      data: "_data",
      output: "_site",
      layouts: "_includes/layouts"
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    templateFormats: ["njk", "md"],
    pathPrefix: "/"
  };
}
