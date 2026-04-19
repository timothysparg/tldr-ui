'use strict'

const verifyAntoraConfig = require('../../scripts/verify-antora-config')
const verifyDevicons = require('../../scripts/verify-devicons')
const verifyExtensions = require('../../scripts/verify-extensions')
const verifyHtml = require('../../scripts/verify-html')
const verifyToc = require('../../scripts/verify-toc')

module.exports = () => {
  const task = async () => {
    verifyAntoraConfig()
    verifyDevicons()
    verifyToc()
    await verifyExtensions()
    verifyHtml()
  }
  task.displayName = 'verify'
  return task
}
