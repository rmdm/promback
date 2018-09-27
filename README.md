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

How it is useful for library writers
====================================

Suppose that your library has a method that expects an async function from your users:

```javascript
const mylib = require('mylib')

mylib.passMeSomethingAsync(/* something async */)
```

It calls the async function with some library-specific arguments and expects some library-expected value to be returned. So, suppose for the purposes of the example that the arguments are `a` and `b` and the value is `x`. **promback** allows you to effortlessly provide your users with the support of any asynchronicity mechanisms to their liking and convenience, be it callbacks:

```javascript
mylib.passMeSomethingAsync(function (a, b, cb) {
    getXWithCallbackBecauseIAmAQualifiedUserAndCanDoIt(a, b, function (err, x) {
        cb(err, x)
    })
})
```

, promises:

```javascript
mylib.passMeSomethingAsync(function (a, b) {
    return getXWith___WellActuallyIHaveAPromiseForThat(a, b)
    .then(function (x) {
        return x
    })
})
```

or even async functions:

```javascript
mylib.passMeSomethingAsync(async function (a, b) {
    const x = await pfff___PromisesAreSoLastCentury(a, b)
    return x
})
```

_Note, that in the above examples the funky functions may be passed directly to the `passMeSomethingAsync`. It is shown in more details just for sake of illustration._

The only thing needed to be done in `passMeSomethingAsync` is wrapping the async function with **promback**:

```javascript
// deep inside mylib
mylib.passMeSomethingAsync = async function (getX) {
    getX = promback(getX)
    // get a and b from somewhere
    const x = await getX(a, b)
    // use x somehow
}
```

And now you don't have to think on how to handle all this stuff anymore!

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
