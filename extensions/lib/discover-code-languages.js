'use strict'

const fs = require('fs')
const ospath = require('path')
const { getIconName } = require('./devicon-config')

const SOURCE_BLOCK_RX = /\[source\s*,\s*([^\],\s]+)(?:[^\]]|\n)*\]/gm
const DEFAULT_IGNORED_DIRS = new Set(['.git', 'build', 'node_modules', 'public'])

const uiRoot = ospath.resolve(__dirname, '..', '..')

module.exports = function discoverCodeLanguages({ projectRoot = uiRoot, roots } = {}) {
  const searchRoots = normalizeRoots(projectRoot, roots)
  const languages = new Set()

  for (const root of searchRoots) {
    for (const filePath of walkAdocFiles(root)) {
      const contents = fs.readFileSync(filePath, 'utf8')
      for (const match of contents.matchAll(SOURCE_BLOCK_RX)) {
        const language = match[1]
        if (!language) continue
        languages.add(getIconName(language))
      }
    }
  }

  return Array.from(languages).sort()
}

function normalizeRoots(projectRoot, roots) {
  const resolvedRoots = Array.isArray(roots) && roots.length ? roots : detectDefaultRoots(projectRoot)
  return resolvedRoots
    .map((root) => ospath.resolve(projectRoot, root))
    .filter((root, index, all) => fs.existsSync(root) && all.indexOf(root) === index)
}

function detectDefaultRoots(projectRoot) {
  const candidates = ['preview-src', 'docs', 'modules']
  const existing = candidates.filter((candidate) => fs.existsSync(ospath.resolve(projectRoot, candidate)))
  return existing.length ? existing : ['.']
}

function* walkAdocFiles(root) {
  const stats = fs.statSync(root)
  if (stats.isFile()) {
    if (root.toLowerCase().endsWith('.adoc')) yield root
    return
  }

  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (DEFAULT_IGNORED_DIRS.has(entry.name)) continue
      yield* walkAdocFiles(ospath.join(root, entry.name))
      continue
    }
    if (entry.isFile() && entry.name.toLowerCase().endsWith('.adoc')) {
      yield ospath.join(root, entry.name)
    }
  }
}
