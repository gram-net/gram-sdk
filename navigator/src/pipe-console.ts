/** @format */

function pipeConsole(types, store) {
  const { dispatch, commit } = store

  types.forEach((type) => {
    const o_log = console[type]
    commit('Console/overrideOriginalConsole', {
      type: type
    })
    console[type] = (...args) => {
      dispatch('Console/appendLog', {
        log: args,
        type: type
      })
      o_log(...args)
    }
  })
}

function testConsole() {
  // Multi variables...
  const str = 'line!'
  console.log('This', 'should', 'output', 'in', 'one', str)
  // Line breaks...
  console.log('This is line 1\nThis is line 2')
  console.log('This should appear in our logger colored GREY and have 2')
  // causes the counter to increment for the above log message since its the same
  console.log('This should appear in our logger colored GREY and have 2', 2)
  console.info('This should appear in our logger colored BLUE')
  console.warn('This should appear in our logger colored YELLOW')
  console.error('This should appear in our logger colored RED')

  // Templated strings ...
  const firstName = 'John'
  const lastName = 'Smith'
  console.log(`First name: ${firstName}, last name: ${lastName}`)
  // Testing the console log output below...
  const fancyThings = {
    car: '🏎️ Ferrari',
    watch: '⌚ Cartier',
    clothing: {
      shoes: '👠 Christian Louboutin',
      dress: '👗 Versace'
    },
    boat: '🛥️ Sunseeker'
  }
  console.dir(fancyThings)

  // test throw (uncomment to see it in logs)
  // throw new Error("a TEST error in testConsole!");
}

export { pipeConsole, testConsole }
