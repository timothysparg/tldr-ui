;(function () {
  'use strict'

  const toc = document.querySelector('.article-toc')
  const tocBody = document.querySelector('.article-toc-body')
  const toolbar = document.querySelector('.toolbar')
  const article = document.querySelector('article.article-card') || document.querySelector('article')
  if (!toc || !tocBody || !article) return

  let links = new Map()
  let headingMetrics = []
  let headingElements = []
  let activeFragment
  let isInitialized = false
  let centerObserver
  let resizeObserver
  let pendingFrame = 0
  let articleTop = 0
  let articleBottom = 0
  const centerVisibleHeadings = new Set()

  let markerRange
  let markerActive
  let activeMarkerOffset = 0

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
      if (!markerRange) {
        markerRange = document.createElement('div')
        markerRange.className = 'toc-marker-range'
        markerRange.setAttribute('aria-hidden', 'true')
        tocBody.appendChild(markerRange)
      }
      if (!markerActive) {
        markerActive = document.createElement('div')
        markerActive.className = 'toc-marker-active'
        markerActive.setAttribute('aria-hidden', 'true')
        tocBody.appendChild(markerActive)
      }
      activeMarkerOffset = markerActive.offsetHeight ? markerActive.offsetHeight / 2 : 5
    }
    return links.size
  }

  function getRelativeOffset(el, container) {
    let top = 0
    let current = el
    while (current && current !== container) {
      top += current.offsetTop
      current = current.offsetParent
    }
    return top
  }

  function getDocTop(el) {
    return el.getBoundingClientRect().top + window.scrollY
  }

  function getToolbarOffset() {
    if (toolbar) return toolbar.getBoundingClientRect().bottom
    return parseFloat(window.getComputedStyle(document.documentElement).fontSize) * 4
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max)
  }

  function getNumericTocVar(name, fallback) {
    const value = parseFloat(window.getComputedStyle(tocBody).getPropertyValue(name))
    return Number.isFinite(value) ? value : fallback
  }

  function initScrollSpy() {
    if (isInitialized) return
    headingElements = Array.from(links.keys())
      .map((id) => document.getElementById(id.slice(1)))
      .filter(Boolean)

    if (!headingElements.length) return

    refreshMetrics()
    observeCenterBand()

    window.addEventListener('scroll', scheduleUpdate, { passive: true })
    window.addEventListener('resize', handleResize, { passive: true })

    if ('ResizeObserver' in window) {
      resizeObserver = new window.ResizeObserver(() => {
        refreshMetrics()
        scheduleUpdate()
      })
      resizeObserver.observe(article)
      resizeObserver.observe(tocBody)
      headingElements.forEach((heading) => resizeObserver.observe(heading))
    }

    if (window.location.hash) setActive(window.location.hash)
    scheduleUpdate()
    isInitialized = true
  }

  function refreshMetrics() {
    articleTop = getDocTop(article)
    articleBottom = articleTop + article.offsetHeight
    headingMetrics = headingElements
      .map((heading) => {
        const id = '#' + heading.id
        const link = links.get(id)
        if (!link) return null

        return {
          id,
          heading,
          headingTop: getDocTop(heading),
          headingHeight: heading.offsetHeight,
          link,
          linkTop: getRelativeOffset(link, tocBody),
          linkHeight: link.offsetHeight,
        }
      })
      .filter(Boolean)
  }

  function handleResize() {
    refreshMetrics()
    observeCenterBand()
    scheduleUpdate()
  }

  function observeCenterBand() {
    if (centerObserver) centerObserver.disconnect()
    centerVisibleHeadings.clear()

    const viewportHeight = window.innerHeight
    const topInset = getToolbarOffset()
    const availableHeight = Math.max(0, viewportHeight - topInset)
    const bandRatio = getNumericTocVar('--toc-center-band-ratio', 0.18)
    const bandMin = getNumericTocVar('--toc-center-band-min', 96)
    const bandMax = getNumericTocVar('--toc-center-band-max', 160)
    const bandHeight = clamp(availableHeight * bandRatio, bandMin, bandMax)
    const upperInset = topInset + (availableHeight - bandHeight) / 2
    const lowerInset = viewportHeight - bandHeight - upperInset
    const rootMargin = `-${Math.round(upperInset)}px 0px -${Math.round(lowerInset)}px 0px`

    centerObserver = new window.IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            centerVisibleHeadings.add(entry.target.id)
          } else {
            centerVisibleHeadings.delete(entry.target.id)
          }
        })
        scheduleUpdate()
      },
      { rootMargin, threshold: 0 }
    )

    headingElements.forEach((heading) => centerObserver.observe(heading))
  }

  function scheduleUpdate() {
    if (pendingFrame) return
    pendingFrame = window.requestAnimationFrame(() => {
      pendingFrame = 0
      onScroll()
    })
  }

  function mapScrollToToc(scrollPos) {
    if (!headingMetrics.length) return 0

    const relativeScroll = scrollPos - articleTop

    let index = -1
    for (let i = 0; i < headingMetrics.length; i++) {
      if (headingMetrics[i].headingTop > scrollPos) {
        index = i
        break
      }
    }

    if (index === 0) {
      const firstMetric = headingMetrics[0]
      const scrollSpan = Math.max(1, firstMetric.headingTop - articleTop)
      const ratio = clamp(relativeScroll / scrollSpan, 0, 1)
      return firstMetric.linkTop * ratio
    }

    if (index === -1) {
      const lastMetric = headingMetrics[headingMetrics.length - 1]
      const remainingDoc = Math.max(1, articleBottom - lastMetric.headingTop)
      const scrollBelowLast = scrollPos - lastMetric.headingTop
      const ratio = clamp(scrollBelowLast / remainingDoc, 0, 1)
      const remainingToc = Math.max(lastMetric.linkHeight, tocBody.scrollHeight - lastMetric.linkTop)
      return lastMetric.linkTop + remainingToc * ratio
    }

    const previousMetric = headingMetrics[index - 1]
    const nextMetric = headingMetrics[index]
    const scrollSpan = Math.max(1, nextMetric.headingTop - previousMetric.headingTop)
    const ratio = clamp((scrollPos - previousMetric.headingTop) / scrollSpan, 0, 1)
    return previousMetric.linkTop + (nextMetric.linkTop - previousMetric.linkTop) * ratio
  }

  function getViewportCenter() {
    const topInset = getToolbarOffset()
    return window.scrollY + topInset + (window.innerHeight - topInset) / 2
  }

  function getActiveMetric() {
    if (!headingMetrics.length) return null

    const viewportCenter = getViewportCenter()
    const centeredMetrics = headingMetrics.filter((metric) => centerVisibleHeadings.has(metric.heading.id))

    if (centeredMetrics.length) {
      const centeredChoice = centeredMetrics.reduce((closest, metric) => {
        const metricCenter = metric.headingTop + metric.headingHeight / 2
        if (!closest) return metric
        const closestCenter = closest.headingTop + closest.headingHeight / 2
        return Math.abs(metricCenter - viewportCenter) < Math.abs(closestCenter - viewportCenter) ? metric : closest
      }, null)
      return holdActiveMetric(centeredChoice, viewportCenter)
    }

    let fallbackMetric = headingMetrics[0]
    for (const metric of headingMetrics) {
      if (metric.headingTop <= viewportCenter) {
        fallbackMetric = metric
      } else {
        break
      }
    }

    return holdActiveMetric(fallbackMetric, viewportCenter)
  }

  function getMetricDistanceFromCenter(metric, viewportCenter) {
    if (!metric) return Infinity
    const metricCenter = metric.headingTop + metric.headingHeight / 2
    return Math.abs(metricCenter - viewportCenter)
  }

  function holdActiveMetric(nextMetric, viewportCenter) {
    if (!activeFragment) return nextMetric

    const currentMetric = headingMetrics.find((metric) => metric.id === activeFragment)
    if (!currentMetric) return nextMetric
    if (!nextMetric || nextMetric.id === currentMetric.id) return currentMetric

    const activeHoldPx = getNumericTocVar('--toc-active-hold-distance', 28)
    const currentDistance = getMetricDistanceFromCenter(currentMetric, viewportCenter)
    const nextDistance = getMetricDistanceFromCenter(nextMetric, viewportCenter)
    return nextDistance + activeHoldPx < currentDistance ? nextMetric : currentMetric
  }

  function onScroll() {
    if (!markerRange || !markerActive) return
    if (!headingMetrics.length) return

    const scrollY = window.scrollY
    const topInset = getToolbarOffset()

    const vTop = Math.max(articleTop, scrollY + topInset)
    const vBottom = Math.min(articleBottom, scrollY + window.innerHeight)

    if (vBottom <= vTop) {
      markerRange.classList.remove('is-visible')
      markerActive.classList.remove('is-visible')
      return
    }

    const tocTop = mapScrollToToc(vTop)
    const tocBottom = mapScrollToToc(vBottom)

    markerRange.style.top = tocTop + 'px'
    markerRange.style.height = Math.max(2, tocBottom - tocTop) + 'px'
    markerRange.classList.add('is-visible')

    const activeMetric = getActiveMetric()
    if (activeMetric) {
      setActive(activeMetric.id)
      const markerTop = activeMetric.linkTop + activeMetric.linkHeight / 2 - activeMarkerOffset
      markerActive.style.transform = `translateY(${markerTop}px)`
      markerActive.classList.add('is-visible')
    }
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

    const tocRect = tocBody.getBoundingClientRect()
    const linkRect = link.getBoundingClientRect()
    if (linkRect.top < tocRect.top || linkRect.bottom > tocRect.bottom) {
      const nextScrollTop = toc.scrollTop + (linkRect.top - tocRect.top) - (tocRect.height - linkRect.height) / 2
      toc.scrollTop = Math.max(0, nextScrollTop)
    }
  }
})()
