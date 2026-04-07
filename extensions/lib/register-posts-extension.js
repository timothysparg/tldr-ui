'use strict'

const TAG_STRIP = /<[^>]+>/g
const WS_NORMALIZE = /\s+/g

module.exports = function registerPostsExtension() {
  const logger = this.getLogger('posts-extension')

  let collectedPosts = []

  this.on('pagesComposed', ({ contentCatalog }) => {
    logger.info('Collecting articles for site.posts')

    const posts = []
    const allPages = contentCatalog.findBy({ family: 'page' })
    logger.info(`Total pages in catalog: ${allPages.length}`)

    allPages.forEach((page) => {
      const attrs = page.asciidoc?.attributes || {}
      const role = attrs['page-role']

      logger.debug(`Page: ${page.src?.relative}, role: ${role}, attrs: ${Object.keys(attrs).join(', ')}`)

      if (role === 'article') {
        const summary = normalizeSummary(
          attrs.description || attrs['page-description'] || page.asciidoc?.doctitle || ''
        )

        posts.push({
          title: attrs.navtitle || page.asciidoc?.doctitle || attrs.title || '',
          url: page.pub?.url || '',
          summary: summary.slice(0, 100),
          date: parseDate(attrs.revdate || attrs.date || attrs['page-date']),
          featured: attrs.featured === 'true' || attrs.featured === true,
          image: attrs.image || attrs['page-image'] || null,
        })
      }
    })

    collectedPosts = posts.sort((a, b) => {
      const timeA = a.date instanceof Date && !isNaN(a.date) ? a.date.getTime() : 0
      const timeB = b.date instanceof Date && !isNaN(b.date) ? b.date.getTime() : 0
      return timeB - timeA
    })

    logger.info(`Found ${collectedPosts.length} article(s)`)
  })

  this.on('beforePublish', ({ siteCatalog }) => {
    logger.info('Injecting posts into site model')

    if (siteCatalog.site && !siteCatalog.site.posts) {
      siteCatalog.site.posts = collectedPosts
      logger.info(`Injected ${collectedPosts.length} posts into site.posts`)
    }
  })
}

function normalizeSummary(text) {
  if (!text) return ''
  return String(text).replace(TAG_STRIP, ' ').replace(WS_NORMALIZE, ' ').trim()
}

function parseDate(value) {
  if (!value) return null
  const parsed = new Date(value)
  return isNaN(parsed) ? null : parsed
}
