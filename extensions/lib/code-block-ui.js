'use strict'

const fs = require('fs')
const ospath = require('path')
const {
  transformerMetaWordHighlight,
  transformerRenderIndentGuides,
  transformerRenderWhitespace,
} = require('@shikijs/transformers')
const { getDeviconDir, getIconName } = require('./devicon-config')
const { transformerLineAnnotations, transformerAdocCallouts } = require('./shiki-transformers')

const iconCache = new Map()

function buildCodeHeader({ title = null, lang = null, console = false, copyText = '' } = {}) {
  let metaHtml = ''
  let label = ''

  if (title) {
    label = title
  } else if (lang && lang !== 'console') {
    label = lang
  } else if (console) {
    label = 'console'
  }

  if (!label && !console) return ''

  const iconHtml =
    lang && !console && lang !== 'console' ? `<div class="code-lang-icon">${resolveIcon(lang)}</div>` : ''
  metaHtml =
    `<div class="code-header-meta">` +
    `${iconHtml}` +
    `<div class="code-header-label">${escHtml(label)}</div>` +
    `</div>`

  return (
    `<nav class="code-header">` +
    `${metaHtml}<div class="max"></div>` +
    `<button class="code-copy-button" type="button" aria-label="Copy code" data-copy-text="${escAttr(copyText)}">` +
    `<span class="material-symbols-outlined" aria-hidden="true">content_copy</span>` +
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

function renderColistBlock(node, baseConverter) {
  const attrs = buildBlockAttrs('colist', node)
  const items = node.getItems ? node.getItems() : []
  const listHtml = items
    .map((item, index) => {
      const number = index + 1
      const text = item.getText ? item.getText() : ''
      const blockHtml = item.getBlocks
        ? item
            .getBlocks()
            .map((block) => baseConverter.convert(block, block.getNodeName()))
            .join('\n')
        : ''
      const contentHtml = [text ? `<p>${text}</p>` : '', blockHtml].filter(Boolean).join('\n')
      return (
        `<li>` +
        `<span class="circle primary" aria-hidden="true">${number}</span>` +
        `<div class="max"><div class="small-text">${contentHtml}</div></div>` +
        `</li>`
      )
    })
    .join('\n')
  return `<div${attrs}>\n<ul class="list">\n${listHtml}\n</ul>\n</div>`
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
  const { source: cleanSource, callouts } = extractCallouts(source)
  const shikiOptions = buildShikiOptions(node, callouts)
  return highlight(cleanSource, lang, shikiOptions)
}

function buildShikiOptions(node, callouts) {
  const transformers = [transformerLineAnnotations(node)]
  const metaTokens = []

  if (callouts.size) {
    transformers.push(transformerAdocCallouts(callouts))
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

function normalizeWordList(value) {
  return normalizeAttr(value)
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
}

function normalizeBooleanAttr(value) {
  if (value == null || value === '') return false
  const normalized = String(value).trim().toLowerCase()
  return normalized !== 'false' && normalized !== '0' && normalized !== 'no'
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

function escapeMetaWord(value) {
  return String(value).replace(/[\\/[|{}]/g, '\\$&')
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
  renderColistBlock,
  renderListingBlock,
  renderLiteralBlock,
}
