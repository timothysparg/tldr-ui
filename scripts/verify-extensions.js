'use strict'

const assert = require('assert')
const fs = require('fs')
const ospath = require('path')

const buildDir = ospath.join(__dirname, '..', 'build', 'extensions')
const asciidocBundlePath = ospath.join(buildDir, 'asciidoc-tldr-ui.js')
const antoraBundlePath = ospath.join(buildDir, 'antora-tldr-ui.js')

module.exports = async function verifyExtensions() {
  if (!fs.existsSync(buildDir)) {
    throw new Error(`Extension bundles not found at ${buildDir}. Run the build before verifying.`)
  }

  // ── asciidoc-tldr-ui export shape ─────────────────────────────────────────
  const asciidocExt = require(asciidocBundlePath)
  assert.strictEqual(typeof asciidocExt, 'function', 'asciidoc-tldr-ui must export a callable function')
  assert.strictEqual(typeof asciidocExt.register, 'function', 'asciidoc-tldr-ui must export .register')
  assert.strictEqual(typeof asciidocExt.initHighlighter, 'function', 'asciidoc-tldr-ui must export .initHighlighter')

  // ── antora-tldr-ui export shape ───────────────────────────────────────────
  const antoraExt = require(antoraBundlePath)
  assert.strictEqual(typeof antoraExt.register, 'function', 'antora-tldr-ui must export .register')
  assert.strictEqual(antoraExt.register.length, 2, 'antora-tldr-ui.register must accept (context, env)')

  // ── antora bundle delegates to sibling, not re-embeds Shiki ──────────────
  // The bundle must contain a runtime require of the sibling file rather than
  // inlining its contents.
  const antoraBundleSource = fs.readFileSync(antoraBundlePath, 'utf8')
  assert.ok(
    antoraBundleSource.includes('require("./asciidoc-tldr-ui")'),
    'antora-tldr-ui.js must require("./asciidoc-tldr-ui") at runtime — Shiki must not be re-bundled inside it'
  )

  // ── functional render tests (all entry-point calling conventions) ─────────
  await asciidocExt.initHighlighter({})
  const Asciidoctor = require('@asciidoctor/core')()

  const adocSource = '[source,javascript]\n----\nconst x = 1\n----'
  const loadOpts = { safe: 'safe', attributes: { experimental: '', icons: 'font' } }

  async function renderWith(registerFn) {
    const registry = Asciidoctor.Extensions.create()
    registerFn(registry)
    const html = Asciidoctor.load(adocSource, { ...loadOpts, extension_registry: registry }).convert()
    assert.ok(html.includes('code-header'), 'rendered HTML must contain code-header nav')
    assert.ok(html.includes('code-copy-button'), 'rendered HTML must contain copy button')
    assert.ok(html.includes('shiki'), 'rendered HTML must contain Shiki-highlighted code')
    // Each registry is a fresh instance; reset the registration guard
    registry.__tldr_registered = false
    return html
  }

  // Convention 1: ext.call(registry, context) — registry as `this`
  await renderWith((registry) => asciidocExt.call(registry, {}))

  // Convention 2: ext(registry, context) — registry as first argument
  await renderWith((registry) => {
    registry.__tldr_registered = false
    asciidocExt(registry, {})
  })

  // Convention 3: ext(asciidoctor, context) — Asciidoctor instance triggers Extensions.register
  // This path registers globally, so we exercise it separately and clean up afterwards.
  await asciidocExt.initHighlighter({})
  const globalRegistry = Asciidoctor.Extensions.create()
  const asciidoctorStub = { Extensions: { register: (fn) => fn.call(globalRegistry) } }
  asciidocExt(asciidoctorStub, {})
  const htmlViaInstance = Asciidoctor.load(adocSource, { ...loadOpts, extension_registry: globalRegistry }).convert()
  assert.ok(htmlViaInstance.includes('code-header'), 'Asciidoctor-instance entry point must produce code-header')

  console.log('verify-extensions: ok')
}
