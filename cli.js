#!/usr/bin/env node
const command = require('sergeant')

command('framework', 'some helpful commands for your app', function ({parameter, option, command}) {
  command('render', 'render a component to static html', function ({parameter, option}) {
    parameter('destination', {
      description: 'where to save to',
      required: true
    })

    parameter('html', {
      description: 'an html file. Rendered html will be injected into it',
      required: true
    })

    parameter('component', {
      description: 'your component',
      required: true
    })

    parameter('state', {
      description: 'a glob to modules with states to use',
      multiple: true
    })

    option('selector', {
      description: 'a selector to pass to document.querySelector to find where to inject html'
    })

    option('watch', {
      description: 'watch for changes',
      type: Boolean,
      aliases: ['w']
    })

    return function (args) {
      console.log(args)
    }
  })
})(process.argv.slice(2))
