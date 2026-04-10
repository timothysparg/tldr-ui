'use strict'

const fs = require('fs-extra')
const fetch = require('make-fetch-happen').defaults({
  retry: {
    retries: 2,
  },
})
const ospath = require('path')
const discoverCodeLanguages = require('./discover-code-languages')
const { DEVICON_BASE_URL, getDeviconDir, getDirectIconUrls } = require('./devicon-config')

module.exports = async function syncDevicons({
  icons,
  deviconDir,
  directIconUrls,
  log = () => {},
  projectRoot,
  iconDiscoveryRoots,
} = {}) {
  const resolvedDeviconDir = getDeviconDir({ deviconDir, projectRoot })
  await fs.ensureDir(resolvedDeviconDir)
  const directUrls = getDirectIconUrls({ directIconUrls })
  const requiredIcons = normalizeIcons(icons || discoverCodeLanguages({ projectRoot, roots: iconDiscoveryRoots }))
  const seen = new Set()
  for (const rawName of requiredIcons) {
    const iconName = String(rawName).trim()
    if (!iconName || seen.has(iconName)) continue
    seen.add(iconName)
    const targetPath = ospath.join(resolvedDeviconDir, `${iconName}.svg`)
    const url = directUrls[iconName] || `${DEVICON_BASE_URL}/${iconName}/${iconName}-original.svg`
    try {
      const response = await fetch(url, {
        cachePath: ospath.join(resolvedDeviconDir, '.http-cache'),
        signal: AbortSignal.timeout(10000),
      })
      if (!response.ok) {
        log(`skip ${iconName}: ${response.status} ${response.statusText}`)
        continue
      }
      const svg = cleanSvg(await response.text())
      await fs.writeFile(targetPath, svg, 'utf8')
      log(`synced ${iconName}`)
    } catch (err) {
      log(`skip ${iconName}: ${err.message}`)
    }
  }
}

function cleanSvg(svg) {
  return svg
    .replace(/<\?xml[^?]*\?>\s*/g, '')
    .replace(/<!DOCTYPE[^>]*>\s*/g, '')
    .trim()
}

function normalizeIcons(icons) {
  return Array.from(new Set((icons || []).map((icon) => String(icon || '').trim()).filter(Boolean))).sort()
}
