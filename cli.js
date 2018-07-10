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

command('framework', 'some helpful commands for your app', function ({parameter, option, command}) {
  command('render', 'render a component to static html', render(deps))
})(process.argv.slice(2))
