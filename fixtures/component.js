const html = require('bel')

module.exports = function ({state}) {
  return html`<body><h1>${state.heading}</h1></body>`
}
