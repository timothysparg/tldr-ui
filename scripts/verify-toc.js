'use strict'

const assert = require('assert')
const { processDocument } = require('../extensions/lib/document-pipeline')
const tocHelper = require('../src/helpers/toc')

function verifyToc () {
  console.log('verify-toc: starting tests...')

  // ── Test 1: Simple TOC Extraction ─────────────────────────────────────────
  const html = '<div id="toc"><ul><li><a href="#_h1">H1</a></li></ul></div><p>Content</p>'
  const result = processDocument(html, { removeToc: true })

  assert.ok(Array.isArray(result.tocData), 'tocData should be an array')
  assert.strictEqual(result.tocData.length, 1, 'tocData should have 1 item')
  assert.strictEqual(result.tocData[0].title, 'H1', 'Item title should match')
  assert.strictEqual(result.tocData[0].url, '#_h1', 'Item URL should match')
  assert.ok(!result.html.includes('id="toc"'), 'Inline TOC should be removed when removeToc is true')

  // ── Test 2: Nested TOC Extraction ─────────────────────────────────────────
  const nestedHtml = `
    <div id="toc">
      <ul>
        <li>
          <a href="#_p1">P1</a>
          <ul><li><a href="#_c1">C1</a></li></ul>
        </li>
      </ul>
    </div>`
  const nestedResult = processDocument(nestedHtml)
  assert.strictEqual(nestedResult.tocData.length, 1, 'Should extract parent')
  assert.strictEqual(nestedResult.tocData[0].children.length, 1, 'Should extract children')
  assert.strictEqual(nestedResult.tocData[0].children[0].title, 'C1', 'Child title should match')

  // ── Test 3: data-copy-text newline encoding ───────────────────────────────
  // rehype-parse decodes &#10; to \n in HAST; rehype-stringify does not re-encode.
  // The post-stringify regex in processDocument must restore &#10; for copy fidelity.
  const encodedHtml = '<pre data-copy-text="line1&#10;line2">code</pre>'
  const encodedResult = processDocument(encodedHtml)
  assert.ok(
    encodedResult.html.includes('data-copy-text="line1&#10;line2"'),
    'pre-encoded &#10; must survive the rehype round-trip'
  )

  const rawNewlineHtml = '<pre data-copy-text="line1\nline2">code</pre>'
  const rawNewlineResult = processDocument(rawNewlineHtml)
  assert.ok(
    rawNewlineResult.html.includes('data-copy-text="line1&#10;line2"'),
    'raw newlines in data-copy-text must be encoded to &#10;'
  )
  assert.ok(
    !rawNewlineResult.html.match(/data-copy-text="[^"]*\n[^"]*"/),
    'data-copy-text must not contain raw newlines after processing'
  )

  // ── Test 4: TOC Helper (Preview vs Antora flow) ───────────────────────────
  const rawData = [{ title: 'Test', url: '#test', children: [] }]
  assert.deepStrictEqual(tocHelper(rawData), rawData, 'Helper should return array as-is (Preview flow)')
  assert.deepStrictEqual(tocHelper(JSON.stringify(rawData)), rawData, 'Helper should parse JSON string (Antora flow)')
  assert.deepStrictEqual(tocHelper(null), [], 'Helper should return empty array for null')

  console.log('verify-toc: ok')
}

if (require.main === module) {
  try {
    verifyToc()
  } catch (e) {
    console.error('verify-toc: failed')
    console.error(e)
    process.exit(1)
  }
}

module.exports = verifyToc
