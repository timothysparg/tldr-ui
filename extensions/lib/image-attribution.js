'use strict'

/**
 * Pins a source link to the corner of a block image, mirroring the home page
 * hero attribution button. Triggered by image::file.png[Alt,attribution=URL].
 *
 * @param {string} html - converted imageblock HTML
 * @param {string} [href] - attribution URL
 * @returns {string}
 */
function addImageAttribution(html, href) {
  if (!href) return html
  const link =
    `<a href="${escapeAttribute(href)}" target="_blank" rel="noopener" aria-label="Image source" ` +
    'class="attribution absolute right bottom margin circle small tertiary-container">' +
    '<i class="tiny">attribution</i></a>'
  return html.replace(
    /(<div class="content">)([\s\S]*?)(<\/div>)/,
    (_, open, inner, close) => `${open}<span class="attributed">${inner.trim()}${link}</span>${close}`
  )
}

function escapeAttribute(value) {
  return String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
}

module.exports = { addImageAttribution }
