#!/usr/bin/env node
const command = require('sergeant')
const commands = require('./index')
const thenify = require('thenify')
const makeDir = thenify(require('mkdirp'))
const writeFile = thenify(require('fs').writeFile)
const out = process.stdout
const deps = {
  makeDir,
  writeFile,
  out
}

command('framework', 'some helpful commands for your app', function ({parameter, option, command}) {
  command('render', 'render a component to static html', commands.render(deps))
})(process.argv.slice(2))
