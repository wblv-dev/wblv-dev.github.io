const markdownIt = require("markdown-it");
const markdownItAnchor = require("markdown-it-anchor");

module.exports = function (eleventyConfig) {
  // Configure markdown with auto heading IDs
  eleventyConfig.setLibrary(
    "md",
    markdownIt({ html: true, linkify: true }).use(markdownItAnchor, {
      level: [2, 3],
      slugify: function (s) {
        return s.trim().toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-');
      },
    })
  );

  // Passthrough copy — keep assets, favicon, CNAME, .nojekyll, .well-known
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/favicon.svg");
  eleventyConfig.addPassthroughCopy("src/CNAME");
  eleventyConfig.addPassthroughCopy("src/.nojekyll");
  eleventyConfig.addPassthroughCopy("src/.well-known");
  eleventyConfig.addPassthroughCopy("src/admin");
  eleventyConfig.addPassthroughCopy("src/ATS-CVC");
  eleventyConfig.addPassthroughCopy("src/wblv-private-cloud-lab");

  // Date filter for templates
  eleventyConfig.addFilter("dateFormat", function (date) {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  });

  // ISO date filter (YYYY-MM-DD) — used by sitemap.xml
  eleventyConfig.addFilter("isoDate", function (date) {
    return new Date(date).toISOString().slice(0, 10);
  });

  // Blog collection
  eleventyConfig.addCollection("posts", function (collectionApi) {
    return collectionApi.getFilteredByTag("post");
  });

  // Docs collection
  eleventyConfig.addCollection("docs", function (collectionApi) {
    return collectionApi.getFilteredByTag("doc");
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    templateFormats: ["njk", "md", "html"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
};
