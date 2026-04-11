'use strict'

/**
 * A set of custom Shiki HAST transformers for Asciidoctor-specific code block enhancements.
 */

/**
 * Parses a line specification (e.g., "1,3-5,10") into a Set of 1-based line numbers.
 * @param {string} spec
 * @returns {Set<number>}
 */
function parseLineSpec(spec) {
  const lines = new Set()
  if (!spec || typeof spec !== 'string') return lines
  for (const part of spec.split(',')) {
    const trimmed = part.trim()
    if (!trimmed) continue
    const range = trimmed.match(/^(\d+)\s*-\s*(\d+)$/)
    if (range) {
      const start = parseInt(range[1], 10)
      const end = parseInt(range[2], 10)
      if (isNaN(start) || isNaN(end)) continue
      const from = Math.min(start, end)
      const to = Math.max(start, end)
      for (let i = from; i <= to; i++) lines.add(i)
    } else {
      const n = parseInt(trimmed, 10)
      if (!isNaN(n)) lines.add(n)
    }
  }
  return lines
}

/**
 * Adds one or more classes to a HAST node's properties.
 * @param {object} node
 * @param {string|string[]} classes
 */
function addClass(node, classes) {
  const current = node.properties.class || node.properties.className || ''
  const list = Array.isArray(current) ? current : String(current).split(/\s+/).filter(Boolean)
  const toAdd = Array.isArray(classes) ? classes : [classes]
  for (const cls of toAdd) {
    if (!list.includes(cls)) list.push(cls)
  }
  node.properties.class = list.join(' ')
  delete node.properties.className
}

/**
 * Factory for a transformer that applies line-based styles (diff, focus, highlight, severity).
 * @param {object} adocNode The Asciidoctor block node
 * @returns {import('shiki').ShikiTransformer}
 */
function transformerLineAnnotations(adocNode) {
  const annotations = {
    add: parseLineSpec(adocNode.getAttribute('code.add')),
    remove: parseLineSpec(adocNode.getAttribute('code.remove')),
    focus: parseLineSpec(adocNode.getAttribute('code.focus')),
    highlight: parseLineSpec(adocNode.getAttribute('code.highlight') || adocNode.getAttribute('shiki-highlight')),
    warning: parseLineSpec(adocNode.getAttribute('code.warning')),
    error: parseLineSpec(adocNode.getAttribute('code.error')),
    info: parseLineSpec(adocNode.getAttribute('code.info')),
  }

  const preClasses = []
  if (annotations.add.size || annotations.remove.size) preClasses.push('has-diff')
  if (annotations.focus.size) preClasses.push('has-focused')
  if (annotations.highlight.size || annotations.warning.size || annotations.error.size || annotations.info.size) {
    preClasses.push('has-highlighted')
  }

  return {
    name: 'adoc-line-annotations',
    pre(node) {
      if (preClasses.length) addClass(node, preClasses)
    },
    line(node, line) {
      const classes = []
      if (annotations.add.has(line)) classes.push('diff', 'add')
      if (annotations.remove.has(line)) classes.push('diff', 'remove')
      if (annotations.focus.has(line)) classes.push('focused')
      if (annotations.highlight.has(line)) classes.push('highlighted')
      if (annotations.warning.has(line)) classes.push('highlighted', 'warning')
      if (annotations.error.has(line)) classes.push('highlighted', 'error')
      if (annotations.info.has(line)) classes.push('highlighted', 'info')

      if (classes.length) addClass(node, classes)
    },
  }
}

/**
 * Factory for a transformer that injects Asciidoctor callout icons.
 * @param {Map<number, number[]>} calloutMap 0-indexed line number to array of callout numbers
 * @returns {import('shiki').ShikiTransformer}
 */
function transformerAdocCallouts(calloutMap) {
  return {
    name: 'adoc-callouts',
    line(node, line) {
      const numbers = calloutMap.get(line - 1)
      if (!numbers || !numbers.length) return

      for (const n of numbers) {
        node.children.push({
          type: 'element',
          tagName: 'span',
          properties: {
            class: 'conum',
            'data-value': n.toString(),
          },
          children: [],
        })
      }
    },
  }
}

module.exports = {
  transformerLineAnnotations,
  transformerAdocCallouts,
}
