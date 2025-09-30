
// Auto-generated optimized Eleventy config
// Mode: production
// Generated: 2025-09-26T17:40:24.550Z

module.exports = function(eleventyConfig) {
  // Performance optimizations for production
  eleventyConfig.setQuietMode(false);
  
  // Production mode optimizations
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  // Conditional passthrough copy
  const needsAssetCopy = true;
  if (needsAssetCopy || "production" === "production") {
    eleventyConfig.addPassthroughCopy({"src/assets": "assets"});
    eleventyConfig.addPassthroughCopy({"src/styles.css": "styles.css"});
    eleventyConfig.addPassthroughCopy({"src/manifest.json": "manifest.json"});
  }

  // Custom filters (optimized)
  eleventyConfig.addFilter("unique", function(arr) {
    return [...new Set(arr)];
  });

  eleventyConfig.addFilter("slug", function(str) {
    return (str || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
  });

  eleventyConfig.addFilter("limit", function(data, limit) {
    const arr = Array.isArray(data) ? data : (data.characters || data);
    return Array.isArray(arr) ? arr.slice(0, limit) : [];
  });

  eleventyConfig.addFilter("min", function(a, b) {
    return Math.min(a, b);
  });

  eleventyConfig.addFilter("range", function(start, end) {
    const result = [];
    for (let i = start; i < end; i++) {
      result.push(i);
    }
    return result;
  });

  eleventyConfig.addFilter("chapterSort", function(chapterObj) {
    if (!chapterObj) return [];
    return Object.keys(chapterObj)
      .map(Number)
      .filter(n => !isNaN(n))
      .sort((a, b) => a - b);
  });

  // Get proper commentary URL for different books
  eleventyConfig.addFilter("commentaryUrl", function(bookName, chapter) {
    const cleanBookName = bookName.toLowerCase()
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/psalms$/, 'psalm'); // Special case: Psalms -> Psalm
    
    return `https://enduringword.com/bible-commentary/${cleanBookName}-${chapter}/`;
  });

  // Enhanced URL slug filter
  eleventyConfig.addFilter("urlSlug", function(str) {
    return (str || "")
      .toLowerCase()
      .replace(/['']/g, "")
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  });

  // Optimized markdown processing
  const markdownIt = require("markdown-it");
  const md = markdownIt({
    html: true,
    breaks: false,
    linkify: false // Disable for performance in production
  });
  eleventyConfig.setLibrary("md", md);

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
};
