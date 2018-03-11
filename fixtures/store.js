module.exports = function (commit) {
  process.nextTick(function () {
    commit(function () {
      return {
        location: '/heading-1.html',
        heading: 'Heading a'
      }
    })

    commit(function () {
      return {
        location: '/heading-2.html',
        heading: 'Heading 2'
      }
    })
  })
}
