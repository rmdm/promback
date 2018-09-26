[![Build Status](https://travis-ci.org/rmdm/promback.svg?branch=master)](https://travis-ci.org/rmdm/promback)
[![Coverage Status](https://coveralls.io/repos/github/rmdm/promback/badge.svg?branch=master)](https://coveralls.io/github/rmdm/promback?branch=master)

promback
========

Wraps a promise-returning/callback-calling function and returns another promise-returning one. Especially useful for library writers to both facilitate support and level landscape of different asynchronicity mechanisms. It is also tiny :)

Install
=======

```sh
npm i --save promback
```

Usage
=====

```javascript

const promback = require('promback')

const timeout = promback(function (ms, cb) {
    setTimeout(cb, ms)
})

const resolveFive = promback(function () {
    return Promise.resolve(5)
})

timeout(100)
.then(resolveFive)
.then(console.log) // logs 5
```

API
===

### `promback (Function fn) -> async Function`

Wraps passed function and returns prombacked one. The prombacked function passes its arguments to the wrapped one and returns a promise fulfilled on one of the following cases:

- wrapped function called callback added to the arguments,
- a promise returned by the wrapped function is fulfilled,
- wrapped function returned a value immediately,
- wrapped function thrown an error.

If the number of arguments of a prombacked function call does not match to the number of arguments expected by the wrapped function - 1, then callback is not passed to the wrapped function and its returned value resolved directly. This is done so to prevent passing an unexpected argument.

The passed callback signature is the normal node-style callback `(err, value)`.

Prombacked function's `this` reference left not bound to any particular object and is still dynamic.

### `promback.using (PromiseLib) -> promback`

By default, **promback** module uses the `Promise` defined globally. With `using` one able to create other instances of **promback** that will use specified `PromiseLib` to create the promise returned from prombacked function. Please note, that default **promback** will still use global `Promise`.

An example:
```javascript
const bluebird = require('bluebird')
const promback = require('promback').using(bluebird)

// timeout returns a bluebird promise now
const timeout = promback(function (ms, cb) {
    setTimeout(cb, ms)
})
```
