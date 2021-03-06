module.exports = using(Promise)

module.exports.using = using

function using (PromiseLib) {

    return function (fn) {

        if (typeof fn !== 'function') {
            throw new Error('A function is required to promback.')
        }

        return function (... args) {

            const that = this

            return new PromiseLib(function (resolve, reject) {

                const argsDiff = fn.length - args.length

                if (argsDiff <= 0) {
                    return resolve(fn.apply(that, args))
                }

                fn.call(
                    that,
                    ... args,
                    ... new Array(argsDiff - 1),
                    function (err, value) {
                        if (err) { return reject(err) }
                        resolve(value)
                    }
                )
            })
        }
    }
}
