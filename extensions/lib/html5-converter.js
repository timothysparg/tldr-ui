'use strict'

const {
  getBlockLanguage,
  isConsoleLiteral,
  renderListingBlock,
  renderLiteralBlock,
  renderColistBlock,
} = require('./code-block-ui')

class UiHtml5Converter {
  constructor(asciidoctor) {
    if (asciidoctor && asciidoctor.Html5Converter) {
      this.baseConverter = asciidoctor.Html5Converter.$new()
    }
  }

  convert(node, transform) {
    const nodeName = transform || node.getNodeName()
    if (nodeName === 'listing') return this.convertListing(node, transform)
    if (nodeName === 'literal') return this.convertLiteral(node, transform)
    if (nodeName === 'colist') return this.convertColist(node)

    if (this.baseConverter) {
      return this.baseConverter.convert(node, transform)
    }
    return ''
  }

  convertListing(node, transform) {
    if (node.getStyle() === 'source') {
      const language = getBlockLanguage(node)
      const title = node.getTitle()
      return renderListingBlock(node, { lang: language, title })
    }
    return this.baseConverter ? this.baseConverter.convert(node, transform) : ''
  }

  convertLiteral(node, transform) {
    if (isConsoleLiteral(node)) {
      return renderLiteralBlock(node, { console: true, title: node.getTitle() })
    }
    return this.baseConverter ? this.baseConverter.convert(node, transform) : ''
  }

  convertColist(node) {
    return renderColistBlock(node, this.baseConverter)
  }
}

module.exports = UiHtml5Converter
