const JSDOM = require('jsdom').JSDOM
const path = require('path')
const commondir = require('commondir')
const thenify = require('thenify')
const mkdirp = thenify(require('mkdirp'))
const glob = thenify(require('glob'))
const readFile = thenify(require('fs').readFile)
const writeFile = thenify(require('fs').writeFile)

exports.render = function (args) {
  const component = require(path.join(process.cwd(), args.component))
  let outputDirectory = args.output

  if (!outputDirectory) {
    outputDirectory = path.dirname(path.join(process.cwd(), args.document))
  }

  return readFile(path.join(process.cwd(), args.document), 'utf8').then(function (html) {
    return Promise.all(args.state.map((state) => glob(state, {nodir: true})))
    .then(function (files) {
      files = files.reduce((files, current) => files.concat(current), [])

      const stateParent = commondir(process.cwd(), files)

      return Promise.all(files.map(function (file) {
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

        return mkdirp(path.dirname(outputFile)).then(function () {
          return writeFile(outputFile, result)
        })
      }))
    })
  })
}

function dispatch () {
  throw new Error('dispatch is unavailable')
}

function next () {

}
