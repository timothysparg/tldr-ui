'use strict'

const { unified } = require('unified')
const rehypeParse = require('rehype-parse').default
const rehypeStringify = require('rehype-stringify').default
const { visit, EXIT } = require('unist-util-visit')

/**
 * Processes an HTML document string through the HAST pipeline synchronously.
 * Extracts the TOC, transforms it, and optionally removes it from the body.
 *
 * @param {string} html
 * @param {object} [options]
 * @param {boolean} [options.removeToc=false]
 * @returns {{ html: string, tocHtml: string }}
 */
function processDocument(html, { removeToc = false } = {}) {
  let tocHtml = ''
  const processor = unified().use(rehypeParse, { fragment: true }).use(rehypeStringify)

  const tree = processor.parse(html)

  visit(tree, 'element', (node, index, parent) => {
    if (node.properties && node.properties.id === 'toc') {
      // 1. Extract the TOC tree
      const tocTree = {
        type: 'root',
        children: node.children.filter((c) => c.tagName === 'ul'),
      }

      // 2. Transform the TOC tree
      transformTocTree(tocTree)

      // 3. Stringify the transformed TOC
      tocHtml = processor.stringify(tocTree)

      // 4. Optionally remove the TOC node from the body
      if (removeToc) {
        parent.children.splice(index, 1)
      }
      return EXIT
    }
  })

  let transformedHtml = processor.stringify(tree)

  // rehype-parse decodes &#10; to \n in HAST; re-encode newlines in data-copy-text
  // (double-quoted attribute values never contain literal " — hast-util-to-html encodes it as &#x22;)
  transformedHtml = transformedHtml.replace(
    /data-copy-text="([^"]*)"/g,
    (_, value) => `data-copy-text="${value.replace(/\r\n|\r|\n/g, '&#10;')}"`
  )

  return {
    html: transformedHtml,
    tocHtml,
  }
}

/**
 * Applies structural changes to the TOC HAST tree.
 */
function transformTocTree(tree) {
  visit(tree, 'element', (node) => {
    // Add semantic classes to ULs
    if (node.tagName === 'ul') {
      const className = node.properties.class || node.properties.className || ''
      const classList = Array.isArray(className) ? className : String(className).split(/\s+/)
      const levelMatch = classList.find((c) => c && typeof c === 'string' && c.startsWith('sectlevel'))
      const level = levelMatch ? String(levelMatch).replace('sectlevel', '') : '1'

      node.properties.class = `toc-list toc-level-${level}`
      delete node.properties.className
    }

    // Enhance Links
    if (node.tagName === 'a') {
      node.properties.class = 'toc-link'
      // Wrap text in a span for better styling control
      node.children = [
        {
          type: 'element',
          tagName: 'span',
          properties: { class: 'toc-text' },
          children: node.children,
        },
      ]
    }

    // Clean up LIs
    if (node.tagName === 'li') {
      node.properties.class = 'toc-item'
    }
  })
}

module.exports = { processDocument }
