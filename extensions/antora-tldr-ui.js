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

  registerPostsExtension.call(context, { config })
}

module.exports.getAsciidocOptions = getAsciidocOptions
