'use strict'

const { getBlockLanguage, isConsoleLiteral, renderListingBlock, renderLiteralBlock } = require('./code-block-ui')

class UiHtml5Converter {
  constructor(asciidoctor) {
    this.baseConverter = asciidoctor.Html5Converter.$new()
  }

  convert(node, transform) {
    const nodeName = transform || node.getNodeName()
    if (nodeName === 'listing') return this.convertListing(node, transform)
    if (nodeName === 'literal') return this.convertLiteral(node, transform)
    return this.baseConverter.convert(node, transform)
  }

  convertListing(node, transform) {
    const title = node.getTitle()
    const language = getBlockLanguage(node)
    if (!title && !language) return this.baseConverter.convert(node, transform)
    return renderListingBlock(node, { title, lang: language })
  }

  convertLiteral(node, transform) {
    if (!isConsoleLiteral(node)) return this.baseConverter.convert(node, transform)
    return renderLiteralBlock(node, { console: true, title: node.getTitle() })
  }
}

module.exports = UiHtml5Converter
