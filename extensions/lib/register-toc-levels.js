'use strict'

/**
 * An Asciidoctor extension that adjusts the 'toclevels' attribute.
 * In standard Asciidoctor, :toclevels: 3 includes H2, H3, and H4.
 * This extension shifts the value so that :toclevels: 3 means "up to H3".
 */
module.exports = function registerTocLevels(registry) {
  registry.treeProcessor(function () {
    this.process(function (doc) {
      const toclevels = doc.getAttribute('toclevels')
      if (toclevels) {
        const val = parseInt(toclevels, 10)
        if (!isNaN(val)) {
          doc.setAttribute('toclevels', (val - 1).toString())
        }
      }
      return doc
    })
  })
}
