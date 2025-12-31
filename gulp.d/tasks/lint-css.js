'use strict'

const stylelint = require('stylelint')

module.exports = (files) => async (done) => {
  try {
    const result = await stylelint.lint({
      files,
      formatter: 'string',
    })

    if (result.output) {
      console.log(result.output)
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
