'use strict'

const { unified } = require('unified')
const rehypeParse = require('rehype-parse').default
const rehypeStringify = require('rehype-stringify').default
const { visit, EXIT } = require('unist-util-visit')

/**
 * Processes an HTML document string through the HAST pipeline synchronously.
 * Extracts the TOC and optionally removes it from the body.
 *
 * @param {string} html
 * @param {object} [options]
 * @param {boolean} [options.removeToc=false]
 * @returns {{ html: string, tocData: Array }}
 */
function processDocument(html, { removeToc = false } = {}) {
  let tocData = []
  const processor = unified().use(rehypeParse, { fragment: true }).use(rehypeStringify)

  const tree = processor.parse(html)

  visit(tree, 'element', (node, index, parent) => {
    if (node.properties && node.properties.id === 'toc') {
      const tocTree = {
        type: 'root',
        children: node.children.filter((c) => c.tagName === 'ul'),
      }

      tocData = extractTocData(tocTree)

      if (removeToc) {
        parent.children.splice(index, 1)
      }
      return EXIT
    }
  })

  let transformedHtml = processor.stringify(tree)

  // rehype-parse decodes &#10; to \n in HAST; re-encode newlines in data-copy-text
  transformedHtml = transformedHtml.replace(
    /data-copy-text="([^"]*)"/g,
    (_, value) => `data-copy-text="${value.replace(/\r\n|\r|\n/g, '&#10;')}"`
  )

  return {
    html: transformedHtml,
    tocData,
  }
}

/**
 * Extracts a structured hierarchy of TOC items from the HAST tree.
 */
function extractTocData(tree) {
  const items = []

  const walk = (node, acc) => {
    if (node.tagName === 'ul') {
      node.children.forEach((child) => {
        if (child.tagName === 'li') {
          const item = { children: [] }
          child.children.forEach((liChild) => {
            if (liChild.tagName === 'a') {
              item.url = liChild.properties.href
              item.title = getEntryText(liChild)
            } else if (liChild.tagName === 'ul') {
              walk(liChild, item.children)
            }
          })
          if (item.url) acc.push(item)
        }
      })
    }
  }

  const rootUl = tree.children.find((c) => c.tagName === 'ul')
  if (rootUl) walk(rootUl, items)
  return items
}

function getEntryText(node) {
  let text = ''
  visit(node, 'text', (textNode) => {
    text += textNode.value
  })
  return text.trim()
}

module.exports = { processDocument }
