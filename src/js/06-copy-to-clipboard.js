;(function () {
  'use strict'

  const supportsCopy = window.navigator.clipboard

  if (!supportsCopy) return

  document.addEventListener('click', function (event) {
    const copy = event.target.closest('.copy-button')
    if (!copy) return
    const copyText = copy.dataset.copyText
    if (!copyText) return
    writeToClipboard.call(copy, copyText)
  })

  function writeToClipboard(copyText) {
    window.navigator.clipboard.writeText(copyText).then(
      function () {
        const icon = this.querySelector('i')
        const originalText = icon && icon.textContent
        if (icon) icon.textContent = 'done'
        this.classList.add('primary-text')
        setTimeout(
          function () {
            this.classList.remove('primary-text')
            if (icon) icon.textContent = originalText
          }.bind(this),
          1000
        )
      }.bind(this),
      function () {}
    )
  }
})()
