'use strict'

const registerPostsExtension = require('./lib/register-posts-extension')
const { initHighlighter } = require('./lib/shiki-singleton')

module.exports.register = function ({ config = {} }) {
  const shikiOptions = config.shiki || {}
  this.on('contentClassified', async () => {
    await initHighlighter(shikiOptions)
  })
  registerPostsExtension.call(this, { config })
}
