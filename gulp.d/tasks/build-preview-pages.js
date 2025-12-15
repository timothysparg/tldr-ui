'use strict'

const Asciidoctor = require('@asciidoctor/core')()
const fs = require('fs-extra')
const handlebars = require('handlebars')
const merge = require('merge-stream')
const ospath = require('path')
const path = ospath.posix
const requireFromString = require('require-from-string')
const { Transform } = require('stream')
const map = (transform = () => {}, flush = undefined) => new Transform({ objectMode: true, transform, flush })
const vfs = require('vinyl-fs')
const yaml = require('js-yaml')

const ASCIIDOC_ATTRIBUTES = { experimental: '', icons: 'font', sectanchors: '', 'source-highlighter': 'highlight.js' }

module.exports = (src, previewSrc, previewDest, sink = () => map()) => (done) =>
  Promise.all([
    loadSampleUiModel(previewSrc),
    toPromise(
      merge(compileLayouts(src), registerPartials(src), registerHelpers(src), copyImages(previewSrc, previewDest))
    ),
    collectPosts(previewSrc),
  ])
    .then(([baseUiModel, { layouts }, posts]) => {
      const extensions = ((baseUiModel.asciidoc || {}).extensions || []).map((request) => {
        ASCIIDOC_ATTRIBUTES[request.replace(/^@|\.js$/, '').replace(/[/]/g, '-') + '-loaded'] = ''
        const extension = require(request)
        extension.register.call(Asciidoctor.Extensions)
        return extension
      })
      const asciidoc = { extensions }
      for (const component of baseUiModel.site.components) {
        for (const version of component.versions || []) version.asciidoc = asciidoc
      }
      baseUiModel = {
        ...baseUiModel,
        env: process.env,
        site: { ...(baseUiModel.site || {}), posts },
      }
      delete baseUiModel.asciidoc
      return [baseUiModel, layouts]
    })
    .then(([baseUiModel, layouts]) =>
      vfs
        .src('**/*.adoc', { base: previewSrc, cwd: previewSrc })
        .pipe(
          map((file, enc, next) => {
            const siteRootPath = path.relative(ospath.dirname(file.path), ospath.resolve(previewSrc))
            const uiModel = { ...baseUiModel }
            uiModel.page = { ...uiModel.page }
            uiModel.siteRootPath = siteRootPath
            uiModel.uiRootPath = path.join(siteRootPath, '_')
            if (file.stem === '404') {
              uiModel.page = { layout: '404', title: 'Page Not Found' }
            } else {
              const doc = Asciidoctor.load(file.contents, { safe: 'safe', attributes: ASCIIDOC_ATTRIBUTES })
              const pageAttributes = Object.entries(doc.getAttributes())
                .filter(([name, val]) => name.startsWith('page-'))
                .reduce((accum, [name, val]) => {
                  accum[name.slice(5)] = val
                  return accum
                }, {})
              uiModel.page.attributes = pageAttributes
              uiModel.page.description = doc.getAttribute('description')
              uiModel.page.layout = doc.getAttribute('page-layout', 'default')
              uiModel.page.title = doc.getDocumentTitle()
              uiModel.page.contents = Buffer.from(doc.convert())
            }
            file.extname = '.html'
            try {
              file.contents = Buffer.from(layouts.get(uiModel.page.layout)(uiModel))
              next(null, file)
            } catch (e) {
              next(transformHandlebarsError(e, uiModel.page.layout))
            }
          })
        )
        .pipe(vfs.dest(previewDest))
        .on('error', done)
        .pipe(sink())
    )

function loadSampleUiModel (src) {
  return fs.readFile(ospath.join(src, 'ui-model.yml'), 'utf8').then((contents) => yaml.safeLoad(contents))
}

/**
 * Registers all partial templates under the given source directory.
 * @param {string} src absolute or relative path to the source root containing partials
 * @returns {import('stream').Readable} vinyl stream for further piping
 */
function registerPartials (src) {
  return vfs.src('partials/*.hbs', { base: src, cwd: src }).pipe(
    map((file, enc, next) => {
      handlebars.registerPartial(file.stem, file.contents.toString())
      next()
    })
  )
}

/**
 * Registers Handlebars helpers found in the helpers directory.
 * @param {string} src absolute or relative path to the source root containing helpers
 * @returns {import('stream').Readable} vinyl stream for further piping
 */
function registerHelpers (src) {
  handlebars.registerHelper('resolvePage', resolvePage)
  handlebars.registerHelper('resolvePageURL', resolvePageURL)
  return vfs.src('helpers/*.js', { base: src, cwd: src }).pipe(
    map((file, enc, next) => {
      handlebars.registerHelper(file.stem, requireFromString(file.contents.toString()))
      next()
    })
  )
}

/**
 * Compiles all layout templates and exposes them via a Map keyed by stem.
 * @param {string} src absolute or relative path to the source root containing layouts
 * @returns {import('stream').Readable} vinyl stream that emits { layouts }
 */
function compileLayouts (src) {
  const layouts = new Map()
  return vfs.src('layouts/*.hbs', { base: src, cwd: src }).pipe(
    map(
      (file, enc, next) => {
        const srcName = path.join(src, file.relative)
        layouts.set(file.stem, handlebars.compile(file.contents.toString(), { preventIndent: true, srcName }))
        next()
      },
      function (done) {
        this.push({ layouts })
        done()
      }
    )
  )
}

/**
 * Copies preview images into the destination folder.
 * @param {string} src directory containing images
 * @param {string} dest destination directory
 * @returns {import('stream').Readable} vinyl stream for further piping
 */
function copyImages (src, dest) {
  return vfs
    .src('**/*.{png,svg}', { base: src, cwd: src })
    .pipe(vfs.dest(dest))
    .pipe(map((file, enc, next) => next()))
}

function resolvePage (spec, context = {}) {
  if (spec) return { pub: { url: resolvePageURL(spec) } }
}

/**
 * Collects posts from preview AsciiDoc sources and returns normalized metadata.
 * @param {string} previewSrc root path for preview AsciiDoc sources
 * @returns {Promise<Array<{title:string,url:string,summary:string,date:Date|null}>>}
 */
function collectPosts (previewSrc) {
  return walkAdocFiles(previewSrc).then((paths) =>
    Promise.all(
      paths.map((filePath) =>
        fs.readFile(filePath, 'utf8').then((contents) => {
          const doc = Asciidoctor.load(contents, { safe: 'safe', attributes: ASCIIDOC_ATTRIBUTES })
          const pageRole = doc.getAttribute('page-role')
          if (pageRole !== 'article') return null
          const html = doc.convert()
          const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
          const rel = path.relative(previewSrc, filePath)
          const url = rel.slice(0, rel.lastIndexOf('.')) + '.html'
          const date = doc.getAttribute('revdate') || doc.getAttribute('date') || doc.getAttribute('page-date')
          return {
            title: doc.getDocumentTitle(),
            url,
            summary: text.slice(0, 100),
            date: parseDate(date),
          }
        })
      )
    ).then((items) => items.filter(Boolean))
  )
}

function resolvePageURL (spec, context = {}) {
  if (spec) return '/' + (spec = spec.split(':').pop()).slice(0, spec.lastIndexOf('.')) + '.html'
}

/**
 * Recursively finds all AsciiDoc files under a root directory.
 * @param {string} root directory to search
 * @returns {Promise<string[]>} list of absolute file paths
 */
function walkAdocFiles (root) {
  const results = []
  return fs
    .readdir(root, { withFileTypes: true })
    .then((entries) =>
      Promise.all(
        entries.map((entry) => {
          const fullPath = ospath.join(root, entry.name)
          if (entry.isDirectory()) return walkAdocFiles(fullPath).then((files) => results.push(...files))
          if (entry.isFile() && entry.name.toLowerCase().endsWith('.adoc')) results.push(fullPath)
        })
      )
    )
    .then(() => results)
}

/**
 * Parses a date-like value and returns a Date or null on failure.
 * @param {string|number|Date} value raw date input
 * @returns {Date|null}
 */
function parseDate (value) {
  if (!value) return null
  const parsed = new Date(value)
  return isNaN(parsed) ? null : parsed
}

/**
 * Wraps Handlebars errors with template context for easier debugging.
 * @param {Error} param0 original error with stack
 * @param {string} layout layout name being rendered
 * @returns {Error}
 */
function transformHandlebarsError ({ message, stack }, layout) {
  const m = stack.match(/^ *at Object\.ret \[as (.+?)\]/m)
  const templatePath = `src/${m ? 'partials/' + m[1] : 'layouts/' + layout}.hbs`
  const err = new Error(`${message}${~message.indexOf('\n') ? '\n^ ' : ' '}in UI template ${templatePath}`)
  err.stack = [err.toString()].concat(stack.slice(message.length + 8)).join('\n')
  return err
}

/**
 * Converts a stream into a Promise, merging any emitted object chunks.
 * @param {import('stream').Readable} stream stream to consume
 * @returns {Promise<Object>} aggregated data object
 */
function toPromise (stream) {
  return new Promise((resolve, reject, data = {}) =>
    stream
      .on('error', reject)
      .on('data', (chunk) => chunk.constructor === Object && Object.assign(data, chunk))
      .on('finish', () => resolve(data))
  )
}
