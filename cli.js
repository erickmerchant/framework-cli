#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp')
const assert = require('assert')
const cheerio = require('cheerio')
const command = require('sergeant')
const error = require('sergeant/error')
const chokidar = require('chokidar')

command('framework', 'some helpful commands for your app', function ({parameter, option, command}) {
  command('render', 'render a component to static html', function ({parameter, option}) {
    parameter('renderer', {
      description: 'the module that does the rendering',
      required: true
    })

    option('watch', {
      description: 'watch for changes',
      type: Boolean,
      aliases: ['w'],
      default: false
    })

    return function (args) {
      run(args.renderer)

      if (args.watch) {
        chokidar.watch([args.renderer], {ignoreInitial: true}).on('all', () => {
          run(args.renderer)
        })
      }
    }
  })
})(process.argv.slice(2))

function run (renderer) {
  try {
    delete require.cache[path.join(process.cwd(), renderer)]

    const required = require(path.join(process.cwd(), renderer))

    assert.equal(typeof required, 'function', 'the required module should be a function')

    required(render)
  } catch (e) {
    error(e)

    process.exit(1)
  }
}

function render (inpath, selector, save) {
  fs.readFile(inpath, 'utf-8', function (err, content) {
    if (err) throw err

    const $ = cheerio.load(content)

    save(function (outpath, html) {
      mkdirp(path.dirname(outpath), function (err) {
        if (err) throw err

        $(selector).replaceWith(String(html))

        fs.writeFile(outpath, $.html(), function (err) {
          if (err) throw err
        })
      })
    })
  })
}
