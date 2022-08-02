const fs = require("fs")
const markdownIt = require("markdown-it")
const htmlmin = require("html-minifier")
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight")
const favicon = require("eleventy-favicon")
const timeToRead = require("eleventy-plugin-time-to-read")
const { DateTime } = require("luxon")

const { postsByYear } = require("./src/collections")
const shortcodes = require("./src/shortcodes")

const md = new markdownIt({ html: true })

module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(syntaxHighlight)
  eleventyConfig.addPlugin(favicon, { destination: "./public" })
  eleventyConfig.addPlugin(timeToRead, {
    style: "short",
  })

  eleventyConfig.addShortcode("gravatar", shortcodes.gravatar)
  eleventyConfig.addShortcode("icon", shortcodes.icon)
  eleventyConfig.addPairedShortcode("notice", shortcodes.notice)

  eleventyConfig.addFilter("postDate", (content) => {
    return DateTime.fromJSDate(content)
      .toUTC()
      .toLocaleString(DateTime.DATE_MED)
  })

  eleventyConfig.addFilter("markdown", (content) => md.render(content))

  eleventyConfig.addCollection("postsByYear", postsByYear)

  if (process.env.ELEVENTY_ENV === "production") {
    eleventyConfig.addTransform("htmlmin", htmlminTransform)
  } else {
    eleventyConfig.setBrowserSyncConfig({
      callbacks: { ready: browserSyncReady },
    })
  }

  eleventyConfig.addPassthroughCopy({ "src/static": "." })
  eleventyConfig.addWatchTarget("./src/styles/")

  var pathPrefix = ""
  if (process.env.GITHUB_REPOSITORY) {
    pathPrefix = process.env.GITHUB_REPOSITORY.split("/")[1]
  }

  return {
    dir: {
      input: "src",
      output: "public",
    },
    markdownTemplateEngine: "njk",
    pathPrefix,
  }
}

function browserSyncReady(err, bs) {
  bs.addMiddleware("*", (req, res) => {
    const content_404 = fs.readFileSync("public/404.html")
    // Provides the 404 content without redirect.
    res.write(content_404)
    // Add 404 http status code in request header.
    // res.writeHead(404, { "Content-Type": "text/html" });
    res.writeHead(404)
    res.end()
  })
}

function htmlminTransform(content, outputPath) {
  if (outputPath.endsWith(".html")) {
    let minified = htmlmin.minify(content, {
      useShortDoctype: true,
      removeComments: true,
      collapseWhitespace: true,
    })
    return minified
  }
  return content
}
