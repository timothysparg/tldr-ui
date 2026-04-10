'use strict'

const { execFileSync } = require('child_process')
const fs = require('fs')
const ospath = require('path')
const discoverCodeLanguages = require('./discover-code-languages')
const { getDeviconDir } = require('./devicon-config')

let ensured = false

module.exports = function ensureDeviconCache(config = {}) {
  if (ensured) return
  const extensionFile = config.extensionFile
  const deviconDir = getDeviconDir(config)
  const requiredIcons = normalizeIcons(
    config.requiredIcons || discoverCodeLanguages({ projectRoot: config.projectRoot, roots: config.iconDiscoveryRoots })
  )
  let missing = findMissingIcons(deviconDir, requiredIcons)
  if (missing.length) {
    execFileSync(
      process.execPath,
      [extensionFile, '--sync-devicons', JSON.stringify({ ...config, icons: requiredIcons })],
      {
        stdio: 'inherit',
      }
    )
    missing = findMissingIcons(deviconDir, requiredIcons)
    if (missing.length) {
      throw new Error(
        `Required icon files are  missing: ${missing.join(', ')}. ` + `The converter could not download them.`
      )
    }
  }
  ensured = true
}

function findMissingIcons(deviconDir, icons) {
  return icons.filter((iconName) => !fs.existsSync(ospath.join(deviconDir, `${iconName}.svg`)))
}

function normalizeIcons(icons) {
  return Array.from(new Set((icons || []).map((icon) => String(icon || '').trim()).filter(Boolean))).sort()
}
