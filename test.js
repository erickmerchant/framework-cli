const test = require('tape')
const execa = require('execa')
const chalk = require('chalk')
const thenify = require('thenify')
const readFile = thenify(require('fs').readFile)
const stream = require('stream')
const out = new stream.Writable()
out._write = () => {}

const noopDeps = {
  makeDir: () => Promise.resolve(true),
  writeFile: () => Promise.resolve(true),
  out
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

  t.ok(parameters.store)

  t.equal(parameters.store.required, true)

  t.ok(parameters.component)

  t.equal(parameters.component.required, true)

  t.ok(parameters.document)

  t.equal(parameters.document.required, true)

  t.ok(options.selector)

  t.equal(options.selector.default, 'body')

  t.ok(options.location)

  t.equal(options.location.default, 'location')

  t.ok(options.output)

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
      t.equal('fixtures', directory)

      return Promise.resolve(true)
    },
    writeFile (path, content) {
      output.push([path, content])

      return Promise.resolve(true)
    },
    out
  })(noopDefiners)({
    store: './fixtures/store.js',
    component: './fixtures/component.js',
    document: './fixtures/document.html',
    selector: 'main',
    location: 'location',
    output: false
  })
    .then(function () {
      t.deepEqual(output, [
        [
          'fixtures/heading-1.html',
          result1
        ],
        [
          'fixtures/heading-2.html',
          result2
        ]
      ])
    })
})

test('index.js render - console', function (t) {
  t.plan(1)

  const output = []

  require('./index').render({
    makeDir (directory) {
      return Promise.resolve(true)
    },
    writeFile (path, content) {
      return Promise.resolve(true)
    },
    out: {
      write: function (str) {
        output.push(str)
      }
    }
  })(noopDefiners)({
    store: './fixtures/store.js',
    component: './fixtures/component.js',
    document: './fixtures/document.html',
    selector: 'main',
    location: 'location',
    output: false
  })
    .then(function () {
      process.nextTick(function () {
        t.deepEqual(output, [
          chalk.green('\u2714') + ' saved fixtures/heading-1.html\n',
          chalk.green('\u2714') + ' saved fixtures/heading-2.html\n'
        ])
      })
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
