'use strict'

const fs = require('fs')
const ospath = require('path')
const {
  transformerMetaHighlight,
  transformerMetaWordHighlight,
  transformerRenderIndentGuides,
  transformerRenderWhitespace,
} = require('@shikijs/transformers')
const { getDeviconDir, getIconName } = require('./devicon-config')

const iconCache = new Map()

function buildCodeHeader({ title = null, lang = null, console = false, copyText = '' } = {}) {
  let chipHtml = ''
  if (title) {
    chipHtml = `<div class="chip fill secondary code-filename">${escHtml(title)}</div>`
  } else if (lang && !console && lang !== 'console') {
    chipHtml = `<div class="chip fill secondary">${resolveIcon(lang)}<span>${escHtml(lang)}</span></div>`
  } else if (!console) {
    return ''
  }

  return (
    `<nav class="code-header padding surface-container">` +
    `${chipHtml}<div class="max"></div>` +
    `<button class="circle transparent copy-button" type="button" title="Copy to clipboard" aria-label="Copy code" data-copy-text="${escAttr(copyText)}">` +
    `<i>content_copy</i><div class="tooltip">Copy code</div>` +
    `</button></nav>`
  )
}

function getBlockLanguage(node) {
  const language = node.getAttribute('language') || node.getAttribute('lang')
  return language ? String(language).trim() : null
}

function isConsoleLiteral(node) {
  const source = node && node.getSource && node.getSource()
  return typeof source === 'string' && source.startsWith('$ ')
}

function resolveIcon(lang) {
  const iconName = getIconName(lang)
  return readCachedDevicon(iconName) || createCodeIcon('#6b7280')
}

function createCodeIcon(color) {
  return createSvg(
    '0 0 24 24',
    `<path stroke="${color}" d="m9 18-6-6 6-6"></path><path stroke="${color}" d="m15 6 6 6-6 6"></path>`
  )
}

function createSvg(viewBox, body) {
  return (
    `<svg viewBox="${viewBox}" aria-hidden="true" focusable="false" fill="none" ` +
    `stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`
  )
}

function readCachedDevicon(iconName) {
  const deviconDir = getDeviconDir()
  const iconPath = ospath.join(deviconDir, `${iconName}.svg`)
  if (iconCache.has(iconPath)) return iconCache.get(iconPath)
  try {
    const svg = cleanSvg(fs.readFileSync(iconPath, 'utf8'))
    iconCache.set(iconPath, svg)
  } catch {
    iconCache.set(iconPath, null)
  }
  return iconCache.get(iconPath)
}

function cleanSvg(svg) {
  return svg
    .replace(/<\?xml[^?]*\?>\s*/g, '')
    .replace(/<!DOCTYPE[^>]*>\s*/g, '')
    .trim()
}

function renderListingBlock(node, { title = null, lang = null } = {}) {
  const pre = lang ? renderHighlightedPre(node, lang) : renderPlainPre(node)
  return renderBlock('listingblock', node, pre, { copyText: buildCopyText(node), title, lang })
}

function renderLiteralBlock(node, { title = null, console = false } = {}) {
  const pre = console ? renderConsolePre(node) : renderPlainPre(node)
  return renderBlock('literalblock', node, pre, {
    copyText: buildCopyText(node, { console }),
    title,
    lang: console ? 'console' : null,
    console,
  })
}

function renderBlock(baseClass, node, preHtml, { title = null, lang = null, console = false, copyText = '' } = {}) {
  const attrs = buildBlockAttrs(baseClass, node)
  const header = buildCodeHeader({ title, lang, console, copyText })
  return `<div${attrs}>\n<div class="content">\n${header}${preHtml}\n</div>\n</div>`
}

function buildBlockAttrs(baseClass, node) {
  const attrs = []
  const id = node.getId()
  if (id) attrs.push(`id="${escAttr(id)}"`)
  const roles = node.getRoles()
  const className = roles.length ? `${baseClass} ${roles.join(' ')}` : baseClass
  attrs.push(`class="${escAttr(className)}"`)
  return attrs.length ? ' ' + attrs.join(' ') : ''
}

function renderHighlightedPre(node, lang) {
  return renderShikiPre(node, lang)
}

function renderPlainPre(node) {
  return `<pre>${node.getContent()}</pre>`
}

function renderConsolePre(node) {
  return renderShikiPre(node, 'shell')
}

function renderShikiPre(node, lang) {
  const { highlight } = require('./shiki-singleton')
  const source = node.getSource() || ''
  const { source: cleanSource, callouts: extractedCallouts } = extractCallouts(source)
  const shikiOptions = buildShikiOptions(node)
  let html = highlight(cleanSource, lang, shikiOptions)
  html = applyLineAnnotations(html, buildLineAnnotations(node))
  const callouts = mergeCallouts(extractedCallouts, buildConfiguredCallouts(node))
  if (callouts.size) html = injectCallouts(html, callouts)
  return html
}

function buildShikiOptions(node) {
  const transformers = []
  const metaTokens = []

  const highlightLines = normalizeAttr(node.getAttribute('code.highlight') || node.getAttribute('shiki-highlight'))
  if (highlightLines) {
    transformers.push(transformerMetaHighlight())
    metaTokens.push(`{${highlightLines}}`)
  }

  const highlightWords = normalizeWordList(node.getAttribute('code.word') || node.getAttribute('shiki-word-highlight'))
  if (highlightWords.length) {
    transformers.push(transformerMetaWordHighlight())
    metaTokens.push(...highlightWords.map((word) => `/${escapeMetaWord(word)}/`))
  }

  const whitespace = normalizeWhitespaceMode(
    node.getAttribute('code.whitespace') || node.getAttribute('shiki-whitespace')
  )
  if (whitespace) {
    transformers.push(transformerRenderWhitespace({ position: whitespace }))
  }

  const indentGuides = normalizeBooleanAttr(
    node.getAttribute('code.indent-guides') || node.getAttribute('shiki-indent-guides')
  )
  if (indentGuides) {
    const indent = normalizeIndentSize(node.getAttribute('code.indent') || node.getAttribute('shiki-indent'))
    transformers.push(transformerRenderIndentGuides(indent ? { indent } : {}))
  }

  return metaTokens.length ? { meta: { __raw: metaTokens.join(' ') }, transformers } : { transformers }
}

/**
 * Strip callout markers from source, recording which line each belongs to.
 * Handles <N>, <!--N-->, and auto-numbered <.> / <!--.--> forms.
 * Multiple markers per line are supported.
 *
 * @param {string} source raw AsciiDoc block source
 * @returns {{ source: string, callouts: Map<number, number[]> }}
 *   `callouts` maps 0-based line index → array of callout numbers (in order)
 */
function extractCallouts(source) {
  const callouts = new Map()
  let autoCounter = 1
  const cleanLines = source.split('\n').map((line, i) => {
    const numbers = []
    const clean = line.replace(/[ \t]+(?:<(\d+|\.+)>|<!--(\d+|\.)-->)/g, (_, a, b) => {
      const raw = a || b
      const n = raw === '.' || raw === '..' ? autoCounter++ : parseInt(raw, 10)
      numbers.push(n)
      return ''
    })
    if (numbers.length) callouts.set(i, numbers)
    return clean.replace(/[ \t]+$/, '')
  })
  return { source: cleanLines.join('\n'), callouts }
}

/**
 * Inject Asciidoctor callout icons into Shiki-generated HTML.
 * Shiki wraps each source line in `<span class="line">...</span>` separated by \n.
 * We insert `<i class="conum" data-value="N"></i><b>(N)</b>` at the end of the
 * matching line spans.
 *
 * @param {string} html   Shiki output HTML
 * @param {Map<number, number[]>} callouts  line index → callout numbers
 * @returns {string}
 */
function injectCallouts(html, callouts) {
  return html.replace(/(<code>)([\s\S]*?)(<\/code>)/, (_, open, content, close) => {
    const lines = content.split('\n')
    const patched = lines.map((line, i) => {
      const numbers = callouts.get(i)
      if (!numbers || !line.startsWith('<span class="line">')) return line
      const icons = numbers.map((n) => `<span class="conum" data-value="${n}"></span>`).join('')
      // Insert icons before the closing </span> of the line wrapper
      return line.slice(0, -'</span>'.length) + icons + '</span>'
    })
    return open + patched.join('\n') + close
  })
}

function escHtml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function escAttr(str) {
  return escHtml(str)
}

function buildCopyText(node, { console = false } = {}) {
  const { source: cleanSource } = extractCallouts(node.getSource() || '')
  const source = normalizeCopyText(cleanSource)
  return console ? extractCommands(source) : source
}

function normalizeCopyText(text) {
  if (!text) return ''
  return String(text)
    .replace(/\s*〈\s*\d+\s*〉/g, '')
    .replace(/\s*(;;|\/\/)\s*\(\d+\)/g, '')
    .replace(/ +$/gm, '')
}

function normalizeAttr(value) {
  return value == null ? '' : String(value).trim()
}

function normalizeBooleanAttr(value) {
  if (value == null || value === '') return false
  const normalized = String(value).trim().toLowerCase()
  return normalized !== 'false' && normalized !== '0' && normalized !== 'no'
}

function normalizeWordList(value) {
  return normalizeAttr(value)
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
}

function escapeMetaWord(word) {
  return word.replace(/[\\/]/g, '\\$&')
}

function normalizeWhitespaceMode(value) {
  const normalized = normalizeAttr(value).toLowerCase()
  if (!normalized) return null
  if (normalized === 'true') return 'all'
  if (['all', 'boundary', 'leading', 'trailing'].includes(normalized)) return normalized
  return null
}

function normalizeIndentSize(value) {
  const normalized = normalizeAttr(value)
  if (!normalized) return null
  const parsed = Number.parseInt(normalized, 10)
  return Number.isNaN(parsed) || parsed <= 0 ? null : parsed
}

function buildLineAnnotations(node) {
  const lines = new Map()
  const preClasses = new Set()

  if (normalizeAttr(node.getAttribute('code.highlight') || node.getAttribute('shiki-highlight'))) {
    preClasses.add('has-highlighted')
  }
  addLineAnnotation(lines, preClasses, node.getAttribute('code.add'), ['diff', 'add'], 'has-diff')
  addLineAnnotation(lines, preClasses, node.getAttribute('code.remove'), ['diff', 'remove'], 'has-diff')
  addLineAnnotation(lines, preClasses, node.getAttribute('code.focus'), ['focused'], 'has-focused')
  addLineAnnotation(lines, preClasses, node.getAttribute('code.warning'), ['highlighted', 'warning'], 'has-highlighted')
  addLineAnnotation(lines, preClasses, node.getAttribute('code.error'), ['highlighted', 'error'], 'has-highlighted')
  addLineAnnotation(lines, preClasses, node.getAttribute('code.info'), ['highlighted', 'info'], 'has-highlighted')

  return { lines, preClasses }
}

function addLineAnnotation(lines, preClasses, spec, classes, preClass) {
  const lineNumbers = parseLineSpec(spec)
  if (!lineNumbers.length) return
  if (preClass) preClasses.add(preClass)
  for (const lineNumber of lineNumbers) {
    const lineIndex = lineNumber - 1
    if (lineIndex < 0) continue
    const lineClasses = lines.get(lineIndex) || new Set()
    for (const className of classes) lineClasses.add(className)
    lines.set(lineIndex, lineClasses)
  }
}

function parseLineSpec(spec) {
  const normalized = normalizeAttr(spec)
  if (!normalized) return []
  const lines = new Set()
  for (const part of normalized.split(',')) {
    const trimmed = part.trim()
    if (!trimmed) continue
    const range = trimmed.match(/^(\d+)\s*-\s*(\d+)$/)
    if (range) {
      const start = Number.parseInt(range[1], 10)
      const end = Number.parseInt(range[2], 10)
      if (Number.isNaN(start) || Number.isNaN(end)) continue
      const from = Math.min(start, end)
      const to = Math.max(start, end)
      for (let line = from; line <= to; line += 1) lines.add(line)
      continue
    }
    const line = Number.parseInt(trimmed, 10)
    if (!Number.isNaN(line)) lines.add(line)
  }
  return Array.from(lines).sort((a, b) => a - b)
}

function applyLineAnnotations(html, { lines, preClasses }) {
  if (!lines.size && !preClasses.size) return html
  let output = html
  if (preClasses.size) {
    output = output.replace(/<pre\b([^>]*)class="([^"]*)"/, (_, attrs, classValue) => {
      const classNames = new Set(classValue.split(/\s+/).filter(Boolean))
      for (const className of preClasses) classNames.add(className)
      return `<pre${attrs}class="${Array.from(classNames).join(' ')}"`
    })
  }
  return output.replace(/(<code>)([\s\S]*?)(<\/code>)/, (_, open, content, close) => {
    const patched = content.split('\n').map((line, index) => {
      const classes = lines.get(index)
      if (!classes || !line.startsWith('<span class="line')) return line
      return line.replace(/class="([^"]*)"/, (match, classValue) => {
        const classNames = new Set(classValue.split(/\s+/).filter(Boolean))
        for (const className of classes) classNames.add(className)
        return `class="${Array.from(classNames).join(' ')}"`
      })
    })
    return open + patched.join('\n') + close
  })
}

function buildConfiguredCallouts(node) {
  const lineNumbers = parseLineSpec(node.getAttribute('code.callout'))
  if (!lineNumbers.length) return new Map()
  const callouts = new Map()
  lineNumbers.forEach((lineNumber, index) => {
    const lineIndex = lineNumber - 1
    if (lineIndex < 0) return
    callouts.set(lineIndex, [index + 1])
  })
  return callouts
}

function mergeCallouts(primary, secondary) {
  if (!secondary.size) return primary
  const merged = new Map(primary)
  for (const [lineIndex, numbers] of secondary) {
    const existing = merged.get(lineIndex) || []
    merged.set(lineIndex, existing.concat(numbers))
  }
  return merged
}

function extractCommands(text) {
  const commands = []
  let current = null

  for (const line of String(text || '').split('\n')) {
    if (line.startsWith('$ ')) {
      if (current) commands.push(current)
      current = line.slice(2)
      continue
    }

    if (!current) continue

    if (current.endsWith('\\')) {
      current = current.slice(0, -1) + line.replace(/^ */, '')
      continue
    }

    commands.push(current)
    current = null
  }

  if (current) commands.push(current)
  return commands.join(' && ')
}

module.exports = {
  getBlockLanguage,
  isConsoleLiteral,
  renderListingBlock,
  renderLiteralBlock,
}
