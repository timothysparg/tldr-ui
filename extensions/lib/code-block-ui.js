'use strict'

const fs = require('fs')
const ospath = require('path')
const { getDeviconDir, getIconName } = require('./devicon-config')

const iconCache = new Map()

function buildCodeHeader({ title = null, lang = null, console = false } = {}) {
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
    `<button class="circle transparent copy-button" title="Copy to clipboard">` +
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
  return renderBlock('listingblock', node, pre, { title, lang })
}

function renderLiteralBlock(node, { title = null, console = false } = {}) {
  const pre = console ? renderConsolePre(node) : renderPlainPre(node)
  return renderBlock('literalblock', node, pre, { title, lang: console ? 'console' : null, console })
}

function renderBlock(baseClass, node, preHtml, { title = null, lang = null, console = false } = {}) {
  const attrs = buildBlockAttrs(baseClass, node)
  const header = buildCodeHeader({ title, lang, console })
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
  const language = escAttr(lang)
  return (
    `<pre class="highlightjs highlight"><code class="language-${language} hljs" data-lang="${language}">` +
    `${node.getContent()}</code></pre>`
  )
}

function renderPlainPre(node) {
  return `<pre>${node.getContent()}</pre>`
}

function renderConsolePre(node) {
  return `<pre class="highlightjs highlight scroll"><code class="language-console hljs" data-lang="console">${node.getContent()}</code></pre>`
}

function escHtml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function escAttr(str) {
  return escHtml(str)
}

module.exports = {
  getBlockLanguage,
  isConsoleLiteral,
  renderListingBlock,
  renderLiteralBlock,
}
