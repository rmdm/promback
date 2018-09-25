promback
========

Wraps promise-returning/callback-calling function and returns another one that returns promise fulfilled on corresponding event(wrapped promise fulfilled/callback called). Especially useful for library implementers to both facilitate support and level landscape of different asynchronicity mechanisms.

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

const resolveTen = promback(function () {
    return 10
})

timeout(100)
.then(resolveFive)
.then(console.log) // logs 5
.then(resolveTen)
.then(console.log) // logs 10
```

API
===

`promback (Function fn) -> async Function`
