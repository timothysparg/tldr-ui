'use strict'

const { execFileSync } = require('child_process')
const fs = require('fs')
const ospath = require('path')
const discoverCodeLanguages = require('./discover-code-languages')
const { getDeviconDir } = require('./devicon-config')

let ensured = false
const supportsColor = Boolean(process.stderr && process.stderr.isTTY)
const ansi = supportsColor
  ? {
      bold: '\x1b[1m',
      reset: '\x1b[0m',
      yellow: '\x1b[33m',
    }
  : {
      bold: '',
      reset: '',
      yellow: '',
    }

module.exports = function ensureDeviconCache(config = {}) {
  if (ensured) return
  const extensionFile = config.extensionFile
  const deviconDir = getDeviconDir(config)
  const strictIcons = Boolean(config.strictIcons)
  const requiredIcons = normalizeIcons(
    config.requiredIcons || discoverCodeLanguages({ projectRoot: config.projectRoot, roots: config.iconDiscoveryRoots })
  )
  let missing = findMissingIcons(deviconDir, requiredIcons)
  if (missing.length) {
    try {
      execFileSync(
        process.execPath,
        [extensionFile, '--sync-devicons', JSON.stringify({ ...config, icons: requiredIcons })],
        { stdio: 'inherit' }
      )
    } catch (err) {
      if (strictIcons) throw err
      warnMissingIcons(missing, `Icon sync failed: ${err.message}`)
    }
    missing = findMissingIcons(deviconDir, requiredIcons)
    if (missing.length) {
      if (strictIcons) {
        throw new Error(
          `Required icon files are missing: ${missing.join(', ')}. ` + `The converter could not download them.`
        )
      }
      warnMissingIcons(missing)
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

function warnMissingIcons(missing, message = null) {
  const lines = [
    `${ansi.yellow}${ansi.bold}[tldr-ui] WARNING${ansi.reset}: some code block icons could not be resolved.`,
    `${ansi.yellow}[tldr-ui]${ansi.reset} Falling back to the generic code icon for the missing entries below.`,
    `${ansi.yellow}[tldr-ui]${ansi.reset} Missing icons: ${ansi.bold}${missing.join(', ')}${ansi.reset}`,
    `${ansi.yellow}[tldr-ui]${ansi.reset} Set ${ansi.bold}asciidoc.strict_icons: true${ansi.reset} to make missing icons fail the build.`,
  ]
  if (message) lines.splice(3, 0, `${ansi.yellow}[tldr-ui]${ansi.reset} ${message}`)
  console.warn(`\n${lines.join('\n')}\n`)
}
