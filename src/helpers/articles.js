'use strict'

const TAG_STRIP = /<[^>]+>/g
const WS_NORMALIZE = /\s+/g

module.exports = function articles (site) {
  const posts = []
  if (!site) return posts

  if (Array.isArray(site.posts) && site.posts.length) return sortPosts(site.posts.slice())

  const components = site.components || []
  components.forEach((component) => {
    ;(component.versions || []).forEach((version) => {
      if (Array.isArray(version.navigation)) collectFromNav(version.navigation, posts)
    })
  })

  return sortPosts(posts)
}

/**
 * Collects articles from navigation items into the shared posts array.
 * @param {Array} items navigation items
 * @param {Array} posts accumulator array for articles
 */
function collectFromNav (items, posts) {
  items.forEach((item) => {
    const attrs =
      (item.asciidoc && item.asciidoc.attributes) ||
      (item.page && item.page.attributes) ||
      item.attributes ||
      {}
    const role = attrs['page-role'] || attrs.role
    if (role === 'article') {
      const summary = normalizeSummary(
        item.contents ||
          (item.asciidoc && item.asciidoc.contents) ||
          attrs.description ||
          attrs['page-description'] ||
          ''
      )
      posts.push({
        title: item.content || item.title || attrs.title || '',
        url: item.url,
        summary: summary.slice(0, 100),
        date: parseDate(attrs.revdate || attrs.date || attrs['page-date']),
      })
    }
    if (Array.isArray(item.items)) collectFromNav(item.items, posts)
  })
}

/**
 * Normalizes free-form text into a compact summary.
 * @param {string} text raw text
 * @returns {string}
 */
function normalizeSummary (text) {
  if (!text) return ''
  return String(text).replace(TAG_STRIP, ' ').replace(WS_NORMALIZE, ' ').trim()
}

/**
 * Parses dates from strings and returns a Date or null on failure.
 * @param {string|number|Date} value
 * @returns {Date|null}
 */
function parseDate (value) {
  if (!value) return null
  const parsed = new Date(value)
  return isNaN(parsed) ? null : parsed
}

/**
 * Sorts posts newest-first based on parsed dates.
 * @param {Array<{date: Date|null}>} posts
 * @returns {Array} sorted posts
 */
function sortPosts (posts) {
  return posts.sort((a, b) => {
    const timeA = (a.date instanceof Date && !isNaN(a.date)) ? a.date.getTime() : 0
    const timeB = (b.date instanceof Date && !isNaN(b.date)) ? b.date.getTime() : 0
    return timeB - timeA
  })
}
