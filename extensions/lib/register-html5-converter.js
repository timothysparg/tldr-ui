'use strict'

const UiHtml5Converter = require('./html5-converter')

let registered = false

module.exports = function registerHtml5Converter(context = {}) {
  const asciidoctor = context.Asciidoctor || require('@asciidoctor/core')()
  if (registered) return
  asciidoctor.ConverterFactory.register(new UiHtml5Converter(asciidoctor), ['html5'])
  registered = true
}
