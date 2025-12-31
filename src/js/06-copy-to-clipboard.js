;(function () {
  'use strict'

  var CMD_RX = /^\$ (\S[^\\\n]*(\\\n(?!\$ )[^\\\n]*)*)(?=\n|$)/gm
  var LINE_CONTINUATION_RX = /( ) *\\\n *|\\\n( ?) */g
  var TRAILING_SPACE_RX = / +$/gm

  var supportsCopy = window.navigator.clipboard
  var isBeerArticle = document.body.classList.contains('article')
  ;[].slice.call(document.querySelectorAll('.doc pre.highlight, .doc .literalblock pre')).forEach(function (pre) {
    var code, language, lang, copy, toast, toolbox, header, content, block, title
    if (pre.classList.contains('highlight')) {
      code = pre.querySelector('code')
      if ((language = code.dataset.lang) && language !== 'console') {
        ;(lang = document.createElement('span')).className = 'source-lang'
        lang.appendChild(document.createTextNode(language))
      }
    } else if (pre.innerText.startsWith('$ ')) {
      block = pre.parentNode.parentNode
      block.classList.remove('literalblock')
      block.classList.add('listingblock')
      pre.classList.add('highlightjs', 'highlight')
      ;(code = document.createElement('code')).className = 'language-console hljs'
      code.dataset.lang = 'console'
      while (pre.hasChildNodes()) code.appendChild(pre.firstChild)
      pre.appendChild(code)
    } else {
      return
    }
    ;(toolbox = document.createElement('div')).className = 'source-toolbox'
    if (lang) toolbox.appendChild(lang)
    if (supportsCopy) {
      ;(copy = document.createElement('button')).className = 'copy-button'
      copy.setAttribute('title', 'Copy to clipboard')
      var icon = document.createElement('i')
      icon.className = 'fa fa-copy copy-icon'
      copy.appendChild(icon)
      ;(toast = document.createElement('span')).className = 'copy-toast'
      toast.appendChild(document.createTextNode('Copied!'))
      copy.appendChild(toast)
      toolbox.appendChild(copy)
    }
    if (isBeerArticle) {
      content = pre.parentNode
      block = pre.closest('.listingblock, .literalblock')
      title = block && block.querySelector(':scope > .title')
      if (content && !content.querySelector('.code-header')) {
        ;(header = document.createElement('div')).className = 'code-header'
        if (title) {
          title.classList.add('code-filename')
          header.appendChild(title)
        }
        header.appendChild(toolbox)
        content.insertBefore(header, pre)
      } else {
        content.appendChild(toolbox)
      }
    } else {
      pre.parentNode.appendChild(toolbox)
    }
    if (copy) copy.addEventListener('click', writeToClipboard.bind(copy, code))
  })

  function extractCommands (text) {
    var cmds = []
    var m
    while ((m = CMD_RX.exec(text))) cmds.push(m[1].replace(LINE_CONTINUATION_RX, '$1$2'))
    return cmds.join(' && ')
  }

  function writeToClipboard (code) {
    var text = code.innerText.replace(TRAILING_SPACE_RX, '')
    // Strip callout markers (angle brackets with numbers)
    text = text.replace(/\s*〈\s*\d+\s*〉/g, '')
    // Strip comment markers followed by callouts (e.g., ";; (1)" or "// (1)")
    text = text.replace(/\s*(;;|\/\/)\s*\(\d+\)/g, '')
    if (code.dataset.lang === 'console' && text.startsWith('$ ')) text = extractCommands(text)
    window.navigator.clipboard.writeText(text).then(
      function () {
        this.classList.add('clicked')
        setTimeout(function () {
          this.classList.remove('clicked')
        }.bind(this), 1000)
      }.bind(this),
      function () {}
    )
  }
})()
