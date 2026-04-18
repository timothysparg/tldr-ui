'use strict'

const fs = require('fs')
const ospath = require('path')
const { HTMLHint } = require('htmlhint')

const publicDir = ospath.join(__dirname, '..', 'public')

const config = {
  'alt-require': true,
  'attr-lowercase': true,
  'attr-no-duplication': true,
  'attr-value-double-quotes': true,
  'button-type-require': true,
  'doctype-html5': true,
  'h1-require': true,
  'html-lang-require': true,
  'id-unique': true,
  'main-require': true,
  'meta-charset-require': true,
  'meta-viewport-require': true,
  'form-method-require': true,
  'frame-title-require': true,
  'id-class-ad-disabled': true,
  'input-requires-label': true,
  'src-not-empty': true,
  'tag-no-obsolete': true,
  'tag-pair': true,
  'tagname-lowercase': true,
  'title-require': true,
}

module.exports = function verifyHtml() {
  if (!fs.existsSync(publicDir)) {
    throw new Error(`Built HTML not found at ${publicDir}. Run the preview build before HTML validation.`)
  }

  const htmlFiles = collectHtmlFiles(publicDir)
  const problems = []

  for (const file of htmlFiles) {
    const source = fs.readFileSync(file, 'utf8')
    const messages = HTMLHint.verify(source, config).map((message) => ({
      ...message,
      file,
    }))
    problems.push(...messages)
  }

  if (!problems.length) return

  const formatted = problems
    .map(({ file, line, col, rule, message }) => {
      const relative = ospath.relative(process.cwd(), file)
      return `${relative}:${line}:${col} [${rule.id}] ${message}`
    })
    .join('\n')

  throw new Error(`HTMLHint reported issues in built HTML.\n${formatted}`)
}

function collectHtmlFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  return entries.flatMap((entry) => {
    const fullPath = ospath.join(dir, entry.name)
    if (entry.isDirectory()) return collectHtmlFiles(fullPath)
    return entry.isFile() && entry.name.endsWith('.html') ? [fullPath] : []
  })
}
