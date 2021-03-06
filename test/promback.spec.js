const assert = require('assert')

const bluebird = require('bluebird')
const aigle = require('aigle')
const promise = require('promise')
const es6_promise = require('es6-promise')
const when = require('when')
const promise_polyfill = require('promise-polyfill')

testUsing('default')
testUsing('built-in Promise', Promise)
testUsing('bluebird', bluebird)
testUsing('aigle', aigle)
testUsing('promise', promise)
testUsing('es6-promise', es6_promise)
testUsing('when', when.promise)
testUsing('promise-polyfill', promise_polyfill)

function testUsing (contextTitle, promiseLib) {

    let promback = contextTitle === 'default'
        ? require('../promback')
        : require('../promback').using(promiseLib)

    context(contextTitle, function () {

        describe('promback', function () {

            it('throws if passed value is not a function', function () {

                assert.throws(function () {
                    promback({})
                }, function (err) {
                    return err.message === 'A function is required to promback.'
                })
            })

            it('rejects when passed function throws', async function () {

                const err = new Error('an error')

                const fn = promback(function () { throw err })

                await assertRejects(function () {
                    return fn()
                }, function (e) {
                    return err === e
                })
            })

            it('rejects when passed function rejects', async function () {

                const err = new Error('an error')

                const fn = promback(function () { return Promise.reject(err) })

                await assertRejects(function () {
                    return fn()
                }, function (e) {
                    return err === e
                })
            })

            it('rejects when passed function calls callback with an error',
                async function () {

                const err = new Error('an error')

                const fn = promback(function (cb) {
                    cb(err)
                })

                await assertRejects(function () {
                    return fn()
                }, function (e) {
                    return err === e
                })
            })

            it('resolves when passed function returns not undefined value',
                async function () {

                const fn = promback(function (arg1, arg2) {
                    return [ arg1, arg2 ]
                })

                const result = await fn('a', 10)

                assert.deepStrictEqual(result, [ 'a', 10 ])
            })

            it('resolves when passed function resolves', async function () {

                const fn = promback(function (arg1, arg2) {
                    return Promise.resolve([ arg1, arg2 ])
                })

                const result = await fn('a', 10)

                assert.deepStrictEqual(result, [ 'a', 10 ])
            })

            it('resolves when passed function calls callback with some value',
                async function () {

                const fn = promback(function (arg1, arg2, cb) {
                    return cb(null, [ arg1, arg2 ])
                })

                const result = await fn('a', 10)

                assert.deepStrictEqual(result, [ 'a', 10 ])
            })

            it('awaits cb if it is specified', async function () {

                const fn = promback(function (v, cb) {
                    setTimeout(function () { cb(null, v) }, 10)
                    return Promise.resolve(v * 2)
                })

                const result = await fn(7)

                assert.deepStrictEqual(result, 7)
            })

            it('preserves `this` reference', async function () {

                const fn = promback(function () {
                    return this
                })

                const obj = {}

                const result = await fn.call(obj)

                assert.strictEqual(result, obj)
            })

            it('does not hang when cb not specified in function',
                async function () {

                const fn = promback(function () {

                })

                const result = await fn()

                assert.strictEqual(result, undefined)
            })

            it('passes cb as the last arg, when the function expects more args than passed',
                async function () {

                function testFn (a, b, c, cb) {
                    cb(null, [ a, b, c ])
                }

                const fn = promback(testFn)

                const result = await fn(1)

                assert.deepStrictEqual(result, [ 1, undefined, undefined ])
            })
        })
    })
}

async function assertRejects (rejecter, predicate) {

    if (assert.rejects) {
        return assert.rejects(rejecter, predicate)
    }

    try {
        await rejecter()
        throw new Error('Rejection expected.')
    } catch (err) {
        if (predicate(err)) { return }
        throw err
    }
}
