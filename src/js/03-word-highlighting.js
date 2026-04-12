;(function () {
  'use strict'

  const annotate = window.RoughNotation && window.RoughNotation.annotate
  if (!annotate) return

  const annotatedWords = new WeakMap()

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }

  function init() {
    const words = document.querySelectorAll(
      '.listingblock pre.shiki .highlighted-word, .literalblock pre.shiki .highlighted-word'
    )
    if (!words.length) return

    words.forEach((word) => {
      if (annotatedWords.has(word)) return

      const annotation = annotate(word, {
        type: 'bracket',
        brackets: ['left', 'right'],
        animate: false,
        color: getHighlightColor(word),
        strokeWidth: getHighlightNumber(word, '--code-word-annotation-stroke-width', 1.4),
        padding: [
          getHighlightNumber(word, '--code-word-annotation-padding-block', 2),
          getHighlightNumber(word, '--code-word-annotation-padding-inline', 5),
        ],
        iterations: Math.round(getHighlightNumber(word, '--code-word-annotation-iterations', 2)),
      })

      annotation.show()
      annotatedWords.set(word, annotation)
    })
  }

  function getHighlightColor(el) {
    // Try to get the computed color if it's a complex CSS function like color-mix
    // Some browsers return the resolved value, others the raw string.
    const raw = getComputedStyle(el).getPropertyValue('--code-word-annotation-color').trim()
    if (!raw) return 'currentColor'
    if (raw.startsWith('color-mix')) {
      // Fallback to primary if color-mix is returned as string
      return getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#1976d2'
    }
    return raw
  }

  function getHighlightNumber(el, name, fallback) {
    const value = parseFloat(getComputedStyle(el).getPropertyValue(name))
    return Number.isFinite(value) ? value : fallback
  }
})()
