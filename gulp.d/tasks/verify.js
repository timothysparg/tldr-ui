'use strict'

const verifyAntoraConfig = require('../../scripts/verify-antora-config')
const verifyDevicons = require('../../scripts/verify-devicons')

module.exports = () => {
  const task = async () => {
    verifyAntoraConfig()
    verifyDevicons()
  }
  task.displayName = 'verify'
  return task
}
