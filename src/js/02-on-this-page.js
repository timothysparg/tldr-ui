;(function () {
  'use strict'

  const toc = document.querySelector('.article-toc')
  const tocBody = document.querySelector('.article-toc-body')
  if (!toc || !tocBody) return

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
  })

  function refreshLinks() {
    const list = [].slice.call(tocBody.querySelectorAll('a[href^="#"]'))
    links = new Map(list.map((link) => [link.getAttribute('href'), link]))
    if (links.size === 0) {
      toc.style.display = 'none'
    } else {
      toc.style.display = 'block'
    }
    return links.size
  }

  function initScrollSpy() {
    if (isInitialized) return
    const headings = Array.from(links.keys())
      .map((id) => document.getElementById(id.slice(1)))
      .filter(Boolean)

    if (!headings.length) return

    const visibleHeadings = new Set()

    // Dynamically calculate the top margin based on the toolbar height
    // to avoid hardcoded 'px' values.
    const toolbar = document.querySelector('.toolbar')
    const getTopMargin = () => {
      if (toolbar) return toolbar.getBoundingClientRect().height
      // Fallback to a calculation of 4rem
      return parseFloat(window.getComputedStyle(document.documentElement).fontSize) * 4
    }

    const observerOptions = {
      // IntersectionObserver rootMargin must be in px or %
      rootMargin: `-${Math.round(getTopMargin())}px 0px -80% 0px`,
      threshold: 0,
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          visibleHeadings.add(entry.target.id)
        } else {
          visibleHeadings.delete(entry.target.id)
        }
      })

      if (visibleHeadings.size > 0) {
        // Pick the FIRST one in document order that is currently visible
        let firstVisible
        for (const h of headings) {
          if (visibleHeadings.has(h.id)) {
            firstVisible = h
            break
          }
        }
        if (firstVisible) setActive('#' + firstVisible.id)
      }
    }, observerOptions)

    headings.forEach((heading) => observer.observe(heading))

    if (window.location.hash) setActive(window.location.hash)
    isInitialized = true
  }

  function setActive(fragment) {
    if (!fragment || fragment === activeFragment) return
    const link = links.get(fragment)
    if (!link) return

    if (activeFragment && links.has(activeFragment)) {
      links.get(activeFragment).classList.remove('is-active')
    }
    activeFragment = fragment
    link.classList.add('is-active')

    const tocRect = toc.getBoundingClientRect()
    const linkRect = link.getBoundingClientRect()
    if (linkRect.top < tocRect.top || linkRect.bottom > tocRect.bottom) {
      link.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  }
})()
