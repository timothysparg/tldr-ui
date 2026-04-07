;(function () {
  'use strict'

  const CMD_RX = /^\$ (\S[^\\\n]*(\\\n(?!\$ )[^\\\n]*)*)(?=\n|$)/gm
  const LINE_CONTINUATION_RX = /( ) *\\\n *|\\\n( ?) */g
  const TRAILING_SPACE_RX = / +$/gm

  const supportsCopy = window.navigator.clipboard

  ;[].slice.call(document.querySelectorAll('article pre.highlight, article .literalblock pre')).forEach(function (pre) {
    let code, copy, block, header, spacer, icon, tooltip

    if (pre.classList.contains('highlight')) {
      code = pre.querySelector('code')
      pre.classList.add('scroll')
    } else if (pre.innerText.startsWith('$ ')) {
      block = pre.parentNode.parentNode
      block.classList.remove('literalblock')
      block.classList.add('listingblock')
      pre.classList.add('highlightjs', 'highlight', 'scroll')
      ;(code = document.createElement('code')).className = 'language-console hljs'
      code.dataset.lang = 'console'
      while (pre.hasChildNodes()) code.appendChild(pre.firstChild)
      pre.appendChild(code)
    } else {
      return
    }

    const content = pre.parentNode
    copy = content && content.querySelector('.code-header .copy-button')
    if (supportsCopy) {
      if (!copy && code.dataset.lang === 'console') {
        ;(header = document.createElement('nav')).className = 'code-header padding surface-container'
        ;(spacer = document.createElement('div')).className = 'max'
        header.appendChild(spacer)
        ;(copy = document.createElement('button')).className = 'circle transparent copy-button'
        copy.setAttribute('title', 'Copy to clipboard')
        ;(icon = document.createElement('i')).appendChild(document.createTextNode('content_copy'))
        copy.appendChild(icon)
        ;(tooltip = document.createElement('div')).className = 'tooltip'
        tooltip.appendChild(document.createTextNode('Copy code'))
        copy.appendChild(tooltip)
        header.appendChild(copy)
        content.insertBefore(header, pre)
      }
      if (copy) copy.addEventListener('click', writeToClipboard.bind(copy, code))
    }
  })

  function extractCommands(text) {
    const cmds = []
    let m
    while ((m = CMD_RX.exec(text))) cmds.push(m[1].replace(LINE_CONTINUATION_RX, '$1$2'))
    return cmds.join(' && ')
  }

  function writeToClipboard(code) {
    let text = code.innerText.replace(TRAILING_SPACE_RX, '')
    // Strip callout markers
    text = text.replace(/\s*〈\s*\d+\s*〉/g, '')
    text = text.replace(/\s*(;;|\/\/)\s*\(\d+\)/g, '')
    if (code.dataset.lang === 'console' && text.startsWith('$ ')) text = extractCommands(text)
    window.navigator.clipboard.writeText(text).then(
      function () {
        const textIcon = this.querySelector('i')
        const svgIcon = this.querySelector('svg')
        const originalText = textIcon && textIcon.textContent
        const originalSvg = svgIcon && svgIcon.innerHTML
        if (textIcon) {
          textIcon.textContent = 'done'
        } else if (svgIcon) {
          svgIcon.innerHTML = '<path d="M5 12.5 9.5 17 19 7.5"></path>'
          svgIcon.setAttribute('viewBox', '0 0 24 24')
        }
        this.classList.add('primary-text')
        setTimeout(
          function () {
            this.classList.remove('primary-text')
            if (textIcon) textIcon.textContent = originalText
            if (svgIcon) svgIcon.innerHTML = originalSvg
          }.bind(this),
          1000
        )
      }.bind(this),
      function () {}
    )
  }
})()
