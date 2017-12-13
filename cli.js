#!/usr/bin/env node
const command = require('sergeant')
const render = require('./index').render

command('framework', 'some helpful commands for your app', function ({parameter, option, command}) {
  command('render', 'render a component to static html', function ({parameter, option}) {
    parameter('state', {
      description: 'json files',
      required: true,
      multiple: true
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
      default: { value: 'body' }
    })

    option('output', {
      description: 'a directory to save to',
      default: { text: 'dirname of <document>', value: false },
      aliases: ['o']
    })

    return render
  })
})(process.argv.slice(2))
