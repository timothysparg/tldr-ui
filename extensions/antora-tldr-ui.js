'use strict'

const Asciidoctor = require('@asciidoctor/core')()
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

  context.on('asciidocConfigured', ({ asciidocConfig }) => {
    const asciidocOptions = config.asciidoc || {}
    const asciidoctor = context.asciidoctor || this.asciidoctor

    if (asciidoctor) {
      registerAsciidoctor(asciidoctor, asciidocOptions)
    } else {
      asciidocConfig.extensions.push((registry) =>
        registerAsciidoctor(registry, {
          ...asciidocOptions,
          Asciidoctor,
        })
      )
    }
  })

  registerPostsExtension.call(context, { config })
}
