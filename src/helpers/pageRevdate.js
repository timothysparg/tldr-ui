'use strict'

module.exports = function pageRevdate (page, contentCatalog) {
  if (!page) return ''

  const direct = page.attributes && page.attributes.revdate
  if (direct) return direct

  if (!contentCatalog || typeof contentCatalog.getById !== 'function') return ''

  const component = page.component && page.component.name
  const version = page.version
  const module_ = page.module
  const relative = page.relativeSrcPath

  if (!component || !version || !module_ || !relative) return ''

  const file = contentCatalog.getById({
    family: 'page',
    component,
    version,
    module: module_,
    relative,
  })

  const attrs = file && file.asciidoc && file.asciidoc.attributes
  return (attrs && attrs.revdate) || ''
}
