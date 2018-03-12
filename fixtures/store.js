module.exports = function (commit) {
  commit(function () {
    return {
      location: '/heading-1.html',
      heading: 'Heading 1'
    }
  })

  commit(function () {
    return {
      location: '/heading-2.html',
      heading: 'Heading 2'
    }
  })
}
