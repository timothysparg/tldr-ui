;(function () {
  'use strict'

  const CMD_RX = /^\$ (\S[^\\\n]*(\\\n(?!\$ )[^\\\n]*)*)(?=\n|$)/gm
  const LINE_CONTINUATION_RX = /( ) *\\\n *|\\\n( ?) */g
  const TRAILING_SPACE_RX = / +$/gm

  const supportsCopy = window.navigator.clipboard
  const deviconOverrides = {
    cpp: 'cplusplus',
    js: 'javascript',
    sh: 'bash',
    shell: 'bash',
    shellscript: 'bash',
    ts: 'typescript',
  }
  const isBeerArticle = document.body.classList.contains('article')
  ;[].slice.call(document.querySelectorAll('article pre.highlight, article .literalblock pre')).forEach(function (pre) {
    let code, language, lang, copy, icon, tooltip, header, content, block, title, chip, spacer, label, logo
    if (pre.classList.contains('highlight')) {
      code = pre.querySelector('code')
      if ((language = code.dataset.lang) && language !== 'console') {
        lang = document.createTextNode(language)
      }
      pre.classList.add('scroll')
    } else if (pre.innerText.startsWith('$ ')) {
      block = pre.parentNode.parentNode
      block.classList.remove('literalblock')
      block.classList.add('listingblock')
      pre.classList.add('highlightjs', 'highlight')
      pre.classList.add('scroll')
      ;(code = document.createElement('code')).className = 'language-console hljs'
      code.dataset.lang = 'console'
      while (pre.hasChildNodes()) code.appendChild(pre.firstChild)
      pre.appendChild(code)
    } else {
      return
    }
    if (supportsCopy) {
      ;(copy = document.createElement('button')).className = 'circle transparent copy-button'
      copy.setAttribute('title', 'Copy to clipboard')
      icon = document.createElement('i')
      icon.appendChild(document.createTextNode('content_copy'))
      copy.appendChild(icon)
      tooltip = document.createElement('div')
      tooltip.className = 'tooltip'
      tooltip.appendChild(document.createTextNode('Copy code'))
      copy.appendChild(tooltip)
    }
    if (isBeerArticle) {
      content = pre.parentNode
      block = pre.closest('.listingblock, .literalblock')
      title = block && block.querySelector(':scope > .title')
      if (content && !content.querySelector('.code-header')) {
        ;(header = document.createElement('nav')).className = 'code-header padding surface-container'
        if (title) {
          title.classList.add('code-filename')
          header.appendChild(title)
        } else if (lang) {
          chip = document.createElement('div')
          chip.className = 'chip fill secondary'
          logo = createDeviconLogo(language)
          if (logo) chip.appendChild(logo)
          label = document.createElement('span')
          label.appendChild(document.createTextNode(language))
          chip.appendChild(label)
          header.appendChild(chip)
        }
        spacer = document.createElement('div')
        spacer.className = 'max'
        header.appendChild(spacer)
        if (copy) header.appendChild(copy)
        content.insertBefore(header, pre)
      }
    } else {
      if (lang) pre.parentNode.appendChild(lang)
      if (copy) pre.parentNode.appendChild(copy)
    }
    if (copy) copy.addEventListener('click', writeToClipboard.bind(copy, code))
  })

  function extractCommands (text) {
    const cmds = []
    let m
    while ((m = CMD_RX.exec(text))) cmds.push(m[1].replace(LINE_CONTINUATION_RX, '$1$2'))
    return cmds.join(' && ')
  }

  function writeToClipboard (code) {
    let text = code.innerText.replace(TRAILING_SPACE_RX, '')
    // Strip callout markers (angle brackets with numbers)
    text = text.replace(/\s*〈\s*\d+\s*〉/g, '')
    // Strip comment markers followed by callouts (e.g., ";; (1)" or "// (1)")
    text = text.replace(/\s*(;;|\/\/)\s*\(\d+\)/g, '')
    if (code.dataset.lang === 'console' && text.startsWith('$ ')) text = extractCommands(text)
    window.navigator.clipboard.writeText(text).then(
      function () {
        const icon = this.querySelector('i')
        const original = icon && icon.textContent
        if (icon) icon.textContent = 'done'
        this.classList.add('primary-text')
        setTimeout(function () {
          this.classList.remove('primary-text')
          if (icon) icon.textContent = original
        }.bind(this), 1000)
      }.bind(this),
      function () {}
    )
  }

  function createDeviconLogo (language) {
    if (!language) return null
    const slug = deviconOverrides[language] || language
    const logo = document.createElement('img')
    logo.src = 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/' + slug + '/' + slug + '-original.svg'
    logo.alt = language + ' logo'
    logo.addEventListener('error', function () {
      this.remove()
    })
    return logo
  }
})()
