'use strict'

const esbuild = require('esbuild')
const fs = require('fs-extra')
const ospath = require('path')

module.exports = () => {
  const task = async () => {
    const rootDir = ospath.join(__dirname, '..', '..')
    const outdir = ospath.join(rootDir, 'build', 'extensions')
    const sharedOptions = { bundle: true, format: 'cjs', outdir, platform: 'node', sourcemap: false, target: 'node22' }
    await fs.emptyDir(outdir)
    await Promise.all([
      esbuild.build({
        ...sharedOptions,
        entryPoints: { 'asciidoc-tldr-ui': ospath.join(rootDir, 'extensions', 'asciidoc-tldr-ui.js') },
        external: ['@asciidoctor/core'],
      }),
      esbuild.build({
        ...sharedOptions,
        entryPoints: { 'antora-tldr-ui': ospath.join(rootDir, 'extensions', 'antora-tldr-ui.js') },
        external: ['@asciidoctor/core', './asciidoc-tldr-ui'],
      }),
    ])
  }
  task.displayName = 'build:extensions'
  return task
}
