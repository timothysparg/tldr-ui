'use strict'

/**
 * Handlebars helper to increment a numeric value.
 * Used primarily for calculating nested TOC levels.
 *
 * @param {number} value The current value
 * @returns {number} The incremented value
 */
module.exports = function increment(value) {
  return Number(value || 0) + 1
}
