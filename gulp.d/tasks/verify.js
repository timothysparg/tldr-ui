'use strict'

const verifyAntoraConfig = require('../../scripts/verify-antora-config')
const verifyDevicons = require('../../scripts/verify-devicons')
const verifyHtml = require('../../scripts/verify-html')

module.exports = () => {
  const task = async () => {
    verifyAntoraConfig()
    verifyDevicons()
    verifyHtml()
  }
  task.displayName = 'verify'
  return task
}
