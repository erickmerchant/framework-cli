const assert = require('assert')
const chalk = require('chalk')
const JSDOM = require('jsdom').JSDOM
const path = require('path')
const get = require('lodash.get')
const promisify = require('util').promisify
const readFile = promisify(require('fs').readFile)

module.exports = function (deps) {
  assert.equal(typeof deps.makeDir, 'function')

  assert.equal(typeof deps.writeFile, 'function')

  assert.equal(typeof deps.out, 'object')

  assert.equal(typeof deps.out.write, 'function')

  return function ({option, parameter}) {
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
      type: function selector (val) {
        if (val == null) return 'body'

        return val
      }
    })

    option('location', {
      description: 'a json path to the location in the state',
      type: function location (val) {
        if (val == null) return 'location'

        return val
      }
    })

    option('output', {
      description: 'a directory to save to',
      alias: 'o',
      type: function output (val) {
        return val
      }
    })

    return function (args) {
      const component = require(path.join(process.cwd(), args.component))
      const store = require(path.join(process.cwd(), args.store))
      let outputDirectory = args.output

      if (!outputDirectory) {
        outputDirectory = path.dirname(args.document)
      }

      return readFile(args.document, 'utf8').then(function (html) {
        store(commit)

        function commit (current) {
          assert.equal(typeof current, 'function', 'current must be a function')

          const state = current()

          const dom = new JSDOM(html)
          const element = dom.window.document.querySelector(args.selector)

          if (element) {
            const fragment = new JSDOM(String(component({state, dispatch, next})))

            element.parentNode.replaceChild(fragment.window.document.querySelector(args.selector), element)
          }

          const result = dom.serialize()
          const location = get(state, args.location, 'index.html')

          assert.equal(typeof location, 'string', 'location must be a string')

          const file = path.join(outputDirectory, path.extname(location) ? location : path.join(location, 'index.html'))
          const relativeFile = path.relative(process.cwd(), file)

          deps.makeDir(path.dirname(file)).then(function () {
            return deps.writeFile(file, result).then(function () {
              deps.out.write(`${chalk.gray('[framework render]')} saved ${relativeFile}\n`)
            })
          })
        }
      })
    }
  }
}

function dispatch () {
  throw new Error('dispatch is unavailable')
}

function next () {

}
