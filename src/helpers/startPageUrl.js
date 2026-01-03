'use strict'

module.exports = function startPageUrl (startPage) {
  if (!startPage) return 'index.html'
  const spec = String(startPage)
  if (spec.startsWith('/')) return spec
  const tail = spec.split(':').pop()
  const withExt = tail.includes('.') ? tail : `${tail}.adoc`
  return '/' + withExt.replace(/\.adoc$/i, '') + '.html'
}
