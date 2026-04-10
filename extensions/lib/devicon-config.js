'use strict'

const ospath = require('path')

const DEVICON_REF = process.env.DEVICON_REF || 'latest'
const DEVICON_BASE_URL = `https://cdn.jsdelivr.net/gh/devicons/devicon@${DEVICON_REF}/icons`

const ICON_ALIASES = {
  cpp: 'cplusplus',
  js: 'javascript',
  shell: 'bash',
  shellscript: 'bash',
  sh: 'bash',
  ts: 'typescript',
}

let runtimeConfig = {
  directIconUrls: {},
  deviconDir: ospath.join('build', 'devicons'),
  projectRoot: process.cwd(),
}

function getIconName(lang) {
  const normalized = String(lang || '')
    .trim()
    .toLowerCase()
  return ICON_ALIASES[normalized] || normalized
}

function setDeviconRuntimeConfig(config = {}) {
  runtimeConfig = {
    ...runtimeConfig,
    ...config,
    directIconUrls: { ...(config.directIconUrls || runtimeConfig.directIconUrls || {}) },
  }
}

function getDeviconDir(config = {}) {
  const deviconDir = config.deviconDir || runtimeConfig.deviconDir || ospath.join('build', 'devicons')
  return ospath.resolve(config.projectRoot || runtimeConfig.projectRoot || process.cwd(), deviconDir)
}

function getDirectIconUrls(config = {}) {
  return { ...(config.directIconUrls || runtimeConfig.directIconUrls || {}) }
}

module.exports = {
  DEVICON_BASE_URL,
  ICON_ALIASES,
  getDeviconDir,
  getDirectIconUrls,
  getIconName,
  setDeviconRuntimeConfig,
}
