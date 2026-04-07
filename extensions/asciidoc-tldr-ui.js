'use strict'

const ensureDeviconCache = require('./lib/ensure-devicon-cache')
const registerHtml5Converter = require('./lib/register-html5-converter')
const syncDevicons = require('./lib/sync-devicons')
const { setDeviconRuntimeConfig } = require('./lib/devicon-config')

function normalizeContext(context = {}) {
  return {
    ...context,
    deviconDir: context.deviconDir || context.devicon_dir,
    directIconUrls: context.directIconUrls || context.direct_icon_urls,
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

module.exports.register = function (maybeContext, explicitContext = {}) {
  const context = normalizeContext(maybeContext && maybeContext.Asciidoctor ? maybeContext : explicitContext)
  setDeviconRuntimeConfig(context)
  ensureDeviconCache({ ...context, extensionFile: __filename })
  registerHtml5Converter(context)
}
