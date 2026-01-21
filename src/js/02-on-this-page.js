;(function () {
  'use strict'

  const toc = document.querySelector('.article-toc')
  const tocBody = document.querySelector('.article-toc-body')
  const article = document.querySelector('article.article-card')
  if (!toc || !tocBody || !article) return

  const headings = [].slice.call(article.querySelectorAll('h2[id], h3[id]'))
  if (!headings.length) return

  let links = new Map()
  let activeFragment
  let isInitialized = false

  window.addEventListener('load', function () {
    if (refreshLinks()) {
      initScrollSpy()
      return
    }
    const observer = new window.MutationObserver(function () {
      if (!refreshLinks()) return
      observer.disconnect()
      initScrollSpy()
    })
    observer.observe(tocBody, { childList: true, subtree: true })
    setTimeout(function () {
      if (isInitialized) return
      if (refreshLinks()) initScrollSpy()
    }, 250)
  })

  function onScroll () {
    if (!links.size && !refreshLinks()) return
    const buffer = getNumericStyleVal(document.documentElement, 'fontSize') * 1.15
    let current
    headings.some(function (heading) {
      if (heading.getBoundingClientRect().top - buffer > 0) return true
      current = '#' + heading.id
      return false
    })
    if (!current && headings.length) current = '#' + headings[0].id
    if (current) setActive(current)
  }

  function setActive (fragment) {
    if (fragment === activeFragment) return
    if (activeFragment && links.get(activeFragment)) links.get(activeFragment).classList.remove('is-active')
    activeFragment = fragment
    if (links.get(activeFragment)) links.get(activeFragment).classList.add('is-active')
  }

  function refreshLinks () {
    links = new Map(
      [].slice
        .call(tocBody.querySelectorAll('a[href^="#"]'))
        .map((link) => [link.getAttribute('href'), link])
    )
    return links.size
  }

  function initScrollSpy () {
    if (isInitialized) return
    if (!refreshLinks()) return
    if (window.location.hash) setActive(window.location.hash)
    onScroll()
    window.addEventListener('scroll', onScroll)
    isInitialized = true
  }

  function getNumericStyleVal (el, prop) {
    return parseFloat(window.getComputedStyle(el)[prop])
  }
})()
