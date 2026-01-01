'use strict'

module.exports = (files) => async (done) => {
  try {
    const stylelint = await import('stylelint')
    const result = await stylelint.default.lint({
      files,
      formatter: 'string',
    })

    if (result.report) {
      console.log(result.report)
    }

    if (result.errored) {
      done(new Error('Stylelint found errors'))
    } else {
      done()
    }
  } catch (err) {
    done(err)
  }
}
