'use strict'

module.exports = function isVideo(value) {
  const path = String(value || '')
    .split(/[?#]/, 1)[0]
    .toLowerCase()
  return /\.(?:mp4|webm|ogv)$/.test(path)
}
