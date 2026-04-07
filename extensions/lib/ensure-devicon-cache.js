'use strict'

const { execFileSync } = require('child_process')
const fs = require('fs')
const ospath = require('path')
const { REQUIRED_ICONS, getDeviconDir } = require('./devicon-config')

let ensured = false

module.exports = function ensureDeviconCache(config = {}) {
  if (ensured) return
  const extensionFile = config.extensionFile
  const deviconDir = getDeviconDir(config)
  let missing = REQUIRED_ICONS.filter((iconName) => !fs.existsSync(ospath.join(deviconDir, `${iconName}.svg`)))
  if (missing.length) {
    execFileSync(process.execPath, [extensionFile, '--sync-devicons', JSON.stringify(config)], { stdio: 'inherit' })
    missing = REQUIRED_ICONS.filter((iconName) => !fs.existsSync(ospath.join(deviconDir, `${iconName}.svg`)))
    if (missing.length) {
      throw new Error(
        `Required icon files are  missing: ${missing.join(', ')}. ` + `The converter could not download them.`
      )
    }
  }
  ensured = true
}
