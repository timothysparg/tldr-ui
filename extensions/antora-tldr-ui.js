'use strict'

const registerPostsExtension = require('./lib/register-posts-extension')
const registerAsciidoctor = require('./asciidoc-tldr-ui')
const { getAsciidocOptions } = require('./lib/antora-config')
const { createGithubPrStatusEnricher } = require('./lib/github-pr-statuses')

const { initHighlighter } = registerAsciidoctor

/**
 * Antora extension registration function.
 */
module.exports.register = function (context, env) {
  if (!context || typeof context.on !== 'function') return

  const config = (env && env.config) || (context && context.config) || {}
  const shikiOptions = config.shiki || {}
  const asciidocOptions = getAsciidocOptions(config, process.cwd())
  const githubPrStatuses = createGithubPrStatusEnricher(asciidocOptions.githubPrStatuses)

  context.on('contentClassified', async ({ contentCatalog }) => {
    await initHighlighter(shikiOptions)
    const pages = contentCatalog ? contentCatalog.findBy({ family: 'page' }) : []
    await githubPrStatuses.prepareFromTexts(
      pages.map((page) => page.contents && page.contents.toString()),
      { log: (message) => context.getLogger('github-pr-statuses').warn(message) }
    )
  })

  context.on('beforeProcess', ({ siteAsciiDocConfig }) => {
    siteAsciiDocConfig.extensions = [
      ...(siteAsciiDocConfig.extensions || []),
      {
        register(registry) {
          registerAsciidoctor.call(registry, { ...asciidocOptions, githubPrStatuses })
        },
      },
    ]
  })

  // Antora reads page.asciidoc.attributes before doc.convert() runs postprocessors, so
  // doc.setAttribute() in the postprocessor is invisible to the page model. We store
  // tocData in a shared map during postprocessor execution and inject it here, after
  // all documents are converted but before composePage builds page.attributes.
  context.on('documentsConverted', ({ contentCatalog }) => {
    const { tocDataStore } = registerAsciidoctor
    contentCatalog.findBy({ family: 'page' }).forEach((page) => {
      const module = page.src?.module
      const rel = page.src?.relative
      if (!module || !rel) return
      const docfile = `modules/${module}/pages/${rel}`
      const stored = tocDataStore.get(docfile)
      // stored may be [] (truthy but empty) when toc::[] was absent from the document.
      // Fall back to extracting headings from the converted HTML so pages that use
      // :toc: macro without placing toc::[] still get a sidebar TOC.
      const tocData = stored && stored.length > 0 ? stored : extractTocFromHtml(page.contents?.toString() || '')
      if (!tocData.length) return
      if (!page.asciidoc) page.asciidoc = {}
      if (!page.asciidoc.attributes) page.asciidoc.attributes = {}
      page.asciidoc.attributes['page-toc'] = JSON.stringify(tocData)
    })
  })

  registerPostsExtension.call(context, { config })
}

module.exports.getAsciidocOptions = getAsciidocOptions
module.exports.extractTocFromHtml = extractTocFromHtml

/**
 * Extracts a hierarchical TOC from converted HTML by scanning h2–h6 elements that
 * carry an id attribute. Used as a fallback when toc::[] was not placed in the source
 * document, so Asciidoctor never emitted a <div id="toc"> block for us to extract.
 */
function extractTocFromHtml(html) {
  const items = []
  const stack = []
  const re = /<h([2-6])[^>]*\bid="([^"]+)"[^>]*>([\s\S]*?)<\/h[2-6]>/gi
  let match
  while ((match = re.exec(html)) !== null) {
    const level = parseInt(match[1], 10)
    const id = match[2]
    const title = match[3].replace(/<[^>]+>/g, '').trim()
    if (!title) continue
    const item = { url: `#${id}`, title, children: [] }
    while (stack.length && stack[stack.length - 1].level >= level) stack.pop()
    if (stack.length === 0) {
      items.push(item)
    } else {
      stack[stack.length - 1].item.children.push(item)
    }
    stack.push({ level, item })
  }
  return items
}
