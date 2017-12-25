#!/usr/bin/env node
const command = require('sergeant')
const commands = require('./index')
const thenify = require('thenify')
const makeDir = thenify(require('mkdirp'))
const writeFile = thenify(require('fs').writeFile)

command('framework', 'some helpful commands for your app', function ({parameter, option, command}) {
  command('render', 'render a component to static html', commands.render({makeDir, writeFile}))
})(process.argv.slice(2))
