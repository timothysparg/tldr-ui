'use strict'

const ensureDeviconCache = require('./lib/ensure-devicon-cache')
const registerCodeCalloutPreprocessor = require('./lib/register-code-callout-preprocessor')
const registerHtml5Converter = require('./lib/register-html5-converter')
const registerTldrAdmonition = require('./lib/register-tldr-admonition')
const registerTocLevels = require('./lib/register-toc-levels')
const syncDevicons = require('./lib/sync-devicons')
const { setDeviconRuntimeConfig } = require('./lib/devicon-config')

function normalizeContext(context = {}) {
  return {
    ...context,
    deviconDir: context.deviconDir || context.devicon_dir,
    directIconUrls: context.directIconUrls || context.direct_icon_urls,
    iconDiscoveryRoots: context.iconDiscoveryRoots || context.icon_discovery_roots,
    projectRoot: context.projectRoot || context.project_root || process.cwd(),
  }
}

if (require.main === module && process.argv[2] === '--sync-devicons') {
  const config = normalizeContext(JSON.parse(process.argv[3] || '{}'))
  setDeviconRuntimeConfig(config)
  syncDevicons(config).catch((err) => {
    console.error(err.stack || err.message)
    process.exit(1)
  })
}

module.exports.initHighlighter = (options = {}) => require('./lib/shiki-singleton').initHighlighter(options)

module.exports.register = function (maybeContext, explicitContext = {}) {
  const context = normalizeContext(maybeContext && maybeContext.Asciidoctor ? maybeContext : explicitContext)
  setDeviconRuntimeConfig(context)
  ensureDeviconCache({ ...context, extensionFile: __filename })
  registerHtml5Converter(context)

  const registry = typeof this.block === 'function' ? this : maybeContext
  if (registry && typeof registry.block === 'function') {
    registerCodeCalloutPreprocessor(registry)
    registerTldrAdmonition(registry)
    registerTocLevels(registry)
  }
}
