#!/usr/bin/env node
const command = require('sergeant')
const render = require('./src/render.js')
const promisify = require('util').promisify
const makeDir = require('make-dir')
const writeFile = promisify(require('fs').writeFile)
const out = process.stdout
const deps = {
  makeDir,
  writeFile,
  out
}

command('framework', 'some helpful commands for your app', ({ parameter, option, command }) => {
  command('render', 'render a component to static html', ({ option, parameter }) => {
    parameter('store', {
      description: 'the store',
      required: true
    })

    parameter('component', {
      description: 'the component',
      required: true
    })

    parameter('document', {
      description: 'the target html document',
      required: true
    })

    option('selector', {
      description: 'a selector to find in the document',
      type (val = 'body') {
        return val
      }
    })

    option('location', {
      description: 'a json path to the location in the state',
      type (val = 'location') {
        return val
      }
    })

    option('output', {
      description: 'a directory to save to',
      alias: 'o',
      type (val) { return val }
    })

    return (args) => render(deps)(args)
  })
})(process.argv.slice(2))
