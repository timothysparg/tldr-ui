'use strict'

module.exports = function registerTldrAdmonition(registry) {
  registry.block(function () {
    this.named('TLDR')
    this.onContexts('paragraph', 'example', 'open')
    this.process((parent, reader, attrs) => {
      attrs.name = 'tldr'
      if (!attrs.caption) {
        attrs.caption = 'TL;DR'
      }
      return this.createBlock(parent, 'admonition', reader.readLines(), attrs)
    })
  })
}
