'use strict'

// Extracts the <ul class="sectlevel1"> tree from the Asciidoctor-generated
// <div id="toc"> embedded in page.contents. Returns the <ul> HTML string, or
// an empty string when no TOC is present (so {{#with (toc page.contents)}}
// collapses the sidebar when there is nothing to show).
module.exports = (contents) => {
  if (!contents) return ''
  const html = contents.toString()
  const tocStart = html.indexOf('<div id="toc"')
  if (tocStart === -1) return ''
  const ulStart = html.indexOf('<ul class="sectlevel1">', tocStart)
  if (ulStart === -1) return ''
  // Walk forward counting <ul> opens/closes to find the matching </ul>.
  let depth = 0
  let i = ulStart
  while (i < html.length) {
    if (html[i] === '<') {
      if (html.startsWith('<ul', i)) {
        depth++
        i += 3
      } else if (html.startsWith('</ul>', i)) {
        depth--
        if (depth === 0) return html.slice(ulStart, i + 5)
        i += 5
      } else {
        i++
      }
    } else {
      i++
    }
  }
  return ''
}
