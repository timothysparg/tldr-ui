'use strict'

const registerPostsExtension = require('./lib/register-posts-extension')
const registerAsciidoctor = require('./asciidoc-tldr-ui')
const { getAsciidocOptions } = require('./lib/antora-config')

const { initHighlighter } = registerAsciidoctor

/**
 * Antora extension registration function.
 */
module.exports.register = function (context, env) {
  if (!context || typeof context.on !== 'function') return

  const config = (env && env.config) || (context && context.config) || {}
  const shikiOptions = config.shiki || {}

  context.on('contentClassified', async () => {
    await initHighlighter(shikiOptions)
  })

  context.on('beforeProcess', ({ siteAsciiDocConfig }) => {
    const asciidocOptions = getAsciidocOptions(config, process.cwd())
    siteAsciiDocConfig.extensions = [
      ...(siteAsciiDocConfig.extensions || []),
      {
        register(registry) {
          registerAsciidoctor.call(registry, asciidocOptions)
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
      const tocData = tocDataStore.get(docfile)
      if (!tocData || tocData.length === 0) return
      if (!page.asciidoc) page.asciidoc = {}
      if (!page.asciidoc.attributes) page.asciidoc.attributes = {}
      page.asciidoc.attributes['page-toc'] = JSON.stringify(tocData)
    })
  })

  registerPostsExtension.call(context, { config })
}

module.exports.getAsciidocOptions = getAsciidocOptions
