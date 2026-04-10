'use strict'

const LIGHT_THEME = 'github-light'
const DARK_THEME = 'github-dark'

// Languages to pre-load. Shiki loads them all before first use.
const BUNDLED_LANGS = [
  'asciidoc',
  'bash',
  'clojure',
  'cpp',
  'csharp',
  'css',
  'diff',
  'dockerfile',
  'elixir',
  'go',
  'groovy',
  'haskell',
  'html',
  'ini',
  'java',
  'javascript',
  'json',
  'jsonc',
  'kotlin',
  'lua',
  'markdown',
  'nginx',
  'objc',
  'perl',
  'php',
  'pkl',
  'plaintext',
  'properties',
  'puppet',
  'python',
  'ruby',
  'rust',
  'scala',
  'shell',
  'sql',
  'swift',
  'toml',
  'typescript',
  'xml',
  'yaml',
]

let _highlighter = null
let _initPromise = null
let _lightTheme = LIGHT_THEME
let _darkTheme = DARK_THEME

/**
 * Initialise the Shiki highlighter once and cache it.
 * Safe to call multiple times — subsequent calls return the same Promise.
 * @param {{ lightTheme?: string, darkTheme?: string }} [options]
 * @returns {Promise<import('shiki').Highlighter>}
 */
async function initHighlighter(options = {}) {
  if (_highlighter) return _highlighter
  if (_initPromise) return _initPromise
  _lightTheme = options.lightTheme || LIGHT_THEME
  _darkTheme = options.darkTheme || DARK_THEME
  const { createHighlighter } = require('shiki')
  _initPromise = createHighlighter({
    themes: [_lightTheme, _darkTheme],
    langs: BUNDLED_LANGS,
  }).then((h) => {
    _highlighter = h
    return h
  })
  return _initPromise
}

/**
 * Highlight code synchronously using the cached highlighter.
 * Falls back to plaintext if the language is unrecognised.
 * @param {string} code  raw source text
 * @param {string} lang  language identifier
 * @param {{ meta?: object, transformers?: Array<object> }} [options]
 * @returns {string}  highlighted HTML
 */
function highlight(code, lang, options = {}) {
  const h = _highlighter
  if (!h) throw new Error('Shiki highlighter has not been initialised. Call initHighlighter() first.')
  const opts = { ...options, lang, themes: { light: _lightTheme, dark: _darkTheme } }
  try {
    return h.codeToHtml(code, opts)
  } catch {
    return h.codeToHtml(code, { ...opts, lang: 'plaintext' })
  }
}

module.exports = { initHighlighter, highlight }
