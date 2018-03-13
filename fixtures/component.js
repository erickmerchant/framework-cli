const html = require('nanohtml')

module.exports = function ({state}) {
  return html`<main><h1>${state.heading}</h1></main>`
}
