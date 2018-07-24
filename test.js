const test = require('tape')
const execa = require('execa')
const chalk = require('chalk')
const promisify = require('util').promisify
const readFile = promisify(require('fs').readFile)
const stream = require('stream')
const out = new stream.Writable()
out._write = () => {}

test('src/render.js - functionality', async function (t) {
  t.plan(3)

  const output = []
  const [result1, result2] = await Promise.all([
    readFile('./fixtures/heading-1.html', 'utf-8'),
    readFile('./fixtures/heading-2.html', 'utf-8')
  ])

  require('./src/render.js')({
    makeDir (directory) {
      t.equal('fixtures', directory)

      return Promise.resolve(true)
    },
    writeFile (path, content) {
      output.push([path, content])

      return Promise.resolve(true)
    },
    out
  })({
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

test('src/render.js - console', function (t) {
  t.plan(1)

  const output = []

  require('./src/render.js')({
    makeDir (directory) {
      return Promise.resolve(true)
    },
    writeFile (path, content) {
      return Promise.resolve(true)
    },
    out: {
      write (str) {
        output.push(str)
      }
    }
  })({
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
          `${chalk.gray('[framework render]')} saved fixtures/heading-1.html\n`,
          `${chalk.gray('[framework render]')} saved fixtures/heading-2.html\n`
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
