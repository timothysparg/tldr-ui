'use strict'

const autoprefixer = require('autoprefixer')
const browserify = require('browserify')
const concat = require('gulp-concat')
const cssnano = require('cssnano')
const fs = require('fs-extra')
const ospath = require('path')
const path = ospath.posix
const postcss = require('gulp-postcss')
const postcssCalc = require('postcss-calc')
const postcssImport = require('postcss-import')
const postcssUrl = require('postcss-url')
const postcssVar = require('postcss-custom-properties')
const { Transform } = require('stream')
const map = (transform) => new Transform({ objectMode: true, transform })
const through = () => map((file, enc, next) => next(null, file))
const newer = require('gulp-newer')
const uglify = require('gulp-uglify')
const vfs = require('vinyl-fs')

const waitForStream = (stream) =>
  new Promise((resolve, reject) => {
    let settled = false
    const done = (err) => {
      if (settled) return
      settled = true
      err ? reject(err) : resolve()
    }
    stream.on('error', done)
    stream.on('finish', () => done())
    stream.on('end', () => done())
    stream.on('close', () => done())
  })

module.exports = (src, dest, preview) => {
  const task = () => {
    const opts = { base: src, cwd: src }
    const sourcemaps = preview || process.env.SOURCEMAPS === 'true'
    const postcssPlugins = [
      postcssImport,
      (css, { messages, opts: { file } }) =>
        Promise.all(
          messages
            .reduce((accum, { file: depPath, type }) => (type === 'dependency' ? accum.concat(depPath) : accum), [])
            .map((importedPath) => fs.stat(importedPath).then(({ mtime }) => mtime))
        ).then((mtimes) => {
          const newestMtime = mtimes.reduce((max, curr) => (!max || curr > max ? curr : max), file.stat.mtime)
          if (newestMtime > file.stat.mtime) file.stat.mtimeMs = +(file.stat.mtime = newestMtime)
        }),
      postcssUrl([
        {
          filter: (asset) => /^[~][^/]*(?:font|typeface)[^/]*\/.*\/files\/.+[.](?:ttf|woff2?)$/.test(asset.url),
          url: (asset) => {
            const relpath = asset.pathname.slice(1)
            const abspath = require.resolve(relpath)
            const basename = ospath.basename(abspath)
            const destpath = ospath.join(dest, 'font', basename)
            if (!fs.pathExistsSync(destpath)) fs.copySync(abspath, destpath)
            return path.join('..', 'font', basename)
          },
        },
        {
          filter: (asset) =>
            asset.absolutePath &&
            /[\\/]node_modules[\\/](?:@fontsource|@fortawesome)[\\/]/.test(asset.absolutePath) &&
            /\.(woff2?|ttf)$/.test(asset.absolutePath),
          url: (asset) => {
            const basename = ospath.basename(asset.absolutePath)
            const destpath = ospath.join(dest, 'font', basename)
            if (!fs.pathExistsSync(destpath)) fs.copySync(asset.absolutePath, destpath)
            return path.join('..', 'font', basename)
          },
        },
      ]),
      postcssVar({ preserve: preview }),
      // NOTE to make vars.css available to all top-level stylesheets, use the next line in place of the previous one
      //postcssVar({ importFrom: path.join(src, 'css', 'vars.css'), preserve: preview }),
      preview ? postcssCalc : null, // cssnano already applies postcssCalc
      autoprefixer,
      preview ? null : cssnano({ preset: 'default' }),
      preview ? null : postcssPseudoElementFixer,
    ].filter(Boolean)

    const runBuild = (imageminModule) => {
      const imagemin = imageminModule && (imageminModule.default || imageminModule)
      const imageminPlugins = imageminModule || imagemin
      const imageTransform =
        preview || !imagemin
          ? through()
          : imagemin(
              [
                imageminPlugins.gifsicle(),
                imageminPlugins.mozjpeg ? imageminPlugins.mozjpeg() : imageminPlugins.jpegtran(),
                imageminPlugins.optipng(),
                imageminPlugins.svgo({
                  plugins: [
                    { cleanupIDs: { preservePrefixes: ['icon-', 'view-'] } },
                    { removeViewBox: false },
                    { removeDesc: false },
                  ],
                }),
              ].reduce((accum, it) => (it ? accum.concat(it) : accum), [])
            )

      const toDest = (stream) => stream.pipe(vfs.dest(dest, { sourcemaps: sourcemaps && '.' }))
      const toDestBinary = (stream) => stream.pipe(vfs.dest(dest))
      const streamPromises = [
        waitForStream(toDest(vfs.src('ui.yml', { ...opts, allowEmpty: true }))),
        waitForStream(
          toDest(
            vfs
              .src('js/+([0-9])-*.js', { ...opts, read: false, sourcemaps })
              .pipe(bundle(opts))
              .pipe(uglify({ ie: true, module: false, output: { comments: /^! / } }))
              .pipe(concat('js/site.js'))
          )
        ),
        waitForStream(
          toDest(
            vfs
              .src('css/site.css', { ...opts, sourcemaps })
              .pipe(postcss((file) => ({ plugins: postcssPlugins, options: { file } })))
          )
        ),
        waitForStream(
          toDestBinary(
            vfs
              .src('img/**/*.{gif,ico,jpg,png,svg}', { ...opts, encoding: false })
              .pipe(newer(dest))
              .pipe(imageTransform)
          )
        ),
        waitForStream(toDest(vfs.src('helpers/*.js', opts))),
        waitForStream(toDest(vfs.src('layouts/*.hbs', opts))),
        waitForStream(toDest(vfs.src('partials/*.hbs', opts))),
      ]

      const fontDir = ospath.join(src, 'font')
      if (fs.pathExistsSync(fontDir)) {
        streamPromises.push(waitForStream(toDestBinary(vfs.src('font/*.{ttf,woff*(2)}', { ...opts, encoding: false }))))
      }

      const staticDir = ospath.join(src, 'static')
      if (fs.pathExistsSync(staticDir)) {
        streamPromises.push(
          waitForStream(
            toDestBinary(vfs.src(['**/*', '!**/*~'], { base: staticDir, cwd: staticDir, dot: true, encoding: false }))
          )
        )
      }

      const roughNotationSrc = require.resolve('rough-notation/lib/rough-notation.iife.js')
      streamPromises.push(
        waitForStream(
          vfs
            .src(roughNotationSrc)
            .pipe(
              map((file, enc, next) => {
                file.path = ospath.join(file.base, 'js', 'vendor', 'rough-notation.iife.js')
                next(null, file)
              })
            )
            .pipe(vfs.dest(dest))
        )
      )

      return Promise.all(streamPromises)
    }

    if (preview) return runBuild()

    return import('gulp-imagemin').then((imageminModule) => runBuild(imageminModule))
  }
  task.displayName = 'build:assets'
  return task
}

function bundle({ base: basedir, ext: bundleExt = '.bundle.js' }) {
  return map((file, enc, next) => {
    if (bundleExt && file.relative.endsWith(bundleExt)) {
      const mtimePromises = []
      const bundlePath = file.path
      browserify(file.relative, { basedir, detectGlobals: false })
        .plugin('browser-pack-flat/plugin')
        .on('file', (bundledPath) => {
          if (bundledPath !== bundlePath) mtimePromises.push(fs.stat(bundledPath).then(({ mtime }) => mtime))
        })
        .bundle((bundleError, bundleBuffer) =>
          Promise.all(mtimePromises).then((mtimes) => {
            const newestMtime = mtimes.reduce((max, curr) => (curr > max ? curr : max), file.stat.mtime)
            if (newestMtime > file.stat.mtime) file.stat.mtimeMs = +(file.stat.mtime = newestMtime)
            if (bundleBuffer !== undefined) file.contents = bundleBuffer
            next(bundleError, Object.assign(file, { path: file.path.slice(0, file.path.length - 10) + '.js' }))
          })
        )
      return
    }
    fs.readFile(file.path, 'UTF-8').then((contents) => {
      next(null, Object.assign(file, { contents: Buffer.from(contents) }))
    })
  })
}

function postcssPseudoElementFixer() {
  return {
    postcssPlugin: 'postcss-pseudo-element-fixer',
    Rule(rule) {
      if (!/(?:^|[^:]):(?:before|after)/.test(rule.selector)) return
      rule.selector = rule.selectors.map((it) => it.replace(/(^|[^:]):(before|after)$/, '$1::$2')).join(',')
    },
  }
}

postcssPseudoElementFixer.postcss = true
