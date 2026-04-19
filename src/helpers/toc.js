'use strict'

/**
 * Handlebars helper to normalize TOC data.
 * Antora provides it as a JSON string via doc attributes,
 * while the preview build provides it as a live object.
 *
 * @param {string|Array} data The TOC data (JSON string or Array)
 * @returns {Array} Structured TOC items
 */
module.exports = function toc(data) {
  if (!data) return []
  if (typeof data === 'string') {
    try {
      return JSON.parse(data)
    } catch (e) {
      console.error('Failed to parse toc-data', e)
      return []
    }
  }
  return data
}
