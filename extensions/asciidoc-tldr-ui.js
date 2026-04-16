'use strict'

const ospath = require('path')
const ensureDeviconCache = require('./lib/ensure-devicon-cache')
const registerCodeCalloutPreprocessor = require('./lib/register-code-callout-preprocessor')
const registerHtml5Converter = require('./lib/register-html5-converter')
const registerTldrAdmonition = require('./lib/register-tldr-admonition')
const registerTocLevels = require('./lib/register-toc-levels')
const syncDevicons = require('./lib/sync-devicons')
const { setDeviconRuntimeConfig } = require('./lib/devicon-config')
const { processDocument } = require('./lib/document-pipeline')

const uiRoot = ospath.resolve(__dirname, '..')

function normalizeContext(context = {}) {
  return {
    ...context,
    deviconDir: context.deviconDir || context.devicon_dir,
    directIconUrls: context.directIconUrls || context.direct_icon_urls,
    iconDiscoveryRoots: context.iconDiscoveryRoots || context.icon_discovery_roots,
    projectRoot: context.projectRoot || context.project_root || uiRoot,
  }
}

// Restore safe require.main guard
if (require.main === module && process.argv[2] === '--sync-devicons') {
  const config = normalizeContext(JSON.parse(process.argv[3] || '{}'))
  setDeviconRuntimeConfig(config)
  syncDevicons(config).catch((err) => {
    console.error(err.stack || err.message)
    process.exit(1)
  })
}

/**
 * Asciidoctor extension registration function.
 *
 * This function handles the complex task of registering the TLDR UI extensions across
 * different execution environments (standalone Asciidoctor vs. Antora-scoped).
 *
 * Key responsibilities:
 * 1. Context Normalization: Ensures paths and configuration (like Devicon settings)
 *    are stable and accessible regardless of how the extension was invoked.
 * 2. Registry Detection: Identifies whether it is being called in a scoped context
 *    (as a factory function) or needs to register on a global Asciidoctor instance.
 * 3. Double-Registration Guard: Uses a flag on the registry to prevent redundant
 *    processing, which is critical when auto-registered by the Antora extension.
 * 4. Component Setup: Synchronizes Devicons, registers the custom HTML5 converter,
 *    and attaches block processors and postprocessors to the registry.
 */
module.exports = function (maybeContext, explicitContext = {}) {
  // Determine registry and configuration context
  const registry =
    this && typeof this.block === 'function'
      ? this
      : maybeContext && typeof maybeContext.block === 'function'
        ? maybeContext
        : null

  // If the first argument was the registry, the second argument (explicitContext) is the config.
  // If the first argument was the Asciidoctor instance, it might also be the config source.
  const configSource = registry === maybeContext ? explicitContext : maybeContext || explicitContext
  const context = normalizeContext(configSource)

  if (registry) {
    if (registry.__tldr_registered) return
    registry.__tldr_registered = true

    setDeviconRuntimeConfig(context)
    ensureDeviconCache({ ...context, extensionFile: __filename })

    // Try to pass the registry itself as a hint to find Asciidoctor
    registerHtml5Converter.call(registry, context)

    registerCodeCalloutPreprocessor(registry)
    registerTldrAdmonition(registry)
    registerTocLevels(registry)

    registry.postprocessor(function () {
      this.process((doc, output) => {
        const { tocHtml } = processDocument(output)
        doc.setAttribute('toc-html', tocHtml)
        return output
      })
    })
  } else if (maybeContext && typeof maybeContext.Extensions === 'object') {
    // maybeContext is the Asciidoctor instance
    maybeContext.Extensions.register(function () {
      module.exports.call(this, context)
    })
  }
}

module.exports.register = module.exports
module.exports.initHighlighter = (options = {}) => require('./lib/shiki-singleton').initHighlighter(options)
