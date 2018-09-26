const assert = require('assert')
const promback = require('../promback')

describe('readme example', function () {

    let log, output

    beforeEach(function () {
        output = []
        log = console.log
        console.log = function (... args) { output.push(args) }
    })

    afterEach(function () {
        console.log = log
    })

    it('succeeds', async function () {

        const timeout = promback(function (ms, cb) {
            setTimeout(cb, ms)
        })

        const resolveFive = promback(function () {
            return Promise.resolve(5)
        })

        const resolveTen = promback(function () {
            return 10
        })

        await timeout(100)
            .then(resolveFive)
            .then(console.log) // logs 5
            .then(resolveTen)
            .then(console.log) // logs 10

        assert.deepStrictEqual(output, [ [ 5 ], [ 10 ] ])
    })
})
