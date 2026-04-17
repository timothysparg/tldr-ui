'use strict'

const registerPostsExtension = require('./lib/register-posts-extension')
const { initHighlighter } = require('./lib/shiki-singleton')
const registerAsciidoctor = require('./asciidoc-tldr-ui')

/**
 * Antora extension registration function.
 */
module.exports.register = function (context) {
  if (!context || typeof context.on !== 'function') return

  const config = (context && context.config) || {}
  const shikiOptions = config.shiki || {}

  context.on('contentClassified', async () => {
    await initHighlighter(shikiOptions)
  })

  context.on('beforeProcess', ({ siteAsciiDocConfig }) => {
    const asciidocOptions = config.asciidoc || {}
    siteAsciiDocConfig.extensions = [
      ...(siteAsciiDocConfig.extensions || []),
      {
        register(registry) {
          registerAsciidoctor.call(registry, asciidocOptions)
        },
      },
    ]
  })

  registerPostsExtension.call(context, { config })
}
