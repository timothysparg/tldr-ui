'use strict'

const UiHtml5Converter = require('./html5-converter')

let registered = false

module.exports = function registerHtml5Converter(context = {}) {
  /* global Opal */
  if (registered) return

  // Try to find the Asciidoctor instance
  let asciidoctor =
    context.Asciidoctor ||
    (context && typeof context.ConverterFactory !== 'undefined' ? context : null) ||
    (this && typeof this.ConverterFactory !== 'undefined' ? this : null)

  // If we are called with a registry as 'this', try to find Asciidoctor via its class scope
  if (!asciidoctor && this && this.$$class) {
    asciidoctor = this.$$class.Asciidoctor || (this.$$class.$$scope && this.$$class.$$scope.Asciidoctor)
  }

  // If not found, try to find it via Opal if Opal is available globally
  if (!asciidoctor && typeof Opal !== 'undefined' && Opal.Asciidoctor) {
    asciidoctor = Opal.Asciidoctor
  }

  if (
    !asciidoctor ||
    (typeof asciidoctor.ConverterFactory !== 'object' && typeof asciidoctor.ConverterFactory !== 'function')
  ) {
    return
  }

  try {
    const converter = new UiHtml5Converter(asciidoctor)
    // Only register if we successfully created a base converter for delegation
    if (converter.baseConverter) {
      asciidoctor.ConverterFactory.register(converter, ['html5'])
      registered = true
    }
  } catch (err) {
    if (process.env.DEBUG) {
      console.error('Failed to register UiHtml5Converter:', err.message)
    }
  }
}
