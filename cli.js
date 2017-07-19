#!/usr/bin/env node
const command = require('sergeant')
const JSDOM = require('jsdom').JSDOM
const path = require('path')
const globParent = require('glob-parent')
const thenify = require('thenify')
const mkdirp = thenify(require('mkdirp'))
const glob = thenify(require('glob'))
const readFile = thenify(require('fs').readFile)
const writeFile = thenify(require('fs').writeFile)

command('framework', 'some helpful commands for your app', function ({parameter, option, command}) {
  command('render', 'render a component to static html', function ({parameter, option}) {
    parameter('state', {
      description: 'a glob to json files',
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
      default: 'body'
    })

    option('output', {
      description: 'a directory to save to. Defaults to dirname of <document>',
      aliases: ['o']
    })

    return function (args) {
      const component = require(path.join(process.cwd(), args.component))
      let outputDirectory = args.output

      if (!outputDirectory) {
        outputDirectory = path.dirname(path.join(process.cwd(), args.document))
      }

      return readFile(path.join(process.cwd(), args.document), 'utf8').then((html) => {
        const stateParent = globParent(args.state)

        return glob(args.state).then((files) => {
          return Promise.all(files.map((file) => {
            const dom = new JSDOM(html)
            const state = require(path.join(process.cwd(), file))
            const element = dom.window.document.querySelector(args.selector)

            if (element) {
              const fragment = new JSDOM(String(component({state, dispatch, next})))

              element.parentNode.replaceChild(fragment.window.document.body, element)
            }

            const result = dom.serialize()
            const relativeFile = path.relative(stateParent, file)
            const outputFile = path.join(outputDirectory, path.dirname(relativeFile), path.basename(relativeFile, path.extname(relativeFile))) + '.html'

            return mkdirp(path.dirname(outputFile)).then(() => {
              return writeFile(outputFile, result)
            })
          }))
        })
      })
    }
  })
})(process.argv.slice(2))

function dispatch () {
  throw new Error('dispatch is unavailable')
}

function next () {

}
