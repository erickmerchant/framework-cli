const test = require('tape')
const execa = require('execa')
const path = require('path')
const thenify = require('thenify')
const readFile = thenify(require('fs').readFile)

const noopDeps = {
  makeDir: () => Promise.resolve(true),
  writeFile: () => Promise.resolve(true)
}
const noopDefiners = {
  parameter () {},
  option () {}
}

test('index.js render - options and parameters', function (t) {
  t.plan(12)

  const parameters = {}
  const options = {}

  require('./index').render(noopDeps)({
    parameter (name, args) {
      parameters[name] = args
    },
    option (name, args) {
      options[name] = args
    }
  })

  t.ok(parameters.state)

  t.equal(parameters.state.required, true)

  t.equal(parameters.state.multiple, true)

  t.ok(parameters.component)

  t.equal(parameters.component.required, true)

  t.ok(parameters.document)

  t.equal(parameters.document.required, true)

  t.ok(options.selector)

  t.deepEqual(options.selector.default, { value: 'body' })

  t.ok(options.output)

  t.deepEqual(options.output.default, { text: 'dirname of <document>', value: false })

  t.deepEqual(options.output.aliases, ['o'])
})

test('index.js render - functionality', async function (t) {
  t.plan(3)

  const output = []
  const [result1, result2] = await Promise.all([
    readFile('./fixtures/heading-1.html', 'utf-8'),
    readFile('./fixtures/heading-2.html', 'utf-8')
  ])

  require('./index').render({
    makeDir (directory) {
      t.equal(path.join(process.cwd(), './fixtures'), directory)

      return Promise.resolve(true)
    },
    writeFile (path, content) {
      output.push([path, content])

      return Promise.resolve(true)
    }
  })(noopDefiners)({
    state: ['./fixtures/*.json'],
    component: './fixtures/component.js',
    document: './fixtures/document.html',
    selector: 'main',
    output: false
  })
    .then(function () {
      t.deepEqual(output, [
        [
          path.join(process.cwd(), './fixtures/heading-1.html'),
          result1
        ],
        [
          path.join(process.cwd(), './fixtures/heading-2.html'),
          result2
        ]
      ])
    })
})

test('cli.js render', async function (t) {
  t.plan(4)

  try {
    await execa('node', ['./cli.js', 'render', '-h'])
  } catch (e) {
    t.ok(e)

    t.equal(e.stderr.includes('Usage'), true)

    t.equal(e.stderr.includes('Options'), true)

    t.equal(e.stderr.includes('Parameters'), true)
  }
})
