'use strict'

const verifyAntoraConfig = require('../../scripts/verify-antora-config')
const verifyDevicons = require('../../scripts/verify-devicons')
const verifyExtensions = require('../../scripts/verify-extensions')
const verifyHtml = require('../../scripts/verify-html')

module.exports = () => {
  const task = async () => {
    verifyAntoraConfig()
    verifyDevicons()
    await verifyExtensions()
    verifyHtml()
  }
  task.displayName = 'verify'
  return task
}
