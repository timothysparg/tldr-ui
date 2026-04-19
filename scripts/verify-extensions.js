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
  assert.ok(asciidocExt.tocDataStore instanceof Map, 'asciidoc-tldr-ui must export .tocDataStore as a Map')

  // ── antora-tldr-ui export shape ───────────────────────────────────────────
  const antoraExt = require(antoraBundlePath)
  assert.strictEqual(typeof antoraExt.register, 'function', 'antora-tldr-ui must export .register')
  assert.strictEqual(antoraExt.register.length, 2, 'antora-tldr-ui.register must accept (context, env)')
  assert.strictEqual(typeof antoraExt.extractTocFromHtml, 'function', 'antora-tldr-ui must export .extractTocFromHtml')

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

  // ── TOC pipeline: postprocessor strips TOC, stores tocData in shared Map ──
  const tocRegistry = Asciidoctor.Extensions.create()
  asciidocExt.call(tocRegistry, {})
  // toc::[] places the TOC at that point in the body when toc=macro is set
  const tocDoc = '= Doc\n\ntoc::[]\n\n== Section One\n\nParagraph.\n\n== Section Two\n\nParagraph.'
  const tocDocObj = Asciidoctor.load(tocDoc, {
    safe: 'safe',
    attributes: { toc: 'macro' },
    extension_registry: tocRegistry,
  })
  const renderedWithToc = tocDocObj.convert()
  assert.ok(!renderedWithToc.includes('id="toc"'), 'postprocessor must strip inline TOC from body HTML')
  const tocJson = tocDocObj.getAttribute('page-toc')
  assert.ok(typeof tocJson === 'string', 'postprocessor must set page-toc attribute on doc')
  const tocItems = JSON.parse(tocJson)
  assert.strictEqual(tocItems.length, 2, 'page-toc must contain 2 top-level TOC items')
  assert.strictEqual(tocItems[0].title, 'Section One', 'first TOC item title must match section heading')

  // ── extractTocFromHtml: flat headings ────────────────────────────────────
  const { extractTocFromHtml } = antoraExt
  const flatHtml = `
    <h2 id="first">First</h2><p>p</p>
    <h2 id="second">Second</h2><p>p</p>
    <h2 id="third">Third</h2><p>p</p>
  `
  const flatItems = extractTocFromHtml(flatHtml)
  assert.strictEqual(flatItems.length, 3, 'extractTocFromHtml must return 3 flat items')
  assert.strictEqual(flatItems[0].url, '#first', 'extractTocFromHtml item url must be #id')
  assert.strictEqual(flatItems[0].title, 'First', 'extractTocFromHtml item title must match heading text')
  assert.deepStrictEqual(flatItems[0].children, [], 'flat heading must have no children')

  // ── extractTocFromHtml: nested headings ───────────────────────────────────
  const nestedHtml = `
    <h2 id="parent">Parent</h2>
    <h3 id="child-a">Child A</h3>
    <h3 id="child-b">Child B</h3>
    <h2 id="sibling">Sibling</h2>
  `
  const nestedItems = extractTocFromHtml(nestedHtml)
  assert.strictEqual(nestedItems.length, 2, 'nested HTML must produce 2 top-level items')
  assert.strictEqual(nestedItems[0].children.length, 2, 'parent must have 2 children')
  assert.strictEqual(nestedItems[0].children[0].title, 'Child A', 'first child title must match')
  assert.strictEqual(nestedItems[1].children.length, 0, 'sibling must have no children')

  // ── extractTocFromHtml strips inline markup from heading text ─────────────
  const markupHtml = '<h2 id="sec"><code>some</code> <em>heading</em></h2>'
  const markupItems = extractTocFromHtml(markupHtml)
  assert.strictEqual(markupItems[0].title, 'some heading', 'extractTocFromHtml must strip inline markup')

  // ── no-toc::[] fallback: tocDataStore gets [], extractTocFromHtml fills gap
  const noMacroRegistry = Asciidoctor.Extensions.create()
  asciidocExt.call(noMacroRegistry, {})
  const noMacroDoc = '= Doc\n\n== Alpha\n\nParagraph.\n\n=== Beta\n\nParagraph.'
  const noMacroDocObj = Asciidoctor.load(noMacroDoc, {
    safe: 'safe',
    attributes: { toc: 'macro' },
    extension_registry: noMacroRegistry,
  })
  const noMacroHtml = noMacroDocObj.convert()
  // Without toc::[] the postprocessor finds no <div id="toc"> to extract, so tocData is []
  const noMacroTocJson = noMacroDocObj.getAttribute('page-toc')
  const noMacroTocItems = JSON.parse(noMacroTocJson)
  assert.strictEqual(noMacroTocItems.length, 0, 'without toc::[] postprocessor must produce empty tocData')
  // The heading-extraction fallback must recover the TOC from the rendered HTML
  const fallbackItems = extractTocFromHtml(noMacroHtml)
  assert.ok(fallbackItems.length > 0, 'extractTocFromHtml fallback must find headings in rendered HTML')
  assert.strictEqual(fallbackItems[0].title, 'Alpha', 'fallback must find top-level heading')
  assert.strictEqual(fallbackItems[0].children[0].title, 'Beta', 'fallback must nest sub-heading correctly')

  console.log('verify-extensions: ok')
}

if (require.main === module) {
  module.exports().catch((e) => {
    console.error('verify-extensions: failed')
    console.error(e)
    process.exit(1)
  })
}
