'use strict'

const registerPostsExtension = require('./lib/register-posts-extension')
const { initHighlighter } = require('./lib/shiki-singleton')
const registerAsciidoctor = require('./asciidoc-tldr-ui')

function getAsciidocOptions(config = {}) {
  const nested = config.asciidoc || {}
  const directIconUrls =
    nested.directIconUrls || nested.direct_icon_urls || config.directIconUrls || config.direct_icon_urls
  const strictIcons =
    typeof nested.strictIcons === 'boolean'
      ? nested.strictIcons
      : (nested.strict_icons ?? (typeof config.strictIcons === 'boolean' ? config.strictIcons : config.strict_icons))
  const iconDiscoveryRoots =
    nested.iconDiscoveryRoots || nested.icon_discovery_roots || config.iconDiscoveryRoots || config.icon_discovery_roots
  const projectRoot =
    nested.projectRoot || nested.project_root || config.projectRoot || config.project_root || process.cwd()
  return {
    ...nested,
    directIconUrls,
    strictIcons,
    iconDiscoveryRoots,
    projectRoot,
  }
}

/**
 * Antora extension registration function.
 */
module.exports.register = function (context, { config } = {}) {
  if (!context || typeof context.on !== 'function') return

  config = config || (context && context.config) || {}
  const shikiOptions = config.shiki || {}

  context.on('contentClassified', async () => {
    await initHighlighter(shikiOptions)
  })

  context.on('beforeProcess', ({ siteAsciiDocConfig }) => {
    const asciidocOptions = getAsciidocOptions(config)
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
