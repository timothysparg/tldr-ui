'use strict'

const assert = require('assert')

const antoraExtension = require('../extensions/antora-tldr-ui')
const { getAsciidocOptions } = require('../extensions/lib/antora-config')

module.exports = function verifyAntoraConfig() {
  assert.strictEqual(antoraExtension.register.length, 2)

  const nestedWins = getAsciidocOptions(
    {
      asciidoc: { direct_icon_urls: { toml: 'nested-toml' }, strict_icons: true, project_root: '/nested-root' },
      data: { direct_icon_urls: { toml: 'data-toml' }, strict_icons: false, project_root: '/data-root' },
      direct_icon_urls: { toml: 'flat-toml' },
      strict_icons: false,
      project_root: '/flat-root',
    },
    '/cwd-root'
  )
  assert.strictEqual(nestedWins.directIconUrls.toml, 'nested-toml')
  assert.strictEqual(nestedWins.strictIcons, true)
  assert.strictEqual(nestedWins.projectRoot, '/nested-root')

  const dataPayload = getAsciidocOptions(
    {
      data: {
        direct_icon_urls: { toml: 'data-toml' },
        strict_icons: true,
        icon_discovery_roots: ['docs', 'preview-src'],
        project_root: '/data-root',
      },
    },
    '/cwd-root'
  )
  assert.strictEqual(dataPayload.directIconUrls.toml, 'data-toml')
  assert.strictEqual(dataPayload.strictIcons, true)
  assert.deepStrictEqual(dataPayload.iconDiscoveryRoots, ['docs', 'preview-src'])
  assert.strictEqual(dataPayload.projectRoot, '/data-root')

  const antoraEnvPayload = getAsciidocOptions(
    {
      data: {
        asciidoc: {
          direct_icon_urls: { toml: 'env-data-toml' },
        },
      },
    },
    '/cwd-root'
  )
  assert.strictEqual(antoraEnvPayload.directIconUrls.toml, 'env-data-toml')

  console.log('verify-antora-config: ok')
}
