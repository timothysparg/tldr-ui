;(function () {
  'use strict'

  function init () {
    var article = document.querySelector('article.article-card')
    if (!article) return

    var toc = document.querySelector('.article-toc')
    if (toc) {
      var headings = [].slice.call(article.querySelectorAll('h2[id], h3[id]'))
      if (!headings.length) {
        toc.parentNode.removeChild(toc)
      } else {
        var list = document.createElement('ul')
        headings.forEach(function (heading) {
          var item = document.createElement('li')
          var link = document.createElement('a')
          var level = parseInt(heading.tagName.slice(1), 10)
          item.dataset.level = String(level)
          link.textContent = heading.textContent
          link.href = '#' + heading.id
          item.appendChild(link)
          list.appendChild(item)
        })
        var body = toc.querySelector('.article-toc-body')
        if (body) body.appendChild(list)
      }
    }

  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }
})()
