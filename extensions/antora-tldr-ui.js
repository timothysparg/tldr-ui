'use strict'

const registerPostsExtension = require('./lib/register-posts-extension')

module.exports.register = function ({ config = {} }) {
  registerPostsExtension.call(this, { config })
}
