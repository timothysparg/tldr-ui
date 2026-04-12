;(function () {
  'use strict'

  const STATE_ICONS = {
    idle: 'content_copy',
    success: 'check',
    error: 'content_copy_off',
  }

  const buttons = document.querySelectorAll('.code-copy-button[data-copy-text]')
  if (!buttons.length) return

  buttons.forEach((button) => {
    button.addEventListener('click', () => copyCode(button))
  })

  async function copyCode(button) {
    const text = button.getAttribute('data-copy-text') || ''

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text)
      } else {
        fallbackCopy(text)
      }
      setButtonState(button, 'success')
    } catch {
      setButtonState(button, 'error')
    }
  }

  function fallbackCopy(text) {
    const input = document.createElement('textarea')
    input.value = text
    input.setAttribute('readonly', '')
    input.style.position = 'fixed'
    input.style.inset = '0'
    input.style.opacity = '0'
    document.body.appendChild(input)
    input.select()
    document.execCommand('copy')
    input.remove()
  }

  function setButtonState(button, state) {
    const icon = button.querySelector('.material-symbols-outlined')
    if (icon) icon.textContent = STATE_ICONS[state] || STATE_ICONS.idle

    button.dataset.state = state
    window.clearTimeout(button._copyResetTimer)
    button._copyResetTimer = window.setTimeout(() => {
      if (icon) icon.textContent = STATE_ICONS.idle
      button.dataset.state = 'idle'
    }, 1200)
  }
})()
