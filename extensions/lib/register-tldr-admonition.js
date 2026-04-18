'use strict'

module.exports = function registerTldrAdmonition(registry) {
  registry.block('TLDR', function () {
    this.onContexts('paragraph', 'example', 'open')
    this.parseContentAs('compound')
    this.process((parent, reader, attrs) => {
      attrs.name = 'tldr'
      if (!attrs.caption) {
        attrs.caption = 'TL;DR'
      }
      const block = this.createBlock(parent, 'admonition', [], attrs, { content_model: 'compound' })
      this.parseContent(block, reader.readLines())
      return block
    })
  })
}
