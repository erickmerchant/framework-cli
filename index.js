const JSDOM = require('jsdom').JSDOM
const path = require('path')
const commonDir = require('common-dir')
const thenify = require('thenify')
const glob = thenify(require('glob'))
const readFile = thenify(require('fs').readFile)

exports.render = function (deps) {
  return function ({option, parameter}) {
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

    return function (args) {
      const component = require(path.join(process.cwd(), args.component))
      let outputDirectory = args.output

      if (!outputDirectory) {
        outputDirectory = path.dirname(path.join(process.cwd(), args.document))
      }

      return readFile(path.join(process.cwd(), args.document), 'utf8').then(function (html) {
        return Promise.all(args.state.map((state) => glob(state, {nodir: true})))
        .then(function (files) {
          files = files.reduce((files, current) => files.concat(current), [])

          const stateParent = commonDir(files)

          return Promise.all(files.map(function (file) {
            const dom = new JSDOM(html)
            const state = require(path.join(process.cwd(), file))
            const element = dom.window.document.querySelector(args.selector)

            if (element) {
              const fragment = new JSDOM(String(component({state, dispatch, next})))

              element.parentNode.replaceChild(fragment.window.document.querySelector(args.selector), element)
            }

            const result = dom.serialize()
            const relativeFile = path.relative(stateParent, file)
            const outputFile = path.join(outputDirectory, path.dirname(relativeFile), path.basename(relativeFile, path.extname(relativeFile))) + '.html'

            return deps.makeDir(path.dirname(outputFile)).then(function () {
              return deps.writeFile(outputFile, result)
            })
          }))
        })
      })
    }
  }
}

function dispatch () {
  throw new Error('dispatch is unavailable')
}

function next () {

}
