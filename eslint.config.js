'use strict'

const js = require('@eslint/js')
const globals = require('globals')

module.exports = [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      'arrow-parens': ['error', 'always'],
      'comma-dangle': ['error', {
        arrays: 'always-multiline',
        objects: 'always-multiline',
        imports: 'always-multiline',
        exports: 'always-multiline',
        functions: 'ignore',
      }],
      'no-restricted-properties': ['error', {
        property: 'substr',
        message: 'Use String#slice instead.',
      }],
      'max-len': ['warn', 120, 2],
      'spaced-comment': 'off',
      'radix': ['error', 'always'],
      'no-var': 'error',
      'prefer-const': 'error',
    },
  },
  {
    ignores: [
      'build/**',
      'public/**',
      'node_modules/**',
    ],
  },
]
