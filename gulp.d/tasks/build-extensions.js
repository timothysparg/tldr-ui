'use strict'

const esbuild = require('esbuild')
const fs = require('fs-extra')
const ospath = require('path')

module.exports = () => {
  const task = async () => {
    const rootDir = ospath.join(__dirname, '..', '..')
    const outdir = ospath.join(rootDir, 'build', 'extensions')
    await fs.emptyDir(outdir)
    await esbuild.build({
      bundle: true,
      entryPoints: {
        'antora-tldr-ui': ospath.join(rootDir, 'extensions', 'antora-tldr-ui.js'),
        'asciidoc-tldr-ui': ospath.join(rootDir, 'extensions', 'asciidoc-tldr-ui.js'),
      },
      external: ['@asciidoctor/core'],
      format: 'cjs',
      outdir,
      platform: 'node',
      sourcemap: false,
      target: 'node22',
    })
  }
  task.displayName = 'build:extensions'
  return task
}
