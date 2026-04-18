'use strict'

const assert = require('assert')
const fs = require('fs')
const os = require('os')
const ospath = require('path')

const discoverCodeLanguages = require('../extensions/lib/discover-code-languages')
const {
  getDeviconDir,
  getDirectIconUrls,
  getIconName,
  setDeviconRuntimeConfig,
} = require('../extensions/lib/devicon-config')
const ensureDeviconCache = require('../extensions/lib/ensure-devicon-cache')

const projectRoot = ospath.resolve(__dirname, '..')
const expectedLanguages = [
  'asciidoc',
  'bash',
  'clojure',
  'css3',
  'docker',
  'html5',
  'javascript',
  'json',
  'pkl',
  'python',
  'ruby',
  'toml',
  'typescript',
]
const directIconUrls = {
  asciidoc: 'https://raw.githubusercontent.com/asciidoctor/asciidoctor-ui/main/src/img/icon-note.svg',
  pkl: 'https://raw.githubusercontent.com/apple/pkl-lang.org/refs/heads/main/src/supplemental-ui/img/favicon.svg',
  toml: 'https://raw.githubusercontent.com/toml-lang/toml/refs/heads/main/logos/toml.svg',
}

module.exports = function verifyDevicons() {
  const discoveredLanguages = discoverCodeLanguages({ projectRoot })
  assert.deepStrictEqual(discoveredLanguages, expectedLanguages)

  assert.strictEqual(getIconName('html'), 'html5')
  assert.strictEqual(getIconName('css'), 'css3')
  assert.strictEqual(getIconName('js'), 'javascript')

  setDeviconRuntimeConfig({ projectRoot, directIconUrls })
  assert.strictEqual(getDeviconDir(), ospath.join(projectRoot, 'build', 'devicons'))
  assert.deepStrictEqual(getDirectIconUrls(), directIconUrls)

  const tmpDir = fs.mkdtempSync(ospath.join(os.tmpdir(), 'tldr-ui-icons-'))
  const tmpIconsDir = ospath.join(tmpDir, 'devicons')
  fs.mkdirSync(tmpIconsDir, { recursive: true })
  fs.writeFileSync(ospath.join(tmpIconsDir, 'html5.svg'), '<svg></svg>\n', 'utf8')

  ensureDeviconCache({
    deviconDir: 'devicons',
    extensionFile: ospath.join(projectRoot, 'extensions', 'asciidoc-tldr-ui.js'),
    projectRoot: tmpDir,
    requiredIcons: ['html5', 'definitely-not-a-real-icon'],
  })

  assert.ok(fs.existsSync(ospath.join(tmpIconsDir, 'html5.svg')))
  console.log('verify-devicons: ok')
}
